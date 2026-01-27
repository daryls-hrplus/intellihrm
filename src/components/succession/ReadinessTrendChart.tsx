import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar } from "lucide-react";
import { useReadinessTrendHistory, useCompanyReadinessTrends } from "@/hooks/succession/useReadinessTrendHistory";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ReadinessTrendChartProps {
  candidateId?: string;
  companyId?: string;
  mode?: "individual" | "aggregate";
  height?: number;
  showBandZones?: boolean;
}

const BAND_THRESHOLDS = {
  ready_now: { min: 85, color: "hsl(var(--success))", label: "Ready Now" },
  ready_1_2_years: { min: 70, color: "hsl(var(--primary))", label: "Ready 1-2 Years" },
  ready_3_years: { min: 50, color: "hsl(var(--warning))", label: "Ready 3+ Years" },
  developing: { min: 0, color: "hsl(var(--muted-foreground))", label: "Developing" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 text-sm">
        <div className="font-medium mb-1">
          {data.formattedDate || label}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Score:</span>
            <span className="font-semibold">{data.score ?? data.avgScore}</span>
          </div>
          {data.band && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Band:</span>
              <Badge variant="outline" className="text-xs capitalize">
                {data.band.replace(/_/g, " ")}
              </Badge>
            </div>
          )}
          {data.count && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Assessments:</span>
              <span>{data.count}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export function ReadinessTrendChart({
  candidateId,
  companyId,
  mode = "individual",
  height = 300,
  showBandZones = true,
}: ReadinessTrendChartProps) {
  const { data: individualData, isLoading: individualLoading } = useReadinessTrendHistory(
    mode === "individual" ? candidateId : undefined
  );
  const { data: aggregateData, isLoading: aggregateLoading } = useCompanyReadinessTrends(
    mode === "aggregate" ? companyId : undefined
  );

  const isLoading = mode === "individual" ? individualLoading : aggregateLoading;

  const chartData = useMemo(() => {
    if (mode === "individual" && individualData) {
      return individualData.trends.map(t => ({
        ...t,
        formattedDate: format(parseISO(t.date), "MMM yyyy"),
        shortDate: format(parseISO(t.date), "MMM"),
      }));
    }
    if (mode === "aggregate" && aggregateData) {
      return aggregateData.averageByMonth.map(m => ({
        ...m,
        formattedDate: format(parseISO(`${m.month}-01`), "MMM yyyy"),
        shortDate: format(parseISO(`${m.month}-01`), "MMM"),
        score: m.avgScore,
      }));
    }
    return [];
  }, [mode, individualData, aggregateData]);

  const getTrendIcon = () => {
    if (mode === "individual" && individualData?.scoreChange !== null) {
      if (individualData.scoreChange > 5) {
        return <TrendingUp className="h-4 w-4 text-success" />;
      }
      if (individualData.scoreChange < -5) {
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      }
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getScoreChangeLabel = () => {
    if (mode === "individual" && individualData?.scoreChange !== null) {
      const change = individualData.scoreChange;
      const prefix = change > 0 ? "+" : "";
      return (
        <Badge
          variant="outline"
          className={cn(
            "ml-2",
            change > 5 && "border-success text-success",
            change < -5 && "border-destructive text-destructive"
          )}
        >
          {prefix}{change.toFixed(1)} pts
        </Badge>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Readiness Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
            <Calendar className="h-12 w-12 mb-3 opacity-50" />
            <p>No historical readiness data available</p>
            <p className="text-sm mt-1">Complete readiness assessments to track trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {mode === "individual" ? "Readiness Score Progression" : "Company Readiness Trends"}
              {getTrendIcon()}
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              {mode === "individual" && individualData ? (
                <>
                  {individualData.candidateName}
                  {getScoreChangeLabel()}
                </>
              ) : (
                <>
                  {aggregateData?.totalAssessments || 0} assessments across all candidates
                </>
              )}
            </CardDescription>
          </div>
          {mode === "individual" && individualData?.currentBand && (
            <Badge className="capitalize">
              {individualData.currentBand.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            {showBandZones && (
              <>
                <ReferenceArea y1={85} y2={100} fill="hsl(var(--success))" fillOpacity={0.1} />
                <ReferenceArea y1={70} y2={85} fill="hsl(var(--primary))" fillOpacity={0.1} />
                <ReferenceArea y1={50} y2={70} fill="hsl(var(--warning))" fillOpacity={0.1} />
                <ReferenceArea y1={0} y2={50} fill="hsl(var(--muted))" fillOpacity={0.1} />
              </>
            )}
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={85} stroke="hsl(var(--success))" strokeDasharray="5 5" label={{ value: "Ready Now", position: "right", fontSize: 10 }} />
            <ReferenceLine y={70} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: "1-2 Years", position: "right", fontSize: 10 }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Band Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs">
          {Object.entries(BAND_THRESHOLDS).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: value.color, opacity: 0.3 }}
              />
              <span className="text-muted-foreground">{value.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
