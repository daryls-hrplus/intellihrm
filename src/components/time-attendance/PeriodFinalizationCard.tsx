import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  CalendarCheck, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  FileCheck,
  Send,
  Eye,
  DollarSign,
  Calendar
} from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from "date-fns";

interface FinalizationSummary {
  totalEmployees: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  absencesExcused: number;
  absencesUnexcused: number;
  leaveTransactions: {
    employeeId: string;
    employeeName: string;
    leaveTypeName: string;
    days: number;
    paymentPercentage: number;
    grossAmount: number;
    netAmount: number;
    transactionType: string;
  }[];
  validationErrors: string[];
  employees: {
    id: string;
    name: string;
    regularHours: number;
    overtimeHours: number;
    hasAbsences: boolean;
  }[];
}

interface PeriodFinalizationCardProps {
  companyId: string | null;
  assignedEmployees: { id: string; full_name: string }[];
  onFinalized?: () => void;
}

type PeriodType = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

export function PeriodFinalizationCard({ companyId, assignedEmployees, onFinalized }: PeriodFinalizationCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('last_week');
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [preview, setPreview] = useState<FinalizationSummary | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [finalizationStatus, setFinalizationStatus] = useState<'draft' | 'finalized' | null>(null);

  const getPeriodDates = (): { start: string; end: string; label: string } => {
    const now = new Date();
    let start: Date, end: Date, label: string;

    switch (selectedPeriod) {
      case 'this_week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        label = 'This Week';
        break;
      case 'last_week':
        start = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        end = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        label = 'Last Week';
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        label = 'This Month';
        break;
      case 'last_month':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        label = 'Last Month';
        break;
      default:
        start = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        end = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        label = 'Last Week';
    }

    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
      label: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    };
  };

  const period = getPeriodDates();

  const handlePreview = async () => {
    if (!companyId || !user) return;
    setIsLoading(true);
    setPreview(null);

    try {
      const { data, error } = await supabase.functions.invoke('finalize-time-records', {
        body: {
          companyId,
          periodStart: period.start,
          periodEnd: period.end,
          employeeIds: assignedEmployees.map(e => e.id),
          timekeeperId: user.id,
          previewOnly: true
        }
      });

      if (error) throw error;

      if (data.success) {
        setPreview(data.summary);
        
        // Check existing finalization status
        const { data: existing } = await supabase
          .from('timekeeper_period_finalizations')
          .select('status')
          .eq('company_id', companyId)
          .eq('period_start', period.start)
          .eq('period_end', period.end)
          .maybeSingle();

        setFinalizationStatus(existing?.status as 'draft' | 'finalized' | null);
      } else {
        toast({
          title: "Preview Failed",
          description: data.error || "Failed to generate preview",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!companyId || !user) return;
    setIsFinalizing(true);

    try {
      const { data, error } = await supabase.functions.invoke('finalize-time-records', {
        body: {
          companyId,
          periodStart: period.start,
          periodEnd: period.end,
          employeeIds: assignedEmployees.map(e => e.id),
          timekeeperId: user.id,
          previewOnly: false
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Period Finalized",
          description: data.message || "Time records have been finalized and sent to payroll"
        });
        setShowConfirmDialog(false);
        setFinalizationStatus('finalized');
        onFinalized?.();
      } else {
        toast({
          title: "Finalization Failed",
          description: data.error || "Failed to finalize period",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Finalization error:", error);
      toast({
        title: "Error",
        description: "Failed to finalize period",
        variant: "destructive"
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle>Finalize Period</CardTitle>
            </div>
            {finalizationStatus === 'finalized' && (
              <Badge className="bg-green-500/20 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Finalized
              </Badge>
            )}
          </div>
          <CardDescription>
            Review and finalize time records for the pay period. This will sync leave transactions to payroll.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedPeriod} onValueChange={(v) => { setSelectedPeriod(v as PeriodType); setPreview(null); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {period.label}
            </div>
            <Button onClick={handlePreview} disabled={isLoading || assignedEmployees.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>

          {preview && (
            <div className="space-y-4 pt-4 border-t">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Employees
                  </div>
                  <div className="text-xl font-semibold">{preview.totalEmployees}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Regular Hours
                  </div>
                  <div className="text-xl font-semibold">{preview.totalRegularHours.toFixed(1)}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Overtime
                  </div>
                  <div className="text-xl font-semibold">{preview.totalOvertimeHours.toFixed(1)}</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Excused
                  </div>
                  <div className="text-xl font-semibold text-green-700">{preview.absencesExcused}</div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10">
                  <div className="flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    Unexcused
                  </div>
                  <div className="text-xl font-semibold text-red-700">{preview.absencesUnexcused}</div>
                </div>
              </div>

              {/* Validation Errors */}
              {preview.validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Validation Issues ({preview.validationErrors.length})</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {preview.validationErrors.slice(0, 5).map((err, i) => (
                        <li key={i} className="text-sm">{err}</li>
                      ))}
                      {preview.validationErrors.length > 5 && (
                        <li className="text-sm">...and {preview.validationErrors.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Leave Transactions Preview */}
              {preview.leaveTransactions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    Leave Transactions to Create ({preview.leaveTransactions.length})
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Leave Type</TableHead>
                          <TableHead className="text-right">Days</TableHead>
                          <TableHead className="text-right">Rate</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.leaveTransactions.map((tx, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{tx.employeeName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{tx.leaveTypeName}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{tx.days}</TableCell>
                            <TableCell className="text-right">{tx.paymentPercentage}%</TableCell>
                            <TableCell className="text-right font-medium">
                              ${tx.netAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Employee Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Employee Hours Summary
                </div>
                <div className="rounded-lg border overflow-hidden max-h-[200px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Regular</TableHead>
                        <TableHead className="text-right">Overtime</TableHead>
                        <TableHead className="text-center">Absences</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.employees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell className="text-right">{emp.regularHours.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{emp.overtimeHours.toFixed(1)}</TableCell>
                          <TableCell className="text-center">
                            {emp.hasAbsences ? (
                              <Badge variant="outline" className="text-orange-600">Yes</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-end gap-2">
                {finalizationStatus === 'finalized' ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    This period has already been finalized
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={preview.validationErrors.length > 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Finalize & Send to Payroll
                  </Button>
                )}
              </div>
            </div>
          )}

          {!preview && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Select a period and click Preview to see the finalization summary</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Finalization</DialogTitle>
            <DialogDescription>
              You are about to finalize time records for {period.label}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Employees:</span>
                <p className="font-medium">{preview?.totalEmployees || 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Hours:</span>
                <p className="font-medium">{((preview?.totalRegularHours || 0) + (preview?.totalOvertimeHours || 0)).toFixed(1)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Leave Transactions:</span>
                <p className="font-medium">{preview?.leaveTransactions.length || 0}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Absences:</span>
                <p className="font-medium">{(preview?.absencesExcused || 0) + (preview?.absencesUnexcused || 0)}</p>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will create leave payroll transactions and mark the period as finalized. This cannot be undone.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleFinalize} disabled={isFinalizing}>
              {isFinalizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm & Finalize
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}