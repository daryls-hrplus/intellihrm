import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Target,
  Brain
} from 'lucide-react';
import { useManagerCapabilityMetrics, CapabilityMetrics } from '@/hooks/performance/useManagerCapabilityMetrics';
import { useManagerHRFlags, ManagerHRFlag } from '@/hooks/performance/useManagerHRFlags';
import { ManagerHRFlagsPanel } from './ManagerHRFlagsPanel';
import { ManagerCapabilityScorecard } from './ManagerCapabilityScorecard';
import { supabase } from '@/integrations/supabase/client';

interface ManagerCapabilityDashboardProps {
  companyId: string;
  cycleId?: string;
}

interface ManagerSummary {
  managerId: string;
  managerName: string;
  overallScore: number;
  trend: string;
  flagCount: number;
}

export function ManagerCapabilityDashboard({ companyId, cycleId }: ManagerCapabilityDashboardProps) {
  const { loading: metricsLoading, batchAnalyzeManagers } = useManagerCapabilityMetrics();
  const { loading: flagsLoading, flags, fetchFlags, getFlagStats } = useManagerHRFlags();
  const [managers, setManagers] = useState<ManagerSummary[]>([]);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [loadingManagers, setLoadingManagers] = useState(false);

  useEffect(() => {
    loadManagerSummaries();
    fetchFlags(companyId);
  }, [companyId, cycleId]);

  const loadManagerSummaries = async () => {
    setLoadingManagers(true);
    try {
      const { data, error } = await supabase
        .from('manager_capability_metrics')
        .select(`
          manager_id,
          overall_capability_score,
          capability_trend,
          profiles!manager_capability_metrics_manager_id_fkey(full_name)
        `)
        .eq('company_id', companyId)
        .order('overall_capability_score', { ascending: true });

      if (error) throw error;

      // Get flag counts per manager
      const { data: flagData } = await supabase
        .from('manager_hr_flags')
        .select('manager_id')
        .eq('company_id', companyId)
        .eq('is_resolved', false);

      const flagCounts: Record<string, number> = {};
      (flagData || []).forEach(f => {
        flagCounts[f.manager_id] = (flagCounts[f.manager_id] || 0) + 1;
      });

      const summaries: ManagerSummary[] = (data || []).map(d => ({
        managerId: d.manager_id,
        managerName: (d.profiles as any)?.full_name || 'Unknown',
        overallScore: d.overall_capability_score || 0,
        trend: d.capability_trend || 'stable',
        flagCount: flagCounts[d.manager_id] || 0,
      }));

      setManagers(summaries);
    } catch (error) {
      console.error('Error loading manager summaries:', error);
    } finally {
      setLoadingManagers(false);
    }
  };

  const handleRunAnalysis = async () => {
    await batchAnalyzeManagers(companyId, cycleId);
    loadManagerSummaries();
    fetchFlags(companyId);
  };

  const flagStats = getFlagStats(flags);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>;
    return <Badge className="bg-red-100 text-red-800">At Risk</Badge>;
  };

  if (selectedManager) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedManager(null)}
          className="mb-2"
        >
          ← Back to Dashboard
        </Button>
        <ManagerCapabilityScorecard 
          managerId={selectedManager} 
          companyId={companyId}
          cycleId={cycleId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manager Capability Dashboard</h2>
          <p className="text-muted-foreground">
            Track and improve manager review effectiveness with AI-powered insights
          </p>
        </div>
        <Button onClick={handleRunAnalysis} disabled={metricsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
          Run Analysis
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Total Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managers.length}</div>
            <p className="text-xs text-muted-foreground">Tracked this cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Avg Capability Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {managers.length > 0 
                ? Math.round(managers.reduce((sum, m) => sum + m.overallScore, 0) / managers.length)
                : 0}%
            </div>
            <Progress 
              value={managers.length > 0 
                ? managers.reduce((sum, m) => sum + m.overallScore, 0) / managers.length
                : 0} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Active Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flagStats.total}</div>
            <div className="flex gap-2 mt-1">
              {flagStats.bySeverity.critical > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {flagStats.bySeverity.critical} Critical
                </Badge>
              )}
              {flagStats.bySeverity.high > 0 && (
                <Badge className="bg-orange-100 text-orange-800 text-xs">
                  {flagStats.bySeverity.high} High
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flagStats.pendingReview}</div>
            <p className="text-xs text-muted-foreground">Flags awaiting HR review</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="managers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="managers">Manager Leaderboard</TabsTrigger>
          <TabsTrigger value="flags">
            HR Flags
            {flagStats.total > 0 && (
              <Badge variant="secondary" className="ml-2">{flagStats.total}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="managers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manager Capability Rankings</CardTitle>
              <CardDescription>
                Managers ranked by overall capability score. Click to view detailed scorecard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingManagers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : managers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No manager capability data yet.</p>
                  <p className="text-sm">Run analysis to generate capability metrics.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {managers.map((manager, index) => (
                    <div
                      key={manager.managerId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedManager(manager.managerId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{manager.managerName}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Trend: {manager.trend}</span>
                            {manager.flagCount > 0 && (
                              <>
                                <span>•</span>
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                                <span>{manager.flagCount} flags</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(manager.overallScore)}`}>
                            {Math.round(manager.overallScore)}%
                          </div>
                          {getScoreBadge(manager.overallScore)}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags">
          <ManagerHRFlagsPanel companyId={companyId} />
        </TabsContent>
      </Tabs>

      {/* ISO 42001 Compliance Footer */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">ISO 42001 AI Governance Compliance</p>
              <p className="text-muted-foreground">
                All capability assessments are logged with full explainability. HR flags require 
                human review before action. Manager visibility is controlled by HR administrators.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
