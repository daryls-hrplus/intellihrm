import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingDown,
  FileText,
  Key,
  BookOpen,
  MessageSquare,
  Package,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, differenceInDays, parseISO } from 'date-fns';

interface OffboardingAnalyticsProps {
  companyId?: string;
}

interface AnalyticsData {
  totalInstances: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  avgCompletionDays: number;
  tasksByType: { name: string; value: number }[];
  completionTrend: { month: string; started: number; completed: number }[];
  taskCompletionRate: number;
  templateUsage: { name: string; count: number }[];
  reasonBreakdown: { name: string; value: number }[];
  avgTasksPerInstance: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function OffboardingAnalytics({ companyId }: OffboardingAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6months');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalInstances: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    avgCompletionDays: 0,
    tasksByType: [],
    completionTrend: [],
    taskCompletionRate: 0,
    templateUsage: [],
    reasonBreakdown: [],
    avgTasksPerInstance: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [companyId, dateRange]);

  const getDateRangeStart = () => {
    const now = new Date();
    switch (dateRange) {
      case '1month': return subMonths(now, 1);
      case '3months': return subMonths(now, 3);
      case '6months': return subMonths(now, 6);
      case '12months': return subMonths(now, 12);
      default: return subMonths(now, 6);
    }
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const startDate = getDateRangeStart().toISOString();

      let instancesQuery = supabase
        .from('offboarding_instances')
        .select(`*, offboarding_templates:template_id(name)`)
        .gte('created_at', startDate);

      if (companyId && companyId !== 'all') {
        instancesQuery = instancesQuery.eq('company_id', companyId);
      }

      const { data: instances } = await instancesQuery;

      const instanceIds = instances?.map(i => i.id) || [];
      let tasksData: any[] = [];
      
      if (instanceIds.length > 0) {
        const { data: tasks } = await supabase
          .from('offboarding_tasks')
          .select('*')
          .in('instance_id', instanceIds);
        tasksData = tasks || [];
      }

      const totalInstances = instances?.length || 0;
      const inProgress = instances?.filter(i => i.status === 'in_progress').length || 0;
      const completed = instances?.filter(i => i.status === 'completed').length || 0;
      const cancelled = instances?.filter(i => i.status === 'cancelled').length || 0;

      const completedInstances = instances?.filter(i => 
        i.status === 'completed' && i.completed_at && i.created_at
      ) || [];
      const avgCompletionDays = completedInstances.length > 0
        ? completedInstances.reduce((sum, i) => 
            sum + differenceInDays(parseISO(i.completed_at!), parseISO(i.created_at)), 0
          ) / completedInstances.length
        : 0;

      const taskTypeCount: Record<string, number> = {};
      tasksData.forEach(t => {
        const type = t.task_type.replace('_', ' ');
        taskTypeCount[type] = (taskTypeCount[type] || 0) + 1;
      });
      const tasksByType = Object.entries(taskTypeCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const taskCompletionRate = tasksData.length > 0
        ? (completedTasks / tasksData.length) * 100
        : 0;

      const avgTasksPerInstance = totalInstances > 0
        ? tasksData.length / totalInstances
        : 0;

      const months: Record<string, { started: number; completed: number }> = {};
      for (let i = 0; i <= parseInt(dateRange); i++) {
        const monthDate = subMonths(new Date(), i);
        const key = format(monthDate, 'MMM yyyy');
        months[key] = { started: 0, completed: 0 };
      }

      instances?.forEach(instance => {
        const startMonth = format(parseISO(instance.created_at), 'MMM yyyy');
        if (months[startMonth]) {
          months[startMonth].started++;
        }
        if (instance.completed_at) {
          const completedMonth = format(parseISO(instance.completed_at), 'MMM yyyy');
          if (months[completedMonth]) {
            months[completedMonth].completed++;
          }
        }
      });

      const completionTrend = Object.entries(months)
        .map(([month, data]) => ({ month, ...data }))
        .reverse();

      const templateCount: Record<string, number> = {};
      instances?.forEach(i => {
        const name = i.offboarding_templates?.name || 'Unknown';
        templateCount[name] = (templateCount[name] || 0) + 1;
      });
      const templateUsage = Object.entries(templateCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const reasonCount: Record<string, number> = {};
      instances?.forEach(i => {
        const reason = i.termination_reason || 'Not specified';
        reasonCount[reason] = (reasonCount[reason] || 0) + 1;
      });
      const reasonBreakdown = Object.entries(reasonCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value,
      }));

      setAnalytics({
        totalInstances,
        inProgress,
        completed,
        cancelled,
        avgCompletionDays: Math.round(avgCompletionDays),
        tasksByType,
        completionTrend,
        taskCompletionRate: Math.round(taskCompletionRate),
        templateUsage,
        reasonBreakdown,
        avgTasksPerInstance: Math.round(avgTasksPerInstance * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusData = [
    { name: 'In Progress', value: analytics.inProgress, color: 'hsl(var(--chart-1))' },
    { name: 'Completed', value: analytics.completed, color: 'hsl(var(--chart-2))' },
    { name: 'Cancelled', value: analytics.cancelled, color: 'hsl(var(--chart-3))' },
  ].filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="12months">Last 12 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Offboardings</p>
                <p className="text-3xl font-bold">{analytics.totalInstances}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.inProgress} active
                </p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">
                  {analytics.totalInstances > 0 
                    ? Math.round((analytics.completed / analytics.totalInstances) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completed} completed
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                <p className="text-3xl font-bold">{analytics.avgCompletionDays}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attrition Tracked</p>
                <p className="text-3xl font-bold">{analytics.totalInstances}</p>
                <p className="text-xs text-muted-foreground mt-1">departures</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500/10">
                <TrendingDown className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Task Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.taskCompletionRate}%</p>
              </div>
            </div>
            <Progress value={analytics.taskCompletionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Tasks per Employee</p>
                <p className="text-2xl font-bold">{analytics.avgTasksPerInstance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Offboarding Trend</CardTitle>
            <CardDescription>Departures started vs completed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="started" 
                    name="Started"
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))"
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    name="Completed"
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termination Reasons</CardTitle>
            <CardDescription>Breakdown by departure reason</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {analytics.reasonBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.reasonBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {analytics.reasonBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Type</CardTitle>
            <CardDescription>Distribution of offboarding task types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics.tasksByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.tasksByType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No task data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Templates</CardTitle>
            <CardDescription>Offboarding templates by usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.templateUsage.length > 0 ? (
                analytics.templateUsage.map((template, index) => (
                  <div key={template.name} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={(template.count / analytics.totalInstances) * 100} 
                          className="h-2 flex-1"
                        />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {template.count} uses
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No template data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
