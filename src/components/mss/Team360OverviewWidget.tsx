import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';

interface Team360Stats {
  activeCycles: number;
  pendingFeedback: number;
  teamMembersInCycle: number;
  completionRate: number;
  upcomingDeadlines: Array<{
    cycleName: string;
    deadline: string;
    daysUntil: number;
  }>;
}

interface TeamMemberStatus {
  id: string;
  name: string;
  cycleStatus: 'active' | 'completed' | 'no_cycle';
  completionRate: number;
}

export function Team360OverviewWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Team360Stats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  const fetchStats = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch manager's team cycles
      const { data: cycles, error: cyclesError } = await supabase
        .from('review_cycles')
        .select('id, name, status, feedback_deadline')
        .eq('created_by', user.id)
        .eq('is_manager_cycle', true)
        .in('status', ['active', 'in_progress']);

      if (cyclesError) throw cyclesError;

      const activeCycles = cycles?.length || 0;

      // Get pending feedback for manager
      const { count: pendingCount } = await supabase
        .from('feedback_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('reviewer_id', user.id)
        .eq('status', 'pending');

      // Calculate completion rates and team members in cycles
      let totalParticipants = 0;
      let completedParticipants = 0;
      const upcomingDeadlines: Team360Stats['upcomingDeadlines'] = [];

      for (const cycle of (cycles || [])) {
        const { count: total } = await supabase
          .from('review_participants')
          .select('*', { count: 'exact', head: true })
          .eq('review_cycle_id', cycle.id);

        const { count: completed } = await supabase
          .from('review_participants')
          .select('*', { count: 'exact', head: true })
          .eq('review_cycle_id', cycle.id)
          .eq('status', 'completed');

        totalParticipants += (total || 0);
        completedParticipants += (completed || 0);

        // Check for upcoming deadlines
        if (cycle.feedback_deadline) {
          const deadline = new Date(cycle.feedback_deadline);
          const now = new Date();
          
          if (!isPast(deadline) && isWithinInterval(deadline, { start: now, end: addDays(now, 14) })) {
            const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            upcomingDeadlines.push({
              cycleName: cycle.name,
              deadline: cycle.feedback_deadline,
              daysUntil,
            });
          }
        }
      }

      // Sort by days until deadline
      upcomingDeadlines.sort((a, b) => a.daysUntil - b.daysUntil);

      // Get direct reports using RPC to avoid type inference issues
      const { data: reports } = await supabase.rpc('get_manager_direct_reports', {
        p_manager_id: user.id
      });
      
      const limitedReports = (reports || []).slice(0, 5);

      const memberStatuses: TeamMemberStatus[] = [];
      for (const report of limitedReports) {
        const { data: participation } = await supabase
          .from('review_participants')
          .select('status, review_cycle_id')
          .eq('employee_id', report.employee_id)
          .order('created_at', { ascending: false })
          .limit(1);

        let memberCycleStatus: TeamMemberStatus['cycleStatus'] = 'no_cycle';
        let completionRate = 0;

        if (participation?.[0]?.review_cycle_id) {
          const { data: cycle } = await supabase
            .from('review_cycles')
            .select('status')
            .eq('id', participation[0].review_cycle_id)
            .single();
          
          if (cycle?.status === 'active' || cycle?.status === 'in_progress') {
            memberCycleStatus = 'active';
          } else if (participation[0].status === 'completed') {
            memberCycleStatus = 'completed';
            completionRate = 100;
          }
        }

        memberStatuses.push({
          id: report.employee_id,
          name: report.employee_name || 'Unknown',
          cycleStatus: memberCycleStatus,
          completionRate,
        });
      }

      setTeamMembers(memberStatuses);
      setStats({
        activeCycles,
        pendingFeedback: pendingCount || 0,
        teamMembersInCycle: totalParticipants,
        completionRate: totalParticipants > 0 
          ? Math.round((completedParticipants / totalParticipants) * 100) 
          : 0,
        upcomingDeadlines: upcomingDeadlines.slice(0, 3),
      });
    } catch (error) {
      console.error('Error fetching 360 stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const hasNoActivity = stats.activeCycles === 0 && stats.pendingFeedback === 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Team 360° Feedback</CardTitle>
              <CardDescription>Overview of team feedback cycles</CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/mss/360')}>
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasNoActivity ? (
          <div className="text-center py-6">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              No active 360° feedback cycles for your team
            </p>
            <Button size="sm" onClick={() => navigate('/mss/360')}>
              <Plus className="mr-1 h-4 w-4" />
              Create Team Cycle
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-info" />
                <div>
                  <p className="text-2xl font-bold">{stats.activeCycles}</p>
                  <p className="text-xs text-muted-foreground">Active Cycles</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <AlertCircle className={`h-5 w-5 ${stats.pendingFeedback > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.pendingFeedback}</p>
                  <p className="text-xs text-muted-foreground">Pending Feedback</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <UserPlus className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.teamMembersInCycle}</p>
                  <p className="text-xs text-muted-foreground">In Active Cycles</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingUp className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            {stats.upcomingDeadlines.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Upcoming Deadlines</p>
                <div className="space-y-2">
                  {stats.upcomingDeadlines.map((deadline, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center justify-between p-2 rounded border ${
                        deadline.daysUntil <= 3 
                          ? 'border-warning bg-warning/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`h-4 w-4 ${deadline.daysUntil <= 3 ? 'text-warning' : 'text-muted-foreground'}`} />
                        <span className="text-sm">{deadline.cycleName}</span>
                      </div>
                      <Badge variant={deadline.daysUntil <= 3 ? 'destructive' : 'outline'}>
                        {deadline.daysUntil === 0 
                          ? 'Today' 
                          : deadline.daysUntil === 1 
                            ? 'Tomorrow' 
                            : `${deadline.daysUntil} days`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Member Status - Quick View */}
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Team Member Status</p>
                <div className="flex flex-wrap gap-2">
                  {teamMembers.map(member => (
                    <Badge 
                      key={member.id} 
                      variant="outline"
                      className={`
                        ${member.cycleStatus === 'active' ? 'border-info text-info' : ''}
                        ${member.cycleStatus === 'completed' ? 'border-success text-success' : ''}
                        ${member.cycleStatus === 'no_cycle' ? 'border-muted-foreground text-muted-foreground' : ''}
                      `}
                    >
                      {member.cycleStatus === 'active' && <Clock className="h-3 w-3 mr-1" />}
                      {member.cycleStatus === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {stats.pendingFeedback > 0 && (
                <Button size="sm" onClick={() => navigate('/mss/360')}>
                  Complete Pending Feedback
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => navigate('/mss/360')}>
                <Plus className="mr-1 h-4 w-4" />
                Create New Cycle
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
