import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Settings2,
  Eye,
  EyeOff,
  Play,
  MapPin,
} from "lucide-react";
import type { Tour } from "@/types/tours";

interface TourListManagerProps {
  onSelectTour: (tourId: string) => void;
}

const TOUR_TYPES = [
  { value: "onboarding", label: "Onboarding" },
  { value: "feature_intro", label: "Feature Introduction" },
  { value: "workflow_guide", label: "Workflow Guide" },
  { value: "help", label: "Help" },
];

export function TourListManager({ onSelectTour }: TourListManagerProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState({
    tour_code: "",
    name: "",
    description: "",
    tour_type: "feature_intro",
    module_code: "",
    feature_code: "",
    trigger_route: "",
    trigger_mode: "manual" as const,
    priority: 100,
    is_active: true,
    auto_trigger_for_new_users: false,
  });

  const { data: tours, isLoading } = useQuery({
    queryKey: ["enablement-tours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_tours")
        .select("*, enablement_tour_steps(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Tour & { enablement_tour_steps: [{ count: number }] })[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from("enablement_tours")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tours"] });
      toast.success("Tour created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create tour: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tour> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("enablement_tours")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tours"] });
      toast.success("Tour updated successfully");
      setEditingTour(null);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update tour: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enablement_tours")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tours"] });
      toast.success("Tour deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete tour: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("enablement_tours")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tours"] });
      toast.success("Tour status updated");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      tour_code: "",
      name: "",
      description: "",
      tour_type: "feature_intro",
      module_code: "",
      feature_code: "",
      trigger_route: "",
      trigger_mode: "manual",
      priority: 100,
      is_active: true,
      auto_trigger_for_new_users: false,
    });
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      tour_code: tour.tour_code,
      name: tour.name,
      description: tour.description || "",
      tour_type: tour.tour_type,
      module_code: tour.module_code || "",
      feature_code: tour.feature_code || "",
      trigger_route: tour.trigger_route || "",
      trigger_mode: tour.trigger_mode,
      priority: tour.priority,
      is_active: tour.is_active,
      auto_trigger_for_new_users: tour.auto_trigger_for_new_users,
    });
  };

  const handleSubmit = () => {
    if (!formData.tour_code || !formData.name) {
      toast.error("Tour code and name are required");
      return;
    }

    if (editingTour) {
      updateMutation.mutate({ id: editingTour.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTours = tours?.filter(
    (tour) =>
      tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.tour_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.module_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTourTypeLabel = (type: string) => {
    return TOUR_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tours Library</CardTitle>
              <CardDescription>
                Manage guided tours for user onboarding and feature discovery
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Tour
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tours...
            </div>
          ) : filteredTours?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tours found. Create your first guided tour.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours?.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tour.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tour.tour_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTourTypeLabel(tour.tour_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {tour.module_code || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {tour.trigger_route || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {tour.enablement_tour_steps?.[0]?.count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tour.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600 border-green-200">
                            <Eye className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {tour.auto_trigger_for_new_users && (
                          <Badge variant="outline" className="text-xs">
                            <Play className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectTour(tour.id)}
                          title="Edit Steps"
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tour)}
                          title="Edit Tour"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: tour.id,
                              is_active: !tour.is_active,
                            })
                          }
                          title={tour.is_active ? "Deactivate" : "Activate"}
                        >
                          {tour.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to delete this tour?"
                              )
                            ) {
                              deleteMutation.mutate(tour.id);
                            }
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!editingTour}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingTour(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTour ? "Edit Tour" : "Create New Tour"}
            </DialogTitle>
            <DialogDescription>
              Configure the tour settings and trigger conditions
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tour_code">Tour Code *</Label>
                <Input
                  id="tour_code"
                  placeholder="e.g., onboarding_dashboard"
                  value={formData.tour_code}
                  onChange={(e) =>
                    setFormData({ ...formData, tour_code: e.target.value })
                  }
                  disabled={!!editingTour}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Dashboard Introduction"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this tour..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tour_type">Tour Type</Label>
                <Select
                  value={formData.tour_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tour_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOUR_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger_mode">Trigger Mode</Label>
                <Select
                  value={formData.trigger_mode}
                  onValueChange={(value: "manual" | "auto" | "contextual") =>
                    setFormData({ ...formData, trigger_mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="auto">Automatic</SelectItem>
                    <SelectItem value="contextual">Contextual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module_code">Module Code</Label>
                <Input
                  id="module_code"
                  placeholder="e.g., dashboard"
                  value={formData.module_code}
                  onChange={(e) =>
                    setFormData({ ...formData, module_code: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feature_code">Feature Code</Label>
                <Input
                  id="feature_code"
                  placeholder="e.g., analytics_overview"
                  value={formData.feature_code}
                  onChange={(e) =>
                    setFormData({ ...formData, feature_code: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trigger_route">Trigger Route</Label>
                <Input
                  id="trigger_route"
                  placeholder="e.g., /dashboard"
                  value={formData.trigger_route}
                  onChange={(e) =>
                    setFormData({ ...formData, trigger_route: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority (lower = higher)</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_trigger"
                  checked={formData.auto_trigger_for_new_users}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      auto_trigger_for_new_users: checked,
                    })
                  }
                />
                <Label htmlFor="auto_trigger">Auto-trigger for new users</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setEditingTour(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTour ? "Update Tour" : "Create Tour"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
