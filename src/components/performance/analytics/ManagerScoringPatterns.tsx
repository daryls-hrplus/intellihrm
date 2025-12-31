import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ManagerScoringPatternsProps {
  companyId?: string;
  cycleId?: string;
}

interface ManagerPattern {
  managerId: string;
  managerName: string;
  avatarUrl?: string;
  avgScore: number;
  employeeCount: number;
  scoreStdDev: number;
  pattern: 'lenient' | 'strict' | 'balanced' | 'inconsistent';
  deviation: number; // from company average
}

export function ManagerScoringPatterns({ companyId, cycleId }: ManagerScoringPatternsProps) {
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<ManagerPattern[]>([]);
  const [companyAverage, setCompanyAverage] = useState(0);
  const [flaggedManagers, setFlaggedManagers] = useState(0);

  useEffect(() => {
    if (companyId) {
      fetchPatterns();
    }
  }, [companyId, cycleId]);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      // Get scores grouped by evaluator (manager)
      const { data: scores, error } = await supabase
        .from('appraisal_score_breakdown')
        .select(`
          post_calibration_score,
          pre_calibration_score,
          participant:appraisal_participants!inner(
            evaluator:profiles!evaluator_id(id, full_name, avatar_url),
            cycle:appraisal_cycles!inner(company_id)
          )
        `)
        .eq('participant.cycle.company_id', companyId);

      if (error) throw error;

      // Group scores by manager
      const managerScores: Record<string, { scores: number[]; name: string; avatar?: string }> = {};

      scores?.forEach((score: any) => {
        const managerId = score.participant?.evaluator?.id;
        const managerName = score.participant?.evaluator?.full_name;
        const avatar = score.participant?.evaluator?.avatar_url;
        const finalScore = score.post_calibration_score ?? score.pre_calibration_score;

        if (managerId && finalScore != null) {
          if (!managerScores[managerId]) {
            managerScores[managerId] = { scores: [], name: managerName || 'Unknown', avatar };
          }
          managerScores[managerId].scores.push(finalScore);
        }
      });

      // Calculate company average
      const allScores = Object.values(managerScores).flatMap(m => m.scores);
      const compAvg = allScores.length > 0 
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length 
        : 0;
      setCompanyAverage(compAvg);

      // Calculate patterns for each manager
      const managerPatterns: ManagerPattern[] = Object.entries(managerScores)
        .filter(([_, data]) => data.scores.length >= 2) // At least 2 employees
        .map(([managerId, data]) => {
          const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
          const variance = data.scores.reduce((acc, s) => acc + Math.pow(s - avg, 2), 0) / data.scores.length;
          const stdDev = Math.sqrt(variance);
          const deviation = avg - compAvg;

          let pattern: ManagerPattern['pattern'] = 'balanced';
          if (stdDev > 1) {
            pattern = 'inconsistent';
          } else if (deviation > 0.5) {
            pattern = 'lenient';
          } else if (deviation < -0.5) {
            pattern = 'strict';
          }

          return {
            managerId,
            managerName: data.name,
            avatarUrl: data.avatar,
            avgScore: avg,
            employeeCount: data.scores.length,
            scoreStdDev: stdDev,
            pattern,
            deviation,
          };
        });

      // Sort by deviation from company average
      managerPatterns.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
      setPatterns(managerPatterns);
      setFlaggedManagers(managerPatterns.filter(p => p.pattern !== 'balanced').length);

    } catch (error) {
      console.error('Error fetching manager patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatternBadge = (pattern: ManagerPattern['pattern']) => {
    switch (pattern) {
      case 'lenient':
        return <Badge className="bg-amber-500">Lenient</Badge>;
      case 'strict':
        return <Badge variant="destructive">Strict</Badge>;
      case 'inconsistent':
        return <Badge variant="outline" className="border-orange-500 text-orange-600">Inconsistent</Badge>;
      default:
        return <Badge variant="secondary">Balanced</Badge>;
    }
  };

  const getPatternIcon = (deviation: number) => {
    if (deviation > 0.3) return <TrendingUp className="h-4 w-4 text-amber-500" />;
    if (deviation < -0.3) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
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

  const chartData = patterns.slice(0, 15).map(p => ({
    name: p.managerName.split(' ')[0],
    avgScore: Number(p.avgScore.toFixed(2)),
    employees: p.employeeCount,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Alert */}
      {flaggedManagers > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <h4 className="font-medium">Scoring Pattern Anomalies Detected</h4>
            <p className="text-sm text-muted-foreground">
              {flaggedManagers} manager(s) show significant deviation from company average ({companyAverage.toFixed(2)}). 
              Consider calibration review.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Manager Average Scores</CardTitle>
            <CardDescription>Comparison against company average ({companyAverage.toFixed(2)})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" domain={[0, 5]} className="text-xs" />
                  <YAxis type="category" dataKey="name" width={80} className="text-xs" />
                  <Tooltip />
                  <ReferenceLine 
                    x={companyAverage} 
                    stroke="hsl(var(--destructive))" 
                    strokeDasharray="5 5"
                    label={{ value: 'Company Avg', position: 'top', fontSize: 10 }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Manager List */}
        <Card>
          <CardHeader>
            <CardTitle>Scoring Patterns by Manager</CardTitle>
            <CardDescription>Patterns based on deviation from company average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {patterns.slice(0, 10).map((manager) => (
                <div 
                  key={manager.managerId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={manager.avatarUrl} />
                      <AvatarFallback>
                        {manager.managerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{manager.managerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {manager.employeeCount} employees
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {getPatternIcon(manager.deviation)}
                        <span className="font-medium">{manager.avgScore.toFixed(2)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {manager.deviation >= 0 ? '+' : ''}{manager.deviation.toFixed(2)} vs avg
                      </span>
                    </div>
                    {getPatternBadge(manager.pattern)}
                  </div>
                </div>
              ))}

              {patterns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No manager scoring data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
