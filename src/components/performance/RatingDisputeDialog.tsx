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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useGoalRatingSubmissions } from "@/hooks/useGoalRatingSubmissions";
import { DISPUTE_CATEGORY_LABELS, type DisputeCategory } from "@/types/goalRatings";

interface RatingDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submissionId: string;
  goalTitle: string;
  companyId: string;
  onSuccess?: () => void;
}

export function RatingDisputeDialog({
  open,
  onOpenChange,
  submissionId,
  goalTitle,
  companyId,
  onSuccess,
}: RatingDisputeDialogProps) {
  const [category, setCategory] = useState<DisputeCategory | "">("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const { disputeRating } = useGoalRatingSubmissions({ companyId });

  const handleSubmit = async () => {
    if (!category) {
      toast.error("Please select a dispute category");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for your dispute");
      return;
    }

    setLoading(true);
    try {
      const { error } = await disputeRating(submissionId, reason.trim(), category);
      if (error) throw new Error(error);
      toast.success("Dispute submitted successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error submitting dispute:", error);
      toast.error(error.message || "Failed to submit dispute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Dispute Rating
          </DialogTitle>
          <DialogDescription>{goalTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              Submitting a dispute will notify HR and your manager. Please ensure you have valid
              reasons before proceeding.
            </p>
          </div>

          {/* Dispute Category */}
          <div className="space-y-2">
            <Label>Dispute Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DisputeCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DISPUTE_CATEGORY_LABELS).map(([key, { label, description }]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dispute Reason */}
          <div className="space-y-2">
            <Label>Detailed Reason *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide specific details about why you are disputing this rating..."
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific and provide examples or evidence where possible.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !category || !reason.trim()}
          >
            {loading ? "Submitting..." : "Submit Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
