import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay, differenceInDays } from "date-fns";

interface Goal {
  id: string;
  title: string;
  status: string;
  progress_percentage: number;
  employee_id: string | null;
  employee_name?: string;
  due_date: string | null;
}

interface CheckIn {
  id: string;
  goal_id: string;
  status: string;
  check_in_date: string;
  employee_submitted_at: string | null;
  created_at: string;
}

interface ProgressEntry {
  goal_id: string;
  progress_percentage: number;
  recorded_at: string;
}

interface ProgressVisualizationDashboardProps {
  teamGoals: Goal[];
  directReports: { employee_id: string; employee_name: string }[];
}

const COLORS = {
  on_track: "hsl(var(--success))",
  submitted: "hsl(var(--primary))",
  overdue: "hsl(var(--warning))",
  pending: "hsl(var(--muted))",
};

export function ProgressVisualizationDashboard({
  teamGoals,
  directReports,
}: ProgressVisualizationDashboardProps) {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamGoals.length > 0) {
      fetchData();
    }
  }, [teamGoals]);

  const fetchData = async () => {
    const goalIds = teamGoals.map(g => g.id);
    
    // Fetch check-ins for team goals
    const { data: checkInData } = await supabase
      .from("goal_check_ins")
      .select("*")
      .in("goal_id", goalIds)
      .order("created_at", { ascending: false });

    // Fetch progress history for team goals
    const { data: historyData } = await supabase
      .from("goal_progress_history")
      .select("*")
      .in("goal_id", goalIds)
      .gte("recorded_at", subDays(new Date(), 30).toISOString())
      .order("recorded_at", { ascending: true });

    setCheckIns(checkInData || []);
    setProgressHistory(historyData || []);
    setLoading(false);
  };

  // Calculate check-in compliance metrics
  const now = new Date();
  const overdueCheckIns = checkIns.filter(
    c => c.status === "pending" && c.check_in_date && new Date(c.check_in_date) < now
  );
  const submittedCheckIns = checkIns.filter(c =>
    c.status === "employee_submitted" || c.status === "completed"
  );
  const pendingManagerReview = checkIns.filter(c => c.status === "employee_submitted");

  // Check-in compliance rate
  const totalDueCheckIns = checkIns.filter(c => c.check_in_date && new Date(c.check_in_date) <= now);
  const complianceRate = totalDueCheckIns.length > 0
    ? Math.round((submittedCheckIns.length / totalDueCheckIns.length) * 100)
    : 100;

  // Progress trend data (last 30 days)
  const progressTrendData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(now, 29 - i);
    const dayStr = format(date, "MMM d");
    
    const dayEntries = progressHistory.filter(p => 
      startOfDay(new Date(p.recorded_at)).getTime() === startOfDay(date).getTime()
    );
    
    const avgProgress = dayEntries.length > 0
      ? Math.round(dayEntries.reduce((sum, p) => sum + p.progress_percentage, 0) / dayEntries.length)
      : null;
    
    return { date: dayStr, progress: avgProgress };
  }).filter(d => d.progress !== null);

  // Employee progress heatmap data
  const employeeProgressData = directReports.map(report => {
    const employeeGoals = teamGoals.filter(g => g.employee_id === report.employee_id);
    const avgProgress = employeeGoals.length > 0
      ? Math.round(employeeGoals.reduce((sum, g) => sum + g.progress_percentage, 0) / employeeGoals.length)
      : 0;
    
    const employeeCheckIns = checkIns.filter(c => 
      employeeGoals.some(g => g.id === c.goal_id)
    );
    const submittedCount = employeeCheckIns.filter(c => 
      c.status === "employee_submitted" || c.status === "completed"
    ).length;
    const pendingCount = employeeCheckIns.filter(c => c.status === "pending").length;
    
    return {
      name: report.employee_name.split(" ")[0],
      fullName: report.employee_name,
      progress: avgProgress,
      goalCount: employeeGoals.length,
      submitted: submittedCount,
      pending: pendingCount,
    };
  }).filter(e => e.goalCount > 0);

  // Check-in status distribution
  const checkInStatusData = [
    { name: "Completed", value: checkIns.filter(c => c.status === "completed").length, color: COLORS.on_track },
    { name: "Awaiting Review", value: pendingManagerReview.length, color: COLORS.submitted },
    { name: "Overdue", value: overdueCheckIns.length, color: COLORS.overdue },
    { name: "Pending", value: checkIns.filter(c => c.status === "pending").length, color: COLORS.pending },
  ].filter(d => d.value > 0);

  // Milestone progress by employee
  const getMilestoneStats = async () => {
    const goalIds = teamGoals.map(g => g.id);
    const { data } = await supabase
      .from("goal_milestones")
      .select("*")
      .in("goal_id", goalIds);
    return data || [];
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading progress data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check-in Compliance</p>
                <p className="text-2xl font-bold">{complianceRate}%</p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                complianceRate >= 80 ? "bg-success/10" : complianceRate >= 60 ? "bg-warning/10" : "bg-destructive/10"
              }`}>
                <CheckCircle className={`h-5 w-5 ${
                  complianceRate >= 80 ? "text-success" : complianceRate >= 60 ? "text-warning" : "text-destructive"
                }`} />
              </div>
            </div>
            <Progress value={complianceRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Review</p>
                <p className="text-2xl font-bold">{pendingManagerReview.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Employee check-ins to review</p>
          </CardContent>
        </Card>

        <Card className={overdueCheckIns.length > 0 ? "border-warning/50" : ""}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Check-ins</p>
                <p className={`text-2xl font-bold ${overdueCheckIns.length > 0 ? "text-warning" : ""}`}>
                  {overdueCheckIns.length}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                overdueCheckIns.length > 0 ? "bg-warning/10" : "bg-muted"
              }`}>
                <AlertCircle className={`h-5 w-5 ${overdueCheckIns.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Require follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Check-ins</p>
                <p className="text-2xl font-bold">{checkIns.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-info" />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Total this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Progress Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Team Progress Trend (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progressTrendData.length > 0 ? (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressTrendData}>
                    <defs>
                      <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10 }} 
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Avg Progress"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="progress"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#progressGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                No progress data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Check-in Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Check-in Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkInStatusData.length > 0 ? (
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={checkInStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {checkInStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center">
                  {checkInStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                No check-in data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Progress Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Progress & Check-in Compliance by Employee
          </CardTitle>
          <CardDescription>Compare goal progress and check-in submissions across team members</CardDescription>
        </CardHeader>
        <CardContent>
          {employeeProgressData.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeProgressData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "progress" ? `${value}%` : value,
                      name === "progress" ? "Avg Progress" : name === "submitted" ? "Check-ins Submitted" : "Check-ins Pending"
                    ]}
                    labelFormatter={(label) => employeeProgressData.find(e => e.name === label)?.fullName || label}
                  />
                  <Legend />
                  <Bar dataKey="progress" name="Progress %" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No employee data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
