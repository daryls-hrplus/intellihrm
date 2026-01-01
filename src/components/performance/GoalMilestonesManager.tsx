import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Plus,
  MoreVertical,
  Flag,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Trash2,
  Edit,
  GripVertical,
  Paperclip,
} from "lucide-react";
import { useGoalMilestones, GoalMilestone, CreateMilestoneData } from "@/hooks/useGoalMilestones";
import { format, isPast, isToday } from "date-fns";

interface GoalMilestonesManagerProps {
  goalId: string;
  readonly?: boolean;
}

const STATUS_CONFIG = {
  pending: { icon: Circle, label: "Pending", color: "text-muted-foreground" },
  in_progress: { icon: Clock, label: "In Progress", color: "text-blue-600" },
  completed: { icon: CheckCircle2, label: "Completed", color: "text-green-600" },
  missed: { icon: AlertTriangle, label: "Missed", color: "text-destructive" },
};

export function GoalMilestonesManager({ goalId, readonly = false }: GoalMilestonesManagerProps) {
  const {
    milestones,
    loading,
    saving,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
    completeMilestone,
    calculateMilestoneProgress,
  } = useGoalMilestones(goalId);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<GoalMilestone | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weight, setWeight] = useState("0");

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setWeight("0");
    setEditingMilestone(null);
  };

  const handleAdd = async () => {
    if (!title.trim() || !dueDate) return;

    await createMilestone({
      goal_id: goalId,
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate,
      weight: parseFloat(weight) || 0,
    } as CreateMilestoneData);

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingMilestone || !title.trim() || !dueDate) return;

    await updateMilestone(editingMilestone.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate,
      weight: parseFloat(weight) || 0,
    });

    resetForm();
  };

  const handleToggleComplete = async (milestone: GoalMilestone) => {
    if (milestone.status === "completed") {
      await updateMilestone(milestone.id, { status: "pending" });
    } else {
      await completeMilestone(milestone.id);
    }
  };

  const handleStatusChange = async (milestoneId: string, status: GoalMilestone["status"]) => {
    await updateMilestone(milestoneId, { status });
  };

  const openEditDialog = (milestone: GoalMilestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title);
    setDescription(milestone.description || "");
    setDueDate(milestone.due_date);
    setWeight(String(milestone.weight || 0));
  };

  const getMilestoneDueStatus = (milestone: GoalMilestone) => {
    if (milestone.status === "completed") return null;
    const dueDate = new Date(milestone.due_date);
    if (isPast(dueDate) && !isToday(dueDate)) return "overdue";
    if (isToday(dueDate)) return "today";
    return null;
  };

  const progress = calculateMilestoneProgress();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Milestones</CardTitle>
        </div>
        {!readonly && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Milestone title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <DatePicker
                      value={dueDate}
                      onChange={(date) => setDueDate(date ? format(date, "yyyy-MM-dd") : "")}
                      placeholder="Select due date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (%)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAdd} disabled={saving || !title.trim() || !dueDate}>
                    {saving ? "Adding..." : "Add Milestone"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {/* Progress Summary */}
        {milestones.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {milestones.filter(m => m.status === "completed").length} of {milestones.length} completed
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Milestones List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading milestones...</div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No milestones yet</p>
            <p className="text-sm">Add milestones to track key deliverables</p>
          </div>
        ) : (
          <div className="space-y-2">
            {milestones.map((milestone) => {
              const StatusIcon = STATUS_CONFIG[milestone.status].icon;
              const dueStatus = getMilestoneDueStatus(milestone);

              return (
                <div
                  key={milestone.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                    milestone.status === "completed" ? "opacity-75" : ""
                  }`}
                >
                  {!readonly && (
                    <div className="pt-0.5">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    </div>
                  )}

                  <div className="pt-0.5">
                    <Checkbox
                      checked={milestone.status === "completed"}
                      onCheckedChange={() => handleToggleComplete(milestone)}
                      disabled={readonly}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-medium ${milestone.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {milestone.title}
                        </p>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {milestone.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {milestone.weight > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {milestone.weight}%
                          </Badge>
                        )}
                        {milestone.evidence_url && (
                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <Badge 
                        variant="outline" 
                        className={STATUS_CONFIG[milestone.status].color}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {STATUS_CONFIG[milestone.status].label}
                      </Badge>
                      
                      <span className={`flex items-center gap-1 ${
                        dueStatus === "overdue" ? "text-destructive" :
                        dueStatus === "today" ? "text-yellow-600" :
                        "text-muted-foreground"
                      }`}>
                        <Clock className="h-3 w-3" />
                        {dueStatus === "overdue" && "Overdue: "}
                        {dueStatus === "today" && "Due today: "}
                        {format(new Date(milestone.due_date), "MMM d, yyyy")}
                      </span>

                      {milestone.completed_date && (
                        <span className="text-green-600">
                          Completed: {format(new Date(milestone.completed_date), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>

                  {!readonly && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(milestone)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(milestone.id, "in_progress")}
                          disabled={milestone.status === "in_progress"}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Mark In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(milestone.id, "missed")}
                          disabled={milestone.status === "missed"}
                          className="text-destructive"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark as Missed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteMilestone(milestone.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        {editingMilestone && (
          <Dialog open={!!editingMilestone} onOpenChange={() => resetForm()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle">Title *</Label>
                  <Input
                    id="editTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <DatePicker
                      value={dueDate}
                      onChange={(date) => setDueDate(date ? format(date, "yyyy-MM-dd") : "")}
                      placeholder="Select due date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editWeight">Weight (%)</Label>
                    <Input
                      id="editWeight"
                      type="number"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => resetForm()}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={saving || !title.trim() || !dueDate}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
