import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, ShieldAlert, Ban } from 'lucide-react';
import { usePerformanceRiskAnalyzer } from '@/hooks/performance/usePerformanceRiskAnalyzer';
import { RISK_TYPE_LABELS, type EmployeePerformanceRisk } from '@/types/performanceRisks';

interface SuccessionRiskOverlayProps {
  candidateId: string;
  companyId?: string;
  showLabel?: boolean;
}

export function SuccessionRiskOverlay({ candidateId, companyId, showLabel = false }: SuccessionRiskOverlayProps) {
  const { getEmployeeRisks } = usePerformanceRiskAnalyzer({ companyId, employeeId: candidateId });
  
  const risks = getEmployeeRisks(candidateId);
  const activeRisks = risks.filter(r => r.is_active);
  
  if (activeRisks.length === 0) return null;

  const hasBlockingRisk = activeRisks.some(r => r.succession_impact === 'excluded');
  const hasFlaggedRisk = activeRisks.some(r => r.succession_impact === 'flagged');
  const highestRisk = activeRisks.reduce((prev, curr) => {
    const levels = ['critical', 'high', 'medium', 'low'];
    return levels.indexOf(curr.risk_level) < levels.indexOf(prev.risk_level) ? curr : prev;
  });

  const getIcon = () => {
    if (hasBlockingRisk) return <Ban className="h-3.5 w-3.5" />;
    if (hasFlaggedRisk) return <ShieldAlert className="h-3.5 w-3.5" />;
    return <AlertTriangle className="h-3.5 w-3.5" />;
  };

  const getBadgeVariant = () => {
    if (hasBlockingRisk) return 'destructive';
    if (highestRisk.risk_level === 'critical') return 'destructive';
    if (highestRisk.risk_level === 'high') return 'default';
    return 'secondary';
  };

  const getTooltipContent = () => (
    <div className="space-y-2 max-w-xs">
      <p className="font-medium">
        {hasBlockingRisk 
          ? 'Promotion Blocked' 
          : hasFlaggedRisk 
            ? 'Flagged for Review' 
            : 'Performance Risks Detected'}
      </p>
      <div className="space-y-1">
        {activeRisks.slice(0, 3).map(risk => (
          <div key={risk.id} className="text-xs flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              risk.risk_level === 'critical' ? 'bg-red-500' :
              risk.risk_level === 'high' ? 'bg-orange-500' :
              risk.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <span>{RISK_TYPE_LABELS[risk.risk_type]}</span>
          </div>
        ))}
        {activeRisks.length > 3 && (
          <p className="text-xs text-muted-foreground">+{activeRisks.length - 3} more</p>
        )}
      </div>
      {highestRisk.promotion_block_reason && (
        <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
          {highestRisk.promotion_block_reason}
        </p>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getBadgeVariant()} 
            className="cursor-help gap-1"
          >
            {getIcon()}
            {showLabel && (
              <span>
                {hasBlockingRisk 
                  ? 'Blocked' 
                  : hasFlaggedRisk 
                    ? 'Flagged' 
                    : `${activeRisks.length} Risk${activeRisks.length > 1 ? 's' : ''}`}
              </span>
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="right" className="p-3">
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
