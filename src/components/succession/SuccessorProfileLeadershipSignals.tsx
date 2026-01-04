import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadershipSignal {
  id: string;
  name: string;
  score: number;
  confidence: number;
  trend?: 'up' | 'down' | 'stable';
}

interface SuccessorProfileLeadershipSignalsProps {
  employeeId: string;
  compact?: boolean;
}

export function SuccessorProfileLeadershipSignals({
  employeeId,
  compact = false,
}: SuccessorProfileLeadershipSignalsProps) {
  const [signals, setSignals] = useState<LeadershipSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState<number | null>(null);

  useEffect(() => {
    loadSignals();
  }, [employeeId]);

  const loadSignals = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          id,
          signal_value,
          normalized_score,
          confidence_score,
          talent_signal_definitions(
            name,
            signal_category
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_current', true);

      if (data) {
        const leadershipSignals = data
          .filter(s => (s.talent_signal_definitions as any)?.signal_category === 'leadership')
          .map(s => ({
            id: s.id,
            name: (s.talent_signal_definitions as any)?.name || 'Unknown',
            score: s.signal_value || s.normalized_score || 0,
            confidence: s.confidence_score || 0,
            trend: 'stable' as const, // Would need historical data for trend
          }))
          .sort((a, b) => b.score - a.score);

        setSignals(leadershipSignals);

        if (leadershipSignals.length > 0) {
          const avg = leadershipSignals.reduce((sum, s) => sum + s.score, 0) / leadershipSignals.length;
          setOverallScore(avg);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-destructive" />;
      default: return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'text-success';
    if (score >= 3) return 'text-primary';
    if (score >= 2) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardContent className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (signals.length === 0) {
    return (
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          No leadership signals available
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Leadership</span>
          {overallScore && (
            <Badge variant="outline" className={cn("text-xs", getScoreColor(overallScore))}>
              {overallScore.toFixed(1)}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          <TooltipProvider>
            {signals.slice(0, 3).map(signal => (
              <Tooltip key={signal.id}>
                <TooltipTrigger asChild>
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs cursor-help", getScoreColor(signal.score))}
                  >
                    {signal.name.split(' ')[0]}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <div className="font-medium">{signal.name}</div>
                    <div className="text-xs">Score: {signal.score.toFixed(1)} / 5</div>
                    <div className="text-xs">Confidence: {Math.round(signal.confidence * 100)}%</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
          {signals.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{signals.length - 3}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Leadership Signals</CardTitle>
          {overallScore && (
            <Badge className={cn(getScoreColor(overallScore))}>
              Overall: {overallScore.toFixed(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals.slice(0, 5).map(signal => (
          <div key={signal.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(signal.trend)}
                <span className="text-sm font-medium">{signal.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold", getScoreColor(signal.score))}>
                  {signal.score.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({Math.round(signal.confidence * 100)}%)
                </span>
              </div>
            </div>
            <Progress value={signal.score * 20} className="h-1.5" />
          </div>
        ))}
        {signals.length > 5 && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            +{signals.length - 5} more signals
          </div>
        )}
      </CardContent>
    </Card>
  );
}
