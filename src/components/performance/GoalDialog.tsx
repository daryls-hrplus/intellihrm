import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getTodayString } from "@/utils/dateUtils";
import {
  MeasurementType,
  ComplianceCategory,
  GoalExtendedAttributes,
  SubMetricDefinition,
} from "@/types/goalEnhancements";
import {
  parseExtendedAttributes,
  serializeExtendedAttributes,
  getDisplayCategory,
} from "@/utils/goalCalculations";
import {
  StepClassification,
  StepDefinition,
  StepMetrics,
  StepAlignment,
  GoalLevel,
  GoalType,
} from "./goal-wizard";
import { ChevronLeft, ChevronRight, Loader2, Link2, Eye, Calculator } from "lucide-react";
import { useGoalWeights } from "@/hooks/useGoalWeights";
import { GoalWeightWarning } from "./GoalWeightSummary";
import { GoalAlignmentManager } from "./GoalAlignmentManager";
import { GoalVisibilitySettings } from "./GoalVisibilitySettings";
import { ProgressRollupConfig } from "./ProgressRollupConfig";
import { useGoalSubMetrics, GoalSubMetricValue } from "@/hooks/useGoalSubMetrics";
import { AIMetricSuggestionPanel } from "./goals/AIMetricSuggestionPanel";
import { GoalDuplicateWarningDialog } from "./goals/GoalDuplicateWarningDialog";
import { useGoalAIAnalyzer } from "@/hooks/performance/useGoalAIAnalyzer";

type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type DbGoalLevel = 'company' | 'department' | 'team' | 'individual';
type GoalSource = 'cascaded' | 'manager_assigned' | 'self_created';

const mapGoalLevelToDb = (level: GoalLevel): DbGoalLevel => {
  if (level === 'project') return 'team';
  return level;
};

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  goal_level: GoalLevel;
  status: GoalStatus;
  progress_percentage: number;
  weighting: number;
  start_date: string;
  due_date: string | null;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
  employee_id: string | null;
  department_id: string | null;
  parent_goal_id: string | null;
  category: string | null;
}

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  companyId: string | undefined;
  employees?: { id: string; full_name: string }[];
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  goal_type: GoalType;
  goal_level: GoalLevel;
  goal_source: GoalSource;
  status: GoalStatus;
  category: string;
  start_date: string;
  due_date: string;
  weighting: string;
  target_value: string;
  current_value: string;
  unit_of_measure: string;
  parent_goal_id: string;
  employee_id: string;
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  time_bound: string;
  measurement_type: MeasurementType;
  threshold_value: string;
  stretch_value: string;
  threshold_percentage: string;
  stretch_percentage: string;
  is_inverse: boolean;
  is_mandatory: boolean;
  compliance_category: ComplianceCategory | "";
  is_weight_required: boolean;
  inherited_weight_portion: string;
  metric_template_id: string;
}

interface JobGoal {
  id: string;
  goal_name: string;
  goal_description: string | null;
  weighting: number;
}

const WIZARD_STEPS = [
  { title: "Classification", description: "Level & Type" },
  { title: "Definition", description: "Core details" },
  { title: "Metrics", description: "Measurement" },
  { title: "Alignment", description: "SMART/OKR" },
];

const getInitialFormData = (userId?: string): FormData => ({
  title: "",
  description: "",
  goal_type: "smart_goal",
  goal_level: "individual",
  goal_source: "self_created",
  status: "draft",
  category: "",
  start_date: getTodayString(),
  due_date: "",
  weighting: "10",
  target_value: "",
  current_value: "0",
  unit_of_measure: "",
  parent_goal_id: "",
  employee_id: userId || "",
  specific: "",
  measurable: "",
  achievable: "",
  relevant: "",
  time_bound: "",
  measurement_type: "quantitative",
  threshold_value: "",
  stretch_value: "",
  threshold_percentage: "80",
  stretch_percentage: "120",
  is_inverse: false,
  is_mandatory: false,
  compliance_category: "",
  is_weight_required: true,
  inherited_weight_portion: "",
  metric_template_id: "",
});

export function GoalDialog({
  open,
  onOpenChange,
  goal,
  companyId,
  employees = [],
  onSuccess,
}: GoalDialogProps) {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [parentGoals, setParentGoals] = useState<{ id: string; title: string }[]>([]);
  const [jobGoals, setJobGoals] = useState<JobGoal[]>([]);
  const [parentGoalWeight, setParentGoalWeight] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(getInitialFormData(user?.id));
  const [showWeightWarning, setShowWeightWarning] = useState(false);
  const [currentEmployeeWeight, setCurrentEmployeeWeight] = useState(0);
  
  // Duplicate detection state
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [similarGoals, setSimilarGoals] = useState<any[]>([]);
  const { detectDuplicates } = useGoalAIAnalyzer();
  
  const { validateEmployeeWeights, refetch: refetchWeights } = useGoalWeights(companyId);

  // Sub-metrics hook for composite/OKR/delta templates
  const {
    subMetrics,
    loading: subMetricsLoading,
    saving: subMetricsSaving,
    compositeProgress,
    subMetricProgress,
    initializeFromTemplate,
    updateSubMetric,
    saveSubMetrics,
    loadSubMetrics,
  } = useGoalSubMetrics();

  // Handler for initializing sub-metrics from template
  const handleInitializeSubMetrics = useCallback((templateSubMetrics: SubMetricDefinition[]) => {
    // Use a temporary ID for new goals, will be updated after save
    const tempGoalId = goal?.id || 'temp-goal';
    initializeFromTemplate(tempGoalId, templateSubMetrics);
  }, [goal?.id, initializeFromTemplate]);

  // Load sub-metrics when editing an existing goal
  useEffect(() => {
    if (goal?.id && open) {
      loadSubMetrics(goal.id);
    }
  }, [goal?.id, open, loadSubMetrics]);

  // Fetch job goals for selected employee
  const fetchJobGoalsForEmployee = async (employeeId: string) => {
    if (!employeeId) {
      setJobGoals([]);
      return;
    }

    try {
      const { data: positions } = await supabase
        .from("employee_positions")
        .select(`
          position_id,
          positions!inner(
            job_family_id
          )
        `)
        .eq("employee_id", employeeId)
        .eq("is_active", true)
        .limit(1);

      if (!positions?.length) {
        setJobGoals([]);
        return;
      }

      const jobFamilyId = (positions[0] as any).positions?.job_family_id;
      if (!jobFamilyId) {
        setJobGoals([]);
        return;
      }

      const { data: jobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("job_family_id", jobFamilyId)
        .eq("is_active", true);

      if (!jobs?.length) {
        setJobGoals([]);
        return;
      }

      const jobIds = jobs.map(j => j.id);

      const { data: goals } = await supabase
        .from("job_goals")
        .select("id, goal_name, goal_description, weighting")
        .in("job_id", jobIds)
        .order("goal_name");

      setJobGoals((goals as JobGoal[]) || []);
    } catch (error) {
      console.error("Error fetching job goals:", error);
      setJobGoals([]);
    }
  };

  useEffect(() => {
    if (formData.employee_id) {
      fetchJobGoalsForEmployee(formData.employee_id);
    } else {
      setJobGoals([]);
    }
  }, [formData.employee_id]);

  useEffect(() => {
    if (goal) {
      const extAttrs = parseExtendedAttributes(goal.category);
      setFormData({
        title: goal.title,
        description: goal.description || "",
        goal_type: goal.goal_type,
        goal_level: extAttrs?.actualGoalLevel || goal.goal_level,
        goal_source: "self_created",
        status: goal.status,
        category: getDisplayCategory(goal.category) || "",
        start_date: goal.start_date,
        due_date: goal.due_date || "",
        weighting: String(goal.weighting),
        target_value: goal.target_value ? String(goal.target_value) : "",
        current_value: goal.current_value ? String(goal.current_value) : "0",
        unit_of_measure: goal.unit_of_measure || "",
        parent_goal_id: goal.parent_goal_id || "",
        employee_id: goal.employee_id || "",
        specific: "",
        measurable: "",
        achievable: "",
        relevant: "",
        time_bound: "",
        measurement_type: extAttrs?.measurementType || "quantitative",
        threshold_value: extAttrs?.thresholdValue ? String(extAttrs.thresholdValue) : "",
        stretch_value: extAttrs?.stretchValue ? String(extAttrs.stretchValue) : "",
        threshold_percentage: String(extAttrs?.thresholdPercentage || 80),
        stretch_percentage: String(extAttrs?.stretchPercentage || 120),
        is_inverse: extAttrs?.isInverse || false,
        is_mandatory: extAttrs?.isMandatory || false,
        compliance_category: extAttrs?.complianceCategory || "",
        is_weight_required: extAttrs?.isWeightRequired !== false,
        inherited_weight_portion: extAttrs?.inheritedWeightPortion ? String(extAttrs.inheritedWeightPortion) : "",
        metric_template_id: extAttrs?.metricTemplateId || "",
      });
      setCurrentStep(0);
    } else {
      const initialData = getInitialFormData(user?.id);
      setFormData(initialData);
      setCurrentStep(0);
      if (initialData.employee_id && open) {
        fetchJobGoalsForEmployee(initialData.employee_id);
      }
    }
  }, [goal, open, user?.id]);

  useEffect(() => {
    if (companyId) {
      fetchParentGoals();
    }
  }, [companyId]);

  const fetchParentGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("performance_goals")
        .select("id, title")
        .eq("company_id", companyId)
        .in("goal_level", ["company", "department", "team"])
        .order("title");

      if (error) throw error;
      setParentGoals(data || []);
    } catch (error) {
      console.error("Error fetching parent goals:", error);
    }
  };

  // Check for duplicates before saving
  const checkForDuplicates = async (): Promise<boolean> => {
    if (goal) return true; // Skip duplicate check for edits
    if (!companyId || !formData.title.trim()) return true;

    try {
      // Fetch existing goals
      const { data: existingGoals } = await supabase
        .from("performance_goals")
        .select("id, title, description, employee_id")
        .eq("company_id", companyId)
        .in("status", ["draft", "active", "in_progress"]);

      if (!existingGoals?.length) return true;

      const result = await detectDuplicates(
        { id: "", title: formData.title, description: formData.description, company_id: companyId },
        existingGoals.map(g => ({ id: g.id, title: g.title, description: g.description || undefined, company_id: companyId }))
      );

      if (result?.has_duplicates && result.similar_goals && result.similar_goals.length > 0) {
        // Find goals with high similarity
        const highSimilarity = result.similar_goals.filter(d => d.similarity_percentage >= 70);
        if (highSimilarity.length > 0) {
          setSimilarGoals(highSimilarity.map(d => ({
            title: d.title,
            similarity: d.similarity_percentage,
            reason: d.reason,
            recommendation: d.recommendation,
          })));
          setShowDuplicateWarning(true);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking duplicates:", error);
      return true; // Allow save on error
    }
  };

  // Handler for template selection from AI suggestions
  const handleAITemplateSelect = (templateId: string, suggestedTarget?: string, unit?: string) => {
    setFormData(prev => ({
      ...prev,
      metric_template_id: templateId,
      target_value: suggestedTarget || prev.target_value,
      unit_of_measure: unit || prev.unit_of_measure,
    }));
    toast.success("Template applied from AI suggestion");
  };

  const handleSubmit = async () => {
    if (!companyId || !user?.id) return;

    setLoading(true);
    try {
      const extendedAttrs: GoalExtendedAttributes = {
        measurementType: formData.measurement_type,
        thresholdValue: formData.threshold_value ? parseFloat(formData.threshold_value) : undefined,
        stretchValue: formData.stretch_value ? parseFloat(formData.stretch_value) : undefined,
        thresholdPercentage: parseFloat(formData.threshold_percentage) || 80,
        stretchPercentage: parseFloat(formData.stretch_percentage) || 120,
        isInverse: formData.is_inverse,
        isMandatory: formData.is_mandatory,
        complianceCategory: formData.compliance_category || undefined,
        isWeightRequired: formData.is_weight_required,
        inheritedWeightPortion: formData.inherited_weight_portion ? parseFloat(formData.inherited_weight_portion) : undefined,
        metricTemplateId: formData.metric_template_id || undefined,
        actualGoalLevel: formData.goal_level === 'project' ? 'project' : undefined,
      };

      const categoryWithAttrs = serializeExtendedAttributes(extendedAttrs, formData.category || undefined);

      const goalData = {
        company_id: companyId,
        employee_id: formData.goal_level === "individual" ? (formData.employee_id || user.id) : null,
        title: formData.title,
        description: formData.description || null,
        goal_type: formData.goal_type,
        goal_level: mapGoalLevelToDb(formData.goal_level),
        goal_source: formData.goal_source,
        status: formData.status,
        category: categoryWithAttrs,
        start_date: formData.start_date,
        due_date: formData.due_date || null,
        weighting: parseFloat(formData.weighting) || 10,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        current_value: parseFloat(formData.current_value) || 0,
        unit_of_measure: formData.unit_of_measure || null,
        parent_goal_id: formData.parent_goal_id || null,
        specific: formData.specific || null,
        measurable: formData.measurable || null,
        achievable: formData.achievable || null,
        relevant: formData.relevant || null,
        time_bound: formData.time_bound || null,
        assigned_by: formData.goal_source === "manager_assigned" ? user.id : null,
      };

      let savedGoalId: string;

      if (goal) {
        const { error } = await supabase
          .from("performance_goals")
          .update(goalData)
          .eq("id", goal.id);

        if (error) throw error;
        savedGoalId = goal.id;

        await logAction({
          action: "UPDATE",
          entityType: "performance_goal",
          entityId: goal.id,
          entityName: formData.title,
          oldValues: { title: goal.title, status: goal.status },
          newValues: goalData,
        });

        toast.success("Goal updated successfully");
      } else {
        const { data, error } = await supabase
          .from("performance_goals")
          .insert([goalData])
          .select("id")
          .single();

        if (error) throw error;
        savedGoalId = data.id;

        await logAction({
          action: "CREATE",
          entityType: "performance_goal",
          entityId: data.id,
          entityName: formData.title,
          newValues: goalData,
        });

        toast.success("Goal created successfully");
      }

      // Save sub-metrics if any exist
      if (subMetrics.length > 0) {
        await saveSubMetrics(savedGoalId);
      }

      onOpenChange(false);
      onSuccess();
      refetchWeights();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  // Check weight validation before final submit
  const checkWeightValidation = async (): Promise<boolean> => {
    if (formData.goal_level !== "individual") return true;
    
    const employeeId = formData.employee_id || user?.id;
    if (!employeeId) return true;

    try {
      const { data: existingGoals } = await supabase
        .from("performance_goals")
        .select("id, weighting")
        .eq("company_id", companyId)
        .eq("goal_level", "individual")
        .eq("employee_id", employeeId)
        .in("status", ["draft", "active", "in_progress"]);

      const currentTotal = (existingGoals || [])
        .filter(g => g.id !== goal?.id) // Exclude current goal if editing
        .reduce((sum, g) => sum + (g.weighting || 0), 0);

      const proposedWeight = parseFloat(formData.weighting) || 0;
      const newTotal = currentTotal + proposedWeight;

      setCurrentEmployeeWeight(currentTotal);

      if (newTotal !== 100) {
        setShowWeightWarning(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking weights:", error);
      return true; // Allow save on error
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Classification
        return true; // Always has defaults
      case 1: // Definition
        return formData.title.trim().length > 0 && formData.start_date;
      case 2: // Metrics
        return true; // Metrics are optional
      case 3: // Alignment
        return true; // SMART criteria are optional
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      // Check for duplicates when leaving definition step (step 1)
      if (currentStep === 1 && !goal) {
        const noDuplicates = await checkForDuplicates();
        if (!noDuplicates) return; // Will show duplicate warning dialog
      }
      setCurrentStep(currentStep + 1);
    } else {
      // On final step, check weight validation first
      const canProceedWithWeight = await checkWeightValidation();
      if (canProceedWithWeight) {
        handleSubmit();
      }
    }
  };

  const handleProceedWithWarning = () => {
    setShowWeightWarning(false);
    handleSubmit();
  };

  const handleProceedWithDuplicates = () => {
    setShowDuplicateWarning(false);
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectJobGoal = (jobGoal: JobGoal) => {
    setFormData({
      ...formData,
      title: jobGoal.goal_name,
      description: jobGoal.goal_description || "",
      weighting: String(jobGoal.weighting || 10),
    });
  };

  const [activeTab, setActiveTab] = useState<string>("details");

  // Reset tab when dialog opens/closes or goal changes
  useEffect(() => {
    if (open) {
      setActiveTab("details");
    }
  }, [open, goal?.id]);

  const isEditMode = !!goal;
  const showAlignmentTabs = isEditMode && companyId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${showAlignmentTabs ? 'max-w-4xl' : 'max-w-2xl'} max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader className="pb-4 border-b">
          <DialogTitle>{goal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
        </DialogHeader>

        {showAlignmentTabs ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="details" className="text-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="alignments" className="text-sm">
                <Link2 className="h-4 w-4 mr-1.5" />
                Alignments
              </TabsTrigger>
              <TabsTrigger value="visibility" className="text-sm">
                <Eye className="h-4 w-4 mr-1.5" />
                Visibility
              </TabsTrigger>
              <TabsTrigger value="rollup" className="text-sm">
                <Calculator className="h-4 w-4 mr-1.5" />
                Rollup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-hidden flex flex-col mt-0">
              {/* Stepper for details tab */}
              <div className="py-4 px-2">
                <Stepper
                  steps={WIZARD_STEPS}
                  currentStep={currentStep}
                  onStepClick={(step) => step <= currentStep && setCurrentStep(step)}
                />
              </div>

              {/* Weight Warning */}
              {showWeightWarning && (
                <div className="mb-4">
                  <GoalWeightWarning
                    currentTotal={currentEmployeeWeight}
                    proposedWeight={parseFloat(formData.weighting) || 0}
                    existingWeight={goal?.weighting || 0}
                    onProceed={handleProceedWithWarning}
                    onCancel={() => {
                      setShowWeightWarning(false);
                      setCurrentStep(2);
                    }}
                  />
                </div>
              )}

              {/* Step Content */}
              <div className="flex-1 overflow-y-auto py-4 px-1">
                {currentStep === 0 && (
                  <StepClassification
                    goalLevel={formData.goal_level}
                    goalType={formData.goal_type}
                    onLevelChange={(level) => setFormData({ ...formData, goal_level: level })}
                    onTypeChange={(type) => setFormData({ ...formData, goal_type: type })}
                  />
                )}

                {currentStep === 1 && (
                  <StepDefinition
                    goalLevel={formData.goal_level}
                    formData={{
                      title: formData.title,
                      description: formData.description,
                      category: formData.category,
                      start_date: formData.start_date,
                      due_date: formData.due_date,
                      status: formData.status,
                      employee_id: formData.employee_id,
                      parent_goal_id: formData.parent_goal_id,
                      goal_source: formData.goal_source,
                    }}
                    onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates } as FormData))}
                    employees={employees}
                    parentGoals={parentGoals}
                    jobGoals={jobGoals}
                    onSelectJobGoal={handleSelectJobGoal}
                  />
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    {/* AI Metric Suggestions */}
                    {companyId && formData.title && (
                      <AIMetricSuggestionPanel
                        goalTitle={formData.title}
                        goalDescription={formData.description}
                        companyId={companyId}
                        onSelectTemplate={handleAITemplateSelect}
                      />
                    )}
                    
                    <StepMetrics
                      goalType={formData.goal_type}
                      formData={{
                        weighting: formData.weighting,
                        unit_of_measure: formData.unit_of_measure,
                        target_value: formData.target_value,
                        current_value: formData.current_value,
                        measurement_type: formData.measurement_type,
                        threshold_value: formData.threshold_value,
                        stretch_value: formData.stretch_value,
                        threshold_percentage: formData.threshold_percentage,
                        stretch_percentage: formData.stretch_percentage,
                        is_inverse: formData.is_inverse,
                        is_mandatory: formData.is_mandatory,
                        compliance_category: formData.compliance_category,
                        is_weight_required: formData.is_weight_required,
                        inherited_weight_portion: formData.inherited_weight_portion,
                        metric_template_id: formData.metric_template_id,
                      }}
                      onChange={(updates) => setFormData({ ...formData, ...updates })}
                      parentGoalWeight={parentGoalWeight}
                      companyId={companyId}
                      employeeId={formData.goal_level === "individual" ? (formData.employee_id || user?.id) : undefined}
                      existingGoalId={goal?.id}
                      subMetrics={subMetrics}
                      onSubMetricUpdate={updateSubMetric}
                      onInitializeSubMetrics={handleInitializeSubMetrics}
                      compositeProgress={compositeProgress}
                      subMetricProgress={subMetricProgress}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <StepAlignment
                    goalType={formData.goal_type}
                    smartCriteria={{
                      specific: formData.specific,
                      measurable: formData.measurable,
                      achievable: formData.achievable,
                      relevant: formData.relevant,
                      time_bound: formData.time_bound,
                    }}
                    onSmartChange={(updates) => setFormData({ ...formData, ...updates })}
                  />
                )}
              </div>

              {/* Footer Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={loading || !canProceed()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    ) : currentStep === WIZARD_STEPS.length - 1 ? (
                      "Update Goal"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alignments" className="flex-1 overflow-y-auto mt-0">
              <GoalAlignmentManager
                goalId={goal.id}
                companyId={companyId!}
                goalTitle={goal.title}
              />
            </TabsContent>

            <TabsContent value="visibility" className="flex-1 overflow-y-auto mt-0">
              <GoalVisibilitySettings goalId={goal.id} />
            </TabsContent>

            <TabsContent value="rollup" className="flex-1 overflow-y-auto mt-0">
              <ProgressRollupConfig
                goalId={goal.id}
                currentProgress={goal.progress_percentage}
                onProgressUpdate={() => {
                  onSuccess();
                }}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {/* Stepper for create mode */}
            <div className="py-4 px-2">
              <Stepper
                steps={WIZARD_STEPS}
                currentStep={currentStep}
                onStepClick={(step) => step <= currentStep && setCurrentStep(step)}
              />
            </div>

            {/* Weight Warning */}
            {showWeightWarning && (
              <div className="mb-4">
                <GoalWeightWarning
                  currentTotal={currentEmployeeWeight}
                  proposedWeight={parseFloat(formData.weighting) || 0}
                  existingWeight={goal?.weighting || 0}
                  onProceed={handleProceedWithWarning}
                  onCancel={() => {
                    setShowWeightWarning(false);
                    setCurrentStep(2);
                  }}
                />
              </div>
            )}

            {/* Step Content */}
            <div className="flex-1 overflow-y-auto py-4 px-1">
              {currentStep === 0 && (
                <StepClassification
                  goalLevel={formData.goal_level}
                  goalType={formData.goal_type}
                  onLevelChange={(level) => setFormData({ ...formData, goal_level: level })}
                  onTypeChange={(type) => setFormData({ ...formData, goal_type: type })}
                />
              )}

              {currentStep === 1 && (
                <StepDefinition
                  goalLevel={formData.goal_level}
                  formData={{
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    start_date: formData.start_date,
                    due_date: formData.due_date,
                    status: formData.status,
                    employee_id: formData.employee_id,
                    parent_goal_id: formData.parent_goal_id,
                    goal_source: formData.goal_source,
                  }}
                  onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates } as FormData))}
                  employees={employees}
                  parentGoals={parentGoals}
                  jobGoals={jobGoals}
                  onSelectJobGoal={handleSelectJobGoal}
                />
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  {/* AI Metric Suggestions */}
                  {companyId && formData.title && (
                    <AIMetricSuggestionPanel
                      goalTitle={formData.title}
                      goalDescription={formData.description}
                      companyId={companyId}
                      onSelectTemplate={handleAITemplateSelect}
                    />
                  )}
                  
                  <StepMetrics
                    goalType={formData.goal_type}
                    formData={{
                      weighting: formData.weighting,
                      unit_of_measure: formData.unit_of_measure,
                      target_value: formData.target_value,
                      current_value: formData.current_value,
                      measurement_type: formData.measurement_type,
                      threshold_value: formData.threshold_value,
                      stretch_value: formData.stretch_value,
                      threshold_percentage: formData.threshold_percentage,
                      stretch_percentage: formData.stretch_percentage,
                      is_inverse: formData.is_inverse,
                      is_mandatory: formData.is_mandatory,
                      compliance_category: formData.compliance_category,
                      is_weight_required: formData.is_weight_required,
                      inherited_weight_portion: formData.inherited_weight_portion,
                      metric_template_id: formData.metric_template_id,
                    }}
                    onChange={(updates) => setFormData({ ...formData, ...updates })}
                    parentGoalWeight={parentGoalWeight}
                    companyId={companyId}
                    employeeId={formData.goal_level === "individual" ? (formData.employee_id || user?.id) : undefined}
                    existingGoalId={goal?.id}
                    subMetrics={subMetrics}
                    onSubMetricUpdate={updateSubMetric}
                    onInitializeSubMetrics={handleInitializeSubMetrics}
                    compositeProgress={compositeProgress}
                    subMetricProgress={subMetricProgress}
                  />
                </div>
              )}

              {currentStep === 3 && (
                <StepAlignment
                  goalType={formData.goal_type}
                  smartCriteria={{
                    specific: formData.specific,
                    measurable: formData.measurable,
                    achievable: formData.achievable,
                    relevant: formData.relevant,
                    time_bound: formData.time_bound,
                  }}
                  onSmartChange={(updates) => setFormData({ ...formData, ...updates })}
                />
              )}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={loading || !canProceed()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : currentStep === WIZARD_STEPS.length - 1 ? (
                    "Create Goal"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>

      {/* Duplicate Warning Dialog */}
      <GoalDuplicateWarningDialog
        open={showDuplicateWarning}
        onOpenChange={setShowDuplicateWarning}
        similarGoals={similarGoals}
        onProceed={handleProceedWithDuplicates}
      />
    </Dialog>
  );
}
