import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Ban, AlertTriangle, CheckCircle, Rocket, Bell, 
  XCircle, RefreshCw, ChevronRight, AlertCircle 
} from "lucide-react";
import { GoalRiskIndicator } from "./GoalRiskIndicator";
import type { GoalRiskAssessment, GoalRiskAlert, RiskIndicator, RiskFactor } from "@/types/goalDependencies";
import { RISK_INDICATOR_LABELS } from "@/types/goalDependencies";

interface GoalWithRisk {
  id: string;
  title: string;
  status: string;
  progress_percentage: number | null;
  due_date: string | null;
  employee: {
    id: string;
    full_name: string;
  } | null;
  risk_assessment: GoalRiskAssessment | null;
}

export function GoalRiskDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goalsWithRisk, setGoalsWithRisk] = useState<GoalWithRisk[]>([]);
  const [alerts, setAlerts] = useState<GoalRiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterIndicator, setFilterIndicator] = useState<RiskIndicator | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load goals with risk assessments
      const { data: goals, error: goalsError } = await supabase
        .from('performance_goals')
        .select(`
          id,
          title,
          status,
          progress_percentage,
          due_date,
          employee:profiles!performance_goals_employee_id_fkey(id, full_name)
        `)
        .in('status', ['draft', 'active', 'in_progress'])
        .order('due_date', { ascending: true });

      if (goalsError) throw goalsError;

      // Load risk assessments separately
      const { data: assessments, error: assessmentsError } = await supabase
        .from('goal_risk_assessments')
        .select('*')
        .eq('assessment_type', 'system_derived');

      if (assessmentsError) throw assessmentsError;

      // Merge goals with assessments
      const assessmentMap = new Map(
        (assessments || []).map(a => [a.goal_id, a])
      );

      const goalsWithAssessments = (goals || []).map(goal => {
        const assessment = assessmentMap.get(goal.id);
        return {
          ...goal,
          risk_assessment: assessment ? {
            ...assessment,
            risk_factors: (Array.isArray(assessment.risk_factors) 
              ? assessment.risk_factors 
              : []) as unknown as RiskFactor[],
            blocking_dependencies: (assessment.blocking_dependencies || []) as string[]
          } as GoalRiskAssessment : null,
        };
      });

      setGoalsWithRisk(goalsWithAssessments);

      // Load alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('goal_risk_alerts')
        .select(`
          *,
          goal:performance_goals(id, title, employee_id)
        `)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsError) throw alertsError;
      setAlerts((alertsData || []) as unknown as GoalRiskAlert[]);
    } catch (error) {
      console.error('Error loading risk data:', error);
      toast({
        title: "Error",
        description: "Failed to load risk dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRisks = async () => {
    setRefreshing(true);
    try {
      // Trigger risk recalculation for all active goals
      const goalIds = goalsWithRisk.map(g => g.id);
      
      for (const goalId of goalIds) {
        await supabase.rpc('calculate_goal_risk_score', { p_goal_id: goalId });
      }

      toast({
        title: "Risks Recalculated",
        description: `Updated risk scores for ${goalIds.length} goals`,
      });

      loadData();
    } catch (error) {
      console.error('Error refreshing risks:', error);
      toast({
        title: "Error",
        description: "Failed to recalculate risks",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('goal_risk_alerts')
        .update({
          is_dismissed: true,
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast({
        title: "Alert Dismissed",
        description: "The alert has been dismissed",
      });
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const filteredGoals = filterIndicator === 'all'
    ? goalsWithRisk
    : goalsWithRisk.filter(g => g.risk_assessment?.risk_indicator === filterIndicator);

  const riskCounts = {
    blocked: goalsWithRisk.filter(g => g.risk_assessment?.risk_indicator === 'blocked').length,
    at_risk: goalsWithRisk.filter(g => g.risk_assessment?.risk_indicator === 'at_risk').length,
    on_track: goalsWithRisk.filter(g => g.risk_assessment?.risk_indicator === 'on_track').length,
    accelerated: goalsWithRisk.filter(g => g.risk_assessment?.risk_indicator === 'accelerated').length,
    unassessed: goalsWithRisk.filter(g => !g.risk_assessment).length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading risk data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card 
          className="cursor-pointer hover:border-destructive transition-colors"
          onClick={() => setFilterIndicator('blocked')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-destructive">{riskCounts.blocked}</p>
                <p className="text-sm text-muted-foreground">Blocked</p>
              </div>
              <Ban className="h-8 w-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-orange-500 transition-colors"
          onClick={() => setFilterIndicator('at_risk')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-500">{riskCounts.at_risk}</p>
                <p className="text-sm text-muted-foreground">At Risk</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-green-500 transition-colors"
          onClick={() => setFilterIndicator('on_track')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-500">{riskCounts.on_track}</p>
                <p className="text-sm text-muted-foreground">On Track</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => setFilterIndicator('accelerated')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-500">{riskCounts.accelerated}</p>
                <p className="text-sm text-muted-foreground">Accelerated</p>
              </div>
              <Rocket className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-muted-foreground transition-colors"
          onClick={() => setFilterIndicator('all')}
        >
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{goalsWithRisk.length}</p>
                <p className="text-sm text-muted-foreground">Total Active</p>
              </div>
              <AlertCircle className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="goals">Goals by Risk</TabsTrigger>
            <TabsTrigger value="alerts" className="relative">
              Alerts
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {alerts.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select 
              value={filterIndicator} 
              onValueChange={(v) => setFilterIndicator(v as RiskIndicator | 'all')}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                {Object.entries(RISK_INDICATOR_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefreshRisks}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle>Goals Risk Overview</CardTitle>
              <CardDescription>
                {filterIndicator === 'all' 
                  ? `Showing all ${filteredGoals.length} active goals`
                  : `Showing ${filteredGoals.length} ${RISK_INDICATOR_LABELS[filterIndicator]} goals`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredGoals.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No goals match the current filter
                    </p>
                  ) : (
                    filteredGoals.map((goal) => (
                      <div 
                        key={goal.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{goal.title}</span>
                            <GoalRiskIndicator
                              riskIndicator={goal.risk_assessment?.risk_indicator || null}
                              riskScore={goal.risk_assessment?.risk_score}
                              riskFactors={goal.risk_assessment?.risk_factors || []}
                              size="sm"
                              showLabel={false}
                              showScore
                            />
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{goal.employee?.full_name || 'Unassigned'}</span>
                            <span>{goal.progress_percentage ?? 0}% complete</span>
                            {goal.due_date && (
                              <span>Due: {new Date(goal.due_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Risk Alerts
              </CardTitle>
              <CardDescription>
                AI-generated alerts about goal risks and dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">No active alerts</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className={`p-4 rounded-lg border ${
                          alert.severity === 'critical' 
                            ? 'border-destructive bg-destructive/5' 
                            : alert.severity === 'warning'
                            ? 'border-orange-500 bg-orange-500/5'
                            : 'border-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {alert.severity === 'critical' ? (
                                <Ban className="h-4 w-4 text-destructive" />
                              ) : alert.severity === 'warning' ? (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="font-medium">{alert.message}</span>
                            </div>
                            {alert.ai_explanation && (
                              <p className="text-sm text-muted-foreground">
                                {alert.ai_explanation}
                              </p>
                            )}
                            {alert.goal && (
                              <p className="text-xs text-muted-foreground">
                                Goal: {alert.goal.title}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDismissAlert(alert.id)}
                            title="Dismiss alert"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
