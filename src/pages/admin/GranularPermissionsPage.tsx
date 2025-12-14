import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Loader2,
  Save,
  Eye,
  PlusCircle,
  Pencil,
  Trash2,
  ChevronRight,
  Building2,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Role {
  id: string;
  name: string;
  code: string;
  is_system: boolean;
}

interface ModulePermission {
  id: string;
  module_code: string;
  module_name: string;
  tab_code: string | null;
  tab_name: string | null;
  display_order: number;
}

interface RolePermission {
  id: string;
  role_id: string;
  module_permission_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Company {
  id: string;
  name: string;
}

interface CompanyTag {
  id: string;
  name: string;
  code: string;
  color: string;
}

interface RoleCompanyAccess {
  id: string;
  role_id: string;
  company_id: string;
}

interface RoleTagAccess {
  id: string;
  role_id: string;
  tag_id: string;
}

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Granular Permissions" },
];

export default function GranularPermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermission>>({});
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyTags, setCompanyTags] = useState<CompanyTag[]>([]);
  const [roleCompanyAccess, setRoleCompanyAccess] = useState<string[]>([]);
  const [roleTagAccess, setRoleTagAccess] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
      fetchRoleAccess(selectedRoleId);
    }
  }, [selectedRoleId]);

  const fetchInitialData = async () => {
    try {
      const [rolesRes, permissionsRes, companiesRes, tagsRes] = await Promise.all([
        supabase.from("roles").select("id, name, code, is_system").order("name"),
        supabase.from("module_permissions").select("*").eq("is_active", true).order("display_order"),
        supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
        supabase.from("company_tags").select("*").eq("is_active", true).order("name"),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (permissionsRes.error) throw permissionsRes.error;

      setRoles(rolesRes.data || []);
      setModulePermissions(permissionsRes.data || []);
      setCompanies(companiesRes.data || []);
      setCompanyTags(tagsRes.data || []);

      if (rolesRes.data && rolesRes.data.length > 0) {
        setSelectedRoleId(rolesRes.data[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role_id", roleId);

      if (error) throw error;

      const permMap: Record<string, RolePermission> = {};
      (data || []).forEach((rp) => {
        permMap[rp.module_permission_id] = rp;
      });
      setRolePermissions(permMap);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
    }
  };

  const fetchRoleAccess = async (roleId: string) => {
    try {
      const [companyRes, tagRes] = await Promise.all([
        supabase.from("role_company_access").select("company_id").eq("role_id", roleId),
        supabase.from("role_tag_access").select("tag_id").eq("role_id", roleId),
      ]);

      setRoleCompanyAccess((companyRes.data || []).map((c) => c.company_id));
      setRoleTagAccess((tagRes.data || []).map((t) => t.tag_id));
    } catch (error) {
      console.error("Error fetching role access:", error);
    }
  };

  // Helper to get permission value - defaults to TRUE (all permissions on by default)
  const getPermissionValue = (modulePermissionId: string, action: string): boolean => {
    const perm = rolePermissions[modulePermissionId];
    if (!perm) return true; // Default to ON
    return !!perm[action as keyof RolePermission];
  };

  const togglePermission = (modulePermissionId: string, action: keyof RolePermission) => {
    setHasChanges(true);
    setRolePermissions((prev) => {
      const existing = prev[modulePermissionId];
      const currentValue = existing ? !!existing[action as keyof RolePermission] : true; // Default is true
      
      if (existing) {
        return {
          ...prev,
          [modulePermissionId]: {
            ...existing,
            [action]: !currentValue,
          },
        };
      } else {
        // First time toggling - set all to true except the one being toggled (which goes to false)
        return {
          ...prev,
          [modulePermissionId]: {
            id: "",
            role_id: selectedRoleId,
            module_permission_id: modulePermissionId,
            can_view: action === "can_view" ? false : true,
            can_create: action === "can_create" ? false : true,
            can_edit: action === "can_edit" ? false : true,
            can_delete: action === "can_delete" ? false : true,
          },
        };
      }
    });
  };

  const toggleAllForModule = (moduleCode: string, action: keyof RolePermission, value: boolean) => {
    setHasChanges(true);
    const moduleTabs = modulePermissions.filter((mp) => mp.module_code === moduleCode);
    
    setRolePermissions((prev) => {
      const updated = { ...prev };
      moduleTabs.forEach((mp) => {
        const existing = updated[mp.id];
        if (existing) {
          updated[mp.id] = { ...existing, [action]: value };
        } else {
          // Default all to true, then apply the specific action value
          updated[mp.id] = {
            id: "",
            role_id: selectedRoleId,
            module_permission_id: mp.id,
            can_view: action === "can_view" ? value : true,
            can_create: action === "can_create" ? value : true,
            can_edit: action === "can_edit" ? value : true,
            can_delete: action === "can_delete" ? value : true,
          };
        }
      });
      return updated;
    });
  };

  const toggleCompanyAccess = (companyId: string) => {
    setHasChanges(true);
    setRoleCompanyAccess((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleTagAccess = (tagId: string) => {
    setHasChanges(true);
    setRoleTagAccess((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const savePermissions = async () => {
    if (!selectedRoleId) return;

    setIsSaving(true);
    try {
      // Save role permissions
      const permissionsToUpsert = Object.values(rolePermissions).map((rp) => ({
        role_id: selectedRoleId,
        module_permission_id: rp.module_permission_id,
        can_view: rp.can_view,
        can_create: rp.can_create,
        can_edit: rp.can_edit,
        can_delete: rp.can_delete,
      }));

      if (permissionsToUpsert.length > 0) {
        const { error: permError } = await supabase
          .from("role_permissions")
          .upsert(permissionsToUpsert, { onConflict: "role_id,module_permission_id" });

        if (permError) throw permError;
      }

      // Save company access - delete existing and insert new
      await supabase.from("role_company_access").delete().eq("role_id", selectedRoleId);
      if (roleCompanyAccess.length > 0) {
        const { error: companyError } = await supabase
          .from("role_company_access")
          .insert(roleCompanyAccess.map((companyId) => ({ role_id: selectedRoleId, company_id: companyId })));
        if (companyError) throw companyError;
      }

      // Save tag access - delete existing and insert new
      await supabase.from("role_tag_access").delete().eq("role_id", selectedRoleId);
      if (roleTagAccess.length > 0) {
        const { error: tagError } = await supabase
          .from("role_tag_access")
          .insert(roleTagAccess.map((tagId) => ({ role_id: selectedRoleId, tag_id: tagId })));
        if (tagError) throw tagError;
      }

      toast({ title: "Permissions saved successfully" });
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save permissions.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Group module permissions by module
  const groupedPermissions = modulePermissions.reduce((acc, mp) => {
    if (!acc[mp.module_code]) {
      acc[mp.module_code] = {
        module_code: mp.module_code,
        module_name: mp.module_name,
        tabs: [],
      };
    }
    if (mp.tab_code) {
      acc[mp.module_code].tabs.push(mp);
    }
    return acc;
  }, {} as Record<string, { module_code: string; module_name: string; tabs: ModulePermission[] }>);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Granular Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Configure module, tab, and action-level permissions for each role
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {role.name}
                      {role.is_system && (
                        <Badge variant="outline" className="ml-1 text-xs">System</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={savePermissions} disabled={isSaving || !hasChanges}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        {selectedRole && (
          <Tabs defaultValue="permissions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="permissions">Module Permissions</TabsTrigger>
              <TabsTrigger value="company_access">Company Access</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4">
              <div className="rounded-lg border bg-card">
                <div className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 p-4 border-b bg-muted/50 text-sm font-medium">
                  <div>Module / Tab</div>
                  <div className="text-center"><Eye className="h-4 w-4 mx-auto" /></div>
                  <div className="text-center"><PlusCircle className="h-4 w-4 mx-auto" /></div>
                  <div className="text-center"><Pencil className="h-4 w-4 mx-auto" /></div>
                  <div className="text-center"><Trash2 className="h-4 w-4 mx-auto" /></div>
                </div>

                <ScrollArea className="h-[600px]">
                  <Accordion type="multiple" className="w-full">
                    {Object.values(groupedPermissions).map((group) => {
                      const modulePerm = modulePermissions.find(
                        (mp) => mp.module_code === group.module_code && !mp.tab_code
                      );
                      
                      return (
                        <AccordionItem key={group.module_code} value={group.module_code}>
                          <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                              <span className="font-semibold">{group.module_name}</span>
                              <Badge variant="outline" className="ml-2">
                                {group.tabs.length} tabs
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-0">
                            {/* Module-level permission row */}
                            {modulePerm && (
                              <div className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b bg-muted/30">
                                <div className="pl-6 text-sm text-muted-foreground italic">
                                  All {group.module_name}
                                </div>
                                {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                                  <div key={action} className="flex justify-center">
                                    <Checkbox
                                      checked={getPermissionValue(modulePerm.id, action)}
                                      onCheckedChange={() =>
                                        togglePermission(modulePerm.id, action as keyof RolePermission)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tab-level permission rows */}
                            {group.tabs.map((tab) => (
                              <div
                                key={tab.id}
                                className="grid grid-cols-[1fr,80px,80px,80px,80px] gap-2 px-4 py-2 border-b last:border-b-0 hover:bg-muted/20"
                              >
                                <div className="pl-10 text-sm">{tab.tab_name}</div>
                                {["can_view", "can_create", "can_edit", "can_delete"].map((action) => (
                                  <div key={action} className="flex justify-center">
                                    <Checkbox
                                      checked={getPermissionValue(tab.id, action)}
                                      onCheckedChange={() =>
                                        togglePermission(tab.id, action as keyof RolePermission)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="company_access" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Direct Company Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Direct Company Access
                    </CardTitle>
                    <CardDescription>
                      Assign specific companies this role can manage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {companies.map((company) => (
                          <div
                            key={company.id}
                            className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`company-${company.id}`}
                              checked={roleCompanyAccess.includes(company.id)}
                              onCheckedChange={() => toggleCompanyAccess(company.id)}
                            />
                            <label
                              htmlFor={`company-${company.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {company.name}
                            </label>
                          </div>
                        ))}
                        {companies.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            No companies found
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Tag-based Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tag-based Access
                    </CardTitle>
                    <CardDescription>
                      Grant access to all companies with selected tags
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {companyTags.map((tag) => (
                          <div
                            key={tag.id}
                            className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50"
                          >
                            <Checkbox
                              id={`tag-${tag.id}`}
                              checked={roleTagAccess.includes(tag.id)}
                              onCheckedChange={() => toggleTagAccess(tag.id)}
                            />
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <label
                              htmlFor={`tag-${tag.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {tag.name}
                            </label>
                            <code className="text-xs text-muted-foreground">
                              {tag.code}
                            </code>
                          </div>
                        ))}
                        {companyTags.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            No company tags found. Create tags first.
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
