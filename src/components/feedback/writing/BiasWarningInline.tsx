import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface BiasWarningInlineProps {
  biasIndicators: string[];
  biasRiskScore: number;
  className?: string;
}

export function BiasWarningInline({
  biasIndicators,
  biasRiskScore,
  className
}: BiasWarningInlineProps) {
  if (biasIndicators.length === 0 && biasRiskScore < 30) return null;

  const getSeverity = () => {
    if (biasRiskScore >= 70) return 'error';
    if (biasRiskScore >= 40) return 'warning';
    return 'info';
  };

  const severity = getSeverity();

  const config = {
    error: {
      icon: AlertCircle,
      bgClass: 'bg-destructive/10 border-destructive/30',
      textClass: 'text-destructive',
      badgeVariant: 'destructive' as const,
      label: 'High Bias Risk'
    },
    warning: {
      icon: AlertTriangle,
      bgClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800',
      textClass: 'text-amber-700 dark:text-amber-400',
      badgeVariant: 'secondary' as const,
      label: 'Potential Bias'
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
      textClass: 'text-blue-700 dark:text-blue-400',
      badgeVariant: 'outline' as const,
      label: 'Review Suggested'
    }
  };

  const { icon: Icon, bgClass, textClass, badgeVariant, label } = config[severity];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 rounded-md border",
            bgClass,
            className
          )}>
            <Icon className={cn("h-4 w-4 shrink-0", textClass)} />
            <span className={cn("text-xs font-medium", textClass)}>{label}</span>
            {biasIndicators.length > 0 && (
              <Badge variant={badgeVariant} className="text-xs h-5">
                {biasIndicators.length} {biasIndicators.length === 1 ? 'issue' : 'issues'}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-medium text-sm">Detected Issues:</p>
            {biasIndicators.length > 0 ? (
              <ul className="text-xs space-y-1">
                {biasIndicators.map((indicator, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-muted-foreground">•</span>
                    <span>{indicator}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Language patterns suggest potential bias. Consider reviewing for inclusive language.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
