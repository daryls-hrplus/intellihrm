import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Users, GitMerge, FileText, AlertTriangle } from "lucide-react";
import { useAppraisalFormTemplates } from "@/hooks/useAppraisalFormTemplates";
import { format } from "date-fns";
import { checkCycleOverlap } from "@/utils/cycleOverlapCheck";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { formatDateForDisplay } from "@/utils/dateUtils";

// Industry-standard appraisal cycle types
const APPRAISAL_CYCLE_TYPES = [
  { value: "annual", label: "Annual Review", description: "Standard yearly performance evaluation" },
  { value: "mid_year", label: "Mid-Year Review", description: "Semi-annual check-in and feedback" },
  { value: "quarterly", label: "Quarterly Review", description: "Quarterly performance assessment" },
  { value: "probation", label: "Probation Review", description: "For employees in probationary period" },
  { value: "manager_360", label: "Manager/360 Review", description: "Leadership assessment with multi-rater feedback" },
  { value: "project_based", label: "Project-Based", description: "Review tied to project completion" },
  { value: "continuous", label: "Continuous Feedback", description: "Ongoing performance conversations" },
] as const;

type AppraisalCycleType = typeof APPRAISAL_CYCLE_TYPES[number]["value"];

interface AppraisalCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  evaluation_deadline: string | null;
  status: string;
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  min_rating: number;
  max_rating: number;
  multi_position_mode?: string;
  template_id?: string;
  cycle_type?: string;
}

interface AppraisalCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: AppraisalCycle | null;
  companyId: string | undefined;
  onSuccess: () => void;
  isProbationReview?: boolean;
  isManagerCycle?: boolean;
}

export function AppraisalCycleDialog({
  open,
  onOpenChange,
  cycle,
  companyId,
  onSuccess,
  isProbationReview = false,
  isManagerCycle = false,
}: AppraisalCycleDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const { templates } = useAppraisalFormTemplates(companyId || "");
  
  // Overlap detection state
  const [overlappingCycles, setOverlappingCycles] = useState<Array<{ id: string; name: string; start_date: string; end_date: string; cycle_type: string }>>([]);
  const [overlapAcknowledged, setOverlapAcknowledged] = useState(false);
  
  // Determine initial cycle_type based on props for backward compatibility
  const getInitialCycleType = (): AppraisalCycleType => {
    if (isProbationReview) return "probation";
    if (isManagerCycle) return "manager_360";
    return "annual";
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    evaluation_deadline: "",
    status: "draft",
    competency_weight: 40,
    responsibility_weight: 30,
    goal_weight: 30,
    min_rating: 1,
    max_rating: 5,
    multi_position_mode: "aggregate" as "aggregate" | "separate",
    template_id: "",
    cycle_type: getInitialCycleType(),
  });

  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name,
        description: cycle.description || "",
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        evaluation_deadline: cycle.evaluation_deadline || "",
        status: cycle.status,
        competency_weight: cycle.competency_weight,
        responsibility_weight: cycle.responsibility_weight,
        goal_weight: cycle.goal_weight,
        min_rating: cycle.min_rating,
        max_rating: cycle.max_rating,
        multi_position_mode: (cycle.multi_position_mode as "aggregate" | "separate") || "aggregate",
        template_id: cycle.template_id || "",
        cycle_type: (cycle.cycle_type as AppraisalCycleType) || getInitialCycleType(),
      });
    } else {
      // Auto-select default template if available
      const defaultTemplate = templates?.find(t => t.is_default);
      setFormData({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        evaluation_deadline: "",
        status: "draft",
        competency_weight: defaultTemplate?.competencies_weight ?? 40,
        responsibility_weight: defaultTemplate?.responsibilities_weight ?? 30,
        goal_weight: defaultTemplate?.goals_weight ?? 30,
        min_rating: defaultTemplate?.min_rating ?? 1,
        max_rating: defaultTemplate?.max_rating ?? 5,
        multi_position_mode: "aggregate",
        template_id: defaultTemplate?.id || "",
        cycle_type: getInitialCycleType(),
      });
    }
  }, [cycle, templates, isProbationReview, isManagerCycle]);

  // Handle template selection - auto-populate weights
  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      setFormData(prev => ({ ...prev, template_id: "" }));
      return;
    }
    const selectedTemplate = templates?.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        competency_weight: selectedTemplate.competencies_weight,
        responsibility_weight: selectedTemplate.responsibilities_weight,
        goal_weight: selectedTemplate.goals_weight,
        min_rating: selectedTemplate.min_rating,
        max_rating: selectedTemplate.max_rating,
      }));
      setShowWeightWarning(false);
    } else {
      setFormData(prev => ({ ...prev, template_id: "" }));
    }
  };

  // Check if weights deviate from template
  const selectedTemplate = templates?.find(t => t.id === formData.template_id);
  const weightsDeviate = selectedTemplate && (
    formData.competency_weight !== selectedTemplate.competencies_weight ||
    formData.responsibility_weight !== selectedTemplate.responsibilities_weight ||
    formData.goal_weight !== selectedTemplate.goals_weight
  );

  useEffect(() => {
    if (weightsDeviate && selectedTemplate?.is_locked) {
      setShowWeightWarning(true);
    }
  }, [weightsDeviate, selectedTemplate]);

  // Reset overlap acknowledgment when dates or type change
  useEffect(() => {
    setOverlapAcknowledged(false);
  }, [formData.start_date, formData.end_date, formData.cycle_type]);

  // Debounced overlap check
  const performOverlapCheck = useCallback(async () => {
    if (!companyId || !formData.start_date || !formData.end_date || !formData.cycle_type) {
      setOverlappingCycles([]);
      return;
    }
    const result = await checkCycleOverlap({
      table: 'appraisal_cycles',
      companyId,
      cycleType: formData.cycle_type,
      startDate: formData.start_date,
      endDate: formData.end_date,
      excludeId: cycle?.id,
    });
    setOverlappingCycles(result.overlappingCycles);
  }, [companyId, formData.start_date, formData.end_date, formData.cycle_type, cycle?.id]);

  const debouncedOverlapCheck = useDebouncedCallback(performOverlapCheck, 500);

  useEffect(() => {
    debouncedOverlapCheck();
  }, [formData.start_date, formData.end_date, formData.cycle_type, debouncedOverlapCheck]);

  const totalWeight = formData.competency_weight + formData.responsibility_weight + formData.goal_weight;
  const hasUnacknowledgedOverlap = overlappingCycles.length > 0 && !overlapAcknowledged;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      toast.error("Company not found");
      return;
    }

    if (totalWeight !== 100) {
      toast.error("Category weights must total 100%");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        company_id: companyId,
        name: formData.name,
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        evaluation_deadline: formData.evaluation_deadline || null,
        status: formData.status,
        competency_weight: formData.competency_weight,
        responsibility_weight: formData.responsibility_weight,
        goal_weight: formData.goal_weight,
        min_rating: formData.min_rating,
        max_rating: formData.max_rating,
        multi_position_mode: formData.multi_position_mode,
        template_id: formData.template_id || null,
        created_by: user?.id,
        cycle_type: formData.cycle_type,
        // Keep boolean flags for backward compatibility
        is_probation_review: formData.cycle_type === "probation",
        is_manager_cycle: formData.cycle_type === "manager_360",
      };

      if (cycle) {
        const { error } = await supabase
          .from("appraisal_cycles")
          .update(payload)
          .eq("id", cycle.id);

        if (error) throw error;
        toast.success("Appraisal cycle updated successfully");
      } else {
        const { error } = await supabase.from("appraisal_cycles").insert(payload);
        if (error) throw error;
        toast.success("Appraisal cycle created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error saving cycle:", error);
      // Handle database constraint error for overlapping cycles
      if (error.message?.includes('no_overlapping_appraisal_cycles') || error.code === '23P01') {
        toast.error("Cannot save: This cycle overlaps with an existing cycle of the same type.");
      } else {
        toast.error(error.message || "Failed to save cycle");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cycle ? "Edit " : "Create "}
            {isProbationReview ? "Probation Review Cycle" : "Appraisal Cycle"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Cycle Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Q4 2024 Performance Review"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the appraisal cycle..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="cycle_type">Cycle Type *</Label>
              <Select
                value={formData.cycle_type}
                onValueChange={(value: AppraisalCycleType) => setFormData({ ...formData, cycle_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cycle type" />
                </SelectTrigger>
                <SelectContent>
                  {APPRAISAL_CYCLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {APPRAISAL_CYCLE_TYPES.find(t => t.value === formData.cycle_type)?.description}
              </p>
            </div>

            <div>
              <Label>Start Date *</Label>
              <DatePicker
                value={formData.start_date}
                onChange={(date) => setFormData({ ...formData, start_date: date ? format(date, "yyyy-MM-dd") : "" })}
                placeholder="Select start date"
              />
            </div>

            <div>
              <Label>End Date *</Label>
              <DatePicker
                value={formData.end_date}
                onChange={(date) => setFormData({ ...formData, end_date: date ? format(date, "yyyy-MM-dd") : "" })}
                placeholder="Select end date"
              />
            </div>
          </div>

          {/* Overlap Warning */}
          {overlappingCycles.length > 0 && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <p className="font-medium text-amber-800 dark:text-amber-300">Overlap Detected</p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  This {APPRAISAL_CYCLE_TYPES.find(t => t.value === formData.cycle_type)?.label} cycle overlaps with:
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-400 list-disc list-inside mt-1">
                  {overlappingCycles.map(c => (
                    <li key={c.id}>
                      {c.name} ({formatDateForDisplay(c.start_date)} - {formatDateForDisplay(c.end_date)})
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 mt-3">
                  <Checkbox
                    id="overlap-ack"
                    checked={overlapAcknowledged}
                    onCheckedChange={(checked) => setOverlapAcknowledged(checked === true)}
                  />
                  <label htmlFor="overlap-ack" className="text-sm text-amber-700 dark:text-amber-400 cursor-pointer">
                    I understand and want to proceed with overlapping cycles
                  </label>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Evaluation Deadline</Label>
              <DatePicker
                value={formData.evaluation_deadline}
                onChange={(date) => setFormData({ ...formData, evaluation_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                placeholder="Select deadline"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Form Template Selector */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Appraisal Form Template
              </CardTitle>
              <CardDescription>
                Select a template to auto-configure weights and sections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={formData.template_id || "none"}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No template</SelectItem>
                  {templates?.filter(t => t.is_active).map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                        {template.is_locked && (
                          <Badge variant="outline" className="text-xs">Locked</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTemplate && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  Includes: {selectedTemplate.include_competencies && "Competencies"} 
                  {selectedTemplate.include_responsibilities && ", Responsibilities"}
                  {selectedTemplate.include_goals && ", Goals"}
                  {selectedTemplate.include_360_feedback && ", 360 Feedback"}
                  {selectedTemplate.include_values && ", Values"}
                </div>
              )}

              {showWeightWarning && selectedTemplate?.is_locked && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This template is locked. Weight changes require HR approval.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Category Weights</h3>
              <span
                className={`text-sm font-medium ${
                  totalWeight === 100 ? "text-success" : "text-destructive"
                }`}
              >
                Total: {totalWeight}% {totalWeight !== 100 && "(must be 100%)"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="competency_weight">Competency Weight (%)</Label>
                <Input
                  id="competency_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.competency_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, competency_weight: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="responsibility_weight">Responsibility Weight (%)</Label>
                <Input
                  id="responsibility_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.responsibility_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, responsibility_weight: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="goal_weight">Goal Weight (%)</Label>
                <Input
                  id="goal_weight"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.goal_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_weight: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rating Scale</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="min_rating">Minimum Rating</Label>
                <Input
                  id="min_rating"
                  type="number"
                  min="0"
                  value={formData.min_rating}
                  onChange={(e) =>
                    setFormData({ ...formData, min_rating: parseFloat(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_rating">Maximum Rating</Label>
                <Input
                  id="max_rating"
                  type="number"
                  min="1"
                  value={formData.max_rating}
                  onChange={(e) =>
                    setFormData({ ...formData, max_rating: parseFloat(e.target.value) || 5 })
                  }
                />
              </div>
            </div>
          </div>

          {/* Multi-Position Handling */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Multi-Position Employees
              </CardTitle>
              <CardDescription>
                How should employees with multiple concurrent positions be appraised?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.multi_position_mode}
                onValueChange={(value: "aggregate" | "separate") =>
                  setFormData({ ...formData, multi_position_mode: value })
                }
                className="space-y-3"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="aggregate" id="aggregate" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="aggregate" className="flex items-center gap-2 cursor-pointer font-medium">
                      <GitMerge className="h-4 w-4 text-primary" />
                      Aggregate Scores
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create one appraisal per employee. Scores from all positions are combined using 
                      configurable weights into a single overall score.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="separate" id="separate" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="separate" className="flex items-center gap-2 cursor-pointer font-medium">
                      <Users className="h-4 w-4 text-primary" />
                      Separate Appraisals
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create individual appraisals for each position an employee holds. 
                      Each position is evaluated independently.
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || totalWeight !== 100 || hasUnacknowledgedOverlap}>
              {loading ? "Saving..." : cycle ? "Update Cycle" : "Create Cycle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
