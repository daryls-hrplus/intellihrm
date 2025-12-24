import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Sparkles, Loader2, Eye, Check, Clock, Target } from "lucide-react";
import { FEATURE_REGISTRY, getModuleFeaturesFlat } from "@/lib/featureRegistry";
import { getModuleSelectorDescriptions } from "@/lib/tourTargetRegistry";

interface AITourGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTourCreated?: (tourId: string) => void;
}

interface GeneratedStep {
  step_order: number;
  target_selector: string;
  title: string;
  content: string;
  placement: string;
  highlight_type: string;
  action_type: string | null;
}

interface GeneratedTour {
  tour_code: string;
  tour_name: string;
  description: string;
  estimated_duration_seconds: number;
  steps: GeneratedStep[];
}

const TOUR_TYPES = [
  { value: "walkthrough", label: "Walkthrough", description: "Step-by-step feature guide" },
  { value: "spotlight", label: "Spotlight", description: "Highlight key features" },
  { value: "announcement", label: "Announcement", description: "New feature announcement" },
];

const TARGET_AUDIENCES = [
  { value: "new_users", label: "New Users", description: "First-time users" },
  { value: "managers", label: "Managers", description: "People managers" },
  { value: "admins", label: "Admins", description: "System administrators" },
  { value: "all", label: "All Users", description: "Everyone" },
];

export function AITourGenerator({ open, onOpenChange, onTourCreated }: AITourGeneratorProps) {
  const queryClient = useQueryClient();
  const [moduleCode, setModuleCode] = useState<string>("");
  const [featureCode, setFeatureCode] = useState<string>("");
  const [tourType, setTourType] = useState<"walkthrough" | "spotlight" | "announcement">("walkthrough");
  const [targetAudience, setTargetAudience] = useState<"new_users" | "managers" | "admins" | "all">("new_users");
  const [generatedTour, setGeneratedTour] = useState<GeneratedTour | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const selectedModule = FEATURE_REGISTRY.find((m) => m.code === moduleCode);
  const moduleFeatures = moduleCode ? getModuleFeaturesFlat(moduleCode) : [];
  const selectedFeature = moduleFeatures.find((f) => f.code === featureCode);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("generate-tour-ai", {
        body: {
          module_code: moduleCode,
          module_name: selectedModule?.name || moduleCode,
          feature_code: featureCode || undefined,
          feature_name: selectedFeature?.name,
          feature_description: selectedFeature?.description,
          route_path: selectedFeature?.routePath || selectedModule?.routePath || `/${moduleCode}`,
          tour_type: tourType,
          target_audience: targetAudience,
          ui_elements: selectedFeature?.uiElements,
          workflow_steps: selectedFeature?.workflowSteps,
        },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success && data.tour) {
        setGeneratedTour(data.tour);
        setIsPreviewMode(true);
        toast.success("Tour generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate tour");
      }
    },
    onError: (error) => {
      console.error("Generation error:", error);
      toast.error("Failed to generate tour: " + error.message);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!generatedTour) throw new Error("No tour to save");

      // Insert the tour
      const { data: tour, error: tourError } = await supabase
        .from("enablement_tours")
        .insert({
          tour_code: generatedTour.tour_code,
          tour_name: generatedTour.tour_name,
          description: generatedTour.description,
          module_code: moduleCode,
          feature_code: featureCode || null,
          tour_type: tourType,
          trigger_route: selectedFeature?.routePath || selectedModule?.routePath,
          estimated_duration_seconds: generatedTour.estimated_duration_seconds,
          is_active: false,
          review_status: "draft",
          generated_by: "ai",
          ai_generation_prompt: JSON.stringify({
            module_code: moduleCode,
            feature_code: featureCode,
            tour_type: tourType,
            target_audience: targetAudience,
          }),
        })
        .select()
        .single();

      if (tourError) throw tourError;

      // Insert the steps
      const steps = generatedTour.steps.map((step) => ({
        tour_id: tour.id,
        step_order: step.step_order,
        target_selector: step.target_selector,
        title: step.title,
        content: step.content,
        placement: step.placement,
        highlight_type: step.highlight_type,
        action_type: step.action_type,
      }));

      const { error: stepsError } = await supabase
        .from("enablement_tour_steps")
        .insert(steps);

      if (stepsError) throw stepsError;

      return tour;
    },
    onSuccess: (tour) => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tours"] });
      toast.success("Tour saved as draft");
      onTourCreated?.(tour.id);
      handleClose();
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast.error("Failed to save tour: " + error.message);
    },
  });

  const handleClose = () => {
    setModuleCode("");
    setFeatureCode("");
    setTourType("walkthrough");
    setTargetAudience("new_users");
    setGeneratedTour(null);
    setIsPreviewMode(false);
    onOpenChange(false);
  };

  const handleGenerate = () => {
    if (!moduleCode) {
      toast.error("Please select a module");
      return;
    }
    generateMutation.mutate();
  };

  const handleBack = () => {
    setIsPreviewMode(false);
    setGeneratedTour(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isPreviewMode ? "Preview Generated Tour" : "Generate Tour with AI"}
          </DialogTitle>
          <DialogDescription>
            {isPreviewMode
              ? "Review the AI-generated tour before saving"
              : "AI will generate a guided tour based on your selections"}
          </DialogDescription>
        </DialogHeader>

        {!isPreviewMode ? (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Module *</Label>
                  <Select value={moduleCode} onValueChange={(v) => {
                    setModuleCode(v);
                    setFeatureCode("");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURE_REGISTRY.map((m) => (
                        <SelectItem key={m.code} value={m.code}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Feature (Optional)</Label>
                  <Select value={featureCode || "_none"} onValueChange={(v) => setFeatureCode(v === "_none" ? "" : v)} disabled={!moduleCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="All features" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Module Overview</SelectItem>
                      {moduleFeatures.map((f) => (
                        <SelectItem key={f.code} value={f.code || `feature_${f.name}`}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tour Type</Label>
                  <Select value={tourType} onValueChange={(v: any) => setTourType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TOUR_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <div>
                            <div className="font-medium">{t.label}</div>
                            <div className="text-xs text-muted-foreground">{t.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={targetAudience} onValueChange={(v: any) => setTargetAudience(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_AUDIENCES.map((a) => (
                        <SelectItem key={a.value} value={a.value}>
                          <div>
                            <div className="font-medium">{a.label}</div>
                            <div className="text-xs text-muted-foreground">{a.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedFeature && (
                <Card className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Selected Feature Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 py-2">
                    <p className="text-sm">{selectedFeature.description}</p>
                    {selectedFeature.workflowSteps && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Workflow Steps:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedFeature.workflowSteps.map((step, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generateMutation.isPending || !moduleCode}>
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Tour
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                <Card>
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{generatedTour?.tour_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {generatedTour?.estimated_duration_seconds}s
                        </Badge>
                        <Badge variant="secondary">{tourType}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <p className="text-sm text-muted-foreground">{generatedTour?.description}</p>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded mt-2 inline-block">
                      {generatedTour?.tour_code}
                    </code>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Tour Steps ({generatedTour?.steps.length})
                  </h4>
                  {generatedTour?.steps.map((step, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {step.step_order}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h5 className="font-medium text-sm">{step.title}</h5>
                            <p className="text-sm text-muted-foreground">{step.content}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {step.highlight_type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {step.placement}
                              </Badge>
                              {step.action_type && step.action_type !== "none" && (
                                <Badge variant="secondary" className="text-xs">
                                  Action: {step.action_type}
                                </Badge>
                              )}
                            </div>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded block mt-1">
                              {step.target_selector}
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back to Edit
              </Button>
              <Button variant="outline" onClick={handleGenerate} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Regenerate
              </Button>
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save as Draft
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
