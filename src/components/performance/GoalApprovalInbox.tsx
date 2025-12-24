import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Inbox,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  User,
  Target,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useGoalApprovals, GoalApproval } from "@/hooks/useGoalApprovals";
import { GoalApprovalActionDialog } from "./GoalApprovalActionDialog";
import { formatDistanceToNow, isPast } from "date-fns";

interface GoalApprovalInboxProps {
  companyId?: string;
}

export function GoalApprovalInbox({ companyId }: GoalApprovalInboxProps) {
  const { pendingApprovals, loading, processApproval, fetchPendingApprovals } = useGoalApprovals(companyId);
  const [selectedApproval, setSelectedApproval] = useState<GoalApproval | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "return">("approve");

  const handleAction = (approval: GoalApproval, action: "approve" | "reject" | "return") => {
    setSelectedApproval(approval);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const handleActionComplete = async (comments?: string) => {
    if (!selectedApproval) return;
    
    const decision = actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "returned";
    await processApproval(selectedApproval.id, decision, comments);
    setActionDialogOpen(false);
    setSelectedApproval(null);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading pending approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Pending Goal Approvals
          </h3>
          <p className="text-sm text-muted-foreground">
            Goals waiting for your approval decision
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {pendingApprovals.length} pending
        </Badge>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-success mb-4" />
            <p className="text-muted-foreground">No pending approvals</p>
            <p className="text-sm text-muted-foreground">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => {
            const goal = approval.goal;
            if (!goal) return null;

            const isOverdue = approval.due_date && isPast(new Date(approval.due_date));
            const timeAgo = formatDistanceToNow(new Date(approval.created_at), { addSuffix: true });

            return (
              <Card key={approval.id} className={isOverdue ? "border-destructive/50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium">{goal.title}</h4>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {goal.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {goal.employee?.full_name || "Unknown"}
                        </span>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="outline" className="text-xs">
                          {goal.goal_level}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {goal.goal_type.replace(/_/g, " ")}
                        </Badge>
                        <Separator orientation="vertical" className="h-4" />
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {timeAgo}
                        </span>
                      </div>

                      {approval.due_date && (
                        <p className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                          SLA: {isOverdue ? "Overdue since " : "Due "}
                          {formatDistanceToNow(new Date(approval.due_date), { addSuffix: !isOverdue })}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(approval, "return")}
                      >
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Return
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleAction(approval, "reject")}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAction(approval, "approve")}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedApproval && (
        <GoalApprovalActionDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          approval={selectedApproval}
          actionType={actionType}
          onConfirm={handleActionComplete}
        />
      )}
    </div>
  );
}
