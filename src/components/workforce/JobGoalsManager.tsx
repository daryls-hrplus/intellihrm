import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useAuditLog } from "@/hooks/useAuditLog";

interface JobGoal {
  id: string;
  job_id: string;
  goal_name: string;
  goal_description: string | null;
  weighting: number;
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface JobGoalsManagerProps {
  jobId: string;
  companyId: string;
}

export function JobGoalsManager({ jobId, companyId }: JobGoalsManagerProps) {
  const [jobGoals, setJobGoals] = useState<JobGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    goal_name: "",
    goal_description: "",
    weighting: 0,
    start_date: getTodayString(),
    end_date: "",
    notes: "",
  });
  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchJobGoals();
  }, [jobId]);

  const fetchJobGoals = async () => {
    const { data, error } = await supabase
      .from("job_goals")
      .select("*")
      .eq("job_id", jobId)
      .order("goal_name");

    if (error) {
      console.error("Error fetching job goals:", error);
      toast.error("Failed to load job goals");
    } else {
      setJobGoals(data || []);
    }
    setLoading(false);
  };

  const datesOverlap = (
    start1: string,
    end1: string | null,
    start2: string,
    end2: string | null
  ): boolean => {
    const e1 = end1 || "9999-12-31";
    const e2 = end2 || "9999-12-31";
    return start1 <= e2 && start2 <= e1;
  };

  const calculateOverlappingWeight = (
    newStartDate: string,
    newEndDate: string | null
  ): number => {
    return jobGoals
      .filter((jg) =>
        datesOverlap(newStartDate, newEndDate, jg.start_date, jg.end_date)
      )
      .reduce((sum, jg) => sum + Number(jg.weighting), 0);
  };

  const handleSave = async () => {
    if (!formData.goal_name) {
      toast.error("Please enter a goal name");
      return;
    }

    const overlappingWeight = calculateOverlappingWeight(
      formData.start_date,
      formData.end_date || null
    );

    if (overlappingWeight + formData.weighting > 100) {
      toast.error(
        `Total weighting for overlapping goals would exceed 100% (current: ${overlappingWeight}%, adding: ${formData.weighting}%)`
      );
      return;
    }

    const { data, error } = await supabase
      .from("job_goals")
      .insert({
        job_id: jobId,
        goal_name: formData.goal_name,
        goal_description: formData.goal_description || null,
        weighting: formData.weighting,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving job goal:", error);
      if (error.message.includes("Overlapping date ranges")) {
        toast.error(
          "This goal already exists with overlapping dates for this job"
        );
      } else {
        toast.error("Failed to save job goal");
      }
      return;
    }

    await logAction({
      action: "CREATE",
      entityType: "job_goals",
      entityId: data.id,
      entityName: formData.goal_name,
      newValues: formData,
    });

    toast.success("Goal added successfully");
    setDialogOpen(false);
    setFormData({
      goal_name: "",
      goal_description: "",
      weighting: 0,
      start_date: getTodayString(),
      end_date: "",
      notes: "",
    });
    fetchJobGoals();
  };

  const handleDelete = async (goal: JobGoal) => {
    const { error } = await supabase
      .from("job_goals")
      .delete()
      .eq("id", goal.id);

    if (error) {
      console.error("Error deleting job goal:", error);
      toast.error("Failed to delete job goal");
      return;
    }

    await logAction({
      action: "DELETE",
      entityType: "job_goals",
      entityId: goal.id,
      entityName: goal.goal_name,
      oldValues: { ...goal },
    });

    toast.success("Goal removed successfully");
    fetchJobGoals();
  };

  const currentTotalWeight = jobGoals.reduce(
    (sum, jg) => sum + Number(jg.weighting),
    0
  );

  if (loading) {
    return <div className="text-muted-foreground">Loading goals...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Current Weight: {currentTotalWeight}%
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Goal to Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goal_name">Goal Name *</Label>
                <Input
                  id="goal_name"
                  value={formData.goal_name}
                  onChange={(e) =>
                    setFormData({ ...formData, goal_name: e.target.value })
                  }
                  placeholder="Enter goal name"
                />
              </div>
              <div>
                <Label htmlFor="goal_description">Description</Label>
                <Textarea
                  id="goal_description"
                  value={formData.goal_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goal_description: e.target.value,
                    })
                  }
                  placeholder="Enter goal description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="weighting">Weighting (%)</Label>
                <Input
                  id="weighting"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weighting}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      weighting: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {jobGoals.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No goals assigned to this job yet.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Goal Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Weighting</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobGoals.map((goal) => (
              <TableRow key={goal.id}>
                <TableCell>{goal.goal_name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {goal.goal_description || "-"}
                </TableCell>
                <TableCell>{goal.start_date}</TableCell>
                <TableCell>{goal.end_date || "Ongoing"}</TableCell>
                <TableCell>{goal.weighting}%</TableCell>
                <TableCell className="max-w-[150px] truncate">
                  {goal.notes || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(goal)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
