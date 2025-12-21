import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type PiiLevel = "none" | "limited" | "full";
export type PiiDomain = "personal_details" | "compensation" | "banking" | "medical" | "disciplinary";
export type ExportPermission = "none" | "allowed" | "approval_required";

export interface PiiAccessProfile {
  pii_level: PiiLevel;
  access_personal_details: boolean;
  access_compensation: boolean;
  access_banking: boolean;
  access_medical: boolean;
  access_disciplinary: boolean;
  masking_enabled: boolean;
  export_permission: ExportPermission;
  jit_access_required: boolean;
  approval_required_for_full: boolean;
}

const DEFAULT_PII_PROFILE: PiiAccessProfile = {
  pii_level: "none",
  access_personal_details: false,
  access_compensation: false,
  access_banking: false,
  access_medical: false,
  access_disciplinary: false,
  masking_enabled: true,
  export_permission: "none",
  jit_access_required: false,
  approval_required_for_full: false,
};

export function useEnhancedPiiVisibility() {
  const { user, roles } = useAuth();
  const [piiProfile, setPiiProfile] = useState<PiiAccessProfile>(DEFAULT_PII_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const loggedAccessRef = useRef(new Set<string>());

  useEffect(() => {
    const fetchPiiProfile = async () => {
      if (!user || roles.length === 0) {
        setPiiProfile(DEFAULT_PII_PROFILE);
        setIsLoading(false);
        return;
      }

      try {
        // Get the user's role_ids from user_roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        if (!userRoles || userRoles.length === 0) {
          setPiiProfile(DEFAULT_PII_PROFILE);
          setIsLoading(false);
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean) as string[];

        // Fetch PII access profiles for all user roles
        const { data: piiAccess, error: accessError } = await supabase
          .from("role_pii_access")
          .select("*")
          .in("role_id", roleIds);

        if (accessError) throw accessError;

        if (!piiAccess || piiAccess.length === 0) {
          // Fallback to legacy can_view_pii check
          const { data: roleData } = await supabase
            .from("roles")
            .select("can_view_pii")
            .in("id", roleIds)
            .eq("can_view_pii", true)
            .limit(1);

          if (roleData && roleData.length > 0) {
            setPiiProfile({
              ...DEFAULT_PII_PROFILE,
              pii_level: "full",
              access_personal_details: true,
              access_compensation: true,
              access_banking: true,
              access_medical: true,
              access_disciplinary: true,
              masking_enabled: false,
              export_permission: "allowed",
            });
          } else {
            setPiiProfile(DEFAULT_PII_PROFILE);
          }
          setIsLoading(false);
          return;
        }

        // Combine PII profiles using OR logic (most permissive wins)
        const combinedProfile: PiiAccessProfile = { ...DEFAULT_PII_PROFILE };
        const levelPriority: Record<PiiLevel, number> = { none: 0, limited: 1, full: 2 };
        const exportPriority: Record<ExportPermission, number> = { none: 0, approval_required: 1, allowed: 2 };

        piiAccess.forEach((access) => {
          // PII level - highest wins
          const currentLevel = combinedProfile.pii_level;
          const incomingLevel = (access.pii_level as PiiLevel) || "none";
          if (levelPriority[incomingLevel] > levelPriority[currentLevel]) {
            combinedProfile.pii_level = incomingLevel;
          }

          // Domain access - OR logic
          combinedProfile.access_personal_details = combinedProfile.access_personal_details || access.access_personal_details;
          combinedProfile.access_compensation = combinedProfile.access_compensation || access.access_compensation;
          combinedProfile.access_banking = combinedProfile.access_banking || access.access_banking;
          combinedProfile.access_medical = combinedProfile.access_medical || access.access_medical;
          combinedProfile.access_disciplinary = combinedProfile.access_disciplinary || access.access_disciplinary;

          // Masking - if any role has masking disabled, disable it
          combinedProfile.masking_enabled = combinedProfile.masking_enabled && access.masking_enabled;

          // Export permission - highest wins
          const currentExport = combinedProfile.export_permission;
          const incomingExport = (access.export_permission as ExportPermission) || "none";
          if (exportPriority[incomingExport] > exportPriority[currentExport]) {
            combinedProfile.export_permission = incomingExport;
          }

          // JIT and approval - AND logic (only if all require it)
          combinedProfile.jit_access_required = combinedProfile.jit_access_required && access.jit_access_required;
          combinedProfile.approval_required_for_full = combinedProfile.approval_required_for_full && access.approval_required_for_full;
        });

        setPiiProfile(combinedProfile);
      } catch (error) {
        console.error("Error fetching PII profile:", error);
        setPiiProfile(DEFAULT_PII_PROFILE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPiiProfile();
  }, [user, roles]);

  // Check if user can view a specific PII domain
  const canViewDomain = useCallback(
    (domain: PiiDomain): boolean => {
      if (piiProfile.pii_level === "none") return false;
      
      switch (domain) {
        case "personal_details":
          return piiProfile.access_personal_details;
        case "compensation":
          return piiProfile.access_compensation;
        case "banking":
          return piiProfile.access_banking;
        case "medical":
          return piiProfile.access_medical;
        case "disciplinary":
          return piiProfile.access_disciplinary;
        default:
          return false;
      }
    },
    [piiProfile]
  );

  // Check if user can export PII data
  const canExportPii = useCallback((): boolean => {
    return piiProfile.export_permission !== "none";
  }, [piiProfile]);

  // Check if export requires approval
  const requiresExportApproval = useCallback((): boolean => {
    return piiProfile.export_permission === "approval_required";
  }, [piiProfile]);

  // Log PII access attempt
  const logPiiAccess = useCallback(
    async (params: {
      domain: PiiDomain;
      fieldName?: string;
      entityType: string;
      entityId?: string;
      accessResult: "granted" | "denied" | "masked";
    }) => {
      if (!user) return;

      const logKey = `${params.domain}-${params.fieldName || ""}-${params.entityId || ""}-${params.accessResult}`;
      
      // Avoid duplicate logs for the same access in a session
      if (loggedAccessRef.current.has(logKey)) return;
      loggedAccessRef.current.add(logKey);

      try {
        // Get the user's primary role_id
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id)
          .limit(1);

        await supabase.from("pii_access_logs").insert({
          user_id: user.id,
          role_id: userRoles?.[0]?.role_id || null,
          pii_domain: params.domain,
          field_name: params.fieldName,
          entity_type: params.entityType,
          entity_id: params.entityId,
          access_result: params.accessResult,
          user_agent: navigator.userAgent,
        });
      } catch (error) {
        console.error("Failed to log PII access:", error);
      }
    },
    [user]
  );

  // Mask PII data based on domain access
  const maskPiiValue = useCallback(
    (
      value: string | null | undefined,
      domain: PiiDomain,
      options?: {
        type?: "email" | "phone" | "ssn" | "account" | "text";
        entityType?: string;
        entityId?: string;
        fieldName?: string;
      }
    ): string => {
      if (!value) return "—";

      const hasAccess = canViewDomain(domain);
      const shouldMask = !hasAccess || (hasAccess && piiProfile.masking_enabled && piiProfile.pii_level === "limited");

      if (!shouldMask) {
        // Log successful access
        if (options?.entityType) {
          logPiiAccess({
            domain,
            fieldName: options.fieldName,
            entityType: options.entityType,
            entityId: options.entityId,
            accessResult: "granted",
          });
        }
        return value;
      }

      // Log masked or denied access
      if (options?.entityType) {
        logPiiAccess({
          domain,
          fieldName: options.fieldName,
          entityType: options.entityType,
          entityId: options.entityId,
          accessResult: hasAccess ? "masked" : "denied",
        });
      }

      const type = options?.type || "text";

      switch (type) {
        case "email": {
          const [local, domainPart] = value.split("@");
          if (!domainPart) return "***@***.***";
          return `${local.slice(0, 2)}***@${domainPart.slice(0, 2)}***.***`;
        }
        case "phone": {
          return value.replace(/\d(?=\d{4})/g, "*");
        }
        case "ssn": {
          return "***-**-" + value.slice(-4);
        }
        case "account": {
          return "****" + value.slice(-4);
        }
        default: {
          if (value.length <= 3) return "***";
          return `${value.slice(0, 2)}${"*".repeat(Math.min(value.length - 2, 8))}`;
        }
      }
    },
    [canViewDomain, piiProfile.masking_enabled, piiProfile.pii_level, logPiiAccess]
  );

  // Legacy compatibility - check if user can view any PII
  const canViewPii = piiProfile.pii_level !== "none";

  return {
    piiProfile,
    isLoading,
    canViewPii,
    canViewDomain,
    canExportPii,
    requiresExportApproval,
    maskPiiValue,
    logPiiAccess,
  };
}
