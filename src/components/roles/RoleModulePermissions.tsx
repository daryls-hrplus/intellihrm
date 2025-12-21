import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Save, RefreshCw, Eye, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ModulePermission {
  id: string;
  module_code: string;
  module_name: string;
  tab_code: string | null;
  tab_name: string | null;
  parent_tab_code: string | null;
  is_active: boolean;
}

interface RolePermission {
  id?: string;
  role_id: string;
  module_permission_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface RoleModulePermissionsProps {
  roleId: string;
}

export function RoleModulePermissions({ roleId }: RoleModulePermissionsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [changes, setChanges] = useState<Record<string, Partial<RolePermission>>>({});

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    try {
      const [modulesRes, permissionsRes] = await Promise.all([
        supabase
          .from("module_permissions")
          .select("*")
          .eq("is_active", true)
          .order("module_name"),
        supabase
          .from("role_permissions")
          .select("*")
          .eq("role_id", roleId),
      ]);

      if (modulesRes.error) throw modulesRes.error;
      if (permissionsRes.error) throw permissionsRes.error;

      setModulePermissions(modulesRes.data || []);
      setRolePermissions(permissionsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group by module
  const groupedModules = modulePermissions.reduce((acc, mp) => {
    if (!acc[mp.module_code]) {
      acc[mp.module_code] = {
        module_name: mp.module_name,
        module_code: mp.module_code,
        items: [],
      };
    }
    acc[mp.module_code].items.push(mp);
    return acc;
  }, {} as Record<string, { module_name: string; module_code: string; items: ModulePermission[] }>);

  const getPermission = (modulePermissionId: string) => {
    const changed = changes[modulePermissionId];
    const existing = rolePermissions.find((rp) => rp.module_permission_id === modulePermissionId);
    
    return {
      can_view: changed?.can_view ?? existing?.can_view ?? false,
      can_create: changed?.can_create ?? existing?.can_create ?? false,
      can_edit: changed?.can_edit ?? existing?.can_edit ?? false,
      can_delete: changed?.can_delete ?? existing?.can_delete ?? false,
    };
  };

  const handleToggle = (
    modulePermissionId: string,
    field: "can_view" | "can_create" | "can_edit" | "can_delete",
    value: boolean
  ) => {
    setChanges((prev) => ({
      ...prev,
      [modulePermissionId]: {
        ...prev[modulePermissionId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [modulePermissionId, change] of Object.entries(changes)) {
        const existing = rolePermissions.find((rp) => rp.module_permission_id === modulePermissionId);
        
        if (existing) {
          await supabase
            .from("role_permissions")
            .update({
              can_view: change.can_view ?? existing.can_view,
              can_create: change.can_create ?? existing.can_create,
              can_edit: change.can_edit ?? existing.can_edit,
              can_delete: change.can_delete ?? existing.can_delete,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("role_permissions").insert({
            role_id: roleId,
            module_permission_id: modulePermissionId,
            can_view: change.can_view ?? false,
            can_create: change.can_create ?? false,
            can_edit: change.can_edit ?? false,
            can_delete: change.can_delete ?? false,
          });
        }
      }

      toast({
        title: "Success",
        description: "Module permissions saved",
      });
      setChanges({});
      fetchData();
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
            <Users className="h-5 w-5" />
            Module & Tab Permissions
          </CardTitle>
          <CardDescription>
            Configure CRUD permissions for each module and tab
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
        <Accordion type="multiple" className="space-y-2">
          {Object.entries(groupedModules).map(([moduleCode, group]) => (
            <AccordionItem key={moduleCode} value={moduleCode} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{group.module_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {group.items.length} items
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {group.items.map((item) => {
                    const perm = getPermission(item.id);
                    const isModified = changes[item.id] !== undefined;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {item.tab_name || item.module_name}
                          </span>
                          {isModified && (
                            <Badge variant="outline" className="text-xs">Modified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={perm.can_view}
                              onCheckedChange={(v) => handleToggle(item.id, "can_view", v)}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Plus className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={perm.can_create}
                              onCheckedChange={(v) => handleToggle(item.id, "can_create", v)}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Edit className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={perm.can_edit}
                              onCheckedChange={(v) => handleToggle(item.id, "can_edit", v)}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                            <Switch
                              checked={perm.can_delete}
                              onCheckedChange={(v) => handleToggle(item.id, "can_delete", v)}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
