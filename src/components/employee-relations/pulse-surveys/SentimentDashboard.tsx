import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  BarChart3,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
  Target,
} from "lucide-react";
import {
  useSentimentMetrics,
  useSentimentAlerts,
  usePulseSurveys,
  usePulseSurveyMutations,
} from "@/hooks/usePulseSurveys";
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
} from "recharts";

interface SentimentDashboardProps {
  companyId: string;
}

const SENTIMENT_COLORS = {
  positive: "hsl(var(--success))",
  neutral: "hsl(var(--warning))",
  negative: "hsl(var(--destructive))",
};

export function SentimentDashboard({ companyId }: SentimentDashboardProps) {
  const { t } = useTranslation();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");

  const { data: surveys = [] } = usePulseSurveys(companyId);
  const { data: metrics = [], isLoading: metricsLoading } = useSentimentMetrics(
    companyId,
    selectedSurveyId === "all" ? undefined : selectedSurveyId,
    selectedDepartmentId === "all" ? undefined : selectedDepartmentId
  );
  const { data: alerts = [] } = useSentimentAlerts(companyId);
  const { analyzeSentiment, resolveAlert } = usePulseSurveyMutations();

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch department-level metrics for heatmap
  const { data: deptMetrics = [] } = useQuery({
    queryKey: ["dept-sentiment-metrics", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_sentiment_metrics")
        .select("*, departments(name)")
        .eq("company_id", companyId)
        .not("department_id", "is", null)
        .order("metric_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const latestMetric = metrics[0];
  const previousMetric = metrics[1];

  const sentimentChange = latestMetric && previousMetric
    ? ((latestMetric.avg_sentiment_score - previousMetric.avg_sentiment_score) * 100).toFixed(1)
    : null;

  const trendData = metrics
    .slice(0, 14)
    .reverse()
    .map((m) => ({
      date: new Date(m.metric_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Number((m.avg_sentiment_score * 100).toFixed(0)),
      positive: m.positive_count,
      neutral: m.neutral_count,
      negative: m.negative_count,
      engagement: m.engagement_score,
    }));

  const distributionData = latestMetric
    ? [
        { name: "Positive", value: latestMetric.positive_count, color: SENTIMENT_COLORS.positive },
        { name: "Neutral", value: latestMetric.neutral_count, color: SENTIMENT_COLORS.neutral },
        { name: "Negative", value: latestMetric.negative_count, color: SENTIMENT_COLORS.negative },
      ]
    : [];

  // Build heatmap data by department
  const heatmapData = departments.map((dept) => {
    const deptData = deptMetrics.find((m) => m.department_id === dept.id);
    return {
      department: dept.name,
      departmentId: dept.id,
      score: deptData?.avg_sentiment_score ?? 0,
      responses: deptData?.total_responses ?? 0,
      trend: deptData?.trend_direction ?? "stable",
    };
  });

  const handleRefreshMetrics = async () => {
    await analyzeSentiment.mutateAsync({
      action: "generate_metrics",
      companyId,
      surveyId: selectedSurveyId === "all" ? undefined : selectedSurveyId,
    });
  };

  const handleDetectAlerts = async () => {
    await analyzeSentiment.mutateAsync({
      action: "detect_alerts",
      companyId,
    });
  };

  const getSentimentIcon = (score: number) => {
    if (score > 0.3) return <Smile className="h-5 w-5 text-success" />;
    if (score < -0.3) return <Frown className="h-5 w-5 text-destructive" />;
    return <Meh className="h-5 w-5 text-warning" />;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-success";
    if (score < -0.3) return "text-destructive";
    return "text-warning";
  };

  const getHeatmapColor = (score: number) => {
    if (score > 0.5) return "bg-success/80";
    if (score > 0.2) return "bg-success/50";
    if (score > -0.2) return "bg-warning/50";
    if (score > -0.5) return "bg-destructive/50";
    return "bg-destructive/80";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Surveys" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Surveys</SelectItem>
            {surveys.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={handleDetectAlerts} disabled={analyzeSentiment.isPending}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Detect Issues
        </Button>
        <Button variant="outline" size="sm" onClick={handleRefreshMetrics} disabled={analyzeSentiment.isPending}>
          {analyzeSentiment.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Metrics
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">eNPS Score</p>
                <p className={`text-3xl font-bold ${
                  (latestMetric?.enps_score ?? 0) >= 30 ? "text-success" : 
                  (latestMetric?.enps_score ?? 0) >= 0 ? "text-warning" : "text-destructive"
                }`}>
                  {latestMetric?.enps_score !== null && latestMetric?.enps_score !== undefined 
                    ? latestMetric.enps_score 
                    : "--"}
                </p>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {latestMetric?.enps_response_count || 0} responses
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sentiment Score</p>
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
                  {sentimentChange}% from previous
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-3xl font-bold">{latestMetric?.total_responses ?? 0}</p>
              </div>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-success">{latestMetric?.positive_count ?? 0} positive</span>
                <span className="text-destructive">{latestMetric?.negative_count ?? 0} negative</span>
              </div>
              <Progress
                value={
                  latestMetric?.total_responses
                    ? (latestMetric.positive_count / latestMetric.total_responses) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
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
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {latestMetric ? new Date(latestMetric.metric_date).toLocaleDateString() : "N/A"}</span>
            </div>
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
              {alerts.slice(0, 3).map((alert) => (
                <Badge
                  key={alert.id}
                  variant="outline"
                  className={
                    alert.severity === "critical"
                      ? "border-destructive text-destructive"
                      : alert.severity === "high"
                      ? "border-warning text-warning"
                      : ""
                  }
                >
                  {alert.severity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Heatmap */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
          <TabsTrigger value="heatmap">Department Heatmap</TabsTrigger>
          <TabsTrigger value="themes">Key Themes</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({alerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Over Time</CardTitle>
              <CardDescription>Track how employee sentiment changes day by day</CardDescription>
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
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sentiment data yet</p>
                    <p className="text-sm">Run surveys to start collecting sentiment data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Department Sentiment Heatmap</CardTitle>
              <CardDescription>Compare sentiment across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {heatmapData.map((dept) => (
                  <div
                    key={dept.departmentId}
                    className={`p-4 rounded-lg ${getHeatmapColor(dept.score)} text-white`}
                  >
                    <div className="font-medium truncate">{dept.department}</div>
                    <div className="text-2xl font-bold">{(dept.score * 100).toFixed(0)}%</div>
                    <div className="text-sm opacity-80">{dept.responses} responses</div>
                    <div className="flex items-center gap-1 text-xs mt-1">
                      {dept.trend === "improving" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : dept.trend === "declining" ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {dept.trend}
                    </div>
                  </div>
                ))}
                {heatmapData.length === 0 && (
                  <div className="col-span-4 text-center py-8 text-muted-foreground">
                    No department-level data available yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="themes">
          <Card>
            <CardHeader>
              <CardTitle>Top Themes</CardTitle>
              <CardDescription>Most frequently mentioned topics in feedback</CardDescription>
            </CardHeader>
            <CardContent>
              {latestMetric?.top_themes && latestMetric.top_themes.length > 0 ? (
                <div className="space-y-3">
                  {latestMetric.top_themes.map((theme, idx) => (
                    <div key={theme} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </Badge>
                      <div className="flex-1">
                        <div className="font-medium capitalize">{theme.replace(/_/g, " ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No themes detected yet</p>
                  <p className="text-sm">Themes are extracted from open-ended responses</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Alerts</CardTitle>
              <CardDescription>Issues requiring HR attention</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <Card
                        key={alert.id}
                        className={
                          alert.severity === "critical"
                            ? "border-destructive"
                            : alert.severity === "high"
                            ? "border-warning"
                            : ""
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge
                                  variant={alert.severity === "critical" || alert.severity === "high" ? "destructive" : "secondary"}
                                >
                                  {alert.severity}
                                </Badge>
                                <Badge variant="outline">{alert.alert_type}</Badge>
                              </div>
                              <h4 className="font-medium">{alert.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                              {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium mb-1">Recommended Actions:</p>
                                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                                    {alert.recommended_actions.slice(0, 3).map((action, i) => (
                                      <li key={i}>{action}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveAlert.mutate({ id: alert.id })}
                            >
                              Resolve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active alerts</p>
                    <p className="text-sm">Great news! No concerning patterns detected</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
