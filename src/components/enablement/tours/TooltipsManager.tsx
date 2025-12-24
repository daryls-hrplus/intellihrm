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
  Eye,
  EyeOff,
  MessageCircle,
  Target,
} from "lucide-react";
import type { HelpTooltip } from "@/types/tours";

const TOOLTIP_PLACEMENTS = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

const TOOLTIP_TRIGGERS = [
  { value: "hover", label: "On Hover" },
  { value: "click", label: "On Click" },
  { value: "focus", label: "On Focus" },
];

export function TooltipsManager() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTooltip, setEditingTooltip] = useState<HelpTooltip | null>(null);
  const [formData, setFormData] = useState({
    tooltip_key: "",
    target_selector: "",
    title: "",
    content: "",
    placement: "top",
    trigger_type: "hover",
    route_pattern: "",
    is_active: true,
  });

  const { data: tooltips, isLoading } = useQuery({
    queryKey: ["enablement-tooltips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enablement_help_tooltips")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as HelpTooltip[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from("enablement_help_tooltips")
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tooltips"] });
      toast.success("Tooltip created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to create tooltip: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<HelpTooltip> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("enablement_help_tooltips")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tooltips"] });
      toast.success("Tooltip updated successfully");
      setEditingTooltip(null);
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update tooltip: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enablement_help_tooltips")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tooltips"] });
      toast.success("Tooltip deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete tooltip: " + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("enablement_help_tooltips")
        .update({ is_active })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enablement-tooltips"] });
      toast.success("Tooltip status updated");
    },
    onError: (error) => {
      toast.error("Failed to update status: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      tooltip_key: "",
      target_selector: "",
      title: "",
      content: "",
      placement: "top",
      trigger_type: "hover",
      route_pattern: "",
      is_active: true,
    });
  };

  const handleEdit = (tooltip: HelpTooltip) => {
    setEditingTooltip(tooltip);
    setFormData({
      tooltip_key: tooltip.tooltip_key,
      target_selector: tooltip.target_selector,
      title: tooltip.title || "",
      content: tooltip.content,
      placement: tooltip.placement || "top",
      trigger_type: tooltip.trigger_type || "hover",
      route_pattern: tooltip.route_pattern || "",
      is_active: tooltip.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.tooltip_key || !formData.target_selector || !formData.content) {
      toast.error("Key, selector, and content are required");
      return;
    }

    if (editingTooltip) {
      updateMutation.mutate({ id: editingTooltip.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredTooltips = tooltips?.filter(
    (tooltip) =>
      tooltip.tooltip_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tooltip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tooltip.target_selector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Help Tooltips</CardTitle>
              <CardDescription>
                Manage contextual help tooltips across the application
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tooltip
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tooltips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tooltips...
            </div>
          ) : filteredTooltips?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tooltips found. Create your first help tooltip.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTooltips?.map((tooltip) => (
                  <TableRow key={tooltip.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {tooltip.tooltip_key}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        <Target className="h-3 w-3 inline mr-1" />
                        {tooltip.target_selector.substring(0, 30)}
                        {tooltip.target_selector.length > 30 ? "..." : ""}
                      </code>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {tooltip.title && (
                        <span className="font-medium mr-2">{tooltip.title}:</span>
                      )}
                      {tooltip.content.substring(0, 50)}
                      {tooltip.content.length > 50 ? "..." : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tooltip.placement}</Badge>
                    </TableCell>
                    <TableCell>
                      {tooltip.is_active ? (
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tooltip)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              id: tooltip.id,
                              is_active: !tooltip.is_active,
                            })
                          }
                        >
                          {tooltip.is_active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this tooltip?")) {
                              deleteMutation.mutate(tooltip.id);
                            }
                          }}
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
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingTooltip(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTooltip ? "Edit Tooltip" : "Add New Tooltip"}
            </DialogTitle>
            <DialogDescription>
              Configure the tooltip content and display settings
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tooltip_key">Tooltip Key *</Label>
                <Input
                  id="tooltip_key"
                  placeholder="e.g., dashboard_metrics_help"
                  value={formData.tooltip_key}
                  onChange={(e) =>
                    setFormData({ ...formData, tooltip_key: e.target.value })
                  }
                  disabled={!!editingTooltip}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Optional title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_selector">Target Selector *</Label>
              <Input
                id="target_selector"
                placeholder="e.g., [data-help='metrics-card']"
                value={formData.target_selector}
                onChange={(e) =>
                  setFormData({ ...formData, target_selector: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Help text to display..."
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
                    {TOOLTIP_PLACEMENTS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger_type">Trigger</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trigger_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOLTIP_TRIGGERS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="route_pattern">Route Pattern (optional)</Label>
              <Input
                id="route_pattern"
                placeholder="e.g., /dashboard/*"
                value={formData.route_pattern}
                onChange={(e) =>
                  setFormData({ ...formData, route_pattern: e.target.value })
                }
              />
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
                setIsDialogOpen(false);
                setEditingTooltip(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTooltip ? "Update Tooltip" : "Add Tooltip"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
