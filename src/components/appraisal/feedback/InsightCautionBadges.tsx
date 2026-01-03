import { AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { InsightCaution } from '@/types/developmentThemes';

interface InsightCautionBadgesProps {
  cautions: InsightCaution[];
  compact?: boolean;
}

const severityConfig = {
  info: {
    icon: Info,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200',
  },
  critical: {
    icon: XCircle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200',
  },
};

const cautionLabels: Record<string, string> = {
  low_sample: 'Low Sample',
  high_variance: 'High Variance',
  outlier: 'Outlier Detected',
  recency_bias: 'Recency Bias',
  single_source: 'Limited Sources',
};

export function InsightCautionBadges({ cautions, compact = false }: InsightCautionBadgesProps) {
  if (cautions.length === 0) return null;

  // Sort by severity (critical first)
  const sortedCautions = [...cautions].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  if (compact) {
    // Show single badge with count
    const criticalCount = cautions.filter(c => c.severity === 'critical').length;
    const warningCount = cautions.filter(c => c.severity === 'warning').length;
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={criticalCount > 0 ? severityConfig.critical.className : severityConfig.warning.className}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            {cautions.length} caution{cautions.length !== 1 ? 's' : ''}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm">
          <div className="space-y-1">
            {sortedCautions.map((caution, idx) => (
              <div key={idx} className="text-xs">
                <span className="font-medium">{caution.message}</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {sortedCautions.map((caution, idx) => {
        const config = severityConfig[caution.severity];
        const Icon = config.icon;
        
        return (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={`cursor-help ${config.className}`}>
                <Icon className="h-3 w-3 mr-1" />
                {cautionLabels[caution.type] || caution.message}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium text-sm">{caution.message}</p>
                <p className="text-xs text-muted-foreground">{caution.details}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
