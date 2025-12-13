import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, BookOpen, Award, Clock, DollarSign, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";

interface TrainingAnalyticsProps {
  companyId: string;
}

interface KPIData {
  totalCourses: number;
  totalEnrollments: number;
  completionRate: number;
  avgQuizScore: number;
  certificationsIssued: number;
  totalTrainingHours: number;
  complianceRate: number;
  budgetUtilization: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))', 'hsl(var(--destructive))', 'hsl(var(--secondary))'];

export function TrainingAnalytics({ companyId }: TrainingAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [kpis, setKpis] = useState<KPIData>({
    totalCourses: 0,
    totalEnrollments: 0,
    completionRate: 0,
    avgQuizScore: 0,
    certificationsIssued: 0,
    totalTrainingHours: 0,
    complianceRate: 0,
    budgetUtilization: 0,
  });
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [completionTrends, setCompletionTrends] = useState<any[]>([]);
  const [topCourses, setTopCourses] = useState<any[]>([]);

  useEffect(() => {
    if (companyId) {
      loadAnalytics();
    }
  }, [companyId, year]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadKPIs(),
        loadEnrollmentTrends(),
        loadCourseDistribution(),
        loadStatusDistribution(),
        loadCompletionTrends(),
        loadTopCourses(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const coursesRes = await supabase
      .from("lms_courses")
      .select("id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_published", true);

    // @ts-ignore - Supabase type instantiation issue
    const enrollmentsRes = await supabase
      .from("lms_enrollments")
      .select("status")
      .eq("company_id", companyId);

    // @ts-ignore - Supabase type instantiation issue
    const certificatesRes = await supabase
      .from("lms_certificates")
      .select("id", { count: "exact", head: true });

    // @ts-ignore - Supabase type instantiation issue
    const quizAttemptsRes = await supabase
      .from("lms_quiz_attempts")
      .select("score, max_score");

    // @ts-ignore - Supabase type instantiation issue
    const budgetsRes = await supabase
      .from("training_budgets")
      .select("total_budget, spent_amount")
      .eq("company_id", companyId)
      .eq("fiscal_year", parseInt(year));

    // @ts-ignore - Supabase type instantiation issue
    const complianceRes = await supabase
      .from("compliance_training_assignments")
      .select("status");

    const enrollments = enrollmentsRes.data || [];
    const completedCount = enrollments.filter((e: any) => e.status === "completed").length;
    const completionRate = enrollments.length > 0 ? (completedCount / enrollments.length) * 100 : 0;

    const quizAttempts = quizAttemptsRes.data || [];
    const avgQuizScore = quizAttempts.length > 0
      ? quizAttempts.reduce((sum: number, a: any) => sum + (a.score / a.max_score) * 100, 0) / quizAttempts.length
      : 0;

    const budgets = budgetsRes.data || [];
    const totalBudget = budgets.reduce((sum: number, b: any) => sum + (b.total_budget || 0), 0);
    const spentAmount = budgets.reduce((sum: number, b: any) => sum + (b.spent_amount || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;

    const compliance = complianceRes.data || [];
    const completedCompliance = compliance.filter((c: any) => c.status === "completed").length;
    const complianceRate = compliance.length > 0 ? (completedCompliance / compliance.length) * 100 : 0;

    setKpis({
      totalCourses: coursesRes.count || 0,
      totalEnrollments: enrollments.length,
      completionRate: Math.round(completionRate),
      avgQuizScore: Math.round(avgQuizScore),
      certificationsIssued: certificatesRes.count || 0,
      totalTrainingHours: enrollments.length * 2, // Estimate 2 hours per enrollment
      complianceRate: Math.round(complianceRate),
      budgetUtilization: Math.round(budgetUtilization),
    });
  };

  const loadEnrollmentTrends = async () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, "MMM"),
        start: startOfMonth(date).toISOString(),
        end: endOfMonth(date).toISOString(),
      });
    }

    const trends = await Promise.all(
      months.map(async (m) => {
        // @ts-ignore - Supabase type instantiation issue
        const res = await supabase
          .from("lms_enrollments")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .gte("enrolled_at", m.start)
          .lte("enrolled_at", m.end);
        return { month: m.month, enrollments: res.count || 0 };
      })
    );

    setEnrollmentTrends(trends);
  };

  const loadCourseDistribution = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const res = await supabase
      .from("lms_courses")
      .select("category:lms_categories(name)")
      .eq("company_id", companyId)
      .eq("is_published", true);

    const data = res.data || [];
    const categoryCount: Record<string, number> = {};
    data.forEach((c: any) => {
      const name = c.category?.name || "Uncategorized";
      categoryCount[name] = (categoryCount[name] || 0) + 1;
    });

    setCourseDistribution(
      Object.entries(categoryCount).map(([name, value]) => ({ name, value }))
    );
  };

  const loadStatusDistribution = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const res = await supabase
      .from("lms_enrollments")
      .select("status")
      .eq("company_id", companyId);

    const data = res.data || [];
    const statusCount: Record<string, number> = {};
    data.forEach((e: any) => {
      const status = e.status || "unknown";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    setStatusDistribution(
      Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
        value,
      }))
    );
  };

  const loadCompletionTrends = async () => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, "MMM"),
        start: startOfMonth(date).toISOString(),
        end: endOfMonth(date).toISOString(),
      });
    }

    const trends = await Promise.all(
      months.map(async (m) => {
        // @ts-ignore - Supabase type instantiation issue
        const completedRes = await supabase
          .from("lms_enrollments")
          .select("id", { count: "exact", head: true })
          .eq("company_id", companyId)
          .eq("status", "completed")
          .gte("completed_at", m.start)
          .lte("completed_at", m.end);

        // @ts-ignore - Supabase type instantiation issue
        const certsRes = await supabase
          .from("lms_certificates")
          .select("id", { count: "exact", head: true })
          .gte("issued_at", m.start)
          .lte("issued_at", m.end);

        return {
          month: m.month,
          completions: completedRes.count || 0,
          certificates: certsRes.count || 0,
        };
      })
    );

    setCompletionTrends(trends);
  };

  const loadTopCourses = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const res = await supabase
      .from("lms_enrollments")
      .select("course:lms_courses(id, title)")
      .eq("company_id", companyId);

    const data = res.data || [];
    const courseCount: Record<string, { title: string; count: number }> = {};
    data.forEach((e: any) => {
      if (e.course) {
        const id = e.course.id;
        if (!courseCount[id]) {
          courseCount[id] = { title: e.course.title, count: 0 };
        }
        courseCount[id].count++;
      }
    });

    const sorted = Object.values(courseCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopCourses(sorted);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Courses", value: kpis.totalCourses, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "Enrollments", value: kpis.totalEnrollments, icon: Users, color: "bg-info/10 text-info" },
    { label: "Completion Rate", value: `${kpis.completionRate}%`, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Avg Quiz Score", value: `${kpis.avgQuizScore}%`, icon: TrendingUp, color: "bg-warning/10 text-warning" },
    { label: "Certifications", value: kpis.certificationsIssued, icon: Award, color: "bg-secondary/10 text-secondary-foreground" },
    { label: "Training Hours", value: kpis.totalTrainingHours, icon: Clock, color: "bg-accent/10 text-accent-foreground" },
    { label: "Compliance Rate", value: `${kpis.complianceRate}%`, icon: AlertTriangle, color: kpis.complianceRate >= 80 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive" },
    { label: "Budget Used", value: `${kpis.budgetUtilization}%`, icon: DollarSign, color: "bg-info/10 text-info" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>Year:</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-bold text-card-foreground">{kpi.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${kpi.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="top-courses">Top Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Monthly Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrollmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">Enrollment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Completions & Certifications Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={completionTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                  <Area type="monotone" dataKey="completions" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.6} name="Completions" />
                  <Area type="monotone" dataKey="certificates" stackId="2" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.6} name="Certificates" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Courses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {courseDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-courses" className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Most Popular Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No course data available</p>
                ) : (
                  topCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center rounded-full">
                          {index + 1}
                        </Badge>
                        <span className="font-medium text-foreground">{course.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.count} enrollments</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
