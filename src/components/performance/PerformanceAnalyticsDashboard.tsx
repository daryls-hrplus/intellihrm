import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Target, Users, TrendingUp, Award, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import {
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
  LineChart,
  Line,
  Legend,
} from "recharts";

interface PerformanceAnalyticsDashboardProps {
  companyId: string;
}

export function PerformanceAnalyticsDashboard({ companyId }: PerformanceAnalyticsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    avgProgress: 0,
    totalFeedback: 0,
    totalRecognitions: 0,
    activePips: 0,
    appraisalsPending: 0,
    review360Pending: 0,
  });
  const [goalsByStatus, setGoalsByStatus] = useState<{ name: string; value: number }[]>([]);
  const [feedbackByType, setFeedbackByType] = useState<{ name: string; value: number }[]>([]);
  const [recognitionTrend, setRecognitionTrend] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    if (companyId) fetchAnalytics();
  }, [companyId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [
        goalsRes,
        feedbackRes,
        recognitionsRes,
        pipsRes,
        appraisalsRes,
        review360Res,
      ] = await Promise.all([
        // @ts-ignore
        supabase.from("performance_goals").select("id, status, progress_percentage").eq("company_id", companyId),
        // @ts-ignore
        supabase.from("continuous_feedback").select("id, feedback_type").eq("company_id", companyId),
        // @ts-ignore
        supabase.from("recognition_awards").select("id, created_at, status").eq("company_id", companyId),
        // @ts-ignore
        supabase.from("performance_improvement_plans").select("id, status").eq("company_id", companyId).eq("status", "active"),
        // @ts-ignore
        supabase.from("appraisal_participants").select("id, status, cycle:appraisal_cycles!inner(company_id)").eq("status", "pending"),
        // @ts-ignore
        supabase.from("review_360_feedback").select("id, status").eq("status", "pending"),
      ]);

      const goals = goalsRes.data || [];
      const feedback = feedbackRes.data || [];
      const recognitions = recognitionsRes.data || [];
      const pips = pipsRes.data || [];

      // Calculate stats
      const completedGoals = goals.filter((g: any) => g.status === "completed").length;
      const avgProgress = goals.length > 0
        ? Math.round(goals.reduce((acc: number, g: any) => acc + (g.progress_percentage || 0), 0) / goals.length)
        : 0;

      setStats({
        totalGoals: goals.length,
        completedGoals,
        avgProgress,
        totalFeedback: feedback.length,
        totalRecognitions: recognitions.filter((r: any) => r.status === "approved").length,
        activePips: pips.length,
        appraisalsPending: appraisalsRes.data?.length || 0,
        review360Pending: review360Res.data?.length || 0,
      });

      // Goals by status
      const statusCounts: Record<string, number> = {};
      goals.forEach((g: any) => {
        statusCounts[g.status] = (statusCounts[g.status] || 0) + 1;
      });
      setGoalsByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      // Feedback by type
      const feedbackCounts: Record<string, number> = {};
      feedback.forEach((f: any) => {
        feedbackCounts[f.feedback_type] = (feedbackCounts[f.feedback_type] || 0) + 1;
      });
      setFeedbackByType(Object.entries(feedbackCounts).map(([name, value]) => ({ name: name.replace("_", " "), value })));

      // Recognition trend (last 6 months)
      const now = new Date();
      const months: { month: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString("en-US", { month: "short" });
        const count = recognitions.filter((r: any) => {
          const rDate = new Date(r.created_at);
          return rDate.getMonth() === date.getMonth() && rDate.getFullYear() === date.getFullYear();
        }).length;
        months.push({ month: monthStr, count });
      }
      setRecognitionTrend(months);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--info))", "hsl(var(--destructive))"];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{stats.totalGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed Goals</p>
                <p className="text-2xl font-bold">{stats.completedGoals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recognitions</p>
                <p className="text-2xl font-bold">{stats.totalRecognitions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Feedback Given</p>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active PIPs</p>
                <p className="text-2xl font-bold">{stats.activePips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Appraisals Pending</p>
                <p className="text-2xl font-bold">{stats.appraisalsPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-cyan-500/10 p-2">
                <MessageSquare className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">360° Reviews Pending</p>
                <p className="text-2xl font-bold">{stats.review360Pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Goals by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {goalsByStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No goal data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={goalsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalsByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {feedbackByType.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No feedback data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={feedbackByType}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recognition Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={recognitionTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Recognitions"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
