import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
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
import { Sparkles, Loader2, Check, Clock, Target, Info, Plus } from "lucide-react";
import { FEATURE_REGISTRY, getModuleFeaturesFlat } from "@/lib/featureRegistry";

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

interface ModuleCategory {
  code: string;
  name: string;
  display_order: number;
}

interface ModuleItem {
  code: string;
  name: string;
  parent_module_code: string | null;
  route_path: string;
  display_order: number;
}

interface FeatureItem {
  id: string;
  feature_code: string;
  feature_name: string;
  description: string | null;
  route_path: string | null;
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

const QUICK_INSTRUCTIONS = [
  { label: "More Detail", value: "Provide more detailed explanations for each step. Include context about why each action is important." },
  { label: "Add Tooltips", value: "Include helpful tooltips and hints for each UI element. Add tips for common mistakes to avoid." },
  { label: "Best Practices", value: "Emphasize best practices and recommended workflows. Include tips from experienced HR professionals." },
  { label: "Compliance Focus", value: "Focus on compliance requirements and regulatory considerations. Highlight mandatory fields and legal requirements." },
  { label: "Quick Start", value: "Keep explanations brief and action-oriented. Focus on getting users productive as quickly as possible." },
  { label: "Visual Guide", value: "Emphasize visual cues and UI element locations. Help users orient themselves in the interface." },
];

export function AITourGenerator({ open, onOpenChange, onTourCreated }: AITourGeneratorProps) {
  const queryClient = useQueryClient();
  
  // Selection state
  const [categoryCode, setCategoryCode] = useState<string>("");
  const [moduleCode, setModuleCode] = useState<string>("");
  const [featureCode, setFeatureCode] = useState<string>("");
  const [tourType, setTourType] = useState<"walkthrough" | "spotlight" | "announcement">("walkthrough");
  const [targetAudience, setTargetAudience] = useState<"new_users" | "managers" | "admins" | "all">("new_users");
  const [contextInstructions, setContextInstructions] = useState<string>("");
  
  // Generated tour state
  const [generatedTour, setGeneratedTour] = useState<GeneratedTour | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Fetch categories (parent modules where parent_module_code is null and starts with 'cat_')
  const { data: categories = [] } = useQuery({
    queryKey: ["module-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_modules")
        .select("module_code, module_name, display_order")
        .is("parent_module_code", null)
        .eq("is_active", true)
        .ilike("module_code", "cat_%")
        .order("display_order");
      
      if (error) throw error;
      return (data || []).map(m => ({
        code: m.module_code,
        name: m.module_name,
        display_order: m.display_order || 0,
      })) as ModuleCategory[];
    },
  });

  // Fetch modules for selected category
  const { data: modules = [] } = useQuery({
    queryKey: ["category-modules", categoryCode],
    queryFn: async () => {
      if (!categoryCode) return [];
      
      const { data, error } = await supabase
        .from("application_modules")
        .select("module_code, module_name, parent_module_code, route_path, display_order")
        .eq("parent_module_code", categoryCode)
        .eq("is_active", true)
        .order("display_order");
      
      if (error) throw error;
      return (data || []).map(m => ({
        code: m.module_code,
        name: m.module_name,
        parent_module_code: m.parent_module_code,
        route_path: m.route_path,
        display_order: m.display_order || 0,
      })) as ModuleItem[];
    },
    enabled: !!categoryCode,
  });

  // Fetch features for selected module
  const { data: features = [] } = useQuery({
    queryKey: ["module-features-db", moduleCode],
    queryFn: async () => {
      if (!moduleCode) return [];
      
      // First try to get from database
      const { data: dbModule } = await supabase
        .from("application_modules")
        .select("id")
        .eq("module_code", moduleCode)
        .single();
      
      if (dbModule) {
        const { data, error } = await supabase
          .from("application_features")
          .select("id, feature_code, feature_name, description, route_path")
          .eq("module_id", dbModule.id)
          .eq("is_active", true)
          .order("display_order");
        
        if (!error && data && data.length > 0) {
          return data as FeatureItem[];
        }
      }
      
      // Fallback to feature registry
      const registryFeatures = getModuleFeaturesFlat(moduleCode);
      return registryFeatures.map(f => ({
        id: f.code,
        feature_code: f.code,
        feature_name: f.name,
        description: f.description,
        route_path: f.routePath,
      })) as FeatureItem[];
    },
    enabled: !!moduleCode,
  });

  // Get selected items for display
  const selectedCategory = categories.find(c => c.code === categoryCode);
  const selectedModule = modules.find(m => m.code === moduleCode);
  const selectedFeature = features.find(f => f.feature_code === featureCode);

  // Also check feature registry for additional details
  const registryModule = FEATURE_REGISTRY.find(m => m.code === moduleCode);
  const registryFeatures = moduleCode ? getModuleFeaturesFlat(moduleCode) : [];
  const registryFeature = registryFeatures.find(f => f.code === featureCode);

  // Reset dependent selections when parent changes
  useEffect(() => {
    setModuleCode("");
    setFeatureCode("");
  }, [categoryCode]);

  useEffect(() => {
    setFeatureCode("");
  }, [moduleCode]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("generate-tour-ai", {
        body: {
          module_code: moduleCode,
          module_name: selectedModule?.name || registryModule?.name || moduleCode,
          feature_code: featureCode || undefined,
          feature_name: selectedFeature?.feature_name || registryFeature?.name,
          feature_description: selectedFeature?.description || registryFeature?.description,
          route_path: selectedFeature?.route_path || registryFeature?.routePath || selectedModule?.route_path || registryModule?.routePath || `/${moduleCode}`,
          tour_type: tourType,
          target_audience: targetAudience,
          ui_elements: registryFeature?.uiElements,
          workflow_steps: registryFeature?.workflowSteps,
          context_instructions: contextInstructions || undefined,
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
          trigger_route: selectedFeature?.route_path || registryFeature?.routePath || selectedModule?.route_path || registryModule?.routePath,
          estimated_duration_seconds: generatedTour.estimated_duration_seconds,
          is_active: false,
          review_status: "draft",
          generated_by: "ai",
          ai_generation_prompt: JSON.stringify({
            category_code: categoryCode,
            module_code: moduleCode,
            feature_code: featureCode,
            tour_type: tourType,
            target_audience: targetAudience,
            context_instructions: contextInstructions,
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
    setCategoryCode("");
    setModuleCode("");
    setFeatureCode("");
    setTourType("walkthrough");
    setTargetAudience("new_users");
    setContextInstructions("");
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

  const handleAddQuickInstruction = (instruction: string) => {
    setContextInstructions(prev => {
      if (prev.includes(instruction)) return prev;
      return prev ? `${prev}\n\n${instruction}` : instruction;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {isPreviewMode ? "Preview Generated Tour" : "Generate Tour with AI"}
          </DialogTitle>
          <DialogDescription>
            {isPreviewMode
              ? "Review the AI-generated tour before saving"
              : "Select a module and provide context to generate a guided tour"}
          </DialogDescription>
        </DialogHeader>

        {!isPreviewMode ? (
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="grid gap-6 py-4">
              {/* Hierarchical Selection */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Info className="h-4 w-4" />
                  Select the module category, module, and optionally a specific feature
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label>Module Category *</Label>
                    <Select value={categoryCode} onValueChange={setCategoryCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.code} value={cat.code}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module Selection */}
                  <div className="space-y-2">
                    <Label>Module *</Label>
                    <Select 
                      value={moduleCode} 
                      onValueChange={setModuleCode}
                      disabled={!categoryCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={categoryCode ? "Select module" : "Select category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((mod) => (
                          <SelectItem key={mod.code} value={mod.code}>
                            {mod.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Feature Selection */}
                  <div className="space-y-2">
                    <Label>Feature (Optional)</Label>
                    <Select 
                      value={featureCode || "_none"} 
                      onValueChange={(v) => setFeatureCode(v === "_none" ? "" : v)}
                      disabled={!moduleCode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={moduleCode ? "Module Overview" : "Select module first"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Module Overview</SelectItem>
                        {features.map((f) => (
                          <SelectItem key={f.feature_code} value={f.feature_code}>
                            {f.feature_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tour Type and Audience */}
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

              {/* Context Instructions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>AI Context Instructions (Optional)</Label>
                  <span className="text-xs text-muted-foreground">
                    {contextInstructions.length} / 1000 characters
                  </span>
                </div>
                <Textarea
                  placeholder="Add additional context to guide the AI generation...&#10;&#10;Examples:&#10;• Be more detailed with explanations&#10;• Add helpful tooltips for each field&#10;• Include compliance considerations"
                  value={contextInstructions}
                  onChange={(e) => setContextInstructions(e.target.value.slice(0, 1000))}
                  className="min-h-[100px] resize-none"
                />
                
                {/* Quick Instruction Templates */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick Instructions</Label>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_INSTRUCTIONS.map((qi) => (
                      <Button
                        key={qi.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleAddQuickInstruction(qi.value)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {qi.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Feature Details */}
              {(selectedFeature || registryFeature) && (
                <Card className="bg-muted/50">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Selected Feature Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 py-2">
                    <p className="text-sm">{selectedFeature?.description || registryFeature?.description}</p>
                    {registryFeature?.workflowSteps && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Workflow Steps:</p>
                        <div className="flex flex-wrap gap-1">
                          {registryFeature.workflowSteps.map((step, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {step}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {registryFeature?.uiElements && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">UI Elements:</p>
                        <div className="flex flex-wrap gap-1">
                          {registryFeature.uiElements.map((el, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {el}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        ) : (
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
        )}

        <DialogFooter className="gap-2">
          {!isPreviewMode ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
