import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { useComponentRatingScales, useOverallRatingScales, type RatingMapping } from "@/hooks/useRatingScales";

interface MappingRule {
  overall_level: number;
  min_score: number;
  max_score: number;
}

interface OverallRatingMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingMapping: RatingMapping | null;
  onSuccess: () => void;
}

export function OverallRatingMappingDialog({
  open,
  onOpenChange,
  companyId,
  editingMapping,
  onSuccess,
}: OverallRatingMappingDialogProps) {
  const { t } = useLanguage();
  const { scales: componentScales } = useComponentRatingScales({ companyId });
  const { scales: overallScales } = useOverallRatingScales({ companyId });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    component_scale_id: "",
    overall_scale_id: "",
    mapping_rules: [] as MappingRule[],
    is_active: true,
  });

  const selectedComponentScale = useMemo(() => 
    componentScales.find(s => s.id === formData.component_scale_id),
    [componentScales, formData.component_scale_id]
  );

  const selectedOverallScale = useMemo(() => 
    overallScales.find(s => s.id === formData.overall_scale_id),
    [overallScales, formData.overall_scale_id]
  );

  // Generate default mapping rules when scales are selected
  useEffect(() => {
    if (selectedComponentScale && selectedOverallScale && !editingMapping) {
      const levels = selectedOverallScale.levels;
      const min = selectedComponentScale.min_rating;
      const max = selectedComponentScale.max_rating;
      const range = max - min;
      const step = range / levels.length;

      const defaultRules: MappingRule[] = levels.map((level, index) => ({
        overall_level: level.value,
        min_score: parseFloat((min + step * index).toFixed(2)),
        max_score: parseFloat((min + step * (index + 1) - 0.01).toFixed(2)),
      }));

      // Adjust last level to include max
      if (defaultRules.length > 0) {
        defaultRules[defaultRules.length - 1].max_score = max;
      }

      setFormData(prev => ({ ...prev, mapping_rules: defaultRules }));
    }
  }, [selectedComponentScale, selectedOverallScale, editingMapping]);

  useEffect(() => {
    if (editingMapping) {
      setFormData({
        name: editingMapping.name,
        component_scale_id: editingMapping.component_scale_id,
        overall_scale_id: editingMapping.overall_scale_id,
        mapping_rules: editingMapping.mapping_rules,
        is_active: editingMapping.is_active,
      });
    } else {
      setFormData({
        name: "",
        component_scale_id: "",
        overall_scale_id: "",
        mapping_rules: [],
        is_active: true,
      });
    }
  }, [editingMapping, open]);

  const handleRuleChange = (index: number, field: 'min_score' | 'max_score', value: number) => {
    const newRules = [...formData.mapping_rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFormData({ ...formData, mapping_rules: newRules });
  };

  const validateRules = (): string | null => {
    if (!selectedComponentScale) return "Please select a component scale";
    if (!selectedOverallScale) return "Please select an overall rating scale";
    if (formData.mapping_rules.length === 0) return "Please define mapping rules";

    // Check for gaps or overlaps
    const sortedRules = [...formData.mapping_rules].sort((a, b) => a.min_score - b.min_score);
    
    for (let i = 0; i < sortedRules.length; i++) {
      if (sortedRules[i].min_score > sortedRules[i].max_score) {
        return `Level ${sortedRules[i].overall_level}: min score must be less than max score`;
      }
      
      if (i > 0) {
        const gap = sortedRules[i].min_score - sortedRules[i - 1].max_score;
        if (gap > 0.02) {
          return `Gap detected between levels (${sortedRules[i - 1].max_score} to ${sortedRules[i].min_score})`;
        }
        if (gap < -0.02) {
          return `Overlap detected between levels`;
        }
      }
    }

    // Check coverage
    if (sortedRules[0].min_score > selectedComponentScale.min_rating + 0.1) {
      return `Mapping should start from ${selectedComponentScale.min_rating}`;
    }
    if (sortedRules[sortedRules.length - 1].max_score < selectedComponentScale.max_rating - 0.1) {
      return `Mapping should cover up to ${selectedComponentScale.max_rating}`;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    const validationError = validateRules();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        name: formData.name,
        component_scale_id: formData.component_scale_id,
        overall_scale_id: formData.overall_scale_id,
        mapping_rules: JSON.parse(JSON.stringify(formData.mapping_rules)),
        is_active: formData.is_active,
      };

      if (editingMapping) {
        const { error } = await supabase
          .from("overall_rating_mappings")
          .update(submitData)
          .eq("id", editingMapping.id);

        if (error) throw error;
        toast.success("Mapping updated");
      } else {
        const { error } = await supabase
          .from("overall_rating_mappings")
          .insert([{ ...submitData, company_id: companyId }]);

        if (error) throw error;
        toast.success("Mapping created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save mapping");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingMapping ? "Edit Score Mapping" : "Create Score Mapping"}
          </DialogTitle>
          <DialogDescription>
            Define how component scores map to overall rating levels
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 -mx-6 px-6 overflow-y-auto overscroll-contain">
          <div className="space-y-6 py-2">
            <Alert className="bg-muted/50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Score mappings translate aggregated component scores (e.g., 3.75 on a 5-point scale) 
                into overall rating categories (e.g., "Exceeds Expectations"). This enables consistent 
                final ratings across different evaluation components.
              </AlertDescription>
            </Alert>

            {/* Name */}
            <div className="space-y-2">
              <Label>Mapping Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Standard 5-Point to Overall Mapping"
              />
            </div>

            {/* Scale Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Component Scale (Source)</Label>
                <Select
                  value={formData.component_scale_id}
                  onValueChange={(v) => setFormData({ ...formData, component_scale_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {componentScales.map((scale) => (
                      <SelectItem key={scale.id} value={scale.id}>
                        {scale.name} ({scale.min_rating}-{scale.max_rating})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Overall Rating Scale (Target)</Label>
                <Select
                  value={formData.overall_scale_id}
                  onValueChange={(v) => setFormData({ ...formData, overall_scale_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select overall scale" />
                  </SelectTrigger>
                  <SelectContent>
                    {overallScales.map((scale) => (
                      <SelectItem key={scale.id} value={scale.id}>
                        {scale.name} ({scale.levels.length} levels)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Visual Mapping */}
            {selectedOverallScale && selectedComponentScale && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Score Range Mapping</Label>
                
                <div className="space-y-2">
                  {selectedOverallScale.levels
                    .sort((a, b) => a.value - b.value)
                    .map((level, index) => {
                      const rule = formData.mapping_rules.find(r => r.overall_level === level.value) || {
                        overall_level: level.value,
                        min_score: 0,
                        max_score: 0,
                      };
                      
                      return (
                        <div 
                          key={level.value} 
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min={selectedComponentScale.min_rating}
                                max={selectedComponentScale.max_rating}
                                value={rule.min_score}
                                onChange={(e) => {
                                  const ruleIndex = formData.mapping_rules.findIndex(r => r.overall_level === level.value);
                                  if (ruleIndex >= 0) {
                                    handleRuleChange(ruleIndex, 'min_score', parseFloat(e.target.value) || 0);
                                  }
                                }}
                                className="w-20 h-8"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="number"
                                step="0.01"
                                min={selectedComponentScale.min_rating}
                                max={selectedComponentScale.max_rating}
                                value={rule.max_score}
                                onChange={(e) => {
                                  const ruleIndex = formData.mapping_rules.findIndex(r => r.overall_level === level.value);
                                  if (ruleIndex >= 0) {
                                    handleRuleChange(ruleIndex, 'max_score', parseFloat(e.target.value) || 0);
                                  }
                                }}
                                className="w-20 h-8"
                              />
                            </div>

                            <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />

                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: level.color }}
                              />
                              <span className="font-medium">{level.label}</span>
                              <span className="text-xs text-muted-foreground">({level.value})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <p className="text-xs text-muted-foreground">
                  Component scale range: {selectedComponentScale.min_rating} - {selectedComponentScale.max_rating}
                </p>
              </div>
            )}

            {/* Active Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : editingMapping ? "Update Mapping" : "Create Mapping"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
