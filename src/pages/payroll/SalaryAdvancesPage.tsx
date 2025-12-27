import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSalaryAdvances, SalaryAdvance } from "@/hooks/useSalaryAdvances";
import { SalaryAdvancePayrollQueue } from "@/components/payroll/SalaryAdvancePayrollQueue";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { 
  DollarSign, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Banknote,
  Calendar,
  User,
  FileText,
  TrendingUp,
  AlertCircle,
  Wallet
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

export default function SalaryAdvancesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const {
    advanceTypes,
    advances,
    isLoading,
    createAdvanceType,
    createAdvance,
    approveAdvance,
    rejectAdvance,
    disburseAdvance,
    getStats,
  } = useSalaryAdvances(selectedCompany || null);

  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [disburseDialogOpen, setDisburseDialogOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<SalaryAdvance | null>(null);

  const [typeForm, setTypeForm] = useState({
    name: "",
    code: "",
    description: "",
    max_amount: "",
    max_percentage_of_salary: "50",
    interest_rate: "0",
    max_repayment_periods: "12",
    requires_approval: true,
    max_per_year: "",
    eligible_after_months: "3",
  });

  const [requestForm, setRequestForm] = useState({
    employee_id: "",
    advance_type_id: "",
    requested_amount: "",
    reason: "",
    repayment_periods: "1",
  });

  const [approvalForm, setApprovalForm] = useState({
    approved_amount: "",
    repayment_periods: "1",
    repayment_start_date: getTodayString(),
  });

  const [rejectForm, setRejectForm] = useState({ reason: "" });
  const [disburseForm, setDisburseForm] = useState({ method: "bank_transfer", reference: "" });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadEmployees();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('company_id', selectedCompany)
      .eq('is_active', true)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleCreateType = async () => {
    await createAdvanceType({
      name: typeForm.name,
      code: typeForm.code,
      description: typeForm.description || null,
      max_amount: typeForm.max_amount ? parseFloat(typeForm.max_amount) : null,
      max_percentage_of_salary: parseFloat(typeForm.max_percentage_of_salary),
      interest_rate: parseFloat(typeForm.interest_rate) / 100,
      max_repayment_periods: parseInt(typeForm.max_repayment_periods),
      requires_approval: typeForm.requires_approval,
      max_per_year: typeForm.max_per_year ? parseInt(typeForm.max_per_year) : null,
      eligible_after_months: parseInt(typeForm.eligible_after_months),
    });
    setTypeDialogOpen(false);
    resetTypeForm();
  };

  const handleCreateRequest = async () => {
    await createAdvance({
      employee_id: requestForm.employee_id,
      advance_type_id: requestForm.advance_type_id || null,
      requested_amount: parseFloat(requestForm.requested_amount),
      reason: requestForm.reason || null,
      repayment_periods: parseInt(requestForm.repayment_periods),
    });
    setRequestDialogOpen(false);
    resetRequestForm();
  };

  const handleApprove = async () => {
    if (!selectedAdvance) return;
    await approveAdvance(
      selectedAdvance.id,
      parseFloat(approvalForm.approved_amount),
      parseInt(approvalForm.repayment_periods),
      approvalForm.repayment_start_date
    );
    setApprovalDialogOpen(false);
    setSelectedAdvance(null);
  };

  const handleReject = async () => {
    if (!selectedAdvance) return;
    await rejectAdvance(selectedAdvance.id, rejectForm.reason);
    setRejectDialogOpen(false);
    setSelectedAdvance(null);
  };

  const handleDisburse = async () => {
    if (!selectedAdvance) return;
    await disburseAdvance(selectedAdvance.id, disburseForm.method, disburseForm.reference);
    setDisburseDialogOpen(false);
    setSelectedAdvance(null);
  };

  const resetTypeForm = () => {
    setTypeForm({
      name: "", code: "", description: "", max_amount: "", max_percentage_of_salary: "50",
      interest_rate: "0", max_repayment_periods: "12", requires_approval: true, max_per_year: "", eligible_after_months: "3",
    });
  };

  const resetRequestForm = () => {
    setRequestForm({ employee_id: "", advance_type_id: "", requested_amount: "", reason: "", repayment_periods: "1" });
  };

  const stats = getStats();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "secondary",
      rejected: "destructive",
      disbursed: "default",
      repaying: "default",
      completed: "secondary",
    };
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      approved: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      disbursed: <Banknote className="h-3 w-3 mr-1" />,
      repaying: <TrendingUp className="h-3 w-3 mr-1" />,
      completed: <CheckCircle className="h-3 w-3 mr-1" />,
    };
    return (
      <Badge variant={variants[status] || "secondary"} className="flex items-center w-fit">
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const breadcrumbItems = [
    { label: t("nav.payroll"), href: "/payroll" },
    { label: t("payroll.salaryAdvances.title", "Salary Advances") }
  ];

  const pendingAdvances = advances.filter(a => a.status === 'pending');
  const approvedAdvances = advances.filter(a => a.status === 'approved');
  const activeAdvances = advances.filter(a => ['disbursed', 'repaying'].includes(a.status));
  const completedAdvances = advances.filter(a => ['completed', 'rejected', 'cancelled'].includes(a.status));

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t("payroll.salaryAdvances.title", "Salary Advances")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("payroll.salaryAdvances.newRequest", "New Request")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("payroll.salaryAdvances.createRequest", "Create Advance Request")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("common.employee")}</Label>
                    <Select value={requestForm.employee_id} onValueChange={v => setRequestForm(p => ({ ...p, employee_id: v }))}>
                      <SelectTrigger><SelectValue placeholder={t("common.selectEmployee")} /></SelectTrigger>
                      <SelectContent>
                        {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("payroll.salaryAdvances.advanceType", "Advance Type")}</Label>
                    <Select value={requestForm.advance_type_id} onValueChange={v => setRequestForm(p => ({ ...p, advance_type_id: v }))}>
                      <SelectTrigger><SelectValue placeholder={t("payroll.salaryAdvances.selectType", "Select type")} /></SelectTrigger>
                      <SelectContent>
                        {advanceTypes.filter(t => t.is_active).map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name} ({t.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("payroll.salaryAdvances.requestedAmount", "Requested Amount")}</Label>
                      <Input 
                        type="number" 
                        value={requestForm.requested_amount} 
                        onChange={e => setRequestForm(p => ({ ...p, requested_amount: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("payroll.salaryAdvances.repaymentPeriods", "Repayment Periods")}</Label>
                      <Input 
                        type="number" 
                        min={1} 
                        value={requestForm.repayment_periods} 
                        onChange={e => setRequestForm(p => ({ ...p, repayment_periods: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.reason")}</Label>
                    <Textarea 
                      value={requestForm.reason} 
                      onChange={e => setRequestForm(p => ({ ...p, reason: e.target.value }))}
                      placeholder={t("payroll.salaryAdvances.reasonPlaceholder", "Reason for advance request...")}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setRequestDialogOpen(false)}>{t("common.cancel")}</Button>
                    <Button onClick={handleCreateRequest} disabled={!requestForm.employee_id || !requestForm.requested_amount}>
                      {t("common.submit")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-sm text-muted-foreground">{t("payroll.salaryAdvances.pendingRequests", "Pending Requests")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <div className="text-sm text-muted-foreground">{t("payroll.salaryAdvances.approved", "Approved")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Banknote className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.disbursed}</div>
                  <div className="text-sm text-muted-foreground">{t("payroll.salaryAdvances.disbursed", "Disbursed")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalOutstanding)}</div>
                  <div className="text-sm text-muted-foreground">{t("payroll.salaryAdvances.totalOutstanding", "Total Outstanding")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t("payroll.salaryAdvances.pending", "Pending")} ({pendingAdvances.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {t("payroll.salaryAdvances.approvedTab", "Approved")} ({approvedAdvances.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t("payroll.salaryAdvances.active", "Active")} ({activeAdvances.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("payroll.salaryAdvances.history", "History")} ({completedAdvances.length})
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t("payroll.salaryAdvances.advanceTypes", "Advance Types")}
            </TabsTrigger>
            <TabsTrigger value="payroll-queue" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              {t("payroll.salaryAdvances.payrollQueue", "Payroll Queue")}
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>{t("payroll.salaryAdvances.pendingRequests", "Pending Requests")}</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingAdvances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("payroll.salaryAdvances.noPending", "No pending advance requests")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("payroll.salaryAdvances.advanceNumber", "Advance #")}</TableHead>
                        <TableHead>{t("common.employee")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.type", "Type")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.requestedAmount", "Requested")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.requestedDate", "Date")}</TableHead>
                        <TableHead>{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingAdvances.map(advance => (
                        <TableRow key={advance.id}>
                          <TableCell className="font-mono">{advance.advance_number}</TableCell>
                          <TableCell className="font-medium">{advance.employee?.full_name}</TableCell>
                          <TableCell>{advance.advance_type?.name || "-"}</TableCell>
                          <TableCell>{formatCurrency(advance.requested_amount)}</TableCell>
                          <TableCell>{formatDateForDisplay(advance.requested_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedAdvance(advance);
                                  setApprovalForm({
                                    approved_amount: advance.requested_amount.toString(),
                                    repayment_periods: (advance.repayment_periods || 1).toString(),
                                    repayment_start_date: getTodayString(),
                                  });
                                  setApprovalDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                {t("common.approve")}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedAdvance(advance);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approved Tab */}
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>{t("payroll.salaryAdvances.approvedAdvances", "Approved Advances")}</CardTitle>
              </CardHeader>
              <CardContent>
                {approvedAdvances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("payroll.salaryAdvances.noApproved", "No approved advances awaiting disbursement")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("payroll.salaryAdvances.advanceNumber", "Advance #")}</TableHead>
                        <TableHead>{t("common.employee")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.approvedAmount", "Approved")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.repaymentPlan", "Repayment Plan")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.approvedBy", "Approved By")}</TableHead>
                        <TableHead>{t("common.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedAdvances.map(advance => (
                        <TableRow key={advance.id}>
                          <TableCell className="font-mono">{advance.advance_number}</TableCell>
                          <TableCell className="font-medium">{advance.employee?.full_name}</TableCell>
                          <TableCell>{formatCurrency(advance.approved_amount)}</TableCell>
                          <TableCell>
                            {advance.repayment_periods} × {formatCurrency(advance.repayment_amount_per_period)}
                          </TableCell>
                          <TableCell>{advance.approver?.full_name}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedAdvance(advance);
                                setDisburseDialogOpen(true);
                              }}
                            >
                              <Banknote className="h-4 w-4 mr-1" />
                              {t("payroll.salaryAdvances.disburse", "Disburse")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>{t("payroll.salaryAdvances.activeAdvances", "Active Advances")}</CardTitle>
              </CardHeader>
              <CardContent>
                {activeAdvances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("payroll.salaryAdvances.noActive", "No active advances")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("payroll.salaryAdvances.advanceNumber", "Advance #")}</TableHead>
                        <TableHead>{t("common.employee")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.totalAmount", "Total")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.outstanding", "Outstanding")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.progress", "Progress")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeAdvances.map(advance => {
                        const total = advance.total_repayment_amount || 0;
                        const outstanding = advance.outstanding_balance || 0;
                        const paid = total - outstanding;
                        const progress = total > 0 ? (paid / total) * 100 : 0;
                        
                        return (
                          <TableRow key={advance.id}>
                            <TableCell className="font-mono">{advance.advance_number}</TableCell>
                            <TableCell className="font-medium">{advance.employee?.full_name}</TableCell>
                            <TableCell>{formatCurrency(total)}</TableCell>
                            <TableCell>{formatCurrency(outstanding)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full" 
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(advance.status)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>{t("payroll.salaryAdvances.advanceHistory", "Advance History")}</CardTitle>
              </CardHeader>
              <CardContent>
                {completedAdvances.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("payroll.salaryAdvances.noHistory", "No completed or rejected advances")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("payroll.salaryAdvances.advanceNumber", "Advance #")}</TableHead>
                        <TableHead>{t("common.employee")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.amount", "Amount")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.completedDate", "Date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedAdvances.map(advance => (
                        <TableRow key={advance.id}>
                          <TableCell className="font-mono">{advance.advance_number}</TableCell>
                          <TableCell className="font-medium">{advance.employee?.full_name}</TableCell>
                          <TableCell>{formatCurrency(advance.approved_amount || advance.requested_amount)}</TableCell>
                          <TableCell>{getStatusBadge(advance.status)}</TableCell>
                          <TableCell>
                            {formatDateForDisplay(advance.completed_at || advance.rejected_at || advance.updated_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advance Types Tab */}
          <TabsContent value="types">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("payroll.salaryAdvances.advanceTypes", "Advance Types")}</CardTitle>
                <Dialog open={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      {t("payroll.salaryAdvances.addType", "Add Type")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("payroll.salaryAdvances.createAdvanceType", "Create Advance Type")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("common.name")}</Label>
                          <Input value={typeForm.name} onChange={e => setTypeForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("common.code")}</Label>
                          <Input value={typeForm.code} onChange={e => setTypeForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("payroll.salaryAdvances.maxAmount", "Max Amount")}</Label>
                          <Input type="number" value={typeForm.max_amount} onChange={e => setTypeForm(p => ({ ...p, max_amount: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("payroll.salaryAdvances.maxPercentSalary", "Max % of Salary")}</Label>
                          <Input type="number" value={typeForm.max_percentage_of_salary} onChange={e => setTypeForm(p => ({ ...p, max_percentage_of_salary: e.target.value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("payroll.salaryAdvances.interestRate", "Interest Rate (%)")}</Label>
                          <Input type="number" step="0.01" value={typeForm.interest_rate} onChange={e => setTypeForm(p => ({ ...p, interest_rate: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t("payroll.salaryAdvances.maxRepaymentPeriods", "Max Repayment Periods")}</Label>
                          <Input type="number" value={typeForm.max_repayment_periods} onChange={e => setTypeForm(p => ({ ...p, max_repayment_periods: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setTypeDialogOpen(false)}>{t("common.cancel")}</Button>
                        <Button onClick={handleCreateType} disabled={!typeForm.name || !typeForm.code}>{t("common.create")}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {advanceTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("payroll.salaryAdvances.noTypes", "No advance types configured")}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.name")}</TableHead>
                        <TableHead>{t("common.code")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.maxAmount", "Max Amount")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.interestRate", "Interest")}</TableHead>
                        <TableHead>{t("payroll.salaryAdvances.maxPeriods", "Max Periods")}</TableHead>
                        <TableHead>{t("common.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {advanceTypes.map(type => (
                        <TableRow key={type.id}>
                          <TableCell className="font-medium">{type.name}</TableCell>
                          <TableCell className="font-mono">{type.code}</TableCell>
                          <TableCell>{type.max_amount ? formatCurrency(type.max_amount) : `${type.max_percentage_of_salary}% of salary`}</TableCell>
                          <TableCell>{((type.interest_rate || 0) * 100).toFixed(2)}%</TableCell>
                          <TableCell>{type.max_repayment_periods}</TableCell>
                          <TableCell>
                            <Badge variant={type.is_active ? "default" : "secondary"}>
                              {type.is_active ? t("common.active") : t("common.inactive")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Queue Tab */}
          <TabsContent value="payroll-queue">
            <SalaryAdvancePayrollQueue companyId={selectedCompany || null} />
          </TabsContent>
        </Tabs>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.salaryAdvances.approveAdvance", "Approve Advance")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("payroll.salaryAdvances.requestedAmount", "Requested Amount")}</p>
                <p className="text-xl font-bold">{formatCurrency(selectedAdvance?.requested_amount || 0)}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.salaryAdvances.approvedAmount", "Approved Amount")}</Label>
                <Input 
                  type="number" 
                  value={approvalForm.approved_amount} 
                  onChange={e => setApprovalForm(p => ({ ...p, approved_amount: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("payroll.salaryAdvances.repaymentPeriods", "Repayment Periods")}</Label>
                  <Input 
                    type="number" 
                    min={1}
                    value={approvalForm.repayment_periods} 
                    onChange={e => setApprovalForm(p => ({ ...p, repayment_periods: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("payroll.salaryAdvances.repaymentStart", "Repayment Start")}</Label>
                  <Input 
                    type="date"
                    value={approvalForm.repayment_start_date} 
                    onChange={e => setApprovalForm(p => ({ ...p, repayment_start_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleApprove}>{t("common.approve")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.salaryAdvances.rejectAdvance", "Reject Advance")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("payroll.salaryAdvances.rejectionReason", "Rejection Reason")}</Label>
                <Textarea 
                  value={rejectForm.reason} 
                  onChange={e => setRejectForm({ reason: e.target.value })}
                  placeholder={t("payroll.salaryAdvances.rejectionReasonPlaceholder", "Provide a reason for rejection...")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectForm.reason}>
                  {t("payroll.salaryAdvances.reject", "Reject")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Disburse Dialog */}
        <Dialog open={disburseDialogOpen} onOpenChange={setDisburseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("payroll.salaryAdvances.disburseAdvance", "Disburse Advance")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("payroll.salaryAdvances.amountToDisburse", "Amount to Disburse")}</p>
                <p className="text-xl font-bold">{formatCurrency(selectedAdvance?.approved_amount || 0)}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.salaryAdvances.disbursementMethod", "Disbursement Method")}</Label>
                <Select value={disburseForm.method} onValueChange={v => setDisburseForm(p => ({ ...p, method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">{t("payroll.salaryAdvances.bankTransfer", "Bank Transfer")}</SelectItem>
                    <SelectItem value="payroll">{t("payroll.salaryAdvances.addToPayroll", "Add to Payroll")}</SelectItem>
                    <SelectItem value="cash">{t("payroll.salaryAdvances.cash", "Cash")}</SelectItem>
                    <SelectItem value="check">{t("payroll.salaryAdvances.check", "Check")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.salaryAdvances.reference", "Reference")}</Label>
                <Input 
                  value={disburseForm.reference} 
                  onChange={e => setDisburseForm(p => ({ ...p, reference: e.target.value }))}
                  placeholder={t("payroll.salaryAdvances.referencePlaceholder", "Transaction reference...")}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDisburseDialogOpen(false)}>{t("common.cancel")}</Button>
                <Button onClick={handleDisburse}>{t("payroll.salaryAdvances.disburse", "Disburse")}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
