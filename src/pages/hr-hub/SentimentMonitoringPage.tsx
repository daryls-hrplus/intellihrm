import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  BarChart3,
  Building2,
  Users,
  Sparkles,
  RefreshCw,
  Loader2,
  Brain,
  ArrowRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { usePulseSurveyMutations } from "@/hooks/usePulseSurveys";
import { useNavigate } from "react-router-dom";

export default function SentimentMonitoringPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const { analyzeSentiment } = usePulseSurveyMutations();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  // Fetch org-wide sentiment metrics
  const { data: orgMetrics = [], isLoading: metricsLoading } = useQuery({
    queryKey: ["org-sentiment-metrics", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_sentiment_metrics")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .is("department_id", null)
        .order("metric_date", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch department metrics for comparison
  const { data: deptMetrics = [] } = useQuery({
    queryKey: ["dept-comparison-metrics", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_sentiment_metrics")
        .select("*, departments(name)")
        .eq("company_id", selectedCompanyId)
        .not("department_id", "is", null)
        .order("metric_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch active alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ["org-sentiment-alerts", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_sentiment_alerts")
        .select("*, departments(name)")
        .eq("company_id", selectedCompanyId)
        .eq("is_resolved", false)
        .order("severity", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch departments for radar chart
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  // Fetch active surveys count
  const { data: surveyStats } = useQuery({
    queryKey: ["survey-stats", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_surveys")
        .select("id, status, response_count")
        .eq("company_id", selectedCompanyId);
      if (error) throw error;
      const active = data.filter((s) => s.status === "active").length;
      const totalResponses = data.reduce((sum, s) => sum + (s.response_count || 0), 0);
      return { active, total: data.length, totalResponses };
    },
    enabled: !!selectedCompanyId,
  });

  const latestMetric = orgMetrics[0];
  const previousMetric = orgMetrics[1];

  const sentimentChange =
    latestMetric && previousMetric
      ? ((latestMetric.avg_sentiment_score - previousMetric.avg_sentiment_score) * 100).toFixed(1)
      : null;

  // Prepare trend data
  const trendData = orgMetrics
    .slice(0, 14)
    .reverse()
    .map((m: any) => ({
      date: new Date(m.metric_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Number((m.avg_sentiment_score * 100).toFixed(0)),
      engagement: m.engagement_score,
    }));

  // Prepare department comparison data
  const deptComparisonData = departments.map((dept) => {
    const metric = deptMetrics.find((m: any) => m.department_id === dept.id);
    return {
      department: dept.name.length > 15 ? dept.name.slice(0, 15) + "..." : dept.name,
      fullName: dept.name,
      sentiment: metric ? Number((metric.avg_sentiment_score * 100).toFixed(0)) : 0,
      engagement: metric?.engagement_score || 0,
      responses: metric?.total_responses || 0,
    };
  });

  // Prepare radar data for themes
  const themeData = latestMetric?.top_themes?.slice(0, 6).map((theme: string, idx: number) => ({
    theme: theme.replace(/_/g, " ").charAt(0).toUpperCase() + theme.replace(/_/g, " ").slice(1),
    value: 100 - idx * 15,
    fullMark: 100,
  })) || [];

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <Smile className="h-6 w-6 text-success" />;
    if (score < -0.3) return <Frown className="h-6 w-6 text-destructive" />;
    return <Meh className="h-6 w-6 text-warning" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-success";
    if (score < -0.3) return "text-destructive";
    return "text-warning";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-info text-info-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleGenerateInsights = async () => {
    if (!selectedCompanyId) return;
    await analyzeSentiment.mutateAsync({
      action: "detect_alerts",
      companyId: selectedCompanyId,
    });
  };

  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: "HR Hub", href: "/hr-hub" },
    { label: "Sentiment Monitoring" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-info/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Organization Sentiment Monitor</h1>
              <p className="text-muted-foreground">AI-powered workforce sentiment analytics for leadership</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleGenerateInsights} disabled={analyzeSentiment.isPending}>
              {analyzeSentiment.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate AI Insights
            </Button>
          </div>
        </div>

        {/* Executive KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="col-span-1">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Org Sentiment</p>
                  <p className={`text-3xl font-bold ${getSentimentColor(latestMetric?.avg_sentiment_score ?? 0)}`}>
                    {latestMetric ? (latestMetric.avg_sentiment_score * 100).toFixed(0) : "--"}%
                  </p>
                </div>
                {getSentimentIcon(latestMetric?.avg_sentiment_score ?? 0)}
              </div>
              {sentimentChange && (
                <div className="flex items-center gap-1 mt-2 text-sm">
                  {parseFloat(sentimentChange) > 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : parseFloat(sentimentChange) < 0 ? (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={parseFloat(sentimentChange) > 0 ? "text-success" : parseFloat(sentimentChange) < 0 ? "text-destructive" : ""}>
                    {sentimentChange}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Score</p>
                  <p className="text-3xl font-bold">{latestMetric?.engagement_score?.toFixed(0) ?? "--"}%</p>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <Progress value={latestMetric?.engagement_score || 0} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Responses</p>
                  <p className="text-3xl font-bold">{surveyStats?.totalResponses || 0}</p>
                </div>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                From {surveyStats?.total || 0} surveys
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Surveys</p>
                  <p className="text-3xl font-bold">{surveyStats?.active || 0}</p>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <Button
                variant="link"
                className="p-0 h-auto mt-2"
                onClick={() => navigate("/employee-relations/surveys")}
              >
                View Surveys <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className={alerts.length > 0 ? "border-destructive" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Alerts</p>
                  <p className={`text-3xl font-bold ${alerts.length > 0 ? "text-destructive" : ""}`}>
                    {alerts.length}
                  </p>
                </div>
                <AlertTriangle className={`h-5 w-5 ${alerts.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div className="flex gap-1 mt-2">
                {["critical", "high", "medium"].map((sev) => {
                  const count = alerts.filter((a: any) => a.severity === sev).length;
                  if (count === 0) return null;
                  return (
                    <Badge key={sev} className={getSeverityColor(sev)}>
                      {count} {sev}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Trend Chart - 2 cols */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Organization Sentiment Trend</CardTitle>
              <CardDescription>Track sentiment changes over time across the organization</CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[-100, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name="Sentiment %"
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(var(--info))"
                      strokeWidth={2}
                      dot={false}
                      name="Engagement %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sentiment data available</p>
                    <p className="text-sm">Run pulse surveys to collect sentiment data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Theme Radar - 1 col */}
          <Card>
            <CardHeader>
              <CardTitle>Top Themes</CardTitle>
              <CardDescription>Key topics from employee feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {themeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={themeData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="theme" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Mentions"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.5}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No themes detected yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Department Comparison & Alerts */}
        <div className="grid grid-cols-3 gap-6">
          {/* Department Comparison */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Department Comparison</CardTitle>
              <CardDescription>Compare sentiment across departments</CardDescription>
            </CardHeader>
            <CardContent>
              {deptComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[-100, 100]} />
                    <YAxis type="category" dataKey="department" width={100} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.fullName}</p>
                            <p className="text-sm">Sentiment: {data.sentiment}%</p>
                            <p className="text-sm">Engagement: {data.engagement}%</p>
                            <p className="text-sm text-muted-foreground">{data.responses} responses</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sentiment" name="Sentiment">
                      {deptComparisonData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.sentiment > 30
                              ? "hsl(var(--success))"
                              : entry.sentiment < -30
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--warning))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No department data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Priority Alerts
              </CardTitle>
              <CardDescription>Issues requiring leadership attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert: any) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          alert.severity === "critical"
                            ? "border-l-destructive bg-destructive/5"
                            : alert.severity === "high"
                            ? "border-l-warning bg-warning/5"
                            : "border-l-info bg-info/5"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          {alert.departments?.name && (
                            <Badge variant="outline">{alert.departments.name}</Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {alert.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Smile className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active alerts</p>
                      <p className="text-sm">Organization sentiment is healthy</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-info/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Generated Leadership Insights
            </CardTitle>
            <CardDescription>Strategic recommendations based on sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium mb-2">🎯 Focus Areas</h4>
                <p className="text-sm text-muted-foreground">
                  {latestMetric?.top_themes?.length
                    ? `Key themes requiring attention: ${latestMetric.top_themes.slice(0, 3).join(", ")}`
                    : "Run pulse surveys to identify focus areas"}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium mb-2">📈 Trend Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {sentimentChange
                    ? parseFloat(sentimentChange) > 0
                      ? `Positive momentum: Sentiment improved by ${sentimentChange}%`
                      : parseFloat(sentimentChange) < 0
                      ? `Attention needed: Sentiment declined by ${Math.abs(parseFloat(sentimentChange))}%`
                      : "Sentiment is stable"
                    : "Collect more data for trend analysis"}
                </p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <h4 className="font-medium mb-2">⚡ Quick Wins</h4>
                <p className="text-sm text-muted-foreground">
                  {alerts.length > 0
                    ? `Address ${alerts.filter((a: any) => a.severity === "high" || a.severity === "critical").length} high-priority alerts to improve sentiment`
                    : "Continue current initiatives to maintain positive sentiment"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
