import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Target,
  Loader2,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SkillGapActionCard } from '../SkillGapActionCard';
import { EmployeeSkillGap, RecommendedAction } from '@/types/valuesAssessment';

interface SkillGapsAnalysisProps {
  companyId?: string;
  departmentId?: string;
}

interface GapSummary {
  totalGaps: number;
  criticalGaps: number;
  highGaps: number;
  addressedGaps: number;
  topGapCapabilities: { name: string; count: number }[];
}

export function SkillGapsAnalysis({ companyId, departmentId }: SkillGapsAnalysisProps) {
  const [loading, setLoading] = useState(true);
  const [gaps, setGaps] = useState<EmployeeSkillGap[]>([]);
  const [summary, setSummary] = useState<GapSummary>({
    totalGaps: 0,
    criticalGaps: 0,
    highGaps: 0,
    addressedGaps: 0,
    topGapCapabilities: []
  });
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('open');

  useEffect(() => {
    if (companyId) {
      fetchGaps();
    }
  }, [companyId, departmentId, priorityFilter, statusFilter]);

  const fetchGaps = async () => {
    if (!companyId) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('employee_skill_gaps')
        .select(`
          *,
          employee:profiles!employee_id(id, full_name, email, department_id)
        `)
        .eq('company_id', companyId)
        .order('priority', { ascending: false })
        .order('gap_score', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      let filteredData = data || [];
      
      // Filter by department if specified
      if (departmentId && departmentId !== 'all') {
        filteredData = filteredData.filter(
          (gap: any) => gap.employee?.department_id === departmentId
        );
      }

      const typedGaps = filteredData.map((gap: any) => ({
        ...gap,
        recommended_actions: (gap.recommended_actions as unknown as RecommendedAction[]) || []
      })) as EmployeeSkillGap[];

      setGaps(typedGaps);

      // Calculate summary
      const allGaps = data || [];
      const capabilityCounts: Record<string, number> = {};
      
      allGaps.forEach((gap: any) => {
        const name = gap.capability_name;
        capabilityCounts[name] = (capabilityCounts[name] || 0) + 1;
      });

      const topCapabilities = Object.entries(capabilityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      setSummary({
        totalGaps: allGaps.length,
        criticalGaps: allGaps.filter((g: any) => g.priority === 'critical').length,
        highGaps: allGaps.filter((g: any) => g.priority === 'high').length,
        addressedGaps: allGaps.filter((g: any) => g.status === 'addressed' || g.status === 'closed').length,
        topGapCapabilities: topCapabilities
      });

    } catch (error) {
      console.error('Error fetching skill gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (gapId: string, status: EmployeeSkillGap['status']) => {
    try {
      const updates: any = { status };
      if (status === 'addressed' || status === 'closed') {
        updates.addressed_at = new Date().toISOString();
      }

      await supabase
        .from('employee_skill_gaps')
        .update(updates)
        .eq('id', gapId);

      fetchGaps();
    } catch (error) {
      console.error('Error updating gap status:', error);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{summary.totalGaps}</div>
                <div className="text-sm text-muted-foreground">Total Gaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">{summary.criticalGaps}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-500">{summary.highGaps}</div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{summary.addressedGaps}</div>
                <div className="text-sm text-muted-foreground">Addressed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Gap Capabilities */}
      {summary.topGapCapabilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Most Common Skill Gaps
            </CardTitle>
            <CardDescription>
              Capabilities with the highest number of identified gaps across the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.topGapCapabilities.map((cap, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-32 text-sm font-medium truncate">{cap.name}</span>
                  <Progress 
                    value={(cap.count / summary.totalGaps) * 100} 
                    className="flex-1 h-2" 
                  />
                  <Badge variant="secondary">{cap.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gaps List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skill Gaps</CardTitle>
              <CardDescription>
                Individual employee skill gaps requiring development action
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="addressed">Addressed</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchGaps}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No skill gaps found matching your filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {gaps.slice(0, 20).map((gap) => (
                <SkillGapActionCard
                  key={gap.id}
                  gap={gap}
                  onUpdateStatus={handleUpdateStatus}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
