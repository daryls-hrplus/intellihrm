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
} from "lucide-react";
import type { TourStep, TourWithSteps } from "@/types/tours";

interface TourStepsEditorProps {
  tourId: string;
  onBack: () => void;
}

const STEP_PLACEMENTS = [
  { value: "top", label: "Top" },
  { value: "top-start", label: "Top Start" },
  { value: "top-end", label: "Top End" },
  { value: "bottom", label: "Bottom" },
  { value: "bottom-start", label: "Bottom Start" },
  { value: "bottom-end", label: "Bottom End" },
  { value: "left", label: "Left" },
  { value: "left-start", label: "Left Start" },
  { value: "left-end", label: "Left End" },
  { value: "right", label: "Right" },
  { value: "right-start", label: "Right Start" },
  { value: "right-end", label: "Right End" },
  { value: "center", label: "Center (Modal)" },
];

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
          {step.video_url && (
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

export function TourStepsEditor({ tourId, onBack }: TourStepsEditorProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<TourStep | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    target_selector: "",
    placement: "bottom",
    highlight_target: true,
    allow_interaction: false,
    wait_for_element: true,
    video_url: "",
    action_button_text: "",
    action_button_url: "",
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
      
      return data as TourWithSteps;
    },
  });

  const createStepMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
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
    mutationFn: async ({ id, ...data }: Partial<TourStep> & { id: string }) => {
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
      const { error } = await supabase.rpc("update_tour_step_orders", {
        step_updates: steps,
      });

      if (error) {
        // Fallback to individual updates if RPC doesn't exist
        for (const step of steps) {
          await supabase
            .from("enablement_tour_steps")
            .update({ step_order: step.step_order })
            .eq("id", step.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tour", tourId] });
    },
    onError: (error) => {
      toast.error("Failed to reorder steps: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      target_selector: "",
      placement: "bottom",
      highlight_target: true,
      allow_interaction: false,
      wait_for_element: true,
      video_url: "",
      action_button_text: "",
      action_button_url: "",
    });
  };

  const handleEdit = (step: TourStep) => {
    setEditingStep(step);
    setFormData({
      title: step.title,
      content: step.content || "",
      target_selector: step.target_selector,
      placement: step.placement || "bottom",
      highlight_target: step.highlight_target ?? true,
      allow_interaction: step.allow_interaction ?? false,
      wait_for_element: step.wait_for_element ?? true,
      video_url: step.video_url || "",
      action_button_text: step.action_button_text || "",
      action_button_url: step.action_button_url || "",
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
                <CardTitle>{tour.name}</CardTitle>
                <CardDescription>
                  {tour.enablement_tour_steps?.length || 0} steps • Drag to
                  reorder
                </CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!tour.enablement_tour_steps?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No steps yet. Add your first step to get started.
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
                  onValueChange={(value) =>
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
                <Label htmlFor="video_url">Video URL (optional)</Label>
                <Input
                  id="video_url"
                  placeholder="https://..."
                  value={formData.video_url}
                  onChange={(e) =>
                    setFormData({ ...formData, video_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action_button_text">Action Button Text</Label>
                <Input
                  id="action_button_text"
                  placeholder="e.g., Learn More"
                  value={formData.action_button_text}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action_button_text: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_button_url">Action Button URL</Label>
                <Input
                  id="action_button_url"
                  placeholder="/help/feature"
                  value={formData.action_button_url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      action_button_url: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="highlight_target"
                  checked={formData.highlight_target}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, highlight_target: checked })
                  }
                />
                <Label htmlFor="highlight_target">Highlight target</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_interaction"
                  checked={formData.allow_interaction}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allow_interaction: checked })
                  }
                />
                <Label htmlFor="allow_interaction">Allow interaction</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="wait_for_element"
                  checked={formData.wait_for_element}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, wait_for_element: checked })
                  }
                />
                <Label htmlFor="wait_for_element">Wait for element</Label>
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
