import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { FolderTree, Building2, ChevronRight, ChevronDown, Users, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface CompanyDivision {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  company_division_id: string | null;
  start_date: string;
  end_date: string | null;
  sections: Section[];
}

interface Section {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  department_id: string;
  start_date: string;
  end_date: string | null;
}

type EntityType = "department" | "section";

// Helper function to check if an entity is active at a given date
const isActiveAtDate = (startDate: string, endDate: string | null, checkDate: string): boolean => {
  return startDate <= checkDate && (endDate === null || endDate >= checkDate);
};

export default function DepartmentsPage() {
  const { isAdmin } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [divisions, setDivisions] = useState<CompanyDivision[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [asOfDate, setAsOfDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entityType, setEntityType] = useState<EntityType>("department");
  const [editingEntity, setEditingEntity] = useState<Department | Section | null>(null);
  const [parentDepartmentId, setParentDepartmentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    is_active: true,
    company_division_id: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
  });

  useEffect(() => {
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
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch divisions for the company
      const { data: divs } = await supabase
        .from("company_divisions")
        .select("id, name, code")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      
      setDivisions(divs || []);

      const { data: depts } = await supabase
        .from("departments")
        .select("id, name, code, description, is_active, company_division_id, start_date, end_date")
        .eq("company_id", selectedCompanyId)
        .order("name");

      if (depts) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name, code, description, is_active, department_id, start_date, end_date")
          .in("department_id", depts.map(d => d.id))
          .order("name");

        const departmentsWithSections = depts.map(dept => ({
          ...dept,
          sections: sections?.filter(s => s.department_id === dept.id) || []
        }));

        setDepartments(departmentsWithSections);
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [selectedCompanyId]);

  // Filter departments and sections by as-of date
  const filteredDepartments = departments.filter(dept => 
    isActiveAtDate(dept.start_date, dept.end_date, asOfDate)
  ).map(dept => ({
    ...dept,
    sections: dept.sections.filter(sec => 
      isActiveAtDate(sec.start_date, sec.end_date, asOfDate)
    )
  }));

  const toggleDept = (deptId: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptId)) {
        next.delete(deptId);
      } else {
        next.add(deptId);
      }
      return next;
    });
  };

  const openCreateDialog = (type: EntityType, parentId?: string) => {
    setEntityType(type);
    setEditingEntity(null);
    setParentDepartmentId(parentId || null);
    setFormData({
      name: "",
      code: "",
      description: "",
      is_active: true,
      company_division_id: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (type: EntityType, entity: Department | Section) => {
    setEntityType(type);
    setEditingEntity(entity);
    setParentDepartmentId(type === "section" ? (entity as Section).department_id : null);
    setFormData({
      name: entity.name,
      code: entity.code,
      description: entity.description || "",
      is_active: entity.is_active,
      company_division_id: type === "department" ? ((entity as Department).company_division_id || "") : "",
      start_date: entity.start_date,
      end_date: entity.end_date || "",
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (type: EntityType, entity: Department | Section) => {
    setEntityType(type);
    setEditingEntity(entity);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and code are required");
      return;
    }

    if (!formData.start_date) {
      toast.error("Start date is required");
      return;
    }

    if (formData.end_date && formData.end_date < formData.start_date) {
      toast.error("End date cannot be before start date");
      return;
    }

    setIsSaving(true);
    try {
      if (entityType === "department") {
        const departmentData = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          company_id: selectedCompanyId,
          company_division_id: formData.company_division_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
        };

        if (editingEntity) {
          const { error } = await supabase
            .from("departments")
            .update(departmentData)
            .eq("id", editingEntity.id);
          if (error) throw error;
          toast.success("Department updated successfully");
        } else {
          const { error } = await supabase
            .from("departments")
            .insert(departmentData);
          if (error) throw error;
          toast.success("Department created successfully");
        }
      } else {
        const sectionData = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim() || null,
          is_active: formData.is_active,
          department_id: parentDepartmentId!,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
        };

        if (editingEntity) {
          const { error } = await supabase
            .from("sections")
            .update(sectionData)
            .eq("id", editingEntity.id);
          if (error) throw error;
          toast.success("Section updated successfully");
        } else {
          const { error } = await supabase
            .from("sections")
            .insert(sectionData);
          if (error) throw error;
          toast.success("Section created successfully");
        }
      }

      setDialogOpen(false);
      // Refresh data
      const { data: depts } = await supabase
        .from("departments")
        .select("id, name, code, description, is_active, company_division_id, start_date, end_date")
        .eq("company_id", selectedCompanyId)
        .order("name");

      if (depts) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name, code, description, is_active, department_id, start_date, end_date")
          .in("department_id", depts.map(d => d.id))
          .order("name");

        const departmentsWithSections = depts.map(dept => ({
          ...dept,
          sections: sections?.filter(s => s.department_id === dept.id) || []
        }));

        setDepartments(departmentsWithSections);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEntity) return;

    setIsSaving(true);
    try {
      if (entityType === "department") {
        // Check for sections
        const dept = editingEntity as Department;
        if (dept.sections && dept.sections.length > 0) {
          toast.error("Cannot delete department with sections. Remove sections first.");
          setDeleteDialogOpen(false);
          setIsSaving(false);
          return;
        }

        const { error } = await supabase
          .from("departments")
          .delete()
          .eq("id", editingEntity.id);
        if (error) throw error;
        toast.success("Department deleted successfully");
      } else {
        const { error } = await supabase
          .from("sections")
          .delete()
          .eq("id", editingEntity.id);
        if (error) throw error;
        toast.success("Section deleted successfully");
      }

      setDeleteDialogOpen(false);
      // Refresh data
      const { data: depts } = await supabase
        .from("departments")
        .select("id, name, code, description, is_active, company_division_id, start_date, end_date")
        .eq("company_id", selectedCompanyId)
        .order("name");

      if (depts) {
        const { data: sections } = await supabase
          .from("sections")
          .select("id, name, code, description, is_active, department_id, start_date, end_date")
          .in("department_id", depts.map(d => d.id))
          .order("name");

        const departmentsWithSections = depts.map(dept => ({
          ...dept,
          sections: sections?.filter(s => s.department_id === dept.id) || []
        }));

        setDepartments(departmentsWithSections);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateDisplay = (date: string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Workforce", href: "/workforce" },
          { label: "Departments" }
        ]} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FolderTree className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Departments
              </h1>
              <p className="text-muted-foreground">
                Manage departments and sections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="asOfDate" className="text-sm whitespace-nowrap">As of:</Label>
              <Input
                id="asOfDate"
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAdmin && selectedCompanyId && (
              <Button onClick={() => openCreateDialog("department")} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Department
              </Button>
            )}
          </div>
        </div>

        {asOfDate !== format(new Date(), "yyyy-MM-dd") && (
          <div className="rounded-lg border border-info/30 bg-info/10 px-4 py-2 text-sm text-info-foreground">
            Showing departments as of <strong>{format(new Date(asOfDate), "MMMM d, yyyy")}</strong>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No departments found</h3>
            <p className="mt-2 text-muted-foreground">
              {isAdmin ? "Get started by creating a department." : "No departments have been created for this company."}
            </p>
            {isAdmin && (
              <Button onClick={() => openCreateDialog("department")} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create Department
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDepartments.map((dept) => (
              <div key={dept.id} className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <button
                    onClick={() => toggleDept(dept.id)}
                    className="flex items-center gap-3 flex-1"
                  >
                    {dept.sections.length > 0 ? (
                      expandedDepts.has(dept.id) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                    <FolderTree className="h-5 w-5 text-warning" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{dept.name}</p>
                      <p className="text-sm text-muted-foreground">{dept.code}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateDisplay(dept.start_date)}
                      {dept.end_date && ` - ${formatDateDisplay(dept.end_date)}`}
                    </Badge>
                    {dept.sections.length > 0 && (
                      <Badge variant="secondary" className="gap-1">
                        <Users className="h-3 w-3" />
                        {dept.sections.length} sections
                      </Badge>
                    )}
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openCreateDialog("section", dept.id)}
                          title="Add Section"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog("department", dept)}
                          title="Edit Department"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog("department", dept)}
                          title="Delete Department"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {expandedDepts.has(dept.id) && dept.sections.length > 0 && (
                  <div className="border-t border-border bg-muted/30">
                    {dept.sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between px-4 py-3 pl-12 border-b border-border last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{section.name}</p>
                            <p className="text-sm text-muted-foreground">{section.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateDisplay(section.start_date)}
                            {section.end_date && ` - ${formatDateDisplay(section.end_date)}`}
                          </Badge>
                          <Badge variant={section.is_active ? "outline" : "secondary"}>
                            {section.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog("section", section)}
                                title="Edit Section"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog("section", section)}
                                title="Delete Section"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntity ? "Edit" : "Create"} {entityType === "department" ? "Department" : "Section"}
            </DialogTitle>
            <DialogDescription>
              {editingEntity
                ? `Update the ${entityType} details below.`
                : `Add a new ${entityType} to the organization.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${entityType} name`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., HR, FIN, IT"
                maxLength={20}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={`Optional description for this ${entityType}`}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  placeholder="Leave empty for ongoing"
                />
              </div>
            </div>
            {entityType === "department" && divisions.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="division">Division (Optional)</Label>
                <Select
                  value={formData.company_division_id}
                  onValueChange={(value) => setFormData({ ...formData, company_division_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Division</SelectItem>
                    {divisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name} ({div.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingEntity ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {entityType === "department" ? "Department" : "Section"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{editingEntity?.name}"? This action cannot be undone.
              {entityType === "department" && (
                <span className="block mt-2 text-warning">
                  Note: Departments with sections cannot be deleted. Remove all sections first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSaving}
            >
              {isSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
