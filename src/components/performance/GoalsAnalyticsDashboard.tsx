import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { isPast } from "date-fns";

interface Goal {
  id: string;
  title: string;
  status: string;
  progress_percentage: number;
  due_date: string | null;
  goal_type?: string;
  goal_level?: string;
  category?: string | null;
}

interface GoalsAnalyticsDashboardProps {
  goals: Goal[];
  showTypeDistribution?: boolean;
  showLevelDistribution?: boolean;
  compact?: boolean;
}

const COLORS = {
  active: "hsl(var(--primary))",
  in_progress: "hsl(var(--info))",
  overdue: "hsl(var(--warning))",
  completed: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
  draft: "hsl(var(--muted-foreground))",
};

const TYPE_COLORS = {
  smart_goal: "hsl(var(--primary))",
  okr_objective: "hsl(var(--info))",
  okr_key_result: "hsl(var(--success))",
};

const LEVEL_COLORS = {
  company: "hsl(var(--primary))",
  department: "hsl(var(--info))",
  team: "hsl(var(--success))",
  individual: "hsl(var(--warning))",
};

export function GoalsAnalyticsDashboard({ 
  goals, 
  showTypeDistribution = true, 
  showLevelDistribution = true,
  compact = false,
}: GoalsAnalyticsDashboardProps) {
  // Calculate status distribution
  const statusCounts = goals.reduce((acc, goal) => {
    const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
    const status = isOverdue ? "overdue" : goal.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
    value,
    color: COLORS[name as keyof typeof COLORS] || COLORS.draft,
  }));

  // Calculate type distribution
  const typeCounts = goals.reduce((acc, goal) => {
    if (goal.goal_type) {
      acc[goal.goal_type] = (acc[goal.goal_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const typeData = Object.entries(typeCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    value,
    color: TYPE_COLORS[name as keyof typeof TYPE_COLORS] || COLORS.draft,
  }));

  // Calculate level distribution
  const levelCounts = goals.reduce((acc, goal) => {
    if (goal.goal_level) {
      acc[goal.goal_level] = (acc[goal.goal_level] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const levelData = Object.entries(levelCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: LEVEL_COLORS[name as keyof typeof LEVEL_COLORS] || COLORS.draft,
  }));

  // Progress distribution
  const progressBuckets = [
    { range: "0-25%", min: 0, max: 25 },
    { range: "26-50%", min: 26, max: 50 },
    { range: "51-75%", min: 51, max: 75 },
    { range: "76-99%", min: 76, max: 99 },
    { range: "100%", min: 100, max: 100 },
  ];

  const progressData = progressBuckets.map(bucket => ({
    name: bucket.range,
    count: goals.filter(g => 
      g.progress_percentage >= bucket.min && 
      g.progress_percentage <= bucket.max
    ).length,
  }));

  // Average progress
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length)
    : 0;

  // At-risk goals (due soon with low progress)
  const now = new Date();
  const atRiskGoals = goals.filter(g => {
    if (!g.due_date || g.status === "completed") return false;
    const dueDate = new Date(g.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 14 && daysUntilDue > 0 && g.progress_percentage < 70;
  });

  const overdueGoals = goals.filter(g => 
    g.due_date && isPast(new Date(g.due_date)) && g.status !== "completed"
  );

  const gridCols = compact ? "md:grid-cols-2" : "md:grid-cols-4";
  const chartHeight = compact ? 100 : 120;

  return (
    <div className="space-y-4">
      {/* Key Metrics Row */}
      <div className={`grid gap-4 ${gridCols}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{avgProgress}%</div>
            <Progress value={avgProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className={overdueGoals.length > 0 ? "border-warning/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueGoals.length > 0 ? "text-warning" : ""}`}>
              {overdueGoals.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueGoals.length > 0 ? "Needs attention" : "All on track"}
            </p>
          </CardContent>
        </Card>

        <Card className={atRiskGoals.length > 0 ? "border-warning/30" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${atRiskGoals.length > 0 ? "text-warning" : ""}`}>
              {atRiskGoals.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Due soon, low progress
            </p>
          </CardContent>
        </Card>

        {!compact && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">
                {goals.length > 0 
                  ? Math.round((goals.filter(g => g.status === "completed").length / goals.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {goals.filter(g => g.status === "completed").length} of {goals.length} completed
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-[${chartHeight}px]`} style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={compact ? 25 : 30}
                    outerRadius={compact ? 40 : 50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, "Goals"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progress Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-[${chartHeight}px]`} style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => [value, "Goals"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Type Distribution */}
        {showTypeDistribution && !compact && typeData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Goal Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`h-[${chartHeight}px]`} style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [value, "Goals"]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {typeData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span>{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
