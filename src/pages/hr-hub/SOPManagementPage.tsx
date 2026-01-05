import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, FileText, Folder, Trash2, Edit, Eye, ChevronLeft, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Company {
  id: string;
  name: string;
}

interface SOPCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  company_id: string | null;
}

interface SOPDocument {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  version: string;
  task_type: string | null;
  applicable_roles: string[] | null;
  steps: any[] | null;
  is_global: boolean;
  is_active: boolean;
  processing_status: string;
  effective_date: string | null;
  expiry_date: string | null;
  category_id: string | null;
  company_id: string | null;
  created_at: string;
  sop_categories?: { name: string } | null;
}

const TASK_TYPES = [
  { value: "leave_request", label: "Leave Request" },
  { value: "expense_claim", label: "Expense Claim" },
  { value: "onboarding", label: "Onboarding" },
  { value: "offboarding", label: "Offboarding" },
  { value: "recruitment", label: "Recruitment" },
  { value: "performance_review", label: "Performance Review" },
  { value: "training", label: "Training" },
  { value: "payroll", label: "Payroll" },
  { value: "benefits", label: "Benefits" },
  { value: "general", label: "General" },
];

export default function SOPManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const [selectedCompany, setSelectedCompany] = useState<string>(company?.id || "");
  const [activeTab, setActiveTab] = useState("documents");
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [showCatDialog, setShowCatDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<SOPDocument | null>(null);
  const [editingCat, setEditingCat] = useState<SOPCategory | null>(null);

  // Fetch companies for filter
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Company[];
    },
    enabled: isAdminOrHR,
  });

  // Form states
  const [docForm, setDocForm] = useState({
    title: "",
    description: "",
    content: "",
    version: "1.0",
    task_type: "",
    category_id: "",
    is_global: false,
    effective_date: "",
    steps: [] as { order: number; instruction: string; notes: string }[],
  });

  const [catForm, setCatForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["sop-categories", selectedCompany],
    queryFn: async () => {
      let query = supabase
        .from("sop_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (selectedCompany) {
        query = query.or(`company_id.eq.${selectedCompany},company_id.is.null`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SOPCategory[];
    },
  });

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["sop-documents", selectedCompany],
    queryFn: async () => {
      let query = supabase
        .from("sop_documents")
        .select("*, sop_categories(name)")
        .eq("is_active", true)
        .order("title");
      
      if (selectedCompany) {
        query = query.or(`company_id.eq.${selectedCompany},is_global.eq.true`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SOPDocument[];
    },
  });

  // Create/Update document mutation
  const docMutation = useMutation({
    mutationFn: async (data: typeof docForm & { id?: string }) => {
      const payload = {
        title: data.title,
        description: data.description || null,
        content: data.content || null,
        version: data.version,
        task_type: data.task_type || null,
        category_id: data.category_id || null,
        is_global: data.is_global,
        effective_date: data.effective_date || null,
        steps: data.steps.length > 0 ? data.steps : null,
        processing_status: "completed",
        company_id: data.is_global ? null : (selectedCompany || company?.id || null),
      };

      if (data.id) {
        const { error } = await supabase
          .from("sop_documents")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sop_documents")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sop-documents"] });
      setShowDocDialog(false);
      resetDocForm();
      toast.success(editingDoc ? "SOP updated" : "SOP created");
    },
    onError: (error) => {
      toast.error("Failed to save SOP: " + error.message);
    },
  });

  // Create/Update category mutation
  const catMutation = useMutation({
    mutationFn: async (data: typeof catForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("sop_categories")
          .update({ name: data.name, code: data.code, description: data.description || null })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("sop_categories")
          .insert({ 
            name: data.name, 
            code: data.code, 
            description: data.description || null,
            company_id: selectedCompany || company?.id || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sop-categories"] });
      setShowCatDialog(false);
      resetCatForm();
      toast.success(editingCat ? "Category updated" : "Category created");
    },
    onError: (error) => {
      toast.error("Failed to save category: " + error.message);
    },
  });

  // Delete mutations
  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sop_documents")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sop-documents"] });
      toast.success("SOP deleted");
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("sop_categories")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sop-categories"] });
      toast.success("Category deleted");
    },
  });

  const resetDocForm = () => {
    setDocForm({
      title: "",
      description: "",
      content: "",
      version: "1.0",
      task_type: "",
      category_id: "",
      is_global: false,
      effective_date: "",
      steps: [],
    });
    setEditingDoc(null);
  };

  const resetCatForm = () => {
    setCatForm({ name: "", code: "", description: "" });
    setEditingCat(null);
  };

  const handleEditDoc = (doc: SOPDocument) => {
    setEditingDoc(doc);
    setDocForm({
      title: doc.title,
      description: doc.description || "",
      content: doc.content || "",
      version: doc.version,
      task_type: doc.task_type || "",
      category_id: doc.category_id || "",
      is_global: doc.is_global,
      effective_date: doc.effective_date || "",
      steps: (doc.steps as any[]) || [],
    });
    setShowDocDialog(true);
  };

  const handleEditCat = (cat: SOPCategory) => {
    setEditingCat(cat);
    setCatForm({
      name: cat.name,
      code: cat.code,
      description: cat.description || "",
    });
    setShowCatDialog(true);
  };

  const addStep = () => {
    setDocForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { order: prev.steps.length + 1, instruction: "", notes: "" }],
    }));
  };

  const updateStep = (index: number, field: string, value: string) => {
    setDocForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const removeStep = (index: number) => {
    setDocForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 })),
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/hr-hub")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("hrHub.sopManagement.title", "SOP Management")}</h1>
          <p className="text-muted-foreground">
            {t("hrHub.sopManagement.description", "Manage Standard Operating Procedures for AI Assistant guidance")}
          </p>
        </div>
      </div>

      {isAdminOrHR && companies.length > 0 && (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("hrHub.sopManagement.documents", "SOPs")}
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            {t("hrHub.sopManagement.categories", "Categories")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetDocForm(); setShowDocDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t("hrHub.sopManagement.addSOP", "Add SOP")}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.title", "Title")}</TableHead>
                    <TableHead>{t("hrHub.sopManagement.taskType", "Task Type")}</TableHead>
                    <TableHead>{t("hrHub.sopManagement.category", "Category")}</TableHead>
                    <TableHead>{t("common.version", "Version")}</TableHead>
                    <TableHead>{t("common.status", "Status")}</TableHead>
                    <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        {TASK_TYPES.find((t) => t.value === doc.task_type)?.label || doc.task_type || "-"}
                      </TableCell>
                      <TableCell>{doc.sop_categories?.name || "-"}</TableCell>
                      <TableCell>{doc.version}</TableCell>
                      <TableCell>
                        <Badge variant={doc.is_global ? "default" : "secondary"}>
                          {doc.is_global ? "Global" : "Company"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditDoc(doc)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteDocMutation.mutate(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {documents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {t("common.noData", "No data available")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { resetCatForm(); setShowCatDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              {t("hrHub.sopManagement.addCategory", "Add Category")}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.name", "Name")}</TableHead>
                    <TableHead>{t("common.code", "Code")}</TableHead>
                    <TableHead>{t("common.description", "Description")}</TableHead>
                    <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{cat.code}</TableCell>
                      <TableCell>{cat.description || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCat(cat)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteCatMutation.mutate(cat.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        {t("common.noData", "No data available")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SOP Document Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDoc ? t("hrHub.sopManagement.editSOP", "Edit SOP") : t("hrHub.sopManagement.addSOP", "Add SOP")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.title", "Title")} *</Label>
                <Input
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Enter SOP title"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.version", "Version")}</Label>
                <Input
                  value={docForm.version}
                  onChange={(e) => setDocForm({ ...docForm, version: e.target.value })}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("hrHub.sopManagement.taskType", "Task Type")}</Label>
                <Select value={docForm.task_type} onValueChange={(v) => setDocForm({ ...docForm, task_type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("hrHub.sopManagement.category", "Category")}</Label>
                <Select value={docForm.category_id} onValueChange={(v) => setDocForm({ ...docForm, category_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.description", "Description")}</Label>
              <Textarea
                value={docForm.description}
                onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                placeholder="Brief description of this SOP"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("hrHub.sopManagement.content", "Content")}</Label>
              <Textarea
                value={docForm.content}
                onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                placeholder="Full SOP content (will be used for AI context)"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t("hrHub.sopManagement.steps", "Steps")}</Label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Step
                </Button>
              </div>
              {docForm.steps.map((step, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground w-6">{step.order}.</span>
                  <div className="flex-1 space-y-2">
                    <Input
                      value={step.instruction}
                      onChange={(e) => updateStep(index, "instruction", e.target.value)}
                      placeholder="Step instruction"
                    />
                    <Input
                      value={step.notes}
                      onChange={(e) => updateStep(index, "notes", e.target.value)}
                      placeholder="Additional notes (optional)"
                      className="text-sm"
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeStep(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("hrHub.sopManagement.effectiveDate", "Effective Date")}</Label>
                <Input
                  type="date"
                  value={docForm.effective_date}
                  onChange={(e) => setDocForm({ ...docForm, effective_date: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="is_global"
                  checked={docForm.is_global}
                  onChange={(e) => setDocForm({ ...docForm, is_global: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_global">{t("hrHub.sopManagement.globalSOP", "Global SOP (applies to all companies)")}</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocDialog(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={() => docMutation.mutate({ ...docForm, id: editingDoc?.id })}
              disabled={!docForm.title || docMutation.isPending}
            >
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={showCatDialog} onOpenChange={setShowCatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCat ? t("hrHub.sopManagement.editCategory", "Edit Category") : t("hrHub.sopManagement.addCategory", "Add Category")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name", "Name")} *</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.code", "Code")} *</Label>
              <Input
                value={catForm.code}
                onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                placeholder="Unique code"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.description", "Description")}</Label>
              <Textarea
                value={catForm.description}
                onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Category description"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCatDialog(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={() => catMutation.mutate({ ...catForm, id: editingCat?.id })}
              disabled={!catForm.name || !catForm.code || catMutation.isPending}
            >
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
