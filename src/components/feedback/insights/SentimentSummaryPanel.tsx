import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, TrendingUp, TrendingDown, Minus, Info, Smile, Meh, Frown, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface SentimentData {
  raterCategory: string;
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
  totalResponses: number;
  trend?: 'up' | 'down' | 'stable';
  previousScore?: number;
}

interface SentimentSummaryPanelProps {
  data: SentimentData[];
  showTrends?: boolean;
  compactMode?: boolean;
}

const SENTIMENT_COLORS = {
  positive: 'bg-emerald-500',
  neutral: 'bg-slate-400',
  negative: 'bg-red-500',
  mixed: 'bg-amber-500',
};

const SENTIMENT_LABELS = {
  positive: { label: 'Positive', icon: Smile, color: 'text-emerald-600' },
  neutral: { label: 'Neutral', icon: Meh, color: 'text-slate-600' },
  negative: { label: 'Negative', icon: Frown, color: 'text-red-600' },
  mixed: { label: 'Mixed', icon: HelpCircle, color: 'text-amber-600' },
};

export function SentimentSummaryPanel({ 
  data, 
  showTrends = true,
  compactMode = false 
}: SentimentSummaryPanelProps) {
  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const calculateOverallSentiment = (item: SentimentData) => {
    const total = item.positive + item.neutral + item.negative + item.mixed;
    if (total === 0) return 'N/A';
    
    const positiveRatio = item.positive / total;
    const negativeRatio = item.negative / total;
    
    if (positiveRatio >= 0.6) return 'Positive';
    if (negativeRatio >= 0.4) return 'Concerning';
    if (item.mixed / total >= 0.4) return 'Mixed';
    return 'Neutral';
  };

  const getOverallBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{sentiment}</Badge>;
      case 'Concerning':
        return <Badge className="bg-red-100 text-red-700 border-red-200">{sentiment}</Badge>;
      case 'Mixed':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">{sentiment}</Badge>;
      default:
        return <Badge variant="outline">{sentiment}</Badge>;
    }
  };

  // Calculate aggregate totals
  const totals = data.reduce((acc, item) => ({
    positive: acc.positive + item.positive,
    neutral: acc.neutral + item.neutral,
    negative: acc.negative + item.negative,
    mixed: acc.mixed + item.mixed,
    responses: acc.responses + item.totalResponses,
  }), { positive: 0, neutral: 0, negative: 0, mixed: 0, responses: 0 });

  const totalSentiments = totals.positive + totals.neutral + totals.negative + totals.mixed;

  return (
    <Card>
      <CardHeader className={compactMode ? 'pb-2' : undefined}>
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-primary" />
          Sentiment Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>AI-powered sentiment detection across feedback responses. Sentiment is analyzed at the response level and aggregated by rater category.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Sentiment Distribution */}
        {!compactMode && totalSentiments > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Overall Distribution</h4>
            <div className="flex h-4 rounded-full overflow-hidden">
              {totals.positive > 0 && (
                <div 
                  className={`${SENTIMENT_COLORS.positive}`} 
                  style={{ width: `${(totals.positive / totalSentiments) * 100}%` }}
                />
              )}
              {totals.neutral > 0 && (
                <div 
                  className={`${SENTIMENT_COLORS.neutral}`} 
                  style={{ width: `${(totals.neutral / totalSentiments) * 100}%` }}
                />
              )}
              {totals.mixed > 0 && (
                <div 
                  className={`${SENTIMENT_COLORS.mixed}`} 
                  style={{ width: `${(totals.mixed / totalSentiments) * 100}%` }}
                />
              )}
              {totals.negative > 0 && (
                <div 
                  className={`${SENTIMENT_COLORS.negative}`} 
                  style={{ width: `${(totals.negative / totalSentiments) * 100}%` }}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs">
              {Object.entries(SENTIMENT_LABELS).map(([key, { label, icon: Icon, color }]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-sm ${SENTIMENT_COLORS[key as keyof typeof SENTIMENT_COLORS]}`} />
                  <Icon className={`h-3 w-3 ${color}`} />
                  <span className="text-muted-foreground">
                    {label}: {totals[key as keyof typeof totals]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Rater Category */}
        <div className="space-y-4">
          {!compactMode && <h4 className="text-sm font-medium">By Rater Category</h4>}
          {data.map((item, index) => {
            const categoryTotal = item.positive + item.neutral + item.negative + item.mixed;
            const overallSentiment = calculateOverallSentiment(item);
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{item.raterCategory}</span>
                    <span className="text-xs text-muted-foreground">({item.totalResponses} responses)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {showTrends && item.trend && getTrendIcon(item.trend)}
                    {getOverallBadge(overallSentiment)}
                  </div>
                </div>
                
                {!compactMode && categoryTotal > 0 && (
                  <div className="flex h-2 rounded-full overflow-hidden">
                    {item.positive > 0 && (
                      <div 
                        className={`${SENTIMENT_COLORS.positive}`} 
                        style={{ width: `${(item.positive / categoryTotal) * 100}%` }}
                      />
                    )}
                    {item.neutral > 0 && (
                      <div 
                        className={`${SENTIMENT_COLORS.neutral}`} 
                        style={{ width: `${(item.neutral / categoryTotal) * 100}%` }}
                      />
                    )}
                    {item.mixed > 0 && (
                      <div 
                        className={`${SENTIMENT_COLORS.mixed}`} 
                        style={{ width: `${(item.mixed / categoryTotal) * 100}%` }}
                      />
                    )}
                    {item.negative > 0 && (
                      <div 
                        className={`${SENTIMENT_COLORS.negative}`} 
                        style={{ width: `${(item.negative / categoryTotal) * 100}%` }}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sentiment data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
