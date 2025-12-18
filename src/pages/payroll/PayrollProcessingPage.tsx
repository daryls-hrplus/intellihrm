import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayroll, PayrollRun, PayPeriod, EmployeePayroll } from "@/hooks/usePayroll";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Plus, 
  Play, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Download,
  Calculator,
  Users,
  Clock,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ExtendedPayrollRun extends PayrollRun {
  calculation_started_at?: string | null;
  is_locked?: boolean;
  locked_at?: string | null;
  recalculation_requested_by?: string | null;
  recalculation_approved_by?: string | null;
  recalculation_approved_at?: string | null;
}

export default function PayrollProcessingPage() {
  const { t } = useTranslation();
  const { hasRole } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId, selectedPayGroupId, setSelectedPayGroupId } = usePayrollFilters();
  const {
    isLoading,
    fetchPayPeriods,
    fetchPayrollRuns,
    createPayrollRun,
    calculatePayroll,
    recalculatePayroll,
    requestRecalculationApproval,
    approveRecalculation,
    reopenPayroll,
    approvePayroll,
    processPayment,
    fetchEmployeePayroll,
    generatePayslips,
    generateBankFile,
    fetchBankFileConfig,
  } = usePayroll();

  const [periods, setPeriods] = useState<PayPeriod[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<ExtendedPayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ExtendedPayrollRun | null>(null);
  const [employeePayroll, setEmployeePayroll] = useState<EmployeePayroll[]>([]);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [expandedEmployees, setExpandedEmployees] = useState<EmployeePayroll[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeePayroll | null>(null);
  const [employeeDetailOpen, setEmployeeDetailOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [recalcConfirmOpen, setRecalcConfirmOpen] = useState(false);
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false);
  const [runToRecalc, setRunToRecalc] = useState<ExtendedPayrollRun | null>(null);
  const [runToReopen, setRunToReopen] = useState<ExtendedPayrollRun | null>(null);

  const isAdmin = hasRole('admin');
  const isHRManager = hasRole('hr_manager');
  const canApproveSupervisor = isAdmin || isHRManager;

  const [createForm, setCreateForm] = useState({
    pay_period_id: "",
    run_type: "regular" as PayrollRun['run_type'],
    notes: "",
  });

  // Reset pay group when company changes
  useEffect(() => {
    setSelectedPayGroupId("all");
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedCompanyId && selectedPayGroupId && selectedPayGroupId !== "all") {
      loadData();
    } else {
      setPeriods([]);
      setPayrollRuns([]);
    }
  }, [selectedCompanyId, selectedPayGroupId]);

  const loadData = async () => {
    if (!selectedCompanyId || !selectedPayGroupId || selectedPayGroupId === "all") return;
    
    // Fetch pay periods for the selected pay group
    const { data: periodData } = await supabase
      .from('pay_periods')
      .select('*')
      .eq('pay_group_id', selectedPayGroupId)
      .order('period_start', { ascending: false });
    
    setPeriods((periodData || []) as PayPeriod[]);
    
    // Fetch payroll runs for the selected pay group
    const { data: runData } = await supabase
      .from('payroll_runs')
      .select(`
        *,
        pay_period:pay_periods(*)
      `)
      .eq('company_id', selectedCompanyId)
      .eq('pay_group_id', selectedPayGroupId)
      .order('created_at', { ascending: false });
    
    setPayrollRuns((runData || []) as ExtendedPayrollRun[]);
  };

  const handleCalculate = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId || !selectedPayGroupId) return;
    const success = await calculatePayroll(run.id, selectedCompanyId, run.pay_period_id, selectedPayGroupId);
    if (success) loadData();
  };

  const handleRecalculate = async (run: ExtendedPayrollRun) => {
    if (run.status === 'approved') {
      // For approved runs, need supervisor approval first
      if (canApproveSupervisor) {
        setRunToRecalc(run);
        setRecalcConfirmOpen(true);
      } else {
        // Request approval from supervisor
        const success = await requestRecalculationApproval(run.id);
        if (success) loadData();
      }
    } else if (run.status === 'calculated' || run.status === 'calculating' || run.status === 'failed') {
      // For calculated, stuck calculating, or failed runs, can recalculate directly
      setRunToRecalc(run);
      setRecalcConfirmOpen(true);
    }
  };

  const confirmRecalculate = async () => {
    if (!runToRecalc || !selectedCompanyId) return;
    
    // If supervisor approving for approved run
    if (runToRecalc.status === 'approved' && canApproveSupervisor) {
      await approveRecalculation(runToRecalc.id);
    }
    
    // Use the run's pay_group_id, not the filter selection
    const success = await recalculatePayroll(
      runToRecalc.id, 
      selectedCompanyId, 
      runToRecalc.pay_period_id, 
      runToRecalc.pay_group_id
    );
    if (success) {
      setRecalcConfirmOpen(false);
      setRunToRecalc(null);
      loadData();
    }
  };

  const handleReopen = async (run: ExtendedPayrollRun) => {
    setRunToReopen(run);
    setReopenConfirmOpen(true);
  };

  const confirmReopen = async () => {
    if (!runToReopen) return;
    const success = await reopenPayroll(runToReopen.id);
    if (success) {
      setReopenConfirmOpen(false);
      setRunToReopen(null);
      loadData();
    }
  };

  const handleCreateRun = async () => {
    if (!selectedCompanyId || !selectedPayGroupId || selectedPayGroupId === "all" || !createForm.pay_period_id) return;

    const result = await createPayrollRun({
      company_id: selectedCompanyId,
      pay_group_id: selectedPayGroupId,
      pay_period_id: createForm.pay_period_id,
      run_type: createForm.run_type,
      notes: createForm.notes,
      status: 'draft',
    });

    if (result) {
      setCreateDialogOpen(false);
      setCreateForm({ pay_period_id: "", run_type: "regular", notes: "" });
      loadData();
    }
  };

  const handleApprove = async (run: ExtendedPayrollRun) => {
    const success = await approvePayroll(run.id);
    if (success) loadData();
  };

  const handleProcessPayment = async (run: ExtendedPayrollRun) => {
    const success = await processPayment(run.id);
    if (success) loadData();
  };

  const handleGeneratePayslips = async (run: ExtendedPayrollRun) => {
    const success = await generatePayslips(run.id);
    if (success) loadData();
  };

  const handleGenerateBankFile = async (run: ExtendedPayrollRun) => {
    if (!selectedCompanyId) return;
    
    const bankConfigs = await fetchBankFileConfig(selectedCompanyId);
    const primaryConfig = bankConfigs.find(c => c.is_primary) || bankConfigs[0];
    
    if (!primaryConfig) {
      toast.error(t("payroll.processing.configureBankFirst"));
      return;
    }
    
    const content = await generateBankFile(run.id, primaryConfig.id, selectedCompanyId);
    if (content) {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${run.run_number}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const toggleRunExpand = async (run: ExtendedPayrollRun) => {
    if (expandedRunId === run.id) {
      setExpandedRunId(null);
      setExpandedEmployees([]);
    } else {
      setExpandedRunId(run.id);
      setSelectedRun(run);
      const empPayroll = await fetchEmployeePayroll(run.id);
      setExpandedEmployees(empPayroll);
    }
  };

  const viewEmployeeDetails = (emp: EmployeePayroll) => {
    setSelectedEmployee(emp);
    setEmployeeDetailOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      calculating: "bg-warning/10 text-warning",
      calculated: "bg-primary/10 text-primary",
      pending_approval: "bg-warning/10 text-warning",
      approved: "bg-success/10 text-success",
      processing: "bg-warning/10 text-warning",
      paid: "bg-success/10 text-success",
      failed: "bg-destructive/10 text-destructive",
      cancelled: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const showContent = selectedCompanyId && selectedPayGroupId && selectedPayGroupId !== "all";

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: t("payroll.processing.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.processing.title")}</h1>
              <p className="text-muted-foreground">{t("payroll.processing.subtitle")}</p>
            </div>
          </div>
          {showContent && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("payroll.processing.newPayrollRun")}
            </Button>
          )}
        </div>

        {/* Company and Pay Group Filters */}
        <Card>
          <CardContent className="pt-6">
            <PayrollFilters
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
              selectedPayGroupId={selectedPayGroupId}
              onPayGroupChange={setSelectedPayGroupId}
              showPayGroupFilter={true}
            />
          </CardContent>
        </Card>

        {!showContent && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t("payroll.processing.selectCompanyAndPayGroupPrompt")}
            </CardContent>
          </Card>
        )}

        {showContent && (
          <>
            {/* Lock Banner */}
            {payrollRuns.some(r => r.is_locked) && (
              <div className="flex items-center gap-3 rounded-lg border border-warning/50 bg-warning/10 p-4">
                <Lock className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-warning">{t("payroll.processing.payGroupLocked")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("payroll.processing.payGroupLockedDescription")}
                  </p>
                </div>
              </div>
            )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalGrossPay")}</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(payrollRuns.reduce((sum, r) => sum + (r.total_gross_pay || 0), 0))}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalNetPay")}</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(payrollRuns.reduce((sum, r) => sum + (r.total_net_pay || 0), 0))}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.pending")}</p>
                <p className="text-xl font-semibold">
                  {payrollRuns.filter(r => ['draft', 'calculated', 'pending_approval'].includes(r.status)).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalEmployees")}</p>
                <p className="text-xl font-semibold">
                  {payrollRuns.reduce((sum, r) => sum + r.employee_count, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Runs Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("payroll.processing.payrollRuns")}</CardTitle>
            <CardDescription>{t("payroll.processing.payrollRunsSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payroll.processing.runNumber")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("payroll.processing.payPeriod")}</TableHead>
                  <TableHead>{t("payroll.processing.employees")}</TableHead>
                  <TableHead>{t("payroll.processing.grossPay")}</TableHead>
                  <TableHead>{t("payroll.processing.netPay")}</TableHead>
                  <TableHead>{t("payroll.processing.started")}</TableHead>
                  <TableHead>{t("payroll.processing.completed")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <>
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-primary underline-offset-4 hover:underline flex items-center gap-2"
                          onClick={() => toggleRunExpand(run)}
                        >
                          {run.run_number}
                          {run.is_locked && (
                            <Lock className="h-3 w-3 text-warning" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="capitalize">{run.run_type.replace('_', ' ')}</TableCell>
                      <TableCell>
                        {run.pay_period && (
                          <span className="text-sm">
                            {formatDateForDisplay(run.pay_period.period_start, "MMM d")} - {formatDateForDisplay(run.pay_period.period_end, "MMM d, yyyy")}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{run.employee_count}</TableCell>
                      <TableCell>{formatCurrency(run.total_gross_pay, run.currency)}</TableCell>
                      <TableCell>{formatCurrency(run.total_net_pay, run.currency)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {run.calculation_started_at ? formatDateForDisplay(run.calculation_started_at, "MMM d HH:mm") : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {run.calculated_at ? formatDateForDisplay(run.calculated_at, "MMM d HH:mm") : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge className={getStatusColor(run.status)}>
                            {run.status.replace('_', ' ').charAt(0).toUpperCase() + run.status.slice(1).replace('_', ' ')}
                          </Badge>
                          {run.recalculation_requested_by && !run.recalculation_approved_by && (
                            <Badge variant="outline" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {t("payroll.processing.recalcPending")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toggleRunExpand(run)} title={t("payroll.processing.viewEmployees")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {run.status === 'draft' && (
                            <Button variant="ghost" size="sm" onClick={() => handleCalculate(run)} title={t("payroll.processing.calculate")} disabled={isLoading}>
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          {(run.status === 'calculating' || run.status === 'failed') && (
                            <Button variant="ghost" size="sm" onClick={() => handleRecalculate(run)} title={t("payroll.processing.retryCalculation")} disabled={isLoading}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {run.status === 'calculated' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleRecalculate(run)} title={t("payroll.processing.recalculate")} disabled={isLoading}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(run)} title={t("payroll.processing.approve")} disabled={isLoading}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {run.status === 'approved' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleRecalculate(run)} title={t("payroll.processing.requestRecalculation")} disabled={isLoading}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleGeneratePayslips(run)} title={t("payroll.processing.generatePayslips")} disabled={isLoading}>
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleGenerateBankFile(run)} title={t("payroll.processing.generateBankFile")} disabled={isLoading}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleProcessPayment(run)} title={t("payroll.processing.processPayment")} disabled={isLoading}>
                                <DollarSign className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleReopen(run)} title={t("payroll.processing.reopenForChanges")} disabled={isLoading}>
                                <Unlock className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {run.status === 'paid' && canApproveSupervisor && (
                            <Button variant="ghost" size="sm" onClick={() => handleReopen(run)} title={t("payroll.processing.reopenForChanges")} disabled={isLoading}>
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedRunId === run.id && (
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={10} className="p-0">
                          <div className="p-4 border-l-4 border-primary">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-sm">{t("payroll.processing.employeesInRun", { count: expandedEmployees.length })}</h4>
                              {selectedRun && (
                                <div className="flex gap-4 text-sm">
                                  <span>{t("payroll.processing.grossPay")}: <strong>{formatCurrency(selectedRun.total_gross_pay)}</strong></span>
                                  <span>{t("payroll.processing.netPay")}: <strong>{formatCurrency(selectedRun.total_net_pay)}</strong></span>
                                </div>
                              )}
                            </div>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>{t("payroll.processing.employee")}</TableHead>
                                  <TableHead>{t("payroll.processing.hours")}</TableHead>
                                  <TableHead>{t("payroll.processing.grossPay")}</TableHead>
                                  <TableHead>{t("payroll.processing.taxes")}</TableHead>
                                  <TableHead>{t("payroll.processing.deductions")}</TableHead>
                                  <TableHead>{t("payroll.processing.netPay")}</TableHead>
                                  <TableHead>{t("common.status")}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {expandedEmployees.map((emp) => (
                                  <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewEmployeeDetails(emp)}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium text-primary hover:underline">{emp.employee?.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{emp.employee?.email}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>{emp.regular_hours}</TableCell>
                                    <TableCell>{formatCurrency(emp.gross_pay)}</TableCell>
                                    <TableCell>{formatCurrency(emp.tax_deductions)}</TableCell>
                                    <TableCell>{formatCurrency(emp.total_deductions - emp.tax_deductions)}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(emp.net_pay)}</TableCell>
                                    <TableCell>
                                      <Badge className={getStatusColor(emp.status)}>
                                        {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {expandedEmployees.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                                      {t("payroll.processing.noEmployeeRecords")}
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
                {payrollRuns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {t("payroll.processing.noPayrollRuns")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </>
        )}

        {/* Create Run Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.createPayrollRun")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("payroll.processing.payPeriod")}</Label>
                <Select
                  value={createForm.pay_period_id}
                  onValueChange={(value) => setCreateForm({ ...createForm, pay_period_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("payroll.processing.selectPayPeriod")} />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.filter(p => p.status === 'open').map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.period_number} ({formatDateForDisplay(period.period_start, "MMM d")} - {formatDateForDisplay(period.period_end, "MMM d")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("payroll.processing.runType")}</Label>
                <Select
                  value={createForm.run_type}
                  onValueChange={(value) => setCreateForm({ ...createForm, run_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">{t("payroll.processing.regular")}</SelectItem>
                    <SelectItem value="supplemental">{t("payroll.processing.supplemental")}</SelectItem>
                    <SelectItem value="bonus">{t("payroll.processing.bonus")}</SelectItem>
                    <SelectItem value="correction">{t("payroll.processing.correction")}</SelectItem>
                    <SelectItem value="off_cycle">{t("payroll.processing.offCycle")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("payroll.processing.notes")}</Label>
                <Input
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder={t("payroll.processing.optionalNotes")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreateRun} disabled={isLoading || !createForm.pay_period_id}>
                {t("payroll.processing.createRun")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Employee Pay Details Dialog */}
        <Dialog open={employeeDetailOpen} onOpenChange={setEmployeeDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.employeePayDetails")}</DialogTitle>
              <DialogDescription>
                {t("payroll.processing.payBreakdownDescription", "Complete breakdown of earnings and deductions")}
              </DialogDescription>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                {/* Employee Header */}
                <div className="border-b pb-3">
                  <p className="font-semibold text-lg">{selectedEmployee.employee?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.employee?.email}</p>
                </div>

                {/* Hours Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("payroll.processing.hoursWorked", "Hours Worked")}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{t("payroll.processing.regularHours")}</p>
                      <p className="text-lg font-semibold">{selectedEmployee.regular_hours || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{t("payroll.processing.overtimeHours")}</p>
                      <p className="text-lg font-semibold">{selectedEmployee.overtime_hours || 0}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                      <p className="text-xs text-muted-foreground">{t("payroll.processing.otherHours", "Other Hours")}</p>
                      <p className="text-lg font-semibold">
                        {(selectedEmployee.holiday_hours || 0) + (selectedEmployee.sick_hours || 0) + (selectedEmployee.vacation_hours || 0) + (selectedEmployee.other_hours || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Earnings Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("payroll.processing.earnings", "Earnings")}
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    {/* Itemized earnings from calculation_details */}
                    {(selectedEmployee.calculation_details as any)?.earnings?.length > 0 ? (
                      <>
                        {((selectedEmployee.calculation_details as any)?.earnings || []).map((earning: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span className="text-muted-foreground">
                              {earning.name}
                              {earning.type === 'base_salary' && (
                                <span className="ml-1 text-xs text-primary">(Base)</span>
                              )}
                            </span>
                            <span className="font-medium">{formatCurrency(earning.amount || 0)}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* Fallback to summary fields if no itemized data */}
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.regularPay")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.regular_pay || 0)}</span>
                        </div>
                        {(selectedEmployee.overtime_pay || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.overtimePay")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.overtime_pay)}</span>
                          </div>
                        )}
                        {(selectedEmployee.bonus_pay || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.bonusPay")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.bonus_pay)}</span>
                          </div>
                        )}
                        {(selectedEmployee.commission_pay || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.commissionPay", "Commission")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.commission_pay)}</span>
                          </div>
                        )}
                        {(selectedEmployee.other_earnings || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.otherEarnings")}</span>
                            <span className="font-medium">{formatCurrency(selectedEmployee.other_earnings)}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Allowances */}
                    {((selectedEmployee.calculation_details as any)?.allowances || []).length > 0 && (
                      <>
                        <div className="border-t border-border mt-2 pt-2">
                          <p className="text-xs text-muted-foreground mb-1 uppercase">{t("payroll.processing.allowances", "Allowances")}</p>
                        </div>
                        {((selectedEmployee.calculation_details as any)?.allowances || []).map((allowance: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span className="text-muted-foreground">
                              {allowance.name}
                              {!allowance.is_taxable && (
                                <span className="ml-1 text-xs text-success">(Non-taxable)</span>
                              )}
                            </span>
                            <span className="font-medium">{formatCurrency(allowance.amount || 0)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    <div className="flex justify-between py-2 border-t border-border mt-2 pt-2">
                      <span className="font-semibold">{t("payroll.processing.grossPay")}</span>
                      <span className="font-bold text-primary">{formatCurrency(selectedEmployee.gross_pay)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {t("payroll.processing.deductions")}
                  </h4>
                  <div className="bg-destructive/5 rounded-lg p-4 space-y-2">
                    {/* Itemized statutory deductions from calculation_details */}
                    {((selectedEmployee.calculation_details as any)?.statutory_deductions || []).length > 0 ? (
                      <>
                        <p className="text-xs text-muted-foreground uppercase mb-1">{t("payroll.processing.statutoryTaxes", "Statutory Taxes")}</p>
                        {((selectedEmployee.calculation_details as any)?.statutory_deductions || []).map((deduction: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span className="text-muted-foreground">{deduction.name}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(deduction.employee_amount || 0)}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      (selectedEmployee.tax_deductions || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.statutoryTaxes", "Statutory Taxes")}</span>
                          <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.tax_deductions)}</span>
                        </div>
                      )
                    )}

                    {/* Period deductions from calculation_details */}
                    {((selectedEmployee.calculation_details as any)?.period_deductions || []).length > 0 && (
                      <>
                        <div className="border-t border-destructive/20 mt-2 pt-2">
                          <p className="text-xs text-muted-foreground uppercase mb-1">{t("payroll.processing.otherDeductions")}</p>
                        </div>
                        {((selectedEmployee.calculation_details as any)?.period_deductions || []).map((deduction: any, idx: number) => (
                          <div key={idx} className="flex justify-between py-1">
                            <span className="text-muted-foreground">
                              {deduction.name}
                              {deduction.is_pretax && (
                                <span className="ml-1 text-xs text-primary">(Pre-tax)</span>
                              )}
                            </span>
                            <span className="font-medium text-destructive">-{formatCurrency(deduction.amount || 0)}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Fallback to summary fields */}
                    {!((selectedEmployee.calculation_details as any)?.period_deductions || []).length && (
                      <>
                        {(selectedEmployee.benefit_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.benefitDeductions", "Benefits")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.benefit_deductions)}</span>
                          </div>
                        )}
                        {(selectedEmployee.retirement_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.retirementDeductions", "Retirement")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.retirement_deductions)}</span>
                          </div>
                        )}
                        {(selectedEmployee.garnishment_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.garnishments", "Garnishments")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.garnishment_deductions)}</span>
                          </div>
                        )}
                        {(selectedEmployee.other_deductions || 0) > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-muted-foreground">{t("payroll.processing.otherDeductions")}</span>
                            <span className="font-medium text-destructive">-{formatCurrency(selectedEmployee.other_deductions)}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between py-2 border-t border-destructive/20 mt-2 pt-2">
                      <span className="font-semibold">{t("payroll.processing.totalDeductions", "Total Deductions")}</span>
                      <span className="font-bold text-destructive">-{formatCurrency(selectedEmployee.total_deductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay */}
                <div className="bg-success/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">{t("payroll.processing.netPay")}</span>
                    <span className="font-bold text-2xl text-success">{formatCurrency(selectedEmployee.net_pay)}</span>
                  </div>
                </div>

                {/* Employer Contributions */}
                {((selectedEmployee.employer_taxes || 0) > 0 || (selectedEmployee.employer_benefits || 0) > 0) && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {t("payroll.processing.employerContributions", "Employer Contributions")}
                    </h4>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      {(selectedEmployee.employer_taxes || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.employerTaxes", "Employer Taxes")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.employer_taxes)}</span>
                        </div>
                      )}
                      {(selectedEmployee.employer_benefits || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.employerBenefits", "Employer Benefits")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.employer_benefits)}</span>
                        </div>
                      )}
                      {(selectedEmployee.employer_retirement || 0) > 0 && (
                        <div className="flex justify-between py-1">
                          <span className="text-muted-foreground">{t("payroll.processing.employerRetirement", "Employer Retirement")}</span>
                          <span className="font-medium">{formatCurrency(selectedEmployee.employer_retirement)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-t border-border mt-2 pt-2">
                        <span className="font-semibold">{t("payroll.processing.totalEmployerCost", "Total Employer Cost")}</span>
                        <span className="font-bold">{formatCurrency(selectedEmployee.total_employer_cost || (selectedEmployee.gross_pay + (selectedEmployee.employer_taxes || 0) + (selectedEmployee.employer_benefits || 0)))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">{t("common.status")}</span>
                  <Badge className={getStatusColor(selectedEmployee.status)}>
                    {selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                  </Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Recalculation Confirmation Dialog */}
        <Dialog open={recalcConfirmOpen} onOpenChange={setRecalcConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.confirmRecalculation")}</DialogTitle>
              <DialogDescription>
                {runToRecalc?.status === 'approved' 
                  ? t("payroll.processing.recalcApprovedWarning")
                  : t("payroll.processing.recalcWarning")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRecalcConfirmOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={confirmRecalculate} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("payroll.processing.recalculate")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reopen Confirmation Dialog */}
        <Dialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.processing.reopenPayrollRun")}</DialogTitle>
              <DialogDescription>
                {t("payroll.processing.reopenWarning")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReopenConfirmOpen(false)}>{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={confirmReopen} disabled={isLoading}>
                <Unlock className="h-4 w-4 mr-2" />
                {t("payroll.processing.reopenForChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
