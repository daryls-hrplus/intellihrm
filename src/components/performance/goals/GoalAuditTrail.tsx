import { useState } from "react";
import { format } from "date-fns";
import {
  History,
  FileEdit,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Undo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGoalAdjustments } from "@/hooks/useGoalAdjustments";
import { useAuth } from "@/contexts/AuthContext";
import {
  GoalAdjustment,
  CHANGE_TYPE_LABELS,
  ADJUSTMENT_REASON_LABELS,
  APPROVAL_STATUS_LABELS,
  APPROVAL_STATUS_COLORS,
} from "@/types/goalAdjustments";

interface GoalAuditTrailProps {
  goalId: string;
}

export function GoalAuditTrail({ goalId }: GoalAuditTrailProps) {
  const { user } = useAuth();
  const { adjustments, isLoading, updateApproval, withdrawAdjustment } = useGoalAdjustments(goalId);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleApprove = (adjustmentId: string) => {
    updateApproval.mutate({
      adjustment_id: adjustmentId,
      approval_status: "approved",
    });
  };

  const handleReject = (adjustmentId: string) => {
    updateApproval.mutate({
      adjustment_id: adjustmentId,
      approval_status: "rejected",
    });
  };

  const handleWithdraw = (adjustmentId: string) => {
    withdrawAdjustment.mutate(adjustmentId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Adjustment History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Adjustment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileEdit className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No adjustments have been made to this goal yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Adjustment History
          <Badge variant="secondary" className="ml-2">
            {adjustments.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

          <div className="space-y-4">
            {adjustments.map((adjustment) => (
              <AdjustmentItem
                key={adjustment.id}
                adjustment={adjustment}
                isExpanded={expandedItems.has(adjustment.id)}
                onToggle={() => toggleExpanded(adjustment.id)}
                currentUserId={user?.id}
                onApprove={() => handleApprove(adjustment.id)}
                onReject={() => handleReject(adjustment.id)}
                onWithdraw={() => handleWithdraw(adjustment.id)}
                isUpdating={updateApproval.isPending || withdrawAdjustment.isPending}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdjustmentItemProps {
  adjustment: GoalAdjustment;
  isExpanded: boolean;
  onToggle: () => void;
  currentUserId?: string;
  onApprove: () => void;
  onReject: () => void;
  onWithdraw: () => void;
  isUpdating: boolean;
}

function AdjustmentItem({
  adjustment,
  isExpanded,
  onToggle,
  currentUserId,
  onApprove,
  onReject,
  onWithdraw,
  isUpdating,
}: AdjustmentItemProps) {
  const canApprove = adjustment.approval_status === "pending" && adjustment.adjusted_by !== currentUserId;
  const canWithdraw = adjustment.approval_status === "pending" && adjustment.adjusted_by === currentUserId;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="relative ml-8 rounded-lg border bg-card p-4">
        {/* Timeline dot */}
        <div className="absolute -left-[26px] top-4 h-3 w-3 rounded-full border-2 border-primary bg-background" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={adjustment.adjusted_by_profile?.avatar_url || undefined} />
              <AvatarFallback>
                {adjustment.adjusted_by_profile?.full_name?.[0] || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {adjustment.adjusted_by_profile?.full_name || "Unknown User"}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(adjustment.adjusted_at), "PPp")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{CHANGE_TYPE_LABELS[adjustment.change_type]}</Badge>
            <Badge className={APPROVAL_STATUS_COLORS[adjustment.approval_status]}>
              {APPROVAL_STATUS_LABELS[adjustment.approval_status]}
            </Badge>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm">
            <span className="font-medium">{ADJUSTMENT_REASON_LABELS[adjustment.adjustment_reason]}</span>
          </p>
          {adjustment.reason_details && (
            <p className="mt-1 text-sm text-muted-foreground">{adjustment.reason_details}</p>
          )}
        </div>

        <CollapsibleContent>
          <div className="mt-4 space-y-4 border-t pt-4">
            {adjustment.business_justification && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Business Justification</p>
                <p className="mt-1 text-sm">{adjustment.business_justification}</p>
              </div>
            )}

            {adjustment.impact_assessment && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Impact Assessment</p>
                <p className="mt-1 text-sm">{adjustment.impact_assessment}</p>
              </div>
            )}

            {(adjustment.previous_value || adjustment.new_value) && (
              <div className="grid grid-cols-2 gap-4">
                {adjustment.previous_value && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Previous Value</p>
                    <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(adjustment.previous_value, null, 2)}
                    </pre>
                  </div>
                )}
                {adjustment.new_value && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">New Value</p>
                    <pre className="mt-1 overflow-auto rounded bg-muted p-2 text-xs">
                      {JSON.stringify(adjustment.new_value, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {adjustment.is_material_change && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Material Change
                </span>
              )}
              {adjustment.requires_recalibration && (
                <span className="flex items-center gap-1">
                  <FileEdit className="h-3 w-3" />
                  Requires Recalibration
                </span>
              )}
            </div>

            {adjustment.approved_by_profile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>
                  {adjustment.approval_status === "approved" ? "Approved" : "Reviewed"} by{" "}
                  {adjustment.approved_by_profile.full_name}
                  {adjustment.approved_at && ` on ${format(new Date(adjustment.approved_at), "PPp")}`}
                </span>
              </div>
            )}

            {adjustment.approval_notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Approval Notes</p>
                <p className="mt-1 text-sm">{adjustment.approval_notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {(canApprove || canWithdraw) && (
              <div className="flex gap-2 pt-2">
                {canApprove && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onApprove}
                          disabled={isUpdating}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve this adjustment</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {canApprove && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onReject}
                          disabled={isUpdating}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject this adjustment</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {canWithdraw && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={onWithdraw}
                          disabled={isUpdating}
                        >
                          <Undo className="mr-1 h-4 w-4" />
                          Withdraw
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Withdraw this pending adjustment</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
