import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileDown } from "lucide-react";
import { RoleCard } from "./RoleCard";
import { RoleFilters } from "./RoleFilters";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Role, RoleType, PiiLevel, ContainerPermissionLevel } from "@/types/roles";
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

interface RoleWithExtras extends Role {
  pii_level?: PiiLevel;
  aggregate_container_permission?: ContainerPermissionLevel;
  modules_count?: number;
}

export function RolesListTab() {
  const [roles, setRoles] = useState<RoleWithExtras[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState<RoleType | "all">("all");
  const [seededFilter, setSeededFilter] = useState<"all" | "seeded" | "custom">("all");
  const [piiFilter, setPiiFilter] = useState<PiiLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active");

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch roles with PII access and container access
      const { data: rolesData, error: rolesError } = await supabase
        .from("roles")
        .select("*")
        .order("is_seeded", { ascending: false })
        .order("role_type")
        .order("name");

      if (rolesError) throw rolesError;

      // Fetch PII access for all roles
      const { data: piiData } = await supabase
        .from("role_pii_access")
        .select("role_id, pii_level");

      // Fetch container access for all roles
      const { data: containerData } = await supabase
        .from("role_container_access")
        .select("role_id, permission_level");

      // Map PII and container data to roles
      const piiMap = new Map<string, PiiLevel>();
      (piiData || []).forEach((p) => {
        piiMap.set(p.role_id, p.pii_level as PiiLevel);
      });

      // Calculate aggregate container permission for each role
      const containerMap = new Map<string, ContainerPermissionLevel>();
      const levelPriority: Record<string, number> = { none: 0, view: 1, configure: 2, approve: 3 };
      
      (containerData || []).forEach((c) => {
        const current = containerMap.get(c.role_id) || "none";
        const incoming = c.permission_level as ContainerPermissionLevel;
        if (levelPriority[incoming] > levelPriority[current]) {
          containerMap.set(c.role_id, incoming);
        }
      });

      const rolesWithExtras: RoleWithExtras[] = (rolesData || []).map((r) => ({
        ...r,
        role_type: (r.role_type as RoleType) || "business",
        is_seeded: r.is_seeded || false,
        base_role_id: r.base_role_id || null,
        seeded_role_code: r.seeded_role_code || null,
        tenant_visibility: (r.tenant_visibility as any) || "all",
        menu_permissions: Array.isArray(r.menu_permissions) ? (r.menu_permissions as string[]) : [],
        pii_level: piiMap.get(r.id) || (r.can_view_pii ? "full" : "none"),
        aggregate_container_permission: containerMap.get(r.id) || "none",
        modules_count: Array.isArray(r.menu_permissions) ? r.menu_permissions.length : 0,
      }));

      setRoles(rolesWithExtras);
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
  }, [toast]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Filter roles
  const filteredRoles = roles.filter((role) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (
        !role.name.toLowerCase().includes(search) &&
        !role.code.toLowerCase().includes(search) &&
        !(role.description || "").toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    // Role type filter
    if (roleTypeFilter !== "all" && role.role_type !== roleTypeFilter) {
      return false;
    }

    // Seeded filter
    if (seededFilter === "seeded" && !role.is_seeded) return false;
    if (seededFilter === "custom" && role.is_seeded) return false;

    // PII filter
    if (piiFilter !== "all" && role.pii_level !== piiFilter) {
      return false;
    }

    // Status filter
    if (statusFilter === "active" && !role.is_active) return false;
    if (statusFilter === "inactive" && role.is_active) return false;

    return true;
  });

  const hasActiveFilters =
    searchTerm !== "" ||
    roleTypeFilter !== "all" ||
    seededFilter !== "all" ||
    piiFilter !== "all" ||
    statusFilter !== "active";

  const clearFilters = () => {
    setSearchTerm("");
    setRoleTypeFilter("all");
    setSeededFilter("all");
    setPiiFilter("all");
    setStatusFilter("active");
  };

  const handleView = (role: Role) => {
    navigate(`/admin/roles/${role.id}`);
  };

  const handleEdit = (role: Role) => {
    navigate(`/admin/roles/${role.id}/edit`);
  };

  const handleDuplicate = (role: Role) => {
    navigate(`/admin/roles/new?duplicate=${role.id}`);
  };

  const handleDelete = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase.from("roles").delete().eq("id", roleToDelete.id);

      if (error) throw error;

      toast({ title: "Role deleted successfully" });
      setDeleteDialogOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManagePermissions = (role: Role) => {
    navigate(`/admin/granular-permissions?role=${role.id}`);
  };

  const handleExportRoles = () => {
    const exportData = filteredRoles.map((r) => ({
      name: r.name,
      code: r.code,
      description: r.description,
      role_type: r.role_type,
      is_seeded: r.is_seeded,
      is_active: r.is_active,
      pii_level: r.pii_level,
      modules_count: r.modules_count,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roles-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          {filteredRoles.length} of {roles.length} roles
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportRoles}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => navigate("/admin/roles/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Filters */}
      <RoleFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleTypeFilter={roleTypeFilter}
        onRoleTypeChange={setRoleTypeFilter}
        seededFilter={seededFilter}
        onSeededChange={setSeededFilter}
        piiFilter={piiFilter}
        onPiiChange={setPiiFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {hasActiveFilters ? "No roles match your filters." : "No roles found."}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onView={handleView}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onManagePermissions={handleManagePermissions}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be
              undone. Users assigned to this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
