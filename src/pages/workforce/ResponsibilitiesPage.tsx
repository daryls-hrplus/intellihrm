import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ClipboardList,
  ChevronLeft,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getTodayString } from "@/utils/dateUtils";
import { useLanguage } from "@/hooks/useLanguage";
import { ResponsibilityCategoryBadge, getCategoryOptions, ResponsibilityCategory } from "@/components/workforce/ResponsibilityCategoryBadge";
import { ComplexityLevelIndicator, getComplexityLevelOptions } from "@/components/workforce/ComplexityLevelIndicator";
import { useResponsibilityAI } from "@/hooks/useResponsibilityAI";

interface Responsibility {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  category: ResponsibilityCategory | null;
  complexity_level: number | null;
  key_result_areas: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  companies?: { name: string; code: string };
}

interface Company {
  id: string;
  name: string;
  code: string;
}

const emptyForm = {
  name: "",
  code: "",
  description: "",
  category: "" as ResponsibilityCategory | "",
  complexity_level: null as number | null,
  key_result_areas: [] as string[],
  company_id: "",
  start_date: getTodayString(),
  end_date: "",
  is_active: true,
};

export default function ResponsibilitiesPage() {
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResponsibility, setSelectedResponsibility] = useState<Responsibility | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [newKRA, setNewKRA] = useState("");

  const { logAction } = useAuditLog();
  const { t } = useLanguage();
  const { isGenerating, generateDescription, suggestKRAs, enrichAll } = useResponsibilityAI();

  const categoryOptions = getCategoryOptions();
  const complexityOptions = getComplexityLevelOptions();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchResponsibilities();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching companies:", error);
      toast.error(t("workforce.responsibilities.failedToLoad"));
    } else {
      setCompanies(data || []);
      if (data && data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchResponsibilities = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("responsibilities")
      .select(`
        *,
        companies(name, code)
      `)
      .eq("company_id", selectedCompanyId)
      .order("name");

    if (error) {
      console.error("Error fetching responsibilities:", error);
      toast.error(t("workforce.responsibilities.failedToLoad"));
    } else {
      const mapped = (data || []).map((r: any) => ({
        ...r,
        key_result_areas: Array.isArray(r.key_result_areas) ? r.key_result_areas : [],
      }));
      setResponsibilities(mapped);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (responsibility?: Responsibility) => {
    if (responsibility) {
      setSelectedResponsibility(responsibility);
      setFormData({
        name: responsibility.name,
        code: responsibility.code,
        description: responsibility.description || "",
        category: responsibility.category || "",
        complexity_level: responsibility.complexity_level,
        key_result_areas: responsibility.key_result_areas || [],
        company_id: responsibility.company_id,
        start_date: responsibility.start_date,
        end_date: responsibility.end_date || "",
        is_active: responsibility.is_active,
      });
    } else {
      setSelectedResponsibility(null);
      setFormData({ ...emptyForm, company_id: selectedCompanyId });
    }
    setNewKRA("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error(t("workforce.responsibilities.nameRequired"));
      return;
    }
    if (!formData.company_id) {
      toast.error(t("workforce.responsibilities.companyRequired"));
      return;
    }
    if (!formData.start_date) {
      toast.error(t("workforce.responsibilities.startDateRequired"));
      return;
    }

    setIsSaving(true);
    const payload = {
      company_id: formData.company_id,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      category: formData.category || null,
      complexity_level: formData.complexity_level,
      key_result_areas: formData.key_result_areas,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    try {
      if (selectedResponsibility) {
        const { error } = await supabase
          .from("responsibilities")
          .update(payload)
          .eq("id", selectedResponsibility.id);

        if (error) throw error;

        await logAction({ action: "UPDATE", entityType: "responsibilities", entityId: selectedResponsibility.id, entityName: formData.name });
        toast.success(t("workforce.responsibilities.responsibilityUpdated"));
      } else {
        const { error } = await supabase.from("responsibilities").insert(payload);

        if (error) throw error;

        await logAction({ action: "CREATE", entityType: "responsibilities", entityName: formData.name });
        toast.success(t("workforce.responsibilities.responsibilityCreated"));
      }

      setDialogOpen(false);
      fetchResponsibilities();
    } catch (error: any) {
      console.error("Error saving responsibility:", error);
      if (error.code === "23505") {
        toast.error(t("workforce.responsibilities.codeExists"));
      } else {
        toast.error(t("workforce.responsibilities.failedToSave"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResponsibility) return;

    try {
      const { error } = await supabase
        .from("responsibilities")
        .delete()
        .eq("id", selectedResponsibility.id);

      if (error) throw error;

      await logAction({ action: "DELETE", entityType: "responsibilities", entityId: selectedResponsibility.id, entityName: selectedResponsibility.name });
      toast.success(t("workforce.responsibilities.responsibilityDeleted"));
      setDeleteDialogOpen(false);
      fetchResponsibilities();
    } catch (error) {
      console.error("Error deleting responsibility:", error);
      toast.error(t("workforce.responsibilities.failedToDelete"));
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a responsibility name first");
      return;
    }

    const description = await generateDescription({
      name: formData.name,
      category: formData.category || undefined,
      existingDescription: formData.description || undefined,
    });

    if (description) {
      setFormData({ ...formData, description });
      toast.success("Description generated");
    } else {
      toast.error("Failed to generate description");
    }
  };

  const handleSuggestKRAs = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a responsibility name first");
      return;
    }

    const kras = await suggestKRAs({
      name: formData.name,
      category: formData.category || undefined,
      description: formData.description || undefined,
    });

    if (kras && kras.length > 0) {
      setFormData({ ...formData, key_result_areas: [...formData.key_result_areas, ...kras] });
      toast.success(`${kras.length} KRAs suggested`);
    } else {
      toast.error("Failed to suggest KRAs");
    }
  };

  const handleEnrichAll = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a responsibility name first");
      return;
    }

    const result = await enrichAll({
      name: formData.name,
      category: formData.category || undefined,
      existingDescription: formData.description || undefined,
    });

    if (result) {
      setFormData({
        ...formData,
        description: result.description || formData.description,
        key_result_areas: result.kras.length > 0 ? result.kras : formData.key_result_areas,
        category: result.suggestedCategory as ResponsibilityCategory || formData.category,
        complexity_level: result.complexity || formData.complexity_level,
      });
      toast.success("Responsibility enriched with AI suggestions");
    } else {
      toast.error("Failed to enrich responsibility");
    }
  };

  const addKRA = () => {
    if (newKRA.trim()) {
      setFormData({
        ...formData,
        key_result_areas: [...formData.key_result_areas, newKRA.trim()],
      });
      setNewKRA("");
    }
  };

  const removeKRA = (index: number) => {
    setFormData({
      ...formData,
      key_result_areas: formData.key_result_areas.filter((_, i) => i !== index),
    });
  };

  const filteredResponsibilities = responsibilities.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/workforce" className="hover:text-foreground">
            {t("navigation.workforce")}
          </NavLink>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">{t("workforce.responsibilities.breadcrumb")}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("workforce.responsibilities.title")}</h1>
              <p className="text-muted-foreground">
                {t("workforce.responsibilities.subtitle")}
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            {t("workforce.responsibilities.addResponsibility")}
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder={t("workforce.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("workforce.responsibilities.searchResponsibilities")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.code")}</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Complexity</TableHead>
                <TableHead>KRAs</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredResponsibilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? t("workforce.responsibilities.noMatchingSearch") : t("workforce.responsibilities.createToStart")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponsibilities.map((responsibility) => (
                  <TableRow key={responsibility.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{responsibility.name}</span>
                        {responsibility.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {responsibility.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{responsibility.code}</TableCell>
                    <TableCell>
                      <ResponsibilityCategoryBadge category={responsibility.category} size="sm" />
                    </TableCell>
                    <TableCell>
                      <ComplexityLevelIndicator level={responsibility.complexity_level} size="sm" />
                    </TableCell>
                    <TableCell>
                      {responsibility.key_result_areas.length > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          {responsibility.key_result_areas.length} KRAs
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={responsibility.is_active ? "default" : "secondary"}>
                        {responsibility.is_active ? t("common.active") : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(responsibility)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedResponsibility(responsibility);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedResponsibility ? t("workforce.responsibilities.editResponsibility") : t("workforce.responsibilities.createResponsibility")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* AI Enrich Button */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEnrichAll}
                  disabled={isGenerating || !formData.name.trim()}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  AI Enrich All Fields
                </Button>
              </div>

              <div className="space-y-2">
                <Label>{t("common.company")} *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("workforce.selectCompany")} />
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
                  <Label>{t("common.name")} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Budget Management"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.code")} *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., BUDGMGT"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category || "none"}
                    onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? "" : value as ResponsibilityCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Complexity Level</Label>
                  <Select
                    value={formData.complexity_level?.toString() || "none"}
                    onValueChange={(value) => setFormData({ ...formData, complexity_level: value === "none" ? null : parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select complexity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Set</SelectItem>
                      {complexityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("common.description")}</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || !formData.name.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    Generate
                  </Button>
                </div>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this responsibility..."
                  rows={3}
                />
              </div>

              {/* Key Result Areas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Key Result Areas (KRAs)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSuggestKRAs}
                    disabled={isGenerating || !formData.name.trim()}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    Suggest KRAs
                  </Button>
                </div>
                
                {formData.key_result_areas.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {formData.key_result_areas.map((kra, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded-md">
                        <Target className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm">{kra}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => removeKRA(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={newKRA}
                    onChange={(e) => setNewKRA(e.target.value)}
                    placeholder="Add a measurable KRA..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKRA())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addKRA}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Define measurable outcomes for this responsibility
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("common.startDate")} *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("common.endDate")}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>{t("common.active")}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedResponsibility ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("workforce.responsibilities.deleteResponsibility")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("workforce.responsibilities.deleteConfirm", { name: selectedResponsibility?.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
