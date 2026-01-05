import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface QualityScores {
  clarity: number;
  specificity: number;
  biasRisk: number;
  behavioralFocus: number;
  overall: number;
}

interface WritingQualityMeterProps {
  scores: QualityScores | null;
  isAnalyzing?: boolean;
  compact?: boolean;
  className?: string;
}

export function WritingQualityMeter({
  scores,
  isAnalyzing,
  compact = false,
  className
}: WritingQualityMeterProps) {
  if (!scores && !isAnalyzing) return null;

  const getScoreColor = (score: number, inverse = false) => {
    const effectiveScore = inverse ? 100 - score : score;
    if (effectiveScore >= 70) return 'text-green-600';
    if (effectiveScore >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number, inverse = false) => {
    const effectiveScore = inverse ? 100 - score : score;
    if (effectiveScore >= 70) return 'bg-green-500';
    if (effectiveScore >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getOverallIcon = (score: number) => {
    if (score >= 70) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 40) return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isAnalyzing ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Analyzing...
          </div>
        ) : scores ? (
          <>
            {getOverallIcon(scores.overall)}
            <span className={cn("text-sm font-medium", getScoreColor(scores.overall))}>
              {scores.overall}%
            </span>
          </>
        ) : null}
      </div>
    );
  }

  const metrics = [
    { label: 'Clarity', value: scores?.clarity ?? 0, inverse: false },
    { label: 'Specificity', value: scores?.specificity ?? 0, inverse: false },
    { label: 'Bias Risk', value: scores?.biasRisk ?? 0, inverse: true },
    { label: 'Behavioral Focus', value: scores?.behavioralFocus ?? 0, inverse: false },
  ];

  return (
    <div className={cn("space-y-3 p-3 rounded-lg border bg-card", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Writing Quality</span>
        {isAnalyzing ? (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Analyzing...
          </div>
        ) : scores ? (
          <div className="flex items-center gap-1.5">
            {getOverallIcon(scores.overall)}
            <span className={cn("text-sm font-semibold", getScoreColor(scores.overall))}>
              {scores.overall}%
            </span>
          </div>
        ) : null}
      </div>

      {scores && (
        <div className="space-y-2">
          {metrics.map(({ label, value, inverse }) => (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-medium", getScoreColor(value, inverse))}>
                  {inverse ? `${100 - value}% safe` : `${value}%`}
                </span>
              </div>
              <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full transition-all duration-300",
                    getProgressColor(value, inverse)
                  )}
                  style={{ width: `${inverse ? 100 - value : value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
