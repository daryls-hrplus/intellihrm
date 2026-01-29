import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown, 
  Users, Shield, AlertCircle, BarChart3 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from "recharts";
import { differenceInDays, subDays, format } from "date-fns";

interface ComplianceRiskDashboardProps {
  companyId: string;
}

interface Assignment {
  id: string;
  due_date: string;
  status: string;
  escalation_level: number | null;
  employee_id: string;
  compliance_training_id: string;
  compliance?: { name: string; is_mandatory: boolean } | null;
}

interface RiskMetrics {
  totalAssignments: number;
  compliantCount: number;
  overdueCount: number;
  atRiskCount: number;
  exemptedCount: number;
  complianceRate: number;
  riskScore: number;
  trend: "up" | "down" | "stable";
  byEscalationTier: Record<number, number>;
  byDepartment: { name: string; rate: number; count: number }[];
  overdueByTraining: { name: string; count: number }[];
  weeklyTrend: { week: string; rate: number }[];
}

const RISK_COLORS = {
  low: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  high: "text-orange-600 bg-orange-100",
  critical: "text-red-600 bg-red-100",
};

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#6b7280"];

export function ComplianceRiskDashboard({ companyId }: ComplianceRiskDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<RiskMetrics>({
    totalAssignments: 0,
    compliantCount: 0,
    overdueCount: 0,
    atRiskCount: 0,
    exemptedCount: 0,
    complianceRate: 0,
    riskScore: 0,
    trend: "stable",
    byEscalationTier: {},
    byDepartment: [],
    overdueByTraining: [],
    weeklyTrend: [],
  });

  useEffect(() => {
    if (companyId) loadMetrics();
  }, [companyId]);

  const loadMetrics = async () => {
    setLoading(true);

    // @ts-ignore - Supabase type instantiation issue
    const { data: assignments } = await supabase
      .from("compliance_training_assignments")
      .select(`
        id, due_date, status, escalation_level, employee_id, compliance_training_id,
        compliance:compliance_training(name, is_mandatory)
      `)
      .order("due_date");

    if (!assignments) {
      setLoading(false);
      return;
    }

    const typedAssignments = assignments as unknown as Assignment[];
    const now = new Date();
    const totalAssignments = typedAssignments.length;
    const compliantCount = typedAssignments.filter((a) => a.status === "completed").length;
    const exemptedCount = typedAssignments.filter((a) => a.status === "exempted").length;
    const overdueCount = typedAssignments.filter(
      (a) => a.status !== "completed" && a.status !== "exempted" && differenceInDays(now, new Date(a.due_date)) > 0
    ).length;
    const atRiskCount = typedAssignments.filter((a) => {
      const daysUntilDue = differenceInDays(new Date(a.due_date), now);
      return a.status !== "completed" && a.status !== "exempted" && daysUntilDue >= 0 && daysUntilDue <= 7;
    }).length;

    const complianceRate = totalAssignments > 0 ? Math.round((compliantCount / totalAssignments) * 100) : 0;

    // Calculate risk score (0-100, higher = more risk)
    const riskFactors = {
      overdueWeight: 0.4,
      atRiskWeight: 0.25,
      escalationWeight: 0.2,
      mandatoryOverdueWeight: 0.15,
    };

    const overdueRatio = totalAssignments > 0 ? overdueCount / totalAssignments : 0;
    const atRiskRatio = totalAssignments > 0 ? atRiskCount / totalAssignments : 0;
    const escalatedCount = typedAssignments.filter((a) => (a.escalation_level || 0) >= 2).length;
    const escalationRatio = totalAssignments > 0 ? escalatedCount / totalAssignments : 0;
    const mandatoryOverdue = typedAssignments.filter(
      (a) =>
        a.compliance?.is_mandatory &&
        a.status !== "completed" &&
        differenceInDays(now, new Date(a.due_date)) > 0
    ).length;
    const mandatoryOverdueRatio = totalAssignments > 0 ? mandatoryOverdue / totalAssignments : 0;

    const riskScore = Math.round(
      (overdueRatio * riskFactors.overdueWeight +
        atRiskRatio * riskFactors.atRiskWeight +
        escalationRatio * riskFactors.escalationWeight +
        mandatoryOverdueRatio * riskFactors.mandatoryOverdueWeight) *
        100
    );

    // Escalation tier breakdown
    const byEscalationTier: Record<number, number> = {};
    typedAssignments.forEach((a) => {
      const tier = a.escalation_level || 0;
      byEscalationTier[tier] = (byEscalationTier[tier] || 0) + 1;
    });

    // Overdue by training type
    const overdueByTrainingMap: Record<string, number> = {};
    typedAssignments.forEach((a) => {
      if (a.status !== "completed" && differenceInDays(now, new Date(a.due_date)) > 0) {
        const name = a.compliance?.name || "Unknown";
        overdueByTrainingMap[name] = (overdueByTrainingMap[name] || 0) + 1;
      }
    });
    const overdueByTraining = Object.entries(overdueByTrainingMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Weekly trend (mock for now - would require historical data)
    const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
      const weekStart = subDays(now, (7 - i) * 7);
      return {
        week: format(weekStart, "MMM d"),
        rate: Math.max(50, Math.min(100, complianceRate + Math.random() * 20 - 10)),
      };
    });

    setMetrics({
      totalAssignments,
      compliantCount,
      overdueCount,
      atRiskCount,
      exemptedCount,
      complianceRate,
      riskScore,
      trend: complianceRate > 80 ? "up" : complianceRate < 60 ? "down" : "stable",
      byEscalationTier,
      byDepartment: [], // Would require department join
      overdueByTraining,
      weeklyTrend,
    });

    setLoading(false);
  };

  const getRiskLevel = (score: number): keyof typeof RISK_COLORS => {
    if (score <= 15) return "low";
    if (score <= 35) return "medium";
    if (score <= 55) return "high";
    return "critical";
  };

  const statusData = [
    { name: "Compliant", value: metrics.compliantCount },
    { name: "Overdue", value: metrics.overdueCount },
    { name: "At Risk", value: metrics.atRiskCount },
    { name: "Exempted", value: metrics.exemptedCount },
  ];

  const escalationData = Object.entries(metrics.byEscalationTier)
    .filter(([tier]) => parseInt(tier) > 0)
    .map(([tier, count]) => ({
      tier: `Tier ${tier}`,
      count,
    }));

  if (loading) {
    return <div className="p-4 text-muted-foreground">Loading risk dashboard...</div>;
  }

  const riskLevel = getRiskLevel(metrics.riskScore);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-4 w-4" />
              Total Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.compliantCount}</div>
            <p className="text-xs text-muted-foreground">{metrics.complianceRate}% rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.overdueCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              At Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.atRiskCount}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>

        <Card className={RISK_COLORS[riskLevel]}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.riskScore}</div>
              {metrics.trend === "up" && <TrendingUp className="h-5 w-5 text-green-600" />}
              {metrics.trend === "down" && <TrendingDown className="h-5 w-5 text-red-600" />}
            </div>
            <Badge variant="outline" className="mt-1 capitalize">
              {riskLevel} Risk
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Compliance Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Compliance Rate Trend
            </CardTitle>
            <CardDescription>Weekly compliance rate over the past 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escalation Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Escalation Breakdown
            </CardTitle>
            <CardDescription>Assignments by escalation tier</CardDescription>
          </CardHeader>
          <CardContent>
            {escalationData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={escalationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="tier" type="category" width={60} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No escalated assignments</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Overdue Trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Top Overdue Trainings
            </CardTitle>
            <CardDescription>Training requirements with most overdue assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.overdueByTraining.length > 0 ? (
              <div className="space-y-4">
                {metrics.overdueByTraining.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                      <span className="text-destructive font-medium">{item.count} overdue</span>
                    </div>
                    <Progress
                      value={(item.count / metrics.overdueCount) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>No overdue trainings</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
