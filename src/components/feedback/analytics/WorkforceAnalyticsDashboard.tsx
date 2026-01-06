import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';

interface WorkforceAnalyticsDashboardProps {
  companyId: string;
}

export function WorkforceAnalyticsDashboard({ companyId }: WorkforceAnalyticsDashboardProps) {
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [selectedDimension, setSelectedDimension] = useState<string>('department');

  const { data: cycles } = useQuery({
    queryKey: ['feedback-cycles-for-analytics', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback_360_cycles')
        .select('id, name, status')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orgAggregates, isLoading } = useQuery({
    queryKey: ['org-signal-aggregates', companyId, selectedCycle, selectedDimension],
    queryFn: async () => {
      let query = supabase
        .from('org_signal_aggregates')
        .select('*')
        .eq('company_id', companyId);

      if (selectedCycle !== 'all') {
        query = query.eq('cycle_id', selectedCycle);
      }

      const { data, error } = await query.order('aggregation_dimension').order('dimension_value');
      if (error) throw error;
      return data;
    },
  });

  const { data: signalDefinitions } = useQuery({
    queryKey: ['signal-definitions', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_signal_definitions')
        .select('id, name, signal_category')
        .or(`company_id.is.null,company_id.eq.${companyId}`)
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  // Group aggregates by dimension
  const byDimension = orgAggregates?.reduce((acc, agg) => {
    if (agg.aggregation_dimension === selectedDimension) {
      if (!acc[agg.dimension_value]) {
        acc[agg.dimension_value] = [];
      }
      acc[agg.dimension_value].push(agg);
    }
    return acc;
  }, {} as Record<string, typeof orgAggregates>) || {};

  // Prepare chart data
  const chartData = Object.entries(byDimension).map(([dimension, aggregates]) => {
    const avgScore = aggregates.reduce((sum, a) => sum + (a.avg_score || 0), 0) / aggregates.length;
    const totalSample = aggregates[0]?.sample_size || 0;
    return {
      name: dimension,
      avgScore: avgScore.toFixed(2),
      employees: totalSample,
    };
  });

  // Prepare radar data for signal categories
  const radarData = signalDefinitions?.reduce((acc, def) => {
    const categoryAggregates = orgAggregates?.filter(a => a.signal_type === def.name);
    if (categoryAggregates && categoryAggregates.length > 0) {
      const avg = categoryAggregates.reduce((sum, a) => sum + (a.avg_score || 0), 0) / categoryAggregates.length;
      acc.push({
        signal: def.name,
        value: avg,
        fullMark: 5,
      });
    }
    return acc;
  }, [] as Array<{ signal: string; value: number; fullMark: number }>) || [];

  // Summary stats
  const totalEmployees = orgAggregates?.reduce((max, a) => Math.max(max, a.sample_size || 0), 0) || 0;
  const avgTrend = orgAggregates?.length
    ? orgAggregates.reduce((sum, a) => sum + (a.trend_percentage || 0), 0) / orgAggregates.length
    : 0;
  const lowSampleCount = orgAggregates?.filter(a => (a.sample_size || 0) < 5).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Workforce Feedback Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Organization-wide talent signal insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCycle} onValueChange={setSelectedCycle}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select cycle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cycles</SelectItem>
              {cycles?.map((cycle) => (
                <SelectItem key={cycle.id} value={cycle.id}>
                  {cycle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDimension} onValueChange={setSelectedDimension}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="location">Location</SelectItem>
              <SelectItem value="job_level">Job Level</SelectItem>
              <SelectItem value="tenure_band">Tenure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees Assessed</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Trend</p>
                <p className="text-2xl font-bold">{avgTrend.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signal Types</p>
                <p className="text-2xl font-bold">{signalDefinitions?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Sample</p>
                <p className="text-2xl font-bold">{lowSampleCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dimension" className="w-full">
        <TabsList>
          <TabsTrigger value="dimension">By Dimension</TabsTrigger>
          <TabsTrigger value="signals">Signal Radar</TabsTrigger>
          <TabsTrigger value="details">Detail Table</TabsTrigger>
        </TabsList>

        <TabsContent value="dimension" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base capitalize">
                Average Scores by {selectedDimension.replace('_', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis domain={[0, 5]} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signal Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              {radarData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No signal data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="signal" className="text-xs" />
                    <PolarRadiusAxis domain={[0, 5]} />
                    <Radar
                      name="Org Average"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(byDimension).map(([dimension, aggregates]) => (
                  <div key={dimension} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{dimension}</h4>
                      <Badge variant="outline">
                        {aggregates[0]?.sample_size || 0} samples
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {aggregates.map((agg) => (
                          <div key={agg.id} className="flex items-center gap-3">
                            <span className="text-sm w-32 truncate">
                              {agg.signal_type || 'Unknown'}
                            </span>
                            <Progress value={(agg.avg_score || 0) * 20} className="flex-1" />
                            <span className="text-sm font-medium w-12 text-right">
                              {agg.avg_score?.toFixed(1) || '-'}
                            </span>
                          </div>
                        ));
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
