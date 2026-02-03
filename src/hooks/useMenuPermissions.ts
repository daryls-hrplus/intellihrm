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
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchMenuPermissions = async () => {
      // Safety timeout: never allow the UI to hang indefinitely waiting for permissions.
      // If this triggers, we fail-safe to "no access" (except whitelisted modules in hasMenuAccess).
      const timeoutId = window.setTimeout(() => {
        if (!isMounted) return;
        console.error("Menu permissions fetch timed out; failing safe to no permissions.");
        setMenuPermissions([]);
        cachedPermissionsRef.current = [];
        hasFetchedRef.current = true;
        setIsLoading(false);
      }, 8000);

      if (!user || roles.length === 0) {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setMenuPermissions([]);
          setIsLoading(false);
          fetchedForUserRef.current = null;
          hasFetchedRef.current = false;
        }
        return;
      }

      // Skip re-fetch if we already have permissions for this exact user
      if (fetchedForUserRef.current === user.id && hasFetchedRef.current) {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setMenuPermissions(cachedPermissionsRef.current);
          setIsLoading(false);
        }
        return;
      }

      // Set loading true while fetching
      if (isMounted) setIsLoading(true);

      try {
        // Get the user's role_ids from user_roles
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        if (!userRoles || userRoles.length === 0) {
          window.clearTimeout(timeoutId);
          if (isMounted) {
            setMenuPermissions([]);
            cachedPermissionsRef.current = [];
            fetchedForUserRef.current = user.id;
            hasFetchedRef.current = true;
            setIsLoading(false);
          }
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean);

        // Fetch permissions from role_permissions table (new system)
        const { data: rolePermissions, error: permError } = await supabase
          .from("role_permissions")
          .select(`
            can_view,
            module_permissions!inner(module_code)
          `)
          .in("role_id", roleIds)
          .eq("can_view", true);

        if (permError) {
          console.warn("Error fetching from role_permissions, falling back to menu_permissions:", permError);
          // Fallback to legacy menu_permissions column
          const { data: roleData, error: roleError } = await supabase
            .from("roles")
            .select("menu_permissions")
            .in("id", roleIds);

          if (roleError) throw roleError;

          const allPermissions = new Set<string>();
          (roleData || []).forEach((role) => {
            const permissions = Array.isArray(role.menu_permissions)
              ? (role.menu_permissions as string[])
              : [];
            permissions.forEach((p) => allPermissions.add(p));
          });

          const permissionsArray = Array.from(allPermissions);
          window.clearTimeout(timeoutId);
          if (isMounted) {
            setMenuPermissions(permissionsArray);
            cachedPermissionsRef.current = permissionsArray;
            fetchedForUserRef.current = user.id;
            hasFetchedRef.current = true;
            setIsLoading(false);
          }
          return;
        }

        // Extract unique module codes from role_permissions
        const allPermissions = new Set<string>();
        (rolePermissions || []).forEach((rp: any) => {
          if (rp.module_permissions?.module_code && rp.module_permissions.module_code !== "enablement") {
            allPermissions.add(rp.module_permissions.module_code);
          }
        });

        const permissionsArray = Array.from(allPermissions);
        if (isMounted) {
          setMenuPermissions(permissionsArray);
          cachedPermissionsRef.current = permissionsArray;
          fetchedForUserRef.current = user.id;
          hasFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching menu permissions:", error);
        if (isMounted) {
          setMenuPermissions([]);
          cachedPermissionsRef.current = [];
          hasFetchedRef.current = true;
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchMenuPermissions();

    return () => {
      isMounted = false;
    };
  }, [user?.id, roles.length]); // Only re-fetch when user ID or roles count changes

  const hasMenuAccess = useCallback((moduleCode: string): boolean => {
    // Help center and ESS are always accessible to all authenticated users
    if (moduleCode === "help" || moduleCode === "ess") return true;
    // Dashboard is always accessible to authenticated users
    if (moduleCode === "dashboard") return true;
    // Profile is always accessible to authenticated users
    if (moduleCode === "profile") return true;
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
