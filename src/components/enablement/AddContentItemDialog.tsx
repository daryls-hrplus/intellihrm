import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Sparkles, Clock, FileText, Video, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WorkflowColumn } from "@/types/enablement";

interface AddContentItemDialogProps {
  releaseId?: string;
  onSuccess?: () => void;
}

const MODULES = [
  { code: "WORKFORCE", label: "Workforce Management", icon: "👥" },
  { code: "LEAVE", label: "Leave Management", icon: "🏖️" },
  { code: "PAYROLL", label: "Payroll", icon: "💰" },
  { code: "TIME_ATTENDANCE", label: "Time & Attendance", icon: "⏰" },
  { code: "BENEFITS", label: "Benefits", icon: "🎁" },
  { code: "TRAINING", label: "Training & LMS", icon: "📚" },
  { code: "PERFORMANCE", label: "Performance Management", icon: "📊" },
  { code: "SUCCESSION", label: "Succession Planning", icon: "🎯" },
  { code: "RECRUITMENT", label: "Recruitment", icon: "🔍" },
  { code: "HSE", label: "Health, Safety & Environment", icon: "🦺" },
  { code: "EMPLOYEE_RELATIONS", label: "Employee Relations", icon: "🤝" },
  { code: "PROPERTY", label: "Company Property", icon: "🏢" },
  { code: "ADMIN", label: "Administration", icon: "⚙️" },
];

const PRIORITIES = [
  { value: "critical", label: "Critical", color: "bg-destructive text-destructive-foreground" },
  { value: "high", label: "High", color: "bg-orange-500 text-white" },
  { value: "medium", label: "Medium", color: "bg-yellow-500 text-black" },
  { value: "low", label: "Low", color: "bg-muted text-muted-foreground" },
];

const CONTENT_TYPES = [
  { id: "documentation", label: "Documentation", icon: FileText, defaultHours: 2 },
  { id: "video", label: "Video Tutorial", icon: Video, defaultHours: 4 },
  { id: "scorm", label: "SCORM Package", icon: BookOpen, defaultHours: 6 },
  { id: "dap", label: "DAP Guide", icon: Sparkles, defaultHours: 1 },
];

interface ExistingFeature {
  feature_code: string;
  module_code: string;
}

export function AddContentItemDialog({ releaseId, onSuccess }: AddContentItemDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeatures, setExistingFeatures] = useState<ExistingFeature[]>([]);
  const [isNewFeature, setIsNewFeature] = useState(false);
  
  const [formData, setFormData] = useState({
    module_code: "",
    feature_code: "",
    feature_name: "",
    priority: "medium" as string,
    estimated_hours: "",
    time_estimate_notes: "",
    content_types: [] as string[],
  });

  // Fetch existing features when module changes
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!formData.module_code) {
        setExistingFeatures([]);
        return;
      }

      const { data, error } = await supabase
        .from("enablement_content_status")
        .select("feature_code, module_code")
        .eq("module_code", formData.module_code);

      if (!error && data) {
        // Get unique features
        const unique = Array.from(new Map(data.map(f => [f.feature_code, f])).values());
        setExistingFeatures(unique);
      }
    };

    fetchFeatures();
  }, [formData.module_code]);

  // Filter features based on selected module
  const filteredFeatures = useMemo(() => {
    return existingFeatures.filter(f => f.module_code === formData.module_code);
  }, [existingFeatures, formData.module_code]);

  // Calculate estimated hours based on content types
  const calculatedHours = useMemo(() => {
    if (formData.estimated_hours) return parseFloat(formData.estimated_hours);
    return formData.content_types.reduce((total, typeId) => {
      const type = CONTENT_TYPES.find(t => t.id === typeId);
      return total + (type?.defaultHours || 0);
    }, 0);
  }, [formData.content_types, formData.estimated_hours]);

  const handleModuleChange = (value: string) => {
    setFormData({ 
      ...formData, 
      module_code: value, 
      feature_code: "",
      feature_name: "" 
    });
    setIsNewFeature(false);
  };

  const handleFeatureSelect = (featureCode: string) => {
    if (featureCode === "__new__") {
      setIsNewFeature(true);
      setFormData({ ...formData, feature_code: "", feature_name: "" });
    } else {
      setIsNewFeature(false);
      setFormData({ ...formData, feature_code: featureCode });
    }
  };

  const toggleContentType = (typeId: string) => {
    setFormData(prev => ({
      ...prev,
      content_types: prev.content_types.includes(typeId)
        ? prev.content_types.filter(t => t !== typeId)
        : [...prev.content_types, typeId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const featureCode = isNewFeature ? formData.feature_name : formData.feature_code;
    
    if (!featureCode || !formData.module_code) {
      toast.error("Module and feature are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("enablement_content_status").insert({
        feature_code: featureCode.toUpperCase().replace(/\s+/g, "_"),
        module_code: formData.module_code,
        release_id: releaseId || null,
        workflow_status: "backlog" as WorkflowColumn,
        priority: formData.priority,
        estimated_hours: calculatedHours || null,
        time_estimate_notes: formData.time_estimate_notes || null,
        documentation_status: formData.content_types.includes("documentation") ? "not_started" : "na",
        scorm_lite_status: formData.content_types.includes("scorm") ? "not_started" : "na",
        rise_course_status: "na",
        video_status: formData.content_types.includes("video") ? "not_started" : "na",
        dap_guide_status: formData.content_types.includes("dap") ? "not_started" : "na",
      });

      if (error) throw error;

      toast.success("Content item added to backlog");
      setOpen(false);
      setFormData({
        module_code: "",
        feature_code: "",
        feature_name: "",
        priority: "medium",
        estimated_hours: "",
        time_estimate_notes: "",
        content_types: [],
      });
      setIsNewFeature(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding content item:", error);
      toast.error("Failed to add content item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedModule = MODULES.find(m => m.code === formData.module_code);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Content Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Content Item</DialogTitle>
          <DialogDescription>
            Create enablement content following industry-standard structured approach
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Module Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Step 1</Badge>
              Select Module *
            </Label>
            <Select value={formData.module_code} onValueChange={handleModuleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a module first..." />
              </SelectTrigger>
              <SelectContent>
                {MODULES.map((module) => (
                  <SelectItem key={module.code} value={module.code}>
                    <span className="flex items-center gap-2">
                      <span>{module.icon}</span>
                      <span>{module.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 2: Feature Selection (only shown after module selected) */}
          {formData.module_code && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step 2</Badge>
                Select or Create Feature *
              </Label>
              
              {!isNewFeature ? (
                <div className="space-y-2">
                  <Select 
                    value={formData.feature_code} 
                    onValueChange={handleFeatureSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing feature or create new..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Create new feature
                        </span>
                      </SelectItem>
                      {filteredFeatures.length > 0 && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Existing {selectedModule?.label} Features
                          </div>
                          {filteredFeatures.map((feature) => (
                            <SelectItem key={feature.feature_code} value={feature.feature_code}>
                              {feature.feature_code}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={formData.feature_name}
                    onChange={(e) => setFormData({ ...formData, feature_name: e.target.value })}
                    placeholder="e.g., Leave Request Approval Flow"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewFeature(false)}
                  >
                    ← Back to existing features
                  </Button>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Content Configuration */}
          {formData.module_code && (formData.feature_code || formData.feature_name) && (
            <>
              {/* Content Types */}
              <div className="space-y-2">
                <Label>Content Types to Create</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CONTENT_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant={formData.content_types.includes(type.id) ? "default" : "outline"}
                      className="justify-start h-auto py-3"
                      onClick={() => toggleContentType(type.id)}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs opacity-70">~{type.defaultHours}h</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {PRIORITIES.map((priority) => (
                    <Button
                      key={priority.value}
                      type="button"
                      variant={formData.priority === priority.value ? "default" : "outline"}
                      size="sm"
                      className={formData.priority === priority.value ? priority.color : ""}
                      onClick={() => setFormData({ ...formData, priority: priority.value })}
                    >
                      {priority.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Estimate */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Hours
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.estimated_hours || calculatedHours || ""}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    placeholder={calculatedHours ? `Auto: ${calculatedHours}h` : "Hours"}
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-muted-foreground">
                    {formData.content_types.length > 0 && !formData.estimated_hours && (
                      <span>Based on {formData.content_types.length} content type(s)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.time_estimate_notes}
                  onChange={(e) => setFormData({ ...formData, time_estimate_notes: e.target.value })}
                  placeholder="Additional context, dependencies, or requirements..."
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.module_code || (!formData.feature_code && !formData.feature_name)}
            >
              {isSubmitting ? "Adding..." : "Add to Backlog"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
