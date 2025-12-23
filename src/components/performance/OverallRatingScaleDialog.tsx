import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Info, Plus, Trash2, GripVertical, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import type { OverallRatingScale, OverallRatingLevel } from "@/hooks/useRatingScales";

interface OverallRatingScaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingScale: OverallRatingScale | null;
  onSuccess: () => void;
}

const DEFAULT_LEVELS: OverallRatingLevel[] = [
  { value: 1, label: "Needs Improvement", description: "Performance significantly below expectations", color: "#ef4444" },
  { value: 2, label: "Developing", description: "Performance below expectations, improvement needed", color: "#f97316" },
  { value: 3, label: "Meets Expectations", description: "Solid, dependable performance", color: "#eab308" },
  { value: 4, label: "Exceeds Expectations", description: "Consistently performs above requirements", color: "#22c55e" },
  { value: 5, label: "Outstanding", description: "Exceptional performance, role model", color: "#10b981" },
];

const DEFAULT_DISTRIBUTION: Record<string, number> = {
  "1": 5,
  "2": 15,
  "3": 60,
  "4": 15,
  "5": 5,
};

export function OverallRatingScaleDialog({
  open,
  onOpenChange,
  companyId,
  editingScale,
  onSuccess,
}: OverallRatingScaleDialogProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    levels: DEFAULT_LEVELS,
    has_forced_distribution: false,
    distribution_targets: DEFAULT_DISTRIBUTION,
    requires_calibration: true,
    is_default: false,
    is_active: true,
  });

  useEffect(() => {
    if (editingScale) {
      setFormData({
        name: editingScale.name,
        code: editingScale.code,
        description: editingScale.description || "",
        levels: editingScale.levels.length > 0 ? editingScale.levels : DEFAULT_LEVELS,
        has_forced_distribution: editingScale.has_forced_distribution,
        distribution_targets: editingScale.distribution_targets || DEFAULT_DISTRIBUTION,
        requires_calibration: editingScale.requires_calibration,
        is_default: editingScale.is_default,
        is_active: editingScale.is_active,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        levels: DEFAULT_LEVELS,
        has_forced_distribution: false,
        distribution_targets: DEFAULT_DISTRIBUTION,
        requires_calibration: true,
        is_default: false,
        is_active: true,
      });
    }
  }, [editingScale, open]);

  const handleLevelChange = (index: number, field: keyof OverallRatingLevel, value: string | number) => {
    const newLevels = [...formData.levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setFormData({ ...formData, levels: newLevels });
  };

  const addLevel = () => {
    const nextValue = formData.levels.length > 0 
      ? Math.max(...formData.levels.map(l => l.value)) + 1 
      : 1;
    setFormData({
      ...formData,
      levels: [...formData.levels, { value: nextValue, label: "", description: "", color: "#6b7280" }],
    });
  };

  const removeLevel = (index: number) => {
    if (formData.levels.length <= 2) {
      toast.error("Minimum 2 levels required");
      return;
    }
    const newLevels = formData.levels.filter((_, i) => i !== index);
    setFormData({ ...formData, levels: newLevels });
  };

  const handleDistributionChange = (levelValue: number, percentage: number) => {
    setFormData({
      ...formData,
      distribution_targets: {
        ...formData.distribution_targets,
        [String(levelValue)]: percentage,
      },
    });
  };

  const totalDistribution = Object.values(formData.distribution_targets).reduce((sum, val) => sum + (val || 0), 0);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    if (formData.levels.length < 2) {
      toast.error("At least 2 levels are required");
      return;
    }

    if (formData.levels.some(l => !l.label)) {
      toast.error("All levels must have a label");
      return;
    }

    if (formData.has_forced_distribution && Math.abs(totalDistribution - 100) > 0.01) {
      toast.error("Distribution targets must sum to 100%");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        levels: JSON.parse(JSON.stringify(formData.levels)),
        has_forced_distribution: formData.has_forced_distribution,
        distribution_targets: formData.has_forced_distribution ? JSON.parse(JSON.stringify(formData.distribution_targets)) : null,
        requires_calibration: formData.requires_calibration,
        is_default: formData.is_default,
        is_active: formData.is_active,
      };

      if (editingScale) {
        const { error } = await supabase
          .from("overall_rating_scales")
          .update(submitData)
          .eq("id", editingScale.id);

        if (error) throw error;
        toast.success("Overall rating scale updated");
      } else {
        const { error } = await supabase
          .from("overall_rating_scales")
          .insert([{ ...submitData, company_id: companyId }]);

        if (error) throw error;
        toast.success("Overall rating scale created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save scale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FieldWithTooltip = ({ label, tooltip, children }: { label: string; tooltip: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-sm">
              <p className="text-xs leading-relaxed">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {children}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingScale ? "Edit Overall Rating Scale" : "Add Overall Rating Scale"}
          </DialogTitle>
          <DialogDescription>
            Define the final talent categorization scale used after aggregating component scores
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 -mx-6 px-6 overflow-y-auto overscroll-contain">
          <div className="space-y-6 py-2">
            {/* Best Practice Guidance */}
            <Alert className="bg-primary/5 border-primary/20">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Overall rating scales are used for final talent categorization after aggregating component scores. 
                They typically have fewer levels (3-5) and are linked to compensation, succession, and talent decisions.
                Calibration is recommended to ensure consistency across managers.
              </AlertDescription>
            </Alert>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FieldWithTooltip
                label="Name"
                tooltip="Descriptive name for this overall rating scale"
              >
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Annual Performance Rating"
                />
              </FieldWithTooltip>

              <FieldWithTooltip
                label="Code"
                tooltip="Unique identifier for reports and integrations"
              >
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="e.g., ANNUAL_RATING"
                />
              </FieldWithTooltip>
            </div>

            <FieldWithTooltip
              label="Description"
              tooltip="Document when and how this scale should be used"
            >
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose and usage of this overall rating scale..."
                rows={2}
              />
            </FieldWithTooltip>

            {/* Rating Levels */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Rating Levels</Label>
                <Button variant="outline" size="sm" onClick={addLevel}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Level
                </Button>
              </div>

              <div className="space-y-2">
                {formData.levels.map((level, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-grab" />
                    
                    <div className="w-14">
                      <Label className="text-xs text-muted-foreground">Value</Label>
                      <Input
                        type="number"
                        value={level.value}
                        onChange={(e) => handleLevelChange(index, 'value', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>

                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Label</Label>
                      <Input
                        value={level.label}
                        onChange={(e) => handleLevelChange(index, 'label', e.target.value)}
                        placeholder="e.g., Exceeds Expectations"
                        className="h-8"
                      />
                    </div>

                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input
                        value={level.description}
                        onChange={(e) => handleLevelChange(index, 'description', e.target.value)}
                        placeholder="Brief description..."
                        className="h-8"
                      />
                    </div>

                    <div className="w-16">
                      <Label className="text-xs text-muted-foreground">Color</Label>
                      <Input
                        type="color"
                        value={level.color}
                        onChange={(e) => handleLevelChange(index, 'color', e.target.value)}
                        className="h-8 p-1 cursor-pointer"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mt-5"
                      onClick={() => removeLevel(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Calibration Settings */}
            <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
              <Label className="text-base font-medium">Calibration Settings</Label>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requires Calibration</Label>
                  <p className="text-xs text-muted-foreground">
                    Ratings must go through a calibration session before finalization
                  </p>
                </div>
                <Switch
                  checked={formData.requires_calibration}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_calibration: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Forced Distribution</Label>
                  <p className="text-xs text-muted-foreground">
                    Enforce target percentages for each rating level
                  </p>
                </div>
                <Switch
                  checked={formData.has_forced_distribution}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_forced_distribution: checked })}
                />
              </div>

              {formData.has_forced_distribution && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Distribution Targets</Label>
                    <span className={`text-sm font-medium ${Math.abs(totalDistribution - 100) < 0.01 ? 'text-success' : 'text-destructive'}`}>
                      Total: {totalDistribution}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {formData.levels.map((level) => (
                      <div key={level.value} className="space-y-1">
                        <Label className="text-xs truncate block" title={level.label}>
                          {level.label || `Level ${level.value}`}
                        </Label>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={formData.distribution_targets[String(level.value)] || 0}
                            onChange={(e) => handleDistributionChange(level.value, parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Toggles */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                />
                <Label>Set as default</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingScale ? "Update Scale" : "Create Scale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
