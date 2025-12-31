import React, { useState } from 'react';
import { 
  Info, 
  Database, 
  Scale, 
  Gauge,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SourceDataItem {
  dataType: string;
  recordCount: number;
  dateRange: string;
}

interface WeightFactor {
  factor: string;
  weight: number;
  contribution: number;
}

interface ConfidenceFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ExplainabilityData {
  insightType: string;
  sourceDataSummary: SourceDataItem[];
  weightsApplied: WeightFactor[];
  confidenceScore: number;
  confidenceFactors: ConfidenceFactor[];
  modelVersion: string;
  dataFreshnessDays: number;
  limitations: string[];
  isoComplianceVerified: boolean;
  createdAt: string;
}

interface AIExplainabilityCardProps {
  data: ExplainabilityData;
  title?: string;
  compact?: boolean;
  className?: string;
}

const confidenceColors = {
  high: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-orange-600 bg-orange-50',
};

const getConfidenceLevel = (score: number): 'high' | 'medium' | 'low' => {
  if (score >= 0.8) return 'high';
  if (score >= 0.6) return 'medium';
  return 'low';
};

export function AIExplainabilityCard({
  data,
  title = 'AI Transparency',
  compact = false,
  className,
}: AIExplainabilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [showLimitations, setShowLimitations] = useState(false);

  const confidenceLevel = getConfidenceLevel(data.confidenceScore);
  const confidencePercent = Math.round(data.confidenceScore * 100);

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs", className)}>
              <Shield className="h-3 w-3 text-primary" />
              <span>AI Confidence: {confidencePercent}%</span>
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <div className="space-y-2">
              <p className="font-medium">AI Explainability (ISO 42001)</p>
              <p className="text-xs">Model: {data.modelVersion}</p>
              <p className="text-xs">Data Sources: {data.sourceDataSummary.length}</p>
              <p className="text-xs">Data Freshness: {data.dataFreshnessDays} days</p>
              {data.limitations.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {data.limitations.length} known limitation(s)
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            ISO 42001 Compliant
          </Badge>
        </div>
        <CardDescription>
          Understanding how AI generated this insight
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Confidence Score */}
        <div className={cn("rounded-lg p-4", confidenceColors[confidenceLevel])}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span className="text-sm font-medium">AI Confidence</span>
            </div>
            <span className="text-lg font-bold">{confidencePercent}%</span>
          </div>
          <Progress value={confidencePercent} className="h-2" />
          <p className="text-xs mt-2">
            {confidenceLevel === 'high' && 'High confidence based on sufficient quality data'}
            {confidenceLevel === 'medium' && 'Moderate confidence - consider additional context'}
            {confidenceLevel === 'low' && 'Lower confidence - human review recommended'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Database className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {data.sourceDataSummary.reduce((acc, s) => acc + s.recordCount, 0)}
            </div>
            <div className="text-xs text-muted-foreground">Data Points</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{data.dataFreshnessDays}</div>
            <div className="text-xs text-muted-foreground">Days Fresh</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Scale className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{data.weightsApplied.length}</div>
            <div className="text-xs text-muted-foreground">Factors</div>
          </div>
        </div>

        {/* Source Data */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Source Data ({data.sourceDataSummary.length} sources)
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {data.sourceDataSummary.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">{source.dataType}</span>
                <div className="text-right">
                  <span className="text-sm font-medium">{source.recordCount} records</span>
                  <span className="text-xs text-muted-foreground block">{source.dateRange}</span>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Weights Applied */}
        <Collapsible open={showWeights} onOpenChange={setShowWeights}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Weights Applied
              </span>
              {showWeights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {data.weightsApplied.map((weight, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{weight.factor}</span>
                  <Badge variant="outline">{Math.round(weight.weight * 100)}%</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={weight.contribution * 100} className="flex-1 h-1.5" />
                  <span className="text-xs text-muted-foreground">
                    {weight.contribution > 0 ? '+' : ''}{Math.round(weight.contribution * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Confidence Factors */}
        {data.confidenceFactors && data.confidenceFactors.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Confidence Factors:</p>
            {data.confidenceFactors.map((factor, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg text-xs",
                  factor.impact === 'positive' && "bg-green-50",
                  factor.impact === 'negative' && "bg-orange-50",
                  factor.impact === 'neutral' && "bg-muted/30"
                )}
              >
                <span className="mt-0.5">
                  {factor.impact === 'positive' && '✓'}
                  {factor.impact === 'negative' && '⚠'}
                  {factor.impact === 'neutral' && '○'}
                </span>
                <div>
                  <span className="font-medium">{factor.factor}</span>
                  <p className="text-muted-foreground">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Limitations */}
        {data.limitations.length > 0 && (
          <Collapsible open={showLimitations} onOpenChange={setShowLimitations}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between text-orange-600">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Known Limitations ({data.limitations.length})
                </span>
                {showLimitations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ul className="space-y-1 p-3 rounded-lg bg-orange-50 border border-orange-200">
                {data.limitations.map((limitation, idx) => (
                  <li key={idx} className="text-xs text-orange-800 flex items-start gap-2">
                    <span>•</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Footer */}
        <div className="pt-3 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>Model: {data.modelVersion}</span>
          <span>Generated: {new Date(data.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
