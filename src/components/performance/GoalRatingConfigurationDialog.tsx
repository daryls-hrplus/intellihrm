import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Settings, Calculator, Eye, Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGoalRatingConfiguration } from "@/hooks/useGoalRatingConfiguration";
import { useComponentRatingScales } from "@/hooks/useRatingScales";
import {
  CALCULATION_METHOD_LABELS,
  VISIBILITY_LABELS,
  type CalculationMethod,
  type RatingVisibility,
  type GoalRatingConfiguration,
} from "@/types/goalRatings";

interface GoalRatingConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  cycleId?: string | null;
  onSuccess?: () => void;
}

export function GoalRatingConfigurationDialog({
  open,
  onOpenChange,
  companyId,
  cycleId,
  onSuccess,
}: GoalRatingConfigurationDialogProps) {
  const { configuration, hasConfiguration, createConfiguration, updateConfiguration, isLoading } =
    useGoalRatingConfiguration({ companyId, cycleId });
  const { scales: ratingScales } = useComponentRatingScales({ companyId, purpose: "goals" });

  const [formData, setFormData] = useState<Partial<GoalRatingConfiguration>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && configuration) {
      setFormData({
        calculation_method: configuration.calculation_method,
        self_rating_weight: configuration.self_rating_weight,
        manager_rating_weight: configuration.manager_rating_weight,
        progress_weight: configuration.progress_weight,
        hide_ratings_until: configuration.hide_ratings_until,
        show_manager_rating_to_employee: configuration.show_manager_rating_to_employee,
        show_final_score_to_employee: configuration.show_final_score_to_employee,
        requires_employee_acknowledgment: configuration.requires_employee_acknowledgment,
        acknowledgment_deadline_days: configuration.acknowledgment_deadline_days,
        allow_dispute: configuration.allow_dispute,
        dispute_window_days: configuration.dispute_window_days,
        rating_scale_id: configuration.rating_scale_id,
      });
    }
  }, [open, configuration]);

  const handleWeightChange = (field: "self_rating_weight" | "manager_rating_weight" | "progress_weight", value: number) => {
    const newData = { ...formData, [field]: value };
    const total = (newData.self_rating_weight || 0) + (newData.manager_rating_weight || 0) + (newData.progress_weight || 0);
    
    // Auto-adjust to keep total at 100
    if (total > 100) {
      const excess = total - 100;
      if (field === "self_rating_weight") {
        newData.manager_rating_weight = Math.max(0, (newData.manager_rating_weight || 0) - excess);
      } else if (field === "manager_rating_weight") {
        newData.self_rating_weight = Math.max(0, (newData.self_rating_weight || 0) - excess);
      } else {
        newData.manager_rating_weight = Math.max(0, (newData.manager_rating_weight || 0) - excess);
      }
    }
    setFormData(newData);
  };

  const totalWeight = (formData.self_rating_weight || 0) + (formData.manager_rating_weight || 0) + (formData.progress_weight || 0);

  const handleSave = async () => {
    if (totalWeight !== 100 && formData.calculation_method === "weighted_average") {
      toast.error("Weights must sum to 100%");
      return;
    }

    setSaving(true);
    try {
      if (hasConfiguration && configuration.id) {
        const { error } = await updateConfiguration(configuration.id, formData);
        if (error) throw new Error(error);
        toast.success("Rating configuration updated");
      } else {
        const { error } = await createConfiguration(formData);
        if (error) throw new Error(error);
        toast.success("Rating configuration created");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving configuration:", error);
      toast.error(error.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Goal Rating Configuration
          </DialogTitle>
          <DialogDescription>
            Configure how goal ratings are calculated and displayed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Calculation Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">Calculation Method</Label>
            </div>
            <Select
              value={formData.calculation_method}
              onValueChange={(v) => setFormData({ ...formData, calculation_method: v as CalculationMethod })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CALCULATION_METHOD_LABELS).map(([key, { label, description }]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating Scale */}
          <div className="space-y-2">
            <Label>Rating Scale</Label>
            <Select
              value={formData.rating_scale_id || ""}
              onValueChange={(v) => setFormData({ ...formData, rating_scale_id: v || null })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Use default scale" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default (1-5)</SelectItem>
                {ratingScales.map((scale) => (
                  <SelectItem key={scale.id} value={scale.id}>
                    {scale.name} ({scale.min_rating}-{scale.max_rating})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weight Configuration */}
          {formData.calculation_method === "weighted_average" && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">Weight Configuration</Label>
                  <span className={`text-sm font-medium ${totalWeight === 100 ? "text-green-600" : "text-destructive"}`}>
                    Total: {totalWeight}%
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Self Rating Weight</span>
                      <span>{formData.self_rating_weight || 0}%</span>
                    </div>
                    <Slider
                      value={[formData.self_rating_weight || 0]}
                      onValueChange={([v]) => handleWeightChange("self_rating_weight", v)}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Manager Rating Weight</span>
                      <span>{formData.manager_rating_weight || 0}%</span>
                    </div>
                    <Slider
                      value={[formData.manager_rating_weight || 0]}
                      onValueChange={([v]) => handleWeightChange("manager_rating_weight", v)}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress Weight</span>
                      <span>{formData.progress_weight || 0}%</span>
                    </div>
                    <Slider
                      value={[formData.progress_weight || 0]}
                      onValueChange={([v]) => handleWeightChange("progress_weight", v)}
                      max={100}
                      step={5}
                    />
                  </div>
                </div>

                {totalWeight !== 100 && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Weights must sum to 100%
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Visibility Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">Visibility Settings</Label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Hide ratings from employee until</Label>
              <Select
                value={formData.hide_ratings_until}
                onValueChange={(v) => setFormData({ ...formData, hide_ratings_until: v as RatingVisibility })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VISIBILITY_LABELS).map(([key, { label, description }]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div>{label}</div>
                        <div className="text-xs text-muted-foreground">{description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show manager rating to employee</Label>
              <Switch
                checked={formData.show_manager_rating_to_employee}
                onCheckedChange={(v) => setFormData({ ...formData, show_manager_rating_to_employee: v })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Show final score to employee</Label>
              <Switch
                checked={formData.show_final_score_to_employee}
                onCheckedChange={(v) => setFormData({ ...formData, show_final_score_to_employee: v })}
              />
            </div>
          </div>

          <Separator />

          {/* Acknowledgment & Dispute */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">Acknowledgment & Dispute</Label>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm">Require employee acknowledgment</Label>
              <Switch
                checked={formData.requires_employee_acknowledgment}
                onCheckedChange={(v) => setFormData({ ...formData, requires_employee_acknowledgment: v })}
              />
            </div>

            {formData.requires_employee_acknowledgment && (
              <div className="flex items-center gap-4">
                <Label className="text-sm">Acknowledgment deadline (days)</Label>
                <Input
                  type="number"
                  className="w-20"
                  min={1}
                  max={30}
                  value={formData.acknowledgment_deadline_days || 7}
                  onChange={(e) => setFormData({ ...formData, acknowledgment_deadline_days: parseInt(e.target.value) || 7 })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-sm">Allow rating disputes</Label>
              <Switch
                checked={formData.allow_dispute}
                onCheckedChange={(v) => setFormData({ ...formData, allow_dispute: v })}
              />
            </div>

            {formData.allow_dispute && (
              <div className="flex items-center gap-4">
                <Label className="text-sm">Dispute window (days)</Label>
                <Input
                  type="number"
                  className="w-20"
                  min={1}
                  max={30}
                  value={formData.dispute_window_days || 14}
                  onChange={(e) => setFormData({ ...formData, dispute_window_days: parseInt(e.target.value) || 14 })}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || isLoading}>
            {saving ? "Saving..." : hasConfiguration ? "Update Configuration" : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
