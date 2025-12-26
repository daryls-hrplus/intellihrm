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
import { Star, User, UserCheck, Calculator, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useGoalRatingConfiguration } from "@/hooks/useGoalRatingConfiguration";
import { useGoalRatingSubmissions } from "@/hooks/useGoalRatingSubmissions";
import { useRatingCalculator } from "@/hooks/useRatingCalculator";
import { STATUS_LABELS } from "@/types/goalRatings";

interface EnhancedGoalRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: {
    id: string;
    title: string;
    progress_percentage?: number | null;
    weighting?: number | null;
    employee_id?: string | null;
  };
  companyId: string;
  userRole: "employee" | "manager";
  currentUserId: string;
  onSuccess?: () => void;
}

const ratingLabels: Record<number, string> = {
  1: "Needs Improvement",
  2: "Below Expectations",
  3: "Meets Expectations",
  4: "Exceeds Expectations",
  5: "Outstanding",
};

export function EnhancedGoalRatingDialog({
  open,
  onOpenChange,
  goal,
  companyId,
  userRole,
  currentUserId,
  onSuccess,
}: EnhancedGoalRatingDialogProps) {
  const [selfRating, setSelfRating] = useState<number>(3);
  const [managerRating, setManagerRating] = useState<number>(3);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  const { configuration } = useGoalRatingConfiguration({ companyId });
  const { submitSelfRating, submitManagerRating, fetchSubmission } = useGoalRatingSubmissions({ companyId });
  const { calculateFinalScore, getWeightAdjustedScore } = useRatingCalculator();

  useEffect(() => {
    if (open && goal.id) {
      loadExistingSubmission();
    }
  }, [open, goal.id]);

  const loadExistingSubmission = async () => {
    const submission = await fetchSubmission(goal.id);
    if (submission) {
      setExistingSubmission(submission);
      if (submission.self_rating) setSelfRating(submission.self_rating);
      if (submission.manager_rating) setManagerRating(submission.manager_rating);
    } else {
      setExistingSubmission(null);
      setSelfRating(3);
      setManagerRating(3);
    }
    setComments("");
  };

  const calculatedFinal = calculateFinalScore(
    configuration,
    selfRating,
    managerRating,
    goal.progress_percentage || null,
    5
  );

  const weightAdjusted = calculatedFinal && goal.weighting
    ? getWeightAdjustedScore(calculatedFinal, goal.weighting, 5)
    : null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (userRole === "employee") {
        const { error } = await submitSelfRating(
          goal.id,
          currentUserId,
          selfRating,
          comments,
          configuration.id || undefined
        );
        if (error) throw new Error(error);
        toast.success("Self-rating submitted successfully");
      } else {
        const { error } = await submitManagerRating(
          goal.id,
          currentUserId,
          managerRating,
          comments,
          calculatedFinal || undefined,
          calculatedFinal || managerRating
        );
        if (error) throw new Error(error);
        toast.success("Manager rating submitted successfully");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving rating:", error);
      toast.error(error.message || "Failed to save rating");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${star <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" />
            {userRole === "employee" ? "Rate Your Goal" : "Rate Employee Goal"}
          </DialogTitle>
          <DialogDescription>{goal.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {existingSubmission && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {STATUS_LABELS[existingSubmission.status as keyof typeof STATUS_LABELS]?.label || existingSubmission.status}
              </Badge>
            </div>
          )}

          {/* Progress indicator */}
          {goal.progress_percentage !== null && goal.progress_percentage !== undefined && (
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Goal Progress
              </span>
              <span className="font-medium">{goal.progress_percentage}%</span>
            </div>
          )}

          {/* Self Rating Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Self Rating
              </Label>
              {existingSubmission?.self_rating && userRole === "manager" && (
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
                {renderStars(existingSubmission?.self_rating || 0)}
                <span className="text-sm text-muted-foreground">
                  {existingSubmission?.self_rating
                    ? ratingLabels[existingSubmission.self_rating]
                    : "Not yet submitted"}
                </span>
              </div>
            )}
          </div>

          {/* Manager Rating Section */}
          {userRole === "manager" && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Manager Rating
                </Label>
                <Slider
                  value={[managerRating]}
                  onValueChange={(value) => setManagerRating(value[0])}
                  min={1}
                  max={5}
                  step={1}
                />
                <div className="flex items-center justify-between">
                  {renderStars(managerRating)}
                  <span className="text-sm font-medium text-muted-foreground">
                    {ratingLabels[managerRating]}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Final Score Preview */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Final Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {calculatedFinal?.toFixed(1) || "-"}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 5</span>
                  </div>
                </div>
                {weightAdjusted && goal.weighting && (
                  <p className="text-xs text-muted-foreground">
                    Weight-adjusted contribution: {weightAdjusted.toFixed(1)}% (of {goal.weighting}% weight)
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Method: {configuration.calculation_method.replace(/_/g, ' ')}
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
              placeholder="Add any additional comments..."
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
