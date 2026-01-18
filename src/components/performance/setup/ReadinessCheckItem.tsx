import { CheckCircle2, XCircle, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ReadinessCheckItemProps {
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  passed: boolean;
  actualValue: number;
  threshold: number;
  remediation: string;
  remediationLabel: string;
  showDetails?: boolean;
  contextInfo?: string; // Additional context like "32 of 33 filled positions have supervisors"
}

export function ReadinessCheckItem({
  name,
  description,
  severity,
  passed,
  actualValue,
  threshold,
  remediation,
  remediationLabel,
  showDetails = false,
  contextInfo
}: ReadinessCheckItemProps) {
  const navigate = useNavigate();

  const getSeverityIcon = () => {
    if (passed) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = () => {
    if (passed) return null;
    
    const colors = {
      critical: 'bg-destructive/10 text-destructive',
      warning: 'bg-amber-500/10 text-amber-600',
      info: 'bg-blue-500/10 text-blue-600'
    };
    
    return (
      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', colors[severity])}>
        {severity}
      </span>
    );
  };

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg border',
      passed ? 'bg-muted/30 border-muted' : 'bg-background border-border'
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {getSeverityIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('font-medium text-sm', passed && 'text-muted-foreground')}>
              {name}
            </span>
            {getSeverityBadge()}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {description}
          </p>
          {contextInfo && (
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {contextInfo}
            </p>
          )}
          {showDetails && !passed && !contextInfo && (
            <p className="text-xs text-muted-foreground mt-1">
              Current: {actualValue} / Required: {threshold}
            </p>
          )}
        </div>
      </div>
      
      {!passed && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 shrink-0"
          onClick={() => navigate(remediation)}
        >
          {remediationLabel}
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      )}
    </div>
  );
}
