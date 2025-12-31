import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Star, TrendingUp, Award, Target, Users, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface HighPotentialIdentificationProps {
  companyId?: string;
}

interface HighPotentialEmployee {
  id: string;
  name: string;
  avatarUrl?: string;
  department?: string;
  jobTitle?: string;
  performanceScore: number;
  potentialScore: number;
  readinessLevel: 'ready_now' | 'ready_1_year' | 'ready_2_years' | 'developing';
  strengths: string[];
  developmentAreas: string[];
  successorFor?: string[];
}

export function HighPotentialIdentification({ companyId }: HighPotentialIdentificationProps) {
  const [loading, setLoading] = useState(true);
  const [highPotentials, setHighPotentials] = useState<HighPotentialEmployee[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    readyNow: 0,
    ready1Year: 0,
    ready2Years: 0,
    developing: 0,
  });

  useEffect(() => {
    if (companyId) {
      fetchHighPotentials();
    }
  }, [companyId]);

  const fetchHighPotentials = async () => {
    setLoading(true);
    try {
      // Get high performers from score breakdown
      const { data: scores, error } = await supabase
        .from('appraisal_score_breakdown')
        .select(`
          post_calibration_score,
          pre_calibration_score,
          competencies_raw_score,
          goals_raw_score,
          participant:appraisal_participants!inner(
            employee:profiles!employee_id(
              id,
              full_name,
              avatar_url,
              department:departments(name),
              job_title
            ),
            cycle:appraisal_cycles!inner(company_id)
          )
        `)
        .eq('participant.cycle.company_id', companyId)
        .order('post_calibration_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Also get succession plan data if available
      const successionResult = await (supabase as any)
        .from('succession_candidates')
        .select(`
          employee_id,
          readiness_level,
          strengths,
          development_areas,
          plan:succession_plans(position_title)
        `)
        .eq('is_active', true);
      const successionData = successionResult?.data || [];

      const successionMap = new Map();
      successionData?.forEach((s: any) => {
        if (!successionMap.has(s.employee_id)) {
          successionMap.set(s.employee_id, {
            readiness: s.readiness_level,
            strengths: s.strengths || [],
            developmentAreas: s.development_areas || [],
            positions: [],
          });
        }
        if (s.plan?.position_title) {
          successionMap.get(s.employee_id).positions.push(s.plan.position_title);
        }
      });

      // Identify high potentials (top performers with high scores)
      const hiPos: HighPotentialEmployee[] = [];
      const seen = new Set<string>();

      scores?.forEach((score: any) => {
        const employee = score.participant?.employee;
        if (!employee || seen.has(employee.id)) return;

        const finalScore = score.post_calibration_score ?? score.pre_calibration_score ?? 0;
        const competencyScore = score.competencies_raw_score ?? 0;
        const goalScore = score.goals_raw_score ?? 0;

        // High potential criteria: high overall + balanced performance
        if (finalScore >= 3.5) {
          seen.add(employee.id);

          const successionInfo = successionMap.get(employee.id);
          
          // Calculate potential score based on multiple factors
          const potentialScore = (competencyScore * 0.4 + goalScore * 0.4 + finalScore * 0.2);
          
          // Determine readiness level
          let readinessLevel: HighPotentialEmployee['readinessLevel'] = 'developing';
          if (successionInfo?.readiness) {
            readinessLevel = successionInfo.readiness;
          } else if (finalScore >= 4.5 && competencyScore >= 4) {
            readinessLevel = 'ready_now';
          } else if (finalScore >= 4) {
            readinessLevel = 'ready_1_year';
          } else if (finalScore >= 3.5) {
            readinessLevel = 'ready_2_years';
          }

          hiPos.push({
            id: employee.id,
            name: employee.full_name || 'Unknown',
            avatarUrl: employee.avatar_url,
            department: employee.department?.name,
            jobTitle: employee.job_title,
            performanceScore: finalScore,
            potentialScore,
            readinessLevel,
            strengths: successionInfo?.strengths || ['High Goal Achievement', 'Strong Competencies'],
            developmentAreas: successionInfo?.developmentAreas || [],
            successorFor: successionInfo?.positions,
          });
        }
      });

      // Sort by potential score
      hiPos.sort((a, b) => b.potentialScore - a.potentialScore);
      setHighPotentials(hiPos.slice(0, 20));

      // Calculate summary
      setSummary({
        total: hiPos.length,
        readyNow: hiPos.filter(p => p.readinessLevel === 'ready_now').length,
        ready1Year: hiPos.filter(p => p.readinessLevel === 'ready_1_year').length,
        ready2Years: hiPos.filter(p => p.readinessLevel === 'ready_2_years').length,
        developing: hiPos.filter(p => p.readinessLevel === 'developing').length,
      });

    } catch (error) {
      console.error('Error fetching high potentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessBadge = (level: HighPotentialEmployee['readinessLevel']) => {
    switch (level) {
      case 'ready_now':
        return <Badge className="bg-green-500">Ready Now</Badge>;
      case 'ready_1_year':
        return <Badge className="bg-blue-500">Ready in 1 Year</Badge>;
      case 'ready_2_years':
        return <Badge variant="secondary">Ready in 2+ Years</Badge>;
      default:
        return <Badge variant="outline">Developing</Badge>;
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
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-sm text-muted-foreground">High Potentials</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{summary.readyNow}</div>
                <div className="text-sm text-muted-foreground">Ready Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{summary.ready1Year}</div>
                <div className="text-sm text-muted-foreground">Ready 1 Year</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{summary.ready2Years}</div>
                <div className="text-sm text-muted-foreground">Ready 2+ Years</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{summary.developing}</div>
                <div className="text-sm text-muted-foreground">Developing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High Potentials Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            High-Potential Employees
          </CardTitle>
          <CardDescription>
            Top performers with leadership potential based on performance scores and competency ratings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {highPotentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No high-potential employees identified yet.</p>
              <p className="text-sm">Complete more appraisals to identify top talent.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {highPotentials.map((emp) => (
                <div 
                  key={emp.id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={emp.avatarUrl} />
                        <AvatarFallback>
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {emp.jobTitle || 'No Title'} • {emp.department || 'No Dept'}
                        </p>
                      </div>
                    </div>
                    {getReadinessBadge(emp.readinessLevel)}
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Performance</div>
                      <div className="flex items-center gap-2">
                        <Progress value={emp.performanceScore * 20} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{emp.performanceScore.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Potential</div>
                      <div className="flex items-center gap-2">
                        <Progress value={emp.potentialScore * 20} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{emp.potentialScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  {emp.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {emp.strengths.slice(0, 3).map((strength, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Successor For */}
                  {emp.successorFor && emp.successorFor.length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <span className="font-medium">Successor for:</span> {emp.successorFor.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
