import { useState } from "react";
import { format } from "date-fns";
import {
  FileEdit,
  Check,
  X,
  User,
  ChevronDown,
  ChevronUp,
  Target,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePendingAdjustments } from "@/hooks/usePendingAdjustments";
import {
  CHANGE_TYPE_LABELS,
  ADJUSTMENT_REASON_LABELS,
  GoalAdjustment,
} from "@/types/goalAdjustments";
import { GoalVersionComparisonInline } from "./goals/GoalVersionComparison";

interface PendingAdjustmentsListProps {
  companyId: string;
}

export function PendingAdjustmentsList({ companyId }: PendingAdjustmentsListProps) {
  const { pendingAdjustments, isLoading, approveAdjustment, rejectAdjustment } = usePendingAdjustments(companyId);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    adjustmentId: string;
    goalTitle: string;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAction = () => {
    if (!actionDialog) return;
    
    if (actionDialog.type === "approve") {
      approveAdjustment.mutate({ adjustmentId: actionDialog.adjustmentId, notes: actionNotes });
    } else {
      rejectAdjustment.mutate({ adjustmentId: actionDialog.adjustmentId, notes: actionNotes });
    }
    
    setActionDialog(null);
    setActionNotes("");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Pending Goal Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!pendingAdjustments || pendingAdjustments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Pending Goal Adjustments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Check className="h-12 w-12 text-green-500/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              No pending adjustments to review.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Pending Goal Adjustments
            <Badge variant="destructive" className="ml-2">
              {pendingAdjustments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingAdjustments.map((adjustment) => (
            <PendingAdjustmentItem
              key={adjustment.id}
              adjustment={adjustment}
              isExpanded={expandedItems.has(adjustment.id)}
              onToggle={() => toggleExpanded(adjustment.id)}
              onApprove={() =>
                setActionDialog({
                  open: true,
                  type: "approve",
                  adjustmentId: adjustment.id,
                  goalTitle: adjustment.goal?.title || "Unknown Goal",
                })
              }
              onReject={() =>
                setActionDialog({
                  open: true,
                  type: "reject",
                  adjustmentId: adjustment.id,
                  goalTitle: adjustment.goal?.title || "Unknown Goal",
                })
              }
              isUpdating={approveAdjustment.isPending || rejectAdjustment.isPending}
            />
          ))}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionDialog?.open} onOpenChange={() => setActionDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog?.type === "approve" ? "Approve" : "Reject"} Adjustment
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to {actionDialog?.type} the adjustment for "{actionDialog?.goalTitle}".
              {actionDialog?.type === "reject" && " Please provide a reason for rejection."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="action-notes">
              {actionDialog?.type === "approve" ? "Notes (optional)" : "Rejection Reason"}
            </Label>
            <Textarea
              id="action-notes"
              placeholder={
                actionDialog?.type === "approve"
                  ? "Add any notes..."
                  : "Please explain why this adjustment is being rejected..."
              }
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionNotes("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionDialog?.type === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
              disabled={actionDialog?.type === "reject" && !actionNotes.trim()}
            >
              {actionDialog?.type === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface PendingAdjustmentItemProps {
  adjustment: GoalAdjustment & { goal?: { id: string; title: string; employee_id: string } };
  isExpanded: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  isUpdating: boolean;
}

function PendingAdjustmentItem({
  adjustment,
  isExpanded,
  onToggle,
  onApprove,
  onReject,
  isUpdating,
}: PendingAdjustmentItemProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="rounded-lg border bg-card p-4">
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

        {/* Goal Info */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{adjustment.goal?.title || "Unknown Goal"}</span>
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

            {/* Version Comparison */}
            {(adjustment.previous_value || adjustment.new_value) && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Changes</p>
                <GoalVersionComparisonInline
                  previousValues={adjustment.previous_value as Record<string, unknown> | null}
                  newValues={adjustment.new_value as Record<string, unknown> | null}
                />
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {adjustment.is_material_change && (
                <span className="flex items-center gap-1">
                  <FileEdit className="h-3 w-3" />
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
          </div>
        </CollapsibleContent>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 border-t pt-4">
          <Button
            size="sm"
            onClick={onApprove}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-1 h-4 w-4" />
            Approve
          </Button>
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
        </div>
      </div>
    </Collapsible>
  );
}
