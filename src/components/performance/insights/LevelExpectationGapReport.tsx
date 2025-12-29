import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Download, Filter } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface LevelExpectationGapReportProps {
  companyId?: string;
}

interface GapData {
  employee_name: string;
  job_level: string;
  job_grade: string;
  competency_score: number;
  expected_competency: number;
  goal_score: number;
  expected_goal: number;
  competency_gap: number;
  goal_gap: number;
  status: "exceeds" | "meets" | "below";
}

interface LevelSummary {
  level: string;
  grade: string;
  employee_count: number;
  avg_competency_gap: number;
  avg_goal_gap: number;
  exceeds_count: number;
  meets_count: number;
  below_count: number;
}

export function LevelExpectationGapReport({ companyId }: LevelExpectationGapReportProps) {
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState<GapData[]>([]);
  const [levelSummary, setLevelSummary] = useState<LevelSummary[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch job level expectations
      const { data: expectations } = await supabase
        .from("job_level_expectations")
        .select("*")
        .eq("company_id", companyId)
        .eq("is_active", true);

      // Fetch completed appraisals with scores
      const { data: participants } = await supabase
        .from("appraisal_participants")
        .select(`
          id,
          employee_id,
          competency_score,
          goal_score,
          appraisal_cycles!inner (company_id)
        `)
        .eq("appraisal_cycles.company_id", companyId)
        .not("competency_score", "is", null)
        .not("goal_score", "is", null);

      if (!participants || !expectations) {
        setLoading(false);
        return;
      }

      // Get employee positions to determine job levels
      const employeeIds = participants.map((p) => p.employee_id);
      const { data: positions } = await supabase
        .from("employee_positions")
        .select(`
          employee_id,
          positions!inner (
            job_id,
            jobs (
              id,
              job_level_id,
              job_grade_id,
              job_levels (id, name),
              job_grades (id, name)
            )
          )
        `)
        .in("employee_id", employeeIds)
        .eq("is_active", true);

      // Get employee names
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", employeeIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));
      const expectationMap = new Map(
        (expectations || []).map((e) => [`${e.job_level}-${e.job_grade}`, e])
      );

      // Build gap data
      const gaps: GapData[] = [];
      const levelGroups = new Map<string, GapData[]>();

      for (const participant of participants) {
        const position = (positions || []).find((p) => p.employee_id === participant.employee_id);
        if (!position) continue;

        const job = (position as any).positions?.jobs;
        if (!job) continue;

        const levelName = job.job_levels?.name || "";
        const gradeName = job.job_grades?.name || "";
        const expectation = expectationMap.get(`${levelName}-${gradeName}`);

        if (!expectation) continue;

        const expectedGoal = (expectation as any).min_overall_score || 70;
        const competencyGap = (participant.competency_score || 0) - expectation.min_competency_score;
        const goalGap = (participant.goal_score || 0) - expectedGoal;
        const status: "exceeds" | "meets" | "below" =
          competencyGap >= 0 && goalGap >= 0
            ? competencyGap > 5 || goalGap > 5
              ? "exceeds"
              : "meets"
            : "below";

        const gapEntry: GapData = {
          employee_name: profileMap.get(participant.employee_id) || "Unknown",
          job_level: levelName || "Unknown",
          job_grade: gradeName || "Unknown",
          competency_score: participant.competency_score || 0,
          expected_competency: expectation.min_competency_score,
          goal_score: participant.goal_score || 0,
          expected_goal: expectedGoal,
          competency_gap: competencyGap,
          goal_gap: goalGap,
          status,
        };

        gaps.push(gapEntry);

        const key = `${job.job_levels?.name || "Unknown"}-${job.job_grades?.name || "Unknown"}`;
        if (!levelGroups.has(key)) {
          levelGroups.set(key, []);
        }
        levelGroups.get(key)!.push(gapEntry);
      }

      // Build level summary
      const summaries: LevelSummary[] = [];
      levelGroups.forEach((entries, key) => {
        const [level, grade] = key.split("-");
        summaries.push({
          level,
          grade,
          employee_count: entries.length,
          avg_competency_gap:
            entries.reduce((sum, e) => sum + e.competency_gap, 0) / entries.length,
          avg_goal_gap: entries.reduce((sum, e) => sum + e.goal_gap, 0) / entries.length,
          exceeds_count: entries.filter((e) => e.status === "exceeds").length,
          meets_count: entries.filter((e) => e.status === "meets").length,
          below_count: entries.filter((e) => e.status === "below").length,
        });
      });

      setGapData(gaps);
      setLevelSummary(summaries);
    } catch (error) {
      console.error("Error fetching gap data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = gapData.filter((d) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (filterLevel !== "all" && d.job_level !== filterLevel) return false;
    return true;
  });

  const uniqueLevels = [...new Set(gapData.map((d) => d.job_level))];

  const chartData = levelSummary.map((s) => ({
    name: `${s.level} - ${s.grade}`,
    exceeds: s.exceeds_count,
    meets: s.meets_count,
    below: s.below_count,
  }));

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalBelow = gapData.filter((d) => d.status === "below").length;
  const totalExceeds = gapData.filter((d) => d.status === "exceeds").length;
  const totalMeets = gapData.filter((d) => d.status === "meets").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gapData.length}</div>
          </CardContent>
        </Card>

        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-success" />
              Exceeds Expectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalExceeds}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {gapData.length > 0 ? ((totalExceeds / gapData.length) * 100).toFixed(0) : 0}% of workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              Meets Expectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {gapData.length > 0 ? ((totalMeets / gapData.length) * 100).toFixed(0) : 0}% of workforce
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Below Expectations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{totalBelow}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {gapData.length > 0 ? ((totalBelow / gapData.length) * 100).toFixed(0) : 0}% need development
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Level Summary Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Performance by Job Level
            </CardTitle>
            <CardDescription>
              Distribution of performance against level expectations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="exceeds" name="Exceeds" stackId="a" fill="hsl(var(--success))" />
                  <Bar dataKey="meets" name="Meets" stackId="a" fill="hsl(var(--primary))" />
                  <Bar dataKey="below" name="Below" stackId="a" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Gap Analysis Details</CardTitle>
              <CardDescription>Individual employee performance vs expectations</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {uniqueLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="exceeds">Exceeds</SelectItem>
                  <SelectItem value="meets">Meets</SelectItem>
                  <SelectItem value="below">Below</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No data available</p>
            ) : (
              filteredData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{entry.employee_name}</p>
                      <Badge variant="outline" className="text-xs">
                        {entry.job_level} - {entry.job_grade}
                      </Badge>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Competency:</span>{" "}
                        <span className={entry.competency_gap >= 0 ? "text-success" : "text-destructive"}>
                          {entry.competency_score.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground"> / {entry.expected_competency}</span>
                        <span className={`ml-1 ${entry.competency_gap >= 0 ? "text-success" : "text-destructive"}`}>
                          ({entry.competency_gap >= 0 ? "+" : ""}{entry.competency_gap.toFixed(1)})
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Goals:</span>{" "}
                        <span className={entry.goal_gap >= 0 ? "text-success" : "text-destructive"}>
                          {entry.goal_score.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground"> / {entry.expected_goal}%</span>
                        <span className={`ml-1 ${entry.goal_gap >= 0 ? "text-success" : "text-destructive"}`}>
                          ({entry.goal_gap >= 0 ? "+" : ""}{entry.goal_gap.toFixed(1)})
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      entry.status === "exceeds"
                        ? "default"
                        : entry.status === "below"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {entry.status === "exceeds"
                      ? "Exceeds"
                      : entry.status === "meets"
                      ? "Meets"
                      : "Below"}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
