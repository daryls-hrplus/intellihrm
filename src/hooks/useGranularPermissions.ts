import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ModulePermission {
  id: string;
  module_code: string;
  module_name: string;
  tab_code: string | null;
  tab_name: string | null;
  parent_tab_code: string | null;
}

interface RolePermission {
  module_permission_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface PermissionMap {
  [key: string]: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}

type PermissionAction = "view" | "create" | "edit" | "delete";

export function useGranularPermissions() {
  const { user, roles } = useAuth();
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchedForUserRef = useRef<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions({});
        setModulePermissions([]);
        setIsLoading(false);
        fetchedForUserRef.current = null;
        hasFetchedRef.current = false;
        return;
      }

      // Skip re-fetch if we already have permissions for this user
      if (fetchedForUserRef.current === user.id && hasFetchedRef.current) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Get user's role IDs
        const { data: userRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("role_id")
          .eq("user_id", user.id);

        if (rolesError) throw rolesError;

        if (!userRoles || userRoles.length === 0) {
          setPermissions({});
          setModulePermissions([]);
          fetchedForUserRef.current = user.id;
          hasFetchedRef.current = true;
          setIsLoading(false);
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean);

        // Fetch module_permissions and role_permissions in parallel
        const [modulePermsRes, rolePermsRes] = await Promise.all([
          supabase
            .from("module_permissions")
            .select("id, module_code, module_name, tab_code, tab_name, parent_tab_code")
            .eq("is_active", true),
          supabase
            .from("role_permissions")
            .select("module_permission_id, can_view, can_create, can_edit, can_delete")
            .in("role_id", roleIds),
        ]);

        if (modulePermsRes.error) throw modulePermsRes.error;
        if (rolePermsRes.error) throw rolePermsRes.error;

        const modulePerms = modulePermsRes.data || [];
        const rolePerms = rolePermsRes.data || [];

        setModulePermissions(modulePerms);

        // Build permission map - combine permissions from all user roles (OR logic)
        const permMap: PermissionMap = {};
        
        modulePerms.forEach((mp) => {
          // Create key as "module_code" or "module_code:tab_code"
          const key = mp.tab_code ? `${mp.module_code}:${mp.tab_code}` : mp.module_code;
          
          // Find all role permissions for this module_permission
          const matchingPerms = rolePerms.filter((rp) => rp.module_permission_id === mp.id);
          
          // Combine with OR logic (if any role grants permission, user has it)
          permMap[key] = {
            can_view: matchingPerms.some((p) => p.can_view === true),
            can_create: matchingPerms.some((p) => p.can_create === true),
            can_edit: matchingPerms.some((p) => p.can_edit === true),
            can_delete: matchingPerms.some((p) => p.can_delete === true),
          };
        });

        setPermissions(permMap);
        fetchedForUserRef.current = user.id;
        hasFetchedRef.current = true;
      } catch (error) {
        console.error("Error fetching granular permissions:", error);
        setPermissions({});
        setModulePermissions([]);
        hasFetchedRef.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user?.id, roles.length]);

  /**
   * Check if user has access to a specific tab within a module
   * @param moduleCode - The module code (e.g., "workforce", "leave")
   * @param tabCode - The tab code within the module (e.g., "employees", "onboarding")
   * @param action - The action to check (default: "view")
   */
  const hasTabAccess = useCallback(
    (moduleCode: string, tabCode: string, action: PermissionAction = "view"): boolean => {
      // Admins always have full access
      if (roles.includes("admin")) return true;
      
      // If still loading, deny access for security
      if (isLoading) return false;

      const key = `${moduleCode}:${tabCode}`;
      const perm = permissions[key];
      
      if (!perm) {
        // If no explicit permission set, check module-level permission
        const modulePerm = permissions[moduleCode];
        if (!modulePerm) return false;
        return modulePerm[`can_${action}`] ?? false;
      }

      return perm[`can_${action}`] ?? false;
    },
    [roles, isLoading, permissions]
  );

  /**
   * Check if user has a specific action permission for a module or tab
   * @param moduleCode - The module code
   * @param action - The action to check ("view", "create", "edit", "delete")
   * @param tabCode - Optional tab code for tab-level check
   */
  const hasActionAccess = useCallback(
    (moduleCode: string, action: PermissionAction, tabCode?: string): boolean => {
      // Admins always have full access
      if (roles.includes("admin")) return true;
      
      // If still loading, deny access for security
      if (isLoading) return false;

      const key = tabCode ? `${moduleCode}:${tabCode}` : moduleCode;
      const perm = permissions[key];
      
      if (!perm) return false;

      return perm[`can_${action}`] ?? false;
    },
    [roles, isLoading, permissions]
  );

  /**
   * Get all tabs the user has view access to for a given module
   * @param moduleCode - The module code
   */
  const getAccessibleTabs = useCallback(
    (moduleCode: string): string[] => {
      // Admins have access to all tabs
      if (roles.includes("admin")) {
        return modulePermissions
          .filter((mp) => mp.module_code === moduleCode && mp.tab_code)
          .map((mp) => mp.tab_code as string);
      }

      if (isLoading) return [];

      return modulePermissions
        .filter((mp) => {
          if (mp.module_code !== moduleCode || !mp.tab_code) return false;
          const key = `${moduleCode}:${mp.tab_code}`;
          return permissions[key]?.can_view === true;
        })
        .map((mp) => mp.tab_code as string);
    },
    [roles, isLoading, permissions, modulePermissions]
  );

  /**
   * Check if user can perform any action on a module/tab
   * Useful for determining if a feature card should be shown
   */
  const hasAnyAccess = useCallback(
    (moduleCode: string, tabCode?: string): boolean => {
      if (roles.includes("admin")) return true;
      if (isLoading) return false;

      const key = tabCode ? `${moduleCode}:${tabCode}` : moduleCode;
      const perm = permissions[key];
      
      if (!perm) return false;

      return perm.can_view || perm.can_create || perm.can_edit || perm.can_delete;
    },
    [roles, isLoading, permissions]
  );

  return {
    permissions,
    modulePermissions,
    isLoading,
    hasTabAccess,
    hasActionAccess,
    getAccessibleTabs,
    hasAnyAccess,
  };
}
