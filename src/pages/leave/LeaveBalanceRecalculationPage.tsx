import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Calculator, RefreshCw, History } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  department_id?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface RecalculationHistory {
  id: string;
  employee_id: string;
  calculation_type: string;
  period_start: string;
  period_end: string;
  old_balance: any;
  new_balance: any;
  triggered_by: string;
  created_at: string;
  employee?: { full_name: string };
}

export default function LeaveBalanceRecalculationPage() {
  const { isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { recalculateLeaveBalance } = useLeaveManagement(selectedCompanyId);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [scope, setScope] = useState<'single' | 'department' | 'all'>('single');
  const [calculationType, setCalculationType] = useState<'current_year' | 'from_hire_date' | 'custom_range'>('current_year');
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [history, setHistory] = useState<RecalculationHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  // Fetch departments for selected company
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedCompanyId) return;
      const { data } = await supabase
        .from("departments")
        .select("id, name, code")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (data) setDepartments(data);
    };
    fetchDepartments();
  }, [selectedCompanyId]);

  // Fetch employees for selected company
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompanyId) return;
      const query = supabase.from("profiles").select("id, full_name, email, department_id");
      const { data, error } = await (query as any)
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true);
      if (data && !error) {
        setEmployees(data.map((e: any) => ({
          id: e.id,
          full_name: e.full_name || '',
          email: e.email || '',
          department_id: e.department_id
        })));
      }
    };
    fetchEmployees();
  }, [selectedCompanyId]);

  // Fetch recalculation history
  useEffect(() => {
    if (selectedCompanyId) {
      setLoadingHistory(true);
      supabase
        .from("leave_balance_recalculations")
        .select("*, employee:profiles!leave_balance_recalculations_employee_id_fkey(full_name)")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (data) setHistory(data as RecalculationHistory[]);
          setLoadingHistory(false);
        });
    }
  }, [selectedCompanyId, lastResult]);

  const getTargetEmployees = () => {
    if (scope === 'single') {
      return employees.filter(e => e.id === selectedEmployeeId);
    } else if (scope === 'department') {
      return employees.filter(e => e.department_id === selectedDepartmentId);
    }
    return employees;
  };

  const handleRecalculate = async () => {
    if (!selectedCompanyId) {
      toast.error("Please select a company");
      return;
    }

    if (scope === 'single' && !selectedEmployeeId) {
      toast.error("Please select an employee");
      return;
    }

    if (scope === 'department' && !selectedDepartmentId) {
      toast.error("Please select a department");
      return;
    }

    if (calculationType === 'custom_range' && (!periodStart || !periodEnd)) {
      toast.error("Please specify both start and end dates for custom range");
      return;
    }

    const targetEmployees = getTargetEmployees();
    
    if (targetEmployees.length === 0) {
      toast.error("No employees found for the selected criteria");
      return;
    }

    if (targetEmployees.length > 1) {
      const confirmed = window.confirm(
        `This will recalculate leave balances for ${targetEmployees.length} employees. Continue?`
      );
      if (!confirmed) return;
    }

    setIsRecalculating(true);
    let successCount = 0;
    let errorCount = 0;
    let singleResult = null;

    for (const employee of targetEmployees) {
      try {
        const result = await recalculateLeaveBalance.mutateAsync({
          employeeId: employee.id,
          companyId: selectedCompanyId,
          calculationType,
          periodStart: calculationType === 'custom_range' ? periodStart : undefined,
          periodEnd: calculationType === 'custom_range' ? periodEnd : undefined,
        });
        successCount++;
        if (targetEmployees.length === 1) {
          singleResult = result;
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to recalculate for ${employee.full_name}:`, error);
      }
    }

    setIsRecalculating(false);
    
    if (targetEmployees.length === 1 && singleResult) {
      setLastResult(singleResult);
      toast.success("Recalculation completed successfully");
    } else {
      toast.success(`Recalculation complete: ${successCount} succeeded, ${errorCount} failed`);
      setLastResult({ bulk: true, successCount, errorCount });
    }
  };

  const calculationTypeLabels: Record<string, string> = {
    current_year: "Current Year (Jan 1 - Today)",
    from_hire_date: "From Hire Date",
    custom_range: "Custom Date Range",
  };

  if (!isAdminOrHR) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Balance Recalculation" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Leave Balance Recalculation</h1>
              <p className="text-muted-foreground">Recalculate employee leave balances based on accrual rules</p>
            </div>
          </div>
          <LeaveCompanyFilter 
            selectedCompanyId={selectedCompanyId} 
            onCompanyChange={setSelectedCompanyId} 
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recalculation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Recalculate Balance
              </CardTitle>
              <CardDescription>
                Select an employee and calculation period to recalculate their leave balance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recalculation Scope</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as typeof scope)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Employee</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="all">All Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {scope === 'single' && (
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name} ({emp.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scope === 'department' && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDepartmentId && (
                    <p className="text-sm text-muted-foreground">
                      {employees.filter(e => e.department_id === selectedDepartmentId).length} employees in this department
                    </p>
                  )}
                </div>
              )}

              {scope === 'all' && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This will recalculate leave balances for all <strong>{employees.length}</strong> employees in the selected company.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="calculation_type">Calculation Period</Label>
                <Select 
                  value={calculationType} 
                  onValueChange={(v) => setCalculationType(v as typeof calculationType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current_year">Current Year (Jan 1 - Today)</SelectItem>
                    <SelectItem value="from_hire_date">From Hire Date</SelectItem>
                    <SelectItem value="custom_range">Custom Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {calculationType === 'custom_range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period_start">Start Date</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="period_end">End Date</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  onClick={handleRecalculate} 
                  disabled={isRecalculating || (scope === 'single' && !selectedEmployeeId) || (scope === 'department' && !selectedDepartmentId)}
                  className="w-full"
                >
                  {isRecalculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Recalculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Recalculate {scope === 'single' ? 'Employee' : scope === 'department' ? 'Department' : `All (${employees.length})`}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Last Result */}
          {lastResult && !lastResult.bulk && (
            <Card>
              <CardHeader>
                <CardTitle>Recalculation Result</CardTitle>
                <CardDescription>
                  Period: {lastResult.period_start} to {lastResult.period_end}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">New Balances</h4>
                    <div className="space-y-2">
                      {(lastResult.new_balances || []).map((balance: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                          <span className="font-medium">{balance.leave_type_name}</span>
                          <div className="text-right">
                            <span className="text-lg font-bold">{balance.balance?.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              (Accrued: {balance.accrued?.toFixed(1)}, Taken: {balance.taken?.toFixed(1)})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recalculation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recalculation History
            </CardTitle>
            <CardDescription>
              Recent balance recalculations for this company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Triggered By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No recalculation history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.employee?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {calculationTypeLabels[item.calculation_type] || item.calculation_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.period_start).toLocaleDateString()} - {new Date(item.period_end).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.triggered_by === 'manual' ? 'default' : 'secondary'}>
                          {item.triggered_by}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
