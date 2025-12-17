import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString } from "@/utils/dateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Plus, ChevronDown, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";

interface IDP {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string;
  target_completion_date: string | null;
  goals?: IDPGoal[];
}

interface IDPGoal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  progress_percentage: number;
  activities?: IDPActivity[];
}

interface IDPActivity {
  id: string;
  title: string;
  activity_type: string;
  status: string;
}

export default function MyDevelopmentPlanPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [idps, setIdps] = useState<IDP[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIdp, setExpandedIdp] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<IDPGoal | null>(null);
  const [newProgress, setNewProgress] = useState(0);

  useEffect(() => {
    if (user) loadIdps();
  }, [user]);

  const loadIdps = async () => {
    setLoading(true);
    const { data } = await (supabase.from('individual_development_plans') as any)
      .select('*')
      .eq('employee_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      const idpsWithGoals = await Promise.all(data.map(async (idp: any) => {
        const { data: goals } = await (supabase.from('idp_goals') as any)
          .select('*')
          .eq('idp_id', idp.id)
          .order('created_at');

        const goalsWithActivities = goals ? await Promise.all(goals.map(async (goal: any) => {
          const { data: activities } = await (supabase.from('idp_activities') as any)
            .select('*')
            .eq('goal_id', goal.id)
            .order('created_at');
          return { ...goal, activities: activities || [] };
        })) : [];

        return { ...idp, goals: goalsWithActivities };
      }));
      setIdps(idpsWithGoals);
      if (idpsWithGoals.length > 0) setExpandedIdp(idpsWithGoals[0].id);
    }
    setLoading(false);
  };

  const updateGoalProgress = async () => {
    if (!selectedGoal) return;

    const newStatus = newProgress >= 100 ? 'completed' : newProgress > 0 ? 'in_progress' : 'not_started';
    
    const { error } = await (supabase.from('idp_goals') as any)
      .update({ 
        progress_percentage: newProgress,
        status: newStatus,
        completion_date: newProgress >= 100 ? getTodayString() : null
      })
      .eq('id', selectedGoal.id);

    if (error) toast.error(t('common.error'));
    else {
      toast.success(t('common.success'));
      loadIdps();
    }
    setProgressDialogOpen(false);
  };

  const updateActivityStatus = async (activityId: string, status: string) => {
    const { error } = await (supabase.from('idp_activities') as any)
      .update({ 
        status,
        completion_date: status === 'completed' ? getTodayString() : null
      })
      .eq('id', activityId);

    if (error) toast.error(t('common.error'));
    else {
      toast.success(t('common.success'));
      loadIdps();
    }
  };

  const openProgressDialog = (goal: IDPGoal) => {
    setSelectedGoal(goal);
    setNewProgress(goal.progress_percentage);
    setProgressDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      not_started: 'bg-muted text-muted-foreground',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  const calculateIdpProgress = (idp: IDP) => {
    if (!idp.goals?.length) return 0;
    const total = idp.goals.reduce((sum, g) => sum + g.progress_percentage, 0);
    return Math.round(total / idp.goals.length);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center p-8">{t('common.loading')}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('ess.myDevelopmentPlan.title')}</h1>
            <p className="text-muted-foreground">{t('ess.myDevelopmentPlan.subtitle')}</p>
          </div>
        </div>

        {/* Progress Dialog */}
        <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Progress</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Goal: {selectedGoal?.title}</Label>
              </div>
              <div>
                <Label>Progress (%)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={newProgress}
                    onChange={(e) => setNewProgress(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="font-bold w-12">{newProgress}%</span>
                </div>
              </div>
              <Button onClick={updateGoalProgress} className="w-full">Update Progress</Button>
            </div>
          </DialogContent>
        </Dialog>

        {idps.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Development Plans</h3>
              <p className="text-muted-foreground">Your development plan will appear here once it's created by HR or your manager.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {idps.map(idp => (
              <Card key={idp.id} className="overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                  onClick={() => setExpandedIdp(expandedIdp === idp.id ? null : idp.id)}
                >
                  <div className="flex items-center gap-3">
                    {expandedIdp === idp.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <div>
                      <div className="font-medium">{idp.title}</div>
                      <div className="text-sm text-muted-foreground">{idp.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={calculateIdpProgress(idp)} className="h-2" />
                      <span className="text-xs text-muted-foreground">{calculateIdpProgress(idp)}% complete</span>
                    </div>
                    <Badge className={getStatusColor(idp.status)}>{idp.status}</Badge>
                  </div>
                </div>

                {expandedIdp === idp.id && (
                  <div className="border-t p-4 bg-muted/20 space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4" /> Goals
                    </h4>

                    {idp.goals?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No goals defined yet</p>
                    ) : (
                      <div className="space-y-3">
                        {idp.goals?.map(goal => (
                          <div key={goal.id} className="bg-background rounded-lg border">
                            <div 
                              className="p-3 flex items-center justify-between cursor-pointer"
                              onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                            >
                              <div className="flex items-center gap-2">
                                {expandedGoal === goal.id ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                <span className="font-medium text-sm">{goal.title}</span>
                                <Badge variant="outline" className="text-xs">{goal.category}</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={goal.progress_percentage} className="w-20 h-2" />
                                <span className="text-xs text-muted-foreground w-8">{goal.progress_percentage}%</span>
                                <Badge className={getStatusColor(goal.status)}>{goal.status.replace('_', ' ')}</Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => { e.stopPropagation(); openProgressDialog(goal); }}
                                >
                                  Update Progress
                                </Button>
                              </div>
                            </div>

                            {expandedGoal === goal.id && (
                              <div className="border-t p-3 bg-muted/10">
                                <div className="text-sm font-medium mb-2">Activities</div>
                                {goal.activities?.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No activities</p>
                                ) : (
                                  <ul className="space-y-2">
                                    {goal.activities?.map(activity => (
                                      <li key={activity.id} className="flex items-center justify-between bg-background p-2 rounded">
                                        <div className="flex items-center gap-2">
                                          {activity.status === 'completed' ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <div className="h-4 w-4 rounded-full border-2" />
                                          )}
                                          <span className={activity.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                            {activity.title}
                                          </span>
                                          <Badge variant="outline" className="text-xs">{activity.activity_type}</Badge>
                                        </div>
                                        <Select 
                                          value={activity.status} 
                                          onValueChange={(v) => updateActivityStatus(activity.id, v)}
                                        >
                                          <SelectTrigger className="w-32 h-7 text-xs">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
