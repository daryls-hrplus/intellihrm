import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, FileText, Download, Calendar, User, AlertCircle } from "lucide-react";
import { ResumptionOfDuty, useRODMutations } from "@/hooks/useResumptionOfDuty";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";

interface ManagerRODVerificationProps {
  rod: ResumptionOfDuty;
  onClose?: () => void;
}

export function ManagerRODVerification({ rod, onClose }: ManagerRODVerificationProps) {
  const { verifyRod, rejectRod } = useRODMutations();
  const [verificationNotes, setVerificationNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleVerify = async () => {
    await verifyRod.mutateAsync({
      rodId: rod.id,
      verificationNotes: verificationNotes || undefined
    });
    onClose?.();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    
    await rejectRod.mutateAsync({
      rodId: rod.id,
      rejectionReason
    });
    setShowRejectDialog(false);
    onClose?.();
  };

  const handleDownloadClearance = async () => {
    if (!rod.medical_clearance_file_path) return;
    
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .download(rod.medical_clearance_file_path);
    
    if (error || !data) {
      console.error('Download error:', error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = rod.medical_clearance_file_path.split('/').pop() || 'medical-clearance';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const leaveType = rod.leave_requests?.leave_types?.name || "Leave";

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rod.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {rod.profiles?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{rod.profiles?.full_name}</CardTitle>
                <CardDescription>{leaveType} • {rod.leave_requests?.request_number}</CardDescription>
              </div>
            </div>
            <Badge>Pending Verification</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Leave Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Leave Period</p>
              <p className="font-medium">
                {formatDateForDisplay(rod.leave_requests?.start_date)} - {formatDateForDisplay(rod.leave_requests?.end_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{rod.leave_requests?.duration} day(s)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Return</p>
              <p className="font-medium">{formatDateForDisplay(rod.leave_end_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actual Return</p>
              <p className="font-medium">{formatDateForDisplay(rod.actual_resumption_date)}</p>
            </div>
          </div>

          {/* Fit to Work */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            {rod.fit_to_work ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Employee declares they are fit to work</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <span className="text-amber-700">Employee indicates they may not be fully fit</span>
              </>
            )}
          </div>

          {/* Medical Clearance */}
          {rod.requires_medical_clearance && (
            <div className="p-4 border rounded-lg space-y-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-700 dark:text-amber-300" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">Medical Clearance</span>
                </div>
                {rod.medical_clearance_file_path ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadClearance}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                ) : (
                  <Badge variant="destructive">Not Uploaded</Badge>
                )}
              </div>
              {rod.medical_clearance_notes && (
                <p className="text-sm text-amber-800 dark:text-amber-200">{rod.medical_clearance_notes}</p>
              )}
            </div>
          )}

          {/* Employee Notes */}
          {rod.employee_notes && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Employee Notes</p>
              <p>{rod.employee_notes}</p>
            </div>
          )}

          {/* Verification Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Notes (Optional)</label>
            <Textarea
              placeholder="Add any notes about this verification..."
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleVerify}
              disabled={verifyRod.isPending}
              className="flex-1 gap-2"
            >
              {verifyRod.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Verify Resumption
            </Button>
            <Button 
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
              disabled={rejectRod.isPending}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Return
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return to Employee</DialogTitle>
            <DialogDescription>
              Please provide a reason for returning this resumption form to the employee.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for returning (e.g., missing medical clearance, incomplete information)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectionReason.trim() || rejectRod.isPending}
            >
              {rejectRod.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Return to Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
