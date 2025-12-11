import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useMenuPermissions() {
  const { user, roles } = useAuth();
  const [menuPermissions, setMenuPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMenuPermissions = async () => {
      if (!user || roles.length === 0) {
        setMenuPermissions([]);
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
          setMenuPermissions([]);
          setIsLoading(false);
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean);

        // Fetch all roles' menu_permissions
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("menu_permissions")
          .in("id", roleIds);

        if (roleError) throw roleError;

        // Combine all permissions from all roles
        const allPermissions = new Set<string>();
        (roleData || []).forEach((role) => {
          const permissions = Array.isArray(role.menu_permissions)
            ? (role.menu_permissions as string[])
            : [];
          permissions.forEach((p) => allPermissions.add(p));
        });

        setMenuPermissions(Array.from(allPermissions));
      } catch (error) {
        console.error("Error fetching menu permissions:", error);
        setMenuPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuPermissions();
  }, [user, roles]);

  const hasMenuAccess = (moduleCode: string): boolean => {
    // If permissions are still loading, default to false for security
    if (isLoading) return false;
    // Admins always have access to all modules
    if (roles.includes("admin")) return true;
    // If no specific permissions set, deny access (fail-safe)
    if (menuPermissions.length === 0) return false;
    return menuPermissions.includes(moduleCode);
  };

  return {
    menuPermissions,
    isLoading,
    hasMenuAccess,
  };
}
