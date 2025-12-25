import { useEffect, useState, useCallback } from "react";
import { GoalEnhancedMetricsTab } from "../GoalEnhancedMetricsTab";
import { GoalWeightSummary } from "../GoalWeightSummary";
import { TYPE_FIELD_CONFIG, GoalType } from "./LevelFieldConfig";
import { MeasurementType, ComplianceCategory, SubMetricDefinition } from "@/types/goalEnhancements";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WeightSummary } from "@/hooks/useGoalWeights";
import { useGoalSubMetrics, GoalSubMetricValue } from "@/hooks/useGoalSubMetrics";

interface MetricsFormData {
  weighting: string;
  unit_of_measure: string;
  target_value: string;
  current_value: string;
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

interface StepMetricsProps {
  goalType: GoalType;
  formData: MetricsFormData;
  onChange: (updates: Partial<MetricsFormData>) => void;
  parentGoalWeight: number | null;
  companyId: string | undefined;
  employeeId?: string;
  existingGoalId?: string;
  // Sub-metrics support
  subMetrics?: GoalSubMetricValue[];
  onSubMetricUpdate?: (index: number, updates: Partial<GoalSubMetricValue>) => void;
  onInitializeSubMetrics?: (templateSubMetrics: SubMetricDefinition[]) => void;
  compositeProgress?: number;
  subMetricProgress?: { name: string; progress: number; weight: number }[];
}

export function StepMetrics({
  goalType,
  formData,
  onChange,
  parentGoalWeight,
  companyId,
  employeeId,
  existingGoalId,
  subMetrics,
  onSubMetricUpdate,
  onInitializeSubMetrics,
  compositeProgress = 0,
  subMetricProgress = [],
}: StepMetricsProps) {
  const typeConfig = TYPE_FIELD_CONFIG[goalType];
  const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null);

  // Fetch current weight allocation for the employee
  useEffect(() => {
    if (!employeeId || !companyId) {
      setWeightSummary(null);
      return;
    }

    const fetchWeights = async () => {
      try {
        const { data: goals } = await supabase
          .from("performance_goals")
          .select("id, weighting")
          .eq("company_id", companyId)
          .eq("goal_level", "individual")
          .eq("employee_id", employeeId)
          .in("status", ["draft", "active", "in_progress"]);

        const existingTotal = (goals || [])
          .filter(g => g.id !== existingGoalId)
          .reduce((sum, g) => sum + (g.weighting || 0), 0);

        const proposedWeight = parseFloat(formData.weighting) || 0;
        const projectedTotal = existingTotal + proposedWeight;

        setWeightSummary({
          totalWeight: projectedTotal,
          remainingWeight: 100 - projectedTotal,
          status: projectedTotal === 100 ? "complete" : projectedTotal < 100 ? "under" : "over",
          goalCount: (goals || []).length + (existingGoalId ? 0 : 1),
          requiredGoalCount: 0,
        });
      } catch (error) {
        console.error("Error fetching weights:", error);
      }
    };

    fetchWeights();
  }, [employeeId, companyId, formData.weighting, existingGoalId]);

  return (
    <div className="space-y-4">
      {/* Weight Summary for Individual Goals */}
      {employeeId && weightSummary && (
        <GoalWeightSummary
          summary={weightSummary}
          showDetails={true}
          compact={false}
        />
      )}

      {/* Context-aware header based on goal type */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border flex items-start gap-2">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          {goalType === "smart_goal" && (
            <>
              <span className="font-medium text-foreground">SMART Goal Metrics:</span>{" "}
              Define quantitative targets, thresholds, and stretch goals to measure progress objectively.
            </>
          )}
          {goalType === "okr_objective" && (
            <>
              <span className="font-medium text-foreground">OKR Objective:</span>{" "}
              Objectives are typically qualitative. Define the weight and mandatory status. Key Results will provide the metrics.
            </>
          )}
          {goalType === "okr_key_result" && (
            <>
              <span className="font-medium text-foreground">Key Result Metrics:</span>{" "}
              Key Results must be quantifiable. Set clear target values and thresholds for measurement.
            </>
          )}
        </div>
      </div>

      {/* Metrics Tab - Pass sub-metrics props */}
      <GoalEnhancedMetricsTab
        formData={formData}
        onChange={onChange}
        parentGoalWeight={parentGoalWeight}
        companyId={companyId}
        subMetrics={subMetrics}
        onSubMetricUpdate={onSubMetricUpdate}
        onInitializeSubMetrics={onInitializeSubMetrics}
        compositeProgress={compositeProgress}
        subMetricProgress={subMetricProgress}
      />

      {/* Additional context for OKR objectives */}
      {goalType === "okr_objective" && (
        <div className="p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">Next step:</span>{" "}
            After creating this objective, you can add Key Results to track measurable progress.
          </p>
        </div>
      )}
    </div>
  );
}
