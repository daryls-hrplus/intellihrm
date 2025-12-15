import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePayroll, PayrollRun, PayPeriod, EmployeePayroll } from "@/hooks/usePayroll";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function PayrollProcessingPage() {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId, selectedPayGroupId, setSelectedPayGroupId } = usePayrollFilters();
  const {
    isLoading,
    fetchPayPeriods,
    fetchPayrollRuns,
    createPayrollRun,
    calculatePayroll,
    approvePayroll,
    processPayment,
    fetchEmployeePayroll,
    generatePayslips,
    generateBankFile,
    fetchBankFileConfig,
  } = usePayroll();

  const [periods, setPeriods] = useState<PayPeriod[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [employeePayroll, setEmployeePayroll] = useState<EmployeePayroll[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
    
    setPayrollRuns((runData || []) as PayrollRun[]);
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

  const handleCalculate = async (run: PayrollRun) => {
    if (!selectedCompanyId) return;
    const success = await calculatePayroll(run.id, selectedCompanyId, run.pay_period_id);
    if (success) loadData();
  };

  const handleApprove = async (run: PayrollRun) => {
    const success = await approvePayroll(run.id);
    if (success) loadData();
  };

  const handleProcessPayment = async (run: PayrollRun) => {
    const success = await processPayment(run.id);
    if (success) loadData();
  };

  const handleGeneratePayslips = async (run: PayrollRun) => {
    const success = await generatePayslips(run.id);
    if (success) loadData();
  };

  const handleGenerateBankFile = async (run: PayrollRun) => {
    if (!selectedCompanyId) return;
    
    const bankConfigs = await fetchBankFileConfig(selectedCompanyId);
    const primaryConfig = bankConfigs.find(c => c.is_primary) || bankConfigs[0];
    
    if (!primaryConfig) {
      alert("Please configure a bank file first");
      return;
    }
    
    const content = await generateBankFile(run.id, primaryConfig.id, selectedCompanyId);
    if (content) {
      // Download the file
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${run.run_number}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const viewRunDetails = async (run: PayrollRun) => {
    setSelectedRun(run);
    const empPayroll = await fetchEmployeePayroll(run.id);
    setEmployeePayroll(empPayroll);
    setDetailDialogOpen(true);
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
              Please select a company and pay group to view payroll processing
            </CardContent>
          </Card>
        )}

        {showContent && (
          <>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.processing.totalRuns")}</p>
                <p className="text-xl font-semibold">{payrollRuns.length}</p>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.payPeriods.paid")}</p>
                <p className="text-xl font-semibold">
                  {payrollRuns.filter(r => r.status === 'paid').length}
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
                <p className="text-sm text-muted-foreground">{t("payroll.processing.avgEmployees")}</p>
                <p className="text-xl font-semibold">
                  {payrollRuns.length ? Math.round(payrollRuns.reduce((sum, r) => sum + r.employee_count, 0) / payrollRuns.length) : 0}
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
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.run_number}</TableCell>
                    <TableCell className="capitalize">{run.run_type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      {run.pay_period && (
                        <span className="text-sm">
                          {format(parseISO(run.pay_period.period_start), "MMM d")} - {format(parseISO(run.pay_period.period_end), "MMM d, yyyy")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{run.employee_count}</TableCell>
                    <TableCell>{formatCurrency(run.total_gross_pay, run.currency)}</TableCell>
                    <TableCell>{formatCurrency(run.total_net_pay, run.currency)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(run.status)}>
                        {run.status.replace('_', ' ').charAt(0).toUpperCase() + run.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewRunDetails(run)} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {run.status === 'draft' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCalculate(run)} title="Calculate">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {run.status === 'calculated' && (
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(run)} title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {run.status === 'approved' && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleGeneratePayslips(run)} title="Generate Payslips">
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleGenerateBankFile(run)} title="Generate Bank File">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleProcessPayment(run)} title="Process Payment">
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {payrollRuns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
              <DialogTitle>Create Payroll Run</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pay Period</Label>
                <Select
                  value={createForm.pay_period_id}
                  onValueChange={(value) => setCreateForm({ ...createForm, pay_period_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a pay period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.filter(p => p.status === 'open').map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.period_number} ({format(parseISO(period.period_start), "MMM d")} - {format(parseISO(period.period_end), "MMM d")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Run Type</Label>
                <Select
                  value={createForm.run_type}
                  onValueChange={(value) => setCreateForm({ ...createForm, run_type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="supplemental">Supplemental</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="correction">Correction</SelectItem>
                    <SelectItem value="off_cycle">Off-Cycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateRun} disabled={isLoading || !createForm.pay_period_id}>
                Create Run
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Run Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payroll Run Details - {selectedRun?.run_number}</DialogTitle>
            </DialogHeader>
            {selectedRun && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Gross Pay</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedRun.total_gross_pay)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Deductions</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedRun.total_deductions)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Taxes</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedRun.total_taxes)}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">Net Pay</p>
                    <p className="text-lg font-semibold">{formatCurrency(selectedRun.total_net_pay)}</p>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Taxes</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePayroll.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{emp.employee?.full_name}</p>
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
                    {employeePayroll.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No employee payroll records. Calculate payroll first.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
