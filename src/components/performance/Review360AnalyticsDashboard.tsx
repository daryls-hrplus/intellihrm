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
} from "recharts";
import { isPast, differenceInDays } from "date-fns";

interface ReviewCycle {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
  feedback_deadline: string | null;
  participants_count?: number;
  completion_rate?: number;
}

interface PendingReview {
  id: string;
  deadline: string | null;
  reviewer_type: string;
}

interface Review360AnalyticsDashboardProps {
  cycles: ReviewCycle[];
  pendingReviews: PendingReview[];
  participations: any[];
  compact?: boolean;
}

const COLORS = {
  draft: "hsl(var(--muted-foreground))",
  active: "hsl(var(--primary))",
  in_progress: "hsl(var(--info))",
  completed: "hsl(var(--success))",
  cancelled: "hsl(var(--destructive))",
  overdue: "hsl(var(--warning))",
};

const REVIEWER_COLORS = {
  self: "hsl(var(--primary))",
  manager: "hsl(var(--info))",
  peer: "hsl(var(--success))",
  direct_report: "hsl(var(--warning))",
};

export function Review360AnalyticsDashboard({
  cycles,
  pendingReviews,
  participations,
  compact = false,
}: Review360AnalyticsDashboardProps) {
  // Status distribution
  const statusCounts = cycles.reduce((acc, cycle) => {
    acc[cycle.status] = (acc[cycle.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
    value,
    color: COLORS[name as keyof typeof COLORS] || COLORS.draft,
  }));

  // Reviewer type distribution
  const reviewerCounts = pendingReviews.reduce((acc, review) => {
    acc[review.reviewer_type] = (acc[review.reviewer_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reviewerData = Object.entries(reviewerCounts).map(([name, value]) => ({
    name: name.replace("_", " ").charAt(0).toUpperCase() + name.replace("_", " ").slice(1),
    value,
    color: REVIEWER_COLORS[name as keyof typeof REVIEWER_COLORS] || COLORS.draft,
  }));

  // Completion rate distribution
  const completionBuckets = [
    { range: "0-25%", min: 0, max: 25 },
    { range: "26-50%", min: 26, max: 50 },
    { range: "51-75%", min: 51, max: 75 },
    { range: "76-99%", min: 76, max: 99 },
    { range: "100%", min: 100, max: 100 },
  ];

  const completionData = completionBuckets.map(bucket => ({
    name: bucket.range,
    count: cycles.filter(c =>
      (c.completion_rate || 0) >= bucket.min &&
      (c.completion_rate || 0) <= bucket.max
    ).length,
  }));

  // Calculate key metrics
  const avgCompletionRate = cycles.length > 0
    ? Math.round(cycles.reduce((sum, c) => sum + (c.completion_rate || 0), 0) / cycles.length)
    : 0;

  const overdueReviews = pendingReviews.filter(r =>
    r.deadline && isPast(new Date(r.deadline))
  );

  const dueSoonReviews = pendingReviews.filter(r => {
    if (!r.deadline) return false;
    const days = differenceInDays(new Date(r.deadline), new Date());
    return days >= 0 && days <= 7;
  });

  const totalParticipants = cycles.reduce((sum, c) => sum + (c.participants_count || 0), 0);
  const activeCycles = cycles.filter(c => c.status === "active" || c.status === "in_progress").length;

  const chartHeight = compact ? 100 : 120;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-4"}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{avgCompletionRate}%</div>
            <Progress value={avgCompletionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className={overdueReviews.length > 0 ? "border-warning/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${overdueReviews.length > 0 ? "text-warning" : ""}`}>
              {overdueReviews.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueReviews.length > 0 ? "Needs attention" : "All on time"}
            </p>
          </CardContent>
        </Card>

        <Card className={dueSoonReviews.length > 0 ? "border-info/30" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${dueSoonReviews.length > 0 ? "text-info" : ""}`}>
              {dueSoonReviews.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reviews due soon
            </p>
          </CardContent>
        </Card>

        {!compact && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalParticipants}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {activeCycles} active cycles
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {/* Cycle Status Distribution */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cycle Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: chartHeight }}>
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
                      formatter={(value: number) => [value, "Cycles"]}
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
        )}

        {/* Completion Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: chartHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => [value, "Cycles"]}
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

        {/* Pending by Reviewer Type */}
        {!compact && reviewerData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: chartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reviewerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {reviewerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, "Reviews"]}
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
                {reviewerData.map((entry, index) => (
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
