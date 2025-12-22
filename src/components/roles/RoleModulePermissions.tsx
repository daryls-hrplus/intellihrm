import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Save, RefreshCw, Check } from "lucide-react";
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
  const [changes, setChanges] = useState<Record<string, boolean>>({});

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
          .order("module_name")
          .order("display_order"),
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

  const hasAccess = (modulePermissionId: string): boolean => {
    if (changes[modulePermissionId] !== undefined) {
      return changes[modulePermissionId];
    }
    const existing = rolePermissions.find((rp) => rp.module_permission_id === modulePermissionId);
    return existing?.can_view ?? false;
  };

  const handleToggle = (modulePermissionId: string, value: boolean) => {
    setChanges((prev) => ({
      ...prev,
      [modulePermissionId]: value,
    }));
  };

  // Toggle all cards within a module
  const handleModuleToggle = (moduleCode: string, value: boolean) => {
    const moduleItems = groupedModules[moduleCode]?.items || [];
    const newChanges = { ...changes };
    moduleItems.forEach((item) => {
      newChanges[item.id] = value;
    });
    setChanges(newChanges);
  };

  // Check if all cards in a module have access
  const isModuleFullyEnabled = (moduleCode: string): boolean => {
    const moduleItems = groupedModules[moduleCode]?.items || [];
    return moduleItems.every((item) => hasAccess(item.id));
  };

  // Check if some but not all cards have access
  const isModulePartiallyEnabled = (moduleCode: string): boolean => {
    const moduleItems = groupedModules[moduleCode]?.items || [];
    const enabledCount = moduleItems.filter((item) => hasAccess(item.id)).length;
    return enabledCount > 0 && enabledCount < moduleItems.length;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [modulePermissionId, hasAccessValue] of Object.entries(changes)) {
        const existing = rolePermissions.find((rp) => rp.module_permission_id === modulePermissionId);
        
        if (existing) {
          await supabase
            .from("role_permissions")
            .update({
              can_view: hasAccessValue,
              can_create: hasAccessValue,
              can_edit: hasAccessValue,
              can_delete: hasAccessValue,
            })
            .eq("id", existing.id);
        } else if (hasAccessValue) {
          await supabase.from("role_permissions").insert({
            role_id: roleId,
            module_permission_id: modulePermissionId,
            can_view: true,
            can_create: true,
            can_edit: true,
            can_delete: true,
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
            Module & Card Access
          </CardTitle>
          <CardDescription>
            Define which modules and cards this role can access
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
          {Object.entries(groupedModules).map(([moduleCode, group]) => {
            const isFullyEnabled = isModuleFullyEnabled(moduleCode);
            const isPartiallyEnabled = isModulePartiallyEnabled(moduleCode);
            const enabledCount = group.items.filter((item) => hasAccess(item.id)).length;

            return (
              <AccordionItem key={moduleCode} value={moduleCode} className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{group.module_name}</span>
                      <Badge 
                        variant={isFullyEnabled ? "default" : isPartiallyEnabled ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {enabledCount}/{group.items.length} cards
                      </Badge>
                    </div>
                    <div 
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs text-muted-foreground">
                        {isFullyEnabled ? "All" : isPartiallyEnabled ? "Partial" : "None"}
                      </span>
                      <Switch
                        checked={isFullyEnabled}
                        onCheckedChange={(v) => handleModuleToggle(moduleCode, v)}
                      />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                    {group.items.map((item) => {
                      const itemHasAccess = hasAccess(item.id);
                      const isModified = changes[item.id] !== undefined;
                      
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            itemHasAccess 
                              ? "bg-primary/5 border-primary/20" 
                              : "bg-muted/30 border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {itemHasAccess && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <span className={`text-sm ${itemHasAccess ? "font-medium" : ""}`}>
                              {item.tab_name || item.module_name}
                            </span>
                            {isModified && (
                              <Badge variant="outline" className="text-xs">Modified</Badge>
                            )}
                          </div>
                          <Switch
                            checked={itemHasAccess}
                            onCheckedChange={(v) => handleToggle(item.id, v)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
