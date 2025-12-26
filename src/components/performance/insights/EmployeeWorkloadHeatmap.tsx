import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import { useEmployeeWorkload, EmployeeWorkloadData } from "@/hooks/performance/useEmployeeWorkload";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EmployeeWorkloadHeatmapProps {
  companyId: string | undefined;
  departmentId?: string;
}

function WorkloadCell({ employee }: { employee: EmployeeWorkloadData }) {
  const getBackgroundColor = () => {
    if (employee.status === 'critical') return 'bg-destructive/20 border-destructive';
    if (employee.status === 'warning') return 'bg-warning/20 border-warning';
    return 'bg-primary/10 border-primary/30';
  };

  return (
    <div className={cn(
      "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
      getBackgroundColor()
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-sm truncate max-w-[120px]" title={employee.employeeName}>
          {employee.employeeName}
        </span>
        <Badge 
          variant={employee.status === 'critical' ? 'destructive' : 
                   employee.status === 'warning' ? 'secondary' : 'outline'}
          className="text-xs"
        >
          {employee.workloadScore}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>Goals:</span>
          <span>{employee.activeGoalCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Weight:</span>
          <span className={employee.totalWeighting > 100 ? 'text-destructive' : ''}>
            {employee.totalWeighting}%
          </span>
        </div>
        {employee.overdueCount > 0 && (
          <div className="flex justify-between text-destructive">
            <span>Overdue:</span>
            <span>{employee.overdueCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmployeeWorkloadHeatmap({ companyId, departmentId }: EmployeeWorkloadHeatmapProps) {
  const { data: metrics, isLoading } = useEmployeeWorkload(companyId, departmentId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{metrics.totalEmployees}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{metrics.healthyCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-warning">{metrics.warningCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overloaded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{metrics.overloadedCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Workload Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workload Distribution</CardTitle>
            <CardDescription>Employee count by workload score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.workloadDistribution.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="range"
                    label={({ range, count }) => `${count}`}
                  >
                    {metrics.workloadDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Average Workload Score</CardTitle>
            <CardDescription>Company-wide average workload intensity</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[250px]">
            <div 
              className={cn(
                "w-32 h-32 rounded-full flex items-center justify-center border-4",
                metrics.avgWorkloadScore > 150 ? "border-destructive bg-destructive/10" :
                metrics.avgWorkloadScore > 100 ? "border-warning bg-warning/10" :
                "border-primary bg-primary/10"
              )}
            >
              <span className="text-4xl font-bold">{metrics.avgWorkloadScore}</span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-sm">
                {metrics.avgWorkloadScore <= 100 && "Workload is balanced"}
                {metrics.avgWorkloadScore > 100 && metrics.avgWorkloadScore <= 150 && "Workload is elevated"}
                {metrics.avgWorkloadScore > 150 && "Workload is critical"}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>&lt;100: Healthy</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span>100-150: Warning</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span>&gt;150: Critical</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workload Heatmap Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Workload Heatmap</CardTitle>
          <CardDescription>Visual representation of individual workload levels</CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees with active goals found
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {metrics.employees.slice(0, 24).map((employee) => (
                <WorkloadCell key={employee.employeeId} employee={employee} />
              ))}
            </div>
          )}
          {metrics.employees.length > 24 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Showing top 24 of {metrics.employees.length} employees. View full list in the table below.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
