import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Target, User, Layers, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssessmentMode, ASSESSMENT_MODE_LABELS, ASSESSMENT_MODE_DESCRIPTIONS } from '@/types/appraisalKRASnapshot';

interface AssessmentModeIndicatorProps {
  mode: AssessmentMode;
  kraCount: number;
  weightsValid: boolean;
  totalWeight?: number;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export function AssessmentModeIndicator({
  mode,
  kraCount,
  weightsValid,
  totalWeight,
  showTooltip = true,
  size = 'md',
}: AssessmentModeIndicatorProps) {
  // Determine effective mode for display
  const effectiveMode: AssessmentMode = mode === 'auto' 
    ? (kraCount > 0 ? 'kra_based' : 'responsibility_only')
    : mode;

  const getIcon = () => {
    switch (effectiveMode) {
      case 'responsibility_only':
        return <User className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />;
      case 'kra_based':
        return <Target className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />;
      case 'hybrid':
        return <Layers className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />;
      default:
        return <Sparkles className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />;
    }
  };

  const getVariant = (): 'default' | 'secondary' | 'outline' | 'destructive' => {
    if (!weightsValid && kraCount > 0) return 'destructive';
    if (effectiveMode === 'kra_based' || effectiveMode === 'hybrid') return 'default';
    return 'secondary';
  };

  const getDisplayText = () => {
    if (effectiveMode === 'responsibility_only') {
      return 'Overall Rating';
    }
    
    if (kraCount === 0) {
      return 'No KRAs';
    }

    const weightText = totalWeight !== undefined ? ` (${totalWeight}%)` : '';
    
    if (effectiveMode === 'hybrid') {
      return `Hybrid: ${kraCount} KRAs${weightText} + Overall`;
    }
    
    return `${kraCount} KRAs${weightText}`;
  };

  const indicator = (
    <Badge
      variant={getVariant()}
      className={cn(
        'gap-1',
        size === 'sm' && 'text-xs px-1.5 py-0'
      )}
    >
      {getIcon()}
      <span>{getDisplayText()}</span>
      {kraCount > 0 && (
        weightsValid ? (
          <CheckCircle2 className={cn(
            'text-green-500',
            size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
          )} />
        ) : (
          <AlertTriangle className={cn(
            'text-amber-500',
            size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'
          )} />
        )
      )}
    </Badge>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{ASSESSMENT_MODE_LABELS[mode]}</p>
            <p className="text-xs text-muted-foreground">
              {ASSESSMENT_MODE_DESCRIPTIONS[effectiveMode]}
            </p>
            {mode === 'auto' && (
              <p className="text-xs text-primary">
                Auto-detected as: {ASSESSMENT_MODE_LABELS[effectiveMode]}
              </p>
            )}
            {!weightsValid && kraCount > 0 && (
              <p className="text-xs text-destructive">
                ⚠ KRA weights should total 100%
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
