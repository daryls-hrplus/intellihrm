import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TalentSignalSnapshot } from '@/types/talentSignals';

interface FeedbackSignalSummaryProps {
  signals: TalentSignalSnapshot[];
  visibilityLevel?: 'summary' | 'detailed' | 'full';
}

const categoryColors: Record<string, string> = {
  leadership: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  teamwork: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  technical: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  values: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export function FeedbackSignalSummary({ 
  signals, 
  visibilityLevel = 'summary' 
}: FeedbackSignalSummaryProps) {
  // Group signals by category
  const groupedSignals = signals.reduce((acc, signal) => {
    const category = signal.signal_definition?.signal_category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(signal);
    return acc;
  }, {} as Record<string, TalentSignalSnapshot[]>);

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (score <= 2.5) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score <= 2.5) return 'text-red-600';
    return 'text-foreground';
  };

  if (visibilityLevel === 'summary') {
    // Show only category-level summaries
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Overview of feedback signals by category. Scores represent aggregated multi-rater perceptions.
        </p>
        
        <div className="grid gap-3">
          {Object.entries(groupedSignals).map(([category, categorySignals]) => {
            const avgScore = categorySignals.reduce((sum, s) => sum + (s.normalized_score || s.signal_value || 0), 0) / categorySignals.length;
            const totalResponses = categorySignals.reduce((sum, s) => sum + s.evidence_count, 0);
            
            return (
              <Card key={category} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={categoryColors[category]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {categorySignals.length} signal{categorySignals.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(avgScore)}
                      <span className={`font-semibold ${getScoreColor(avgScore)}`}>
                        {avgScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <Progress value={avgScore * 20} className="h-2" />
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Based on {totalResponses} responses
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Detailed or full view - show individual signals
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Individual feedback signals with rater breakdown. Use these to identify patterns and discussion topics.
      </p>

      {Object.entries(groupedSignals).map(([category, categorySignals]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={categoryColors[category]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          </div>

          <div className="grid gap-2 pl-2 border-l-2 border-muted">
            {categorySignals.map((signal) => {
              const score = signal.normalized_score || signal.signal_value || 0;
              const raterBreakdown = signal.rater_breakdown as Record<string, { avg: number; count: number }> | null;
              
              return (
                <div 
                  key={signal.id} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {signal.signal_definition?.name || 'Unknown Signal'}
                      </span>
                      {signal.bias_risk_level !== 'low' && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="text-xs text-amber-600">
                              {signal.bias_risk_level} bias risk
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              This signal may be affected by: {signal.bias_factors?.join(', ') || 'unspecified factors'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    
                    {visibilityLevel === 'full' && raterBreakdown && (
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        {Object.entries(raterBreakdown).map(([rater, data]) => (
                          <span key={rater}>
                            {rater}: {data.avg.toFixed(1)} ({data.count})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Progress value={score * 20} className="h-2" />
                    </div>
                    <div className="flex items-center gap-1 w-16 justify-end">
                      {getScoreIcon(score)}
                      <span className={`font-semibold text-sm ${getScoreColor(score)}`}>
                        {score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
