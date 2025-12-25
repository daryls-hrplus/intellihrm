import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  Target,
  Clock,
  Award,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TeamMemberDetails {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  job_title: string | null;
  department_name: string | null;
  hire_date: string | null;
  position_title: string | null;
}

interface LeaveBalance {
  leave_type: string;
  balance: number;
  used: number;
}

interface RecentLeave {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  status: string;
  due_date: string | null;
}

export default function MssTeamMemberPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [member, setMember] = useState<TeamMemberDetails | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<RecentLeave[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = [
    { label: t('mss.title'), href: '/mss' },
    { label: t('mss.dashboard.myTeam'), href: '/mss/team' },
    { label: member?.full_name || 'Team Member' },
  ];

  useEffect(() => {
    if (id) {
      loadMemberDetails();
    }
  }, [id]);

  const loadMemberDetails = async () => {
    if (!id) return;
    setIsLoading(true);

    try {
      // Load basic profile info
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          avatar_url,
          departments (name)
        `)
        .eq('id', id)
        .single();

      if (profile) {
        // Get position info from employee_positions
        const { data: positionData } = await supabase
          .from('employee_positions')
          .select(`
            positions (title),
            start_date
          `)
          .eq('employee_id', id)
          .eq('is_primary', true)
          .maybeSingle();

        setMember({
          id: profile.id,
          full_name: profile.full_name || 'Unknown',
          email: profile.email || '',
          avatar_url: profile.avatar_url,
          job_title: null,
          department_name: (profile.departments as any)?.name || null,
          hire_date: positionData?.start_date || null,
          position_title: (positionData?.positions as any)?.title || null,
        });
      }

      // Load leave balances
      const { data: balances } = await supabase
        .from('leave_balances')
        .select(`
          balance,
          used,
          leave_types (name)
        `)
        .eq('employee_id', id);

      if (balances) {
        setLeaveBalances(balances.map((b: any) => ({
          leave_type: b.leave_types?.name || 'Unknown',
          balance: b.balance || 0,
          used: b.used || 0,
        })));
      }

      // Load recent leave requests
      const { data: leaves } = await supabase
        .from('leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          status,
          leave_types (name)
        `)
        .eq('employee_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (leaves) {
        setRecentLeaves(leaves.map((l: any) => ({
          id: l.id,
          leave_type: l.leave_types?.name || 'Unknown',
          start_date: l.start_date,
          end_date: l.end_date,
          status: l.status,
        })));
      }

      // Load goals
      const { data: goalsData } = await supabase
        .from('performance_goals')
        .select('id, title, progress, status, due_date')
        .eq('employee_id', id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (goalsData) {
        setGoals(goalsData.map((g: any) => ({
          id: g.id,
          title: g.title || 'Untitled Goal',
          progress: g.progress || 0,
          status: g.status || 'not_started',
          due_date: g.due_date,
        })));
      }

    } catch (error) {
      console.error('Error loading team member details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-500/10 text-green-600 border-green-500/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
      completed: 'bg-green-500/10 text-green-600 border-green-500/20',
      in_progress: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      not_started: 'bg-muted text-muted-foreground',
    };
    return (
      <Badge className={colors[status.toLowerCase()] || 'bg-muted text-muted-foreground'}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Team member not found</h2>
          <Button variant="link" onClick={() => navigate('/mss/team')}>
            Back to My Team
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/mss/team')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Team
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-xl">
                  {member.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{member.full_name}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-muted-foreground">
                  {member.position_title && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {member.position_title}
                    </div>
                  )}
                  {member.department_name && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {member.department_name}
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${member.email}`} className="hover:underline">
                        {member.email}
                      </a>
                    </div>
                  )}
                  {member.hire_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Since {format(new Date(member.hire_date), 'MMM yyyy')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="leave" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leave" className="gap-2">
              <Clock className="h-4 w-4" />
              Leave
            </TabsTrigger>
            <TabsTrigger value="goals" className="gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Leave Tab */}
          <TabsContent value="leave" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Leave Balances */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Leave Balances</CardTitle>
                  <CardDescription>Current leave entitlements</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaveBalances.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No leave balances found</p>
                  ) : (
                    <div className="space-y-3">
                      {leaveBalances.map((balance, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm">{balance.leave_type}</span>
                          <div className="text-sm">
                            <span className="font-medium">{balance.balance - balance.used}</span>
                            <span className="text-muted-foreground"> / {balance.balance} days</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Leave Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Leave Requests</CardTitle>
                  <CardDescription>Last 5 requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentLeaves.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No recent leave requests</p>
                  ) : (
                    <div className="space-y-3">
                      {recentLeaves.map((leave) => (
                        <div key={leave.id} className="flex justify-between items-center">
                          <div>
                            <span className="text-sm font-medium">{leave.leave_type}</span>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {getStatusBadge(leave.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goals</CardTitle>
                <CardDescription>Current objectives and progress</CardDescription>
              </CardHeader>
              <CardContent>
                {goals.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No goals assigned</p>
                ) : (
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{goal.title}</h4>
                          {getStatusBadge(goal.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                        </div>
                        {goal.due_date && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {format(new Date(goal.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Summary</CardTitle>
                <CardDescription>Recent performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Performance data will be displayed here based on completed appraisals.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
