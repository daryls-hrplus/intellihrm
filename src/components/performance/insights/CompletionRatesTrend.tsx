import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend 
} from "recharts";
import { TrendingUp, Target, CheckCircle, Clock, XCircle } from "lucide-react";
import { useGoalCompletionRates } from "@/hooks/performance/useGoalCompletionRates";
import { Skeleton } from "@/components/ui/skeleton";

interface CompletionRatesTrendProps {
  companyId: string | undefined;
}

export function CompletionRatesTrend({ companyId }: CompletionRatesTrendProps) {
  const { data: metrics, isLoading } = useGoalCompletionRates(companyId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!metrics) return null;

  const statusData = [
    { name: 'Completed', value: metrics.completedGoals, color: 'hsl(var(--primary))' },
    { name: 'In Progress', value: metrics.inProgressGoals, color: 'hsl(142, 76%, 36%)' },
    { name: 'Not Started', value: metrics.notStartedGoals, color: 'hsl(var(--muted))' },
    { name: 'Cancelled', value: metrics.cancelledGoals, color: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{metrics.overallCompletionRate}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{metrics.totalGoals}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{metrics.completedGoals}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">{metrics.inProgressGoals}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{metrics.cancelledGoals}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Completion Rate Trend
            </CardTitle>
            <CardDescription>Monthly goal completion rates over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
            <CardDescription>Current status of all goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* By Department */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate by Department</CardTitle>
          <CardDescription>Compare completion rates across departments</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.byDepartment.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No department data available
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.byDepartment.map((dept) => (
                <div key={dept.departmentId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.departmentName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {dept.completedGoals}/{dept.totalGoals}
                      </Badge>
                      <span className="font-bold w-12 text-right">{dept.completionRate}%</span>
                    </div>
                  </div>
                  <Progress value={dept.completionRate} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* By Level */}
      <Card>
        <CardHeader>
          <CardTitle>Completion Rate by Goal Level</CardTitle>
          <CardDescription>How different goal levels are performing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.byLevel.map((level) => (
              <div 
                key={level.level} 
                className="p-4 rounded-lg border bg-card text-center"
              >
                <h4 className="font-medium mb-2">{level.level}</h4>
                <div className="text-3xl font-bold mb-2">{level.completionRate}%</div>
                <p className="text-sm text-muted-foreground">
                  {level.completedGoals} of {level.totalGoals} completed
                </p>
                <Progress value={level.completionRate} className="mt-3 h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
