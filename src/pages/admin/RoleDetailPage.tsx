import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Save, Shield, Lock, Eye, FileText, Settings, Users, Database, Clock, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleContainerPermissions } from "@/components/roles/RoleContainerPermissions";
import { RoleModulePermissions } from "@/components/roles/RoleModulePermissions";
import { RolePiiAccess } from "@/components/roles/RolePiiAccess";
import { RoleAuditLog } from "@/components/roles/RoleAuditLog";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { useTabState } from "@/hooks/useTabState";
import type { EnhancedRole, RoleType, TenantVisibility } from "@/types/roles";

interface RoleFormData {
  name: string;
  description: string | null;
  role_type: RoleType;
  is_active: boolean;
  tenant_visibility: TenantVisibility;
  is_seeded?: boolean;
  base_role_id?: string | null;
}

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { navigateToList } = useWorkspaceNavigation();
  const { toast } = useToast();
  
  const duplicateFromId = searchParams.get("duplicate");
  const isNew = id === "new";
  const isDuplicate = isNew && !!duplicateFromId;
  
  const [loading, setLoading] = useState(!isNew || isDuplicate);
  const [saving, setSaving] = useState(false);
  const [sourceRoleId, setSourceRoleId] = useState<string | null>(null);
  const [sourceRoleName, setSourceRoleName] = useState<string>("");

  // Tab state for persistence
  const [tabState, setTabState] = useTabState({
    defaultState: {
      activeTab: "identity",
    },
  });

  const { activeTab } = tabState;
  
  const [role, setRole] = useState<RoleFormData>({
    name: "",
    description: "",
    role_type: "custom",
    is_active: true,
    tenant_visibility: "single",
  });

  useEffect(() => {
    if (isDuplicate && duplicateFromId) {
      fetchSourceRoleForDuplication(duplicateFromId);
    } else if (!isNew && id) {
      fetchRole(id);
    }
  }, [id, isNew, isDuplicate, duplicateFromId]);

  const fetchSourceRoleForDuplication = async (sourceId: string) => {
    try {
      const { data: sourceRole, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", sourceId)
        .single();

      if (error) throw error;

      setRole({
        name: `Copy of ${sourceRole.name}`,
        description: sourceRole.description,
        role_type: "custom", // Always custom for duplicates
        is_active: true,
        tenant_visibility: (sourceRole.tenant_visibility as TenantVisibility) || "single",
      });
      
      setSourceRoleId(sourceId);
      setSourceRoleName(sourceRole.name);
    } catch (error) {
      console.error("Error fetching source role:", error);
      toast({
        title: "Error",
        description: "Failed to load source role for duplication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRole = async (roleId: string) => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .single();

      if (error) throw error;
      setRole(data as RoleFormData);
    } catch (error) {
      console.error("Error fetching role:", error);
      toast({
        title: "Error",
        description: "Failed to load role details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyRolePermissions = async (fromRoleId: string, toRoleId: string) => {
    try {
      // Copy role_permissions (granular module/tab permissions)
      const { data: sourcePerms } = await supabase
        .from("role_permissions")
        .select("module_permission_id, can_view, can_create, can_edit, can_delete")
        .eq("role_id", fromRoleId);

      if (sourcePerms?.length) {
        const newPerms = sourcePerms.map(p => ({
          role_id: toRoleId,
          module_permission_id: p.module_permission_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        }));
        
        await supabase.from("role_permissions").insert(newPerms);
      }

      // Copy role_container_access
      const { data: sourceContainers } = await supabase
        .from("role_container_access")
        .select("container_code, permission_level")
        .eq("role_id", fromRoleId);

      if (sourceContainers?.length) {
        const newContainers = sourceContainers.map(c => ({
          role_id: toRoleId,
          container_code: c.container_code,
          permission_level: c.permission_level,
        }));
        
        await supabase.from("role_container_access").insert(newContainers);
      }

      // Copy role_pii_access
      const { data: sourcePii } = await supabase
        .from("role_pii_access")
        .select("pii_level, access_compensation, access_personal_details, access_banking, access_medical, access_disciplinary, export_permission, masking_enabled, jit_access_required, approval_required_for_full")
        .eq("role_id", fromRoleId);

      if (sourcePii?.length) {
        const newPii = sourcePii.map(p => ({
          role_id: toRoleId,
          pii_level: p.pii_level,
          access_compensation: p.access_compensation,
          access_personal_details: p.access_personal_details,
          access_banking: p.access_banking,
          access_medical: p.access_medical,
          access_disciplinary: p.access_disciplinary,
          export_permission: p.export_permission,
          masking_enabled: p.masking_enabled,
          jit_access_required: p.jit_access_required,
          approval_required_for_full: p.approval_required_for_full,
        }));
        
        await supabase.from("role_pii_access").insert(newPii);
      }
    } catch (error) {
      console.error("Error copying permissions:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!role.name) {
      toast({
        title: "Validation Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("roles")
          .insert([{
            name: role.name,
            code: role.name.toLowerCase().replace(/\s+/g, "_"),
            description: role.description,
            role_type: role.role_type,
            is_active: role.is_active,
            tenant_visibility: role.tenant_visibility,
            base_role_id: isDuplicate ? sourceRoleId : null,
          }])
          .select()
          .single();

        if (error) throw error;
        
        // If duplicating, copy all permissions from source role
        if (isDuplicate && sourceRoleId) {
          await copyRolePermissions(sourceRoleId, data.id);
          toast({
            title: "Success",
            description: "Role duplicated successfully with all permissions copied",
          });
        } else {
          toast({
            title: "Success",
            description: "Role created successfully",
          });
        }
        
        navigateToList({ route: `/admin/roles/${data.id}`, title: data.name, moduleCode: "admin" });
      } else {
        const { error } = await supabase
          .from("roles")
          .update({
            name: role.name,
            description: role.description,
            role_type: role.role_type,
            is_active: role.is_active,
            tenant_visibility: role.tenant_visibility,
          })
          .eq("id", id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getRoleTypeBadge = (type: RoleType) => {
    switch (type) {
      case "system":
        return <Badge variant="destructive">System</Badge>;
      case "seeded":
        return <Badge variant="secondary">Seeded</Badge>;
      default:
        return <Badge variant="outline">Custom</Badge>;
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateToList({ route: "/admin/roles", title: "Role Management", moduleCode: "admin" })}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isDuplicate 
                  ? "Duplicate Role" 
                  : isNew 
                    ? "Create New Role" 
                    : role.name}
              </h1>
              <p className="text-muted-foreground">
                {isDuplicate 
                  ? `Creating a copy of "${sourceRoleName}"` 
                  : isNew 
                    ? "Define a new role with permissions" 
                    : "Manage role settings and permissions"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && role.role_type && getRoleTypeBadge(role.role_type as RoleType)}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : isDuplicate ? "Create Duplicate" : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Duplicate Mode Banner */}
        {isDuplicate && (
          <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
            <Copy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Duplicating Role</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              You are creating a copy of "{sourceRoleName}". All module permissions, container access, and PII settings will be copied when you save.
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setTabState({ activeTab: v })}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2" disabled={isNew}>
              <Users className="h-4 w-4" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="containers" className="flex items-center gap-2" disabled={isNew}>
              <Database className="h-4 w-4" />
              Containers
            </TabsTrigger>
            <TabsTrigger value="pii" className="flex items-center gap-2" disabled={isNew}>
              <Eye className="h-4 w-4" />
              PII Access
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2" disabled={isNew}>
              <Clock className="h-4 w-4" />
              Audit
            </TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Identity
                </CardTitle>
                <CardDescription>
                  Basic role information and classification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Role Name *</Label>
                    <Input
                      id="name"
                      value={role.name || ""}
                      onChange={(e) => setRole({ ...role, name: e.target.value })}
                      placeholder="e.g., HR Manager"
                      disabled={role.role_type === "system"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role_type">Role Type</Label>
                    <Select
                      value={role.role_type || "custom"}
                      onValueChange={(value) => setRole({ ...role, role_type: value as RoleType })}
                      disabled={role.role_type === "system" || role.role_type === "seeded"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="seeded" disabled>Seeded (System Default)</SelectItem>
                        <SelectItem value="system" disabled>System (Protected)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={role.description || ""}
                    onChange={(e) => setRole({ ...role, description: e.target.value })}
                    placeholder="Describe the purpose and responsibilities of this role..."
                    rows={3}
                    disabled={role.role_type === "system"}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tenant_visibility">Tenant Visibility</Label>
                    <Select
                      value={role.tenant_visibility || "single"}
                      onValueChange={(value) => setRole({ ...role, tenant_visibility: value as TenantVisibility })}
                      disabled={role.role_type === "system"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Tenant</SelectItem>
                        <SelectItem value="multi">Multi-Tenant</SelectItem>
                        <SelectItem value="global">Global</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Controls which companies this role can access
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center gap-3 pt-2">
                      <Switch
                        checked={role.is_active !== false}
                        onCheckedChange={(checked) => setRole({ ...role, is_active: checked })}
                        disabled={role.role_type === "system"}
                      />
                      <span className="text-sm">
                        {role.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {role.is_seeded && (
                  <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Seeded Role</p>
                      <p className="text-sm text-muted-foreground">
                        This is a system-seeded role. Core identity settings are locked, but you can
                        customize permissions.
                      </p>
                    </div>
                  </div>
                )}

                {role.base_role_id && (
                  <div className="bg-blue-500/10 rounded-lg p-4 flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Inherited from Base Role</p>
                      <p className="text-sm text-muted-foreground">
                        This role inherits permissions from a base role. Changes to the base will
                        propagate here unless overridden.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Container Permissions Tab */}
          <TabsContent value="containers" className="mt-6">
            {id && !isNew && <RoleContainerPermissions roleId={id} />}
          </TabsContent>

          {/* Module Permissions Tab */}
          <TabsContent value="modules" className="mt-6">
            {id && !isNew && <RoleModulePermissions roleId={id} />}
          </TabsContent>

          {/* PII Access Tab */}
          <TabsContent value="pii" className="mt-6">
            {id && !isNew && <RolePiiAccess roleId={id} />}
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="mt-6">
            {id && !isNew && <RoleAuditLog roleId={id} />}
          </TabsContent>
        </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
