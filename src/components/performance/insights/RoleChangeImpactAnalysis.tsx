import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch, TrendingUp, TrendingDown, Minus, Users, BarChart3, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface RoleChangeImpactAnalysisProps {
  companyId?: string;
  cycleId?: string;
}

interface RoleChangeStats {
  totalParticipants: number;
  withRoleChanges: number;
  withMultiPosition: number;
  avgScoreWithChange: number;
  avgScoreWithoutChange: number;
  avgScoreMultiPosition: number;
}

interface RoleChangeDetail {
  employee_name: string;
  segment_count: number;
  overall_score: number | null;
  score_trend: "up" | "down" | "stable";
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--info))", "hsl(var(--warning))", "hsl(var(--success))"];

export function RoleChangeImpactAnalysis({ companyId, cycleId }: RoleChangeImpactAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RoleChangeStats>({
    totalParticipants: 0,
    withRoleChanges: 0,
    withMultiPosition: 0,
    avgScoreWithChange: 0,
    avgScoreWithoutChange: 0,
    avgScoreMultiPosition: 0,
  });
  const [roleChangeDetails, setRoleChangeDetails] = useState<RoleChangeDetail[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId, cycleId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build query
      let query = supabase
        .from("appraisal_participants")
        .select(`
          id,
          employee_id,
          has_role_change,
          overall_score,
          appraisal_cycles!inner (company_id)
        `)
        .not("overall_score", "is", null);

      if (companyId) {
        query = query.eq("appraisal_cycles.company_id", companyId);
      }
      if (cycleId) {
        query = query.eq("cycle_id", cycleId);
      }

      const { data: participants, error } = await query;

      if (error) throw error;

      // Get position weight counts
      const participantIds = (participants || []).map((p) => p.id);
      const { data: positionWeights } = await supabase
        .from("appraisal_position_weights")
        .select("participant_id")
        .in("participant_id", participantIds);

      // Count multi-position participants
      const multiPositionParticipantIds = new Set<string>();
      const positionCountMap = new Map<string, number>();
      (positionWeights || []).forEach((pw) => {
        const count = (positionCountMap.get(pw.participant_id) || 0) + 1;
        positionCountMap.set(pw.participant_id, count);
        if (count > 1) {
          multiPositionParticipantIds.add(pw.participant_id);
        }
      });

      // Calculate stats
      const withRoleChanges = (participants || []).filter((p) => p.has_role_change);
      const withMultiPosition = (participants || []).filter((p) =>
        multiPositionParticipantIds.has(p.id)
      );
      const withoutChanges = (participants || []).filter(
        (p) => !p.has_role_change && !multiPositionParticipantIds.has(p.id)
      );

      const avgScore = (arr: any[]) =>
        arr.length > 0
          ? arr.reduce((sum, p) => sum + (p.overall_score || 0), 0) / arr.length
          : 0;

      setStats({
        totalParticipants: (participants || []).length,
        withRoleChanges: withRoleChanges.length,
        withMultiPosition: withMultiPosition.length,
        avgScoreWithChange: avgScore(withRoleChanges),
        avgScoreWithoutChange: avgScore(withoutChanges),
        avgScoreMultiPosition: avgScore(withMultiPosition),
      });

      // Get employee names for role changes
      if (withRoleChanges.length > 0) {
        const employeeIds = withRoleChanges.map((p) => p.employee_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", employeeIds);

        const profileMap = new Map(
          (profiles || []).map((p) => [p.id, p.full_name])
        );

        // Get segment counts
        const { data: segments } = await supabase
          .from("appraisal_role_segments")
          .select("participant_id")
          .in("participant_id", withRoleChanges.map((p) => p.id));

        const segmentCountMap = new Map<string, number>();
        (segments || []).forEach((s) => {
          segmentCountMap.set(s.participant_id, (segmentCountMap.get(s.participant_id) || 0) + 1);
        });

        setRoleChangeDetails(
          withRoleChanges.slice(0, 10).map((p) => ({
            employee_name: profileMap.get(p.employee_id) || "Unknown",
            segment_count: segmentCountMap.get(p.id) || 1,
            overall_score: p.overall_score,
            score_trend:
              p.overall_score && p.overall_score > stats.avgScoreWithoutChange
                ? "up"
                : p.overall_score && p.overall_score < stats.avgScoreWithoutChange
                ? "down"
                : "stable",
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching role change impact:", error);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = [
    { name: "No Changes", value: stats.totalParticipants - stats.withRoleChanges - stats.withMultiPosition, fill: COLORS[0] },
    { name: "Role Changes", value: stats.withRoleChanges, fill: COLORS[1] },
    { name: "Multi-Position", value: stats.withMultiPosition, fill: COLORS[2] },
  ].filter((d) => d.value > 0);

  const comparisonData = [
    { name: "No Changes", score: stats.avgScoreWithoutChange },
    { name: "Role Changes", score: stats.avgScoreWithChange },
    { name: "Multi-Position", score: stats.avgScoreMultiPosition },
  ].filter((d) => d.score > 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  const roleChangePercentage = stats.totalParticipants > 0 
    ? ((stats.withRoleChanges + stats.withMultiPosition) / stats.totalParticipants * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
          </CardContent>
        </Card>

        <Card className="border-info/30 bg-info/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <GitBranch className="h-4 w-4 text-info" />
              With Role Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.withRoleChanges}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Score: {stats.avgScoreWithChange.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              Multi-Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.withMultiPosition}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg Score: {stats.avgScoreMultiPosition.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Complex Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleChangePercentage}%</div>
            <p className="text-xs text-muted-foreground mt-1">of workforce</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribution Overview
            </CardTitle>
            <CardDescription>
              Breakdown of participants by assignment complexity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score Comparison
            </CardTitle>
            <CardDescription>
              Average scores by assignment type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Change Details */}
      {roleChangeDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Role Change Details
            </CardTitle>
            <CardDescription>
              Employees who changed roles during the appraisal period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roleChangeDetails.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {detail.score_trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-success" />
                      ) : detail.score_trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{detail.employee_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {detail.segment_count} role segment{detail.segment_count > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {detail.overall_score !== null ? `${detail.overall_score.toFixed(1)}%` : "N/A"}
                    </p>
                    <Badge
                      variant={
                        detail.score_trend === "up"
                          ? "default"
                          : detail.score_trend === "down"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {detail.score_trend === "up"
                        ? "Above Avg"
                        : detail.score_trend === "down"
                        ? "Below Avg"
                        : "Average"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
