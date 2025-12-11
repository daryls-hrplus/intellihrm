import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function usePiiVisibility() {
  const { user, roles } = useAuth();
  const [canViewPii, setCanViewPii] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPiiAccess = async () => {
      if (!user || roles.length === 0) {
        setCanViewPii(false);
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
          setCanViewPii(false);
          setIsLoading(false);
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean);

        // Check if any of the user's roles have can_view_pii = true
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("can_view_pii")
          .in("id", roleIds)
          .eq("can_view_pii", true)
          .limit(1);

        if (roleError) throw roleError;

        setCanViewPii((roleData && roleData.length > 0) || false);
      } catch (error) {
        console.error("Error checking PII access:", error);
        setCanViewPii(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPiiAccess();
  }, [user, roles]);

  // Helper function to mask PII data
  const maskPii = (value: string | null | undefined, type: "email" | "phone" | "text" = "text"): string => {
    if (!value) return "—";
    if (canViewPii) return value;

    switch (type) {
      case "email": {
        const [local, domain] = value.split("@");
        if (!domain) return "***@***.***";
        return `${local.slice(0, 2)}***@${domain.slice(0, 2)}***.***`;
      }
      case "phone": {
        return value.replace(/\d(?=\d{4})/g, "*");
      }
      default: {
        if (value.length <= 3) return "***";
        return `${value.slice(0, 2)}${"*".repeat(Math.min(value.length - 2, 8))}`;
      }
    }
  };

  return {
    canViewPii,
    isLoading,
    maskPii,
  };
}
