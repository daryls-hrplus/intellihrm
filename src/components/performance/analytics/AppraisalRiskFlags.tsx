import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, 
  AlertTriangle, 
  TrendingDown, 
  Brain, 
  Target,
  ShieldAlert,
  RefreshCw,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AppraisalRiskFlagsProps {
  companyId?: string;
}

interface PerformanceRiskFlag {
  id: string;
  employeeId: string;
  employeeName: string;
  avatarUrl?: string;
  department?: string;
  flagType: 'chronic_underperformance' | 'skills_decay' | 'high_goals_low_behavior' | 'declining_competencies';
  severity: 'warning' | 'critical';
  details: string;
  metrics: {
    label: string;
    value: number;
    threshold: number;
  }[];
  recommendedAction: string;
  detectedAt: string;
}

const FLAG_TYPE_CONFIG = {
  chronic_underperformance: {
    label: 'Chronic Underperformance',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  skills_decay: {
    label: 'Skills Decay',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  high_goals_low_behavior: {
    label: 'High Goals + Low Behaviors',
    icon: Target,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  declining_competencies: {
    label: 'Declining Competencies',
    icon: TrendingDown,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

export function AppraisalRiskFlags({ companyId }: AppraisalRiskFlagsProps) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [riskFlags, setRiskFlags] = useState<PerformanceRiskFlag[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    byType: {} as Record<string, number>,
  });

  useEffect(() => {
    if (companyId) {
      analyzeRiskFlags();
    }
  }, [companyId]);

  const analyzeRiskFlags = async () => {
    setLoading(true);
    try {
      // Fetch score breakdowns with employee info
      const { data: scores, error } = await supabase
        .from('appraisal_score_breakdown')
        .select(`
          id,
          goals_raw_score,
          competencies_raw_score,
          responsibilities_raw_score,
          values_raw_score,
          post_calibration_score,
          pre_calibration_score,
          created_at,
          participant:appraisal_participants!inner(
            id,
            employee_id,
            employee:profiles!employee_id(
              id,
              full_name,
              avatar_url,
              department:departments(name)
            ),
            cycle:appraisal_cycles!inner(company_id, cycle_name, end_date)
          )
        `)
        .eq('participant.cycle.company_id', companyId)
        .order('participant.cycle.end_date', { ascending: false });

      if (error) throw error;

      // Group scores by employee
      const employeeScores: Record<string, any[]> = {};
      scores?.forEach((score: any) => {
        const empId = score.participant?.employee_id;
        if (empId) {
          if (!employeeScores[empId]) {
            employeeScores[empId] = [];
          }
          employeeScores[empId].push(score);
        }
      });

      // Analyze each employee for risk flags
      const flags: PerformanceRiskFlag[] = [];

      Object.entries(employeeScores).forEach(([empId, scores]) => {
        if (scores.length === 0) return;

        const latestScore = scores[0];
        const employee = latestScore.participant?.employee;
        if (!employee) return;

        const overallScore = latestScore.post_calibration_score ?? latestScore.pre_calibration_score ?? 0;
        const goalsScore = latestScore.goals_raw_score ?? 0;
        const competencyScore = latestScore.competencies_raw_score ?? 0;
        const valuesScore = latestScore.values_raw_score ?? 0;
        const responsibilityScore = latestScore.responsibilities_raw_score ?? 0;

        // Rule 1: Chronic Underperformance in Competencies
        // 2+ consecutive cycles with competency score < 2.5
        if (scores.length >= 2) {
          const lowCompetencyCycles = scores.filter((s: any) => 
            (s.competencies_raw_score ?? 0) < 2.5
          ).length;

          if (lowCompetencyCycles >= 2) {
            flags.push({
              id: `${empId}-chronic`,
              employeeId: empId,
              employeeName: employee.full_name || 'Unknown',
              avatarUrl: employee.avatar_url,
              department: employee.department?.name,
              flagType: 'chronic_underperformance',
              severity: lowCompetencyCycles >= 3 ? 'critical' : 'warning',
              details: `Competency scores below threshold for ${lowCompetencyCycles} consecutive cycles`,
              metrics: [
                { label: 'Competency Score', value: competencyScore, threshold: 2.5 },
                { label: 'Consecutive Low Cycles', value: lowCompetencyCycles, threshold: 2 },
              ],
              recommendedAction: 'Create Performance Improvement Plan (PIP) with targeted competency development',
              detectedAt: new Date().toISOString(),
            });
          }
        }

        // Rule 2: Skills Decay
        // Declining trend in competency scores over 3+ cycles
        if (scores.length >= 3) {
          const competencyScores = scores.map((s: any) => s.competencies_raw_score ?? 0);
          const isDecaying = competencyScores[0] < competencyScores[1] && competencyScores[1] < competencyScores[2];
          const decayAmount = competencyScores[2] - competencyScores[0];

          if (isDecaying && decayAmount > 0.5) {
            flags.push({
              id: `${empId}-decay`,
              employeeId: empId,
              employeeName: employee.full_name || 'Unknown',
              avatarUrl: employee.avatar_url,
              department: employee.department?.name,
              flagType: 'skills_decay',
              severity: decayAmount > 1 ? 'critical' : 'warning',
              details: `Competency scores have declined by ${decayAmount.toFixed(1)} points over recent cycles`,
              metrics: [
                { label: 'Current Score', value: competencyScores[0], threshold: 3 },
                { label: 'Previous Score', value: competencyScores[2], threshold: 3 },
                { label: 'Decline', value: decayAmount, threshold: 0.5 },
              ],
              recommendedAction: 'Schedule skills assessment and develop targeted learning plan',
              detectedAt: new Date().toISOString(),
            });
          }
        }

        // Rule 3: High Goals + Low Behaviors
        // Goal score >= 4 but values/behavior score < 3
        if (goalsScore >= 4 && valuesScore < 3) {
          const gap = goalsScore - valuesScore;
          flags.push({
            id: `${empId}-behavior`,
            employeeId: empId,
            employeeName: employee.full_name || 'Unknown',
            avatarUrl: employee.avatar_url,
            department: employee.department?.name,
            flagType: 'high_goals_low_behavior',
            severity: gap > 1.5 ? 'critical' : 'warning',
            details: 'High goal achievement but low behavioral/values alignment - potential "toxic high performer"',
            metrics: [
              { label: 'Goal Score', value: goalsScore, threshold: 4 },
              { label: 'Values Score', value: valuesScore, threshold: 3 },
              { label: 'Gap', value: gap, threshold: 1 },
            ],
            recommendedAction: 'Coaching intervention focusing on organizational values and collaborative behaviors',
            detectedAt: new Date().toISOString(),
          });
        }

        // Rule 4: Declining Competencies
        // Current competency score is significantly lower than goals/responsibilities
        if (goalsScore >= 3.5 && competencyScore < 2.5) {
          const gap = goalsScore - competencyScore;
          flags.push({
            id: `${empId}-competency-gap`,
            employeeId: empId,
            employeeName: employee.full_name || 'Unknown',
            avatarUrl: employee.avatar_url,
            department: employee.department?.name,
            flagType: 'declining_competencies',
            severity: gap > 1.5 ? 'critical' : 'warning',
            details: 'Achieving goals but lacking required competencies - sustainability risk',
            metrics: [
              { label: 'Goal Score', value: goalsScore, threshold: 3.5 },
              { label: 'Competency Score', value: competencyScore, threshold: 2.5 },
              { label: 'Gap', value: gap, threshold: 1 },
            ],
            recommendedAction: 'Develop Individual Development Plan (IDP) focusing on skill building',
            detectedAt: new Date().toISOString(),
          });
        }
      });

      // Sort by severity then by flag type
      flags.sort((a, b) => {
        if (a.severity === 'critical' && b.severity !== 'critical') return -1;
        if (b.severity === 'critical' && a.severity !== 'critical') return 1;
        return 0;
      });

      setRiskFlags(flags);

      // Calculate summary
      const byType: Record<string, number> = {};
      flags.forEach(f => {
        byType[f.flagType] = (byType[f.flagType] || 0) + 1;
      });

      setSummary({
        total: flags.length,
        critical: flags.filter(f => f.severity === 'critical').length,
        warning: flags.filter(f => f.severity === 'warning').length,
        byType,
      });

    } catch (error) {
      console.error('Error analyzing risk flags:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      {summary.critical > 0 && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{summary.critical} Critical Risk Flag{summary.critical > 1 ? 's' : ''}</AlertTitle>
          <AlertDescription>
            Immediate attention required for employees with critical performance concerns.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">Total Flags</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{summary.critical}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold text-amber-600">{summary.warning}</div>
                <div className="text-sm text-muted-foreground">Warning</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={analyzeRiskFlags}
              disabled={analyzing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Risk Type Breakdown */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(FLAG_TYPE_CONFIG).map(([type, config]) => {
          const count = summary.byType[type] || 0;
          const Icon = config.icon;
          return (
            <Card key={type} className={count > 0 ? 'border-2' : ''} style={{ borderColor: count > 0 ? 'hsl(var(--warning))' : undefined }}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div>
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">{config.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Flags List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Rule-Based Performance Risk Flags
          </CardTitle>
          <CardDescription>
            Automatically detected risk patterns based on appraisal data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskFlags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No performance risk flags detected</p>
              <p className="text-sm">All employees are performing within expected parameters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {riskFlags.map((flag) => {
                const config = FLAG_TYPE_CONFIG[flag.flagType];
                const Icon = config.icon;
                
                return (
                  <div 
                    key={flag.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      flag.severity === 'critical' 
                        ? 'border-l-red-500 bg-red-500/5' 
                        : 'border-l-amber-500 bg-amber-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 mt-1">
                          <AvatarImage src={flag.avatarUrl} />
                          <AvatarFallback>
                            {flag.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{flag.employeeName}</p>
                            <Badge variant={flag.severity === 'critical' ? 'destructive' : 'outline'}>
                              {flag.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{flag.department}</p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1 rounded ${config.bgColor}`}>
                              <Icon className={`h-3 w-3 ${config.color}`} />
                            </div>
                            <span className="text-sm font-medium">{config.label}</span>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{flag.details}</p>

                          {/* Metrics */}
                          <div className="flex flex-wrap gap-3 mb-3">
                            {flag.metrics.map((metric, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="text-muted-foreground">{metric.label}:</span>{' '}
                                <span className={`font-medium ${
                                  metric.value < metric.threshold ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {metric.value.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground"> (threshold: {metric.threshold})</span>
                              </div>
                            ))}
                          </div>

                          {/* Recommended Action */}
                          <div className="flex items-start gap-2 p-2 rounded bg-muted/50">
                            <FileText className="h-4 w-4 text-primary mt-0.5" />
                            <div>
                              <span className="text-xs font-medium">Recommended:</span>
                              <p className="text-xs text-muted-foreground">{flag.recommendedAction}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
