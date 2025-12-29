import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecognitionAnalytics } from "@/hooks/useRecognition";
import { Award, Users, TrendingUp, Heart, Trophy, Star } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

interface RecognitionAnalyticsDashboardProps {
  companyId: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export function RecognitionAnalyticsDashboard({ companyId }: RecognitionAnalyticsDashboardProps) {
  const { data: analytics, isLoading } = useRecognitionAnalytics(companyId);

  if (isLoading || !analytics) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  const awardTypeData = Object.entries(analytics.awardTypeBreakdown).map(([name, value], i) => ({
    name: name.replace(/_/g, " "),
    value,
    fill: COLORS[i % COLORS.length],
  }));

  const valueData = Object.entries(analytics.valueBreakdown).map(([name, value]) => ({
    name,
    count: value,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Total Recognitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.totalRecognitions}</p>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Givers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.uniqueGivers}</p>
            <p className="text-xs text-muted-foreground">Active participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Unique Receivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.uniqueReceivers}</p>
            <p className="text-xs text-muted-foreground">Recognized employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Points Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics.totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total points</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recognition by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {awardTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={awardTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {awardTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Company Values</CardTitle>
          </CardHeader>
          <CardContent>
            {valueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={valueData.slice(0, 5)} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
