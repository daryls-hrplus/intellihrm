import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useMenuPermissions() {
  const { user, roles } = useAuth();
  const [menuPermissions, setMenuPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track if we've already fetched permissions for this user
  const fetchedForUserRef = useRef<string | null>(null);
  const cachedPermissionsRef = useRef<string[]>([]);

  useEffect(() => {
    const fetchMenuPermissions = async () => {
      if (!user || roles.length === 0) {
        setMenuPermissions([]);
        setIsLoading(false);
        fetchedForUserRef.current = null;
        return;
      }

      // Skip re-fetch if we already have permissions for this user
      if (fetchedForUserRef.current === user.id && cachedPermissionsRef.current.length >= 0) {
        setMenuPermissions(cachedPermissionsRef.current);
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
          cachedPermissionsRef.current = [];
          fetchedForUserRef.current = user.id;
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

        const permissionsArray = Array.from(allPermissions);
        setMenuPermissions(permissionsArray);
        cachedPermissionsRef.current = permissionsArray;
        fetchedForUserRef.current = user.id;
      } catch (error) {
        console.error("Error fetching menu permissions:", error);
        setMenuPermissions([]);
        cachedPermissionsRef.current = [];
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuPermissions();
  }, [user?.id, roles.length]); // Only re-fetch when user ID or roles count changes

  const hasMenuAccess = useCallback((moduleCode: string): boolean => {
    // Help center and ESS are always accessible to all authenticated users
    if (moduleCode === "help" || moduleCode === "ess") return true;
    // If permissions are still loading, default to false for security
    if (isLoading) return false;
    // Admins always have access to all modules
    if (roles.includes("admin")) return true;
    // HR managers and admins have access to MSS
    if (moduleCode === "mss" && (roles.includes("hr_manager") || roles.includes("admin"))) return true;
    // If no specific permissions set, deny access (fail-safe)
    if (menuPermissions.length === 0) return false;
    return menuPermissions.includes(moduleCode);
  }, [isLoading, roles, menuPermissions]);

  return {
    menuPermissions,
    isLoading,
    hasMenuAccess,
  };
}
