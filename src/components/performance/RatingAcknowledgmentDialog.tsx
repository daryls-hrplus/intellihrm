import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Star, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useGoalRatingSubmissions } from "@/hooks/useGoalRatingSubmissions";
import type { GoalRatingSubmission } from "@/types/goalRatings";

interface RatingAcknowledgmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: GoalRatingSubmission;
  goalTitle: string;
  companyId: string;
  currentUserId: string;
  allowDispute?: boolean;
  onSuccess?: () => void;
  onDispute?: () => void;
}

export function RatingAcknowledgmentDialog({
  open,
  onOpenChange,
  submission,
  goalTitle,
  companyId,
  currentUserId,
  allowDispute = true,
  onSuccess,
  onDispute,
}: RatingAcknowledgmentDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const { acknowledgeRating } = useGoalRatingSubmissions({ companyId });

  const handleAcknowledge = async () => {
    if (!acknowledged) {
      toast.error("Please confirm acknowledgment");
      return;
    }

    setLoading(true);
    try {
      const { error } = await acknowledgeRating(submission.id, currentUserId, comments || undefined);
      if (error) throw new Error(error);
      toast.success("Rating acknowledged successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error acknowledging rating:", error);
      toast.error(error.message || "Failed to acknowledge rating");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Acknowledge Rating
          </DialogTitle>
          <DialogDescription>{goalTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rating Summary */}
          <div className="space-y-3 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Self Rating</span>
              <div className="flex items-center gap-2">
                {submission.self_rating ? renderStars(submission.self_rating) : "-"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Manager Rating</span>
              <div className="flex items-center gap-2">
                {submission.manager_rating ? renderStars(submission.manager_rating) : "-"}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="font-medium">Final Score</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                {submission.final_score?.toFixed(1) || "-"} / 5
              </Badge>
            </div>
          </div>

          {/* Manager Comments */}
          {submission.manager_comments && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Manager Comments</Label>
              <p className="text-sm p-3 rounded-lg bg-muted/30 italic">
                "{submission.manager_comments}"
              </p>
            </div>
          )}

          {/* Acknowledgment Checkbox */}
          <div className="flex items-start space-x-3 p-4 rounded-lg border">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
            />
            <div className="space-y-1">
              <label
                htmlFor="acknowledge"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                I acknowledge this rating
              </label>
              <p className="text-xs text-muted-foreground">
                By checking this box, I confirm I have reviewed and acknowledge this performance rating.
                This does not indicate agreement with the rating.
              </p>
            </div>
          </div>

          {/* Employee Comments */}
          <div className="space-y-2">
            <Label>Your Comments (Optional)</Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments about this rating..."
              rows={3}
            />
          </div>

          {/* Dispute Option */}
          {allowDispute && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span>If you disagree with this rating, you can</span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-destructive"
                  onClick={() => {
                    onOpenChange(false);
                    onDispute?.();
                  }}
                >
                  file a dispute
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAcknowledge} disabled={loading || !acknowledged}>
            {loading ? "Submitting..." : "Confirm Acknowledgment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
