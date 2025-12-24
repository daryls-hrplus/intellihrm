import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  Target,
  Video,
  Sparkles,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { TourStep, Tour } from "@/types/tours";
import { FEATURE_REGISTRY, getModuleFeaturesFlat } from "@/lib/featureRegistry";

interface TourStepsEditorProps {
  tourId: string;
  onBack: () => void;
}

const STEP_PLACEMENTS = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "auto", label: "Auto" },
  { value: "center", label: "Center (Modal)" },
];

const HIGHLIGHT_TYPES = [
  { value: "spotlight", label: "Spotlight" },
  { value: "tooltip", label: "Tooltip" },
  { value: "modal", label: "Modal" },
  { value: "beacon", label: "Beacon" },
];

const QUICK_INSTRUCTIONS = [
  { label: "More Detail", value: "Provide more detailed explanations for each step. Include context about why each action is important." },
  { label: "Add Tooltips", value: "Include helpful tooltips and hints for each UI element. Add tips for common mistakes to avoid." },
  { label: "Best Practices", value: "Emphasize best practices and recommended workflows. Include tips from experienced HR professionals." },
  { label: "Compliance Focus", value: "Focus on compliance requirements and regulatory considerations. Highlight mandatory fields and legal requirements." },
  { label: "Quick Start", value: "Keep explanations brief and action-oriented. Focus on getting users productive as quickly as possible." },
];

type StepFormData = {
  title: string;
  content: string;
  target_selector: string;
  placement: "top" | "bottom" | "left" | "right" | "auto" | "center";
  highlight_type: "spotlight" | "tooltip" | "modal" | "beacon";
  skip_if_missing: boolean;
  disable_overlay: boolean;
  disable_scroll: boolean;
  spot_light_padding: number;
};

interface SortableStepItemProps {
  step: TourStep;
  onEdit: (step: TourStep) => void;
  onDelete: (id: string) => void;
}

function SortableStepItem({ step, onEdit, onDelete }: SortableStepItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-card border rounded-lg"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:text-primary"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <Badge variant="outline" className="shrink-0">
        Step {step.step_order}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{step.title}</div>
        <div className="text-sm text-muted-foreground truncate">
          {step.content}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            <Target className="h-3 w-3 inline mr-1" />
            {step.target_selector}
          </code>
          {step.video_id && (
            <Badge variant="secondary" className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              Video
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(step)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(step.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

type TourWithDbSteps = Tour & { enablement_tour_steps: TourStep[] };

export function TourStepsEditor({ tourId, onBack }: TourStepsEditorProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIRegenerateOpen, setIsAIRegenerateOpen] = useState(false);
  const [contextInstructions, setContextInstructions] = useState("");
  const [editingStep, setEditingStep] = useState<TourStep | null>(null);
  const [formData, setFormData] = useState<StepFormData>({
    title: "",
    content: "",
    target_selector: "",
    placement: "bottom",
    highlight_type: "spotlight",
    skip_if_missing: true,
    disable_overlay: false,
    disable_scroll: false,
    spot_light_padding: 10,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: tour, isLoading } = useQuery({
    queryKey: ["enablement-tour", tourId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_tours")
        .select("*, enablement_tour_steps(*)")
        .eq("id", tourId)
        .single();

      if (error) throw error;
      
      // Sort steps by step_order
      if (data.enablement_tour_steps) {
        data.enablement_tour_steps.sort((a: TourStep, b: TourStep) => a.step_order - b.step_order);
      }
      
      return data as TourWithDbSteps;
    },
  });

  // Get module/feature info for AI regeneration
  const registryModule = tour?.module_code ? FEATURE_REGISTRY.find(m => m.code === tour.module_code) : null;
  const registryFeatures = tour?.module_code ? getModuleFeaturesFlat(tour.module_code) : [];
  const registryFeature = tour?.feature_code ? registryFeatures.find(f => f.code === tour.feature_code) : null;

  const createStepMutation = useMutation({
    mutationFn: async (data: StepFormData) => {
      const newOrder = (tour?.enablement_tour_steps?.length || 0) + 1;
      const { data: result, error } = await supabase
        .from("enablement_tour_steps")
        .insert([{
          tour_id: tourId,
          step_order: newOrder,
          ...data,
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tour", tourId] });
      toast.success("Step created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create step: " + error.message);
    },
  });

  const updateStepMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<StepFormData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("enablement_tour_steps")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tour", tourId] });
      toast.success("Step updated successfully");
      setEditingStep(null);
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update step: " + error.message);
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enablement_tour_steps")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tour", tourId] });
      toast.success("Step deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete step: " + error.message);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (steps: { id: string; step_order: number }[]) => {
      // Update each step individually
      for (const step of steps) {
        const { error } = await supabase
          .from("enablement_tour_steps")
          .update({ step_order: step.step_order })
          .eq("id", step.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tour", tourId] });
    },
    onError: (error) => {
      toast.error("Failed to reorder steps: " + error.message);
    },
  });

  const regenerateStepsMutation = useMutation({
    mutationFn: async () => {
      if (!tour) throw new Error("Tour not found");

      // Call AI to generate new steps
      const response = await supabase.functions.invoke("generate-tour-ai", {
        body: {
          module_code: tour.module_code,
          module_name: registryModule?.name || tour.module_code,
          feature_code: tour.feature_code || undefined,
          feature_name: registryFeature?.name,
          feature_description: registryFeature?.description,
          route_path: tour.trigger_route || registryFeature?.routePath || registryModule?.routePath || `/${tour.module_code}`,
          tour_type: tour.tour_type,
          target_audience: "all",
          ui_elements: registryFeature?.uiElements,
          workflow_steps: registryFeature?.workflowSteps,
          context_instructions: contextInstructions || undefined,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data.success || !response.data.tour) {
        throw new Error(response.data.error || "Failed to generate tour");
      }

      return response.data.tour;
    },
    onSuccess: async (generatedTour) => {
      // Delete existing steps
      const existingSteps = tour?.enablement_tour_steps || [];
      for (const step of existingSteps) {
        await supabase
          .from("enablement_tour_steps")
          .delete()
          .eq("id", step.id);
      }

      // Insert new steps
      const steps = generatedTour.steps.map((step: any) => ({
        tour_id: tourId,
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

      queryClient.invalidateQueries({ queryKey: ["enablement-tour", tourId] });
      toast.success(`Regenerated ${steps.length} steps successfully`);
      setIsAIRegenerateOpen(false);
      setContextInstructions("");
    },
    onError: (error) => {
      console.error("Regeneration error:", error);
      toast.error("Failed to regenerate steps: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      target_selector: "",
      placement: "bottom",
      highlight_type: "spotlight",
      skip_if_missing: true,
      disable_overlay: false,
      disable_scroll: false,
      spot_light_padding: 10,
    });
  };

  const handleEdit = (step: TourStep) => {
    setEditingStep(step);
    setFormData({
      title: step.title,
      content: step.content || "",
      target_selector: step.target_selector,
      placement: step.placement || "bottom",
      highlight_type: step.highlight_type || "spotlight",
      skip_if_missing: step.skip_if_missing ?? true,
      disable_overlay: step.disable_overlay ?? false,
      disable_scroll: step.disable_scroll ?? false,
      spot_light_padding: step.spot_light_padding ?? 10,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.target_selector) {
      toast.error("Title and target selector are required");
      return;
    }

    if (editingStep) {
      updateStepMutation.mutate({ id: editingStep.id, ...formData });
    } else {
      createStepMutation.mutate(formData);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !tour?.enablement_tour_steps) {
      return;
    }

    const oldIndex = tour.enablement_tour_steps.findIndex(
      (s) => s.id === active.id
    );
    const newIndex = tour.enablement_tour_steps.findIndex(
      (s) => s.id === over.id
    );

    const newSteps = arrayMove(tour.enablement_tour_steps, oldIndex, newIndex);
    const updates = newSteps.map((step, index) => ({
      id: step.id,
      step_order: index + 1,
    }));

    reorderMutation.mutate(updates);
  };

  const handleAddQuickInstruction = (instruction: string) => {
    setContextInstructions(prev => {
      if (prev.includes(instruction)) return prev;
      return prev ? `${prev}\n\n${instruction}` : instruction;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading tour...
        </CardContent>
      </Card>
    );
  }

  if (!tour) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Tour not found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>{tour.tour_name}</CardTitle>
                <CardDescription>
                  {tour.enablement_tour_steps?.length || 0} steps • Drag to reorder
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAIRegenerateOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Regenerate
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!tour.enablement_tour_steps?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No steps yet. Add your first step or use AI to generate them.</p>
              <Button 
                variant="outline" 
                onClick={() => setIsAIRegenerateOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Steps with AI
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tour.enablement_tour_steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tour.enablement_tour_steps.map((step) => (
                    <SortableStepItem
                      key={step.id}
                      step={step}
                      onEdit={handleEdit}
                      onDelete={(id) => {
                        if (confirm("Delete this step?")) {
                          deleteStepMutation.mutate(id);
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* AI Regenerate Dialog */}
      <Dialog open={isAIRegenerateOpen} onOpenChange={setIsAIRegenerateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Regenerate Steps
            </DialogTitle>
            <DialogDescription>
              Use AI to regenerate all steps for this tour with optional context instructions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tour Info */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Tour:</span>{" "}
                <span className="font-medium">{tour.tour_name}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Module:</span>{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">{tour.module_code}</code>
              </div>
              {tour.feature_code && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Feature:</span>{" "}
                  <code className="bg-muted px-1 py-0.5 rounded text-xs">{tour.feature_code}</code>
                </div>
              )}
            </div>

            {/* Warning */}
            {tour.enablement_tour_steps && tour.enablement_tour_steps.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-amber-700">This will replace existing steps</div>
                  <div className="text-amber-600">
                    All {tour.enablement_tour_steps.length} current steps will be deleted and replaced with AI-generated ones.
                  </div>
                </div>
              </div>
            )}

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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAIRegenerateOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => regenerateStepsMutation.mutate()} 
              disabled={regenerateStepsMutation.isPending}
            >
              {regenerateStepsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Regenerate Steps
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Step Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingStep(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? "Edit Step" : "Add New Step"}
            </DialogTitle>
            <DialogDescription>
              Configure the step content and target element
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Welcome to Dashboard"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target_selector">Target Selector *</Label>
                <Input
                  id="target_selector"
                  placeholder="e.g., [data-tour='dashboard-header']"
                  value={formData.target_selector}
                  onChange={(e) =>
                    setFormData({ ...formData, target_selector: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Step description or instructions..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placement">Placement</Label>
                <Select
                  value={formData.placement}
                  onValueChange={(value: StepFormData["placement"]) =>
                    setFormData({ ...formData, placement: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_PLACEMENTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlight_type">Highlight Type</Label>
                <Select
                  value={formData.highlight_type}
                  onValueChange={(value: StepFormData["highlight_type"]) =>
                    setFormData({ ...formData, highlight_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HIGHLIGHT_TYPES.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spot_light_padding">Spotlight Padding (px)</Label>
              <Input
                id="spot_light_padding"
                type="number"
                value={formData.spot_light_padding}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spot_light_padding: parseInt(e.target.value) || 10,
                  })
                }
              />
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="skip_if_missing"
                  checked={formData.skip_if_missing}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, skip_if_missing: checked })
                  }
                />
                <Label htmlFor="skip_if_missing">Skip if element missing</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="disable_overlay"
                  checked={formData.disable_overlay}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, disable_overlay: checked })
                  }
                />
                <Label htmlFor="disable_overlay">Disable overlay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="disable_scroll"
                  checked={formData.disable_scroll}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, disable_scroll: checked })
                  }
                />
                <Label htmlFor="disable_scroll">Disable scroll</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingStep(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                createStepMutation.isPending || updateStepMutation.isPending
              }
            >
              {editingStep ? "Update Step" : "Add Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
