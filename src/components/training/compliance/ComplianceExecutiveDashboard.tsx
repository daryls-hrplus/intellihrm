import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, 
  Download, Users, BarChart3, PieChart, Activity
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface ComplianceExecutiveDashboardProps {
  companyId: string;
}

interface DepartmentCompliance {
  department: string;
  departmentId: string;
  total: number;
  completed: number;
  overdue: number;
  complianceRate: number;
}

interface MonthlyTrend {
  month: string;
  complianceRate: number;
  completions: number;
  overdueCount: number;
}

interface RegulatoryBreakdown {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export function ComplianceExecutiveDashboard({ companyId }: ComplianceExecutiveDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("6m");
  const [departmentData, setDepartmentData] = useState<DepartmentCompliance[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [regulatoryBreakdown, setRegulatoryBreakdown] = useState<RegulatoryBreakdown[]>([]);
  const [orgStats, setOrgStats] = useState({
    totalEmployees: 0,
    totalAssignments: 0,
    overallComplianceRate: 0,
    overdueCount: 0,
    escalatedCount: 0,
    exemptedCount: 0,
    trendDirection: "up" as "up" | "down"
  });

  useEffect(() => {
    loadExecutiveData();
  }, [companyId, dateRange]);

  const loadExecutiveData = async () => {
    setLoading(true);
    try {
      // Get all assignments with department info
      // @ts-ignore - Supabase type instantiation issue
      const { data: assignments } = await supabase
        .from("compliance_training_assignments")
        .select(`
          id, 
          status, 
          due_date, 
          completed_at,
          escalation_level,
          exemption_status,
          employee:profiles!compliance_training_assignments_employee_id_fkey(
            id,
            department_id
          ),
          compliance:compliance_training(
            name,
            regulatory_body
          )
        `);

      // @ts-ignore - Supabase type instantiation issue
      const { data: departments } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId);

      // @ts-ignore - Supabase type instantiation issue
      const { data: employees } = await supabase
        .from("profiles")
        .select("id")
        .eq("company_id", companyId)
        .eq("employment_status", "active");

      const deptMap = new Map(departments?.map(d => [d.id, d.name]) || []);

      // Calculate department-level metrics
      const deptStats = new Map<string, { total: number; completed: number; overdue: number }>();
      
      assignments?.forEach(a => {
        const deptId = a.employee?.department_id;
        if (!deptId) return;
        
        const current = deptStats.get(deptId) || { total: 0, completed: 0, overdue: 0 };
        current.total++;
        if (a.status === "completed") current.completed++;
        if (a.status !== "completed" && new Date(a.due_date) < new Date()) current.overdue++;
        deptStats.set(deptId, current);
      });

      const deptCompliance: DepartmentCompliance[] = Array.from(deptStats.entries())
        .map(([deptId, stats]) => ({
          departmentId: deptId,
          department: deptMap.get(deptId) || "Unknown",
          ...stats,
          complianceRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100
        }))
        .sort((a, b) => a.complianceRate - b.complianceRate);

      setDepartmentData(deptCompliance);

      // Calculate monthly trends
      const months = parseInt(dateRange.replace("m", ""));
      const trends: MonthlyTrend[] = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(monthStart);
        
        const monthAssignments = assignments?.filter(a => {
          const dueDate = new Date(a.due_date);
          return dueDate >= monthStart && dueDate <= monthEnd;
        }) || [];

        const completed = monthAssignments.filter(a => a.status === "completed").length;
        const overdue = monthAssignments.filter(a => 
          a.status !== "completed" && new Date(a.due_date) < new Date()
        ).length;

        trends.push({
          month: format(monthStart, "MMM"),
          complianceRate: monthAssignments.length > 0 
            ? Math.round((completed / monthAssignments.length) * 100) 
            : 100,
          completions: completed,
          overdueCount: overdue
        });
      }
      setMonthlyTrends(trends);

      // Calculate regulatory breakdown
      const regStats = new Map<string, number>();
      assignments?.forEach(a => {
        const body = a.compliance?.regulatory_body || "General";
        regStats.set(body, (regStats.get(body) || 0) + 1);
      });

      const regBreakdown: RegulatoryBreakdown[] = Array.from(regStats.entries())
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }));
      setRegulatoryBreakdown(regBreakdown);

      // Calculate org-wide stats
      const totalAssignments = assignments?.length || 0;
      const completedTotal = assignments?.filter(a => a.status === "completed").length || 0;
      const overdueTotal = assignments?.filter(a => 
        a.status !== "completed" && new Date(a.due_date) < new Date()
      ).length || 0;
      const escalatedTotal = assignments?.filter(a => 
        (a.escalation_level || 0) > 0
      ).length || 0;
      const exemptedTotal = assignments?.filter(a => 
        a.exemption_status === "approved"
      ).length || 0;

      // Determine trend direction
      const recentRate = trends.length > 0 ? trends[trends.length - 1].complianceRate : 0;
      const previousRate = trends.length > 1 ? trends[trends.length - 2].complianceRate : 0;

      setOrgStats({
        totalEmployees: employees?.length || 0,
        totalAssignments,
        overallComplianceRate: totalAssignments > 0 
          ? Math.round((completedTotal / totalAssignments) * 100) 
          : 100,
        overdueCount: overdueTotal,
        escalatedCount: escalatedTotal,
        exemptedCount: exemptedTotal,
        trendDirection: recentRate >= previousRate ? "up" : "down"
      });

    } catch (error) {
      console.error("Failed to load executive data:", error);
    }
    setLoading(false);
  };

  const exportReport = () => {
    // Generate CSV export
    const headers = ["Department", "Total", "Completed", "Overdue", "Compliance Rate"];
    const rows = departmentData.map(d => 
      [d.department, d.total, d.completed, d.overdue, `${d.complianceRate}%`].join(",")
    );
    
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compliance-executive-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="p-4">Loading executive dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range & Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Executive Compliance Overview</h2>
          <p className="text-muted-foreground">Organization-wide compliance metrics and trends</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="12m">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{orgStats.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold">{orgStats.totalAssignments}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Rate</p>
                <p className="text-2xl font-bold">{orgStats.overallComplianceRate}%</p>
              </div>
              {orgStats.trendDirection === "up" ? (
                <TrendingUp className="h-8 w-8 text-green-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{orgStats.overdueCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalated</p>
                <p className="text-2xl font-bold text-yellow-600">{orgStats.escalatedCount}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exempted</p>
                <p className="text-2xl font-bold">{orgStats.exemptedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Compliance Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Area 
                  type="monotone" 
                  dataKey="complianceRate" 
                  stroke="#10b981" 
                  fill="#10b98133"
                  name="Compliance Rate"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regulatory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Training by Regulatory Body
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={regulatoryBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {regulatoryBreakdown.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Compliance Breakdown
          </CardTitle>
          <CardDescription>Compliance status across all departments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="department" width={150} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar 
                dataKey="complianceRate" 
                fill="#10b981" 
                name="Compliance Rate"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentData.map((dept) => (
              <div key={dept.departmentId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.total} assignments
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium text-green-600">{dept.completed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="font-medium text-destructive">{dept.overdue}</p>
                  </div>
                  <div className="w-32">
                    <Progress value={dept.complianceRate} className="h-2" />
                    <p className="text-sm text-center mt-1">{dept.complianceRate}%</p>
                  </div>
                  <Badge 
                    variant={dept.complianceRate >= 90 ? "default" : dept.complianceRate >= 70 ? "secondary" : "destructive"}
                    className={dept.complianceRate >= 90 ? "bg-green-600" : ""}
                  >
                    {dept.complianceRate >= 90 ? "On Track" : dept.complianceRate >= 70 ? "At Risk" : "Critical"}
                  </Badge>
                </div>
              </div>
            ))}

            {departmentData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No department data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
