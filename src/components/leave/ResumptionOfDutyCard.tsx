import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, User } from "lucide-react";
import { ResumptionOfDuty } from "@/hooks/useResumptionOfDuty";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ResumptionOfDutyCardProps {
  rod: ResumptionOfDuty;
  showEmployee?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

const statusConfig: Record<ResumptionOfDuty['status'], { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending_employee: { label: 'Awaiting Submission', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  pending_manager: { label: 'Pending Verification', variant: 'default', icon: <Clock className="h-3 w-3" /> },
  verified: { label: 'Verified', variant: 'outline', icon: <CheckCircle2 className="h-3 w-3 text-green-600" /> },
  rejected: { label: 'Returned', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  overdue: { label: 'Overdue', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
  no_show: { label: 'No Show', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> }
};

export function ResumptionOfDutyCard({ rod, showEmployee = false, onAction, actionLabel }: ResumptionOfDutyCardProps) {
  const status = statusConfig[rod.status];
  const leaveType = rod.leave_requests?.leave_types?.name || "Leave";

  return (
    <Card className={rod.status === 'overdue' || rod.status === 'no_show' ? 'border-destructive' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showEmployee && rod.profiles && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={rod.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {rod.profiles.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              {showEmployee && rod.profiles && (
                <p className="font-medium">{rod.profiles.full_name}</p>
              )}
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {leaveType} Resumption
              </CardTitle>
            </div>
          </div>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Leave Period</p>
            <p className="font-medium">
              {formatDateForDisplay(rod.leave_requests?.start_date)} - {formatDateForDisplay(rod.leave_requests?.end_date)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Return</p>
            <p className="font-medium">{formatDateForDisplay(rod.leave_end_date)}</p>
          </div>
          {rod.actual_resumption_date && (
            <div>
              <p className="text-muted-foreground">Actual Return</p>
              <p className="font-medium">{formatDateForDisplay(rod.actual_resumption_date)}</p>
            </div>
          )}
          {rod.requires_medical_clearance && (
            <div>
              <p className="text-muted-foreground">Medical Clearance</p>
              <p className="font-medium">
                {rod.medical_clearance_file_path ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Uploaded
                  </span>
                ) : (
                  <span className="text-amber-600">Required</span>
                )}
              </p>
            </div>
          )}
        </div>

        {rod.employee_notes && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <p className="text-muted-foreground mb-1">Employee Notes</p>
            <p>{rod.employee_notes}</p>
          </div>
        )}

        {rod.rejection_reason && (
          <div className="p-3 bg-destructive/10 rounded-lg text-sm border border-destructive/20">
            <p className="text-destructive font-medium mb-1">Rejection Reason</p>
            <p>{rod.rejection_reason}</p>
          </div>
        )}

        {rod.verification_notes && rod.status === 'verified' && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-sm border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-300 font-medium mb-1">Verification Notes</p>
            <p>{rod.verification_notes}</p>
          </div>
        )}

        {onAction && actionLabel && (
          <Button onClick={onAction} className="w-full mt-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
