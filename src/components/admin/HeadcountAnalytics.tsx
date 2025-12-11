import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, TrendingUp, TrendingDown, Users, BarChart3, Download, FileText, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface HeadcountAnalyticsProps {
  companyId: string;
}

interface MonthlyData {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
  netChange: number;
}

interface DepartmentData {
  name: string;
  authorized: number;
  filled: number;
  vacancies: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

export function HeadcountAnalytics({ companyId }: HeadcountAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [summary, setSummary] = useState({
    totalAuthorized: 0,
    totalFilled: 0,
    totalVacancies: 0,
    approvalRate: 0,
    avgProcessingDays: 0,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  // Export to CSV
  const exportToCSV = (type: "summary" | "monthly" | "department" | "all") => {
    let csvContent = "";
    const date = format(new Date(), "yyyy-MM-dd");

    if (type === "summary" || type === "all") {
      csvContent += "HEADCOUNT SUMMARY REPORT\n";
      csvContent += `Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}\n\n`;
      csvContent += "Metric,Value\n";
      csvContent += `Total Authorized,${summary.totalAuthorized}\n`;
      csvContent += `Total Filled,${summary.totalFilled}\n`;
      csvContent += `Open Vacancies,${summary.totalVacancies}\n`;
      csvContent += `Fill Rate,${summary.totalAuthorized > 0 ? Math.round((summary.totalFilled / summary.totalAuthorized) * 100) : 0}%\n`;
      csvContent += `Approval Rate,${summary.approvalRate}%\n`;
      csvContent += `Avg Processing Days,${summary.avgProcessingDays}\n`;
      csvContent += "\n";
    }

    if (type === "monthly" || type === "all") {
      csvContent += "MONTHLY HEADCOUNT REQUESTS\n";
      csvContent += "Month,Approved,Rejected,Pending,Net Change\n";
      monthlyData.forEach(m => {
        csvContent += `${m.month},${m.approved},${m.rejected},${m.pending},${m.netChange}\n`;
      });
      csvContent += "\n";
    }

    if (type === "department" || type === "all") {
      csvContent += "HEADCOUNT BY DEPARTMENT\n";
      csvContent += "Department,Authorized,Filled,Vacancies\n";
      departmentData.forEach(d => {
        csvContent += `"${d.name}",${d.authorized},${d.filled},${d.vacancies}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `headcount-report-${type}-${date}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`CSV exported successfully`);
  };

  // Export to PDF (using print)
  const exportToPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Headcount Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
          .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .summary-card h3 { margin: 0 0 5px 0; font-size: 14px; color: #666; }
          .summary-card .value { font-size: 24px; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>Headcount Analytics Report</h1>
        <p>Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
        
        <h2>Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Total Authorized</h3>
            <div class="value">${summary.totalAuthorized}</div>
          </div>
          <div class="summary-card">
            <h3>Filled Positions</h3>
            <div class="value">${summary.totalFilled} (${summary.totalAuthorized > 0 ? Math.round((summary.totalFilled / summary.totalAuthorized) * 100) : 0}%)</div>
          </div>
          <div class="summary-card">
            <h3>Open Vacancies</h3>
            <div class="value">${summary.totalVacancies}</div>
          </div>
          <div class="summary-card">
            <h3>Approval Rate</h3>
            <div class="value">${summary.approvalRate}%</div>
          </div>
        </div>
        
        <h2>Monthly Headcount Requests (Last 6 Months)</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Pending</th>
              <th>Net Change</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyData.map(m => `
              <tr>
                <td>${m.month}</td>
                <td>${m.approved}</td>
                <td>${m.rejected}</td>
                <td>${m.pending}</td>
                <td>${m.netChange > 0 ? '+' : ''}${m.netChange}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Headcount by Department</h2>
        <table>
          <thead>
            <tr>
              <th>Department</th>
              <th>Authorized</th>
              <th>Filled</th>
              <th>Vacancies</th>
              <th>Fill Rate</th>
            </tr>
          </thead>
          <tbody>
            ${departmentData.map(d => `
              <tr>
                <td>${d.name}</td>
                <td>${d.authorized}</td>
                <td>${d.filled}</td>
                <td>${d.vacancies}</td>
                <td>${d.authorized > 0 ? Math.round((d.filled / d.authorized) * 100) : 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>This report was automatically generated from the HRIS system.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success("PDF export opened in new window");
    } else {
      toast.error("Please allow popups to export PDF");
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchAnalytics();
    }
  }, [companyId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Get departments for this company
      const { data: departments, error: deptError } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId);

      if (deptError) throw deptError;
      const deptIds = (departments || []).map(d => d.id);

      if (deptIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Get positions and their headcount
      const { data: positions, error: posError } = await supabase
        .from("positions")
        .select(`
          id, title, authorized_headcount, department_id,
          department:departments(name)
        `)
        .in("department_id", deptIds)
        .eq("is_active", true);

      if (posError) throw posError;

      // Get employee positions (filled)
      const posIds = (positions || []).map(p => p.id);
      const { data: employeePositions, error: epError } = await supabase
        .from("employee_positions")
        .select("position_id")
        .in("position_id", posIds)
        .eq("is_active", true);

      if (epError) throw epError;

      // Calculate department data
      const deptMap = new Map<string, DepartmentData>();
      (positions || []).forEach(pos => {
        const deptName = (pos.department as any)?.name || "Unknown";
        const existing = deptMap.get(deptName) || { name: deptName, authorized: 0, filled: 0, vacancies: 0 };
        existing.authorized += pos.authorized_headcount;
        deptMap.set(deptName, existing);
      });

      // Count filled positions
      (employeePositions || []).forEach(ep => {
        const pos = (positions || []).find(p => p.id === ep.position_id);
        if (pos) {
          const deptName = (pos.department as any)?.name || "Unknown";
          const existing = deptMap.get(deptName);
          if (existing) {
            existing.filled += 1;
          }
        }
      });

      // Calculate vacancies
      deptMap.forEach(dept => {
        dept.vacancies = dept.authorized - dept.filled;
      });

      setDepartmentData(Array.from(deptMap.values()).sort((a, b) => b.authorized - a.authorized));

      // Get headcount requests for trends
      const { data: requests, error: reqError } = await supabase
        .from("headcount_requests")
        .select("*")
        .in("position_id", posIds)
        .order("created_at", { ascending: true });

      if (reqError) throw reqError;

      // Calculate monthly trends (last 6 months)
      const months: MonthlyData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        const monthLabel = format(date, "MMM yyyy");

        const monthRequests = (requests || []).filter(r => {
          const created = new Date(r.created_at);
          return created >= monthStart && created <= monthEnd;
        });

        const approved = monthRequests.filter(r => r.status === "approved");
        const netChange = approved.reduce((sum, r) => sum + (r.requested_headcount - r.current_headcount), 0);

        months.push({
          month: monthLabel,
          approved: approved.length,
          rejected: monthRequests.filter(r => r.status === "rejected").length,
          pending: monthRequests.filter(r => r.status === "pending").length,
          netChange,
        });
      }
      setMonthlyData(months);

      // Calculate summary stats
      const totalAuthorized = Array.from(deptMap.values()).reduce((sum, d) => sum + d.authorized, 0);
      const totalFilled = Array.from(deptMap.values()).reduce((sum, d) => sum + d.filled, 0);
      const totalRequests = (requests || []).length;
      const approvedCount = (requests || []).filter(r => r.status === "approved").length;
      const rejectedCount = (requests || []).filter(r => r.status === "rejected").length;

      // Calculate average processing time for completed requests
      const completedRequests = (requests || []).filter(r => r.reviewed_at);
      let avgDays = 0;
      if (completedRequests.length > 0) {
        const totalDays = completedRequests.reduce((sum, r) => {
          const created = new Date(r.created_at);
          const reviewed = new Date(r.reviewed_at!);
          return sum + (reviewed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgDays = totalDays / completedRequests.length;
      }

      setSummary({
        totalAuthorized,
        totalFilled,
        totalVacancies: totalAuthorized - totalFilled,
        approvalRate: totalRequests > 0 ? Math.round((approvedCount / (approvedCount + rejectedCount)) * 100) || 0 : 0,
        avgProcessingDays: Math.round(avgDays * 10) / 10,
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const requestStatusData = [
    { name: "Approved", value: monthlyData.reduce((sum, m) => sum + m.approved, 0) },
    { name: "Rejected", value: monthlyData.reduce((sum, m) => sum + m.rejected, 0) },
    { name: "Pending", value: monthlyData.reduce((sum, m) => sum + m.pending, 0) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6" ref={reportRef}>
      {/* Header with Export Options */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Headcount Analytics
          </h3>
          <p className="text-sm text-muted-foreground">
            Analyze headcount trends, requests, and department distribution
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV("all")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export All Data (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV("summary")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Summary (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV("monthly")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Monthly Data (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV("department")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Department Data (CSV)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Authorized</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAuthorized}</div>
            <p className="text-xs text-muted-foreground">
              positions authorized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled Positions</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalFilled}</div>
            <p className="text-xs text-muted-foreground">
              {summary.totalAuthorized > 0 
                ? `${Math.round((summary.totalFilled / summary.totalAuthorized) * 100)}% fill rate`
                : "No positions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Vacancies</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalVacancies}</div>
            <p className="text-xs text-muted-foreground">
              positions to fill
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              avg {summary.avgProcessingDays} days to process
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Headcount Requests Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount Requests Trend</CardTitle>
            <CardDescription>Monthly approved vs rejected requests (last 6 months)</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.some(m => m.approved > 0 || m.rejected > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="approved" 
                    stackId="1"
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.6}
                    name="Approved"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rejected" 
                    stackId="1"
                    stroke="hsl(var(--destructive))" 
                    fill="hsl(var(--destructive))" 
                    fillOpacity={0.6}
                    name="Rejected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No request data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Headcount Change */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Headcount Change</CardTitle>
            <CardDescription>Monthly net change from approved requests</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.some(m => m.netChange !== 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="netChange" 
                    name="Net Change"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No headcount changes recorded
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Department Headcount */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by Department</CardTitle>
            <CardDescription>Authorized vs filled positions per department</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="filled" 
                    name="Filled"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar 
                    dataKey="vacancies" 
                    name="Vacancies"
                    fill="hsl(var(--muted-foreground))"
                    fillOpacity={0.5}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No department data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Status Distribution</CardTitle>
            <CardDescription>All-time request outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            {requestStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={requestStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {requestStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No requests submitted yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
