import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database, Save, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AdminContainerPermission } from "@/types/roles";

interface ContainerPermission {
  id: string;
  role_id: string;
  container_code: string;
  permission_level: AdminContainerPermission;
}

const CONTAINER_DEFINITIONS = [
  { code: "org_structure", name: "Organization Structure", description: "Company, departments, locations" },
  { code: "users_roles_access", name: "Users, Roles & Access", description: "User management and permissions" },
  { code: "module_config", name: "Module Configuration", description: "Module-specific settings" },
  { code: "data_import_export", name: "Data Import/Export", description: "Bulk data operations" },
  { code: "audit_logs", name: "Audit Logs", description: "System audit trail" },
  { code: "integrations", name: "Integrations", description: "Third-party integrations" },
  { code: "billing", name: "Billing & Subscription", description: "Payment and subscription management" },
  { code: "security_settings", name: "Security Settings", description: "Authentication and security" },
  { code: "ai_settings", name: "AI Settings", description: "AI configuration and usage" },
  { code: "system_health", name: "System Health", description: "System monitoring and diagnostics" },
];

const PERMISSION_LEVELS: { value: AdminContainerPermission; label: string; color: string }[] = [
  { value: "none", label: "No Access", color: "bg-muted text-muted-foreground" },
  { value: "view", label: "View Only", color: "bg-blue-500/10 text-blue-500" },
  { value: "configure", label: "Configure", color: "bg-amber-500/10 text-amber-500" },
  { value: "approve", label: "Full Control", color: "bg-green-500/10 text-green-500" },
];

interface RoleContainerPermissionsProps {
  roleId: string;
}

export function RoleContainerPermissions({ roleId }: RoleContainerPermissionsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState<ContainerPermission[]>([]);
  const [changes, setChanges] = useState<Record<string, AdminContainerPermission>>({});

  useEffect(() => {
    fetchPermissions();
  }, [roleId]);

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from("role_container_access")
        .select("*")
        .eq("role_id", roleId);

      if (error) throw error;
      setPermissions((data || []) as ContainerPermission[]);
    } catch (error) {
      console.error("Error fetching container permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPermissionForContainer = (containerCode: string): AdminContainerPermission => {
    if (changes[containerCode] !== undefined) {
      return changes[containerCode];
    }
    const perm = permissions.find((p) => p.container_code === containerCode);
    return (perm?.permission_level as AdminContainerPermission) || "none";
  };

  const handlePermissionChange = (containerCode: string, level: AdminContainerPermission) => {
    setChanges((prev) => ({ ...prev, [containerCode]: level }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Upsert all changes
      const upserts = Object.entries(changes).map(([containerCode, permissionLevel]) => ({
        role_id: roleId,
        container_code: containerCode,
        permission_level: permissionLevel,
      }));

      for (const upsert of upserts) {
        const existing = permissions.find((p) => p.container_code === upsert.container_code);
        if (existing) {
          await supabase
            .from("role_container_access")
            .update({ permission_level: upsert.permission_level })
            .eq("id", existing.id);
        } else {
          await supabase.from("role_container_access").insert(upsert);
        }
      }

      toast({
        title: "Success",
        description: "Container permissions saved",
      });
      setChanges({});
      fetchPermissions();
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Admin Container Access
          </CardTitle>
          <CardDescription>
            Control access to administrative areas and configuration sections
          </CardDescription>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CONTAINER_DEFINITIONS.map((container) => {
            const currentLevel = getPermissionForContainer(container.code);
            const levelConfig = PERMISSION_LEVELS.find((l) => l.value === currentLevel);

            return (
              <div
                key={container.code}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{container.name}</span>
                    {changes[container.code] !== undefined && (
                      <Badge variant="outline" className="text-xs">Modified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{container.description}</p>
                </div>
                <Select
                  value={currentLevel}
                  onValueChange={(value) => handlePermissionChange(container.code, value as AdminContainerPermission)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue>
                      <span className={`px-2 py-1 rounded text-xs ${levelConfig?.color}`}>
                        {levelConfig?.label}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PERMISSION_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className={`px-2 py-1 rounded text-xs ${level.color}`}>
                          {level.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
