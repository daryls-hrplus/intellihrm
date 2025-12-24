import { GoalEnhancedMetricsTab } from "../GoalEnhancedMetricsTab";
import { TYPE_FIELD_CONFIG, GoalType } from "./LevelFieldConfig";
import { MeasurementType, ComplianceCategory } from "@/types/goalEnhancements";
import { Info } from "lucide-react";

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
}

export function StepMetrics({
  goalType,
  formData,
  onChange,
  parentGoalWeight,
  companyId,
}: StepMetricsProps) {
  const typeConfig = TYPE_FIELD_CONFIG[goalType];

  return (
    <div className="space-y-4">
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

      {/* Metrics Tab - Always show but context varies by type */}
      <GoalEnhancedMetricsTab
        formData={formData}
        onChange={onChange}
        parentGoalWeight={parentGoalWeight}
        companyId={companyId}
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
