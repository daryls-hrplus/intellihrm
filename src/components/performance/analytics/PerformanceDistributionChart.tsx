import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

interface PerformanceDistributionChartProps {
  companyId?: string;
  cycleId?: string;
}

interface DistributionData {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Exceptional': 'hsl(var(--success))',
  'Exceeds Expectations': 'hsl(142, 76%, 36%)',
  'Meets Expectations': 'hsl(var(--primary))',
  'Needs Improvement': 'hsl(var(--warning))',
  'Unsatisfactory': 'hsl(var(--destructive))',
  'Not Rated': 'hsl(var(--muted))',
};

export function PerformanceDistributionChart({ companyId, cycleId }: PerformanceDistributionChartProps) {
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<DistributionData[]>([]);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    if (companyId) {
      fetchDistribution();
    }
  }, [companyId, cycleId]);

  const fetchDistribution = async () => {
    setLoading(true);
    try {
      // Get performance categories for this company
      const { data: categories } = await supabase
        .from('performance_categories')
        .select('*')
        .eq('company_id', companyId)
        .order('min_score', { ascending: false });

      // Get score breakdowns
      let query = supabase
        .from('appraisal_score_breakdown')
        .select(`
          post_calibration_score,
          pre_calibration_score,
          performance_category_id,
          participant:appraisal_participants!inner(
            id,
            status,
            cycle:appraisal_cycles!inner(company_id)
          )
        `)
        .eq('participant.cycle.company_id', companyId);

      if (cycleId) {
        query = query.eq('participant.cycle_id', cycleId);
      }

      const { data: scores, error } = await query;
      if (error) throw error;

      const completedScores = scores?.filter(s => 
        s.participant?.status === 'completed' || s.post_calibration_score != null
      ) || [];

      // Calculate distribution based on score ranges
      const categoryBuckets: Record<string, number> = {
        'Exceptional': 0,
        'Exceeds Expectations': 0,
        'Meets Expectations': 0,
        'Needs Improvement': 0,
        'Unsatisfactory': 0,
      };

      let scoreSum = 0;
      let scoreCount = 0;

      completedScores.forEach(score => {
        const finalScore = score.post_calibration_score ?? score.pre_calibration_score ?? 0;
        scoreSum += finalScore;
        scoreCount++;

        // Categorize based on score
        if (finalScore >= 4.5) categoryBuckets['Exceptional']++;
        else if (finalScore >= 3.5) categoryBuckets['Exceeds Expectations']++;
        else if (finalScore >= 2.5) categoryBuckets['Meets Expectations']++;
        else if (finalScore >= 1.5) categoryBuckets['Needs Improvement']++;
        else categoryBuckets['Unsatisfactory']++;
      });

      const total = completedScores.length;
      const distributionData = Object.entries(categoryBuckets).map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: CATEGORY_COLORS[category] || 'hsl(var(--muted))',
      }));

      setDistribution(distributionData);
      setTotalParticipants(total);
      setAverageScore(scoreCount > 0 ? scoreSum / scoreCount : 0);

    } catch (error) {
      console.error('Error fetching performance distribution:', error);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Distribution</CardTitle>
            <CardDescription>
              Rating distribution across {totalParticipants} evaluated employees
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Avg: {averageScore.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  width={120}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} employees (${distribution.find(d => d.count === value)?.percentage || 0}%)`,
                    'Count'
                  ]}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution.filter(d => d.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${percentage}%`}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="category"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-2 mt-6 pt-4 border-t">
          {distribution.map((item) => (
            <div key={item.category} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-lg font-bold">{item.count}</div>
              <div className="text-xs text-muted-foreground truncate">{item.category}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
