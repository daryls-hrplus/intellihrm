import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingDown, TrendingUp, AlertTriangle, Target, CheckCircle } from "lucide-react";
import {
  MeasurementType,
  ComplianceCategory,
  MEASUREMENT_TYPE_LABELS,
  COMPLIANCE_CATEGORY_LABELS,
  MetricTemplate,
} from "@/types/goalEnhancements";
import { useMetricTemplates } from "@/hooks/useMetricTemplates";

interface EnhancedMetricsFormData {
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

interface GoalEnhancedMetricsTabProps {
  formData: EnhancedMetricsFormData;
  onChange: (updates: Partial<EnhancedMetricsFormData>) => void;
  parentGoalWeight?: number | null;
  companyId?: string;
}

export function GoalEnhancedMetricsTab({
  formData,
  onChange,
  parentGoalWeight,
  companyId,
}: GoalEnhancedMetricsTabProps) {
  const { templates, getActiveTemplates, getTemplateById } = useMetricTemplates(companyId);
  const activeTemplates = getActiveTemplates();

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") {
      onChange({ metric_template_id: "" });
      return;
    }

    const template = getTemplateById(templateId);
    if (template) {
      onChange({
        metric_template_id: templateId,
        measurement_type: template.measurementType,
        unit_of_measure: template.unitOfMeasure || "",
        threshold_percentage: String(template.thresholdPercentage),
        stretch_percentage: String(template.stretchPercentage),
        is_inverse: template.isInverse,
        target_value: template.defaultTarget ? String(template.defaultTarget) : formData.target_value,
      });
    }
  };

  // Calculate inherited weight preview
  const inheritedWeightPreview = parentGoalWeight && formData.inherited_weight_portion
    ? (parentGoalWeight * parseFloat(formData.inherited_weight_portion) / 100).toFixed(1)
    : null;

  // Calculate threshold/stretch values from percentages
  const targetNum = parseFloat(formData.target_value) || 0;
  const thresholdFromPct = targetNum * (parseFloat(formData.threshold_percentage) || 80) / 100;
  const stretchFromPct = targetNum * (parseFloat(formData.stretch_percentage) || 120) / 100;

  return (
    <div className="space-y-6">
      {/* Metric Template Selector */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <Label className="text-sm font-medium">Apply Metric Template</Label>
          <Select
            value={formData.metric_template_id || "none"}
            onValueChange={handleTemplateSelect}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No template</SelectItem>
              {activeTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    <span>{template.name}</span>
                    {template.isInverse && <TrendingDown className="h-3 w-3 text-muted-foreground" />}
                    {template.category && (
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Templates pre-fill measurement settings for common goal types
          </p>
        </CardContent>
      </Card>

      {/* Measurement Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Measurement Type</Label>
          <div className="flex gap-2 mt-2">
            {(Object.keys(MEASUREMENT_TYPE_LABELS) as MeasurementType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ measurement_type: type })}
                className={`flex-1 p-3 rounded-lg border text-sm transition-colors ${
                  formData.measurement_type === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium">{MEASUREMENT_TYPE_LABELS[type]}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {type === "quantitative" && "Number-based tracking"}
                  {type === "qualitative" && "Rating scale (1-5)"}
                  {type === "binary" && "Pass or Fail"}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quantitative Metrics */}
      {formData.measurement_type === "quantitative" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                value={formData.target_value}
                onChange={(e) => onChange({ target_value: e.target.value })}
                placeholder="Target to achieve"
              />
            </div>

            <div>
              <Label htmlFor="unit_of_measure">Unit of Measure</Label>
              <Input
                id="unit_of_measure"
                value={formData.unit_of_measure}
                onChange={(e) => onChange({ unit_of_measure: e.target.value })}
                placeholder="e.g., %, $, units"
              />
            </div>

            <div>
              <Label htmlFor="current_value">Current Value</Label>
              <Input
                id="current_value"
                type="number"
                value={formData.current_value}
                onChange={(e) => onChange({ current_value: e.target.value })}
                placeholder="Current progress"
              />
            </div>
          </div>

          {/* Inverse Target Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {formData.is_inverse ? (
                <TrendingDown className="h-5 w-5 text-primary" />
              ) : (
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <Label className="text-base">Inverse Target</Label>
                <p className="text-xs text-muted-foreground">
                  {formData.is_inverse 
                    ? "Lower values are better (e.g., reduce costs, decrease errors)"
                    : "Higher values are better (e.g., increase revenue, improve scores)"
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={formData.is_inverse}
              onCheckedChange={(checked) => onChange({ is_inverse: checked })}
            />
          </div>

          {/* Threshold / Target / Stretch */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-primary" />
                <Label className="text-base">Achievement Zones</Label>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="threshold_percentage" className="text-xs text-warning">
                    Threshold (%)
                  </Label>
                  <Input
                    id="threshold_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.threshold_percentage}
                    onChange={(e) => onChange({ threshold_percentage: e.target.value })}
                    placeholder="80"
                  />
                  {targetNum > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {formData.is_inverse ? "≤" : "≥"} {thresholdFromPct.toFixed(1)} {formData.unit_of_measure}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-xs text-success">Target (100%)</Label>
                  <Input
                    value={formData.target_value}
                    disabled
                    className="bg-muted"
                  />
                  {targetNum > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {formData.is_inverse ? "≤" : "≥"} {targetNum} {formData.unit_of_measure}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stretch_percentage" className="text-xs text-primary">
                    Stretch (%)
                  </Label>
                  <Input
                    id="stretch_percentage"
                    type="number"
                    min="100"
                    max="200"
                    value={formData.stretch_percentage}
                    onChange={(e) => onChange({ stretch_percentage: e.target.value })}
                    placeholder="120"
                  />
                  {targetNum > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {formData.is_inverse ? "≤" : "≥"} {stretchFromPct.toFixed(1)} {formData.unit_of_measure}
                    </p>
                  )}
                </div>
              </div>

              {/* Visual Achievement Bar */}
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                <div 
                  className="absolute h-full bg-destructive/20" 
                  style={{ width: `${parseFloat(formData.threshold_percentage) || 80}%` }}
                />
                <div 
                  className="absolute h-full bg-warning/30" 
                  style={{ 
                    left: `${parseFloat(formData.threshold_percentage) || 80}%`,
                    width: `${100 - (parseFloat(formData.threshold_percentage) || 80)}%`
                  }}
                />
                <div 
                  className="absolute h-full bg-success/30" 
                  style={{ left: '100%', width: `${(parseFloat(formData.stretch_percentage) || 120) - 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-medium">
                  <span className="text-destructive">Below</span>
                  <span className="text-warning">Approaching</span>
                  <span className="text-success">Target</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Binary Goal Info */}
      {formData.measurement_type === "binary" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Binary goals are marked as complete (100%) or incomplete (0%). 
            No partial progress tracking.
          </AlertDescription>
        </Alert>
      )}

      {/* Weighting Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="weighting">Weight (%)</Label>
          <Input
            id="weighting"
            type="number"
            min="0"
            max="100"
            value={formData.weighting}
            onChange={(e) => onChange({ weighting: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <Switch
            id="is_weight_required"
            checked={formData.is_weight_required}
            onCheckedChange={(checked) => onChange({ is_weight_required: checked })}
          />
          <Label htmlFor="is_weight_required" className="text-sm">
            Required for 100% total
          </Label>
        </div>
      </div>

      {/* Weight Inheritance (when parent goal exists) */}
      {parentGoalWeight && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <Label className="text-sm font-medium">Inherit Weight from Parent Goal</Label>
            <p className="text-xs text-muted-foreground mb-3">
              Parent goal weight: {parentGoalWeight}%
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="inherited_weight_portion" className="text-xs">
                  Portion to inherit (%)
                </Label>
                <Input
                  id="inherited_weight_portion"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.inherited_weight_portion}
                  onChange={(e) => onChange({ inherited_weight_portion: e.target.value })}
                  placeholder="e.g., 50"
                />
              </div>
              {inheritedWeightPreview && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{inheritedWeightPreview}%</div>
                  <div className="text-xs text-muted-foreground">Calculated weight</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mandatory/Compliance Section */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <Label className="text-base">Mandatory / Compliance Goal</Label>
                <p className="text-xs text-muted-foreground">
                  Mark as required for regulatory, policy, or audit purposes
                </p>
              </div>
            </div>
            <Switch
              checked={formData.is_mandatory}
              onCheckedChange={(checked) => onChange({ 
                is_mandatory: checked,
                compliance_category: checked ? formData.compliance_category || "policy" : ""
              })}
            />
          </div>

          {formData.is_mandatory && (
            <div>
              <Label htmlFor="compliance_category">Compliance Category</Label>
              <Select
                value={formData.compliance_category || "policy"}
                onValueChange={(value: ComplianceCategory) => onChange({ compliance_category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(COMPLIANCE_CATEGORY_LABELS) as ComplianceCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {COMPLIANCE_CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
