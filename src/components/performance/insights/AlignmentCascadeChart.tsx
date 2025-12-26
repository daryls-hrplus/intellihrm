import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GitBranch, AlertTriangle, CheckCircle, Link2Off } from "lucide-react";
import { useAlignmentAnalytics } from "@/hooks/performance/useAlignmentAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface AlignmentCascadeChartProps {
  companyId: string | undefined;
}

export function AlignmentCascadeChart({ companyId }: AlignmentCascadeChartProps) {
  const { data: metrics, isLoading } = useAlignmentAnalytics(companyId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  if (!metrics) return null;

  const getAlignmentColor = (percentage: number) => {
    if (percentage >= 80) return 'hsl(var(--primary))';
    if (percentage >= 50) return 'hsl(142, 76%, 36%)';
    if (percentage >= 30) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Company Alignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{metrics.companyAlignmentPercentage}%</div>
              <Progress value={metrics.companyAlignmentPercentage} className="w-20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aligned Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{metrics.alignedGoals}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orphan Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Link2Off className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold text-warning">{metrics.orphanGoals}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Broken Chains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{metrics.brokenChains}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Alignment Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Department Alignment
            </CardTitle>
            <CardDescription>Alignment percentage by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {metrics.departmentAlignment.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No department data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.departmentAlignment.slice(0, 8)}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis 
                      type="category" 
                      dataKey="departmentName" 
                      tick={{ fontSize: 12 }}
                      width={75}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Alignment']}
                      labelFormatter={(label) => `Department: ${label}`}
                    />
                    <Bar dataKey="alignmentPercentage" radius={[0, 4, 4, 0]}>
                      {metrics.departmentAlignment.slice(0, 8).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={getAlignmentColor(entry.alignmentPercentage)} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cascade Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Cascade Levels</CardTitle>
            <CardDescription>Distribution of goals across organizational levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {metrics.cascadeLevels.map((level, index) => (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ 
                          backgroundColor: `hsl(var(--primary) / ${1 - index * 0.2})`,
                          color: 'hsl(var(--primary-foreground))'
                        }}
                      >
                        L{index + 1}
                      </div>
                      <span className="font-medium">{level.level}</span>
                    </div>
                    <Badge variant="secondary">{level.count} goals</Badge>
                  </div>
                  <Progress 
                    value={(level.count / Math.max(1, metrics.totalGoals)) * 100} 
                    className="h-2"
                  />
                </div>
              ))}

              {metrics.cascadeLevels.every(l => l.count === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No goals found. Create goals to see cascade levels.
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Ideal cascade:</strong> Company goals cascade to departments, 
                then to teams, and finally to individual contributors.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Details */}
      {metrics.departmentAlignment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Department Alignment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {metrics.departmentAlignment.map((dept) => (
                <div 
                  key={dept.departmentId} 
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium truncate">{dept.departmentName}</h4>
                    <Badge 
                      variant={dept.alignmentPercentage >= 70 ? "default" : 
                               dept.alignmentPercentage >= 40 ? "secondary" : "destructive"}
                    >
                      {dept.alignmentPercentage}%
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Total Goals:</span>
                      <span>{dept.totalGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aligned:</span>
                      <span className="text-primary">{dept.alignedGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Orphan:</span>
                      <span className="text-warning">{dept.orphanGoals}</span>
                    </div>
                  </div>
                  <Progress value={dept.alignmentPercentage} className="mt-3 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
