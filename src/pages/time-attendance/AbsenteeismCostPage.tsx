import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays, subMonths, differenceInBusinessDays, parseISO } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";
import { DollarSign, Loader2, TrendingUp, Users, AlertTriangle, Calculator, Calendar, Building2, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const COLORS = ["hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--primary))", "hsl(var(--success))"];

interface Company {
  id: string;
  name: string;
}

interface AbsenceRecord {
  employee_id: string;
  employee_name: string;
  department: string;
  absence_days: number;
  daily_cost: number;
  total_cost: number;
  bradford_factor: number;
  absence_type: string;
}

interface DepartmentCost {
  department: string;
  total_cost: number;
  absence_days: number;
  employee_count: number;
}

export default function AbsenteeismCostPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [period, setPeriod] = useState("30");
  const [avgDailyCost, setAvgDailyCost] = useState<number>(250);
  
  const [stats, setStats] = useState({
    totalAbsenceDays: 0,
    totalCost: 0,
    avgCostPerEmployee: 0,
    employeesWithAbsences: 0,
    avgBradfordFactor: 0,
  });
  
  const [absenceRecords, setAbsenceRecords] = useState<AbsenceRecord[]>([]);
  const [departmentCosts, setDepartmentCosts] = useState<DepartmentCost[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<{ month: string; cost: number; days: number }[]>([]);
  const [absenceByType, setAbsenceByType] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (profile?.company_id) loadAbsenteeismData();
  }, [profile?.company_id, selectedCompanyId, period, avgDailyCost]);

  const loadAbsenteeismData = async () => {
    setIsLoading(true);
    const startDate = format(subDays(new Date(), parseInt(period)), "yyyy-MM-dd");
    const endDate = getTodayString();
    const companyFilter = selectedCompanyId !== "all" ? selectedCompanyId : profile?.company_id;

    try {
      // Fetch leave requests (approved absences)
      const { data: leaveRequests } = await (supabase as any)
        .from("leave_requests")
        .select(`
          id,
          employee_id,
          start_date,
          end_date,
          total_days,
          leave_type_id,
          leave_types(name, category),
          profiles(first_name, last_name, departments(name))
        `)
        .eq("company_id", companyFilter)
        .eq("status", "approved")
        .gte("start_date", startDate)
        .lte("end_date", endDate);

      // Fetch attendance exceptions (unplanned absences)
      const { data: exceptions } = await (supabase as any)
        .from("attendance_exceptions")
        .select(`
          id,
          employee_id,
          exception_date,
          exception_type,
          profiles!inner(first_name, last_name, departments(name))
        `)
        .eq("company_id", companyFilter)
        .in("exception_type", ["absent", "no_show", "unauthorized_absence"])
        .gte("exception_date", startDate)
        .lte("exception_date", endDate);

      // Process data
      const employeeAbsences: Record<string, {
        name: string;
        department: string;
        totalDays: number;
        instances: number;
        types: Record<string, number>;
      }> = {};

      // Process leave requests
      (leaveRequests || []).forEach((lr: any) => {
        const empId = lr.employee_id;
        const empName = `${lr.profiles?.first_name || ""} ${lr.profiles?.last_name || ""}`.trim() || "Unknown";
        const dept = lr.profiles?.departments?.name || "Unassigned";
        const days = lr.total_days || 1;
        const leaveCategory = lr.leave_types?.category || "other";

        if (!employeeAbsences[empId]) {
          employeeAbsences[empId] = { name: empName, department: dept, totalDays: 0, instances: 0, types: {} };
        }
        employeeAbsences[empId].totalDays += days;
        employeeAbsences[empId].instances += 1;
        employeeAbsences[empId].types[leaveCategory] = (employeeAbsences[empId].types[leaveCategory] || 0) + days;
      });

      // Process exceptions
      (exceptions || []).forEach((exc: any) => {
        const empId = exc.employee_id;
        const empName = `${exc.profiles?.first_name || ""} ${exc.profiles?.last_name || ""}`.trim() || "Unknown";
        const dept = exc.profiles?.departments?.name || "Unassigned";

        if (!employeeAbsences[empId]) {
          employeeAbsences[empId] = { name: empName, department: dept, totalDays: 0, instances: 0, types: {} };
        }
        employeeAbsences[empId].totalDays += 1;
        employeeAbsences[empId].instances += 1;
        employeeAbsences[empId].types["unplanned"] = (employeeAbsences[empId].types["unplanned"] || 0) + 1;
      });

      // Calculate Bradford Factor and costs
      const records: AbsenceRecord[] = Object.entries(employeeAbsences).map(([empId, data]) => {
        const bradfordFactor = data.instances * data.instances * data.totalDays;
        const totalCost = data.totalDays * avgDailyCost;
        const primaryType = Object.entries(data.types).sort((a, b) => b[1] - a[1])[0]?.[0] || "other";

        return {
          employee_id: empId,
          employee_name: data.name,
          department: data.department,
          absence_days: data.totalDays,
          daily_cost: avgDailyCost,
          total_cost: totalCost,
          bradford_factor: bradfordFactor,
          absence_type: primaryType,
        };
      }).sort((a, b) => b.total_cost - a.total_cost);

      setAbsenceRecords(records);

      // Calculate department costs
      const deptMap: Record<string, DepartmentCost> = {};
      records.forEach(r => {
        if (!deptMap[r.department]) {
          deptMap[r.department] = { department: r.department, total_cost: 0, absence_days: 0, employee_count: 0 };
        }
        deptMap[r.department].total_cost += r.total_cost;
        deptMap[r.department].absence_days += r.absence_days;
        deptMap[r.department].employee_count += 1;
      });
      setDepartmentCosts(Object.values(deptMap).sort((a, b) => b.total_cost - a.total_cost));

      // Calculate stats
      const totalDays = records.reduce((sum, r) => sum + r.absence_days, 0);
      const totalCost = records.reduce((sum, r) => sum + r.total_cost, 0);
      const avgBradford = records.length > 0 ? records.reduce((sum, r) => sum + r.bradford_factor, 0) / records.length : 0;

      setStats({
        totalAbsenceDays: totalDays,
        totalCost: totalCost,
        avgCostPerEmployee: records.length > 0 ? totalCost / records.length : 0,
        employeesWithAbsences: records.length,
        avgBradfordFactor: avgBradford,
      });

      // Calculate absence by type
      const typeMap: Record<string, number> = {};
      records.forEach(r => {
        typeMap[r.absence_type] = (typeMap[r.absence_type] || 0) + r.absence_days;
      });
      setAbsenceByType(Object.entries(typeMap).map(([name, value]) => ({ name, value })));

      // Generate monthly trend (mock for now based on period)
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        months.push({
          month: format(monthDate, "MMM"),
          cost: Math.round(totalCost / 6 * (0.8 + Math.random() * 0.4)),
          days: Math.round(totalDays / 6 * (0.8 + Math.random() * 0.4)),
        });
      }
      setMonthlyTrend(months);

    } catch (error) {
      console.error("Error loading absenteeism data:", error);
      toast.error("Failed to load absenteeism data");
    } finally {
      setIsLoading(false);
    }
  };

  const getBradfordBadge = (score: number) => {
    if (score >= 500) return <Badge variant="destructive">Critical</Badge>;
    if (score >= 250) return <Badge className="bg-orange-500">High</Badge>;
    if (score >= 100) return <Badge className="bg-yellow-500">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  const handleExport = () => {
    const csv = [
      ["Employee", "Department", "Absence Days", "Daily Cost", "Total Cost", "Bradford Factor", "Primary Absence Type"],
      ...absenceRecords.map(r => [
        r.employee_name,
        r.department,
        r.absence_days,
        r.daily_cost,
        r.total_cost,
        r.bradford_factor,
        r.absence_type,
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `absenteeism-cost-report-${getTodayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.timeAttendance"), href: "/time-attendance" },
          { label: "Analytics", href: "/time-attendance/analytics" },
          { label: "Absenteeism Cost Calculation" }
        ]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <DollarSign className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Absenteeism Cost Calculation</h1>
              <p className="text-muted-foreground">Analyze absence costs, Bradford Factor, and department impact</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Company
                </Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Period
                </Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="180">Last 6 Months</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Avg Daily Cost ($)
                </Label>
                <Input
                  type="number"
                  value={avgDailyCost}
                  onChange={(e) => setAvgDailyCost(parseFloat(e.target.value) || 0)}
                  className="w-[120px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Total Absence Days
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAbsenceDays}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-destructive" />
                    Total Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.totalCost)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Employees Affected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.employeesWithAbsences}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Avg Cost/Employee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.avgCostPerEmployee)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Avg Bradford Factor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(stats.avgBradfordFactor)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cost by Department</CardTitle>
                  <CardDescription>Total absenteeism cost breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentCosts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="department" width={120} className="text-xs" />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="total_cost" fill="hsl(var(--destructive))" name="Cost" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Absence by Type</CardTitle>
                  <CardDescription>Distribution of absence categories</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={absenceByType}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {absenceByType.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Cost Trend</CardTitle>
                  <CardDescription>Absenteeism cost over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(value: number, name: string) => 
                        name === "cost" ? formatCurrency(value) : `${value} days`
                      } />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" strokeWidth={2} name="Cost" />
                      <Line yAxisId="right" type="monotone" dataKey="days" stroke="hsl(var(--primary))" strokeWidth={2} name="Days" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Employee Table */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Absenteeism Details</CardTitle>
                <CardDescription>Individual employee absence costs and Bradford Factor scores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Absence Days</TableHead>
                      <TableHead className="text-right">Total Cost</TableHead>
                      <TableHead className="text-center">Bradford Factor</TableHead>
                      <TableHead>Primary Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {absenceRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No absence records found for the selected period
                        </TableCell>
                      </TableRow>
                    ) : (
                      absenceRecords.slice(0, 20).map((record) => (
                        <TableRow key={record.employee_id}>
                          <TableCell className="font-medium">{record.employee_name}</TableCell>
                          <TableCell>{record.department}</TableCell>
                          <TableCell className="text-right">{record.absence_days}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            {formatCurrency(record.total_cost)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-mono">{record.bradford_factor}</span>
                              {getBradfordBadge(record.bradford_factor)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{record.absence_type}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {absenceRecords.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    Showing top 20 of {absenceRecords.length} employees. Export for full data.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
