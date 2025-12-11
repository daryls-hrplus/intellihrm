import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Briefcase,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, eachMonthOfInterval, parseISO, startOfMonth, endOfMonth, subMonths, subYears, isWithinInterval } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts";

interface Position {
  id: string;
  title: string;
  department_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
  company_id: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

interface EmployeePosition {
  id: string;
  employee_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
}

interface Employee {
  id: string;
  full_name: string | null;
  email: string;
}

interface Company {
  id: string;
  name: string;
  code: string;
}

interface DrillDownData {
  month: string;
  monthDate: Date;
  type: "positions" | "employees" | "positionChanges" | "employeeMovement";
}

interface OrgChangesReportingProps {
  companyId?: string;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--secondary))", "hsl(var(--accent))"];

export function OrgChangesReporting({ companyId }: OrgChangesReportingProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companyId || "");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeePositions, setEmployeePositions] = useState<EmployeePosition[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>(() => format(subMonths(new Date(), 11), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [showYoY, setShowYoY] = useState(false);
  const [drillDown, setDrillDown] = useState<DrillDownData | null>(null);

  // Filter positions by department
  const filteredPositions = useMemo(() => {
    if (selectedDepartmentId === "all") return positions;
    return positions.filter(p => p.department_id === selectedDepartmentId);
  }, [positions, selectedDepartmentId]);

  // Filter employee positions based on filtered positions
  const filteredEmployeePositions = useMemo(() => {
    if (selectedDepartmentId === "all") return employeePositions;
    const positionIds = new Set(filteredPositions.map(p => p.id));
    return employeePositions.filter(ep => positionIds.has(ep.position_id));
  }, [employeePositions, filteredPositions, selectedDepartmentId]);

  // Filter departments for display (only selected if filtered)
  const filteredDepartments = useMemo(() => {
    if (selectedDepartmentId === "all") return departments;
    return departments.filter(d => d.id === selectedDepartmentId);
  }, [departments, selectedDepartmentId]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      setSelectedDepartmentId("all");
      fetchData();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
      
      if (data && data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(companyId || data[0].id);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  const fetchData = async () => {
    if (!selectedCompanyId) return;
    
    setIsLoading(true);
    try {
      // Fetch departments
      const { data: deptData, error: deptError } = await supabase
        .from("departments")
        .select("id, name, company_id, start_date, end_date, created_at")
        .eq("company_id", selectedCompanyId)
        .order("name");

      if (deptError) throw deptError;
      setDepartments(deptData || []);

      const deptIds = (deptData || []).map(d => d.id);

      if (deptIds.length > 0) {
        // Fetch positions
        const { data: posData, error: posError } = await supabase
          .from("positions")
          .select("id, title, department_id, start_date, end_date, created_at")
          .in("department_id", deptIds)
          .order("title");

        if (posError) throw posError;
        setPositions(posData || []);

        const posIds = (posData || []).map(p => p.id);
        if (posIds.length > 0) {
          // Fetch employee positions
          const { data: epData, error: epError } = await supabase
            .from("employee_positions")
            .select("id, employee_id, position_id, start_date, end_date")
            .in("position_id", posIds);

          if (epError) throw epError;
          setEmployeePositions(epData || []);

          // Fetch employee profiles for the employees in positions
          const employeeIds = [...new Set((epData || []).map(ep => ep.employee_id))];
          if (employeeIds.length > 0) {
            const { data: empData, error: empError } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", employeeIds);

            if (empError) throw empError;
            setEmployees(empData || []);
          } else {
            setEmployees([]);
          }
        } else {
          setEmployeePositions([]);
          setEmployees([]);
        }
      } else {
        setPositions([]);
        setEmployeePositions([]);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load organizational data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chart click for drill-down
  const handleChartClick = (data: any, type: DrillDownData["type"]) => {
    if (!data || !data.activePayload || !data.activePayload[0]) return;
    const payload = data.activePayload[0].payload;
    const monthStr = payload.month;
    // Parse the month string back to a date
    const monthDate = parseISO(startDate);
    const monthsInRange = eachMonthOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
    const matchingMonth = monthsInRange.find(m => format(m, "MMM yyyy") === monthStr);
    
    if (matchingMonth) {
      setDrillDown({ month: monthStr, monthDate: matchingMonth, type });
    }
  };

  // Get drill-down details for selected month
  const drillDownDetails = useMemo(() => {
    if (!drillDown) return null;

    const monthStart = startOfMonth(drillDown.monthDate);
    const monthEnd = endOfMonth(drillDown.monthDate);
    const monthEndStr = format(monthEnd, "yyyy-MM-dd");
    const monthStartStr = format(monthStart, "yyyy-MM-dd");

    const getEmployeeName = (employeeId: string) => {
      const emp = employees.find(e => e.id === employeeId);
      return emp?.full_name || emp?.email || "Unknown";
    };

    const getDepartmentName = (departmentId: string) => {
      const dept = departments.find(d => d.id === departmentId);
      return dept?.name || "Unknown";
    };

    const getPositionTitle = (positionId: string) => {
      const pos = positions.find(p => p.id === positionId);
      return pos?.title || "Unknown";
    };

    // Active positions at month end
    const activePositions = filteredPositions.filter(p => {
      const posStart = parseISO(p.start_date);
      const posEnd = p.end_date ? parseISO(p.end_date) : null;
      return posStart <= monthEnd && (!posEnd || posEnd >= monthStart);
    }).map(p => ({
      ...p,
      departmentName: getDepartmentName(p.department_id),
    }));

    // Positions added this month
    const positionsAdded = filteredPositions.filter(p => {
      const posStart = parseISO(p.start_date);
      return isWithinInterval(posStart, { start: monthStart, end: monthEnd });
    }).map(p => ({
      ...p,
      departmentName: getDepartmentName(p.department_id),
    }));

    // Positions removed this month
    const positionsRemoved = filteredPositions.filter(p => {
      if (!p.end_date) return false;
      const posEnd = parseISO(p.end_date);
      return isWithinInterval(posEnd, { start: monthStart, end: monthEnd });
    }).map(p => ({
      ...p,
      departmentName: getDepartmentName(p.department_id),
    }));

    // Active employees at month end
    const activeEmployeePositions = filteredEmployeePositions.filter(ep => {
      const epStart = parseISO(ep.start_date);
      const epEnd = ep.end_date ? parseISO(ep.end_date) : null;
      return epStart <= monthEnd && (!epEnd || epEnd >= monthStart);
    });
    const uniqueActiveEmployees = [...new Set(activeEmployeePositions.map(ep => ep.employee_id))];
    const activeEmployees = uniqueActiveEmployees.map(empId => ({
      id: empId,
      name: getEmployeeName(empId),
      positions: activeEmployeePositions
        .filter(ep => ep.employee_id === empId)
        .map(ep => getPositionTitle(ep.position_id)),
    }));

    // Employee joins this month
    const employeeJoins = filteredEmployeePositions.filter(ep => {
      const epStart = parseISO(ep.start_date);
      return isWithinInterval(epStart, { start: monthStart, end: monthEnd });
    }).map(ep => ({
      id: ep.id,
      employeeId: ep.employee_id,
      employeeName: getEmployeeName(ep.employee_id),
      positionTitle: getPositionTitle(ep.position_id),
      startDate: ep.start_date,
    }));

    // Employee departures this month
    const employeeDepartures = filteredEmployeePositions.filter(ep => {
      if (!ep.end_date) return false;
      const epEnd = parseISO(ep.end_date);
      return isWithinInterval(epEnd, { start: monthStart, end: monthEnd });
    }).map(ep => ({
      id: ep.id,
      employeeId: ep.employee_id,
      employeeName: getEmployeeName(ep.employee_id),
      positionTitle: getPositionTitle(ep.position_id),
      endDate: ep.end_date,
    }));

    return {
      activePositions,
      positionsAdded,
      positionsRemoved,
      activeEmployees,
      employeeJoins,
      employeeDepartures,
    };
  }, [drillDown, filteredPositions, filteredEmployeePositions, employees, departments, positions]);

  // Generate monthly data for charts
  const monthlyData = useMemo(() => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const months = eachMonthOfInterval({ start, end });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      const monthStr = format(month, "yyyy-MM-dd");

      // Count active positions at end of month
      const activePositions = filteredPositions.filter(p => {
        const posStart = parseISO(p.start_date);
        const posEnd = p.end_date ? parseISO(p.end_date) : null;
        return posStart <= monthEnd && (!posEnd || posEnd >= monthStart);
      });

      // Count positions added this month
      const positionsAdded = filteredPositions.filter(p => {
        const posStart = parseISO(p.start_date);
        return isWithinInterval(posStart, { start: monthStart, end: monthEnd });
      });

      // Count positions removed this month
      const positionsRemoved = filteredPositions.filter(p => {
        if (!p.end_date) return false;
        const posEnd = parseISO(p.end_date);
        return isWithinInterval(posEnd, { start: monthStart, end: monthEnd });
      });

      // Count active departments
      const activeDepts = filteredDepartments.filter(d => {
        const deptStart = parseISO(d.start_date);
        const deptEnd = d.end_date ? parseISO(d.end_date) : null;
        return deptStart <= monthEnd && (!deptEnd || deptEnd >= monthStart);
      });

      // Count active employees
      const activeEmployees = filteredEmployeePositions.filter(ep => {
        const epStart = parseISO(ep.start_date);
        const epEnd = ep.end_date ? parseISO(ep.end_date) : null;
        return epStart <= monthEnd && (!epEnd || epEnd >= monthStart);
      });

      // Employee movements (joins)
      const employeeJoins = filteredEmployeePositions.filter(ep => {
        const epStart = parseISO(ep.start_date);
        return isWithinInterval(epStart, { start: monthStart, end: monthEnd });
      });

      // Employee movements (departures)
      const employeeDepartures = filteredEmployeePositions.filter(ep => {
        if (!ep.end_date) return false;
        const epEnd = parseISO(ep.end_date);
        return isWithinInterval(epEnd, { start: monthStart, end: monthEnd });
      });

      return {
        month: format(month, "MMM yyyy"),
        monthShort: format(month, "MMM"),
        activePositions: activePositions.length,
        positionsAdded: positionsAdded.length,
        positionsRemoved: positionsRemoved.length,
        activeDepartments: activeDepts.length,
        activeEmployees: new Set(activeEmployees.map(ep => ep.employee_id)).size,
        employeeJoins: employeeJoins.length,
        employeeDepartures: employeeDepartures.length,
        netChange: positionsAdded.length - positionsRemoved.length,
      };
    });
  }, [filteredPositions, filteredDepartments, filteredEmployeePositions, startDate, endDate]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    if (monthlyData.length === 0) return null;

    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[monthlyData.length - 1];

    const totalPositionsAdded = monthlyData.reduce((sum, m) => sum + m.positionsAdded, 0);
    const totalPositionsRemoved = monthlyData.reduce((sum, m) => sum + m.positionsRemoved, 0);
    const totalEmployeeJoins = monthlyData.reduce((sum, m) => sum + m.employeeJoins, 0);
    const totalEmployeeDepartures = monthlyData.reduce((sum, m) => sum + m.employeeDepartures, 0);

    const positionGrowth = lastMonth.activePositions - firstMonth.activePositions;
    const employeeGrowth = lastMonth.activeEmployees - firstMonth.activeEmployees;

    return {
      totalPositionsAdded,
      totalPositionsRemoved,
      netPositionChange: totalPositionsAdded - totalPositionsRemoved,
      totalEmployeeJoins,
      totalEmployeeDepartures,
      netEmployeeChange: totalEmployeeJoins - totalEmployeeDepartures,
      positionGrowth,
      employeeGrowth,
      currentPositions: lastMonth.activePositions,
      currentEmployees: lastMonth.activeEmployees,
      currentDepartments: lastMonth.activeDepartments,
    };
  }, [monthlyData]);

  // Year-over-Year comparison
  const yoyComparison = useMemo(() => {
    if (!showYoY || monthlyData.length === 0) return null;

    const currentEnd = parseISO(endDate);
    const currentStart = parseISO(startDate);
    const periodLengthMs = currentEnd.getTime() - currentStart.getTime();
    
    // Previous year period
    const prevYearEnd = subYears(currentEnd, 1);
    const prevYearStart = subYears(currentStart, 1);
    const prevYearEndStr = format(prevYearEnd, "yyyy-MM-dd");
    const prevYearStartStr = format(prevYearStart, "yyyy-MM-dd");

    // Get counts for previous year
    const getActiveCount = (items: { start_date: string; end_date: string | null }[], date: string) => {
      return items.filter(item => {
        return item.start_date <= date && (!item.end_date || item.end_date >= date);
      }).length;
    };

    const currentPositions = summaryStats?.currentPositions || 0;
    const currentEmployees = summaryStats?.currentEmployees || 0;
    const currentDepartments = summaryStats?.currentDepartments || 0;

    const prevYearPositions = getActiveCount(filteredPositions, prevYearEndStr);
    const prevYearDepartments = filteredDepartments.filter(d => 
      d.start_date <= prevYearEndStr && (!d.end_date || d.end_date >= prevYearEndStr)
    ).length;
    
    const prevYearEmployeeSet = new Set(
      filteredEmployeePositions
        .filter(ep => ep.start_date <= prevYearEndStr && (!ep.end_date || ep.end_date >= prevYearEndStr))
        .map(ep => ep.employee_id)
    );
    const prevYearEmployees = prevYearEmployeeSet.size;

    const calcGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      positions: {
        current: currentPositions,
        previous: prevYearPositions,
        change: currentPositions - prevYearPositions,
        percentGrowth: calcGrowth(currentPositions, prevYearPositions),
      },
      employees: {
        current: currentEmployees,
        previous: prevYearEmployees,
        change: currentEmployees - prevYearEmployees,
        percentGrowth: calcGrowth(currentEmployees, prevYearEmployees),
      },
      departments: {
        current: currentDepartments,
        previous: prevYearDepartments,
        change: currentDepartments - prevYearDepartments,
        percentGrowth: calcGrowth(currentDepartments, prevYearDepartments),
      },
      prevYearPeriod: `${format(prevYearStart, "MMM yyyy")} - ${format(prevYearEnd, "MMM yyyy")}`,
    };
  }, [showYoY, filteredPositions, filteredDepartments, filteredEmployeePositions, summaryStats, startDate, endDate]);

  // Department breakdown for pie chart
  const departmentBreakdown = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const deptCounts: Record<string, number> = {};

    filteredPositions
      .filter(p => p.start_date <= today && (!p.end_date || p.end_date >= today))
      .forEach(p => {
        const dept = departments.find(d => d.id === p.department_id);
        if (dept) {
          deptCounts[dept.name] = (deptCounts[dept.name] || 0) + 1;
        }
      });

    return Object.entries(deptCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredPositions, departments]);

  const exportReport = () => {
    const selectedDeptName = selectedDepartmentId === "all" 
      ? "All Departments" 
      : departments.find(d => d.id === selectedDepartmentId)?.name || "Unknown";
    
    const csvContent = [
      `Department Filter: ${selectedDeptName}`,
      "",
      ["Month", "Active Positions", "Positions Added", "Positions Removed", "Net Change", "Active Employees", "Employee Joins", "Employee Departures"].join(","),
      ...monthlyData.map(row => [
        row.month,
        row.activePositions,
        row.positionsAdded,
        row.positionsRemoved,
        row.netChange,
        row.activeEmployees,
        row.employeeJoins,
        row.employeeDepartures,
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const deptSuffix = selectedDepartmentId === "all" ? "" : `-${selectedDeptName.replace(/\s+/g, '-').toLowerCase()}`;
    a.download = `org-changes-report${deptSuffix}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  if (isLoading && selectedCompanyId) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Company</Label>
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[160px]"
              />
            </div>
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <div className="flex items-center gap-2">
              <Switch
                id="yoyMode"
                checked={showYoY}
                onCheckedChange={setShowYoY}
              />
              <Label htmlFor="yoyMode" className="text-sm font-medium cursor-pointer">
                Year-over-Year
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* YoY Comparison Section */}
      {showYoY && yoyComparison && selectedCompanyId && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Year-over-Year Comparison
            </CardTitle>
            <CardDescription>
              Comparing current period to {yoyComparison.prevYearPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Positions YoY */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Positions</span>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">{yoyComparison.positions.current}</span>
                    <span className="text-sm text-muted-foreground ml-2">vs {yoyComparison.positions.previous}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${yoyComparison.positions.percentGrowth >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {yoyComparison.positions.percentGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(yoyComparison.positions.percentGrowth).toFixed(1)}%
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {yoyComparison.positions.change >= 0 ? "+" : ""}{yoyComparison.positions.change} positions
                </div>
              </div>

              {/* Employees YoY */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Employees</span>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">{yoyComparison.employees.current}</span>
                    <span className="text-sm text-muted-foreground ml-2">vs {yoyComparison.employees.previous}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${yoyComparison.employees.percentGrowth >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {yoyComparison.employees.percentGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(yoyComparison.employees.percentGrowth).toFixed(1)}%
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {yoyComparison.employees.change >= 0 ? "+" : ""}{yoyComparison.employees.change} employees
                </div>
              </div>

              {/* Departments YoY */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Departments</span>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">{yoyComparison.departments.current}</span>
                    <span className="text-sm text-muted-foreground ml-2">vs {yoyComparison.departments.previous}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${yoyComparison.departments.percentGrowth >= 0 ? "text-green-600" : "text-destructive"}`}>
                    {yoyComparison.departments.change === 0 ? (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    ) : yoyComparison.departments.percentGrowth >= 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {yoyComparison.departments.change === 0 ? "No change" : `${Math.abs(yoyComparison.departments.percentGrowth).toFixed(1)}%`}
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {yoyComparison.departments.change >= 0 ? "+" : ""}{yoyComparison.departments.change} departments
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedCompanyId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Select a company to view organizational changes report
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          {summaryStats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Positions</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.currentPositions}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {summaryStats.positionGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                    )}
                    <span className={summaryStats.positionGrowth >= 0 ? "text-green-500" : "text-destructive"}>
                      {summaryStats.positionGrowth >= 0 ? "+" : ""}{summaryStats.positionGrowth}
                    </span>
                    <span className="ml-1">from period start</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.currentEmployees}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {summaryStats.employeeGrowth >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1 text-destructive" />
                    )}
                    <span className={summaryStats.employeeGrowth >= 0 ? "text-green-500" : "text-destructive"}>
                      {summaryStats.employeeGrowth >= 0 ? "+" : ""}{summaryStats.employeeGrowth}
                    </span>
                    <span className="ml-1">from period start</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Departments</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryStats.currentDepartments}</div>
                  <p className="text-xs text-muted-foreground">Active departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Position Change</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    <span className={summaryStats.netPositionChange >= 0 ? "text-green-500" : "text-destructive"}>
                      {summaryStats.netPositionChange >= 0 ? "+" : ""}{summaryStats.netPositionChange}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      +{summaryStats.totalPositionsAdded} added
                    </Badge>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">
                      -{summaryStats.totalPositionsRemoved} removed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Position Trend */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Position Count Over Time</CardTitle>
                <CardDescription>Click on a data point to see details</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData} onClick={(data) => handleChartClick(data, "positions")}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="monthShort" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="activePositions" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Active Positions"
                      dot={{ fill: "hsl(var(--primary))", cursor: "pointer" }}
                      activeDot={{ r: 8, cursor: "pointer" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Position Changes */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Position Changes</CardTitle>
                <CardDescription>Click on a bar to see details</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData} onClick={(data) => handleChartClick(data, "positionChanges")}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="monthShort" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="positionsAdded" fill="hsl(142, 76%, 36%)" name="Added" cursor="pointer" />
                    <Bar dataKey="positionsRemoved" fill="hsl(var(--destructive))" name="Removed" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Employee Movement */}
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Employee Movement</CardTitle>
                <CardDescription>Click on a bar to see details</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData} onClick={(data) => handleChartClick(data, "employeeMovement")}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="monthShort" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="employeeJoins" fill="hsl(var(--primary))" name="Joined" cursor="pointer" />
                    <Bar dataKey="employeeDepartures" fill="hsl(var(--secondary))" name="Departed" cursor="pointer" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Positions by Department</CardTitle>
                <CardDescription>Current distribution of positions</CardDescription>
              </CardHeader>
              <CardContent>
                {departmentBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No position data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Monthly Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Detailed monthly organizational changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Month</th>
                      <th className="text-right p-2 font-medium">Positions</th>
                      <th className="text-right p-2 font-medium">Added</th>
                      <th className="text-right p-2 font-medium">Removed</th>
                      <th className="text-right p-2 font-medium">Net</th>
                      <th className="text-right p-2 font-medium">Employees</th>
                      <th className="text-right p-2 font-medium">Joins</th>
                      <th className="text-right p-2 font-medium">Departures</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{row.month}</td>
                        <td className="text-right p-2">{row.activePositions}</td>
                        <td className="text-right p-2 text-green-600">+{row.positionsAdded}</td>
                        <td className="text-right p-2 text-destructive">-{row.positionsRemoved}</td>
                        <td className="text-right p-2">
                          <Badge variant={row.netChange >= 0 ? "default" : "destructive"} className={row.netChange >= 0 ? "bg-green-500" : ""}>
                            {row.netChange >= 0 ? "+" : ""}{row.netChange}
                          </Badge>
                        </td>
                        <td className="text-right p-2">{row.activeEmployees}</td>
                        <td className="text-right p-2 text-primary">+{row.employeeJoins}</td>
                        <td className="text-right p-2 text-muted-foreground">-{row.employeeDepartures}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Drill-Down Dialog */}
      <Dialog open={!!drillDown} onOpenChange={(open) => !open && setDrillDown(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Details for {drillDown?.month}
            </DialogTitle>
            <DialogDescription>
              {drillDown?.type === "positions" && "Active positions and employee assignments"}
              {drillDown?.type === "positionChanges" && "Position additions and removals"}
              {drillDown?.type === "employeeMovement" && "Employee joins and departures"}
              {drillDown?.type === "employees" && "Employee details"}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            {drillDownDetails && (
              <Tabs defaultValue={
                drillDown?.type === "positions" ? "activePositions" :
                drillDown?.type === "positionChanges" ? "added" :
                drillDown?.type === "employeeMovement" ? "joins" : "activePositions"
              }>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activePositions" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Positions ({drillDownDetails.activePositions.length})
                  </TabsTrigger>
                  <TabsTrigger value="added" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Added ({drillDownDetails.positionsAdded.length})
                  </TabsTrigger>
                  <TabsTrigger value="joins" className="flex items-center gap-1">
                    <UserPlus className="h-3 w-3" />
                    Joins ({drillDownDetails.employeeJoins.length})
                  </TabsTrigger>
                  <TabsTrigger value="departures" className="flex items-center gap-1">
                    <UserMinus className="h-3 w-3" />
                    Departures ({drillDownDetails.employeeDepartures.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activePositions" className="mt-4">
                  {drillDownDetails.activePositions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position Title</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drillDownDetails.activePositions.map((pos) => (
                          <TableRow key={pos.id}>
                            <TableCell className="font-medium">{pos.title}</TableCell>
                            <TableCell>{pos.departmentName}</TableCell>
                            <TableCell>{format(parseISO(pos.start_date), "MMM d, yyyy")}</TableCell>
                            <TableCell>{pos.end_date ? format(parseISO(pos.end_date), "MMM d, yyyy") : "Active"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No active positions for this month
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="added" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Positions Added ({drillDownDetails.positionsAdded.length})
                      </h4>
                      {drillDownDetails.positionsAdded.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Position Title</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Start Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {drillDownDetails.positionsAdded.map((pos) => (
                              <TableRow key={pos.id}>
                                <TableCell className="font-medium">{pos.title}</TableCell>
                                <TableCell>{pos.departmentName}</TableCell>
                                <TableCell>{format(parseISO(pos.start_date), "MMM d, yyyy")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No positions added this month
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-destructive" />
                        Positions Removed ({drillDownDetails.positionsRemoved.length})
                      </h4>
                      {drillDownDetails.positionsRemoved.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Position Title</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>End Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {drillDownDetails.positionsRemoved.map((pos) => (
                              <TableRow key={pos.id}>
                                <TableCell className="font-medium">{pos.title}</TableCell>
                                <TableCell>{pos.departmentName}</TableCell>
                                <TableCell>{pos.end_date ? format(parseISO(pos.end_date), "MMM d, yyyy") : "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No positions removed this month
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="joins" className="mt-4">
                  {drillDownDetails.employeeJoins.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Join Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drillDownDetails.employeeJoins.map((emp) => (
                          <TableRow key={emp.id}>
                            <TableCell className="font-medium">{emp.employeeName}</TableCell>
                            <TableCell>{emp.positionTitle}</TableCell>
                            <TableCell>{format(parseISO(emp.startDate), "MMM d, yyyy")}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No employees joined this month
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="departures" className="mt-4">
                  {drillDownDetails.employeeDepartures.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee Name</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Departure Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drillDownDetails.employeeDepartures.map((emp) => (
                          <TableRow key={emp.id}>
                            <TableCell className="font-medium">{emp.employeeName}</TableCell>
                            <TableCell>{emp.positionTitle}</TableCell>
                            <TableCell>{emp.endDate ? format(parseISO(emp.endDate), "MMM d, yyyy") : "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No employees departed this month
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
