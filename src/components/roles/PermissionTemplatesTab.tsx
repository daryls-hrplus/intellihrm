import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Eye, Shield, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  Role,
  RoleType,
  ROLE_TYPE_CONFIG,
  PII_LEVEL_CONFIG,
  ADMIN_CONTAINERS,
  ContainerPermissionLevel,
  CONTAINER_PERMISSION_CONFIG,
  PiiLevel,
} from "@/types/roles";

interface SeededRoleWithDetails extends Role {
  pii_level?: PiiLevel;
  container_access?: { container_code: string; permission_level: ContainerPermissionLevel }[];
}

export function PermissionTemplatesTab() {
  const [seededRoles, setSeededRoles] = useState<SeededRoleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRoles, setExpandedRoles] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSeededRoles = async () => {
      try {
        const { data: rolesData, error: rolesError } = await supabase
          .from("roles")
          .select("*")
          .eq("is_seeded", true)
          .order("role_type")
          .order("name");

        if (rolesError) throw rolesError;

        const roleIds = (rolesData || []).map((r) => r.id);

        // Fetch PII access
        const { data: piiData } = await supabase
          .from("role_pii_access")
          .select("*")
          .in("role_id", roleIds);

        // Fetch container access
        const { data: containerData } = await supabase
          .from("role_container_access")
          .select("*")
          .in("role_id", roleIds);

        const piiMap = new Map<string, PiiLevel>();
        (piiData || []).forEach((p) => {
          piiMap.set(p.role_id, p.pii_level as PiiLevel);
        });

        const containerMap = new Map<string, { container_code: string; permission_level: ContainerPermissionLevel }[]>();
        (containerData || []).forEach((c) => {
          if (!containerMap.has(c.role_id)) {
            containerMap.set(c.role_id, []);
          }
          containerMap.get(c.role_id)!.push({
            container_code: c.container_code,
            permission_level: c.permission_level as ContainerPermissionLevel,
          });
        });

        const rolesWithDetails: SeededRoleWithDetails[] = (rolesData || []).map((r) => ({
          ...r,
          role_type: (r.role_type as RoleType) || "business",
          is_seeded: true,
          base_role_id: null,
          seeded_role_code: r.seeded_role_code || null,
          tenant_visibility: (r.tenant_visibility as any) || "all",
          menu_permissions: Array.isArray(r.menu_permissions) ? (r.menu_permissions as string[]) : [],
          pii_level: piiMap.get(r.id) || (r.can_view_pii ? "full" : "none"),
          container_access: containerMap.get(r.id) || [],
        }));

        setSeededRoles(rolesWithDetails);
      } catch (error) {
        console.error("Error fetching seeded roles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeededRoles();
  }, []);

  const toggleExpanded = (roleId: string) => {
    setExpandedRoles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(roleId)) {
        newSet.delete(roleId);
      } else {
        newSet.add(roleId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>
          Permission templates are locked seeded roles that define the baseline access for common user
          types. Custom roles can inherit from these templates.
        </p>
      </div>

      <div className="space-y-4">
        {seededRoles.map((role) => {
          const isExpanded = expandedRoles.has(role.id);
          const roleTypeConfig = ROLE_TYPE_CONFIG[role.role_type as RoleType] || ROLE_TYPE_CONFIG.business;
          const piiConfig = PII_LEVEL_CONFIG[role.pii_level || "none"];

          return (
            <Collapsible key={role.id} open={isExpanded} onOpenChange={() => toggleExpanded(role.id)}>
              <div className="rounded-lg border bg-card">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{role.name}</span>
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">{role.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-xs", roleTypeConfig.color)}>
                        {roleTypeConfig.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-xs", piiConfig.color)}>
                        <Eye className="mr-1 h-3 w-3" />
                        {piiConfig.label}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t p-4 space-y-4">
                    {role.description && (
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    )}

                    {/* Admin Container Permissions */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Admin & Insights Access</h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {ADMIN_CONTAINERS.map((container) => {
                          const access = role.container_access?.find(
                            (c) => c.container_code === container.code
                          );
                          const permLevel = access?.permission_level || "none";
                          const config = CONTAINER_PERMISSION_CONFIG[permLevel];

                          return (
                            <div
                              key={container.code}
                              className="flex items-center justify-between rounded-md border px-3 py-2"
                            >
                              <span className="text-sm">{container.label}</span>
                              <Badge variant="outline" className={cn("text-xs", config.color)}>
                                {config.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Module Access */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Module Access ({role.menu_permissions.length} modules)
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {role.menu_permissions.map((mod) => (
                          <Badge key={mod} variant="secondary" className="text-xs">
                            {mod}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {role.tenant_visibility !== "all" && (
                      <div className="text-xs text-muted-foreground">
                        Visibility: {role.tenant_visibility === "hrplus_internal" ? "HRplus Internal Only" : "Client Only"}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
