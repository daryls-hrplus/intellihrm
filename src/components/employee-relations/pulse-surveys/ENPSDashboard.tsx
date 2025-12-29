import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Loader2,
  Target,
  Building2,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePulseSurveys, usePulseSurveyMutations } from "@/hooks/usePulseSurveys";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

interface ENPSDashboardProps {
  companyId: string;
}

const ENPS_COLORS = {
  promoter: "hsl(var(--success))",
  passive: "hsl(var(--warning))",
  detractor: "hsl(var(--destructive))",
};

const GAUGE_SEGMENTS = [
  { min: -100, max: -50, label: "Critical", color: "bg-destructive" },
  { min: -50, max: 0, label: "Poor", color: "bg-destructive/60" },
  { min: 0, max: 30, label: "Good", color: "bg-warning" },
  { min: 30, max: 50, label: "Great", color: "bg-success/60" },
  { min: 50, max: 100, label: "Excellent", color: "bg-success" },
];

export function ENPSDashboard({ companyId }: ENPSDashboardProps) {
  const { t } = useTranslation();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>("all");
  const { data: surveys = [] } = usePulseSurveys(companyId);
  const { analyzeSentiment } = usePulseSurveyMutations();

  // Fetch eNPS metrics
  const { data: enpsMetrics = [], isLoading, refetch } = useQuery({
    queryKey: ["enps-metrics", companyId, selectedSurveyId],
    queryFn: async () => {
      let query = supabase
        .from("pulse_sentiment_metrics")
        .select("*")
        .eq("company_id", companyId)
        .not("enps_score", "is", null)
        .order("metric_date", { ascending: false });

      if (selectedSurveyId !== "all") {
        query = query.eq("survey_id", selectedSurveyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch department metrics for comparison
  const { data: deptEnpsMetrics = [] } = useQuery({
    queryKey: ["dept-enps-metrics", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pulse_sentiment_metrics")
        .select("*, departments(name)")
        .eq("company_id", companyId)
        .not("enps_score", "is", null)
        .not("department_id", "is", null)
        .order("metric_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch departments for display
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

  // Get latest org-level metric
  const latestOrgMetric = enpsMetrics.find((m) => !m.department_id);
  const previousOrgMetric = enpsMetrics.filter((m) => !m.department_id)[1];

  const enpsScore = latestOrgMetric?.enps_score ?? null;
  const enpsChange = latestOrgMetric && previousOrgMetric
    ? latestOrgMetric.enps_score - previousOrgMetric.enps_score
    : null;

  // Prepare distribution data
  const distributionData = latestOrgMetric
    ? [
        { name: "Promoters (9-10)", value: latestOrgMetric.promoter_count || 0, color: ENPS_COLORS.promoter },
        { name: "Passives (7-8)", value: latestOrgMetric.passive_count || 0, color: ENPS_COLORS.passive },
        { name: "Detractors (0-6)", value: latestOrgMetric.detractor_count || 0, color: ENPS_COLORS.detractor },
      ]
    : [];

  // Prepare trend data
  const trendData = enpsMetrics
    .filter((m) => !m.department_id)
    .slice(0, 12)
    .reverse()
    .map((m) => ({
      date: new Date(m.metric_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: m.enps_score,
    }));

  // Prepare department comparison data
  const deptComparisonData = departments.map((dept) => {
    const deptMetric = deptEnpsMetrics.find((m) => m.department_id === dept.id);
    return {
      department: dept.name.length > 12 ? dept.name.slice(0, 12) + "..." : dept.name,
      fullName: dept.name,
      score: deptMetric?.enps_score ?? 0,
      responses: deptMetric?.enps_response_count ?? 0,
    };
  }).sort((a, b) => b.score - a.score);

  const getEnpsLabel = (score: number | null) => {
    if (score === null) return "N/A";
    if (score >= 50) return "Excellent";
    if (score >= 30) return "Great";
    if (score >= 0) return "Good";
    if (score >= -50) return "Poor";
    return "Critical";
  };

  const getEnpsColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 30) return "text-success";
    if (score >= 0) return "text-warning";
    return "text-destructive";
  };

  const handleCalculateEnps = async () => {
    if (selectedSurveyId === "all") return;
    await analyzeSentiment.mutateAsync({
      action: "calculate_enps",
      companyId,
      surveyId: selectedSurveyId,
    });
    refetch();
  };

  const gaugePercentage = enpsScore !== null ? ((enpsScore + 100) / 200) * 100 : 50;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select Survey" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All eNPS Surveys</SelectItem>
            {surveys.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCalculateEnps}
          disabled={selectedSurveyId === "all" || analyzeSentiment.isPending}
        >
          {analyzeSentiment.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Calculate eNPS
        </Button>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Employee Net Promoter Score
            </CardTitle>
            <CardDescription>How likely employees are to recommend your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              {/* Gauge visualization */}
              <div className="relative w-48 h-28">
                <div className="absolute inset-0 flex">
                  {GAUGE_SEGMENTS.map((seg, idx) => (
                    <div
                      key={idx}
                      className={`h-4 flex-1 first:rounded-l-full last:rounded-r-full ${seg.color}`}
                    />
                  ))}
                </div>
                <div
                  className="absolute top-0 w-1 h-6 bg-foreground rounded-full transition-all duration-500"
                  style={{ left: `calc(${gaugePercentage}% - 2px)` }}
                />
                <div className="absolute top-8 inset-x-0 text-center">
                  <span className={`text-5xl font-bold ${getEnpsColor(enpsScore)}`}>
                    {enpsScore !== null ? enpsScore : "--"}
                  </span>
                </div>
                <div className="absolute bottom-0 inset-x-0 flex justify-between text-xs text-muted-foreground px-1">
                  <span>-100</span>
                  <span>0</span>
                  <span>+100</span>
                </div>
              </div>

              {/* Score details */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={enpsScore !== null && enpsScore >= 0 ? "default" : "destructive"}>
                    {getEnpsLabel(enpsScore)}
                  </Badge>
                  {enpsChange !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      {enpsChange > 0 ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : enpsChange < 0 ? (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={enpsChange > 0 ? "text-success" : enpsChange < 0 ? "text-destructive" : ""}>
                        {enpsChange > 0 ? "+" : ""}{enpsChange} pts
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {latestOrgMetric?.enps_response_count || 0} total responses
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Response Distribution</CardTitle>
            <CardDescription>Breakdown of promoters, passives, and detractors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {distributionData.length > 0 ? (
                <>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        dataKey="value"
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-success" />
                        <span className="text-sm">Promoters (9-10)</span>
                      </div>
                      <span className="font-medium text-success">
                        {latestOrgMetric?.promoter_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-warning" />
                        <span className="text-sm">Passives (7-8)</span>
                      </div>
                      <span className="font-medium text-warning">
                        {latestOrgMetric?.passive_count || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4 text-destructive" />
                        <span className="text-sm">Detractors (0-6)</span>
                      </div>
                      <span className="font-medium text-destructive">
                        {latestOrgMetric?.detractor_count || 0}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 text-center text-muted-foreground py-4">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No eNPS data yet</p>
                  <p className="text-xs">Run an eNPS survey to see distribution</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend & Department Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>eNPS Trend</CardTitle>
            <CardDescription>Track eNPS changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 1 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[-100, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="eNPS Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>Not enough data for trend</p>
                  <p className="text-xs">Run multiple surveys to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department eNPS Comparison
            </CardTitle>
            <CardDescription>Compare eNPS across departments</CardDescription>
          </CardHeader>
          <CardContent>
            {deptComparisonData.length > 0 && deptComparisonData.some((d) => d.responses > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[-100, 100]} />
                  <YAxis type="category" dataKey="department" width={90} />
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "eNPS"]}
                    labelFormatter={(label) => deptComparisonData.find((d) => d.department === label)?.fullName || label}
                  />
                  <Bar dataKey="score" name="eNPS Score">
                    {deptComparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score >= 30
                            ? "hsl(var(--success))"
                            : entry.score >= 0
                            ? "hsl(var(--warning))"
                            : "hsl(var(--destructive))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No department data available</p>
                  <p className="text-xs">eNPS will be calculated per department</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benchmarking info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Understanding eNPS Scores</h4>
              <p className="text-sm text-muted-foreground">
                eNPS ranges from -100 to +100. A score above 0 is considered good (more promoters than detractors), 
                above 30 is great, and above 50 is excellent. Industry benchmarks vary, but tech companies typically 
                aim for 20-40, while top performers achieve 50+.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
