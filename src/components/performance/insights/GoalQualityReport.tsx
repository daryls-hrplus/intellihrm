import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AlertTriangle, CheckCircle, XCircle, Target, ArrowRight } from "lucide-react";
import { useGoalQualityMetrics, QualityFlag } from "@/hooks/performance/useGoalQualityMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface GoalQualityReportProps {
  companyId: string | undefined;
}

const flagLabels: Record<string, string> = {
  missing_metrics: "Missing Metrics",
  weak_smart: "Weak SMART Criteria",
  no_alignment: "No Parent Alignment",
  orphan_cascade: "Orphan Cascade",
  unrealistic_timeline: "Unrealistic Timeline",
  overweight: "Overweight",
  stale_goal: "Stale Goal",
};

const flagDescriptions: Record<string, string> = {
  missing_metrics: "Goal lacks target value or unit of measure",
  weak_smart: "Less than 3 SMART criteria fields completed",
  no_alignment: "Individual goal with no parent alignment",
  orphan_cascade: "Parent goal cancelled but child still active",
  unrealistic_timeline: "Due date soon but progress is low",
  overweight: "Employee total goal weighting exceeds 100%",
  stale_goal: "No progress update in 30+ days",
};

export function GoalQualityReport({ companyId }: GoalQualityReportProps) {
  const { data: metrics, isLoading } = useGoalQualityMetrics(companyId);

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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalGoals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.avgQualityScore}%</div>
              <Progress value={metrics.avgQualityScore} className="w-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quality Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metrics.qualityFlags.reduce((sum, f) => sum + f.count, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Quality Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {metrics.lowQualityGoals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quality Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Quality Score Distribution
            </CardTitle>
            <CardDescription>Goals grouped by quality score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.qualityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="count"
                    nameKey="range"
                    label={({ range, count }) => count > 0 ? `${range}: ${count}` : ''}
                  >
                    {metrics.qualityDistribution.map((entry, index) => (
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

        {/* Quality Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Quality Flags
            </CardTitle>
            <CardDescription>Common issues affecting goal quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.qualityFlags.length === 0 ? (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="h-5 w-5" />
                  <span>No quality issues detected!</span>
                </div>
              ) : (
                metrics.qualityFlags.map((flag) => (
                  <div key={flag.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {flag.severity === 'high' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        )}
                        <span className="font-medium">{flagLabels[flag.type] || flag.type}</span>
                        <Badge variant={flag.severity === 'high' ? 'destructive' : 'secondary'}>
                          {flag.count}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {flagDescriptions[flag.type]}
                    </p>
                    <Progress 
                      value={(flag.count / metrics.totalGoals) * 100} 
                      className="h-2"
                    />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Quality Goals Table */}
      {metrics.lowQualityGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Goals Needing Attention</CardTitle>
            <CardDescription>Goals with quality score below 50% - consider improving these</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Goal</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Issues</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.lowQualityGoals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {goal.title}
                    </TableCell>
                    <TableCell>{goal.employeeName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-destructive font-medium">{goal.qualityScore}%</span>
                        <Progress value={goal.qualityScore} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {goal.flags.map((flag) => (
                          <Badge key={flag} variant="outline" className="text-xs">
                            {flagLabels[flag] || flag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Improve <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
