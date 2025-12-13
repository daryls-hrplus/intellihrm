import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { NineBoxAssessment, SuccessionPlan, KeyPositionRisk, TalentPool } from '@/hooks/useSuccession';
import { supabase } from '@/integrations/supabase/client';
import { Users, Target, TrendingDown, UserCheck, BookOpen, Layers } from 'lucide-react';

interface SuccessionAnalyticsProps {
  assessments: NineBoxAssessment[];
  plans: SuccessionPlan[];
  keyPositions: KeyPositionRisk[];
  talentPools: TalentPool[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function SuccessionAnalytics({ assessments, plans, keyPositions, talentPools }: SuccessionAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mentorshipData, setMentorshipData] = useState<any[]>([]);
  const [flightRiskData, setFlightRiskData] = useState<any[]>([]);
  const [idpData, setIdpData] = useState<any[]>([]);

  useEffect(() => {
    fetchAdditionalData();
  }, []);

  const fetchAdditionalData = async () => {
    const [mentorships, flightRisks, idps] = await Promise.all([
      supabase.from('mentorship_pairings').select('*, mentorship_programs(name)'),
      supabase.from('flight_risk_assessments').select('*'),
      supabase.from('individual_development_plans').select('*, idp_goals(*), idp_activities(*)')
    ]);
    
    if (mentorships.data) setMentorshipData(mentorships.data);
    if (flightRisks.data) setFlightRiskData(flightRisks.data);
    if (idps.data) setIdpData(idps.data);
  };

  // Existing analytics
  const nineBoxDistribution = useMemo(() => {
    const labels = [
      'Future Stars', 'Growth Employees', 'Enigmas',
      'High Performers', 'Core Players', 'Dilemmas',
      'Solid Contributors', 'Average Performers', 'At Risk'
    ];
    
    const distribution = Array(9).fill(0);
    assessments.forEach(a => {
      const index = (3 - a.performance_rating) * 3 + (a.potential_rating - 1);
      distribution[index]++;
    });

    return labels.map((name, i) => ({
      name,
      count: distribution[i],
    })).filter(d => d.count > 0);
  }, [assessments]);

  const plansByRisk = useMemo(() => {
    const riskCounts = { low: 0, medium: 0, high: 0 };
    plans.forEach(p => {
      riskCounts[p.risk_level as keyof typeof riskCounts]++;
    });
    return [
      { name: 'Low Risk', value: riskCounts.low, color: '#10b981' },
      { name: 'Medium Risk', value: riskCounts.medium, color: '#f59e0b' },
      { name: 'High Risk', value: riskCounts.high, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [plans]);

  const keyPositionCriticality = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };
    keyPositions.forEach(p => {
      counts[p.criticality_level as keyof typeof counts]++;
    });
    return [
      { name: 'Low', count: counts.low },
      { name: 'Medium', count: counts.medium },
      { name: 'High', count: counts.high },
      { name: 'Critical', count: counts.critical },
    ];
  }, [keyPositions]);

  const coverageMetrics = useMemo(() => {
    const totalKeyPositions = keyPositions.length;
    const coveredPositions = plans.length;
    const positionsWithNoSuccessors = plans.filter(p => (p.candidate_count || 0) === 0).length;

    return {
      coverage: totalKeyPositions > 0 ? Math.round((coveredPositions / totalKeyPositions) * 100) : 0,
      uncovered: totalKeyPositions - coveredPositions,
      noSuccessors: positionsWithNoSuccessors,
    };
  }, [keyPositions, plans]);

  // Mentorship Analytics
  const mentorshipAnalytics = useMemo(() => {
    const statusCounts = { active: 0, completed: 0, paused: 0, cancelled: 0 };
    mentorshipData.forEach(m => {
      statusCounts[m.status as keyof typeof statusCounts]++;
    });

    const statusData = [
      { name: 'Active', value: statusCounts.active, color: '#10b981' },
      { name: 'Completed', value: statusCounts.completed, color: '#3b82f6' },
      { name: 'Paused', value: statusCounts.paused, color: '#f59e0b' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#6b7280' },
    ].filter(d => d.value > 0);

    const completionRate = mentorshipData.length > 0 
      ? Math.round((statusCounts.completed / mentorshipData.length) * 100) 
      : 0;

    return { statusData, completionRate, total: mentorshipData.length, active: statusCounts.active };
  }, [mentorshipData]);

  // Flight Risk Analytics
  const flightRiskAnalytics = useMemo(() => {
    const riskLevels = { low: 0, medium: 0, high: 0, critical: 0 };
    const impactLevels = { low: 0, medium: 0, high: 0, critical: 0 };
    
    flightRiskData.forEach(f => {
      riskLevels[f.risk_level as keyof typeof riskLevels]++;
      impactLevels[f.impact_level as keyof typeof impactLevels]++;
    });

    const riskDistribution = [
      { name: 'Low', value: riskLevels.low, color: '#10b981' },
      { name: 'Medium', value: riskLevels.medium, color: '#f59e0b' },
      { name: 'High', value: riskLevels.high, color: '#ef4444' },
      { name: 'Critical', value: riskLevels.critical, color: '#991b1b' },
    ];

    const impactDistribution = [
      { name: 'Low', value: impactLevels.low, color: '#10b981' },
      { name: 'Medium', value: impactLevels.medium, color: '#f59e0b' },
      { name: 'High', value: impactLevels.high, color: '#ef4444' },
      { name: 'Critical', value: impactLevels.critical, color: '#991b1b' },
    ];

    const highRiskCount = riskLevels.high + riskLevels.critical;
    const retentionActionCount = flightRiskData.filter(f => f.retention_actions && f.retention_actions.length > 0).length;

    return { riskDistribution, impactDistribution, highRiskCount, retentionActionCount, total: flightRiskData.length };
  }, [flightRiskData]);

  // IDP Analytics
  const idpAnalytics = useMemo(() => {
    const statusCounts = { draft: 0, in_progress: 0, completed: 0, cancelled: 0 };
    let totalGoals = 0;
    let completedGoals = 0;
    let totalActivities = 0;
    let completedActivities = 0;

    idpData.forEach(idp => {
      statusCounts[idp.status as keyof typeof statusCounts]++;
      const goals = idp.idp_goals || [];
      const activities = idp.idp_activities || [];
      
      totalGoals += goals.length;
      completedGoals += goals.filter((g: any) => g.status === 'completed').length;
      totalActivities += activities.length;
      completedActivities += activities.filter((a: any) => a.status === 'completed').length;
    });

    const statusData = [
      { name: 'Draft', value: statusCounts.draft, color: '#6b7280' },
      { name: 'In Progress', value: statusCounts.in_progress, color: '#3b82f6' },
      { name: 'Completed', value: statusCounts.completed, color: '#10b981' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const goalCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
    const activityCompletionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return { 
      statusData, 
      goalCompletionRate, 
      activityCompletionRate, 
      total: idpData.length,
      inProgress: statusCounts.in_progress,
      totalGoals,
      completedGoals,
      totalActivities,
      completedActivities
    };
  }, [idpData]);

  // Bench Strength Analytics
  const benchStrengthAnalytics = useMemo(() => {
    const positionCoverage: { name: string; ready: number; developing: number }[] = [];
    
    plans.forEach(plan => {
      const positionName = (plan as any).positions?.title || 'Unknown';
      const candidates = (plan as any).succession_candidates || [];
      const ready = candidates.filter((c: any) => c.readiness_level === 'ready_now' || c.readiness_level === 'ready_1_year').length;
      const developing = candidates.filter((c: any) => c.readiness_level === 'ready_2_years' || c.readiness_level === 'developing').length;
      
      positionCoverage.push({ name: positionName.slice(0, 15), ready, developing });
    });

    const strongBench = plans.filter(p => (p.candidate_count || 0) >= 2).length;
    const weakBench = plans.filter(p => (p.candidate_count || 0) === 0).length;
    const avgCandidatesPerPlan = plans.length > 0 
      ? (plans.reduce((acc, p) => acc + (p.candidate_count || 0), 0) / plans.length).toFixed(1)
      : '0';

    return { positionCoverage: positionCoverage.slice(0, 8), strongBench, weakBench, avgCandidatesPerPlan };
  }, [plans]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="mentorship" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Mentorship
          </TabsTrigger>
          <TabsTrigger value="flight-risk" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Flight Risk
          </TabsTrigger>
          <TabsTrigger value="idp" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Career Development
          </TabsTrigger>
          <TabsTrigger value="bench-strength" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Bench Strength
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{coverageMetrics.coverage}%</div>
                <div className="text-sm text-muted-foreground">Succession Coverage</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-amber-600">{coverageMetrics.uncovered}</div>
                <div className="text-sm text-muted-foreground">Positions Without Plans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-red-600">{coverageMetrics.noSuccessors}</div>
                <div className="text-sm text-muted-foreground">Plans Without Successors</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-purple-600">{assessments.length}</div>
                <div className="text-sm text-muted-foreground">Talent Assessments</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nine Box Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={nineBoxDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Succession Plans by Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={plansByRisk}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {plansByRisk.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Key Positions by Criticality</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={keyPositionCriticality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))">
                      {keyPositionCriticality.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={['#6b7280', '#3b82f6', '#f59e0b', '#ef4444'][index]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mentorship Tab */}
        <TabsContent value="mentorship" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{mentorshipAnalytics.total}</div>
                <div className="text-sm text-muted-foreground">Total Pairings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-green-600">{mentorshipAnalytics.active}</div>
                <div className="text-sm text-muted-foreground">Active Mentorships</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-blue-600">{mentorshipAnalytics.completionRate}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-purple-600">{mentorshipData.filter(m => m.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed Programs</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mentorship Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mentorshipAnalytics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mentorshipAnalytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Program Effectiveness</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">{mentorshipAnalytics.completionRate}%</div>
                  <div className="text-muted-foreground">Program Completion Rate</div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    {mentorshipData.filter(m => m.status === 'completed').length} of {mentorshipAnalytics.total} pairings completed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Flight Risk Tab */}
        <TabsContent value="flight-risk" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{flightRiskAnalytics.total}</div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-red-600">{flightRiskAnalytics.highRiskCount}</div>
                <div className="text-sm text-muted-foreground">High/Critical Risk</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-green-600">{flightRiskAnalytics.retentionActionCount}</div>
                <div className="text-sm text-muted-foreground">With Retention Plans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-amber-600">
                  {flightRiskAnalytics.total > 0 ? Math.round((flightRiskAnalytics.highRiskCount / flightRiskAnalytics.total) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">High Risk Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={flightRiskAnalytics.riskDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {flightRiskAnalytics.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={flightRiskAnalytics.impactDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value">
                      {flightRiskAnalytics.impactDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* IDP/Career Development Tab */}
        <TabsContent value="idp" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{idpAnalytics.total}</div>
                <div className="text-sm text-muted-foreground">Total IDPs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-blue-600">{idpAnalytics.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-green-600">{idpAnalytics.goalCompletionRate}%</div>
                <div className="text-sm text-muted-foreground">Goal Completion</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-purple-600">{idpAnalytics.activityCompletionRate}%</div>
                <div className="text-sm text-muted-foreground">Activity Completion</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>IDP Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={idpAnalytics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {idpAnalytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Goals & Activities Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 py-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Goals Completed</span>
                      <span className="text-sm text-muted-foreground">{idpAnalytics.completedGoals} / {idpAnalytics.totalGoals}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all" 
                        style={{ width: `${idpAnalytics.goalCompletionRate}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Activities Completed</span>
                      <span className="text-sm text-muted-foreground">{idpAnalytics.completedActivities} / {idpAnalytics.totalActivities}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full transition-all" 
                        style={{ width: `${idpAnalytics.activityCompletionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bench Strength Tab */}
        <TabsContent value="bench-strength" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-primary">{plans.length}</div>
                <div className="text-sm text-muted-foreground">Positions with Plans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-green-600">{benchStrengthAnalytics.strongBench}</div>
                <div className="text-sm text-muted-foreground">Strong Bench (2+ candidates)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-red-600">{benchStrengthAnalytics.weakBench}</div>
                <div className="text-sm text-muted-foreground">Weak Bench (0 candidates)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-blue-600">{benchStrengthAnalytics.avgCandidatesPerPlan}</div>
                <div className="text-sm text-muted-foreground">Avg Candidates/Position</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bench Strength by Position</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={benchStrengthAnalytics.positionCoverage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ready" stackId="a" fill="#10b981" name="Ready Now/1 Year" />
                  <Bar dataKey="developing" stackId="a" fill="#f59e0b" name="Developing" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
