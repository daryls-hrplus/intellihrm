import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle, 
  PauseCircle, 
  PlayCircle, 
  Edit, 
  XCircle,
  History,
  DollarSign,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { OverpaymentRecord, OverpaymentStatusHistory, OverpaymentPayment, useOverpaymentRecovery } from "@/hooks/useOverpaymentRecovery";
import { SuspendRecoveryDialog } from "./SuspendRecoveryDialog";
import { ModifyAmountDialog } from "./ModifyAmountDialog";
import { WriteOffDialog } from "./WriteOffDialog";

interface OverpaymentDetailSheetProps {
  record: OverpaymentRecord | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<boolean>;
  onSuspend: (id: string, reason: string, resumeDate?: string, notes?: string) => Promise<boolean>;
  onResume: (id: string, notes?: string) => Promise<boolean>;
  onModifyAmount: (id: string, newAmount: number, reason: string) => Promise<boolean>;
  onWriteOff: (id: string, reason: string) => Promise<boolean>;
}

const statusConfig = {
  pending_approval: { label: "Pending Approval", variant: "outline" as const, color: "text-muted-foreground" },
  active: { label: "Active", variant: "default" as const, color: "text-primary" },
  suspended: { label: "Suspended", variant: "secondary" as const, color: "text-warning" },
  completed: { label: "Completed", variant: "default" as const, color: "text-green-600" },
  written_off: { label: "Written Off", variant: "destructive" as const, color: "text-destructive" },
  cancelled: { label: "Cancelled", variant: "secondary" as const, color: "text-muted-foreground" },
};

export function OverpaymentDetailSheet({
  record,
  onClose,
  onApprove,
  onSuspend,
  onResume,
  onModifyAmount,
  onWriteOff,
}: OverpaymentDetailSheetProps) {
  const { fetchStatusHistory, fetchPayments } = useOverpaymentRecovery(record?.company_id || null);
  const [history, setHistory] = useState<OverpaymentStatusHistory[]>([]);
  const [payments, setPayments] = useState<OverpaymentPayment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [writeOffDialogOpen, setWriteOffDialogOpen] = useState(false);

  useEffect(() => {
    if (record) {
      loadDetails();
    }
  }, [record?.id]);

  const loadDetails = async () => {
    if (!record) return;
    setIsLoadingHistory(true);
    const [historyData, paymentsData] = await Promise.all([
      fetchStatusHistory(record.id),
      fetchPayments(record.id),
    ]);
    setHistory(historyData);
    setPayments(paymentsData);
    setIsLoadingHistory(false);
  };

  const handleApprove = async () => {
    if (!record) return;
    setIsApproving(true);
    const success = await onApprove(record.id);
    setIsApproving(false);
    if (success) onClose();
  };

  const handleResume = async () => {
    if (!record) return;
    setIsResuming(true);
    const success = await onResume(record.id);
    setIsResuming(false);
    if (success) onClose();
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  if (!record) return null;

  const progressPercent = record.original_amount > 0 
    ? (record.total_recovered / record.original_amount) * 100 
    : 0;

  const canApprove = record.status === "pending_approval";
  const canSuspend = record.status === "active";
  const canResume = record.status === "suspended";
  const canModify = ["active", "suspended"].includes(record.status);
  const canWriteOff = ["active", "suspended", "pending_approval"].includes(record.status);

  return (
    <>
      <Sheet open={!!record} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Overpayment Recovery
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-100px)] pr-4">
            <div className="space-y-6 py-4">
              {/* Employee Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {record.employee?.full_name || "Unknown Employee"}
                      </p>
                    </div>
                    <Badge variant={statusConfig[record.status]?.variant} className="ml-auto">
                      {statusConfig[record.status]?.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery Progress */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Recovery Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={progressPercent} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span>Recovered: {formatCurrency(record.total_recovered, record.currency)}</span>
                      <span className="font-medium">{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Original Amount</p>
                        <p className="font-semibold">{formatCurrency(record.original_amount, record.currency)}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Remaining</p>
                        <p className="font-semibold text-destructive">
                          {formatCurrency(record.remaining_balance, record.currency)}
                        </p>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">Per Cycle Deduction</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(record.recovery_amount_per_cycle, record.currency)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Reason</p>
                      <p className="font-medium">{record.reason}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <Badge variant="outline" className="capitalize">{record.priority}</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Overpayment Date</p>
                      <p className="font-medium">{format(new Date(record.overpayment_date), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Discovery Date</p>
                      <p className="font-medium">{format(new Date(record.discovery_date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  {record.reason_details && (
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Details</p>
                      <p className="text-sm mt-1">{record.reason_details}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm mt-1">{record.notes}</p>
                    </div>
                  )}
                  {record.scheduled_resume_date && record.status === "suspended" && (
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Scheduled to resume: {format(new Date(record.scheduled_resume_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingHistory ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  ) : history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No history available</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                          <div className="flex-1">
                            <p className="font-medium capitalize">
                              {item.new_status.replace(/_/g, " ")}
                            </p>
                            {item.reason && (
                              <p className="text-muted-foreground">{item.reason}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                              {item.changed_by_profile && (
                                <> by {item.changed_by_profile.full_name}</>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment History */}
              {payments.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {payment.pay_period?.period_start 
                                ? format(new Date(payment.pay_period.period_start), "MMM d, yyyy")
                                : format(new Date(payment.payment_date), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {payment.payment_method.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Separator />
              <div className="flex flex-wrap gap-2">
                {canApprove && (
                  <Button onClick={handleApprove} disabled={isApproving} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {isApproving ? "Approving..." : "Approve"}
                  </Button>
                )}
                {canSuspend && (
                  <Button variant="outline" onClick={() => setSuspendDialogOpen(true)} className="gap-2">
                    <PauseCircle className="h-4 w-4" />
                    Suspend
                  </Button>
                )}
                {canResume && (
                  <Button onClick={handleResume} disabled={isResuming} className="gap-2">
                    <PlayCircle className="h-4 w-4" />
                    {isResuming ? "Resuming..." : "Resume"}
                  </Button>
                )}
                {canModify && (
                  <Button variant="outline" onClick={() => setModifyDialogOpen(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Modify Amount
                  </Button>
                )}
                {canWriteOff && (
                  <Button variant="destructive" onClick={() => setWriteOffDialogOpen(true)} className="gap-2">
                    <XCircle className="h-4 w-4" />
                    Write Off
                  </Button>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <SuspendRecoveryDialog
        open={suspendDialogOpen}
        onOpenChange={setSuspendDialogOpen}
        onConfirm={async (reason, resumeDate, notes) => {
          const success = await onSuspend(record.id, reason, resumeDate, notes);
          if (success) {
            setSuspendDialogOpen(false);
            onClose();
          }
        }}
      />

      <ModifyAmountDialog
        open={modifyDialogOpen}
        onOpenChange={setModifyDialogOpen}
        currentAmount={record.recovery_amount_per_cycle}
        currency={record.currency}
        onConfirm={async (newAmount, reason) => {
          const success = await onModifyAmount(record.id, newAmount, reason);
          if (success) {
            setModifyDialogOpen(false);
            onClose();
          }
        }}
      />

      <WriteOffDialog
        open={writeOffDialogOpen}
        onOpenChange={setWriteOffDialogOpen}
        remainingBalance={record.remaining_balance}
        currency={record.currency}
        onConfirm={async (reason) => {
          const success = await onWriteOff(record.id, reason);
          if (success) {
            setWriteOffDialogOpen(false);
            onClose();
          }
        }}
      />
    </>
  );
}
