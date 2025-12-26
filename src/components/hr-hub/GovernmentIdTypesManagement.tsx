import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CountrySelect } from "@/components/ui/country-select";
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
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { getCountryName } from "@/lib/countries";

interface GovernmentIdType {
  id: string;
  country_code: string;
  code: string;
  name: string;
  description: string | null;
  is_employee_type: boolean;
  is_employer_type: boolean;
  is_mandatory: boolean;
  validation_pattern: string | null;
  validation_message: string | null;
  is_active: boolean;
  display_order: number;
}

const emptyFormData = {
  country_code: "",
  code: "",
  name: "",
  description: "",
  is_employee_type: true,
  is_employer_type: false,
  is_mandatory: false,
  validation_pattern: "",
  validation_message: "",
  is_active: true,
  display_order: 0,
};

export function GovernmentIdTypesManagement() {
  const [idTypes, setIdTypes] = useState<GovernmentIdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchIdTypes();
  }, []);

  const fetchIdTypes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("government_id_types")
        .select("*")
        .order("country_code")
        .order("display_order");

      if (error) throw error;
      setIdTypes(data || []);
    } catch (error) {
      console.error("Error fetching government ID types:", error);
      toast.error("Failed to load government ID types");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (idType?: GovernmentIdType) => {
    if (idType) {
      setEditingId(idType.id);
      setFormData({
        country_code: idType.country_code,
        code: idType.code,
        name: idType.name,
        description: idType.description || "",
        is_employee_type: idType.is_employee_type,
        is_employer_type: idType.is_employer_type,
        is_mandatory: idType.is_mandatory,
        validation_pattern: idType.validation_pattern || "",
        validation_message: idType.validation_message || "",
        is_active: idType.is_active,
        display_order: idType.display_order,
      });
    } else {
      setEditingId(null);
      setFormData(emptyFormData);
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.country_code || !formData.code || !formData.name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        country_code: formData.country_code,
        code: formData.code.toUpperCase(),
        name: formData.name,
        description: formData.description || null,
        is_employee_type: formData.is_employee_type,
        is_employer_type: formData.is_employer_type,
        is_mandatory: formData.is_mandatory,
        validation_pattern: formData.validation_pattern || null,
        validation_message: formData.validation_message || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingId) {
        const { error } = await supabase
          .from("government_id_types")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Government ID type updated successfully");
      } else {
        const { error } = await supabase
          .from("government_id_types")
          .insert(payload);

        if (error) throw error;
        toast.success("Government ID type created successfully");
      }

      setDialogOpen(false);
      fetchIdTypes();
    } catch (error: any) {
      console.error("Error saving government ID type:", error);
      toast.error(error.message || "Failed to save government ID type");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this government ID type?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("government_id_types")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Government ID type deleted successfully");
      fetchIdTypes();
    } catch (error: any) {
      console.error("Error deleting government ID type:", error);
      toast.error(error.message || "Failed to delete government ID type");
    }
  };

  const filteredIdTypes = idTypes.filter((idType) => {
    if (countryFilter && countryFilter !== "all" && idType.country_code !== countryFilter) return false;
    if (typeFilter === "employee" && !idType.is_employee_type) return false;
    if (typeFilter === "employer" && !idType.is_employer_type) return false;
    return true;
  });

  const uniqueCountries = [...new Set(idTypes.map((t) => t.country_code))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map((code) => (
                  <SelectItem key={code} value={code}>
                    {getCountryName(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="employer">Employer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add ID Type
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mandatory</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredIdTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No government ID types found
                </TableCell>
              </TableRow>
            ) : (
              filteredIdTypes.map((idType) => (
                <TableRow key={idType.id}>
                  <TableCell>{getCountryName(idType.country_code)}</TableCell>
                  <TableCell className="font-mono">{idType.code}</TableCell>
                  <TableCell>{idType.name}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {idType.is_employee_type && (
                        <Badge variant="secondary">Employee</Badge>
                      )}
                      {idType.is_employer_type && (
                        <Badge variant="outline">Employer</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {idType.is_mandatory ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={idType.is_active ? "default" : "secondary"}>
                      {idType.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(idType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(idType.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Government ID Type" : "Add Government ID Type"}
            </DialogTitle>
            <DialogDescription>
              Configure government identification types for employee and employer records.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="country_code">Country *</Label>
              <CountrySelect
                value={formData.country_code}
                onChange={(value) =>
                  setFormData({ ...formData, country_code: value })
                }
                valueType="code"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., NIS_EE"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., NIS Number (Employee)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_employee_type"
                  checked={formData.is_employee_type}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_employee_type: !!checked })
                  }
                />
                <Label htmlFor="is_employee_type">Employee Type</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_employer_type"
                  checked={formData.is_employer_type}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_employer_type: !!checked })
                  }
                />
                <Label htmlFor="is_employer_type">Employer Type</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_mandatory"
                  checked={formData.is_mandatory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_mandatory: !!checked })
                  }
                />
                <Label htmlFor="is_mandatory">Mandatory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: !!checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="validation_pattern">Validation Pattern (Regex)</Label>
              <Input
                id="validation_pattern"
                value={formData.validation_pattern}
                onChange={(e) =>
                  setFormData({ ...formData, validation_pattern: e.target.value })
                }
                placeholder="e.g., ^[0-9]{9}$"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="validation_message">Validation Error Message</Label>
              <Input
                id="validation_message"
                value={formData.validation_message}
                onChange={(e) =>
                  setFormData({ ...formData, validation_message: e.target.value })
                }
                placeholder="e.g., Must be 9 digits"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
