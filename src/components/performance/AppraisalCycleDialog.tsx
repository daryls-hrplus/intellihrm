import { useState, useEffect, useCallback, useMemo } from "react";
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
import { Users, GitMerge, FileText, AlertTriangle, Target, ClipboardList, Goal, Heart, Rocket, Clock, Link2 } from "lucide-react";
import { useAppraisalFormTemplates } from "@/hooks/useAppraisalFormTemplates";
import { useActiveGoalCycles } from "@/hooks/useGoalCycles";
import { format } from "date-fns";
import { checkCycleOverlap } from "@/utils/cycleOverlapCheck";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";
import { AppraisalActivationDialog } from "./AppraisalActivationDialog";
// Weight input component with template-aware visual state
interface WeightInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  enabled: boolean;
  locked?: boolean;
  icon: React.ReactNode;
}

const WeightInput = ({ id, label, value, onChange, enabled, locked, icon }: WeightInputProps) => {
  const isDisabled = !enabled || locked;
  
  return (
    <div className={cn("relative transition-opacity", !enabled && "opacity-50")}>
      <div className="flex items-center justify-between mb-1.5">
        <Label htmlFor={id} className={cn("flex items-center gap-1.5", isDisabled && "text-muted-foreground")}>
          {icon}
          {label}
        </Label>
        {!enabled && (
          <Badge variant="outline" className="text-xs h-5 bg-muted">
            Off
          </Badge>
        )}
        {enabled && locked && (
          <Badge variant="outline" className="text-xs h-5 bg-amber-100 text-amber-700 border-amber-300">
            Locked
          </Badge>
        )}
      </div>
      <Input
        id={id}
        type="number"
        min="0"
        max="100"
        value={enabled ? value : 0}
        onChange={(e) => !isDisabled && onChange(parseInt(e.target.value) || 0)}
        disabled={isDisabled}
        className={cn(isDisabled && "bg-muted cursor-not-allowed border-muted")}
      />
      {!enabled && (
        <p className="text-xs text-muted-foreground mt-1">
          Not in template
        </p>
      )}
      {enabled && locked && (
        <p className="text-xs text-amber-600 mt-1">
          HR approval required
        </p>
      )}
    </div>
  );
};
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
  // Phase-specific deadlines (optional)
  self_assessment_deadline?: string | null;
  feedback_360_deadline?: string | null;
  manager_review_deadline?: string | null;
  calibration_deadline?: string | null;
  finalization_deadline?: string | null;
  acknowledgment_deadline?: string | null;
  status: string;
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  values_weight?: number;
  include_values_assessment?: boolean;
  min_rating: number;
  max_rating: number;
  multi_position_mode?: string;
  template_id?: string;
  cycle_type?: string;
  linked_goal_cycle_id?: string | null;
}

interface AppraisalCycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cycle: AppraisalCycle | null;
  companyId: string | undefined;
  companyName?: string;
  onSuccess: () => void;
  isProbationReview?: boolean;
  isManagerCycle?: boolean;
}

export function AppraisalCycleDialog({
  open,
  onOpenChange,
  cycle,
  companyId,
  companyName,
  onSuccess,
  isProbationReview = false,
  isManagerCycle = false,
}: AppraisalCycleDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const { templates } = useAppraisalFormTemplates(companyId || "");
  const { cycles: goalCycles } = useActiveGoalCycles(companyId);
  // Overlap detection state
  const [overlappingCycles, setOverlappingCycles] = useState<Array<{ id: string; name: string; start_date: string; end_date: string; cycle_type: string }>>([]);
  const [overlapAcknowledged, setOverlapAcknowledged] = useState(false);
  
  // Activation dialog state - for activating draft cycles
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [pendingActivationCycle, setPendingActivationCycle] = useState<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    evaluation_deadline: string | null;
    company_id: string;
  } | null>(null);
  
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
    // Phase-specific deadlines
    self_assessment_deadline: "",
    feedback_360_deadline: "",
    manager_review_deadline: "",
    calibration_deadline: "",
    finalization_deadline: "",
    acknowledgment_deadline: "",
    status: "draft",
    competency_weight: 40,
    responsibility_weight: 30,
    goal_weight: 20,
    values_weight: 10,
    min_rating: 1,
    max_rating: 5,
    multi_position_mode: "aggregate" as "aggregate" | "separate",
    template_id: "",
    cycle_type: getInitialCycleType(),
    linked_goal_cycle_id: "" as string,
  });

  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name,
        description: cycle.description || "",
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        evaluation_deadline: cycle.evaluation_deadline || "",
        self_assessment_deadline: cycle.self_assessment_deadline || "",
        feedback_360_deadline: cycle.feedback_360_deadline || "",
        manager_review_deadline: cycle.manager_review_deadline || "",
        calibration_deadline: cycle.calibration_deadline || "",
        finalization_deadline: cycle.finalization_deadline || "",
        acknowledgment_deadline: cycle.acknowledgment_deadline || "",
        status: cycle.status,
        competency_weight: cycle.competency_weight,
        responsibility_weight: cycle.responsibility_weight,
        goal_weight: cycle.goal_weight,
        values_weight: cycle.values_weight || 0,
        min_rating: cycle.min_rating,
        max_rating: cycle.max_rating,
        multi_position_mode: (cycle.multi_position_mode as "aggregate" | "separate") || "aggregate",
        template_id: cycle.template_id || "",
        cycle_type: (cycle.cycle_type as AppraisalCycleType) || getInitialCycleType(),
        linked_goal_cycle_id: cycle.linked_goal_cycle_id || "",
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
        self_assessment_deadline: "",
        feedback_360_deadline: "",
        manager_review_deadline: "",
        calibration_deadline: "",
        finalization_deadline: "",
        acknowledgment_deadline: "",
        status: "draft",
        competency_weight: defaultTemplate?.competencies_weight ?? 40,
        responsibility_weight: defaultTemplate?.responsibilities_weight ?? 30,
        goal_weight: defaultTemplate?.goals_weight ?? 20,
        values_weight: defaultTemplate?.values_weight ?? 10,
        min_rating: defaultTemplate?.min_rating ?? 1,
        max_rating: defaultTemplate?.max_rating ?? 5,
        multi_position_mode: "aggregate",
        template_id: defaultTemplate?.id || "",
        cycle_type: getInitialCycleType(),
        linked_goal_cycle_id: "",
      });
    }
  }, [cycle, templates, isProbationReview, isManagerCycle]);

  // Handle template selection - auto-populate weights (only for enabled categories)
  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") {
      setFormData(prev => ({ ...prev, template_id: "" }));
      return;
    }
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        // Only apply weights for enabled categories, zero out disabled ones
        competency_weight: template.include_competencies ? template.competencies_weight : 0,
        responsibility_weight: template.include_responsibilities ? template.responsibilities_weight : 0,
        goal_weight: template.include_goals ? template.goals_weight : 0,
        values_weight: template.include_values ? (template.values_weight || 0) : 0,
        min_rating: template.min_rating,
        max_rating: template.max_rating,
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
    formData.goal_weight !== selectedTemplate.goals_weight ||
    formData.values_weight !== (selectedTemplate.values_weight || 0)
  );

  // Determine which categories are enabled by the selected template
  const categoryState = useMemo(() => {
    if (!selectedTemplate) {
      // No template selected - all categories enabled
      return {
        competencies: true,
        responsibilities: true,
        goals: true,
        values: true,
      };
    }
    return {
      competencies: selectedTemplate.include_competencies ?? true,
      responsibilities: selectedTemplate.include_responsibilities ?? true,
      goals: selectedTemplate.include_goals ?? true,
      values: selectedTemplate.include_values ?? false,
    };
  }, [selectedTemplate]);

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

  // Only count enabled categories in total weight calculation
  const totalWeight = 
    (categoryState.competencies ? formData.competency_weight : 0) +
    (categoryState.responsibilities ? formData.responsibility_weight : 0) +
    (categoryState.goals ? formData.goal_weight : 0) +
    (categoryState.values ? formData.values_weight : 0);
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
        // Phase-specific deadlines
        self_assessment_deadline: formData.self_assessment_deadline || null,
        feedback_360_deadline: formData.feedback_360_deadline || null,
        manager_review_deadline: formData.manager_review_deadline || null,
        calibration_deadline: formData.calibration_deadline || null,
        finalization_deadline: formData.finalization_deadline || null,
        acknowledgment_deadline: formData.acknowledgment_deadline || null,
        status: formData.status,
        competency_weight: formData.competency_weight,
        responsibility_weight: formData.responsibility_weight,
        goal_weight: formData.goal_weight,
        values_weight: formData.values_weight,
        // Sync include flags from template config
        include_goals: categoryState.goals && formData.goal_weight > 0,
        include_competencies: categoryState.competencies && formData.competency_weight > 0,
        include_responsibilities: categoryState.responsibilities && formData.responsibility_weight > 0,
        include_values_assessment: categoryState.values && formData.values_weight > 0,
        min_rating: formData.min_rating,
        max_rating: formData.max_rating,
        multi_position_mode: formData.multi_position_mode,
        template_id: formData.template_id || null,
        created_by: user?.id,
        cycle_type: formData.cycle_type,
        // Link to goal cycle for Goals module integration
        linked_goal_cycle_id: formData.linked_goal_cycle_id || null,
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
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cycle ? "Edit " : "Create "}
            {isProbationReview ? "Probation Review Cycle" : "Appraisal Cycle"}
          </DialogTitle>
          {companyName && (
            <p className="text-sm text-muted-foreground">{companyName}</p>
          )}
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
                onValueChange={(value) => {
                  // If changing from draft to active on an existing cycle, use activation dialog
                  if (cycle && cycle.status === "draft" && value === "active" && companyId) {
                    setPendingActivationCycle({
                      id: cycle.id,
                      name: formData.name || cycle.name,
                      start_date: formData.start_date || cycle.start_date,
                      end_date: formData.end_date || cycle.end_date,
                      evaluation_deadline: formData.evaluation_deadline || cycle.evaluation_deadline,
                      company_id: companyId,
                    });
                    setShowActivationDialog(true);
                    return;
                  }
                  setFormData({ ...formData, status: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2">
                      Active
                      {cycle?.status === "draft" && <Rocket className="h-3 w-3 text-primary" />}
                    </span>
                  </SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {cycle?.status === "draft" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Changing to Active will open the activation wizard
                </p>
              )}
            </div>
          </div>

          {/* Goal Cycle Linking - for Goals Module Integration */}
          {categoryState.goals && formData.goal_weight > 0 && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Link Goal Cycle
                </CardTitle>
                <CardDescription className="text-xs">
                  Link a goal cycle to pull employee goals into this appraisal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.linked_goal_cycle_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, linked_goal_cycle_id: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a goal cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No goal cycle linked</SelectItem>
                    {goalCycles.map((gc) => (
                      <SelectItem key={gc.id} value={gc.id}>
                        {gc.name} ({format(new Date(gc.start_date), "MMM yyyy")} - {format(new Date(gc.end_date), "MMM yyyy")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.linked_goal_cycle_id && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Employee goals from this cycle will appear in the appraisal form for rating.
                  </p>
                )}
                {!formData.linked_goal_cycle_id && (
                  <p className="text-xs text-amber-600 mt-2">
                    Without a linked goal cycle, goals will be pulled from job templates instead of the Goals module.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Phase-Specific Deadlines */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Phase Deadlines
              </CardTitle>
              <CardDescription className="text-xs">
                Configure specific deadlines for each phase of the appraisal journey
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <Label className="text-xs">Self-Assessment</Label>
                <DatePicker
                  value={formData.self_assessment_deadline}
                  onChange={(date) => setFormData({ ...formData, self_assessment_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs">360° Feedback</Label>
                <DatePicker
                  value={formData.feedback_360_deadline}
                  onChange={(date) => setFormData({ ...formData, feedback_360_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs">Manager Review</Label>
                <DatePicker
                  value={formData.manager_review_deadline}
                  onChange={(date) => setFormData({ ...formData, manager_review_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs">Calibration</Label>
                <DatePicker
                  value={formData.calibration_deadline}
                  onChange={(date) => setFormData({ ...formData, calibration_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs">Finalization</Label>
                <DatePicker
                  value={formData.finalization_deadline}
                  onChange={(date) => setFormData({ ...formData, finalization_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label className="text-xs">Acknowledgment</Label>
                <DatePicker
                  value={formData.acknowledgment_deadline}
                  onChange={(date) => setFormData({ ...formData, acknowledgment_deadline: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Optional"
                />
              </div>
            </CardContent>
          </Card>

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

            <div className="grid gap-4 md:grid-cols-4">
              <WeightInput
                id="competency_weight"
                label="Competency (%)"
                value={formData.competency_weight}
                onChange={(v) => setFormData({ ...formData, competency_weight: v })}
                enabled={categoryState.competencies}
                locked={selectedTemplate?.is_locked}
                icon={<Target className="h-3.5 w-3.5" />}
              />
              <WeightInput
                id="responsibility_weight"
                label="Responsibility (%)"
                value={formData.responsibility_weight}
                onChange={(v) => setFormData({ ...formData, responsibility_weight: v })}
                enabled={categoryState.responsibilities}
                locked={selectedTemplate?.is_locked}
                icon={<ClipboardList className="h-3.5 w-3.5" />}
              />
              <WeightInput
                id="goal_weight"
                label="Goals (%)"
                value={formData.goal_weight}
                onChange={(v) => setFormData({ ...formData, goal_weight: v })}
                enabled={categoryState.goals}
                locked={selectedTemplate?.is_locked}
                icon={<Goal className="h-3.5 w-3.5" />}
              />
              <WeightInput
                id="values_weight"
                label="Values (%)"
                value={formData.values_weight}
                onChange={(v) => setFormData({ ...formData, values_weight: v })}
                enabled={categoryState.values}
                locked={selectedTemplate?.is_locked}
                icon={<Heart className="h-3.5 w-3.5" />}
              />
            </div>

            {!selectedTemplate && (
              <p className="text-xs text-muted-foreground mt-2">
                All categories enabled. Select a template to apply predefined configurations.
              </p>
            )}
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
    
    {/* Activation Dialog for transitioning draft to active */}
    {pendingActivationCycle && (
      <AppraisalActivationDialog
        open={showActivationDialog}
        onOpenChange={(open) => {
          setShowActivationDialog(open);
          if (!open) setPendingActivationCycle(null);
        }}
        cycle={pendingActivationCycle}
        onSuccess={() => {
          setShowActivationDialog(false);
          setPendingActivationCycle(null);
          onOpenChange(false);
          onSuccess();
        }}
      />
    )}
    </>
  );
}
