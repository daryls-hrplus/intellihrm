import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RolePermissionStats {
  totalModules: number;
  accessibleModules: number;
  totalTabs: number;
  accessibleTabs: number;
  modulesList: string[];
}

interface ModulePermissionRow {
  id: string;
  module_code: string;
  tab_code: string | null;
}

interface RolePermissionRow {
  role_id: string;
  module_permission_id: string;
  can_view: boolean;
}

/**
 * Hook to calculate permission stats for a single role from role_permissions table
 */
export function useRolePermissionStats(roleId: string | null): RolePermissionStats & { isLoading: boolean } {
  const [modulePermissions, setModulePermissions] = useState<ModulePermissionRow[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!roleId) {
        setIsLoading(false);
        return;
      }

      try {
        const [mpResult, rpResult] = await Promise.all([
          supabase
            .from("module_permissions")
            .select("id, module_code, tab_code")
            .neq("module_code", "enablement"),
          supabase
            .from("role_permissions")
            .select("role_id, module_permission_id, can_view")
            .eq("role_id", roleId),
        ]);

        if (mpResult.error) throw mpResult.error;
        if (rpResult.error) throw rpResult.error;

        setModulePermissions(mpResult.data || []);
        setRolePermissions(rpResult.data || []);
      } catch (error) {
        console.error("Error fetching permission stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  const stats = useMemo(() => {
    // Get unique modules from all module_permissions
    const allModules = new Set(modulePermissions.map((mp) => mp.module_code));
    const totalModules = allModules.size;

    // Get all tabs (entries with tab_code)
    const allTabs = modulePermissions.filter((mp) => mp.tab_code);
    const totalTabs = allTabs.length;

    // Create a map from permission ID to role permission record
    const rolePermissionsMap = new Map(
      rolePermissions.map((rp) => [rp.module_permission_id, rp])
    );

    // Helper function matching GranularPermissionsPage logic
    // If no explicit record exists, default to TRUE (matches page behavior)
    const getEffectiveCanView = (modulePermissionId: string): boolean => {
      const rolePermission = rolePermissionsMap.get(modulePermissionId);
      if (!rolePermission) return true; // Default to ON when missing
      return rolePermission.can_view;
    };

    // Calculate accessible modules (modules where at least one permission is viewable)
    const accessibleModulesSet = new Set<string>();
    const modulesList: string[] = [];

    modulePermissions.forEach((mp) => {
      if (getEffectiveCanView(mp.id)) {
        accessibleModulesSet.add(mp.module_code);
      }
    });

    modulesList.push(...Array.from(accessibleModulesSet));

    // Calculate accessible tabs using effective can_view
    const accessibleTabs = allTabs.filter((mp) => getEffectiveCanView(mp.id)).length;

    return {
      totalModules,
      accessibleModules: accessibleModulesSet.size,
      totalTabs,
      accessibleTabs,
      modulesList,
    };
  }, [modulePermissions, rolePermissions]);

  return { ...stats, isLoading };
}

/**
 * Hook to get permission stats for multiple roles at once (batch query)
 */
export function useMultipleRolePermissionStats(roleIds: string[]) {
  const [stats, setStats] = useState<Map<string, { accessibleModules: number; modulesList: string[] }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [totalModules, setTotalModules] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (roleIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const [mpResult, rpResult] = await Promise.all([
          supabase
            .from("module_permissions")
            .select("id, module_code")
            .neq("module_code", "enablement"),
          supabase
            .from("role_permissions")
            .select("role_id, module_permission_id, can_view")
            .in("role_id", roleIds),
        ]);

        if (mpResult.error) throw mpResult.error;
        if (rpResult.error) throw rpResult.error;

        const modulePermissions = mpResult.data || [];
        const rolePermissions = rpResult.data || [];

        // Calculate total unique modules
        const allModules = new Set(modulePermissions.map((mp) => mp.module_code));
        setTotalModules(allModules.size);

        // Create a map from permission ID to module code
        const permIdToModule = new Map<string, string>();
        modulePermissions.forEach((mp) => {
          permIdToModule.set(mp.id, mp.module_code);
        });

        // Calculate stats for each role using "default to true" logic for missing permissions
        const roleStats = new Map<string, { accessibleModules: number; modulesList: string[] }>();

        roleIds.forEach((roleId) => {
          const rolePermsForThisRole = rolePermissions.filter((rp) => rp.role_id === roleId);
          const permIdToRolePerm = new Map(
            rolePermsForThisRole.map((rp) => [rp.module_permission_id, rp])
          );

          const accessibleModulesSet = new Set<string>();

          modulePermissions.forEach((mp) => {
            const rolePerm = permIdToRolePerm.get(mp.id);
            // If no explicit record exists, default to TRUE (matches page behavior)
            const effectiveCanView = rolePerm ? rolePerm.can_view : true;

            if (effectiveCanView) {
              accessibleModulesSet.add(mp.module_code);
            }
          });

          roleStats.set(roleId, {
            accessibleModules: accessibleModulesSet.size,
            modulesList: Array.from(accessibleModulesSet),
          });
        });

        setStats(roleStats);
      } catch (error) {
        console.error("Error fetching multiple role permission stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roleIds.join(",")]); // Re-fetch when role IDs change

  return { stats, totalModules, isLoading };
}

/**
 * Get module count for user's roles from role_permissions table
 */
export async function fetchUserModuleAccess(roleIds: string[]): Promise<string[]> {
  if (roleIds.length === 0) return [];

  try {
    // Fetch all module permissions (except enablement)
    const { data: allModulePermissions, error: mpError } = await supabase
      .from("module_permissions")
      .select("id, module_code")
      .neq("module_code", "enablement");

    if (mpError) throw mpError;

    // Fetch role permissions for these roles
    const { data: rolePermissions, error: rpError } = await supabase
      .from("role_permissions")
      .select("module_permission_id, can_view")
      .in("role_id", roleIds);

    if (rpError) throw rpError;

    // Create a map of permission ID to can_view status
    // If any role grants access, mark as true
    const explicitPerms = new Map<string, boolean>();
    (rolePermissions || []).forEach((rp) => {
      if (rp.can_view) {
        explicitPerms.set(rp.module_permission_id, true);
      } else if (!explicitPerms.has(rp.module_permission_id)) {
        explicitPerms.set(rp.module_permission_id, false);
      }
    });

    // Calculate accessible modules (missing = granted by default)
    const modules = new Set<string>();
    (allModulePermissions || []).forEach((mp) => {
      const effectiveCanView = explicitPerms.has(mp.id) ? explicitPerms.get(mp.id) : true;
      if (effectiveCanView) {
        modules.add(mp.module_code);
      }
    });

    return Array.from(modules);
  } catch (error) {
    console.error("Error fetching user module access:", error);
    return [];
  }
}
