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
  Legend,
} from "recharts";

interface Goal {
  id: string;
  title: string;
  status: string;
  progress_percentage: number;
  employee_name?: string;
  employee_id: string | null;
  due_date: string | null;
}

interface DirectReport {
  employee_id: string;
  employee_name: string;
}

interface TeamGoalsAnalyticsProps {
  teamGoals: Goal[];
  completedGoals: Goal[];
  directReports: DirectReport[];
}

const COLORS = {
  active: "hsl(var(--primary))",
  in_progress: "hsl(var(--info))",
  overdue: "hsl(var(--warning))",
  completed: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
  draft: "hsl(var(--muted))",
};

export function TeamGoalsAnalytics({ teamGoals, completedGoals, directReports }: TeamGoalsAnalyticsProps) {
  // Calculate status distribution
  const allGoals = [...teamGoals, ...completedGoals];
  const statusCounts = allGoals.reduce((acc, goal) => {
    const status = goal.status === "overdue" || (goal.due_date && new Date(goal.due_date) < new Date() && goal.status !== "completed") 
      ? "overdue" 
      : goal.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
    value,
    color: COLORS[name as keyof typeof COLORS] || COLORS.draft,
  }));

  // Calculate progress by employee
  const employeeProgress = directReports.map(report => {
    const employeeGoals = teamGoals.filter(g => g.employee_id === report.employee_id);
    const avgProgress = employeeGoals.length > 0
      ? Math.round(employeeGoals.reduce((sum, g) => sum + g.progress_percentage, 0) / employeeGoals.length)
      : 0;
    const goalCount = employeeGoals.length;
    return {
      name: report.employee_name.split(" ")[0],
      fullName: report.employee_name,
      progress: avgProgress,
      goals: goalCount,
    };
  }).filter(e => e.goals > 0);

  // Team average progress
  const teamAvgProgress = teamGoals.length > 0
    ? Math.round(teamGoals.reduce((sum, g) => sum + g.progress_percentage, 0) / teamGoals.length)
    : 0;

  // On-track vs at-risk
  const now = new Date();
  const atRiskGoals = teamGoals.filter(g => {
    if (!g.due_date) return false;
    const dueDate = new Date(g.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(100, ((30 - daysUntilDue) / 30) * 100);
    return g.progress_percentage < expectedProgress - 20;
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Team Progress Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Team Avg. Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{teamAvgProgress}%</div>
          <Progress value={teamAvgProgress} className="mt-2 h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{teamGoals.length} active goals</span>
            <span>{atRiskGoals.length} at risk</span>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Goal Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress by Employee */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progress by Employee</CardTitle>
        </CardHeader>
        <CardContent>
          {employeeProgress.length > 0 ? (
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeProgress} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Progress"]}
                    labelFormatter={(label) => employeeProgress.find(e => e.name === label)?.fullName || label}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[140px] text-muted-foreground text-sm">
              No goals assigned yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
