import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Info, Lightbulb, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

interface RatingScale {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  min_rating: number;
  max_rating: number;
  rating_labels: any;
  is_default: boolean;
  is_active: boolean;
}

interface RatingLabel {
  label: string;
  description: string;
}

type ScaleType = "five_point" | "four_point" | "three_point" | "ten_point" | "custom";

interface ScalePreset {
  type: ScaleType;
  name: string;
  min: number;
  max: number;
  labels: Record<string, RatingLabel>;
  guidance: string;
  icon: "info" | "lightbulb" | "alert";
}

const SCALE_PRESETS: ScalePreset[] = [
  {
    type: "five_point",
    name: "5-Point Likert (Recommended)",
    min: 1,
    max: 5,
    labels: {
      "1": { label: "Unsatisfactory", description: "Performance significantly below expectations; requires immediate improvement" },
      "2": { label: "Needs Improvement", description: "Performance below expectations; development plan recommended" },
      "3": { label: "Meets Expectations", description: "Solid, dependable performance that meets job requirements" },
      "4": { label: "Exceeds Expectations", description: "Consistently performs above job requirements" },
      "5": { label: "Exceptional", description: "Outstanding performance; role model for others" },
    },
    guidance: "Industry standard. Use calibration sessions to prevent central tendency bias (raters clustering at 3).",
    icon: "lightbulb",
  },
  {
    type: "four_point",
    name: "4-Point Forced Choice",
    min: 1,
    max: 4,
    labels: {
      "1": { label: "Does Not Meet", description: "Performance does not meet minimum requirements" },
      "2": { label: "Partially Meets", description: "Some expectations met, improvement needed" },
      "3": { label: "Fully Meets", description: "Meets all position requirements" },
      "4": { label: "Exceeds", description: "Consistently exceeds expectations" },
    },
    guidance: "Eliminates neutral middle option, forcing clearer evaluation decisions. Reduces rating inflation.",
    icon: "info",
  },
  {
    type: "three_point",
    name: "3-Point Simplified",
    min: 1,
    max: 3,
    labels: {
      "1": { label: "Below Expectations", description: "Performance requires improvement" },
      "2": { label: "On Track", description: "Meeting performance expectations" },
      "3": { label: "Exceeding", description: "Surpassing performance expectations" },
    },
    guidance: "Best for quick check-ins and agile environments with frequent feedback cycles.",
    icon: "info",
  },
  {
    type: "ten_point",
    name: "10-Point Numeric",
    min: 1,
    max: 10,
    labels: {
      "1": { label: "1", description: "Critical performance issues" },
      "2": { label: "2", description: "Significant improvement needed" },
      "3": { label: "3", description: "Below expectations" },
      "4": { label: "4", description: "Approaching expectations" },
      "5": { label: "5", description: "Meets basic expectations" },
      "6": { label: "6", description: "Fully competent" },
      "7": { label: "7", description: "Good performance" },
      "8": { label: "8", description: "Strong performance" },
      "9": { label: "9", description: "Excellent performance" },
      "10": { label: "10", description: "Outstanding, top performer" },
    },
    guidance: "Provides granular differentiation but may increase rating fatigue. Best for detailed technical evaluations.",
    icon: "alert",
  },
];

interface EnhancedRatingScaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingScale: RatingScale | null;
  onSuccess: () => void;
}

export function EnhancedRatingScaleDialog({
  open,
  onOpenChange,
  companyId,
  editingScale,
  onSuccess,
}: EnhancedRatingScaleDialogProps) {
  const { t } = useLanguage();
  const [scaleType, setScaleType] = useState<ScaleType>("five_point");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    min_rating: 1,
    max_rating: 5,
    rating_labels: {} as Record<string, RatingLabel>,
    is_default: false,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current preset based on scale type
  const currentPreset = useMemo(() => {
    return SCALE_PRESETS.find(p => p.type === scaleType);
  }, [scaleType]);

  // Generate rating levels based on min/max
  const ratingLevels = useMemo(() => {
    const levels: number[] = [];
    for (let i = formData.min_rating; i <= formData.max_rating; i++) {
      levels.push(i);
    }
    return levels;
  }, [formData.min_rating, formData.max_rating]);

  // Initialize form data when dialog opens
  useEffect(() => {
    if (editingScale) {
      // Editing existing scale
      const labels = typeof editingScale.rating_labels === 'object' && editingScale.rating_labels !== null
        ? editingScale.rating_labels as Record<string, RatingLabel>
        : {};
      
      setFormData({
        name: editingScale.name,
        code: editingScale.code,
        description: editingScale.description || "",
        min_rating: editingScale.min_rating,
        max_rating: editingScale.max_rating,
        rating_labels: labels,
        is_default: editingScale.is_default,
        is_active: editingScale.is_active,
      });
      
      // Determine scale type from existing data
      const matchingPreset = SCALE_PRESETS.find(
        p => p.min === editingScale.min_rating && p.max === editingScale.max_rating
      );
      setScaleType(matchingPreset?.type || "custom");
    } else {
      // New scale - default to 5-point
      const defaultPreset = SCALE_PRESETS.find(p => p.type === "five_point")!;
      setScaleType("five_point");
      setFormData({
        name: "",
        code: "",
        description: "",
        min_rating: defaultPreset.min,
        max_rating: defaultPreset.max,
        rating_labels: { ...defaultPreset.labels },
        is_default: false,
        is_active: true,
      });
    }
  }, [editingScale, open]);

  // Handle scale type change
  const handleScaleTypeChange = (type: ScaleType) => {
    setScaleType(type);
    
    if (type !== "custom") {
      const preset = SCALE_PRESETS.find(p => p.type === type);
      if (preset) {
        setFormData(prev => ({
          ...prev,
          min_rating: preset.min,
          max_rating: preset.max,
          rating_labels: { ...preset.labels },
        }));
      }
    }
  };

  // Handle min/max rating change (for custom)
  const handleRatingRangeChange = (field: "min_rating" | "max_rating", value: number) => {
    const newFormData = { ...formData, [field]: value };
    
    // Ensure min < max
    if (field === "min_rating" && value >= formData.max_rating) {
      newFormData.max_rating = value + 1;
    } else if (field === "max_rating" && value <= formData.min_rating) {
      newFormData.min_rating = value - 1;
    }
    
    // Generate empty labels for new range
    const newLabels: Record<string, RatingLabel> = {};
    for (let i = newFormData.min_rating; i <= newFormData.max_rating; i++) {
      newLabels[String(i)] = formData.rating_labels[String(i)] || { label: "", description: "" };
    }
    newFormData.rating_labels = newLabels;
    
    setFormData(newFormData);
    setScaleType("custom");
  };

  // Handle label change
  const handleLabelChange = (level: number, field: "label" | "description", value: string) => {
    setFormData(prev => ({
      ...prev,
      rating_labels: {
        ...prev.rating_labels,
        [String(level)]: {
          ...prev.rating_labels[String(level)],
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error(t("common.fillRequiredFields", "Name and code are required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        min_rating: formData.min_rating,
        max_rating: formData.max_rating,
        rating_labels: JSON.parse(JSON.stringify(formData.rating_labels)) as Json,
        is_default: formData.is_default,
        is_active: formData.is_active,
      };

      if (editingScale) {
        const { error } = await supabase
          .from("performance_rating_scales")
          .update(submitData)
          .eq("id", editingScale.id);

        if (error) throw error;
        toast.success(t("performance.setup.scaleUpdated", "Rating scale updated"));
      } else {
        const { error } = await supabase
          .from("performance_rating_scales")
          .insert([{ ...submitData, company_id: companyId }]);

        if (error) throw error;
        toast.success(t("performance.setup.scaleCreated", "Rating scale created"));
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("performance.setup.scaleSaveError", "Failed to save rating scale"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tooltip wrapper component
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

  // Visual Scale Preview
  const ScalePreview = () => (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{t("performance.setup.scalePreview", "Scale Preview")}</span>
      </div>
      <div className="flex items-center justify-between gap-1">
        {ratingLevels.map((level, index) => {
          const labelData = formData.rating_labels[String(level)];
          const isFirst = index === 0;
          const isLast = index === ratingLevels.length - 1;
          
          // Color gradient from red to green
          const hue = (index / (ratingLevels.length - 1)) * 120; // 0 = red, 120 = green
          
          return (
            <TooltipProvider key={level}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all cursor-pointer hover:scale-110",
                        "text-foreground"
                      )}
                      style={{ 
                        backgroundColor: `hsla(${hue}, 70%, 85%, 0.5)`,
                        borderColor: `hsl(${hue}, 70%, 50%)`,
                      }}
                    >
                      {level}
                    </div>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-16 truncate">
                      {labelData?.label || `Level ${level}`}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{labelData?.label || `Level ${level}`}</p>
                  {labelData?.description && (
                    <p className="text-xs text-muted-foreground mt-1">{labelData.description}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      {/* Connection line */}
      <div className="relative mt-1 mx-4">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-destructive via-warning to-success rounded-full" />
      </div>
    </div>
  );

  // Guidance Alert
  const GuidanceAlert = () => {
    if (!currentPreset && scaleType === "custom") {
      return (
        <Alert className="bg-muted/50 border-muted">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {t("performance.setup.customGuidance", "Configure your own scale range. Ensure all raters understand the scale definition and provide clear behavioral anchors for each level.")}
          </AlertDescription>
        </Alert>
      );
    }

    if (!currentPreset) return null;

    const Icon = currentPreset.icon === "lightbulb" ? Lightbulb : 
                 currentPreset.icon === "alert" ? AlertCircle : Info;
    
    const alertClass = currentPreset.icon === "lightbulb" ? "bg-primary/5 border-primary/20" :
                       currentPreset.icon === "alert" ? "bg-warning/5 border-warning/20" :
                       "bg-muted/50 border-muted";

    return (
      <Alert className={alertClass}>
        <Icon className="h-4 w-4" />
        <AlertDescription className="text-xs">
          {currentPreset.guidance}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingScale 
              ? t("performance.setup.editRatingScale", "Edit Rating Scale") 
              : t("performance.setup.addRatingScale", "Add Rating Scale")}
          </DialogTitle>
          <DialogDescription>
            {t("performance.setup.ratingScaleDialogDesc", "Configure the rating scale settings used in performance evaluations")}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0 -mx-6 px-6">
          <div className="space-y-6 py-2">
            {/* Scale Type Selector */}
            <FieldWithTooltip
              label={t("performance.setup.scaleType", "Scale Type")}
              tooltip={t("performance.setup.scaleTypeTooltip", "Select a preset configuration for quick setup, or choose Custom for manual configuration")}
            >
              <Select value={scaleType} onValueChange={(v) => handleScaleTypeChange(v as ScaleType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCALE_PRESETS.map((preset) => (
                    <SelectItem key={preset.type} value={preset.type}>
                      {preset.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">
                    {t("performance.setup.custom", "Custom")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldWithTooltip>

            {/* Guidance Alert */}
            <GuidanceAlert />

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FieldWithTooltip
                label={t("common.name", "Name")}
                tooltip={t("performance.setup.nameTooltip", "Choose a descriptive name that reflects the scale type and purpose (e.g., 'Annual Review Scale')")}
              >
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Standard 5-Point Scale"
                />
              </FieldWithTooltip>

              <FieldWithTooltip
                label={t("common.code", "Code")}
                tooltip={t("performance.setup.codeTooltip", "Unique identifier for reports and API integrations. Use UPPERCASE_SNAKE_CASE (e.g., SCALE_5PT)")}
              >
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="e.g., SCALE_5PT"
                />
              </FieldWithTooltip>
            </div>

            <FieldWithTooltip
              label={t("common.description", "Description")}
              tooltip={t("performance.setup.descriptionTooltip", "Document the intended use case and when this scale should be applied")}
            >
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("performance.setup.descriptionPlaceholder", "Describe when and how this scale should be used...")}
                rows={2}
              />
            </FieldWithTooltip>

            {/* Rating Range (for custom) */}
            {scaleType === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <FieldWithTooltip
                  label={t("performance.setup.minRating", "Min Rating")}
                  tooltip={t("performance.setup.minRatingTooltip", "Lowest possible score. Industry standard is 1.")}
                >
                  <Input
                    type="number"
                    value={formData.min_rating}
                    onChange={(e) => handleRatingRangeChange("min_rating", parseInt(e.target.value) || 1)}
                    min={0}
                    max={9}
                  />
                </FieldWithTooltip>

                <FieldWithTooltip
                  label={t("performance.setup.maxRating", "Max Rating")}
                  tooltip={t("performance.setup.maxRatingTooltip", "Highest possible score. Common values: 5 (balanced), 4 (no middle), 3 (simplified), 10 (granular).")}
                >
                  <Input
                    type="number"
                    value={formData.max_rating}
                    onChange={(e) => handleRatingRangeChange("max_rating", parseInt(e.target.value) || 5)}
                    min={formData.min_rating + 1}
                    max={10}
                  />
                </FieldWithTooltip>
              </div>
            )}

            {/* Visual Preview */}
            <ScalePreview />

            <Separator />

            {/* Rating Labels Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Label className="text-base font-medium">
                  {t("performance.setup.ratingLabels", "Rating Labels")}
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        {t("performance.setup.ratingLabelsTooltip", "Define clear behavioral anchors for each rating level. These labels will be shown to raters during evaluations.")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="space-y-3">
                {ratingLevels.map((level) => {
                  const labelData = formData.rating_labels[String(level)] || { label: "", description: "" };
                  // Color gradient from red to green
                  const hue = ((level - formData.min_rating) / (formData.max_rating - formData.min_rating)) * 120;
                  
                  return (
                    <div 
                      key={level} 
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 mt-1"
                        style={{ 
                          backgroundColor: `hsla(${hue}, 70%, 85%, 0.5)`,
                          borderColor: `hsl(${hue}, 70%, 50%)`,
                          borderWidth: '2px',
                        }}
                      >
                        {level}
                      </div>
                      <div className="flex-1 grid gap-2">
                        <Input
                          value={labelData.label}
                          onChange={(e) => handleLabelChange(level, "label", e.target.value)}
                          placeholder={t("performance.setup.labelPlaceholder", "e.g., Exceeds Expectations")}
                          className="font-medium"
                        />
                        <Input
                          value={labelData.description}
                          onChange={(e) => handleLabelChange(level, "description", e.target.value)}
                          placeholder={t("performance.setup.behaviorPlaceholder", "Describe expected behaviors at this level...")}
                          className="text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Switches */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_default}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                        />
                        <Label className="cursor-pointer">{t("common.default", "Default")}</Label>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        {t("performance.setup.defaultTooltip", "Auto-applies to new reviews when no scale is specified")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label className="cursor-pointer">{t("common.active", "Active")}</Label>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-xs">
                        {t("performance.setup.activeTooltip", "Inactive scales are hidden but preserved for historical records")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving", "Saving...") : t("common.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
