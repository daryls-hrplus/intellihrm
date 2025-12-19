import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PayrollFilters, usePayrollFilters } from "@/components/payroll/PayrollFilters";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Plus, 
  Calendar,
  Users,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  employee_number: string | null;
  position_title?: string;
  department_name?: string;
}

interface PayrollRun {
  id: string;
  run_number: string;
  run_type: string;
  status: string;
  pay_period?: { period_start: string; period_end: string } | null;
  paid_at: string | null;
}

interface PayPeriod {
  id: string;
  period_number: string;
  period_start: string;
  period_end: string;
  pay_date: string;
  status: string;
}

interface OffCycleRun {
  id: string;
  run_number: string;
  run_type: string;
  status: string;
  description: string | null;
  adjustment_reason: string | null;
  payment_date: string | null;
  employee_count: number;
  total_gross_pay: number;
  total_net_pay: number;
  created_at: string;
  pay_period_id: string | null;
  pay_period?: PayPeriod | null;
  reference_run?: PayrollRun | null;
}

export default function OffCyclePayrollPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId, selectedPayGroupId, setSelectedPayGroupId } = usePayrollFilters();
  
  const [isLoading, setIsLoading] = useState(false);
  const [offCycleRuns, setOffCycleRuns] = useState<OffCycleRun[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [paidRuns, setPaidRuns] = useState<PayrollRun[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    run_type: "off_cycle" as "off_cycle" | "correction" | "supplemental" | "bonus",
    description: "",
    adjustment_reason: "",
    payment_date: "",
    reference_run_id: "",
    pay_period_id: "", // Required - determines tax/statutory rules
  });

  const runTypeOptions = [
    { value: "off_cycle", label: "Off-Cycle", description: "Unscheduled payroll adjustment" },
    { value: "correction", label: "Correction", description: "Correct a previous payroll error" },
    { value: "supplemental", label: "Supplemental", description: "Additional payment outside regular cycle" },
    { value: "bonus", label: "Bonus", description: "Dedicated bonus payout" },
  ];

  useEffect(() => {
    if (selectedCompanyId && selectedPayGroupId && selectedPayGroupId !== "all") {
      loadData();
    }
  }, [selectedCompanyId, selectedPayGroupId]);

  const loadData = async () => {
    if (!selectedCompanyId || !selectedPayGroupId || selectedPayGroupId === "all") return;
    
    setIsLoading(true);
    try {
      // Fetch off-cycle runs with pay period info
      const { data: runsData } = await supabase
        .from("payroll_runs")
        .select(`
          id, run_number, run_type, status, description, adjustment_reason, 
          payment_date, employee_count, total_gross_pay, total_net_pay, created_at, pay_period_id,
          pay_period:pay_periods (id, period_number, period_start, period_end, pay_date, status),
          reference_run:reference_run_id (id, run_number, run_type, status, paid_at)
        `)
        .eq("company_id", selectedCompanyId)
        .eq("pay_group_id", selectedPayGroupId)
        .neq("run_type", "regular")
        .order("created_at", { ascending: false });
      
      setOffCycleRuns((runsData || []) as unknown as OffCycleRun[]);
      
      // Fetch paid regular runs for reference
      const { data: paidRunsData } = await supabase
        .from("payroll_runs")
        .select(`
          id, run_number, run_type, status, paid_at,
          pay_period:pay_periods (period_start, period_end)
        `)
        .eq("company_id", selectedCompanyId)
        .eq("pay_group_id", selectedPayGroupId)
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .limit(20);
      
      setPaidRuns((paidRunsData || []) as unknown as PayrollRun[]);
      
      // Fetch pay periods for this pay group (current and upcoming for statutory purposes)
      const today = new Date().toISOString().split('T')[0];
      const { data: periodsData } = await supabase
        .from("pay_periods")
        .select("id, period_number, period_start, period_end, pay_date, status")
        .eq("pay_group_id", selectedPayGroupId)
        .or(`period_end.gte.${today},status.neq.closed`)
        .order("period_start", { ascending: true })
        .limit(10);
      
      setPayPeriods((periodsData || []) as PayPeriod[]);
      
      // Fetch employees for this pay group
      const { data: employeesData } = await supabase
        .from("profiles")
        .select(`
          id, full_name, email, employee_number,
          employee_positions!inner (
            is_active,
            position:positions (
              title,
              department:departments (name)
            )
          )
        `)
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .eq("employee_positions.is_active", true);
      
      const formattedEmployees: Employee[] = (employeesData || []).map((emp: any) => ({
        id: emp.id,
        full_name: emp.full_name,
        email: emp.email,
        employee_number: emp.employee_number,
        position_title: emp.employee_positions?.[0]?.position?.title,
        department_name: emp.employee_positions?.[0]?.position?.department?.name,
      }));
      
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRun = async () => {
    if (!selectedCompanyId || !selectedPayGroupId || selectedPayGroupId === "all") {
      toast.error("Please select a company and pay group");
      return;
    }
    
    if (selectedEmployees.size === 0) {
      toast.error("Please select at least one employee");
      return;
    }
    
    if (!createForm.pay_period_id) {
      toast.error("Please select a pay period for tax/statutory purposes");
      return;
    }
    
    if (!createForm.payment_date) {
      toast.error("Please select a payment date");
      return;
    }
    
    setIsLoading(true);
    try {
      // Create the payroll run
      const { data: runData, error: runError } = await (supabase as any)
        .from("payroll_runs")
        .insert({
          company_id: selectedCompanyId,
          pay_group_id: selectedPayGroupId,
          pay_period_id: createForm.pay_period_id, // Links to pay period for tax/statutory
          run_type: createForm.run_type,
          status: "draft",
          description: createForm.description || null,
          adjustment_reason: createForm.adjustment_reason || null,
          payment_date: createForm.payment_date || null,
          reference_run_id: createForm.reference_run_id || null,
          employee_count: selectedEmployees.size,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (runError) throw runError;
      
      // Add selected employees to the run
      const employeeRecords = Array.from(selectedEmployees).map(employeeId => ({
        payroll_run_id: runData.id,
        employee_id: employeeId,
        included: true,
      }));
      
      const { error: empError } = await (supabase as any)
        .from("payroll_run_employees")
        .insert(employeeRecords);
      
      if (empError) throw empError;
      
      toast.success(`Off-cycle payroll run created with ${selectedEmployees.size} employees`);
      setCreateDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error("Error creating run:", error);
      toast.error(error.message || "Failed to create off-cycle run");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCreateForm({
      run_type: "off_cycle",
      description: "",
      adjustment_reason: "",
      payment_date: "",
      reference_run_id: "",
      pay_period_id: "",
    });
    setSelectedEmployees(new Set());
    setSearchTerm("");
  };

  const toggleEmployee = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const toggleAllEmployees = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.employee_number && emp.employee_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const getRunTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      off_cycle: "bg-primary/10 text-primary",
      correction: "bg-warning/10 text-warning",
      supplemental: "bg-success/10 text-success",
      bonus: "bg-accent text-accent-foreground",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const showContent = selectedCompanyId && selectedPayGroupId && selectedPayGroupId !== "all";

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll"), href: "/payroll" },
            { label: "Off-Cycle Payroll" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
              <RefreshCw className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Off-Cycle Payroll</h1>
              <p className="text-muted-foreground">Process corrections, adjustments, and supplemental payments</p>
            </div>
          </div>
          {showContent && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Off-Cycle Run
            </Button>
          )}
        </div>

        {/* Filters */}
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
              Select a company and pay group to manage off-cycle payroll runs
            </CardContent>
          </Card>
        )}

        {showContent && (
          <>
            {/* Info Banner */}
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-primary">Off-Cycle Payroll Runs</p>
                <p className="text-sm text-muted-foreground">
                  Use off-cycle runs to process corrections, adjustments, or supplemental payments outside the regular payroll schedule. 
                  Once a regular payroll is paid, any changes must be made through an off-cycle run.
                </p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                    <RefreshCw className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Off-Cycle Runs</p>
                    <p className="text-xl font-semibold">{offCycleRuns.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(offCycleRuns.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.total_net_pay || 0), 0))}
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
                    <p className="text-sm text-muted-foreground">Pending Runs</p>
                    <p className="text-xl font-semibold">
                      {offCycleRuns.filter(r => !['paid', 'cancelled'].includes(r.status)).length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Off-Cycle Runs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Off-Cycle Payroll Runs</CardTitle>
                <CardDescription>Corrections, adjustments, and supplemental payments</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Run Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Tax Period</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offCycleRuns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No off-cycle payroll runs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      offCycleRuns.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-mono text-sm">{run.run_number}</TableCell>
                          <TableCell>
                            <Badge className={getRunTypeColor(run.run_type)}>
                              {run.run_type.replace('_', '-')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {run.pay_period ? (
                              <span className="text-xs">
                                {formatDateForDisplay(run.pay_period.period_start)} - {formatDateForDisplay(run.pay_period.period_end)}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate">
                            {run.description || run.adjustment_reason || '-'}
                          </TableCell>
                          <TableCell>
                            {run.payment_date ? formatDateForDisplay(run.payment_date) : '-'}
                          </TableCell>
                          <TableCell>{run.employee_count}</TableCell>
                          <TableCell>{formatCurrency(run.total_net_pay || 0)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Create Off-Cycle Run Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Off-Cycle Payroll Run</DialogTitle>
              <DialogDescription>
                Set up a new off-cycle payroll run and select the employees to include
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Pay Period Selection - Required for tax/statutory */}
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-warning" />
                  <Label className="text-base font-semibold">Tax/Statutory Period</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the pay period that governs tax calculations and statutory deductions for this off-cycle run. 
                  You can process unlimited off-cycle runs within any pay period.
                </p>
                <Select 
                  value={createForm.pay_period_id} 
                  onValueChange={(val) => setCreateForm(prev => ({ ...prev, pay_period_id: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay period for tax/statutory rules" />
                  </SelectTrigger>
                  <SelectContent>
                    {payPeriods.map(period => {
                      const today = new Date().toISOString().split('T')[0];
                      const isCurrent = period.period_start <= today && period.period_end >= today;
                      const isFuture = period.period_start > today;
                      return (
                        <SelectItem key={period.id} value={period.id}>
                          <div className="flex items-center gap-2">
                            <span>{formatDateForDisplay(period.period_start)} - {formatDateForDisplay(period.period_end)}</span>
                            {isCurrent && <Badge variant="outline" className="text-xs">Current</Badge>}
                            {isFuture && <Badge variant="outline" className="text-xs">Upcoming</Badge>}
                            <span className="text-muted-foreground text-xs">({period.status})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Run Configuration */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Run Type</Label>
                  <Select 
                    value={createForm.run_type} 
                    onValueChange={(val: any) => setCreateForm(prev => ({ ...prev, run_type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {runTypeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div>
                            <span className="font-medium">{opt.label}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{opt.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input 
                    type="date"
                    value={createForm.payment_date}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, payment_date: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Reference Run (Optional)</Label>
                  <Select 
                    value={createForm.reference_run_id} 
                    onValueChange={(val) => setCreateForm(prev => ({ ...prev, reference_run_id: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select if correcting a previous run" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {paidRuns.map(run => (
                        <SelectItem key={run.id} value={run.id}>
                          {run.run_number} - {run.pay_period ? `${formatDateForDisplay(run.pay_period.period_start)} to ${formatDateForDisplay(run.pay_period.period_end)}` : 'N/A'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Adjustment Reason</Label>
                  <Input 
                    value={createForm.adjustment_reason}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, adjustment_reason: e.target.value }))}
                    placeholder="e.g., Overtime correction, Bonus payment"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about this off-cycle run..."
                  rows={2}
                />
              </div>

              {/* Employee Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Employees</Label>
                  <Badge variant="outline">
                    {selectedEmployees.size} of {employees.length} selected
                  </Badge>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
                            onCheckedChange={toggleAllEmployees}
                          />
                        </TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No employees found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees.map((emp) => (
                          <TableRow 
                            key={emp.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleEmployee(emp.id)}
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedEmployees.has(emp.id)}
                                onCheckedChange={() => toggleEmployee(emp.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{emp.full_name}</p>
                                <p className="text-xs text-muted-foreground">{emp.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>{emp.position_title || '-'}</TableCell>
                            <TableCell>{emp.department_name || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRun} 
                disabled={isLoading || selectedEmployees.size === 0}
              >
                {isLoading ? "Creating..." : "Create Off-Cycle Run"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
