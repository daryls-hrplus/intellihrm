import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString } from "@/utils/dateUtils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

interface Goal {
  id: string;
  title: string;
  progress_percentage: number;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
}

interface GoalProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  onSuccess: () => void;
}

export function GoalProgressDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: GoalProgressDialogProps) {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(goal.progress_percentage);
  const [currentValue, setCurrentValue] = useState(String(goal.current_value || 0));
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      // Update goal progress
      const { error: goalError } = await supabase
        .from("performance_goals")
        .update({
          progress_percentage: progress,
          current_value: goal.target_value ? parseFloat(currentValue) : null,
          status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "active",
          completed_date: progress === 100 ? getTodayString() : null,
        })
        .eq("id", goal.id);

      if (goalError) throw goalError;

      // Add a progress update comment if notes provided
      if (notes.trim()) {
        const { error: commentError } = await supabase
          .from("goal_comments")
          .insert([{
            goal_id: goal.id,
            user_id: user.id,
            comment: notes,
            comment_type: "progress_update",
          }]);

        if (commentError) throw commentError;
      }

      await logAction({
        action: "UPDATE",
        entityType: "performance_goal",
        entityId: goal.id,
        entityName: goal.title,
        oldValues: { progress_percentage: goal.progress_percentage },
        newValues: { progress_percentage: progress },
        metadata: { update_type: "progress_update" },
      });

      toast.success("Progress updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-medium text-foreground mb-2">{goal.title}</h3>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Progress Percentage</Label>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <Slider
                value={[progress]}
                onValueChange={([value]) => setProgress(value)}
                max={100}
                step={1}
              />
            </div>

            {goal.target_value && (
              <div>
                <Label htmlFor="currentValue">
                  Current Value ({goal.unit_of_measure || "units"})
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="currentValue"
                    type="number"
                    value={currentValue}
                    onChange={(e) => {
                      setCurrentValue(e.target.value);
                      const newValue = parseFloat(e.target.value) || 0;
                      const newProgress = Math.min(
                        100,
                        Math.round((newValue / goal.target_value!) * 100)
                      );
                      setProgress(newProgress);
                    }}
                  />
                  <span className="text-muted-foreground">
                    / {goal.target_value} {goal.unit_of_measure}
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Progress Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you've accomplished..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Update Progress"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
