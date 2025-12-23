import { useState, useEffect } from "react";
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, User, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface GoalRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    self_rating?: number | null;
    manager_rating?: number | null;
    final_score?: number | null;
    employee_id?: string | null;
  };
  userRole: "employee" | "manager";
  onSuccess?: () => void;
}

const ratingLabels: Record<number, string> = {
  1: "Needs Improvement",
  2: "Below Expectations",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

export function GoalRatingDialog({
  open,
  onOpenChange,
  goal,
  userRole,
  onSuccess,
}: GoalRatingDialogProps) {
  const { t } = useLanguage();
  const [selfRating, setSelfRating] = useState<number>(goal.self_rating || 3);
  const [managerRating, setManagerRating] = useState<number>(goal.manager_rating || 3);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelfRating(goal.self_rating || 3);
      setManagerRating(goal.manager_rating || 3);
      setComments("");
    }
  }, [open, goal]);

  const calculateFinalScore = () => {
    if (userRole === "employee") {
      return selfRating;
    }
    // Manager view: average of self and manager rating
    const self = goal.self_rating || selfRating;
    return Math.round(((self + managerRating) / 2) * 10) / 10;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updates: Record<string, unknown> = {};

      if (userRole === "employee") {
        updates.self_rating = selfRating;
      } else {
        updates.manager_rating = managerRating;
        updates.final_score = calculateFinalScore();
      }

      const { error } = await supabase
        .from("performance_goals")
        .update(updates)
        .eq("id", goal.id);

      if (error) throw error;

      toast.success(
        userRole === "employee"
          ? "Self-rating submitted successfully"
          : "Manager rating submitted successfully"
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save rating");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            {userRole === "employee" ? "Rate Your Goal" : "Rate Employee Goal"}
          </DialogTitle>
          <DialogDescription>
            {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Self Rating Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Self Rating
              </Label>
              {goal.self_rating && userRole === "manager" && (
                <Badge variant="secondary">Submitted</Badge>
              )}
            </div>

            {userRole === "employee" ? (
              <div className="space-y-3">
                <Slider
                  value={[selfRating]}
                  onValueChange={(value) => setSelfRating(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex items-center justify-between">
                  {renderStars(selfRating)}
                  <span className="text-sm font-medium text-muted-foreground">
                    {ratingLabels[selfRating]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                {renderStars(goal.self_rating || 0)}
                <span className="text-sm text-muted-foreground">
                  {goal.self_rating
                    ? ratingLabels[goal.self_rating]
                    : "Not yet submitted"}
                </span>
              </div>
            )}
          </div>

          {/* Manager Rating Section - Only visible for managers */}
          {userRole === "manager" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Manager Rating
                </Label>
                <div className="space-y-3">
                  <Slider
                    value={[managerRating]}
                    onValueChange={(value) => setManagerRating(value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between">
                    {renderStars(managerRating)}
                    <span className="text-sm font-medium text-muted-foreground">
                      {ratingLabels[managerRating]}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Final Score Preview */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Final Score</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {calculateFinalScore()}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 5</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average of self rating and manager rating
                </p>
              </div>
            </>
          )}

          {/* Comments */}
          <div className="space-y-2">
            <Label>Comments (Optional)</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any additional comments about this rating..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}