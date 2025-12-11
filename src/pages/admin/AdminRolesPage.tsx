import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Lock,
  Eye,
  Menu as MenuIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Json } from "@/integrations/supabase/types";

interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  menu_permissions: string[];
  can_view_pii: boolean;
  is_active: boolean;
  created_at: string;
}

const MENU_MODULES = [
  { code: "dashboard", label: "Dashboard" },
  { code: "workforce", label: "Workforce Management" },
  { code: "leave", label: "Leave Management" },
  { code: "compensation", label: "Compensation" },
  { code: "benefits", label: "Benefits" },
  { code: "performance", label: "Performance" },
  { code: "training", label: "Training" },
  { code: "succession", label: "Succession Planning" },
  { code: "recruitment", label: "Recruitment" },
  { code: "hse", label: "Health & Safety" },
  { code: "employee_relations", label: "Employee Relations" },
  { code: "property", label: "Company Property" },
  { code: "admin", label: "Admin & Security" },
  { code: "profile", label: "Profile" },
];

const breadcrumbItems = [
  { label: "Admin", href: "/admin" },
  { label: "Role Management" },
];

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { logView } = useAuditLog();
  const hasLoggedView = useRef(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    menu_permissions: [] as string[],
    can_view_pii: false,
    is_active: true,
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (roles.length > 0 && !hasLoggedView.current) {
      hasLoggedView.current = true;
      logView('roles_list', undefined, 'Role Management', { role_count: roles.length });
    }
  }, [roles]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("is_system", { ascending: false })
        .order("name");

      if (error) throw error;

      const mappedRoles: Role[] = (data || []).map((r) => ({
        ...r,
        menu_permissions: Array.isArray(r.menu_permissions) 
          ? (r.menu_permissions as string[]) 
          : [],
      }));

      setRoles(mappedRoles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedRole(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      menu_permissions: ["dashboard", "profile"],
      can_view_pii: false,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || "",
      menu_permissions: role.menu_permissions,
      can_view_pii: role.can_view_pii,
      is_active: role.is_active,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and code are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedRole) {
        // Update existing role
        const { error } = await supabase
          .from("roles")
          .update({
            name: formData.name,
            description: formData.description || null,
            menu_permissions: formData.menu_permissions as unknown as Json,
            can_view_pii: formData.can_view_pii,
            is_active: formData.is_active,
          })
          .eq("id", selectedRole.id);

        if (error) throw error;

        toast({ title: "Role updated successfully" });
      } else {
        // Create new role
        const { error } = await supabase.from("roles").insert({
          name: formData.name,
          code: formData.code.toLowerCase().replace(/\s+/g, "_"),
          description: formData.description || null,
          menu_permissions: formData.menu_permissions as unknown as Json,
          can_view_pii: formData.can_view_pii,
          is_active: formData.is_active,
          is_system: false,
        });

        if (error) throw error;

        toast({ title: "Role created successfully" });
      }

      setIsDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save role.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", selectedRole.id);

      if (error) throw error;

      toast({ title: "Role deleted successfully" });
      setIsDeleteDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMenuPermission = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      menu_permissions: prev.menu_permissions.includes(code)
        ? prev.menu_permissions.filter((p) => p !== code)
        : [...prev.menu_permissions, code],
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage user roles, menu access, and PII visibility permissions
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        </div>

        {/* Roles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className={cn(
                  "relative rounded-xl border bg-card p-5 transition-all hover:shadow-md",
                  !role.is_active && "opacity-60"
                )}
              >
                {role.is_system && (
                  <div className="absolute right-3 top-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{role.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      {role.code}
                    </p>
                  </div>
                </div>

                {role.description && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {role.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      role.can_view_pii
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Eye className="h-3 w-3" />
                    {role.can_view_pii ? "Can View PII" : "No PII Access"}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <MenuIcon className="h-3 w-3" />
                    {role.menu_permissions.length} modules
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(role)}
                  >
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  {!role.is_system && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(role)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription>
                {selectedRole
                  ? "Update role settings and permissions"
                  : "Define a new role with specific permissions"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Finance Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Role Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="e.g., finance_manager"
                    disabled={!!selectedRole}
                  />
                  {selectedRole && (
                    <p className="text-xs text-muted-foreground">
                      Code cannot be changed after creation
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this role's responsibilities"
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">PII Access (GDPR)</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow this role to view personal identifiable information
                      (email, phone, address, etc.)
                    </p>
                  </div>
                  <Switch
                    checked={formData.can_view_pii}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, can_view_pii: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Inactive roles cannot be assigned to users
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Menu Access Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Select which modules this role can access in the navigation
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {MENU_MODULES.map((module) => (
                    <div
                      key={module.code}
                      className="flex items-center space-x-3 rounded-lg border p-3"
                    >
                      <Checkbox
                        id={module.code}
                        checked={formData.menu_permissions.includes(module.code)}
                        onCheckedChange={() => toggleMenuPermission(module.code)}
                      />
                      <Label
                        htmlFor={module.code}
                        className="flex-1 cursor-pointer text-sm font-normal"
                      >
                        {module.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedRole ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedRole?.name}"? This
                action cannot be undone. Users with this role will need to be
                reassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isSaving}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
