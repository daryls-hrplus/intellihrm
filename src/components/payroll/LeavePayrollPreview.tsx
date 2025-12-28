import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLeavePayrollIntegration } from "@/hooks/useLeavePayrollIntegration";
import { CalendarDays, AlertTriangle, Check, Minus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LeavePayrollPreviewProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
}

export function LeavePayrollPreview({ 
  companyId, 
  employeeId, 
  payPeriodId 
}: LeavePayrollPreviewProps) {
  const { t } = useTranslation();
  const { getLeavePayrollSummary } = useLeavePayrollIntegration();
  const [loading, setLoading] = useState(true);
  const [leaveSummary, setLeaveSummary] = useState<{
    hasLeave: boolean;
    unpaidDays: number;
    unpaidDeduction: number;
    paidLeaveDays: number;
    leaveDetails: Array<{
      type: string;
      days: number;
      payment: number;
      isPaid: boolean;
    }>;
  } | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      if (!companyId || !employeeId || !payPeriodId) return;
      
      setLoading(true);
      const summary = await getLeavePayrollSummary(companyId, employeeId, payPeriodId);
      setLeaveSummary(summary);
      setLoading(false);
    };

    loadSummary();
  }, [companyId, employeeId, payPeriodId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Leave Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading leave data...</div>
        </CardContent>
      </Card>
    );
  }

  if (!leaveSummary || !leaveSummary.hasLeave) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Leave Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span>No approved leave during this pay period</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Leave Impact on Payroll
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="text-xs text-muted-foreground">Paid Leave Days</div>
            <div className="text-lg font-semibold text-green-600">
              {leaveSummary.paidLeaveDays.toFixed(1)} days
            </div>
          </div>
          
          {leaveSummary.unpaidDays > 0 && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="text-xs text-muted-foreground">Unpaid Leave Deduction</div>
              <div className="text-lg font-semibold text-destructive">
                {formatCurrency(leaveSummary.unpaidDeduction)}
              </div>
              <div className="text-xs text-muted-foreground">
                ({leaveSummary.unpaidDays.toFixed(1)} days)
              </div>
            </div>
          )}
        </div>

        {/* Leave Details Table */}
        {leaveSummary.leaveDetails.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leave Type</TableHead>
                  <TableHead className="text-center">Days</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveSummary.leaveDetails.map((detail, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{detail.type}</TableCell>
                    <TableCell className="text-center">{detail.days}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={detail.isPaid ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {detail.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {detail.isPaid ? (
                        formatCurrency(detail.payment)
                      ) : (
                        <span className="text-destructive flex items-center justify-end gap-1">
                          <Minus className="h-3 w-3" />
                          {formatCurrency(detail.payment)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Warning for unpaid leave */}
        {leaveSummary.unpaidDays > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This employee has {leaveSummary.unpaidDays.toFixed(1)} unpaid leave days. 
              A deduction of {formatCurrency(leaveSummary.unpaidDeduction)} will be applied to their payroll.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}