import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Award,
  FileText,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { usePerformanceRiskAnalyzer } from '@/hooks/performance/usePerformanceRiskAnalyzer';
import { 
  RISK_TYPE_LABELS, 
  RISK_LEVEL_BADGE_VARIANTS,
  type PerformanceRiskType 
} from '@/types/performanceRisks';
import { formatDistanceToNow } from 'date-fns';

interface EmployeeRiskProfileCardProps {
  employeeId: string;
  companyId?: string;
  compact?: boolean;
}

export function EmployeeRiskProfileCard({ employeeId, companyId, compact = false }: EmployeeRiskProfileCardProps) {
  const { 
    getEmployeeRisks, 
    getEmployeeTrend,
    triggerIntervention,
    resolveRisk
  } = usePerformanceRiskAnalyzer({ companyId, employeeId });

  const risks = getEmployeeRisks(employeeId);
  const trends = getEmployeeTrend(employeeId);

  const getRiskTypeIcon = (type: PerformanceRiskType) => {
    switch (type) {
      case 'chronic_underperformance':
        return <TrendingDown className="h-4 w-4" />;
      case 'skills_decay':
        return <Clock className="h-4 w-4" />;
      case 'toxic_high_performer':
        return <Award className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const latestTrend = trends[0];
  const overallTrend = latestTrend?.trend_direction || 'stable';

  if (risks.length === 0) {
    if (compact) return null;
    
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
          <p className="text-sm text-muted-foreground">No active performance risks</p>
        </CardContent>
      </Card>
    );
  }

  const highestRisk = risks.reduce((prev, curr) => {
    const levels = ['critical', 'high', 'medium', 'low'];
    return levels.indexOf(curr.risk_level) < levels.indexOf(prev.risk_level) ? curr : prev;
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border border-destructive/20 bg-destructive/5">
        <ShieldAlert className="h-4 w-4 text-destructive" />
        <span className="text-sm font-medium">{risks.length} Performance Risk{risks.length > 1 ? 's' : ''}</span>
        <Badge variant={RISK_LEVEL_BADGE_VARIANTS[highestRisk.risk_level]} className="ml-auto">
          {highestRisk.risk_level}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Performance Risks
          </CardTitle>
          <Badge variant={RISK_LEVEL_BADGE_VARIANTS[highestRisk.risk_level]}>
            Highest: {highestRisk.risk_level}
          </Badge>
        </div>
        <CardDescription>
          {risks.length} active risk{risks.length > 1 ? 's' : ''} detected
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map(risk => (
          <div key={risk.id} className="p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getRiskTypeIcon(risk.risk_type)}
                <span className="font-medium text-sm">{RISK_TYPE_LABELS[risk.risk_type]}</span>
              </div>
              <Badge variant={RISK_LEVEL_BADGE_VARIANTS[risk.risk_level]}>
                {risk.risk_level}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Risk Score</span>
                <span>{risk.risk_score?.toFixed(0)}/100</span>
              </div>
              <Progress value={risk.risk_score || 0} className="h-1.5" />
            </div>

            {risk.ai_recommendation && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {risk.ai_recommendation}
              </p>
            )}

            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">
                Detected {formatDistanceToNow(new Date(risk.first_detected_at), { addSuffix: true })}
              </span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => triggerIntervention({ riskId: risk.id, interventionType: 'idp' })}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Create IDP
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs text-green-600"
                  onClick={() => resolveRisk({ riskId: risk.id })}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Succession Impact Warning */}
        {risks.some(r => r.succession_impact !== 'none') && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Succession Impact</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {risks.find(r => r.succession_impact === 'excluded') 
                ? 'Excluded from succession consideration'
                : 'Flagged for succession review'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
