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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useGoalApprovals, GoalApprovalRule } from "@/hooks/useGoalApprovals";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_level: string;
  goal_type: string;
  status: string;
}

interface GoalSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal;
  companyId?: string;
  onSuccess?: () => void;
}

export function GoalSubmitDialog({
  open,
  onOpenChange,
  goal,
  companyId,
  onSuccess,
}: GoalSubmitDialogProps) {
  const { rules, submitGoalForApproval, getRuleForGoalLevel } = useGoalApprovals(companyId);
  const [loading, setLoading] = useState(false);

  const applicableRule = getRuleForGoalLevel(goal.goal_level);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const success = await submitGoalForApproval(goal.id);
      if (success) {
        onOpenChange(false);
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const getApprovalTypeDescription = (rule: GoalApprovalRule) => {
    switch (rule.approval_type) {
      case "no_approval":
        return "This goal will be automatically approved and activated.";
      case "single_level":
        return "This goal will be sent to your direct manager for approval.";
      case "multi_level":
        return "This goal will go through a multi-level approval chain.";
      case "skip_level":
        return "This goal will be sent to your manager's manager for approval.";
      default:
        return "This goal will be submitted for approval.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submit Goal for Approval
          </DialogTitle>
          <DialogDescription>
            Review the goal details before submitting for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h4 className="font-medium">{goal.title}</h4>
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}
            <div className="flex gap-2">
              <Badge variant="outline">{goal.goal_type.replace(/_/g, " ")}</Badge>
              <Badge variant="secondary">{goal.goal_level}</Badge>
            </div>
          </div>

          {applicableRule ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {getApprovalTypeDescription(applicableRule)}
                {applicableRule.requires_hr_approval && (
                  <span className="block mt-1 text-muted-foreground">
                    HR approval is also required.
                  </span>
                )}
                {applicableRule.max_approval_days && (
                  <span className="block mt-1 text-muted-foreground">
                    Expected approval within {applicableRule.max_approval_days} days.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No approval rule configured for {goal.goal_level} goals. 
                The goal will be submitted but may require manual processing.
              </AlertDescription>
            </Alert>
          )}

          {goal.status !== "draft" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Only draft goals can be submitted for approval. 
                Current status: <Badge variant="outline">{goal.status}</Badge>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || goal.status !== "draft"}
          >
            {loading ? (
              "Submitting..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
