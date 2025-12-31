import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Brain, AlertTriangle, TrendingUp, Clock, UserX, Award, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppraisalPredictiveInsightsProps {
  companyId?: string;
}

interface AttritionRisk {
  employeeId: string;
  name: string;
  avatarUrl?: string;
  department?: string;
  riskScore: number;
  riskFactors: string[];
  lastAppraisalScore?: number;
  trend: 'declining' | 'stable' | 'improving';
}

interface PromotionCandidate {
  employeeId: string;
  name: string;
  avatarUrl?: string;
  currentRole?: string;
  targetRole?: string;
  successLikelihood: number;
  readinessMonths: number;
  strengths: string[];
  gaps: string[];
}

interface ReadinessInsight {
  roleCategory: string;
  avgReadinessMonths: number;
  candidateCount: number;
  readyNowCount: number;
}

export function AppraisalPredictiveInsights({ companyId }: AppraisalPredictiveInsightsProps) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [attritionRisks, setAttritionRisks] = useState<AttritionRisk[]>([]);
  const [promotionCandidates, setPromotionCandidates] = useState<PromotionCandidate[]>([]);
  const [readinessInsights, setReadinessInsights] = useState<ReadinessInsight[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchPredictiveData();
    }
  }, [companyId]);

  const fetchPredictiveData = async () => {
    setLoading(true);
    try {
      // Fetch performance data for predictions
      const { data: performanceData, error } = await supabase
        .from('appraisal_score_breakdown')
        .select(`
          post_calibration_score,
          pre_calibration_score,
          goals_raw_score,
          competencies_raw_score,
          participant:appraisal_participants!inner(
            employee:profiles!employee_id(
              id,
              full_name,
              avatar_url,
              department:departments(name),
              job_title,
              hire_date
            ),
            cycle:appraisal_cycles!inner(company_id, end_date)
          )
        `)
        .eq('participant.cycle.company_id', companyId)
        .order('participant.cycle.end_date', { ascending: false });

      if (error) throw error;

      // Get employee risk data
      const riskResult = await (supabase as any)
        .from('employee_performance_risks')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);
      const riskData = riskResult?.data || [];

      // Get succession candidates
      const successionResult = await (supabase as any)
        .from('succession_candidates')
        .select(`
          employee_id,
          readiness_level,
          readiness_months,
          strengths,
          development_areas,
          plan:succession_plans(position_title, position_level)
        `)
        .eq('is_active', true);
      const successionData = successionResult?.data || [];

      // Process Attrition Risk predictions
      const employeeScores: Record<string, { scores: number[]; employee: any; risks: any[] }> = {};
      
      performanceData?.forEach((score: any) => {
        const emp = score.participant?.employee;
        if (!emp) return;
        
        if (!employeeScores[emp.id]) {
          employeeScores[emp.id] = { scores: [], employee: emp, risks: [] };
        }
        
        const finalScore = score.post_calibration_score ?? score.pre_calibration_score ?? 0;
        employeeScores[emp.id].scores.push(finalScore);
      });

      // Add risk data
      riskData?.forEach((risk: any) => {
        if (employeeScores[risk.employee_id]) {
          employeeScores[risk.employee_id].risks.push(risk);
        }
      });

      // Calculate attrition risk based on performance trends
      const attritionRisks: AttritionRisk[] = [];
      
      Object.entries(employeeScores).forEach(([empId, data]) => {
        const { scores, employee, risks } = data;
        if (scores.length === 0) return;

        // Calculate trend
        let trend: AttritionRisk['trend'] = 'stable';
        if (scores.length >= 2) {
          const diff = scores[0] - scores[scores.length - 1];
          if (diff < -0.5) trend = 'declining';
          else if (diff > 0.3) trend = 'improving';
        }

        // Calculate risk score based on multiple factors
        const latestScore = scores[0];
        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        let riskScore = 0;
        const riskFactors: string[] = [];

        // Low performance
        if (latestScore < 2.5) {
          riskScore += 30;
          riskFactors.push('Low performance score');
        } else if (latestScore < 3) {
          riskScore += 15;
          riskFactors.push('Below average performance');
        }

        // Declining trend
        if (trend === 'declining') {
          riskScore += 25;
          riskFactors.push('Declining performance trend');
        }

        // Existing performance risks
        if (risks.length > 0) {
          riskScore += 20;
          riskFactors.push(`${risks.length} active performance risk(s)`);
        }

        // Tenure factor (new employees with low scores)
        const hireDate = employee.hire_date ? new Date(employee.hire_date) : null;
        if (hireDate) {
          const monthsEmployed = (Date.now() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          if (monthsEmployed < 12 && latestScore < 3) {
            riskScore += 15;
            riskFactors.push('New hire with low adaptation');
          }
        }

        if (riskScore >= 30) {
          attritionRisks.push({
            employeeId: empId,
            name: employee.full_name || 'Unknown',
            avatarUrl: employee.avatar_url,
            department: employee.department?.name,
            riskScore: Math.min(riskScore, 100),
            riskFactors,
            lastAppraisalScore: latestScore,
            trend,
          });
        }
      });

      attritionRisks.sort((a, b) => b.riskScore - a.riskScore);
      setAttritionRisks(attritionRisks.slice(0, 15));

      // Process promotion candidates
      const promotionCandidates: PromotionCandidate[] = [];
      const readinessMap: Record<string, { total: number; count: number; readyNow: number }> = {};

      successionData?.forEach((candidate: any) => {
        const empData = employeeScores[candidate.employee_id];
        if (!empData) return;

        const latestScore = empData.scores[0] || 0;
        const successLikelihood = calculatePromotionSuccess(latestScore, candidate.readiness_level);

        promotionCandidates.push({
          employeeId: candidate.employee_id,
          name: empData.employee.full_name || 'Unknown',
          avatarUrl: empData.employee.avatar_url,
          currentRole: empData.employee.job_title,
          targetRole: candidate.plan?.position_title,
          successLikelihood,
          readinessMonths: candidate.readiness_months || 12,
          strengths: candidate.strengths || [],
          gaps: candidate.development_areas || [],
        });

        // Track readiness by role level
        const level = candidate.plan?.position_level || 'Other';
        if (!readinessMap[level]) {
          readinessMap[level] = { total: 0, count: 0, readyNow: 0 };
        }
        readinessMap[level].total += candidate.readiness_months || 12;
        readinessMap[level].count += 1;
        if (candidate.readiness_level === 'ready_now') {
          readinessMap[level].readyNow += 1;
        }
      });

      promotionCandidates.sort((a, b) => b.successLikelihood - a.successLikelihood);
      setPromotionCandidates(promotionCandidates.slice(0, 10));

      // Process readiness insights
      const readinessInsights: ReadinessInsight[] = Object.entries(readinessMap).map(([role, data]) => ({
        roleCategory: role,
        avgReadinessMonths: data.count > 0 ? data.total / data.count : 0,
        candidateCount: data.count,
        readyNowCount: data.readyNow,
      }));

      setReadinessInsights(readinessInsights);

    } catch (error) {
      console.error('Error fetching predictive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePromotionSuccess = (performanceScore: number, readinessLevel: string): number => {
    let base = performanceScore * 15; // Max 75 from performance
    
    switch (readinessLevel) {
      case 'ready_now': base += 25; break;
      case 'ready_1_year': base += 15; break;
      case 'ready_2_years': base += 5; break;
      default: base += 0;
    }
    
    return Math.min(Math.round(base), 100);
  };

  const getTrendIcon = (trend: AttritionRisk['trend']) => {
    switch (trend) {
      case 'declining': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
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
      {/* AI Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Predictive Insights</h3>
              <p className="text-sm text-muted-foreground">
                Performance-based predictions for workforce planning
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPredictiveData} disabled={analyzing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="attrition" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attrition" className="gap-1.5">
            <UserX className="h-4 w-4" />
            Attrition Risk
          </TabsTrigger>
          <TabsTrigger value="promotion" className="gap-1.5">
            <Award className="h-4 w-4" />
            Promotion Success
          </TabsTrigger>
          <TabsTrigger value="readiness" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Time-to-Role
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attrition">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Post-Appraisal Attrition Risk
              </CardTitle>
              <CardDescription>
                Employees at risk of leaving based on performance trends and engagement signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attritionRisks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No significant attrition risks detected
                </div>
              ) : (
                <div className="space-y-3">
                  {attritionRisks.map((risk) => (
                    <div 
                      key={risk.employeeId}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={risk.avatarUrl} />
                          <AvatarFallback>
                            {risk.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{risk.name}</p>
                            {getTrendIcon(risk.trend)}
                          </div>
                          <p className="text-xs text-muted-foreground">{risk.department}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Last Score:</span>
                            <Badge variant={risk.lastAppraisalScore && risk.lastAppraisalScore >= 3 ? 'secondary' : 'destructive'}>
                              {risk.lastAppraisalScore?.toFixed(1) || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Risk</span>
                            <span className="text-xs font-medium">{risk.riskScore}%</span>
                          </div>
                          <Progress 
                            value={risk.riskScore} 
                            className={`h-2 ${risk.riskScore >= 70 ? '[&>div]:bg-red-500' : risk.riskScore >= 50 ? '[&>div]:bg-orange-500' : ''}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Promotion Success Likelihood
              </CardTitle>
              <CardDescription>
                Predicted success rate for promotion candidates based on performance and readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              {promotionCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No promotion candidates identified
                </div>
              ) : (
                <div className="space-y-3">
                  {promotionCandidates.map((candidate) => (
                    <div 
                      key={candidate.employeeId}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={candidate.avatarUrl} />
                            <AvatarFallback>
                              {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{candidate.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {candidate.currentRole} → {candidate.targetRole}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{candidate.successLikelihood}%</div>
                          <div className="text-xs text-muted-foreground">Success Likelihood</div>
                        </div>
                      </div>

                      <Progress value={candidate.successLikelihood} className="h-2 mb-3" />

                      <div className="flex flex-wrap gap-1">
                        {candidate.strengths.slice(0, 3).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                        {candidate.gaps.slice(0, 2).map((g, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-orange-600">{g}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readiness">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time-to-Role Readiness
              </CardTitle>
              <CardDescription>
                Average months to readiness by role category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {readinessInsights.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No readiness data available
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {readinessInsights.map((insight) => (
                    <Card key={insight.roleCategory}>
                      <CardContent className="pt-4">
                        <h4 className="font-medium mb-2">{insight.roleCategory}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Candidates</span>
                            <span className="font-medium">{insight.candidateCount}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ready Now</span>
                            <Badge variant="secondary">{insight.readyNowCount}</Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Avg. Readiness</span>
                            <span className="font-medium">{insight.avgReadinessMonths.toFixed(0)} months</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
