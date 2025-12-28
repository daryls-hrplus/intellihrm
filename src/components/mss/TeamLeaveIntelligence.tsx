import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
  RefreshCw,
  ChevronRight,
  Activity,
  Eye,
  UserX,
  Lightbulb,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, isMonday, isFriday, addDays, parseISO, differenceInDays, startOfMonth } from "date-fns";

interface PatternData {
  employeeId: string;
  employeeName: string;
  pattern: string;
  frequency: number;
  riskLevel: "low" | "medium" | "high";
  details: string;
  lastOccurrence: string;
}

interface NoShowPrediction {
  employeeId: string;
  employeeName: string;
  predictedDate: string;
  probability: number;
  factors: string[];
  recommendation: string;
}

interface AbsenceTrendAlert {
  type: "spike" | "pattern" | "threshold" | "coverage";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  affectedCount: number;
  trend: "up" | "down" | "stable";
  actionRequired: boolean;
  suggestedAction: string;
}

export function TeamLeaveIntelligence() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("patterns");

  const managerId = user?.id;

  // Fetch direct reports and their leave data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["team-leave-intelligence", managerId],
    queryFn: async (): Promise<{ directReports: any[]; leaveData: any[] }> => {
      if (!managerId) return { directReports: [], leaveData: [] };

      // Fetch direct reports
      const reportsResult = await supabase
        .from("profiles")
        .select("id, full_name");
      
      const allProfiles = (reportsResult.data || []) as any[];
      const directReports = allProfiles.filter((r: any) => r.manager_id === managerId);
      
      if (directReports.length === 0) return { directReports: [], leaveData: [] };

      const directReportIds = directReports.map((r: any) => r.id);
      const sixMonthsAgo = subMonths(new Date(), 6);
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

      // Fetch leave requests for direct reports
      const leaveResult = await supabase
        .from("leave_requests")
        .select("id, employee_id, start_date, end_date, duration, status, created_at");

      const allLeaves = (leaveResult.data || []) as any[];
      const filteredLeaves = allLeaves.filter((l: any) => 
        directReportIds.includes(l.employee_id) && l.start_date >= sixMonthsAgoStr
      );

      const leaveData = filteredLeaves.map((leave: any) => ({
        ...leave,
        employee: directReports.find((r: any) => r.id === leave.employee_id) || { full_name: "Unknown" }
      }));

      return { directReports, leaveData };
    },
    enabled: !!managerId,
  });

  const directReports = data?.directReports || [];
  const leaveData = data?.leaveData || [];

  // Analyze patterns from leave data
  const patterns: PatternData[] = analyzeTeamPatterns(leaveData);
  const noShowPredictions: NoShowPrediction[] = predictTeamNoShows(leaveData);
  const trendAlerts: AbsenceTrendAlert[] = analyzeTeamTrends(leaveData, directReports.length);

  const highRiskPatterns = patterns.filter(p => p.riskLevel === "high").length;
  const criticalAlerts = trendAlerts.filter(a => a.severity === "critical").length;
  const upcomingPredictions = noShowPredictions.filter(p => p.probability > 0.6).length;

  if (directReports.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Team Leave Intelligence
                <Badge variant="secondary" className="text-xs">AI-Powered</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                Insights for your {directReports.length} direct reports
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-destructive/10 p-3 text-center">
            <div className="text-2xl font-bold text-destructive">{highRiskPatterns}</div>
            <div className="text-xs text-muted-foreground">Risk Patterns</div>
          </div>
          <div className="rounded-lg bg-warning/10 p-3 text-center">
            <div className="text-2xl font-bold text-warning">{upcomingPredictions}</div>
            <div className="text-xs text-muted-foreground">No-Show Risks</div>
          </div>
          <div className="rounded-lg bg-info/10 p-3 text-center">
            <div className="text-2xl font-bold text-info">{criticalAlerts}</div>
            <div className="text-xs text-muted-foreground">Alerts</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patterns" className="text-xs gap-1">
              <Activity className="h-3.5 w-3.5" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="predictions" className="text-xs gap-1">
              <Eye className="h-3.5 w-3.5" />
              No-Show Risk
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Alerts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : patterns.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No patterns detected"
                description="Your team's absence patterns will appear here as data is collected"
              />
            ) : (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {patterns.map((pattern, index) => (
                    <PatternCard key={index} pattern={pattern} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : noShowPredictions.length === 0 ? (
              <EmptyState
                icon={UserX}
                title="No predictions available"
                description="Predictions will appear based on your team's historical patterns"
              />
            ) : (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {noShowPredictions.map((prediction, index) => (
                    <PredictionCard key={index} prediction={prediction} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            {isLoading ? (
              <LoadingSkeleton />
            ) : trendAlerts.length === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No alerts"
                description="Team trend alerts will appear when anomalies are detected"
              />
            ) : (
              <ScrollArea className="h-[280px] pr-4">
                <div className="space-y-3">
                  {trendAlerts.map((alert, index) => (
                    <TrendAlertCard key={index} alert={alert} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Pattern Analysis Card
function PatternCard({ pattern }: { pattern: PatternData }) {
  const riskColors = {
    low: "bg-success/10 text-success border-success/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
  };

  const riskLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return (
    <div className={`rounded-lg border p-3 ${riskColors[pattern.riskLevel]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium text-sm mb-1">{pattern.employeeName}</div>
          <div className="text-sm">{pattern.pattern}</div>
          <p className="text-xs text-muted-foreground mt-1">{pattern.details}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {pattern.frequency}x in 6 months
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last: {pattern.lastOccurrence}
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {riskLabels[pattern.riskLevel]}
        </Badge>
      </div>
    </div>
  );
}

// No-Show Prediction Card
function PredictionCard({ prediction }: { prediction: NoShowPrediction }) {
  const probabilityColor = prediction.probability > 0.7 ? "text-destructive" : prediction.probability > 0.4 ? "text-warning" : "text-success";

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserX className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{prediction.employeeName}</span>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {prediction.predictedDate}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Risk Probability</span>
          <span className={`font-medium ${probabilityColor}`}>
            {Math.round(prediction.probability * 100)}%
          </span>
        </div>
        <Progress value={prediction.probability * 100} className="h-1.5" />
      </div>

      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-1">Factors:</div>
        <div className="flex flex-wrap gap-1">
          {prediction.factors.map((factor, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {factor}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/50 p-2">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">{prediction.recommendation}</p>
      </div>
    </div>
  );
}

// Trend Alert Card
function TrendAlertCard({ alert }: { alert: AbsenceTrendAlert }) {
  const severityConfig = {
    info: { bg: "bg-info/10", border: "border-info/20", icon: Activity, iconColor: "text-info" },
    warning: { bg: "bg-warning/10", border: "border-warning/20", icon: AlertTriangle, iconColor: "text-warning" },
    critical: { bg: "bg-destructive/10", border: "border-destructive/20", icon: Shield, iconColor: "text-destructive" },
  };

  const config = severityConfig[alert.severity];
  const Icon = config.icon;
  const trendIcon = alert.trend === "up" ? "↑" : alert.trend === "down" ? "↓" : "→";

  return (
    <div className={`rounded-lg border p-3 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-1.5 ${config.bg}`}>
          <Icon className={`h-4 w-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm">{alert.title}</span>
            <div className="flex items-center gap-1">
              <span className="text-lg">{trendIcon}</span>
              <Badge variant="outline" className="text-xs">
                {alert.affectedCount} affected
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{alert.description}</p>

          {alert.actionRequired && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-background/50 p-2">
              <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{alert.suggestedAction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

// Pattern analysis for team
function analyzeTeamPatterns(leaveData: any[]): PatternData[] {
  const patterns: PatternData[] = [];
  const employeeLeaves: Record<string, any[]> = {};

  leaveData.forEach((leave) => {
    const empId = leave.employee_id;
    if (!employeeLeaves[empId]) {
      employeeLeaves[empId] = [];
    }
    employeeLeaves[empId].push(leave);
  });

  Object.entries(employeeLeaves).forEach(([empId, leaves]) => {
    if (leaves.length < 2) return;

    const employeeName = leaves[0].employee?.full_name || "Unknown";

    let mondayCount = 0;
    let fridayCount = 0;

    leaves.forEach((leave) => {
      const startDate = parseISO(leave.start_date);
      if (isMonday(startDate)) mondayCount++;
      if (isFriday(startDate)) fridayCount++;
    });

    if (mondayCount >= 3) {
      patterns.push({
        employeeId: empId,
        employeeName,
        pattern: "Monday Absence Pattern",
        frequency: mondayCount,
        riskLevel: mondayCount >= 5 ? "high" : mondayCount >= 4 ? "medium" : "low",
        details: `${mondayCount} absences starting on Monday. Consider discussing work-life balance.`,
        lastOccurrence: format(parseISO(leaves.find(l => isMonday(parseISO(l.start_date)))?.start_date || leaves[0].start_date), "MMM d"),
      });
    }

    if (fridayCount >= 3) {
      patterns.push({
        employeeId: empId,
        employeeName,
        pattern: "Friday Absence Pattern",
        frequency: fridayCount,
        riskLevel: fridayCount >= 5 ? "high" : fridayCount >= 4 ? "medium" : "low",
        details: `${fridayCount} absences including Friday. May indicate weekend extension.`,
        lastOccurrence: format(parseISO(leaves.find(l => isFriday(parseISO(l.start_date)))?.start_date || leaves[0].start_date), "MMM d"),
      });
    }

    const shortNoticeLeaves = leaves.filter((leave) => {
      const created = parseISO(leave.created_at);
      const start = parseISO(leave.start_date);
      return differenceInDays(start, created) <= 1;
    });

    if (shortNoticeLeaves.length >= 3) {
      patterns.push({
        employeeId: empId,
        employeeName,
        pattern: "Short Notice Requests",
        frequency: shortNoticeLeaves.length,
        riskLevel: shortNoticeLeaves.length >= 5 ? "high" : shortNoticeLeaves.length >= 4 ? "medium" : "low",
        details: `${shortNoticeLeaves.length} requests with less than 24 hours notice.`,
        lastOccurrence: format(parseISO(shortNoticeLeaves[0].start_date), "MMM d"),
      });
    }
  });

  return patterns.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
}

// No-show prediction for team
function predictTeamNoShows(leaveData: any[]): NoShowPrediction[] {
  const predictions: NoShowPrediction[] = [];
  const employeeLeaves: Record<string, any[]> = {};

  leaveData.forEach((leave) => {
    const empId = leave.employee_id;
    if (!employeeLeaves[empId]) {
      employeeLeaves[empId] = [];
    }
    employeeLeaves[empId].push(leave);
  });

  Object.entries(employeeLeaves).forEach(([empId, leaves]) => {
    const employeeName = leaves[0].employee?.full_name || "Unknown";

    const factors: string[] = [];
    let probability = 0.2;

    const shortNoticeCount = leaves.filter((leave) => {
      const created = parseISO(leave.created_at);
      const start = parseISO(leave.start_date);
      return differenceInDays(start, created) <= 1;
    }).length;

    if (shortNoticeCount >= 3) {
      factors.push("Short-notice history");
      probability += 0.15;
    }

    const mondayFridayCount = leaves.filter((leave) => {
      const startDate = parseISO(leave.start_date);
      return isMonday(startDate) || isFriday(startDate);
    }).length;

    if (mondayFridayCount >= 3) {
      factors.push("Weekend extension pattern");
      probability += 0.2;
    }

    if (leaves.length >= 6) {
      factors.push("High frequency");
      probability += 0.15;
    }

    const recentLeaves = leaves.filter((leave) => {
      const start = parseISO(leave.start_date);
      return differenceInDays(new Date(), start) <= 30;
    });

    if (recentLeaves.length >= 2) {
      factors.push("Recent spike");
      probability += 0.1;
    }

    if (probability >= 0.4 && factors.length >= 2) {
      const today = new Date();
      let predictedDate = today;
      
      while (!isMonday(predictedDate) && !isFriday(predictedDate)) {
        predictedDate = addDays(predictedDate, 1);
      }

      predictions.push({
        employeeId: empId,
        employeeName,
        predictedDate: format(predictedDate, "EEE, MMM d"),
        probability: Math.min(probability, 0.9),
        factors,
        recommendation: probability > 0.6
          ? "Consider a proactive 1:1 to discuss support needs"
          : "Monitor and maintain regular check-ins",
      });
    }
  });

  return predictions.sort((a, b) => b.probability - a.probability);
}

// Team trend analysis
function analyzeTeamTrends(leaveData: any[], teamSize: number): AbsenceTrendAlert[] {
  const alerts: AbsenceTrendAlert[] = [];
  const now = new Date();
  const currentMonth = startOfMonth(now);
  const lastMonth = startOfMonth(subMonths(now, 1));

  const currentMonthLeaves = leaveData.filter((l) => parseISO(l.start_date) >= currentMonth);
  const lastMonthLeaves = leaveData.filter((l) => {
    const start = parseISO(l.start_date);
    return start >= lastMonth && start < currentMonth;
  });

  // Team coverage alert
  const uniqueAbsentThisMonth = new Set(currentMonthLeaves.map(l => l.employee_id)).size;
  const coveragePercent = teamSize > 0 ? ((teamSize - uniqueAbsentThisMonth) / teamSize) * 100 : 100;

  if (coveragePercent < 70 && teamSize >= 3) {
    alerts.push({
      type: "coverage",
      title: "Team Coverage Risk",
      description: `${uniqueAbsentThisMonth} of ${teamSize} team members have absences this month`,
      severity: coveragePercent < 50 ? "critical" : "warning",
      affectedCount: uniqueAbsentThisMonth,
      trend: "down",
      actionRequired: true,
      suggestedAction: "Review workload distribution and backup coverage",
    });
  }

  // Spike detection
  if (currentMonthLeaves.length > lastMonthLeaves.length * 1.3 && currentMonthLeaves.length >= 3) {
    alerts.push({
      type: "spike",
      title: "Absence Spike",
      description: `${currentMonthLeaves.length} absences this month vs ${lastMonthLeaves.length} last month`,
      severity: currentMonthLeaves.length > lastMonthLeaves.length * 1.5 ? "critical" : "warning",
      affectedCount: currentMonthLeaves.length,
      trend: "up",
      actionRequired: true,
      suggestedAction: "Consider team wellness check-in or workload review",
    });
  }

  // Monday/Friday concentration
  const mondayFridayLeaves = leaveData.filter((l) => {
    const start = parseISO(l.start_date);
    return (isMonday(start) || isFriday(start)) && start >= lastMonth;
  });

  if (mondayFridayLeaves.length >= 5) {
    alerts.push({
      type: "pattern",
      title: "Weekend Extension Pattern",
      description: `${mondayFridayLeaves.length} absences on Mondays/Fridays across team`,
      severity: "warning",
      affectedCount: new Set(mondayFridayLeaves.map(l => l.employee_id)).size,
      trend: "stable",
      actionRequired: true,
      suggestedAction: "Discuss flexible work options with team",
    });
  }

  // Positive trend
  if (currentMonthLeaves.length < lastMonthLeaves.length * 0.7 && lastMonthLeaves.length >= 3) {
    alerts.push({
      type: "pattern",
      title: "Absences Declining",
      description: `Team absences down ${Math.round((1 - currentMonthLeaves.length / lastMonthLeaves.length) * 100)}% from last month`,
      severity: "info",
      affectedCount: currentMonthLeaves.length,
      trend: "down",
      actionRequired: false,
      suggestedAction: "Keep up current engagement practices",
    });
  }

  const severityOrder = { critical: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
