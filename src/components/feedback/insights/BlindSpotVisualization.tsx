import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, ArrowUp, ArrowDown, Minus, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface BlindSpotData {
  competency: string;
  selfScore: number;
  othersScore: number;
  gap: number;
  insightType: 'blind_spot' | 'hidden_strength' | 'aligned';
  raterCount: number;
}

interface BlindSpotVisualizationProps {
  data: BlindSpotData[];
  thresholdGap?: number;
  showLegend?: boolean;
  compactMode?: boolean;
}

export function BlindSpotVisualization({ 
  data, 
  thresholdGap = 0.5, 
  showLegend = true,
  compactMode = false 
}: BlindSpotVisualizationProps) {
  const getInsightIcon = (type: BlindSpotData['insightType']) => {
    switch (type) {
      case 'blind_spot':
        return <EyeOff className="h-4 w-4 text-amber-500" />;
      case 'hidden_strength':
        return <Eye className="h-4 w-4 text-emerald-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInsightBadge = (type: BlindSpotData['insightType']) => {
    switch (type) {
      case 'blind_spot':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Blind Spot</Badge>;
      case 'hidden_strength':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Hidden Strength</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Aligned</Badge>;
    }
  };

  const getGapDirection = (gap: number) => {
    if (gap > thresholdGap) {
      return <ArrowUp className="h-3 w-3 text-amber-500" />;
    } else if (gap < -thresholdGap) {
      return <ArrowDown className="h-3 w-3 text-emerald-500" />;
    }
    return null;
  };

  const blindSpots = data.filter(d => d.insightType === 'blind_spot');
  const hiddenStrengths = data.filter(d => d.insightType === 'hidden_strength');
  const aligned = data.filter(d => d.insightType === 'aligned');

  return (
    <Card>
      <CardHeader className={compactMode ? 'pb-2' : undefined}>
        <CardTitle className="flex items-center gap-2 text-base">
          <Eye className="h-5 w-5 text-primary" />
          Self-Other Perception Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Compares your self-assessment with how others rated you. A gap of ±{thresholdGap} or more indicates a perception difference worth exploring.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showLegend && (
          <div className="flex flex-wrap gap-4 text-sm pb-2 border-b">
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Blind Spot ({blindSpots.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald-500" />
              <span className="text-muted-foreground">Hidden Strength ({hiddenStrengths.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Aligned ({aligned.length})</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(item.insightType)}
                  <span className="font-medium text-sm">{item.competency}</span>
                  {!compactMode && getInsightBadge(item.insightType)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getGapDirection(item.gap)}
                  <span className={
                    Math.abs(item.gap) > thresholdGap 
                      ? item.gap > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium'
                      : 'text-muted-foreground'
                  }>
                    {item.gap > 0 ? '+' : ''}{item.gap.toFixed(1)}
                  </span>
                </div>
              </div>
              
              {!compactMode && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Self</span>
                      <span>{item.selfScore.toFixed(1)}</span>
                    </div>
                    <Progress value={item.selfScore * 20} className="h-2" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Others ({item.raterCount})</span>
                      <span>{item.othersScore.toFixed(1)}</span>
                    </div>
                    <Progress value={item.othersScore * 20} className="h-2" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No perception data available yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
