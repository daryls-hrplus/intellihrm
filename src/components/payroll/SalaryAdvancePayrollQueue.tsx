import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSalaryAdvancePayroll, PayrollQueueItem } from "@/hooks/useSalaryAdvancePayroll";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Check, X, RefreshCw, CheckCircle2, XCircle, Clock, DollarSign, Users, AlertCircle } from "lucide-react";

interface SalaryAdvancePayrollQueueProps {
  companyId: string | null;
  payPeriodId?: string | null;
  payPeriodStartDate?: string;
  payPeriodEndDate?: string;
  onProcessComplete?: (approvedItems: PayrollQueueItem[]) => void;
}

export function SalaryAdvancePayrollQueue({
  companyId,
  payPeriodId,
  payPeriodStartDate,
  payPeriodEndDate,
  onProcessComplete,
}: SalaryAdvancePayrollQueueProps) {
  const { t } = useTranslation();
  const {
    queueItems,
    isLoading,
    queueRepaymentsByDueDate,
    approveQueueItem,
    excludeQueueItem,
    approveAllPending,
    getStats,
    refresh,
  } = useSalaryAdvancePayroll(companyId, payPeriodId);

  const [excludeReason, setExcludeReason] = useState("");
  const [selectedItem, setSelectedItem] = useState<PayrollQueueItem | null>(null);
  const [showExcludeDialog, setShowExcludeDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const stats = getStats();

  const handleQueueRepayments = async () => {
    if (payPeriodId && payPeriodStartDate && payPeriodEndDate) {
      await queueRepaymentsByDueDate(payPeriodStartDate, payPeriodEndDate, payPeriodId);
    }
  };

  const handleApprove = async () => {
    if (selectedItem) {
      await approveQueueItem(selectedItem.id, approvedAmount || undefined);
      setShowApproveDialog(false);
      setSelectedItem(null);
    }
  };

  const handleExclude = async () => {
    if (selectedItem && excludeReason) {
      await excludeQueueItem(selectedItem.id, excludeReason);
      setShowExcludeDialog(false);
      setSelectedItem(null);
      setExcludeReason("");
    }
  };

  const handleBulkApprove = async () => {
    await approveAllPending();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(queueItems.filter(q => q.status === 'pending').map(q => q.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'excluded':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Excluded</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600"><Check className="h-3 w-3 mr-1" />Processed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const pendingItems = queueItems.filter(q => q.status === 'pending');
  const approvedItems = queueItems.filter(q => q.status === 'approved');

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-xl font-semibold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-xl font-semibold">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Deductions</p>
              <p className="text-xl font-semibold">{formatCurrency(stats.totalApprovedAmount)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Excluded</p>
              <p className="text-xl font-semibold">{stats.excluded}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Salary Advance Repayments Queue
            </CardTitle>
            <CardDescription>
              Review and approve salary advance repayments for payroll deduction
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {payPeriodId && payPeriodStartDate && payPeriodEndDate && (
              <Button variant="outline" size="sm" onClick={handleQueueRepayments}>
                Queue Due Repayments
              </Button>
            )}
            {pendingItems.length > 0 && (
              <Button size="sm" onClick={handleBulkApprove}>
                <Check className="h-4 w-4 mr-1" />
                Approve All ({pendingItems.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : queueItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No salary advance repayments in queue</p>
              {payPeriodId && (
                <Button variant="link" onClick={handleQueueRepayments}>
                  Click to queue repayments due for this period
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={pendingItems.length > 0 && selectedIds.size === pendingItems.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Advance #</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.status === 'pending' && (
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.employee?.full_name || 'Unknown'}
                    </TableCell>
                    <TableCell>{item.advance?.advance_number || '-'}</TableCell>
                    <TableCell>{item.repayment?.period_number || '-'}</TableCell>
                    <TableCell>{item.repayment?.due_date ? formatDateForDisplay(item.repayment.due_date) : '-'}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.approved_amount || item.scheduled_amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      {item.status === 'pending' && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => {
                              setSelectedItem(item);
                              setApprovedAmount(item.scheduled_amount);
                              setShowApproveDialog(true);
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setSelectedItem(item);
                              setShowExcludeDialog(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {item.status === 'excluded' && item.exclusion_reason && (
                        <span className="text-xs text-muted-foreground" title={item.exclusion_reason}>
                          {item.exclusion_reason.substring(0, 20)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Repayment for Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <p className="text-sm font-medium">{selectedItem?.employee?.full_name}</p>
            </div>
            <div>
              <Label>Scheduled Amount</Label>
              <p className="text-sm font-medium">{formatCurrency(selectedItem?.scheduled_amount || 0)}</p>
            </div>
            <div>
              <Label htmlFor="approvedAmount">Approved Amount</Label>
              <Input
                id="approvedAmount"
                type="number"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can adjust the amount if a partial deduction is needed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Cancel</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exclude Dialog */}
      <Dialog open={showExcludeDialog} onOpenChange={setShowExcludeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exclude from Payroll</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Employee</Label>
              <p className="text-sm font-medium">{selectedItem?.employee?.full_name}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <p className="text-sm font-medium">{formatCurrency(selectedItem?.scheduled_amount || 0)}</p>
            </div>
            <div>
              <Label htmlFor="excludeReason">Reason for Exclusion</Label>
              <Textarea
                id="excludeReason"
                value={excludeReason}
                onChange={(e) => setExcludeReason(e.target.value)}
                placeholder="Enter reason for excluding this repayment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExcludeDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleExclude} disabled={!excludeReason}>
              Exclude
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}