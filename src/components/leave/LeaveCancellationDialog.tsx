import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock, XCircle } from "lucide-react";
import { useLeaveCancellation } from "@/hooks/useLeaveEnhancements";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LeaveCancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveRequest: {
    id: string;
    request_number: string;
    start_date: string;
    end_date: string;
    duration: number;
    leave_type?: { name: string; code: string };
  } | null;
}

export function LeaveCancellationDialog({ open, onOpenChange, leaveRequest }: LeaveCancellationDialogProps) {
  const [reason, setReason] = useState("");
  const { createCancellation } = useLeaveCancellation();

  const handleSubmit = async () => {
    if (!leaveRequest || !reason.trim()) return;
    
    await createCancellation.mutateAsync({
      leave_request_id: leaveRequest.id,
      reason: reason.trim(),
    });
    
    setReason("");
    onOpenChange(false);
  };

  if (!leaveRequest) return null;

  const isUpcoming = new Date(leaveRequest.start_date) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            Request Leave Cancellation
          </DialogTitle>
          <DialogDescription>
            Submit a request to cancel this approved leave. Your manager will need to approve the cancellation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Leave Details */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Request #</span>
              <Badge variant="outline">{leaveRequest.request_number}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Leave Type</span>
              <span className="text-sm">{leaveRequest.leave_type?.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Dates
              </span>
              <span className="text-sm">
                {formatDateForDisplay(leaveRequest.start_date)} - {formatDateForDisplay(leaveRequest.end_date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </span>
              <span className="text-sm">{leaveRequest.duration} day(s)</span>
            </div>
          </div>

          {!isUpcoming && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This leave has already started or passed. Cancellation may affect your leave balance and records.
              </AlertDescription>
            </Alert>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Cancellation *</Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you need to cancel this leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!reason.trim() || createCancellation.isPending}
          >
            {createCancellation.isPending ? "Submitting..." : "Submit Cancellation Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
