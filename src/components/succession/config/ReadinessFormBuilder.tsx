import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2, FileText, Eye, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { useReadinessAssessment, ReadinessAssessmentForm, ReadinessAssessmentCategory, ReadinessAssessmentIndicator } from "@/hooks/succession/useReadinessAssessment";
import { supabase } from "@/integrations/supabase/client";

interface ReadinessFormBuilderProps {
  companyId: string;
}

interface StaffType {
  id: string;
  type_name: string;
}

export function ReadinessFormBuilder({ companyId }: ReadinessFormBuilderProps) {
  const { fetchForms, createForm, updateForm, fetchCategories, createCategory, fetchIndicators } = useReadinessAssessment(companyId);
  
  const [forms, setForms] = useState<ReadinessAssessmentForm[]>([]);
  const [categories, setCategories] = useState<ReadinessAssessmentCategory[]>([]);
  const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState<ReadinessAssessmentForm | null>(null);
  const [previewIndicators, setPreviewIndicators] = useState<ReadinessAssessmentIndicator[]>([]);
  const [editingForm, setEditingForm] = useState<ReadinessAssessmentForm | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    staff_type: "",
    is_active: true,
  });

  const [categoryData, setCategoryData] = useState({
    category_name: "",
    form_id: "",
    sort_order: 0,
  });

  useEffect(() => {
    loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsData, categoriesData] = await Promise.all([
        fetchForms(),
        fetchCategories(),
      ]);
      setForms(formsData);
      setCategories(categoriesData);

      // Fetch staff types
      const { data: stData } = await (supabase
        .from("staff_types" as any)
        .select("id, type_name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("type_name") as any);
      setStaffTypes((stData || []) as StaffType[]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFormDialog = (form?: ReadinessAssessmentForm) => {
    if (form) {
      setEditingForm(form);
      setFormData({
        name: form.name,
        description: form.description || "",
        staff_type: form.staff_type || "",
        is_active: form.is_active,
      });
    } else {
      setEditingForm(null);
      setFormData({
        name: "",
        description: "",
        staff_type: "",
        is_active: true,
      });
    }
    setFormDialogOpen(true);
  };

  const handleSaveForm = async () => {
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      if (editingForm) {
        await updateForm(editingForm.id, {
          name: formData.name,
          description: formData.description || null,
          staff_type: formData.staff_type || null,
          is_active: formData.is_active,
        });
        toast.success("Form updated");
      } else {
        await createForm({
          name: formData.name,
          description: formData.description || null,
          staff_type: formData.staff_type || null,
          is_active: formData.is_active,
        });
        toast.success("Form created");
      }
      await loadData();
      setFormDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!formToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("readiness_assessment_forms")
        .delete()
        .eq("id", formToDelete);

      if (error) throw error;
      toast.success("Form deleted");
      await loadData();
      setDeleteDialogOpen(false);
      setFormToDelete(null);
    } catch (error: any) {
      toast.error("Failed to delete form: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCategoryDialog = (formId: string) => {
    setCategoryData({
      category_name: "",
      form_id: formId,
      sort_order: categories.filter(c => c.form_id === formId).length,
    });
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryData.category_name.trim() || !categoryData.form_id) return;

    setLoading(true);
    try {
      await createCategory({
        form_id: categoryData.form_id,
        category_name: categoryData.category_name,
        sort_order: categoryData.sort_order,
      });
      toast.success("Category created");
      await loadData();
      setCategoryDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewForm = async (form: ReadinessAssessmentForm) => {
    setPreviewForm(form);
    const indicators = await fetchIndicators(form.id);
    setPreviewIndicators(indicators);
    setPreviewDialogOpen(true);
  };

  const getStaffTypeName = (staffType: string | null) => {
    if (!staffType) return "All Staff Types";
    const st = staffTypes.find(s => s.id === staffType);
    return st?.type_name || staffType;
  };

  const getFormCategories = (formId: string) => {
    return categories.filter(c => c.form_id === formId);
  };

  const getIndicatorCount = (formId: string) => {
    // We don't have a quick way to get this without fetching, so we'll show categories count
    return getFormCategories(formId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Readiness Assessment Forms</h3>
          <p className="text-sm text-muted-foreground">
            Create forms to group indicators for different staff types
          </p>
        </div>
        <Button onClick={() => handleOpenFormDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No forms created yet</p>
            <p className="text-sm">Create a form to start building readiness assessments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const formCategories = getFormCategories(form.id);
            return (
              <Card key={form.id} className={!form.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {form.name}
                        {!form.is_active && (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {getStaffTypeName(form.staff_type)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handlePreviewForm(form)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenFormDialog(form)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormToDelete(form.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {form.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {form.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Categories</span>
                      <span className="font-medium">{formCategories.length}</span>
                    </div>
                    
                    {formCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formCategories.slice(0, 3).map((cat) => (
                          <Badge key={cat.id} variant="outline" className="text-xs">
                            {cat.category_name}
                          </Badge>
                        ))}
                        {formCategories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{formCategories.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => handleOpenCategoryDialog(form.id)}
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingForm ? "Edit Form" : "Create Form"}</DialogTitle>
            <DialogDescription>
              Configure a readiness assessment form for your organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Form Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Executive Readiness Assessment"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this assessment form..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Staff Type (optional)</Label>
              <Select
                value={formData.staff_type}
                onValueChange={(v) => setFormData({ ...formData, staff_type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All staff types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Staff Types</SelectItem>
                  {staffTypes.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.type_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Optionally restrict this form to a specific staff type
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-xs text-muted-foreground">Enable this form for use</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveForm} disabled={!formData.name.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingForm ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>
              Create a category to group related indicators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input
                value={categoryData.category_name}
                onChange={(e) => setCategoryData({ ...categoryData, category_name: e.target.value })}
                placeholder="e.g., Leadership, Strategic Thinking"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryData.category_name.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview: {previewForm?.name}</DialogTitle>
            <DialogDescription>
              {previewForm?.description || "Preview of the assessment form structure"}
            </DialogDescription>
          </DialogHeader>

          {previewIndicators.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No indicators configured for this form yet.
              <br />
              Go to the Indicators tab to add questions.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                previewIndicators.reduce((acc, ind) => {
                  const catName = ind.category?.category_name || "Uncategorized";
                  if (!acc[catName]) acc[catName] = [];
                  acc[catName].push(ind);
                  return acc;
                }, {} as Record<string, ReadinessAssessmentIndicator[]>)
              ).map(([category, indicators]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-sm bg-muted px-3 py-2 rounded">
                    {category}
                  </h4>
                  <ul className="space-y-1 pl-4">
                    {indicators.map((ind) => (
                      <li key={ind.id} className="text-sm flex items-center justify-between py-1">
                        <span>{ind.indicator_name}</span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{ind.assessor_type}</Badge>
                          <span>{ind.weight_percent}%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this form and all its associated categories and indicators.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteForm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
