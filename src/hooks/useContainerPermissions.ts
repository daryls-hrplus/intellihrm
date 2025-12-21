import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ContainerPermissionLevel = "none" | "view" | "configure" | "approve";

export interface ContainerAccess {
  container_code: string;
  permission_level: ContainerPermissionLevel;
}

export interface ContainerPermissionsMap {
  [containerCode: string]: ContainerPermissionLevel;
}

// Admin container definitions
export const ADMIN_CONTAINERS = [
  { code: "org_structure", label: "Organization & Structure", description: "Departments, divisions, positions, and org chart management" },
  { code: "users_roles_access", label: "Users, Roles & Access", description: "User accounts, role assignments, and access controls" },
  { code: "security_governance", label: "Security & Governance", description: "Security policies, audit logs, and governance settings" },
  { code: "system_platform_config", label: "System & Platform Configuration", description: "System settings, integrations, and platform configuration" },
  { code: "strategic_analytics", label: "Strategic Planning & Analytics", description: "Workforce analytics, dashboards, and strategic insights" },
  
  { code: "documentation_enablement", label: "Documentation & Enablement", description: "Documentation, training materials, and enablement resources" },
  { code: "billing_subscriptions", label: "Billing & Subscriptions", description: "Billing, invoices, and subscription management" },
] as const;

export function useContainerPermissions() {
  const { user, roles } = useAuth();
  const [permissions, setPermissions] = useState<ContainerPermissionsMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContainerPermissions = async () => {
      if (!user || roles.length === 0) {
        setPermissions({});
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
          setPermissions({});
          setIsLoading(false);
          return;
        }

        const roleIds = userRoles.map((r) => r.role_id).filter(Boolean) as string[];

        // Fetch container permissions for all user roles
        const { data: containerAccess, error: accessError } = await supabase
          .from("role_container_access")
          .select("container_code, permission_level")
          .in("role_id", roleIds);

        if (accessError) throw accessError;

        // Combine permissions using highest level wins (OR logic)
        const permissionMap: ContainerPermissionsMap = {};
        const levelPriority: Record<ContainerPermissionLevel, number> = {
          none: 0,
          view: 1,
          configure: 2,
          approve: 3,
        };

        // Initialize all containers with 'none'
        ADMIN_CONTAINERS.forEach(container => {
          permissionMap[container.code] = "none";
        });

        // Apply permissions from roles (highest wins)
        (containerAccess || []).forEach((access) => {
          const current = permissionMap[access.container_code] || "none";
          const incoming = access.permission_level as ContainerPermissionLevel;
          
          if (levelPriority[incoming] > levelPriority[current]) {
            permissionMap[access.container_code] = incoming;
          }
        });

        setPermissions(permissionMap);
      } catch (error) {
        console.error("Error fetching container permissions:", error);
        setPermissions({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchContainerPermissions();
  }, [user, roles]);

  // Check if user has at least a specific permission level for a container
  const hasContainerAccess = useCallback(
    (containerCode: string, minLevel: ContainerPermissionLevel = "view"): boolean => {
      const currentLevel = permissions[containerCode] || "none";
      const levelPriority: Record<ContainerPermissionLevel, number> = {
        none: 0,
        view: 1,
        configure: 2,
        approve: 3,
      };
      
      return levelPriority[currentLevel] >= levelPriority[minLevel];
    },
    [permissions]
  );

  // Get the permission level for a specific container
  const getContainerPermission = useCallback(
    (containerCode: string): ContainerPermissionLevel => {
      return permissions[containerCode] || "none";
    },
    [permissions]
  );

  // Check if user can configure (implies view)
  const canConfigure = useCallback(
    (containerCode: string): boolean => {
      return hasContainerAccess(containerCode, "configure");
    },
    [hasContainerAccess]
  );

  // Check if user can at least view
  const canView = useCallback(
    (containerCode: string): boolean => {
      return hasContainerAccess(containerCode, "view");
    },
    [hasContainerAccess]
  );

  // Get aggregate permission level (highest across all containers)
  const getAggregatePermission = useCallback((): ContainerPermissionLevel => {
    const levelPriority: Record<ContainerPermissionLevel, number> = {
      none: 0,
      view: 1,
      configure: 2,
      approve: 3,
    };
    
    let maxLevel: ContainerPermissionLevel = "none";
    
    Object.values(permissions).forEach((level) => {
      if (levelPriority[level] > levelPriority[maxLevel]) {
        maxLevel = level;
      }
    });
    
    return maxLevel;
  }, [permissions]);

  return {
    permissions,
    isLoading,
    hasContainerAccess,
    getContainerPermission,
    canConfigure,
    canView,
    getAggregatePermission,
  };
}
