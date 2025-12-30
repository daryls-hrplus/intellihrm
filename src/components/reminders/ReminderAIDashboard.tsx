import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Bell, 
  Settings, 
  FileText, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  RefreshCw,
  Lightbulb,
  ChevronRight
} from 'lucide-react';

interface DashboardStats {
  activeRules: number;
  pendingReminders: number;
  coveragePercent: number;
  overdueCount: number;
  upcomingWeek: number;
  totalEventTypes: number;
  coveredEventTypes: number;
}

interface AIInsight {
  type: 'warning' | 'suggestion' | 'info';
  title: string;
  description: string;
  action?: string;
}

interface ReminderAIDashboardProps {
  companyId: string;
  onNavigateToRules?: () => void;
  onNavigateToReminders?: () => void;
}

export function ReminderAIDashboard({ 
  companyId, 
  onNavigateToRules,
  onNavigateToReminders 
}: ReminderAIDashboardProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleNavigateToRules = () => {
    if (onNavigateToRules) {
      onNavigateToRules();
    } else {
      navigate('/hr-hub/reminders?tab=rules');
    }
  };

  const handleNavigateToReminders = () => {
    if (onNavigateToReminders) {
      onNavigateToReminders();
    } else {
      navigate('/hr-hub/reminders?tab=reminders');
    }
  };

  const fetchStats = async () => {
    if (!companyId || companyId === 'all') {
      setLoading(false);
      return;
    }

    try {
      // Fetch active rules count
      const { count: rulesCount } = await supabase
        .from('reminder_rules')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('is_active', true);

      // Fetch pending reminders
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { count: pendingCount } = await supabase
        .from('employee_reminders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending');

      const { count: upcomingWeekCount } = await supabase
        .from('employee_reminders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .gte('reminder_date', today)
        .lte('reminder_date', nextWeek);

      const { count: overdueCount } = await supabase
        .from('employee_reminders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .lt('event_date', today);

      // Fetch event types coverage
      const { count: totalEventTypes } = await supabase
        .from('reminder_event_types')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: coveredTypes } = await supabase
        .from('reminder_rules')
        .select('event_type_id')
        .eq('company_id', companyId)
        .eq('is_active', true);

      const coveredEventTypes = new Set(coveredTypes?.map(r => r.event_type_id)).size;
      const coveragePercent = totalEventTypes && totalEventTypes > 0 
        ? Math.round((coveredEventTypes / totalEventTypes) * 100) 
        : 0;

      setStats({
        activeRules: rulesCount || 0,
        pendingReminders: pendingCount || 0,
        coveragePercent,
        overdueCount: overdueCount || 0,
        upcomingWeek: upcomingWeekCount || 0,
        totalEventTypes: totalEventTypes || 0,
        coveredEventTypes,
      });

      // Generate AI insights based on stats
      const newInsights: AIInsight[] = [];

      if (coveragePercent < 50) {
        newInsights.push({
          type: 'warning',
          title: 'Low reminder coverage',
          description: `Only ${coveragePercent}% of event types have reminder rules. Consider setting up rules for critical dates.`,
          action: 'Set up rules'
        });
      }

      if (overdueCount && overdueCount > 0) {
        newInsights.push({
          type: 'warning',
          title: `${overdueCount} overdue reminder${overdueCount > 1 ? 's' : ''}`,
          description: 'Some events have passed without action. Review and address these immediately.',
          action: 'View overdue'
        });
      }

      if (upcomingWeekCount && upcomingWeekCount > 5) {
        newInsights.push({
          type: 'info',
          title: `${upcomingWeekCount} reminders this week`,
          description: 'Multiple notifications scheduled. Ensure relevant parties are prepared.',
        });
      }

      if ((rulesCount || 0) === 0) {
        newInsights.push({
          type: 'suggestion',
          title: 'No active rules configured',
          description: 'Use AI analysis to discover data sources and set up automatic reminders.',
          action: 'Run AI analysis'
        });
      }

      if (newInsights.length === 0 && coveragePercent >= 70) {
        newInsights.push({
          type: 'info',
          title: 'Good reminder coverage',
          description: `${coveragePercent}% of event types are covered. Keep monitoring for new data sources.`,
        });
      }

      setInsights(newInsights);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStats();
  }, [companyId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (companyId === 'all') {
    return (
      <Card className="bg-muted/30">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a company to view reminder insights</p>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-primary" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <Card className="border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">AI Dashboard</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
              <div 
                className="p-3 bg-background rounded-lg border cursor-pointer hover:border-primary/30 transition-colors"
                onClick={handleNavigateToRules}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Settings className="h-3.5 w-3.5" />
                  <span className="text-xs">Active Rules</span>
                </div>
                <p className="text-2xl font-bold">{stats?.activeRules || 0}</p>
              </div>

              <div 
                className="p-3 bg-background rounded-lg border cursor-pointer hover:border-primary/30 transition-colors"
                onClick={handleNavigateToReminders}
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Bell className="h-3.5 w-3.5" />
                  <span className="text-xs">Pending</span>
                </div>
                <p className="text-2xl font-bold">{stats?.pendingReminders || 0}</p>
              </div>

              <div className="p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-xs">This Week</span>
                </div>
                <p className="text-2xl font-bold text-primary">{stats?.upcomingWeek || 0}</p>
              </div>

              <div className="p-3 bg-background rounded-lg border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span className="text-xs">Overdue</span>
                </div>
                <p className={`text-2xl font-bold ${(stats?.overdueCount || 0) > 0 ? 'text-destructive' : ''}`}>
                  {stats?.overdueCount || 0}
                </p>
              </div>

              <div className="p-3 bg-background rounded-lg border col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs">Coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={stats?.coveragePercent || 0} className="flex-1 h-2" />
                  <span className="text-sm font-medium">{stats?.coveragePercent || 0}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.coveredEventTypes} of {stats?.totalEventTypes} types
                </p>
              </div>
            </div>

            {/* AI Insights */}
            {insights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  AI Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {insights.map((insight, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        insight.type === 'warning' 
                          ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800' 
                          : insight.type === 'suggestion'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/50 border-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {insight.description}
                          </p>
                          {insight.action && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="h-auto p-0 mt-1 text-xs"
                              onClick={() => {
                                if (insight.action === 'Set up rules' || insight.action === 'Run AI analysis') {
                                  handleNavigateToRules();
                                } else {
                                  handleNavigateToReminders();
                                }
                              }}
                            >
                              {insight.action}
                              <ChevronRight className="h-3 w-3 ml-0.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
