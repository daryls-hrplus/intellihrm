import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Loader2, Users, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface WorkflowApprovalRole {
  id: string;
  name: string;
  code: string;
  description: string | null;
  company_id: string | null;
  is_active: boolean;
  created_at: string;
  company?: { name: string };
  positions?: { position_id: string; is_primary: boolean; priority_order: number; position?: { title: string } }[];
}

interface Position {
  id: string;
  title: string;
}

interface Company {
  id: string;
  name: string;
}

export function WorkflowApprovalRolesManagement() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<WorkflowApprovalRole[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<WorkflowApprovalRole> | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<{ position_id: string; is_primary: boolean; priority_order: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, positionsRes, companiesRes] = await Promise.all([
        supabase
          .from("workflow_approval_roles")
          .select(`
            *,
            company:companies(name),
            positions:workflow_approval_role_positions(
              position_id,
              is_primary,
              priority_order,
              position:positions(title)
            )
          `)
          .order("name"),
        supabase.from("positions").select("id, title").eq("is_active", true).order("title"),
        supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
      ]);

      if (rolesRes.data) setRoles(rolesRes.data as WorkflowApprovalRole[]);
      if (positionsRes.data) setPositions(positionsRes.data);
      if (companiesRes.data) setCompanies(companiesRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRole = async () => {
    if (!editingRole?.name || !editingRole?.code) {
      toast.error("Name and code are required");
      return;
    }

    if (selectedPositions.length === 0) {
      toast.error("At least one position must be selected");
      return;
    }

    try {
      let roleId = editingRole.id;

      if (roleId) {
        // Update existing role
        const { error } = await supabase
          .from("workflow_approval_roles")
          .update({
            name: editingRole.name,
            code: editingRole.code,
            description: editingRole.description,
            company_id: editingRole.company_id,
            is_active: editingRole.is_active ?? true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", roleId);

        if (error) throw error;

        // Delete existing position links
        await supabase
          .from("workflow_approval_role_positions")
          .delete()
          .eq("workflow_role_id", roleId);
      } else {
        // Create new role
        const { data, error } = await supabase
          .from("workflow_approval_roles")
          .insert({
            name: editingRole.name,
            code: editingRole.code,
            description: editingRole.description,
            company_id: editingRole.company_id,
            is_active: editingRole.is_active ?? true,
            created_by: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        roleId = data.id;
      }

      // Insert position links
      const positionLinks = selectedPositions.map((sp) => ({
        workflow_role_id: roleId,
        position_id: sp.position_id,
        is_primary: sp.is_primary,
        priority_order: sp.priority_order,
      }));

      const { error: posError } = await supabase
        .from("workflow_approval_role_positions")
        .insert(positionLinks);

      if (posError) throw posError;

      toast.success(editingRole.id ? "Role updated" : "Role created");
      setShowDialog(false);
      setEditingRole(null);
      setSelectedPositions([]);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Delete this workflow approval role?")) return;

    try {
      await supabase.from("workflow_approval_roles").delete().eq("id", roleId);
      toast.success("Role deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const handleEditRole = (role: WorkflowApprovalRole) => {
    setEditingRole(role);
    setSelectedPositions(
      role.positions?.map((p) => ({
        position_id: p.position_id,
        is_primary: p.is_primary,
        priority_order: p.priority_order,
      })) || []
    );
    setShowDialog(true);
  };

  const togglePosition = (positionId: string) => {
    const exists = selectedPositions.find((sp) => sp.position_id === positionId);
    if (exists) {
      setSelectedPositions(selectedPositions.filter((sp) => sp.position_id !== positionId));
    } else {
      setSelectedPositions([
        ...selectedPositions,
        { position_id: positionId, is_primary: selectedPositions.length === 0, priority_order: selectedPositions.length + 1 },
      ]);
    }
  };

  const setPrimaryPosition = (positionId: string) => {
    setSelectedPositions(
      selectedPositions.map((sp) => ({
        ...sp,
        is_primary: sp.position_id === positionId,
      }))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Approval Roles</h3>
          <p className="text-sm text-muted-foreground">
            Define roles by selecting positions. Anyone holding linked positions can approve.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRole({ is_active: true });
            setSelectedPositions([]);
            setShowDialog(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Approval Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No workflow approval roles created yet</p>
            <p className="text-sm">Create roles to assign approval responsibilities by position</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    <CardDescription>{role.code}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRole(role.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {role.description && (
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                )}
                {role.company && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {role.company.name}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {role.positions?.map((p) => (
                    <Badge
                      key={p.position_id}
                      variant={p.is_primary ? "default" : "secondary"}
                    >
                      {p.position?.title}
                      {p.is_primary && " (Primary)"}
                    </Badge>
                  ))}
                </div>
                <Badge variant={role.is_active ? "default" : "secondary"}>
                  {role.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole?.id ? "Edit Approval Role" : "Create Approval Role"}
            </DialogTitle>
            <DialogDescription>
              Define a workflow approval role by selecting positions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={editingRole?.name || ""}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  placeholder="Leave Approvers"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={editingRole?.code || ""}
                  onChange={(e) =>
                    setEditingRole({ ...editingRole, code: e.target.value.toUpperCase().replace(/\s/g, "_") })
                  }
                  placeholder="LEAVE_APPROVERS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company (Optional)</Label>
              <Select
                value={editingRole?.company_id || "all"}
                onValueChange={(value) =>
                  setEditingRole({ ...editingRole, company_id: value === "all" ? null : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingRole?.description || ""}
                onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                placeholder="Describe the role..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Select Positions *</Label>
              <p className="text-xs text-muted-foreground">
                Anyone holding these positions can approve. Mark one as primary.
              </p>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Select</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="w-24">Primary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.map((pos) => {
                      const selected = selectedPositions.find((sp) => sp.position_id === pos.id);
                      return (
                        <TableRow key={pos.id}>
                          <TableCell>
                            <Checkbox
                              checked={!!selected}
                              onCheckedChange={() => togglePosition(pos.id)}
                            />
                          </TableCell>
                          <TableCell>{pos.title}</TableCell>
                          <TableCell>
                            {selected && (
                              <Switch
                                checked={selected.is_primary}
                                onCheckedChange={() => setPrimaryPosition(pos.id)}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {selectedPositions.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedPositions.length} position(s) selected
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={editingRole?.is_active ?? true}
                onCheckedChange={(checked) => setEditingRole({ ...editingRole, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole?.id ? "Update" : "Create"} Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
