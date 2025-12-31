import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MessageSquare, 
  Lightbulb, 
  Target, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentQualityHintsProps {
  comment: string;
  minRecommendedLength?: number;
  onImproveWithAI?: () => void;
  showAIButton?: boolean;
  compact?: boolean;
}

interface QualityIndicator {
  name: string;
  score: number;
  icon: React.ElementType;
  tip: string;
  color: string;
}

export function CommentQualityHints({
  comment,
  minRecommendedLength = 50,
  onImproveWithAI,
  showAIButton = true,
  compact = false,
}: CommentQualityHintsProps) {
  const [dismissed, setDismissed] = useState(false);
  const [indicators, setIndicators] = useState<QualityIndicator[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  // Analyze comment quality
  const analyzeComment = useCallback((text: string) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;

    // Length score (0-100)
    const lengthScore = Math.min(100, (charCount / minRecommendedLength) * 100);

    // Specificity score - check for specific behavioral language
    const specificityPatterns = [
      /\b(demonstrated|showed|achieved|completed|delivered|improved|increased|decreased|reduced)\b/gi,
      /\b(specific|example|instance|occasion|situation|when|during)\b/gi,
      /\b(\d+%?|\d+\.\d+|[A-Z]{2,})\b/g, // numbers, percentages, acronyms
    ];
    const specificityMatches = specificityPatterns.reduce(
      (count, pattern) => count + (text.match(pattern)?.length || 0),
      0
    );
    const specificityScore = Math.min(100, specificityMatches * 20);

    // Evidence score - check for concrete evidence
    const evidencePatterns = [
      /\b(evidence|data|metrics|results|feedback|report|analysis)\b/gi,
      /\b(project|initiative|goal|objective|target|milestone)\b/gi,
      /\b(team|client|stakeholder|customer|colleague)\b/gi,
    ];
    const evidenceMatches = evidencePatterns.reduce(
      (count, pattern) => count + (text.match(pattern)?.length || 0),
      0
    );
    const evidenceScore = Math.min(100, evidenceMatches * 25);

    // Actionability score - check for forward-looking language
    const actionPatterns = [
      /\b(should|could|recommend|suggest|consider|focus|improve|develop|continue)\b/gi,
      /\b(next|future|opportunity|area|growth|development)\b/gi,
    ];
    const actionMatches = actionPatterns.reduce(
      (count, pattern) => count + (text.match(pattern)?.length || 0),
      0
    );
    const actionabilityScore = Math.min(100, actionMatches * 30);

    const newIndicators: QualityIndicator[] = [
      {
        name: 'Length',
        score: lengthScore,
        icon: FileText,
        tip: lengthScore < 50 
          ? `Add more detail (${wordCount}/${Math.round(minRecommendedLength / 5)} words)` 
          : 'Good length',
        color: lengthScore >= 70 ? 'text-green-600' : lengthScore >= 40 ? 'text-amber-600' : 'text-red-600',
      },
      {
        name: 'Specificity',
        score: specificityScore,
        icon: Target,
        tip: specificityScore < 50 
          ? 'Add specific examples or outcomes' 
          : 'Good use of specific language',
        color: specificityScore >= 70 ? 'text-green-600' : specificityScore >= 40 ? 'text-amber-600' : 'text-red-600',
      },
      {
        name: 'Evidence',
        score: evidenceScore,
        icon: CheckCircle2,
        tip: evidenceScore < 50 
          ? 'Reference data, projects, or results' 
          : 'Good evidence provided',
        color: evidenceScore >= 70 ? 'text-green-600' : evidenceScore >= 40 ? 'text-amber-600' : 'text-red-600',
      },
      {
        name: 'Actionable',
        score: actionabilityScore,
        icon: TrendingUp,
        tip: actionabilityScore < 50 
          ? 'Add development suggestions' 
          : 'Good forward-looking feedback',
        color: actionabilityScore >= 70 ? 'text-green-600' : actionabilityScore >= 40 ? 'text-amber-600' : 'text-red-600',
      },
    ];

    setIndicators(newIndicators);
    setOverallScore(
      Math.round((lengthScore + specificityScore + evidenceScore + actionabilityScore) / 4)
    );
  }, [minRecommendedLength]);

  useEffect(() => {
    analyzeComment(comment);
  }, [comment, analyzeComment]);

  if (dismissed || !comment) return null;

  // Don't show anything if comment is too short to analyze
  if (comment.length < 10) return null;

  const getOverallColor = () => {
    if (overallScore >= 70) return 'text-green-600';
    if (overallScore >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getOverallBadge = () => {
    if (overallScore >= 70) return <Badge className="bg-green-100 text-green-800">Good Quality</Badge>;
    if (overallScore >= 40) return <Badge className="bg-amber-100 text-amber-800">Can Improve</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Detail</Badge>;
  };

  // Compact view for inline hints
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <TooltipProvider>
          {indicators.map((indicator) => (
            <Tooltip key={indicator.name}>
              <TooltipTrigger asChild>
                <div className={cn("flex items-center gap-1", indicator.color)}>
                  <indicator.icon className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{indicator.tip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        <span className={cn("font-medium", getOverallColor())}>{overallScore}%</span>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-muted/50 rounded-lg border text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span className="font-medium">Comment Quality</span>
          {getOverallBadge()}
        </div>
        <div className="flex items-center gap-2">
          {showAIButton && onImproveWithAI && overallScore < 70 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onImproveWithAI}
              className="h-7 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Improve with AI
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setDismissed(true)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <TooltipProvider>
          {indicators.map((indicator) => (
            <Tooltip key={indicator.name}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1 p-2 rounded bg-background/50">
                  <indicator.icon className={cn("h-4 w-4", indicator.color)} />
                  <Progress 
                    value={indicator.score} 
                    className="h-1 w-full"
                  />
                  <span className="text-xs text-muted-foreground">{indicator.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{indicator.tip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      {overallScore < 50 && (
        <div className="mt-2 pt-2 border-t flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Strong feedback includes specific examples, measurable outcomes, and actionable suggestions for development.
          </p>
        </div>
      )}

      {/* ISO 42001 Transparency */}
      <div className="mt-2 pt-2 border-t">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          AI analysis for coaching purposes only. Final content is your decision.
        </p>
      </div>
    </div>
  );
}
