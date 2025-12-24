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
  Sparkles,
  Bot,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
} from "lucide-react";
import type { Tour } from "@/types/tours";
import { AITourGenerator } from "./AITourGenerator";
import { TourReviewPanel } from "./TourReviewPanel";

interface TourListManagerProps {
  onSelectTour: (tourId: string) => void;
}

const TOUR_TYPES = [
  { value: "walkthrough", label: "Walkthrough" },
  { value: "spotlight", label: "Spotlight" },
  { value: "announcement", label: "Announcement" },
];

const AUTO_TRIGGER_OPTIONS = [
  { value: "first_visit", label: "First Visit" },
  { value: "first_action", label: "First Action" },
  { value: "manual", label: "Manual" },
];

const REVIEW_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "draft", label: "Drafts" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
];

type TourFormData = {
  tour_code: string;
  tour_name: string;
  description: string;
  tour_type: "walkthrough" | "spotlight" | "announcement";
  module_code: string;
  feature_code: string;
  trigger_route: string;
  auto_trigger_on: "first_visit" | "first_action" | "manual" | null;
  priority: number;
  is_active: boolean;
};

type ExtendedTour = Tour & { 
  enablement_tour_steps: { count: number }[]; 
  review_status?: string; 
  generated_by?: string;
  review_notes?: string;
  rejected_reason?: string;
};

export function TourListManager({ onSelectTour }: TourListManagerProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [reviewingTour, setReviewingTour] = useState<ExtendedTour | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [formData, setFormData] = useState<TourFormData>({
    tour_code: "",
    tour_name: "",
    description: "",
    tour_type: "walkthrough",
    module_code: "",
    feature_code: "",
    trigger_route: "",
    auto_trigger_on: "manual",
    priority: 100,
    is_active: true,
  });

  const { data: tours, isLoading } = useQuery({
    queryKey: ["enablement-tours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_tours")
        .select("*, enablement_tour_steps(count)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ExtendedTour[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TourFormData) => {
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
    mutationFn: async ({ id, ...data }: Partial<TourFormData> & { id: string }) => {
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
      tour_name: "",
      description: "",
      tour_type: "walkthrough",
      module_code: "",
      feature_code: "",
      trigger_route: "",
      auto_trigger_on: "manual",
      priority: 100,
      is_active: true,
    });
  };

  const handleEdit = (tour: Tour) => {
    setEditingTour(tour);
    setFormData({
      tour_code: tour.tour_code,
      tour_name: tour.tour_name,
      description: tour.description || "",
      tour_type: tour.tour_type,
      module_code: tour.module_code || "",
      feature_code: tour.feature_code || "",
      trigger_route: tour.trigger_route || "",
      auto_trigger_on: (tour.auto_trigger_on as TourFormData["auto_trigger_on"]) || "manual",
      priority: tour.priority,
      is_active: tour.is_active,
    });
  };

  const handleSubmit = () => {
    if (!formData.tour_code || !formData.tour_name || !formData.module_code) {
      toast.error("Tour code, name, and module code are required");
      return;
    }

    if (editingTour) {
      updateMutation.mutate({ id: editingTour.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTours = tours?.filter((tour) => {
    const matchesSearch =
      tour.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.tour_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.module_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tour.review_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getTourTypeLabel = (type: string) => {
    return TOUR_TYPES.find((t) => t.value === type)?.label || type;
  };

  const getReviewStatusBadge = (status?: string) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case "in_review":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 gap-1">
            <FileCheck className="h-3 w-3" />
            In Review
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      case "published":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200 gap-1">
            <Send className="h-3 w-3" />
            Published
          </Badge>
        );
      default:
        return null;
    }
  };

  const statusCounts = {
    draft: tours?.filter(t => t.review_status === "draft").length || 0,
    in_review: tours?.filter(t => t.review_status === "in_review").length || 0,
    approved: tours?.filter(t => t.review_status === "approved").length || 0,
    rejected: tours?.filter(t => t.review_status === "rejected").length || 0,
    published: tours?.filter(t => t.review_status === "published").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Status Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "draft" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "draft" ? "all" : "draft")}
        >
          <CardContent className="p-4 text-center">
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{statusCounts.draft}</div>
            <div className="text-xs text-muted-foreground">Drafts</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "in_review" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "in_review" ? "all" : "in_review")}
        >
          <CardContent className="p-4 text-center">
            <FileCheck className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{statusCounts.in_review}</div>
            <div className="text-xs text-muted-foreground">In Review</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "approved" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "approved" ? "all" : "approved")}
        >
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{statusCounts.approved}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "rejected" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
        >
          <CardContent className="p-4 text-center">
            <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <div className="text-2xl font-bold">{statusCounts.rejected}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${statusFilter === "published" ? "ring-2 ring-primary" : ""}`}
          onClick={() => setStatusFilter(statusFilter === "published" ? "all" : "published")}
        >
          <CardContent className="p-4 text-center">
            <Send className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{statusCounts.published}</div>
            <div className="text-xs text-muted-foreground">Published</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tours Library</CardTitle>
              <CardDescription>
                Manage guided tours for user onboarding and feature discovery
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAIGeneratorOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                AI Generate
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Tour
              </Button>
            </div>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {REVIEW_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tours...
            </div>
          ) : filteredTours?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tours found. Create your first guided tour or use AI to generate one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead>Review Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTours?.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="font-medium flex items-center gap-1.5">
                            {tour.tour_name}
                            {tour.generated_by === "ai" && (
                              <span title="AI Generated">
                                <Bot className="h-3.5 w-3.5 text-purple-500" />
                              </span>
                            )}
                            {tour.generated_by === "release_trigger" && (
                              <span title="Release Auto-Generated">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tour.tour_code}
                          </div>
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
                      <Badge variant="secondary">
                        {tour.enablement_tour_steps?.[0]?.count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => setReviewingTour(tour)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        {getReviewStatusBadge(tour.review_status)}
                      </button>
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
                        {tour.auto_trigger_on && tour.auto_trigger_on !== "manual" && (
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
                          onClick={() => setReviewingTour(tour)}
                        >
                          <FileCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectTour(tour.id)}
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

      {/* AI Tour Generator Dialog */}
      <AITourGenerator 
        open={isAIGeneratorOpen} 
        onOpenChange={setIsAIGeneratorOpen} 
      />

      {/* Tour Review Panel */}
      {reviewingTour && (
        <TourReviewPanel
          tour={{
            id: reviewingTour.id,
            tour_name: reviewingTour.tour_name,
            tour_code: reviewingTour.tour_code,
            description: reviewingTour.description || null,
            module_code: reviewingTour.module_code || "",
            feature_code: reviewingTour.feature_code || null,
            tour_type: reviewingTour.tour_type,
            trigger_route: reviewingTour.trigger_route || null,
            is_active: reviewingTour.is_active,
            review_status: reviewingTour.review_status || null,
            generated_by: reviewingTour.generated_by || null,
            reviewed_by: null,
            reviewed_at: null,
            review_notes: reviewingTour.review_notes || null,
            rejected_reason: reviewingTour.rejected_reason || null,
            created_at: reviewingTour.created_at,
            estimated_duration_seconds: reviewingTour.estimated_duration_seconds || null,
            enablement_tour_steps: reviewingTour.enablement_tour_steps,
          }}
          open={!!reviewingTour}
          onOpenChange={(open) => !open && setReviewingTour(null)}
        />
      )}

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
                <Label htmlFor="tour_name">Name *</Label>
                <Input
                  id="tour_name"
                  placeholder="e.g., Dashboard Introduction"
                  value={formData.tour_name}
                  onChange={(e) =>
                    setFormData({ ...formData, tour_name: e.target.value })
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
                  onValueChange={(value: "walkthrough" | "spotlight" | "announcement") =>
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
                <Label htmlFor="auto_trigger_on">Auto Trigger</Label>
                <Select
                  value={formData.auto_trigger_on || "manual"}
                  onValueChange={(value: "first_visit" | "first_action" | "manual") =>
                    setFormData({ ...formData, auto_trigger_on: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTO_TRIGGER_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module_code">Module Code *</Label>
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

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Active</Label>
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
