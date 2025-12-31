import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { PerformanceIndex, getTrendColor, getConsistencyColor } from "@/hooks/usePerformanceIndex";

interface RollingPerformanceCardProps {
  index: PerformanceIndex | null;
  isLoading?: boolean;
  compact?: boolean;
}

export function RollingPerformanceCard({ index, isLoading, compact = false }: RollingPerformanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!index) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No performance history available</p>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = index.trend_direction === "improving" 
    ? TrendingUp 
    : index.trend_direction === "declining" 
      ? TrendingDown 
      : Minus;

  const formatScore = (score: number | null) => {
    return score !== null ? `${score.toFixed(1)}%` : "—";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Rolling Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            {index.trend_direction && (
              <div className={`flex items-center gap-1 ${getTrendColor(index.trend_direction)}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-xs capitalize">{index.trend_direction}</span>
              </div>
            )}
            {index.consistency_rating && (
              <Badge variant="secondary" className={getConsistencyColor(index.consistency_rating)}>
                {index.consistency_rating.replace("_", " ")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">12 Months</p>
            <p className="text-xl font-bold">{formatScore(index.rolling_12m_score)}</p>
            <p className="text-xs text-muted-foreground">{index.cycles_12m_count} cycles</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">24 Months</p>
            <p className="text-xl font-bold">{formatScore(index.rolling_24m_score)}</p>
            <p className="text-xs text-muted-foreground">{index.cycles_24m_count} cycles</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">36 Months</p>
            <p className="text-xl font-bold">{formatScore(index.rolling_36m_score)}</p>
            <p className="text-xs text-muted-foreground">{index.cycles_36m_count} cycles</p>
          </div>
        </div>

        {!compact && (
          <>
            {/* Readiness Scores */}
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Promotion Readiness</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${index.promotion_readiness_score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{index.promotion_readiness_score?.toFixed(0) || 0}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Succession Readiness</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${index.succession_readiness_score || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{index.succession_readiness_score?.toFixed(0) || 0}%</span>
                </div>
              </div>
            </div>

            {/* Best/Lowest Markers */}
            {(index.best_score || index.lowest_score) && (
              <div className="flex gap-4 mt-4 pt-4 border-t text-sm">
                {index.best_score && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">▲</span>
                    <span className="text-muted-foreground">Best:</span>
                    <span className="font-medium">{index.best_score.toFixed(1)}%</span>
                  </div>
                )}
                {index.lowest_score && (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600">▼</span>
                    <span className="text-muted-foreground">Lowest:</span>
                    <span className="font-medium">{index.lowest_score.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
