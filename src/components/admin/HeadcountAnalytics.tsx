import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Users, BarChart3 } from "lucide-react";
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
    <div className="space-y-6">
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
