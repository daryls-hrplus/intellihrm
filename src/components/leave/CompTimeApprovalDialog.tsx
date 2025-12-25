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
import { Badge } from "@/components/ui/badge";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useCompensatoryTime, CompTimeEarned, CompTimeUsed } from "@/hooks/useCompensatoryTime";
import { CheckCircle, XCircle, Clock, User, Calendar } from "lucide-react";

interface CompTimeApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CompTimeEarned | CompTimeUsed | null;
  type: 'earned' | 'used';
}

export function CompTimeApprovalDialog({ 
  open, 
  onOpenChange, 
  request, 
  type 
}: CompTimeApprovalDialogProps) {
  const { updateEarnedStatus, updateUsedStatus } = useCompensatoryTime();
  const [rejectionReason, setRejectionReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!request) return null;

  const isEarned = type === 'earned';
  const earnedRequest = isEarned ? request as CompTimeEarned : null;
  const usedRequest = !isEarned ? request as CompTimeUsed : null;

  const handleApprove = async () => {
    setAction('approve');
    if (isEarned) {
      await updateEarnedStatus.mutateAsync({ id: request.id, status: 'approved' });
    } else {
      await updateUsedStatus.mutateAsync({ id: request.id, status: 'approved' });
    }
    onOpenChange(false);
    setAction(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setAction('reject');
    if (isEarned) {
      await updateEarnedStatus.mutateAsync({ 
        id: request.id, 
        status: 'rejected',
        rejection_reason: rejectionReason 
      });
    } else {
      await updateUsedStatus.mutateAsync({ 
        id: request.id, 
        status: 'rejected',
        rejection_reason: rejectionReason 
      });
    }
    onOpenChange(false);
    setRejectionReason('');
    setAction(null);
  };

  const isPending = updateEarnedStatus.isPending || updateUsedStatus.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review {isEarned ? 'Earned' : 'Usage'} Request</DialogTitle>
          <DialogDescription>
            Approve or reject this compensatory time request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {request.employee?.full_name || 'Unknown Employee'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {isEarned 
                  ? `Work Date: ${formatDateForDisplay(earnedRequest!.work_date, 'PPP')}`
                  : `Use Date: ${formatDateForDisplay(usedRequest!.use_date, 'PPP')}`
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {isEarned 
                  ? `${earnedRequest!.hours_earned} hours earned`
                  : `${usedRequest!.hours_used} hours requested`
                }
              </span>
            </div>

            {isEarned && earnedRequest?.work_type && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {earnedRequest.work_type.replace('_', ' ')}
                </Badge>
              </div>
            )}

            {isEarned && earnedRequest?.reason && (
              <div>
                <p className="text-sm text-muted-foreground">Reason:</p>
                <p className="text-sm">{earnedRequest.reason}</p>
              </div>
            )}

            {!isEarned && usedRequest?.reason && (
              <div>
                <p className="text-sm text-muted-foreground">Reason:</p>
                <p className="text-sm">{usedRequest.reason}</p>
              </div>
            )}

            {isEarned && earnedRequest?.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes:</p>
                <p className="text-sm">{earnedRequest.notes}</p>
              </div>
            )}
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label>Rejection Reason (required for rejection)</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || isPending}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {action === 'reject' && isPending ? "Rejecting..." : "Reject"}
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isPending}
            className="bg-success hover:bg-success/90"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {action === 'approve' && isPending ? "Approving..." : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
