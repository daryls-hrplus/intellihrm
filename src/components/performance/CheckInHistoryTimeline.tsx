import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Flag,
  RefreshCw,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useGoalProgressHistory, GoalProgressEntry } from "@/hooks/useGoalProgressHistory";
import { useGoalCheckIns, GoalCheckIn } from "@/hooks/useGoalCheckIns";
import { format, formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface CheckInHistoryTimelineProps {
  goalId: string;
  showChart?: boolean;
}

type TimelineItem = {
  id: string;
  type: "progress" | "check_in" | "milestone";
  date: string;
  data: GoalProgressEntry | GoalCheckIn;
};

const SOURCE_CONFIG = {
  manual: { icon: RefreshCw, label: "Manual Update", color: "bg-blue-500" },
  milestone: { icon: Flag, label: "Milestone", color: "bg-purple-500" },
  check_in: { icon: MessageSquare, label: "Check-in", color: "bg-green-500" },
  kpi_sync: { icon: BarChart3, label: "KPI Sync", color: "bg-orange-500" },
  rollup: { icon: TrendingUp, label: "Rollup", color: "bg-teal-500" },
};

export function CheckInHistoryTimeline({ goalId, showChart = true }: CheckInHistoryTimelineProps) {
  const { history, loading: historyLoading, fetchHistory, getProgressTrend, getProgressChange } = useGoalProgressHistory(goalId);
  const { checkIns, loading: checkInsLoading, fetchCheckIns } = useGoalCheckIns(goalId);
  const [expanded, setExpanded] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchCheckIns();
  }, [fetchHistory, fetchCheckIns]);

  const loading = historyLoading || checkInsLoading;

  // Combine history and check-ins into timeline
  const timelineItems: TimelineItem[] = [
    ...history.map((h) => ({
      id: h.id,
      type: "progress" as const,
      date: h.recorded_at,
      data: h,
    })),
    ...checkIns.map((c) => ({
      id: c.id,
      type: "check_in" as const,
      date: c.created_at,
      data: c,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedItems = showAllHistory ? timelineItems : timelineItems.slice(0, 5);

  // Chart data
  const chartData = getProgressTrend().map((entry, index, arr) => ({
    date: format(new Date(entry.date), "MMM d"),
    progress: entry.progress,
    source: entry.source,
    fullDate: entry.date,
  }));

  const progressChange = getProgressChange(30);

  const getTrendIcon = () => {
    if (progressChange.change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (progressChange.change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const renderProgressEntry = (entry: GoalProgressEntry) => {
    const sourceConfig = SOURCE_CONFIG[entry.source] || SOURCE_CONFIG.manual;
    const Icon = sourceConfig.icon;
    const change = entry.progress_percentage - (entry.previous_percentage || 0);

    return (
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full ${sourceConfig.color} flex items-center justify-center shrink-0`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{entry.progress_percentage}%</span>
            {change !== 0 && (
              <Badge variant={change > 0 ? "default" : "destructive"} className="text-xs">
                {change > 0 ? "+" : ""}{change}%
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {sourceConfig.label}
            </Badge>
          </div>
          {entry.notes && (
            <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(entry.recorded_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };

  const renderCheckIn = (checkIn: GoalCheckIn) => {
    return (
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <MessageSquare className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">Check-in</span>
            {checkIn.employee_status && (
              <Badge variant="outline" className="text-xs capitalize">
                {checkIn.employee_status.replace("_", " ")}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs capitalize">
              {checkIn.status.replace("_", " ")}
            </Badge>
          </div>
          {checkIn.employee_commentary && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {checkIn.employee_commentary}
            </p>
          )}
          {checkIn.manager_commentary && (
            <p className="text-sm text-muted-foreground mt-1 italic line-clamp-2">
              Manager: {checkIn.manager_commentary}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(checkIn.check_in_date), "MMM d, yyyy")}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Progress Timeline</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              {getTrendIcon()}
              <span className="text-lg font-bold">
                {progressChange.change > 0 ? "+" : ""}{progressChange.change}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <span className="text-lg font-bold">{history.length}</span>
            <p className="text-xs text-muted-foreground">Updates</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <span className="text-lg font-bold">{checkIns.length}</span>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </div>
        </div>

        {/* Progress Chart */}
        {showChart && expanded && chartData.length > 1 && (
          <div className="mb-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.progress}%</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(data.fullDate), "MMM d, yyyy")}
                            </p>
                            <p className="text-xs capitalize">{data.source}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={100} stroke="hsl(var(--primary))" strokeDasharray="5 5" />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <Separator className="my-4" />
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading history...
          </div>
        ) : timelineItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No progress history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedItems.map((item, index) => (
              <div key={item.id}>
                {item.type === "progress" ? (
                  renderProgressEntry(item.data as GoalProgressEntry)
                ) : (
                  renderCheckIn(item.data as GoalCheckIn)
                )}
                {index < displayedItems.length - 1 && (
                  <div className="ml-4 h-6 border-l-2 border-dashed border-muted" />
                )}
              </div>
            ))}

            {timelineItems.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowAllHistory(!showAllHistory)}
              >
                {showAllHistory
                  ? "Show less"
                  : `Show ${timelineItems.length - 5} more entries`}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
