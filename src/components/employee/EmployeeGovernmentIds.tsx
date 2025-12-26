import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Shield, ShieldCheck } from "lucide-react";

interface GovernmentIdType {
  id: string;
  code: string;
  name: string;
  is_mandatory: boolean;
  validation_pattern: string | null;
  validation_message: string | null;
}

interface EmployeeGovernmentId {
  id: string;
  employee_id: string;
  government_id_type_id: string;
  id_number: string;
  issue_date: string | null;
  expiry_date: string | null;
  issuing_authority: string | null;
  notes: string | null;
  is_verified: boolean;
  government_id_types: GovernmentIdType;
}

interface Props {
  employeeId: string;
  companyCountryCode?: string;
}

const emptyFormData = {
  government_id_type_id: "",
  id_number: "",
  issue_date: "",
  expiry_date: "",
  issuing_authority: "",
  notes: "",
};

export function EmployeeGovernmentIds({ employeeId, companyCountryCode }: Props) {
  const [govIds, setGovIds] = useState<EmployeeGovernmentId[]>([]);
  const [availableTypes, setAvailableTypes] = useState<GovernmentIdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId, companyCountryCode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employee's government IDs
      const { data: ids, error: idsError } = await supabase
        .from("employee_government_ids")
        .select(`
          *,
          government_id_types (
            id,
            code,
            name,
            is_mandatory,
            validation_pattern,
            validation_message
          )
        `)
        .eq("employee_id", employeeId);

      if (idsError) throw idsError;
      setGovIds(ids || []);

      // Fetch available ID types for the company's country
      if (companyCountryCode) {
        const { data: types, error: typesError } = await supabase
          .from("government_id_types")
          .select("id, code, name, is_mandatory, validation_pattern, validation_message")
          .eq("country_code", companyCountryCode)
          .eq("is_employee_type", true)
          .eq("is_active", true)
          .order("display_order");

        if (typesError) throw typesError;
        setAvailableTypes(types || []);
      }
    } catch (error) {
      console.error("Error fetching government IDs:", error);
      toast.error("Failed to load government IDs");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (govId?: EmployeeGovernmentId) => {
    setValidationError(null);
    if (govId) {
      setEditingId(govId.id);
      setFormData({
        government_id_type_id: govId.government_id_type_id,
        id_number: govId.id_number,
        issue_date: govId.issue_date || "",
        expiry_date: govId.expiry_date || "",
        issuing_authority: govId.issuing_authority || "",
        notes: govId.notes || "",
      });
    } else {
      setEditingId(null);
      setFormData(emptyFormData);
    }
    setDialogOpen(true);
  };

  const validateIdNumber = (idNumber: string, typeId: string): boolean => {
    const idType = availableTypes.find((t) => t.id === typeId);
    if (!idType?.validation_pattern) return true;

    try {
      const regex = new RegExp(idType.validation_pattern);
      if (!regex.test(idNumber)) {
        setValidationError(idType.validation_message || "Invalid format");
        return false;
      }
    } catch (e) {
      // Invalid regex pattern, skip validation
    }
    setValidationError(null);
    return true;
  };

  const handleSave = async () => {
    if (!formData.government_id_type_id || !formData.id_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!validateIdNumber(formData.id_number, formData.government_id_type_id)) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        employee_id: employeeId,
        government_id_type_id: formData.government_id_type_id,
        id_number: formData.id_number,
        issue_date: formData.issue_date || null,
        expiry_date: formData.expiry_date || null,
        issuing_authority: formData.issuing_authority || null,
        notes: formData.notes || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from("employee_government_ids")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Government ID updated successfully");
      } else {
        const { error } = await supabase
          .from("employee_government_ids")
          .insert(payload);

        if (error) throw error;
        toast.success("Government ID added successfully");
      }

      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving government ID:", error);
      if (error.code === "23505") {
        toast.error("This ID type already exists for this employee");
      } else {
        toast.error(error.message || "Failed to save government ID");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this government ID?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("employee_government_ids")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Government ID deleted successfully");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting government ID:", error);
      toast.error(error.message || "Failed to delete government ID");
    }
  };

  // Get available types that haven't been added yet
  const unusedTypes = availableTypes.filter(
    (type) => !govIds.some((g) => g.government_id_type_id === type.id) || 
              (editingId && govIds.find((g) => g.id === editingId)?.government_id_type_id === type.id)
  );

  if (!companyCountryCode) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Company country not configured. Government ID types cannot be loaded.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Government Identifiers</h3>
        <Button onClick={() => handleOpenDialog()} disabled={unusedTypes.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add ID
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>ID Number</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : govIds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No government IDs recorded
                </TableCell>
              </TableRow>
            ) : (
              govIds.map((govId) => (
                <TableRow key={govId.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {govId.government_id_types.name}
                      {govId.government_id_types.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{govId.id_number}</TableCell>
                  <TableCell>{govId.issue_date || "-"}</TableCell>
                  <TableCell>{govId.expiry_date || "-"}</TableCell>
                  <TableCell>
                    {govId.is_verified ? (
                      <Badge variant="default" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(govId)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(govId.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Government ID" : "Add Government ID"}
            </DialogTitle>
            <DialogDescription>
              Record the employee's government identification number.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="government_id_type_id">ID Type *</Label>
              <Select
                value={formData.government_id_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, government_id_type_id: value })
                }
                disabled={!!editingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  {unusedTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                      {type.is_mandatory && " (Required)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="id_number">ID Number *</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) => {
                  setFormData({ ...formData, id_number: e.target.value });
                  if (formData.government_id_type_id) {
                    validateIdNumber(e.target.value, formData.government_id_type_id);
                  }
                }}
                placeholder="Enter ID number"
              />
              {validationError && (
                <p className="text-sm text-destructive">{validationError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="issuing_authority">Issuing Authority</Label>
              <Input
                id="issuing_authority"
                value={formData.issuing_authority}
                onChange={(e) =>
                  setFormData({ ...formData, issuing_authority: e.target.value })
                }
                placeholder="e.g., Ministry of Finance"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !!validationError}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
