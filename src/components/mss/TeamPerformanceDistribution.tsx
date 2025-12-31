import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { BarChart3, TrendingUp, Info } from "lucide-react";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PerformanceDistributionData {
  rating: string;
  count: number;
  percentage: number;
}

interface TeamPerformanceDistributionProps {
  data: PerformanceDistributionData[];
  teamAverage?: number;
  companyAverage?: number;
  loading?: boolean;
}

const ratingColors: Record<string, string> = {
  "1": "hsl(var(--destructive))",
  "2": "hsl(var(--warning))",
  "3": "hsl(var(--primary))",
  "4": "hsl(142 71% 45%)",
  "5": "hsl(142 76% 36%)",
  "Exceeds": "hsl(142 76% 36%)",
  "Meets": "hsl(var(--primary))",
  "Below": "hsl(var(--destructive))",
};

const ratingLabels: Record<string, string> = {
  "1": "Needs Improvement",
  "2": "Below Expectations",
  "3": "Meets Expectations",
  "4": "Exceeds Expectations",
  "5": "Outstanding",
};

export function TeamPerformanceDistribution({
  data,
  teamAverage,
  companyAverage,
  loading = false,
}: TeamPerformanceDistributionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Team Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No performance data available yet</p>
            <p className="text-sm text-muted-foreground">Complete evaluations to see distribution</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Team Performance Distribution
            </CardTitle>
            <CardDescription>
              Based on {totalCount} completed evaluations
            </CardDescription>
          </div>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>Distribution of performance ratings across your team members.</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis 
                dataKey="rating" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PerformanceDistributionData;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">
                          {ratingLabels[data.rating] || `Rating ${data.rating}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} employees ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {teamAverage && (
                <ReferenceLine 
                  x={Math.round(teamAverage).toString()} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="3 3"
                  label={{ value: "Team Avg", position: "top", fontSize: 10 }}
                />
              )}
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={ratingColors[entry.rating] || "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Averages Comparison */}
        {(teamAverage !== undefined || companyAverage !== undefined) && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
            {teamAverage !== undefined && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Team Average:</span>
                <Badge variant="outline" className="font-bold">
                  {teamAverage.toFixed(2)}
                </Badge>
              </div>
            )}
            {companyAverage !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Company Average:</span>
                <Badge variant="secondary">
                  {companyAverage.toFixed(2)}
                </Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
