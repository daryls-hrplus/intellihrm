import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle, Star, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGoalRatingSubmissions } from "@/hooks/useGoalRatingSubmissions";
import {
  DISPUTE_CATEGORY_LABELS,
  DISPUTE_STATUS_LABELS,
  type GoalRatingSubmission,
  type DisputeStatus,
} from "@/types/goalRatings";

interface DisputeResolutionPanelProps {
  companyId: string;
  onResolved?: () => void;
}

export function DisputeResolutionPanel({ companyId, onResolved }: DisputeResolutionPanelProps) {
  const [disputes, setDisputes] = useState<GoalRatingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<GoalRatingSubmission | null>(null);
  const [resolutionDialogOpen, setResolutionDialogOpen] = useState(false);

  const { fetchDisputedSubmissions, resolveDispute } = useGoalRatingSubmissions({ companyId });

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setLoading(true);
    const data = await fetchDisputedSubmissions();
    setDisputes(data);
    setLoading(false);
  };

  const handleOpenResolution = (dispute: GoalRatingSubmission) => {
    setSelectedDispute(dispute);
    setResolutionDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (disputes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
            <p className="text-lg font-medium">No Pending Disputes</p>
            <p className="text-sm">All rating disputes have been resolved</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Rating Disputes ({disputes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        dispute.dispute_status === "open"
                          ? "border-yellow-500 text-yellow-600"
                          : dispute.dispute_status === "under_review"
                          ? "border-blue-500 text-blue-600"
                          : ""
                      }
                    >
                      {DISPUTE_STATUS_LABELS[dispute.dispute_status as DisputeStatus]?.label || dispute.dispute_status}
                    </Badge>
                    {dispute.dispute_category && (
                      <Badge variant="secondary">
                        {DISPUTE_CATEGORY_LABELS[dispute.dispute_category]?.label}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Employee ID: {dispute.employee_id.slice(0, 8)}...
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dispute.disputed_at && format(new Date(dispute.disputed_at), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      Self: <strong>{dispute.self_rating || "-"}</strong>
                    </span>
                    <span>
                      Manager: <strong>{dispute.manager_rating || "-"}</strong>
                    </span>
                    <span>
                      Final: <strong>{dispute.final_score || "-"}</strong>
                    </span>
                  </div>

                  {dispute.dispute_reason && (
                    <p className="text-sm italic text-muted-foreground line-clamp-2">
                      "{dispute.dispute_reason}"
                    </p>
                  )}
                </div>

                <Button size="sm" onClick={() => handleOpenResolution(dispute)}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedDispute && (
        <DisputeResolutionDialog
          open={resolutionDialogOpen}
          onOpenChange={setResolutionDialogOpen}
          dispute={selectedDispute}
          companyId={companyId}
          onResolved={() => {
            loadDisputes();
            onResolved?.();
          }}
        />
      )}
    </>
  );
}

interface DisputeResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: GoalRatingSubmission;
  companyId: string;
  onResolved?: () => void;
}

function DisputeResolutionDialog({
  open,
  onOpenChange,
  dispute,
  companyId,
  onResolved,
}: DisputeResolutionDialogProps) {
  const [resolution, setResolution] = useState("");
  const [status, setStatus] = useState<DisputeStatus>("resolved");
  const [adjustedScore, setAdjustedScore] = useState<string>(dispute.final_score?.toString() || "");
  const [loading, setLoading] = useState(false);

  const { resolveDispute } = useGoalRatingSubmissions({ companyId });

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error("Please provide a resolution explanation");
      return;
    }

    setLoading(true);
    try {
      const adjustedFinal = status === "resolved" ? parseFloat(adjustedScore) : undefined;
      const { error } = await resolveDispute(
        dispute.id,
        "current-user", // This would be auth.uid() in real implementation
        resolution.trim(),
        status,
        adjustedFinal
      );
      if (error) throw new Error(error);
      toast.success("Dispute resolved successfully");
      onOpenChange(false);
      onResolved?.();
    } catch (error: any) {
      console.error("Error resolving dispute:", error);
      toast.error(error.message || "Failed to resolve dispute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Resolve Rating Dispute</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dispute Details */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {dispute.dispute_category && DISPUTE_CATEGORY_LABELS[dispute.dispute_category]?.label}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Self Rating</span>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-warning" />
                  <strong>{dispute.self_rating || "-"}</strong>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Manager Rating</span>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-warning" />
                  <strong>{dispute.manager_rating || "-"}</strong>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Final Score</span>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-warning" />
                  <strong>{dispute.final_score || "-"}</strong>
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <span className="text-sm text-muted-foreground">Employee's Reason:</span>
              <p className="text-sm mt-1 italic">"{dispute.dispute_reason}"</p>
            </div>
          </div>

          {/* Resolution Status */}
          <div className="space-y-2">
            <Label>Resolution Decision</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DisputeStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Resolved - Adjust Rating
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Rejected - Uphold Original Rating
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adjusted Score (if resolving) */}
          {status === "resolved" && (
            <div className="space-y-2">
              <Label>Adjusted Final Score</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={adjustedScore}
                onChange={(e) => setAdjustedScore(e.target.value)}
                placeholder="Enter adjusted score"
              />
            </div>
          )}

          {/* Resolution Comments */}
          <div className="space-y-2">
            <Label>Resolution Explanation *</Label>
            <Textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Provide detailed explanation for the resolution..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={loading || !resolution.trim()}>
            {loading ? "Submitting..." : "Submit Resolution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
