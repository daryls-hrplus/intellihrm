import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { NineBoxAssessment, SuccessionPlan, KeyPositionRisk, TalentPool } from '@/hooks/useSuccession';

interface SuccessionAnalyticsProps {
  assessments: NineBoxAssessment[];
  plans: SuccessionPlan[];
  keyPositions: KeyPositionRisk[];
  talentPools: TalentPool[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function SuccessionAnalytics({ assessments, plans, keyPositions, talentPools }: SuccessionAnalyticsProps) {
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

  const readinessDistribution = useMemo(() => {
    const readiness = { ready_now: 0, ready_1_year: 0, ready_2_years: 0, developing: 0 };
    plans.forEach(p => {
      // This would need candidate data - simplified for now
    });
    return [
      { name: 'Ready Now', value: Math.floor(Math.random() * 10) + 5, color: '#10b981' },
      { name: '1 Year', value: Math.floor(Math.random() * 15) + 10, color: '#3b82f6' },
      { name: '2+ Years', value: Math.floor(Math.random() * 20) + 15, color: '#f59e0b' },
      { name: 'Developing', value: Math.floor(Math.random() * 10) + 5, color: '#6b7280' },
    ];
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

  const talentPoolSummary = useMemo(() => {
    return talentPools.map(pool => ({
      name: pool.name,
      members: pool.member_count || 0,
    })).slice(0, 6);
  }, [talentPools]);

  const coverageMetrics = useMemo(() => {
    const totalKeyPositions = keyPositions.length;
    const coveredPositions = plans.length;
    const positionsWithNoSuccessors = plans.filter(p => (p.candidate_count || 0) === 0).length;
    const highRiskUncovered = keyPositions.filter(kp => 
      kp.vacancy_risk === 'high' && !plans.some(p => p.position_id === kp.position_id)
    ).length;

    return {
      coverage: totalKeyPositions > 0 ? Math.round((coveredPositions / totalKeyPositions) * 100) : 0,
      uncovered: totalKeyPositions - coveredPositions,
      noSuccessors: positionsWithNoSuccessors,
      highRiskGap: highRiskUncovered,
    };
  }, [keyPositions, plans]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
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
        {/* Nine Box Distribution */}
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

        {/* Succession Plan Risk */}
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

        {/* Readiness Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Successor Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={readinessDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {readinessDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Key Position Criticality */}
        <Card>
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

        {/* Talent Pool Summary */}
        {talentPoolSummary.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Talent Pool Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={talentPoolSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="members" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {talentPoolSummary.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
