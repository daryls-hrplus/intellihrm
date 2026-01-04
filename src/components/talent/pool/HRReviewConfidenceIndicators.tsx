import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HRReviewConfidenceIndicatorsProps {
  confidenceScore: number;
  biasRiskLevel: 'low' | 'medium' | 'high';
  dataFreshnessDays: number;
  sourceCount: number;
  signalCount: number;
  recommendationConfidence?: number;
}

export function HRReviewConfidenceIndicators({
  confidenceScore,
  biasRiskLevel,
  dataFreshnessDays,
  sourceCount,
  signalCount,
  recommendationConfidence,
}: HRReviewConfidenceIndicatorsProps) {
  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.5) return 'text-warning';
    return 'text-destructive';
  };

  const getBiasRiskColor = (level: string): string => {
    if (level === 'low') return 'text-success bg-success/10 border-success/30';
    if (level === 'medium') return 'text-warning bg-warning/10 border-warning/30';
    return 'text-destructive bg-destructive/10 border-destructive/30';
  };

  const getFreshnessStatus = (days: number) => {
    if (days <= 30) return { label: 'Fresh', color: 'text-success', icon: CheckCircle };
    if (days <= 90) return { label: 'Recent', color: 'text-warning', icon: Clock };
    return { label: 'Stale', color: 'text-destructive', icon: AlertTriangle };
  };

  const freshnessStatus = getFreshnessStatus(dataFreshnessDays);
  const FreshnessIcon = freshnessStatus.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Data Quality Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Confidence */}
        <TooltipProvider>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-sm font-medium cursor-help">
                    <BarChart3 className="h-4 w-4" />
                    Confidence Score
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Indicates how reliable the evidence is based on source count, 
                    rater diversity, and data consistency.
                  </p>
                </TooltipContent>
              </Tooltip>
              <span className={cn("font-semibold", getConfidenceColor(confidenceScore))}>
                {Math.round(confidenceScore * 100)}%
              </span>
            </div>
            <Progress 
              value={confidenceScore * 100} 
              className="h-2"
            />
          </div>
        </TooltipProvider>

        {/* Bias Risk Level */}
        <TooltipProvider>
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm font-medium cursor-help">
                  <AlertTriangle className="h-4 w-4" />
                  Bias Risk
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Assessed risk of bias in the evidence based on rater relationships, 
                  score distribution patterns, and response consistency.
                </p>
              </TooltipContent>
            </Tooltip>
            <Badge variant="outline" className={getBiasRiskColor(biasRiskLevel)}>
              {biasRiskLevel.charAt(0).toUpperCase() + biasRiskLevel.slice(1)}
            </Badge>
          </div>
        </TooltipProvider>

        {/* Data Freshness */}
        <TooltipProvider>
          <div className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 text-sm font-medium cursor-help">
                  <FreshnessIcon className={cn("h-4 w-4", freshnessStatus.color)} />
                  Data Freshness
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  How recently the evidence was collected. 
                  Fresher data ({"<"}30 days) is more reliable for current decisions.
                </p>
              </TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-2">
              <span className={cn("text-sm font-medium", freshnessStatus.color)}>
                {freshnessStatus.label}
              </span>
              <span className="text-xs text-muted-foreground">
                ({dataFreshnessDays}d)
              </span>
            </div>
          </div>
        </TooltipProvider>

        {/* Source Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{sourceCount}</div>
            <div className="text-xs text-muted-foreground">Evidence Sources</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <div className="text-2xl font-bold">{signalCount}</div>
            <div className="text-xs text-muted-foreground">360 Signals</div>
          </div>
        </div>

        {/* Recommendation Confidence */}
        {recommendationConfidence !== undefined && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Recommendation Confidence</span>
              <span className={cn(
                "text-sm font-semibold",
                getConfidenceColor(recommendationConfidence)
              )}>
                {Math.round(recommendationConfidence * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              {recommendationConfidence >= 0.7 ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">Strong evidence supports this nomination</span>
                </>
              ) : recommendationConfidence >= 0.4 ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm text-warning">Additional evidence recommended</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">Insufficient evidence for decision</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
