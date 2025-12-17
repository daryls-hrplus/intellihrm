import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  Calendar, Building2, TrendingUp, TrendingDown, Users, Clock, 
  CalendarDays, AlertTriangle, CheckCircle, XCircle, Loader2
} from "lucide-react";
import { format, startOfYear, endOfYear, parseISO, getMonth, subYears } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";
import { AIModuleReportBuilder } from "@/components/shared/AIModuleReportBuilder";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 65%, 60%)",
  "hsl(340, 75%, 55%)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function LeaveAnalyticsPage() {
  const { t } = useLanguage();
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);

  // Analytics data
  const [leaveByType, setLeaveByType] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [departmentUsage, setDepartmentUsage] = useState<any[]>([]);
  const [balanceDistribution, setBalanceDistribution] = useState<any[]>([]);
  const [yearOverYear, setYearOverYear] = useState<any[]>([]);
  const [peakPeriods, setPeakPeriods] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    totalRequests: 0,
    approvalRate: 0,
    avgDaysPerRequest: 0,
    pendingRequests: 0,
    utilizationRate: 0,
    avgProcessingTime: 0,
  });

  // Fetch companies
  useEffect(() => {
    if (isAdminOrHR) {
      supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data);
        });
    }
  }, [isAdminOrHR]);

  // Set default company
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id, selectedCompanyId]);

  // Fetch departments when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setDepartments(data);
        });
    }
  }, [selectedCompanyId]);

  // Fetch analytics data
  useEffect(() => {
    if (selectedCompanyId) {
      fetchAnalyticsData();
    }
  }, [selectedCompanyId, selectedDepartmentId, selectedYear]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    const year = parseInt(selectedYear);
    const startDate = format(startOfYear(new Date(year, 0, 1)), "yyyy-MM-dd");
    const endDate = format(endOfYear(new Date(year, 0, 1)), "yyyy-MM-dd");
    const prevYearStart = format(startOfYear(subYears(new Date(year, 0, 1), 1)), "yyyy-MM-dd");
    const prevYearEnd = format(endOfYear(subYears(new Date(year, 0, 1), 1)), "yyyy-MM-dd");

    try {
      // Build employee filter based on department
      let employeeIds: string[] = [];
      if (selectedDepartmentId !== "all") {
        const { data: positions } = await supabase
          .from("positions")
          .select("id")
          .eq("department_id", selectedDepartmentId);
        
        if (positions && positions.length > 0) {
          const { data: empPositions } = await supabase
            .from("employee_positions")
            .select("employee_id")
            .in("position_id", positions.map(p => p.id))
            .eq("is_active", true);
          
          employeeIds = empPositions?.map(ep => ep.employee_id) || [];
        }
      }

      // Fetch leave requests - using type assertion to avoid deep type instantiation
      const requestsResult = await (supabase
        .from("leave_requests")
        .select("*, leave_types(*), profiles!leave_requests_employee_id_fkey(*)") as any)
        .eq("company_id", selectedCompanyId)
        .gte("start_date", startDate)
        .lte("start_date", endDate);

      // Previous year requests
      const prevRequestsResult = await (supabase
        .from("leave_requests")
        .select("*, leave_types(*)") as any)
        .eq("company_id", selectedCompanyId)
        .gte("start_date", prevYearStart)
        .lte("start_date", prevYearEnd);

      // Fetch leave balances
      const balancesResult = await (supabase
        .from("leave_balances")
        .select("*, leave_types(*)") as any)
        .eq("company_id", selectedCompanyId)
        .eq("year", year);

      // Map data to expected format
      const mappedRequests = (requestsResult.data || []).map((r: any) => ({
        ...r,
        leave_type: r.leave_types,
        employee: r.profiles
      }));

      const mappedPrevRequests = (prevRequestsResult.data || []).map((r: any) => ({
        ...r,
        leave_type: r.leave_types
      }));

      const mappedBalances = (balancesResult.data || []).map((b: any) => ({
        ...b,
        leave_type: b.leave_types
      }));

      // Process data
      processLeaveByType(mappedRequests);
      processMonthlyTrends(mappedRequests);
      processStatusDistribution(mappedRequests);
      processDepartmentUsage(mappedRequests);
      processBalanceDistribution(mappedBalances);
      processYearOverYear(mappedRequests, mappedPrevRequests, year);
      processPeakPeriods(mappedRequests);
      calculateKPIs(mappedRequests, mappedBalances);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processLeaveByType = (requests: any[]) => {
    const byType: Record<string, { name: string; count: number; days: number }> = {};
    requests.forEach(r => {
      const typeName = r.leave_type?.name || "Unknown";
      if (!byType[typeName]) {
        byType[typeName] = { name: typeName, count: 0, days: 0 };
      }
      byType[typeName].count++;
      byType[typeName].days += r.total_days || 0;
    });
    setLeaveByType(Object.values(byType).sort((a, b) => b.days - a.days));
  };

  const processMonthlyTrends = (requests: any[]) => {
    const monthly = MONTHS.map((month, index) => ({
      month,
      requests: 0,
      days: 0,
      approved: 0,
      rejected: 0,
    }));

    requests.forEach(r => {
      const monthIndex = getMonth(parseISO(r.start_date));
      monthly[monthIndex].requests++;
      monthly[monthIndex].days += r.total_days || 0;
      if (r.status === "approved") monthly[monthIndex].approved++;
      if (r.status === "rejected") monthly[monthIndex].rejected++;
    });

    setMonthlyTrends(monthly);
  };

  const processStatusDistribution = (requests: any[]) => {
    const statusMap: Record<string, number> = {};
    requests.forEach(r => {
      statusMap[r.status] = (statusMap[r.status] || 0) + 1;
    });
    setStatusDistribution(
      Object.entries(statusMap).map(([name, value]) => ({ name, value }))
    );
  };

  const processDepartmentUsage = (requests: any[]) => {
    // Group by employee and show top users
    const byEmployee: Record<string, { name: string; days: number; requests: number }> = {};
    requests.forEach(r => {
      const empName = r.employee?.full_name || "Unknown";
      const empId = r.employee?.id || "unknown";
      if (!byEmployee[empId]) {
        byEmployee[empId] = { name: empName, days: 0, requests: 0 };
      }
      byEmployee[empId].days += r.total_days || 0;
      byEmployee[empId].requests++;
    });
    setDepartmentUsage(
      Object.values(byEmployee)
        .sort((a, b) => b.days - a.days)
        .slice(0, 10)
    );
  };

  const processBalanceDistribution = (balances: any[]) => {
    const ranges = [
      { range: "0-5 days", min: 0, max: 5, count: 0 },
      { range: "6-10 days", min: 6, max: 10, count: 0 },
      { range: "11-15 days", min: 11, max: 15, count: 0 },
      { range: "16-20 days", min: 16, max: 20, count: 0 },
      { range: "21+ days", min: 21, max: Infinity, count: 0 },
    ];

    balances.forEach(b => {
      const balance = b.balance || 0;
      const range = ranges.find(r => balance >= r.min && balance <= r.max);
      if (range) range.count++;
    });

    setBalanceDistribution(ranges);
  };

  const processYearOverYear = (currentRequests: any[], prevRequests: any[], year: number) => {
    const currentByMonth = MONTHS.map(() => 0);
    const prevByMonth = MONTHS.map(() => 0);

    currentRequests.forEach(r => {
      const monthIndex = getMonth(parseISO(r.start_date));
      currentByMonth[monthIndex] += r.total_days || 0;
    });

    prevRequests.forEach(r => {
      const monthIndex = getMonth(parseISO(r.start_date));
      prevByMonth[monthIndex] += r.total_days || 0;
    });

    setYearOverYear(
      MONTHS.map((month, index) => ({
        month,
        [year]: currentByMonth[index],
        [year - 1]: prevByMonth[index],
      }))
    );
  };

  const processPeakPeriods = (requests: any[]) => {
    const dailyCounts: Record<string, number> = {};
    requests.forEach(r => {
      const date = r.start_date;
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const peaks = Object.entries(dailyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([date, count]) => ({
        date: format(parseISO(date), "MMM d, yyyy"),
        requests: count,
      }));

    setPeakPeriods(peaks);
  };

  const calculateKPIs = (requests: any[], balances: any[]) => {
    const total = requests.length;
    const approved = requests.filter(r => r.status === "approved").length;
    const pending = requests.filter(r => r.status === "pending").length;
    const totalDays = requests.reduce((sum, r) => sum + (r.total_days || 0), 0);
    
    // Calculate utilization (used / total entitled)
    const totalBalance = balances.reduce((sum, b) => sum + (b.balance || 0), 0);
    const totalUsed = balances.reduce((sum, b) => sum + (b.used || 0), 0);
    const utilization = totalBalance + totalUsed > 0 
      ? (totalUsed / (totalBalance + totalUsed)) * 100 
      : 0;

    // Calculate avg processing time (days between created and approved)
    const processedRequests = requests.filter(r => r.approved_at && r.created_at);
    let avgProcessing = 0;
    if (processedRequests.length > 0) {
      const totalProcessingDays = processedRequests.reduce((sum, r) => {
        const created = new Date(r.created_at);
        const approved = new Date(r.approved_at);
        return sum + Math.max(0, (approved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      }, 0);
      avgProcessing = totalProcessingDays / processedRequests.length;
    }

    setKpis({
      totalRequests: total,
      approvalRate: total > 0 ? (approved / total) * 100 : 0,
      avgDaysPerRequest: total > 0 ? totalDays / total : 0,
      pendingRequests: pending,
      utilizationRate: utilization,
      avgProcessingTime: avgProcessing,
    });
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: t("navigation.leave"), href: "/leave" },
          { label: t("leave.analytics.title") }
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("leave.analytics.title")}</h1>
            <p className="text-muted-foreground">{t("leave.analytics.subtitle")}</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdminOrHR && companies.length > 1 && (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t("common.company")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
              <SelectTrigger className="w-[160px]">
                <Users className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t("leave.analytics.department")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("leave.analytics.allDepartments")}</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <CalendarDays className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.totalRequests")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.totalRequests}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.approvalRate")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">{kpis.approvalRate.toFixed(1)}%</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.avgDaysPerRequest")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.avgDaysPerRequest.toFixed(1)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.pending")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-amber-600">{kpis.pendingRequests}</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.utilizationRate")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{kpis.utilizationRate.toFixed(1)}%</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.avgProcessing")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpis.avgProcessingTime.toFixed(1)} {t("leave.analytics.days")}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="flex-wrap">
                <TabsTrigger value="overview">{t("leave.analytics.overview")}</TabsTrigger>
                <TabsTrigger value="trends">{t("leave.analytics.trends")}</TabsTrigger>
                <TabsTrigger value="distribution">{t("leave.analytics.distribution")}</TabsTrigger>
                <TabsTrigger value="comparison">{t("leave.analytics.yearComparison")}</TabsTrigger>
                <TabsTrigger value="ai-banded">AI Banded Reports</TabsTrigger>
                <TabsTrigger value="ai-bi">AI BI Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Leave by Type */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("leave.analytics.leaveByType")}</CardTitle>
                      <CardDescription>{t("leave.analytics.leaveByTypeDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={leaveByType} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="days" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("leave.analytics.statusDistribution")}</CardTitle>
                      <CardDescription>{t("leave.analytics.statusDistributionDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {statusDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Leave Users */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("leave.analytics.topEmployees")}</CardTitle>
                    <CardDescription>{t("leave.analytics.topEmployeesDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={departmentUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="days" name={t("leave.analytics.days")} fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="requests" name={t("leave.analytics.requests")} fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                {/* Monthly Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("leave.analytics.monthlyTrends")}</CardTitle>
                    <CardDescription>{t("leave.analytics.monthlyTrendsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <AreaChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="days" name={t("leave.analytics.days")} stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                        <Area yAxisId="right" type="monotone" dataKey="requests" name={t("leave.analytics.requests")} stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Approval vs Rejection */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("leave.analytics.monthlyTrends")}</CardTitle>
                    <CardDescription>{t("leave.analytics.monthlyTrendsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="approved" name={t("leave.analytics.approved")} fill="hsl(var(--success))" stackId="a" />
                        <Bar dataKey="rejected" name={t("leave.analytics.rejected")} fill="hsl(var(--destructive))" stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Peak Periods */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("leave.analytics.peakPeriods")}</CardTitle>
                    <CardDescription>{t("leave.analytics.peakPeriodsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-5">
                      {peakPeriods.map((peak, index) => (
                        <div key={peak.date} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{peak.date}</p>
                            <p className="text-xs text-muted-foreground">{peak.requests} {t("leave.analytics.requests").toLowerCase()}</p>
                          </div>
                          {index < 3 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="distribution" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Balance Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("leave.analytics.balanceDistribution")}</CardTitle>
                      <CardDescription>{t("leave.analytics.balanceDistributionDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={balanceDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" name={t("leave.analytics.employees")} fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Leave Type Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("leave.analytics.leaveByType")}</CardTitle>
                      <CardDescription>{t("leave.analytics.leaveByTypeDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={leaveByType}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="count"
                            label={({ name, count }) => `${name}: ${count}`}
                          >
                            {leaveByType.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("leave.analytics.yearOverYear")}</CardTitle>
                    <CardDescription>{t("leave.analytics.yearOverYearDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={yearOverYear}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={parseInt(selectedYear)} name={selectedYear} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey={parseInt(selectedYear) - 1} name={(parseInt(selectedYear) - 1).toString()} stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* YoY Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  {(() => {
                    const currentTotal = yearOverYear.reduce((sum, m) => sum + (m[parseInt(selectedYear)] || 0), 0);
                    const prevTotal = yearOverYear.reduce((sum, m) => sum + (m[parseInt(selectedYear) - 1] || 0), 0);
                    const change = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
                    const isIncrease = change > 0;

                    return (
                      <>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{selectedYear} {t("common.total")} {t("leave.analytics.days")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{currentTotal.toFixed(1)}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{parseInt(selectedYear) - 1} {t("common.total")} {t("leave.analytics.days")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{prevTotal.toFixed(1)}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t("leave.analytics.yearOverYear")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold ${isIncrease ? "text-amber-600" : "text-green-600"}`}>
                                {isIncrease ? "+" : ""}{change.toFixed(1)}%
                              </span>
                              {isIncrease ? (
                                <TrendingUp className="h-5 w-5 text-amber-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              </TabsContent>

              <TabsContent value="ai-banded">
                <AIModuleReportBuilder reportType="banded" moduleName="leave" companyId={selectedCompanyId} />
              </TabsContent>

              <TabsContent value="ai-bi">
                <AIModuleReportBuilder reportType="bi" moduleName="leave" companyId={selectedCompanyId} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
