import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getTodayString } from "@/utils/dateUtils";
import { GoalEnhancedMetricsTab } from "./GoalEnhancedMetricsTab";
import {
  MeasurementType,
  ComplianceCategory,
  GoalExtendedAttributes,
  GOAL_LEVEL_LABELS,
} from "@/types/goalEnhancements";
import {
  parseExtendedAttributes,
  serializeExtendedAttributes,
  getDisplayCategory,
} from "@/utils/goalCalculations";

type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type GoalType = 'okr_objective' | 'okr_key_result' | 'smart_goal';
type GoalLevel = 'company' | 'department' | 'team' | 'individual' | 'project';
type DbGoalLevel = 'company' | 'department' | 'team' | 'individual';
type GoalSource = 'cascaded' | 'manager_assigned' | 'self_created';

// Map UI goal levels to DB-compatible values
const mapGoalLevelToDb = (level: GoalLevel): DbGoalLevel => {
  if (level === 'project') return 'team'; // Store as team, actual level in extended attrs
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
  // Enhanced attributes
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
  const [parentGoals, setParentGoals] = useState<{ id: string; title: string }[]>([]);
  const [jobGoals, setJobGoals] = useState<JobGoal[]>([]);
  const [parentGoalWeight, setParentGoalWeight] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    employee_id: "",
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    time_bound: "",
    // Enhanced attributes
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

  // Fetch job goals for selected employee
  const fetchJobGoalsForEmployee = async (employeeId: string) => {
    if (!employeeId) {
      setJobGoals([]);
      return;
    }

    try {
      // Get employee's current position and its job family
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

      // Get jobs in this job family
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

      // Get job goals for these jobs
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
        // Restore actual goal level from extended attrs if available
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
    } else {
      const initialEmployeeId = user?.id || "";
      setFormData({
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
        employee_id: initialEmployeeId,
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
      // Fetch job goals immediately for the initial employee
      if (initialEmployeeId && open) {
        fetchJobGoalsForEmployee(initialEmployeeId);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !user?.id) return;

    setLoading(true);
    try {
      // Build extended attributes - include actual goal level if it's "project"
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
        // Store actual goal level if different from DB value
        actualGoalLevel: formData.goal_level === 'project' ? 'project' : undefined,
      };

      // Serialize extended attrs with legacy category
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

      if (goal) {
        const { error } = await supabase
          .from("performance_goals")
          .update(goalData)
          .eq("id", goal.id);

        if (error) throw error;

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

        await logAction({
          action: "CREATE",
          entityType: "performance_goal",
          entityId: data.id,
          entityName: formData.title,
          newValues: goalData,
        });

        toast.success("Goal created successfully");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="smart">SMART Criteria</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Employee Selector - only for individual goals */}
                {formData.goal_level === "individual" && (
                  <div className="col-span-2">
                    <Label htmlFor="employee_id">Employee *</Label>
                    <Select
                      value={formData.employee_id || "none"}
                      onValueChange={(value) => setFormData({ ...formData, employee_id: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select an employee</SelectItem>
                        {employees.length > 0 ? (
                          employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.full_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-employees" disabled>
                            No employees found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Job Goals Suggestions */}
                {jobGoals.length > 0 && (
                  <div className="col-span-2">
                    <Label>Suggested Goals from Job</Label>
                    <div className="mt-2 p-3 border rounded-md bg-muted/30 max-h-32 overflow-y-auto">
                      <p className="text-xs text-muted-foreground mb-2">Click a goal to use it as a template:</p>
                      <div className="space-y-1">
                        {jobGoals.map((jg) => (
                          <button
                            type="button"
                            key={jg.id}
                            onClick={() => setFormData({
                              ...formData,
                              title: jg.goal_name,
                              description: jg.goal_description || "",
                              weighting: String(jg.weighting || 10),
                            })}
                            className="w-full text-left p-2 text-sm rounded hover:bg-accent transition-colors"
                          >
                            <span className="font-medium">{jg.goal_name}</span>
                            {jg.weighting && (
                              <span className="text-xs text-muted-foreground ml-2">({jg.weighting}%)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter goal title"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the goal..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="goal_type">Goal Type *</Label>
                  <Select
                    value={formData.goal_type}
                    onValueChange={(value: GoalType) => setFormData({ ...formData, goal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smart_goal">SMART Goal</SelectItem>
                      <SelectItem value="okr_objective">OKR Objective</SelectItem>
                      <SelectItem value="okr_key_result">Key Result</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal_level">Level *</Label>
                  <Select
                    value={formData.goal_level}
                    onValueChange={(value: GoalLevel) => setFormData({ ...formData, goal_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="project">Project / Initiative</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="company">Company / Strategic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="goal_source">Source</Label>
                  <Select
                    value={formData.goal_source}
                    onValueChange={(value: GoalSource) => setFormData({ ...formData, goal_source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_created">Self-Created</SelectItem>
                      <SelectItem value="manager_assigned">Manager Assigned</SelectItem>
                      <SelectItem value="cascaded">Cascaded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: GoalStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Sales, Development"
                  />
                </div>

                <div>
                  <Label htmlFor="parent_goal_id">Align to Parent Goal</Label>
                  <Select
                    value={formData.parent_goal_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, parent_goal_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {parentGoals.map((pg) => (
                        <SelectItem key={pg.id} value={pg.id}>
                          {pg.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-4">
              <GoalEnhancedMetricsTab
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
              />
            </TabsContent>

            <TabsContent value="smart" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="specific">Specific</Label>
                  <Textarea
                    id="specific"
                    value={formData.specific}
                    onChange={(e) => setFormData({ ...formData, specific: e.target.value })}
                    placeholder="What exactly do you want to accomplish?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="measurable">Measurable</Label>
                  <Textarea
                    id="measurable"
                    value={formData.measurable}
                    onChange={(e) => setFormData({ ...formData, measurable: e.target.value })}
                    placeholder="How will you measure success?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="achievable">Achievable</Label>
                  <Textarea
                    id="achievable"
                    value={formData.achievable}
                    onChange={(e) => setFormData({ ...formData, achievable: e.target.value })}
                    placeholder="Is this goal realistic and attainable?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="relevant">Relevant</Label>
                  <Textarea
                    id="relevant"
                    value={formData.relevant}
                    onChange={(e) => setFormData({ ...formData, relevant: e.target.value })}
                    placeholder="Why is this goal important?"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="time_bound">Time-Bound</Label>
                  <Textarea
                    id="time_bound"
                    value={formData.time_bound}
                    onChange={(e) => setFormData({ ...formData, time_bound: e.target.value })}
                    placeholder="What is the deadline?"
                    rows={2}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : goal ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
