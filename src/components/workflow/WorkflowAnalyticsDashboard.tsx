import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, AlertTriangle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format, subDays, differenceInHours } from "date-fns";

interface WorkflowMetrics {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  avgCompletionHours: number;
  slaComplianceRate: number;
  bottlenecks: { stepName: string; avgHours: number }[];
  trendsData: { date: string; submitted: number; completed: number }[];
  approverPerformance: { approverName: string; approved: number; rejected: number; avgHours: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function WorkflowAnalyticsDashboard() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics>({
    totalSubmitted: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalPending: 0,
    avgCompletionHours: 0,
    slaComplianceRate: 0,
    bottlenecks: [],
    trendsData: [],
    approverPerformance: [],
    categoryBreakdown: [],
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange, templateFilter, profile?.company_id]);

  const fetchTemplates = async () => {
    const { data } = await supabase.from("workflow_templates").select("id, name").eq("is_active", true);
    if (data) setTemplates(data);
  };

  const fetchMetrics = async () => {
    if (!profile?.company_id) return;
    setIsLoading(true);

    try {
      const startDate = subDays(new Date(), parseInt(dateRange));
      
      let query = supabase
        .from("workflow_instances")
        .select(`
          id,
          status,
          category,
          template_id,
          initiated_at,
          completed_at,
          current_step_id,
          workflow_templates!inner(name)
        `)
        .eq("company_id", profile.company_id)
        .gte("initiated_at", startDate.toISOString());

      if (templateFilter !== "all") {
        query = query.eq("template_id", templateFilter);
      }

      const { data: instances } = await query;

      if (instances) {
        const totalSubmitted = instances.length;
        const totalApproved = instances.filter(i => i.status === "approved").length;
        const totalRejected = instances.filter(i => i.status === "rejected").length;
        const totalPending = instances.filter(i => i.status === "pending" || i.status === "in_progress").length;

        // Calculate avg completion time
        const completedInstances = instances.filter(i => i.completed_at && i.initiated_at);
        const avgCompletionHours = completedInstances.length > 0
          ? completedInstances.reduce((sum, i) => sum + differenceInHours(new Date(i.completed_at!), new Date(i.initiated_at)), 0) / completedInstances.length
          : 0;

        // Category breakdown
        const categoryMap = new Map<string, number>();
        instances.forEach(i => {
          const cat = i.category || "general";
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

        // Trends data (last N days)
        const trendsMap = new Map<string, { submitted: number; completed: number }>();
        for (let i = 0; i < Math.min(parseInt(dateRange), 30); i++) {
          const d = format(subDays(new Date(), i), "yyyy-MM-dd");
          trendsMap.set(d, { submitted: 0, completed: 0 });
        }
        instances.forEach(i => {
          const d = format(new Date(i.initiated_at), "yyyy-MM-dd");
          if (trendsMap.has(d)) {
            trendsMap.get(d)!.submitted++;
          }
          if (i.completed_at) {
            const cd = format(new Date(i.completed_at), "yyyy-MM-dd");
            if (trendsMap.has(cd)) {
              trendsMap.get(cd)!.completed++;
            }
          }
        });
        const trendsData = Array.from(trendsMap.entries())
          .map(([date, data]) => ({ date: format(new Date(date), "MMM d"), ...data }))
          .reverse();

        // Fetch approver performance from workflow_step_tracking
        const { data: approvals } = await (supabase as any)
          .from("workflow_step_tracking")
          .select(`
            action,
            completed_at,
            started_at,
            actor:profiles!workflow_step_tracking_actor_id_fkey(full_name)
          `)
          .in("instance_id", instances.map(i => i.id))
          .not("action", "is", null);

        const approverMap = new Map<string, { approved: number; rejected: number; totalHours: number; count: number }>();
        (approvals || []).forEach((a: any) => {
          const name = a.actor?.full_name || "Unknown";
          if (!approverMap.has(name)) {
            approverMap.set(name, { approved: 0, rejected: 0, totalHours: 0, count: 0 });
          }
          const entry = approverMap.get(name)!;
          if (a.action === "approve") entry.approved++;
          else if (a.action === "reject") entry.rejected++;
          if (a.completed_at && a.started_at) {
            entry.totalHours += differenceInHours(new Date(a.completed_at), new Date(a.started_at));
            entry.count++;
          }
        });

        const approverPerformance = Array.from(approverMap.entries())
          .map(([approverName, data]) => ({
            approverName,
            approved: data.approved,
            rejected: data.rejected,
            avgHours: data.count > 0 ? Math.round(data.totalHours / data.count) : 0,
          }))
          .sort((a, b) => (b.approved + b.rejected) - (a.approved + a.rejected))
          .slice(0, 10);

        // Calculate SLA compliance (simplified - instances completed within deadline)
        const instancesWithDeadline = instances.filter(i => i.completed_at);
        const slaComplianceRate = instancesWithDeadline.length > 0 ? (totalApproved / instancesWithDeadline.length) * 100 : 100;

        setMetrics({
          totalSubmitted,
          totalApproved,
          totalRejected,
          totalPending,
          avgCompletionHours: Math.round(avgCompletionHours),
          slaComplianceRate: Math.round(slaComplianceRate),
          bottlenecks: [],
          trendsData,
          approverPerformance,
          categoryBreakdown,
        });
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const approvalRate = metrics.totalSubmitted > 0 
    ? Math.round((metrics.totalApproved / metrics.totalSubmitted) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="All templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {templates.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Submitted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSubmitted}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <Progress value={approvalRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgCompletionHours}h</div>
            <p className="text-xs text-muted-foreground">Average processing time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPending}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Workflow Trends</CardTitle>
            <CardDescription>Submissions vs completions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="submitted" stroke="hsl(var(--primary))" strokeWidth={2} name="Submitted" />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
            <CardDescription>Distribution across workflow types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                    label={({ category, count }) => `${category}: ${count}`}
                  >
                    {metrics.categoryBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approver Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Approver Performance</CardTitle>
          <CardDescription>Top approvers by volume and response time</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.approverPerformance.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No approval data available</p>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.approverPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" />
                  <YAxis dataKey="approverName" type="category" width={120} className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="approved" fill="hsl(var(--chart-2))" name="Approved" stackId="a" />
                  <Bar dataKey="rejected" fill="hsl(var(--destructive))" name="Rejected" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalApproved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalRejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalPending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
