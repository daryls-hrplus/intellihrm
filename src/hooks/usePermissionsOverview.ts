import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAccessibleCompanies, AccessibleCompany } from "@/hooks/useUserAccessibleCompanies";

export interface UserPermissionData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  companyId: string | null;
  companyCode: string | null;
  companyName: string | null;
  roles: RoleData[];
  effectiveModules: string[];
  piiLevel: "none" | "masked" | "limited" | "full";
  adminContainerCount: number;
  orgScopeType: "all" | "limited";
  isAdmin: boolean;
  riskLevel: "low" | "medium" | "high";
}

export interface RoleData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  role_type: string | null;
  is_seeded: boolean;
  menu_permissions: string[];
  can_view_pii: boolean;
  userCount: number;
  piiAccess: PiiAccessData | null;
  containerAccess: ContainerAccessData[];
}

export interface PiiAccessData {
  role_id: string;
  pii_level: string | null;
  access_personal_details: boolean | null;
  access_compensation: boolean | null;
  access_banking: boolean | null;
  access_medical: boolean | null;
  access_disciplinary: boolean | null;
  can_export: boolean | null;
  approval_required_for_full: boolean | null;
}

export interface ContainerAccessData {
  container_code: string;
  permission_level: "none" | "view" | "configure" | "approve";
}

export interface EssModuleData {
  module_code: string;
  module_name: string;
  ess_enabled: boolean;
  is_view_only: boolean;
  requires_approval: boolean;
}

export interface EssFieldData {
  id: string;
  field_name: string;
  module_code: string;
  can_view: boolean;
  can_edit: boolean;
  approval_mode: string;
}

export interface OrgScopeData {
  roleId: string;
  roleName: string;
  companyAccess: { companyId: string; companyName: string; hasAccess: boolean }[];
}

export interface PermissionsStats {
  totalUsers: number;
  adminUsers: number;
  fullPiiUsers: number;
  pendingRequests: number;
  highRiskUsers: number;
  essConfigurations: number;
}

export const MENU_MODULES = [
  { code: "dashboard", label: "Dashboard", short: "Dash" },
  { code: "workforce", label: "Workforce", short: "WF" },
  { code: "leave", label: "Leave", short: "Leave" },
  { code: "compensation", label: "Compensation", short: "Comp" },
  { code: "benefits", label: "Benefits", short: "Ben" },
  { code: "performance", label: "Performance", short: "Perf" },
  { code: "training", label: "Training", short: "Train" },
  { code: "succession", label: "Succession", short: "Succ" },
  { code: "recruitment", label: "Recruitment", short: "Recr" },
  { code: "hse", label: "Health & Safety", short: "HSE" },
  { code: "employee_relations", label: "Employee Relations", short: "ER" },
  { code: "property", label: "Property", short: "Prop" },
  { code: "admin", label: "Admin", short: "Admin" },
];

export const ADMIN_CONTAINERS = [
  { code: "org_structure", label: "Org Structure", short: "Org" },
  { code: "users_roles_access", label: "Users & Access", short: "Users" },
  { code: "security_governance", label: "Security", short: "Sec" },
  { code: "system_platform_config", label: "Platform", short: "Plat" },
  { code: "strategic_analytics", label: "Analytics", short: "Ana" },
  { code: "documentation_enablement", label: "Docs", short: "Docs" },
  { code: "billing_subscriptions", label: "Billing", short: "Bill" },
];

export const PII_DOMAINS = [
  { code: "personal_details", label: "Personal" },
  { code: "compensation", label: "Compensation" },
  { code: "banking", label: "Banking" },
  { code: "medical", label: "Medical" },
  { code: "disciplinary", label: "Disciplinary" },
];

function calculateRiskLevel(user: any, roles: RoleData[]): "low" | "medium" | "high" {
  let riskScore = 0;
  
  // Admin without specific role
  if (user.isAdmin) riskScore += 2;
  
  // Full PII access
  if (user.piiLevel === "full") riskScore += 2;
  
  // Multiple admin containers
  if (user.adminContainerCount >= 3) riskScore += 1;
  
  // Multiple high-privilege roles
  const highPrivRoles = roles.filter(r => 
    r.code === "admin" || r.code === "hr_admin" || r.can_view_pii
  );
  if (highPrivRoles.length > 1) riskScore += 1;
  
  if (riskScore >= 4) return "high";
  if (riskScore >= 2) return "medium";
  return "low";
}

function determinePiiLevel(piiAccess: PiiAccessData | null): "none" | "masked" | "limited" | "full" {
  if (!piiAccess) return "none";
  
  const level = piiAccess.pii_level?.toLowerCase() || "none";
  if (level === "full") return "full";
  if (level === "limited") return "limited";
  if (level === "masked") return "masked";
  
  // Check domain access
  const domains = [
    piiAccess.access_personal_details,
    piiAccess.access_compensation,
    piiAccess.access_banking,
    piiAccess.access_medical,
    piiAccess.access_disciplinary,
  ].filter(Boolean).length;
  
  if (domains >= 4) return "full";
  if (domains >= 2) return "limited";
  if (domains >= 1) return "masked";
  return "none";
}

export function usePermissionsOverview(selectedCompanyId?: string | null) {
  const { company } = useAuth();
  const { companies: accessibleCompanies, companyIds: accessibleCompanyIds, isLoading: companiesLoading } = useUserAccessibleCompanies();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserPermissionData[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [essModules, setEssModules] = useState<EssModuleData[]>([]);
  const [essFields, setEssFields] = useState<EssFieldData[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [companyMap, setCompanyMap] = useState<Map<string, { code: string; name: string }>>(new Map());

  // Determine which companies to filter by
  const filterCompanyIds = useMemo(() => {
    if (selectedCompanyId && selectedCompanyId !== "all") {
      return [selectedCompanyId];
    }
    // If "all" selected or no selection, use all accessible companies
    return accessibleCompanyIds.length > 0 ? accessibleCompanyIds : (company?.id ? [company.id] : []);
  }, [selectedCompanyId, accessibleCompanyIds, company?.id]);

  // Build company map for lookup
  useEffect(() => {
    const map = new Map<string, { code: string; name: string }>();
    accessibleCompanies.forEach(c => {
      map.set(c.id, { code: c.code, name: c.name });
    });
    setCompanyMap(map);
  }, [accessibleCompanies]);

  useEffect(() => {
    if (filterCompanyIds.length > 0 && !companiesLoading) {
      fetchAllData();
    }
  }, [filterCompanyIds, companiesLoading]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUsersAndRoles(),
        fetchEssData(),
        fetchPendingRequests(),
      ]);
    } catch (error) {
      console.error("Error fetching permissions data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersAndRoles = async () => {
    // Fetch roles
    const { data: rolesData } = await supabase
      .from("roles")
      .select("*")
      .eq("is_active", true)
      .order("name");

    // Fetch PII access for all roles
    const { data: piiData } = await supabase
      .from("role_pii_access")
      .select("*");

    // Fetch container access for all roles
    const { data: containerData } = await supabase
      .from("role_container_access")
      .select("*");

    // Fetch user_roles with counts
    const { data: userRolesData } = await supabase
      .from("user_roles")
      .select("user_id, role_id, role");

    // Build role map with PII and container access
    const piiMap = new Map(piiData?.map(p => [p.role_id, p as unknown as PiiAccessData]) || []);
    const containerMap = new Map<string, ContainerAccessData[]>();
    containerData?.forEach(c => {
      if (!containerMap.has(c.role_id)) {
        containerMap.set(c.role_id, []);
      }
      containerMap.get(c.role_id)!.push({
        container_code: c.container_code,
        permission_level: c.permission_level as ContainerAccessData["permission_level"],
      });
    });

    // Count users per role
    const roleUserCounts = new Map<string, number>();
    userRolesData?.forEach(ur => {
      if (ur.role_id) {
        roleUserCounts.set(ur.role_id, (roleUserCounts.get(ur.role_id) || 0) + 1);
      }
    });

    const mappedRoles: RoleData[] = (rolesData || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description,
      role_type: r.role_type,
      is_seeded: r.is_seeded || false,
      menu_permissions: Array.isArray(r.menu_permissions) ? r.menu_permissions : [],
      can_view_pii: r.can_view_pii || false,
      userCount: roleUserCounts.get(r.id) || 0,
      piiAccess: piiMap.get(r.id) as PiiAccessData || null,
      containerAccess: containerMap.get(r.id) || [],
    }));

    setRoles(mappedRoles);

    // Fetch profiles filtered by company
    let profilesQuery = supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, company_id")
      .order("full_name");

    // Filter by accessible companies
    if (filterCompanyIds.length > 0) {
      profilesQuery = profilesQuery.in("company_id", filterCompanyIds);
    }

    const { data: profilesData } = await profilesQuery;

    // Map users to permissions
    const roleMap = new Map(mappedRoles.map(r => [r.id, r]));
    const userPermissions: UserPermissionData[] = (profilesData || []).map((profile: any) => {
      const userRoleEntries = (userRolesData || []).filter(
        (ur: any) => ur.user_id === profile.id
      );

      const userRoles = userRoleEntries
        .map((ur: any) => roleMap.get(ur.role_id))
        .filter(Boolean) as RoleData[];

      const isAdmin = userRoleEntries.some((ur: any) => ur.role === "admin") ||
        userRoles.some((r) => r.code === "admin");

      // Combine permissions
      const effectiveModules = new Set<string>();
      let highestPiiLevel: "none" | "masked" | "limited" | "full" = "none";
      let adminContainerCount = 0;

      userRoles.forEach((role) => {
        role.menu_permissions.forEach((p) => effectiveModules.add(p));
        
        const rolePiiLevel = determinePiiLevel(role.piiAccess);
        const piiLevelOrder = { none: 0, masked: 1, limited: 2, full: 3 };
        if (piiLevelOrder[rolePiiLevel] > piiLevelOrder[highestPiiLevel]) {
          highestPiiLevel = rolePiiLevel;
        }
        
        const configureContainers = role.containerAccess.filter(
          c => c.permission_level === "configure" || c.permission_level === "approve"
        );
        adminContainerCount = Math.max(adminContainerCount, configureContainers.length);
      });

      if (isAdmin) {
        MENU_MODULES.forEach((m) => effectiveModules.add(m.code));
        highestPiiLevel = "full";
        adminContainerCount = ADMIN_CONTAINERS.length;
      }

      // Get company info from map
      const companyInfo = companyMap.get(profile.company_id);

      const userData: UserPermissionData = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        companyId: profile.company_id,
        companyCode: companyInfo?.code || null,
        companyName: companyInfo?.name || null,
        roles: userRoles,
        effectiveModules: Array.from(effectiveModules),
        piiLevel: highestPiiLevel,
        adminContainerCount,
        orgScopeType: "all", // TODO: Implement org scope check
        isAdmin,
        riskLevel: "low",
      };

      userData.riskLevel = calculateRiskLevel(userData, userRoles);
      return userData;
    });

    setUsers(userPermissions);
  };

  const fetchEssData = async () => {
    if (!company?.id) return;

    // Fetch ESS module config
    const { data: essConfigData } = await supabase
      .from("ess_module_config")
      .select("*")
      .eq("company_id", company.id);

    const modules: EssModuleData[] = (essConfigData || []).map((c: any) => ({
      module_code: c.module_code,
      module_name: c.module_code.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      ess_enabled: c.ess_enabled || false,
      is_view_only: c.is_view_only || false,
      requires_approval: c.requires_approval || false,
    }));

    setEssModules(modules);

    // Fetch ESS field permissions
    const { data: fieldData } = await supabase
      .from("ess_field_permissions")
      .select("*")
      .eq("company_id", company.id);

    const fields: EssFieldData[] = (fieldData || []).map((f: any) => ({
      id: f.id,
      field_name: f.field_name,
      module_code: f.module_code,
      can_view: f.can_view || false,
      can_edit: f.can_edit || false,
      approval_mode: f.approval_mode || "none",
    }));

    setEssFields(fields);
  };

  const fetchPendingRequests = async () => {
    const { count } = await supabase
      .from("access_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setPendingRequestsCount(count || 0);
  };

  const stats: PermissionsStats = useMemo(() => ({
    totalUsers: users.length,
    adminUsers: users.filter(u => u.isAdmin).length,
    fullPiiUsers: users.filter(u => u.piiLevel === "full").length,
    pendingRequests: pendingRequestsCount,
    highRiskUsers: users.filter(u => u.riskLevel === "high").length,
    essConfigurations: essModules.filter(m => m.ess_enabled).length,
  }), [users, pendingRequestsCount, essModules]);

  return {
    isLoading: isLoading || companiesLoading,
    users,
    roles,
    essModules,
    essFields,
    stats,
    accessibleCompanies,
    refetch: fetchAllData,
  };
}
