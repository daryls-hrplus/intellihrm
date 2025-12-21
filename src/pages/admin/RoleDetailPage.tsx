import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Shield, Lock, Eye, FileText, Settings, Users, Database, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RoleContainerPermissions } from "@/components/roles/RoleContainerPermissions";
import { RoleModulePermissions } from "@/components/roles/RoleModulePermissions";
import { RolePiiAccess } from "@/components/roles/RolePiiAccess";
import { RoleAuditLog } from "@/components/roles/RoleAuditLog";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === "new";
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  
  const [role, setRole] = useState<RoleFormData>({
    name: "",
    description: "",
    role_type: "custom",
    is_active: true,
    tenant_visibility: "single",
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchRole(id);
    }
  }, [id, isNew]);

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
          .insert({
            name: role.name,
            description: role.description,
            role_type: role.role_type,
            is_active: role.is_active,
            tenant_visibility: role.tenant_visibility,
          })
          .select()
          .single();

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Role created successfully",
        });
        navigate(`/admin/roles/${data.id}`);
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
              onClick={() => navigate("/admin/roles")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isNew ? "Create New Role" : role.name}
              </h1>
              <p className="text-muted-foreground">
                {isNew ? "Define a new role with permissions" : "Manage role settings and permissions"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && role.role_type && getRoleTypeBadge(role.role_type as RoleType)}
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="identity" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Identity
            </TabsTrigger>
            <TabsTrigger value="containers" className="flex items-center gap-2" disabled={isNew}>
              <Database className="h-4 w-4" />
              Containers
            </TabsTrigger>
            <TabsTrigger value="modules" className="flex items-center gap-2" disabled={isNew}>
              <Users className="h-4 w-4" />
              Modules
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
    </AdminLayout>
  );
}
