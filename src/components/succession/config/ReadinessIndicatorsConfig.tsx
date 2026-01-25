import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Pencil, Trash2, Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useReadinessAssessment, ReadinessAssessmentIndicator, ReadinessAssessmentCategory, ReadinessAssessmentForm } from "@/hooks/succession/useReadinessAssessment";

interface ReadinessIndicatorsConfigProps {
  companyId: string;
}

const ASSESSOR_TYPES = [
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
  { value: "executive", label: "Executive" },
];

const DEFAULT_INDICATORS = [
  // Strategic Mindset
  { category: "Strategic Mindset", indicator: "Forward-looking and thinks strategically", weight: 4 },
  { category: "Strategic Mindset", indicator: "Takes a broad view of the business", weight: 4 },
  { category: "Strategic Mindset", indicator: "Brings new ideas to problems", weight: 4 },
  { category: "Strategic Mindset", indicator: "Identifies trends and positions for opportunities", weight: 4 },
  { category: "Strategic Mindset", indicator: "Anticipates future challenges and plans accordingly", weight: 4 },
  // Leadership
  { category: "Leadership", indicator: "Develops and enables others", weight: 4 },
  { category: "Leadership", indicator: "Keeps team members engaged and motivated", weight: 4 },
  { category: "Leadership", indicator: "Inspires confidence and trust", weight: 4 },
  { category: "Leadership", indicator: "Creates a culture of accountability", weight: 4 },
  { category: "Leadership", indicator: "Demonstrates inclusive leadership behaviors", weight: 4 },
  // Business Acumen
  { category: "Business Acumen", indicator: "Understands financial drivers of the business", weight: 3 },
  { category: "Business Acumen", indicator: "Makes data-driven decisions", weight: 3 },
  { category: "Business Acumen", indicator: "Balances short-term results with long-term goals", weight: 3 },
  { category: "Business Acumen", indicator: "Understands competitive landscape", weight: 3 },
  // Change Management
  { category: "Change Management", indicator: "Embraces and drives change", weight: 3 },
  { category: "Change Management", indicator: "Helps others adapt to new situations", weight: 3 },
  { category: "Change Management", indicator: "Remains effective under ambiguity", weight: 3 },
  { category: "Change Management", indicator: "Champions innovation and continuous improvement", weight: 3 },
  // Technical/Functional
  { category: "Technical/Functional", indicator: "Demonstrates deep functional expertise", weight: 3 },
  { category: "Technical/Functional", indicator: "Stays current with industry developments", weight: 3 },
  { category: "Technical/Functional", indicator: "Applies technical knowledge effectively", weight: 3 },
  // Interpersonal
  { category: "Interpersonal", indicator: "Builds strong relationships across the organization", weight: 3 },
  { category: "Interpersonal", indicator: "Communicates clearly and persuasively", weight: 3 },
  { category: "Interpersonal", indicator: "Collaborates effectively with diverse teams", weight: 3 },
  { category: "Interpersonal", indicator: "Resolves conflicts constructively", weight: 3 },
  // Results Orientation
  { category: "Results Orientation", indicator: "Consistently delivers on commitments", weight: 4 },
  { category: "Results Orientation", indicator: "Sets and achieves ambitious goals", weight: 4 },
  { category: "Results Orientation", indicator: "Overcomes obstacles to achieve results", weight: 4 },
  { category: "Results Orientation", indicator: "Maintains high standards of quality", weight: 4 },
  // Learning Agility
  { category: "Learning Agility", indicator: "Learns quickly from new experiences", weight: 3 },
  { category: "Learning Agility", indicator: "Seeks feedback and acts on it", weight: 3 },
];

export function ReadinessIndicatorsConfig({ companyId }: ReadinessIndicatorsConfigProps) {
  const { fetchForms, fetchCategories, fetchIndicators, createCategory, createIndicator, updateIndicator, deleteIndicator } = useReadinessAssessment(companyId);
  
  const [forms, setForms] = useState<ReadinessAssessmentForm[]>([]);
  const [categories, setCategories] = useState<ReadinessAssessmentCategory[]>([]);
  const [indicators, setIndicators] = useState<ReadinessAssessmentIndicator[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<ReadinessAssessmentIndicator | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [indicatorToDelete, setIndicatorToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    indicator_name: "",
    category_id: "",
    assessor_type: "manager",
    weight_percent: 1,
    rating_scale_max: 5,
    scoring_guide_low: "",
    scoring_guide_mid: "",
    scoring_guide_high: "",
  });

  useEffect(() => {
    loadForms();
    loadCategories();
  }, [companyId]);

  useEffect(() => {
    if (selectedFormId) {
      loadIndicators(selectedFormId);
    }
  }, [selectedFormId]);

  const loadForms = async () => {
    const data = await fetchForms();
    setForms(data);
    if (data.length > 0 && !selectedFormId) {
      setSelectedFormId(data[0].id);
    }
  };

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data);
  };

  const loadIndicators = async (formId: string) => {
    setLoading(true);
    const data = await fetchIndicators(formId);
    setIndicators(data);
    setLoading(false);
  };

  const handleOpenDialog = (indicator?: ReadinessAssessmentIndicator) => {
    if (indicator) {
      setEditingIndicator(indicator);
      setFormData({
        indicator_name: indicator.indicator_name,
        category_id: indicator.category_id || "",
        assessor_type: indicator.assessor_type,
        weight_percent: indicator.weight_percent,
        rating_scale_max: indicator.rating_scale_max,
        scoring_guide_low: indicator.scoring_guide_low || "",
        scoring_guide_mid: indicator.scoring_guide_mid || "",
        scoring_guide_high: indicator.scoring_guide_high || "",
      });
    } else {
      setEditingIndicator(null);
      setFormData({
        indicator_name: "",
        category_id: "",
        assessor_type: "manager",
        weight_percent: 1,
        rating_scale_max: 5,
        scoring_guide_low: "",
        scoring_guide_mid: "",
        scoring_guide_high: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.indicator_name.trim() || !selectedFormId) return;

    setLoading(true);
    try {
      if (editingIndicator) {
        await updateIndicator(editingIndicator.id, {
          indicator_name: formData.indicator_name,
          category_id: formData.category_id || null,
          assessor_type: formData.assessor_type,
          weight_percent: formData.weight_percent,
          rating_scale_max: formData.rating_scale_max,
          scoring_guide_low: formData.scoring_guide_low || null,
          scoring_guide_mid: formData.scoring_guide_mid || null,
          scoring_guide_high: formData.scoring_guide_high || null,
        });
        toast.success("Indicator updated");
      } else {
        await createIndicator({
          form_id: selectedFormId,
          indicator_name: formData.indicator_name,
          category_id: formData.category_id || null,
          assessor_type: formData.assessor_type,
          weight_percent: formData.weight_percent,
          rating_scale_max: formData.rating_scale_max,
          scoring_guide_low: formData.scoring_guide_low || null,
          scoring_guide_mid: formData.scoring_guide_mid || null,
          scoring_guide_high: formData.scoring_guide_high || null,
          sort_order: indicators.length,
        });
        toast.success("Indicator created");
      }
      await loadIndicators(selectedFormId);
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!indicatorToDelete) return;

    setLoading(true);
    try {
      await deleteIndicator(indicatorToDelete);
      await loadIndicators(selectedFormId);
      setDeleteDialogOpen(false);
      setIndicatorToDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    if (!selectedFormId) {
      toast.error("Please select a form first");
      return;
    }

    setSeeding(true);
    try {
      // Create categories first
      const uniqueCategories = [...new Set(DEFAULT_INDICATORS.map(i => i.category))];
      const categoryMap: Record<string, string> = {};
      
      for (let i = 0; i < uniqueCategories.length; i++) {
        const catName = uniqueCategories[i];
        const existing = categories.find(c => c.category_name === catName);
        if (existing) {
          categoryMap[catName] = existing.id;
        } else {
          const created = await createCategory({
            form_id: selectedFormId,
            category_name: catName,
            sort_order: i,
          });
          if (created) {
            categoryMap[catName] = created.id;
          }
        }
      }

      // Create indicators
      for (let i = 0; i < DEFAULT_INDICATORS.length; i++) {
        const def = DEFAULT_INDICATORS[i];
        await createIndicator({
          form_id: selectedFormId,
          category_id: categoryMap[def.category],
          indicator_name: def.indicator,
          assessor_type: "manager",
          weight_percent: def.weight,
          rating_scale_max: 5,
          sort_order: i,
        });
      }

      await loadCategories();
      await loadIndicators(selectedFormId);
      toast.success(`Created ${DEFAULT_INDICATORS.length} indicators`);
    } catch (error: any) {
      toast.error("Failed to seed indicators: " + error.message);
    } finally {
      setSeeding(false);
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "-";
    const cat = categories.find(c => c.id === categoryId);
    return cat?.category_name || "-";
  };

  const getAssessorLabel = (type: string) => {
    return ASSESSOR_TYPES.find(a => a.value === type)?.label || type;
  };

  const groupedIndicators = indicators.reduce((acc, ind) => {
    const catName = getCategoryName(ind.category_id);
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(ind);
    return acc;
  }, {} as Record<string, ReadinessAssessmentIndicator[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedFormId} onValueChange={setSelectedFormId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a form" />
            </SelectTrigger>
            <SelectContent>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {forms.length === 0 && (
            <p className="text-sm text-muted-foreground">Create a form first in the Forms tab</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDefaults}
            disabled={!selectedFormId || seeding}
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Seed Default Indicators
          </Button>
          <Button onClick={() => handleOpenDialog()} disabled={!selectedFormId}>
            <Plus className="h-4 w-4 mr-2" />
            Add Indicator
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : indicators.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {selectedFormId 
            ? "No indicators configured. Click 'Seed Default Indicators' to get started."
            : "Select a form to view indicators"}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedIndicators).map(([category, categoryIndicators]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                {category} ({categoryIndicators.length})
              </h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicator</TableHead>
                    <TableHead className="w-24">Assessor</TableHead>
                    <TableHead className="w-20 text-center">Weight</TableHead>
                    <TableHead className="w-20 text-center">Scale</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryIndicators.map((indicator) => (
                    <TableRow key={indicator.id}>
                      <TableCell className="font-medium">{indicator.indicator_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getAssessorLabel(indicator.assessor_type)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{indicator.weight_percent}%</TableCell>
                      <TableCell className="text-center">1-{indicator.rating_scale_max}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(indicator)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setIndicatorToDelete(indicator.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingIndicator ? "Edit Indicator" : "Add Indicator"}</DialogTitle>
            <DialogDescription>
              Configure a readiness assessment indicator with scoring guides.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Indicator Question *</Label>
              <Textarea
                value={formData.indicator_name}
                onChange={(e) => setFormData({ ...formData, indicator_name: e.target.value })}
                placeholder="e.g., Demonstrates strategic thinking and forward planning"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assessor Type</Label>
                <Select
                  value={formData.assessor_type}
                  onValueChange={(v) => setFormData({ ...formData, assessor_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSESSOR_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.weight_percent}
                  onChange={(e) => setFormData({ ...formData, weight_percent: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Rating Scale Max</Label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={formData.rating_scale_max}
                  onChange={(e) => setFormData({ ...formData, rating_scale_max: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scoring Guide - Low (1)</Label>
              <Input
                value={formData.scoring_guide_low}
                onChange={(e) => setFormData({ ...formData, scoring_guide_low: e.target.value })}
                placeholder="What a low rating means..."
              />
            </div>

            <div className="space-y-2">
              <Label>Scoring Guide - Mid ({Math.ceil(formData.rating_scale_max / 2)})</Label>
              <Input
                value={formData.scoring_guide_mid}
                onChange={(e) => setFormData({ ...formData, scoring_guide_mid: e.target.value })}
                placeholder="What a mid rating means..."
              />
            </div>

            <div className="space-y-2">
              <Label>Scoring Guide - High ({formData.rating_scale_max})</Label>
              <Input
                value={formData.scoring_guide_high}
                onChange={(e) => setFormData({ ...formData, scoring_guide_high: e.target.value })}
                placeholder="What a high rating means..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.indicator_name.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingIndicator ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Indicator?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this indicator. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
