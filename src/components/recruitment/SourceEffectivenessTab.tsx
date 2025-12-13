import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface SourceEffectivenessTabProps {
  companyId: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export function SourceEffectivenessTab({ companyId }: SourceEffectivenessTabProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    
    let applicationsQuery = supabase
      .from('applications')
      .select('*, candidates(source, source_job_board), job_requisitions!inner(company_id)')
      .eq('job_requisitions.company_id', companyId);
    
    let candidatesQuery = supabase
      .from('candidates')
      .select('*')
      .eq('company_id', companyId);

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      applicationsQuery = applicationsQuery.gte('applied_at', startDate.toISOString());
      candidatesQuery = candidatesQuery.gte('created_at', startDate.toISOString());
    }

    const [appsRes, candsRes] = await Promise.all([
      applicationsQuery,
      candidatesQuery
    ]);

    setApplications(appsRes.data || []);
    setCandidates(candsRes.data || []);
    setLoading(false);
  };

  const sourceMetrics = useMemo(() => {
    const sourceMap: Record<string, { total: number; hired: number; avgDays: number; totalDays: number }> = {};

    applications.forEach(app => {
      const source = app.candidates?.source || 'Unknown';
      if (!sourceMap[source]) {
        sourceMap[source] = { total: 0, hired: 0, avgDays: 0, totalDays: 0 };
      }
      sourceMap[source].total++;
      if (app.status === 'hired' || app.hired_at) {
        sourceMap[source].hired++;
        if (app.hired_at && app.applied_at) {
          const days = Math.floor((new Date(app.hired_at).getTime() - new Date(app.applied_at).getTime()) / (1000 * 60 * 60 * 24));
          sourceMap[source].totalDays += days;
        }
      }
    });

    return Object.entries(sourceMap).map(([name, data]) => ({
      name,
      applications: data.total,
      hired: data.hired,
      conversionRate: data.total > 0 ? Math.round((data.hired / data.total) * 100) : 0,
      avgTimeToHire: data.hired > 0 ? Math.round(data.totalDays / data.hired) : 0
    })).sort((a, b) => b.applications - a.applications);
  }, [applications]);

  const jobBoardMetrics = useMemo(() => {
    const boardMap: Record<string, number> = {};
    applications.forEach(app => {
      const board = app.candidates?.source_job_board || app.source_job_board;
      if (board) {
        boardMap[board] = (boardMap[board] || 0) + 1;
      }
    });
    return Object.entries(boardMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [applications]);

  const stageDistribution = useMemo(() => {
    const stages: Record<string, number> = {};
    applications.forEach(app => {
      stages[app.stage] = (stages[app.stage] || 0) + 1;
    });
    return Object.entries(stages).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const totalApplications = applications.length;
  const totalHired = applications.filter(a => a.status === 'hired' || a.hired_at).length;
  const conversionRate = totalApplications > 0 ? Math.round((totalHired / totalApplications) * 100) : 0;
  const topSource = sourceMetrics[0]?.name || 'N/A';

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
            <SelectItem value="180">Last 6 Months</SelectItem>
            <SelectItem value="365">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalApplications}</div>
                <div className="text-sm text-muted-foreground">Total Applications</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold">{sourceMetrics[0]?.avgTimeToHire || 0}</div>
                <div className="text-sm text-muted-foreground">Avg Days to Hire</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-primary">{topSource}</div>
            <div className="text-sm text-muted-foreground">Top Source</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Applications by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Applications by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceMetrics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="applications" fill="hsl(var(--primary))" name="Applications" />
                <Bar dataKey="hired" fill="#10b981" name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rate by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="conversionRate" fill="#10b981" name="Conversion Rate">
                  {sourceMetrics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Board Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Job Board Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {jobBoardMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={jobBoardMetrics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {jobBoardMetrics.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No job board data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Source Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Source Effectiveness Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Source</th>
                  <th className="text-right p-2">Applications</th>
                  <th className="text-right p-2">Hired</th>
                  <th className="text-right p-2">Conversion Rate</th>
                  <th className="text-right p-2">Avg Time to Hire</th>
                </tr>
              </thead>
              <tbody>
                {sourceMetrics.map((source) => (
                  <tr key={source.name} className="border-b">
                    <td className="p-2 font-medium">{source.name}</td>
                    <td className="p-2 text-right">{source.applications}</td>
                    <td className="p-2 text-right">{source.hired}</td>
                    <td className="p-2 text-right">{source.conversionRate}%</td>
                    <td className="p-2 text-right">{source.avgTimeToHire > 0 ? `${source.avgTimeToHire} days` : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
