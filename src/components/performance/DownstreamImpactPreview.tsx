import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle,
  Grid3x3,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Bell,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAppraisalIntegration, IntegrationRule } from '@/hooks/useAppraisalIntegration';
import { usePerformanceCategoryByScore } from '@/hooks/usePerformanceCategories';

interface DownstreamImpactPreviewProps {
  companyId: string;
  overallScore?: number | null;
  goalScore?: number | null;
  competencyScore?: number | null;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  nine_box: <Grid3x3 className="h-4 w-4" />,
  succession: <Users className="h-4 w-4" />,
  idp: <Target className="h-4 w-4" />,
  pip: <Target className="h-4 w-4 text-destructive" />,
  compensation: <DollarSign className="h-4 w-4" />,
  workforce_analytics: <BarChart3 className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />
};

const MODULE_NAMES: Record<string, string> = {
  nine_box: '9-Box Assessment',
  succession: 'Succession Planning',
  idp: 'Development Plan',
  pip: 'Performance Improvement Plan',
  compensation: 'Compensation Review',
  workforce_analytics: 'Analytics Update',
  notifications: 'Notifications'
};

function evaluateRuleWillMatch(
  rule: IntegrationRule,
  categoryCode: string | null | undefined,
  scores: { overall?: number | null; goals?: number | null; competencies?: number | null }
): boolean {
  const getScore = (section: string | null) => {
    switch (section) {
      case 'goals': return scores.goals;
      case 'competencies': return scores.competencies;
      default: return scores.overall;
    }
  };

  switch (rule.condition_type) {
    case 'category_match':
      if (!categoryCode) return false;
      const codes = rule.condition_category_codes || [];
      if (rule.condition_operator === 'in') {
        return codes.includes(categoryCode);
      } else if (rule.condition_operator === 'not_in') {
        return !codes.includes(categoryCode);
      }
      return false;

    case 'score_range':
      const score = getScore(rule.condition_section);
      if (score === null || score === undefined) return false;
      const value = rule.condition_value ?? 0;
      switch (rule.condition_operator) {
        case '=': return score === value;
        case '!=': return score !== value;
        case '>': return score > value;
        case '<': return score < value;
        case '>=': return score >= value;
        case '<=': return score <= value;
        case 'between':
          return score >= value && score <= (rule.condition_value_max ?? 100);
        default: return false;
      }

    default:
      return true;
  }
}

export function DownstreamImpactPreview({
  companyId,
  overallScore,
  goalScore,
  competencyScore
}: DownstreamImpactPreviewProps) {
  const { rules, loading } = useAppraisalIntegration(companyId);
  const performanceCategory = usePerformanceCategoryByScore(overallScore, companyId);
  const [matchingRules, setMatchingRules] = useState<IntegrationRule[]>([]);

  useEffect(() => {
    if (!rules.length) return;

    const matches = rules.filter(rule => 
      rule.is_active && 
      evaluateRuleWillMatch(rule, performanceCategory?.code || null, {
        overall: overallScore,
        goals: goalScore,
        competencies: competencyScore
      })
    );

    setMatchingRules(matches);
  }, [rules, performanceCategory?.code, overallScore, goalScore, competencyScore]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!matchingRules.length) {
    return null;
  }

  // Group by module
  const byModule = matchingRules.reduce((acc, rule) => {
    if (!acc[rule.target_module]) acc[rule.target_module] = [];
    acc[rule.target_module].push(rule);
    return acc;
  }, {} as Record<string, IntegrationRule[]>);

  const requiresApproval = matchingRules.some(r => r.requires_approval);
  const autoExecute = matchingRules.filter(r => r.auto_execute && !r.requires_approval);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Downstream Impact Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>This appraisal will trigger {matchingRules.length} integration{matchingRules.length !== 1 ? 's' : ''}</AlertTitle>
          <AlertDescription className="text-xs">
            {autoExecute.length > 0 && (
              <span>{autoExecute.length} will execute automatically. </span>
            )}
            {requiresApproval && (
              <span className="text-amber-600">Some require approval.</span>
            )}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {Object.entries(byModule).map(([module, moduleRules]) => (
            <div 
              key={module} 
              className="flex items-start gap-2 p-2 rounded-lg border bg-card"
            >
              <div className="mt-0.5">
                {MODULE_ICONS[module] || <ChevronRight className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{MODULE_NAMES[module] || module}</p>
                  {moduleRules.some(r => r.requires_approval) && (
                    <Badge variant="outline" className="text-xs">Needs Approval</Badge>
                  )}
                </div>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  {moduleRules.map(rule => (
                    <li key={rule.id} className="flex items-center gap-1">
                      <ChevronRight className="h-3 w-3" />
                      {rule.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
