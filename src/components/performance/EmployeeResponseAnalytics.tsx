import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users,
  TrendingUp,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPie, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface EmployeeResponseAnalyticsProps {
  companyId: string;
  cycleId?: string;
}

const RESPONSE_TYPE_COLORS = {
  agree: '#22c55e',
  agree_with_comments: '#84cc16',
  partial_disagree: '#f59e0b',
  disagree: '#ef4444',
};

const STATUS_COLORS = {
  draft: '#94a3b8',
  submitted: '#3b82f6',
  hr_review: '#f59e0b',
  manager_responded: '#8b5cf6',
  closed: '#22c55e',
};

export function EmployeeResponseAnalytics({ companyId, cycleId }: EmployeeResponseAnalyticsProps) {
  // Fetch response statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['employee-response-analytics', companyId, cycleId],
    queryFn: async () => {
      // Get all responses
      let query = supabase
        .from('employee_review_responses')
        .select('*')
        .eq('company_id', companyId);

      const { data: responses, error } = await query;
      if (error) throw error;

      // Get appraisal participants for comparison
      let participantQuery = supabase
        .from('appraisal_participants')
        .select(`
          id,
          status,
          has_employee_response,
          employee_response_status,
          employee_response_due_at,
          appraisal_cycles!inner (
            id,
            company_id,
            name
          )
        `)
        .eq('appraisal_cycles.company_id', companyId)
        .in('status', ['manager_submitted', 'pending_response', 'awaiting_employee_response', 'completed']);

      if (cycleId) {
        participantQuery = participantQuery.eq('cycle_id', cycleId);
      }

      const { data: participants } = await participantQuery;

      // Calculate stats
      const totalParticipants = participants?.length || 0;
      const respondedCount = participants?.filter((p: any) => p.has_employee_response)?.length || 0;
      const pendingCount = participants?.filter((p: any) => !p.has_employee_response)?.length || 0;
      
      const overdueCount = participants?.filter((p: any) => {
        if (p.has_employee_response || !p.employee_response_due_at) return false;
        return new Date(p.employee_response_due_at) < new Date();
      })?.length || 0;

      // Response types breakdown
      const responseTypes = responses?.reduce((acc: Record<string, number>, r: any) => {
        acc[r.response_type] = (acc[r.response_type] || 0) + 1;
        return acc;
      }, {}) || {};

      // Status breakdown
      const statusBreakdown = responses?.reduce((acc: Record<string, number>, r: any) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}) || {};

      // Escalation stats
      const escalatedCount = responses?.filter((r: any) => r.is_escalated_to_hr)?.length || 0;
      const pendingEscalations = responses?.filter((r: any) => 
        r.is_escalated_to_hr && !r.hr_reviewed_at
      )?.length || 0;
      const resolvedEscalations = responses?.filter((r: any) => 
        r.is_escalated_to_hr && r.hr_reviewed_at
      )?.length || 0;

      // Manager rebuttals
      const withRebuttals = responses?.filter((r: any) => r.manager_rebuttal)?.length || 0;

      // Escalation categories
      const escalationCategories = responses?.reduce((acc: Record<string, number>, r: any) => {
        if (r.is_escalated_to_hr && r.escalation_category) {
          acc[r.escalation_category] = (acc[r.escalation_category] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      return {
        totalParticipants,
        respondedCount,
        pendingCount,
        overdueCount,
        responseRate: totalParticipants > 0 ? (respondedCount / totalParticipants) * 100 : 0,
        responseTypes,
        statusBreakdown,
        escalatedCount,
        pendingEscalations,
        resolvedEscalations,
        withRebuttals,
        escalationCategories,
        responses: responses || [],
      };
    },
    enabled: !!companyId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const responseTypeData = Object.entries(stats?.responseTypes || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: RESPONSE_TYPE_COLORS[key as keyof typeof RESPONSE_TYPE_COLORS] || '#94a3b8',
  }));

  const statusData = Object.entries(stats?.statusBreakdown || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || '#94a3b8',
  }));

  const escalationCategoryData = Object.entries(stats?.escalationCategories || {}).map(([key, value]) => ({
    category: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: value,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.responseRate.toFixed(1)}%</div>
            <Progress value={stats?.responseRate || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.respondedCount} of {stats?.totalParticipants} responded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingCount || 0}</div>
            {(stats?.overdueCount || 0) > 0 && (
              <Badge variant="destructive" className="mt-2">
                {stats?.overdueCount} overdue
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.escalatedCount || 0}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-yellow-600">
                {stats?.pendingEscalations} pending
              </Badge>
              <Badge variant="outline" className="text-green-600">
                {stats?.resolvedEscalations} resolved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Manager Rebuttals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.withRebuttals || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              responses with manager feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="types" className="w-full">
        <TabsList>
          <TabsTrigger value="types" className="gap-2">
            <PieChart className="h-4 w-4" />
            Response Types
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Status Breakdown
          </TabsTrigger>
          <TabsTrigger value="escalations" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Escalation Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Type Distribution</CardTitle>
              <CardDescription>How employees responded to their performance reviews</CardDescription>
            </CardHeader>
            <CardContent>
              {responseTypeData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={responseTypeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {responseTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No response data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Status Breakdown</CardTitle>
              <CardDescription>Current status of all employee responses</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" name="Count">
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No status data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Categories</CardTitle>
              <CardDescription>Reasons employees escalated to HR</CardDescription>
            </CardHeader>
            <CardContent>
              {escalationCategoryData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={escalationCategoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" name="Escalations" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No escalation data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Response Engagement</h4>
              <p className="text-sm text-muted-foreground">
                {(stats?.responseRate || 0) >= 80 
                  ? "Excellent response rate! Most employees are actively engaging with their reviews."
                  : (stats?.responseRate || 0) >= 50
                    ? "Good participation. Consider following up with non-responders."
                    : "Low response rate. Consider sending reminders to improve engagement."}
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Disagreement Level</h4>
              <p className="text-sm text-muted-foreground">
                {((stats?.responseTypes?.disagree || 0) + (stats?.responseTypes?.partial_disagree || 0)) > 
                 ((stats?.responseTypes?.agree || 0) + (stats?.responseTypes?.agree_with_comments || 0))
                  ? "High disagreement rates may indicate calibration or communication issues."
                  : "Healthy agreement levels suggest good alignment between managers and employees."}
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Escalation Health</h4>
              <p className="text-sm text-muted-foreground">
                {(stats?.pendingEscalations || 0) === 0
                  ? "All escalations have been addressed. Great job maintaining employee trust!"
                  : `${stats?.pendingEscalations} escalation(s) require HR attention. Timely response is important.`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
