import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Network, Building2, ArrowLeft, Plus, Edit2, Trash2, ChevronDown, ChevronRight, FolderTree, Loader2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Division {
  id: string;
  name: string;
  code: string;
  description: string | null;
  company_id: string;
  company_name?: string;
  is_active: boolean;
  department_count: number;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface FormData {
  name: string;
  code: string;
  description: string;
  company_id: string;
  is_active: boolean;
}

const defaultFormData: FormData = {
  name: "",
  code: "",
  description: "",
  company_id: "",
  is_active: true,
};

export default function DivisionsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [deletingDivision, setDeletingDivision] = useState<Division | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [divisionDepartments, setDivisionDepartments] = useState<Record<string, Department[]>>({});
  const [loadingDepartments, setLoadingDepartments] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchDivisions();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
    setIsLoading(false);
  };

  const fetchDivisions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_divisions")
        .select(`
          id,
          name,
          code,
          description,
          company_id,
          is_active,
          companies!company_divisions_company_id_fkey(name)
        `)
        .eq("company_id", selectedCompanyId)
        .order("name");

      if (error) throw error;

      // Get department counts for each division
      const divisionIds = data?.map(d => d.id) || [];
      const { data: deptCounts } = await supabase
        .from("departments")
        .select("company_division_id")
        .in("company_division_id", divisionIds);

      const countMap: Record<string, number> = {};
      deptCounts?.forEach(d => {
        if (d.company_division_id) {
          countMap[d.company_division_id] = (countMap[d.company_division_id] || 0) + 1;
        }
      });

      const divisionsWithCounts: Division[] = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        code: d.code,
        description: d.description,
        company_id: d.company_id,
        company_name: (d.companies as any)?.name,
        is_active: d.is_active,
        department_count: countMap[d.id] || 0,
      }));

      setDivisions(divisionsWithCounts);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      toast.error("Failed to load divisions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentsForDivision = async (divisionId: string) => {
    setLoadingDepartments(prev => new Set(prev).add(divisionId));
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, code")
        .eq("company_division_id", divisionId)
        .order("name");

      if (error) throw error;
      setDivisionDepartments(prev => ({ ...prev, [divisionId]: data || [] }));
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoadingDepartments(prev => {
        const next = new Set(prev);
        next.delete(divisionId);
        return next;
      });
    }
  };

  const toggleExpand = (divisionId: string) => {
    const newExpanded = new Set(expandedDivisions);
    if (newExpanded.has(divisionId)) {
      newExpanded.delete(divisionId);
    } else {
      newExpanded.add(divisionId);
      if (!divisionDepartments[divisionId]) {
        fetchDepartmentsForDivision(divisionId);
      }
    }
    setExpandedDivisions(newExpanded);
  };

  const handleAdd = () => {
    setEditingDivision(null);
    setFormData({ ...defaultFormData, company_id: selectedCompanyId });
    setIsDialogOpen(true);
  };

  const handleEdit = (division: Division) => {
    setEditingDivision(division);
    setFormData({
      name: division.name,
      code: division.code,
      description: division.description || "",
      company_id: division.company_id,
      is_active: division.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (division: Division) => {
    setDeletingDivision(division);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.company_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      if (editingDivision) {
        const { error } = await supabase
          .from("company_divisions")
          .update({
            name: formData.name,
            code: formData.code,
            description: formData.description || null,
            company_id: formData.company_id,
            is_active: formData.is_active,
          })
          .eq("id", editingDivision.id);

        if (error) throw error;
        toast.success("Division updated successfully");
      } else {
        const { error } = await supabase
          .from("company_divisions")
          .insert({
            name: formData.name,
            code: formData.code,
            description: formData.description || null,
            company_id: formData.company_id,
            is_active: formData.is_active,
          });

        if (error) throw error;
        toast.success("Division created successfully");
      }

      setIsDialogOpen(false);
      fetchDivisions();
    } catch (error: any) {
      console.error("Error saving division:", error);
      toast.error(error.message || "Failed to save division");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingDivision) return;

    try {
      const { error } = await supabase
        .from("company_divisions")
        .delete()
        .eq("id", deletingDivision.id);

      if (error) throw error;
      toast.success("Division deleted successfully");
      setIsDeleteDialogOpen(false);
      fetchDivisions();
    } catch (error: any) {
      console.error("Error deleting division:", error);
      toast.error(error.message || "Failed to delete division. It may have linked departments.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Workforce", href: "/workforce" },
          { label: "Divisions" }
        ]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink
              to="/workforce"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                <Network className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Divisions
                </h1>
                <p className="text-muted-foreground">
                  Manage company divisions and view linked departments
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Division
          </Button>
        </div>

        {/* Company Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Divisions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : divisions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Divisions Found</h3>
              <p className="text-muted-foreground mb-4">
                This company doesn't have any divisions yet.
              </p>
              <Button onClick={handleAdd} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Division
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {divisions.map((division) => (
              <Card key={division.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleExpand(division.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted"
                        disabled={division.department_count === 0}
                      >
                        {division.department_count > 0 ? (
                          expandedDivisions.has(division.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )
                        ) : (
                          <div className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                        <Network className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{division.name}</h3>
                          <span className="text-xs text-muted-foreground">({division.code})</span>
                          {!division.is_active && (
                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                              Inactive
                            </span>
                          )}
                        </div>
                        {division.description && (
                          <p className="text-sm text-muted-foreground">{division.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-xs text-info">
                            <FolderTree className="h-3 w-3" />
                            {division.department_count} department{division.department_count !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(division)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(division)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Departments */}
                  {expandedDivisions.has(division.id) && (
                    <div className="mt-4 ml-16 border-l-2 border-border pl-4">
                      {loadingDepartments.has(division.id) ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading departments...
                        </div>
                      ) : divisionDepartments[division.id]?.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Linked Departments
                          </p>
                          {divisionDepartments[division.id].map((dept) => (
                            <div
                              key={dept.id}
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                            >
                              <FolderTree className="h-4 w-4 text-warning" />
                              <span className="text-sm font-medium">{dept.name}</span>
                              <span className="text-xs text-muted-foreground">({dept.code})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">
                          No departments linked to this division
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDivision ? "Edit Division" : "Add Division"}
            </DialogTitle>
            <DialogDescription>
              {editingDivision
                ? "Update the division details below."
                : "Enter the details for the new division."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Operations"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., OPS"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this division"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : editingDivision ? (
                "Update Division"
              ) : (
                "Create Division"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Division</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDivision?.name}"?
              {deletingDivision?.department_count && deletingDivision.department_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This division has {deletingDivision.department_count} linked department(s).
                  You must reassign or remove them first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
