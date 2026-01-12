import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  ReferenceLine 
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from "lucide-react";

interface PerformanceTrendData {
  period: string;
  avgRating: number;
  participantCount: number;
  completionRate: number;
  highPerformers: number;
  lowPerformers: number;
}

interface YearOverYearTrendsProps {
  companyId: string;
  data?: PerformanceTrendData[];
}

// Mock data for demonstration
const generateMockData = (): PerformanceTrendData[] => [
  { period: "Q1 2023", avgRating: 3.2, participantCount: 245, completionRate: 78, highPerformers: 18, lowPerformers: 12 },
  { period: "Q2 2023", avgRating: 3.4, participantCount: 252, completionRate: 82, highPerformers: 22, lowPerformers: 10 },
  { period: "Q3 2023", avgRating: 3.3, participantCount: 248, completionRate: 85, highPerformers: 20, lowPerformers: 11 },
  { period: "Q4 2023", avgRating: 3.5, participantCount: 260, completionRate: 88, highPerformers: 25, lowPerformers: 8 },
  { period: "Q1 2024", avgRating: 3.6, participantCount: 265, completionRate: 90, highPerformers: 28, lowPerformers: 7 },
  { period: "Q2 2024", avgRating: 3.7, participantCount: 272, completionRate: 92, highPerformers: 32, lowPerformers: 6 },
  { period: "Q3 2024", avgRating: 3.6, participantCount: 268, completionRate: 91, highPerformers: 30, lowPerformers: 7 },
  { period: "Q4 2024", avgRating: 3.8, participantCount: 280, completionRate: 94, highPerformers: 35, lowPerformers: 5 },
];

export function YearOverYearTrends({ companyId, data }: YearOverYearTrendsProps) {
  const trendData = data || generateMockData();

  const stats = useMemo(() => {
    if (trendData.length < 2) return null;
    
    const latest = trendData[trendData.length - 1];
    const previous = trendData[trendData.length - 2];
    const yearAgo = trendData.length >= 5 ? trendData[trendData.length - 5] : trendData[0];
    
    const quarterChange = ((latest.avgRating - previous.avgRating) / previous.avgRating) * 100;
    const yearChange = ((latest.avgRating - yearAgo.avgRating) / yearAgo.avgRating) * 100;
    const completionChange = latest.completionRate - previous.completionRate;
    
    return {
      currentRating: latest.avgRating,
      quarterChange,
      yearChange,
      completionRate: latest.completionRate,
      completionChange,
      highPerformers: latest.highPerformers,
      lowPerformers: latest.lowPerformers,
    };
  }, [trendData]);

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Year-Over-Year Performance Trends
            </CardTitle>
            <CardDescription>
              Track performance metrics across appraisal cycles
            </CardDescription>
          </div>
          <Select defaultValue="2years">
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="2years">Last 2 Years</SelectItem>
              <SelectItem value="3years">Last 3 Years</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Avg Rating</span>
                {getTrendIcon(stats.quarterChange)}
              </div>
              <div className="text-2xl font-bold">{stats.currentRating.toFixed(1)}</div>
              <div className={`text-xs ${getTrendColor(stats.quarterChange)}`}>
                {stats.quarterChange >= 0 ? '+' : ''}{stats.quarterChange.toFixed(1)}% vs last quarter
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">YoY Change</span>
                {getTrendIcon(stats.yearChange)}
              </div>
              <div className={`text-2xl font-bold ${getTrendColor(stats.yearChange)}`}>
                {stats.yearChange >= 0 ? '+' : ''}{stats.yearChange.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Compared to same period last year
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Completion</span>
                {getTrendIcon(stats.completionChange)}
              </div>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <div className={`text-xs ${getTrendColor(stats.completionChange)}`}>
                {stats.completionChange >= 0 ? '+' : ''}{stats.completionChange}% vs last quarter
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Top Performers</span>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                  +{stats.highPerformers - stats.lowPerformers}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.highPerformers}%</div>
              <div className="text-xs text-muted-foreground">
                vs {stats.lowPerformers}% low performers
              </div>
            </div>
          </div>
        )}

        {/* Trend Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[1, 5]} 
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <ReferenceLine y={3} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label="Target" />
              <Line
                type="monotone"
                dataKey="avgRating"
                name="Avg Rating"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary Metrics Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completionRate"
                name="Completion Rate"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 36%)' }}
              />
              <Line
                type="monotone"
                dataKey="highPerformers"
                name="High Performers %"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(217, 91%, 60%)' }}
              />
              <Line
                type="monotone"
                dataKey="lowPerformers"
                name="Low Performers %"
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(0, 84%, 60%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
