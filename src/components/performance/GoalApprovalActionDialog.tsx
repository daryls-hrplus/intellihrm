import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { GoalApproval } from "@/hooks/useGoalApprovals";

interface GoalApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approval: GoalApproval;
  actionType: "approve" | "reject" | "return";
  onConfirm: (comments?: string) => Promise<void>;
}

const actionConfig = {
  approve: {
    title: "Approve Goal",
    description: "Confirm approval of this goal. It will move to the next approval step or become active.",
    icon: CheckCircle,
    iconColor: "text-success",
    buttonText: "Approve Goal",
    buttonVariant: "default" as const,
    commentsRequired: false,
    commentsLabel: "Comments (optional)",
  },
  reject: {
    title: "Reject Goal",
    description: "Reject this goal. The goal owner will be notified and the goal will return to draft status.",
    icon: XCircle,
    iconColor: "text-destructive",
    buttonText: "Reject Goal",
    buttonVariant: "destructive" as const,
    commentsRequired: true,
    commentsLabel: "Reason for rejection (required)",
  },
  return: {
    title: "Return for Revision",
    description: "Return this goal to the owner for revisions. They can make changes and resubmit.",
    icon: RotateCcw,
    iconColor: "text-warning",
    buttonText: "Return for Revision",
    buttonVariant: "outline" as const,
    commentsRequired: true,
    commentsLabel: "Feedback for revision (required)",
  },
};

export function GoalApprovalActionDialog({
  open,
  onOpenChange,
  approval,
  actionType,
  onConfirm,
}: GoalApprovalActionDialogProps) {
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const config = actionConfig[actionType];
  const Icon = config.icon;
  const goal = approval.goal;

  const handleConfirm = async () => {
    if (config.commentsRequired && !comments.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm(comments.trim() || undefined);
      setComments("");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setComments("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {goal && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="font-medium">{goal.title}</h4>
              {goal.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {goal.description}
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{goal.goal_type.replace(/_/g, " ")}</Badge>
                <Badge variant="secondary">{goal.goal_level}</Badge>
                {goal.employee?.full_name && (
                  <Badge variant="outline" className="text-xs">
                    Owner: {goal.employee.full_name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {actionType === "reject" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Rejecting a goal will return it to draft status. The owner will need to revise and resubmit.
              </AlertDescription>
            </Alert>
          )}

          {actionType === "return" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The goal owner will receive your feedback and can make revisions before resubmitting.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="comments">{config.commentsLabel}</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                actionType === "approve"
                  ? "Add any comments or feedback..."
                  : actionType === "reject"
                  ? "Please provide a clear reason for rejection..."
                  : "Describe what changes are needed..."
              }
              rows={3}
              className={config.commentsRequired && !comments.trim() ? "border-destructive" : ""}
            />
            {config.commentsRequired && !comments.trim() && (
              <p className="text-sm text-destructive">Comments are required for this action</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={loading || (config.commentsRequired && !comments.trim())}
          >
            {loading ? "Processing..." : config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
