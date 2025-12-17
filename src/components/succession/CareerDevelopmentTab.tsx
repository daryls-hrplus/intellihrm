import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Target, BookOpen, ChevronDown, ChevronRight, User } from "lucide-react";
import { toast } from "sonner";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface CareerDevelopmentTabProps {
  companyId: string;
}

interface IDP {
  id: string;
  employee_id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string;
  target_completion_date: string | null;
  employee?: { id: string; full_name: string };
  goals?: IDPGoal[];
}

interface IDPGoal {
  id: string;
  idp_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  target_date: string | null;
  progress_percentage: number;
  activities?: IDPActivity[];
}

interface IDPActivity {
  id: string;
  goal_id: string;
  title: string;
  activity_type: string;
  status: string;
  due_date: string | null;
}

interface Employee {
  id: string;
  full_name: string;
}

export function CareerDevelopmentTab({ companyId }: CareerDevelopmentTabProps) {
  const [idps, setIdps] = useState<IDP[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [expandedIdp, setExpandedIdp] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [editingIdp, setEditingIdp] = useState<IDP | null>(null);
  const [editingGoal, setEditingGoal] = useState<IDPGoal | null>(null);
  const [selectedIdpId, setSelectedIdpId] = useState<string | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    title: '',
    description: '',
    status: 'draft',
    start_date: getTodayString(),
    target_completion_date: ''
  });

  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    category: 'skill',
    priority: 'medium',
    status: 'not_started',
    target_date: '',
    progress_percentage: 0
  });

  const [activityFormData, setActivityFormData] = useState({
    title: '',
    description: '',
    activity_type: 'training',
    status: 'pending',
    due_date: ''
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadIdps(), loadEmployees()]);
    setLoading(false);
  };

  const loadIdps = async () => {
    const { data } = await (supabase.from('individual_development_plans') as any)
      .select(`
        *,
        employee:profiles!individual_development_plans_employee_id_fkey(id, full_name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (data) {
      // Load goals for each IDP
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
    }
  };

  const loadEmployees = async () => {
    const { data } = await (supabase.from('profiles') as any)
      .select('id, full_name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('full_name');
    setEmployees(data || []);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.title) {
      toast.error('Please fill required fields');
      return;
    }

    const payload = {
      ...formData,
      company_id: companyId,
      target_completion_date: formData.target_completion_date || null
    };

    if (editingIdp) {
      const { error } = await (supabase.from('individual_development_plans') as any)
        .update(payload)
        .eq('id', editingIdp.id);
      if (error) toast.error('Failed to update IDP');
      else toast.success('IDP updated');
    } else {
      const { error } = await (supabase.from('individual_development_plans') as any)
        .insert([payload]);
      if (error) toast.error('Failed to create IDP');
      else toast.success('IDP created');
    }
    
    setDialogOpen(false);
    resetForm();
    loadIdps();
  };

  const handleGoalSubmit = async () => {
    if (!goalFormData.title || !selectedIdpId) return;

    const payload = {
      ...goalFormData,
      idp_id: selectedIdpId,
      target_date: goalFormData.target_date || null
    };

    if (editingGoal) {
      const { error } = await (supabase.from('idp_goals') as any)
        .update(payload)
        .eq('id', editingGoal.id);
      if (error) toast.error('Failed to update goal');
      else toast.success('Goal updated');
    } else {
      const { error } = await (supabase.from('idp_goals') as any)
        .insert([payload]);
      if (error) toast.error('Failed to create goal');
      else toast.success('Goal created');
    }

    setGoalDialogOpen(false);
    resetGoalForm();
    loadIdps();
  };

  const handleActivitySubmit = async () => {
    if (!activityFormData.title || !selectedGoalId) return;

    const payload = {
      ...activityFormData,
      goal_id: selectedGoalId,
      due_date: activityFormData.due_date || null
    };

    const { error } = await (supabase.from('idp_activities') as any)
      .insert([payload]);
    if (error) toast.error('Failed to create activity');
    else toast.success('Activity created');

    setActivityDialogOpen(false);
    resetActivityForm();
    loadIdps();
  };

  const deleteIdp = async (id: string) => {
    const { error } = await (supabase.from('individual_development_plans') as any)
      .delete()
      .eq('id', id);
    if (error) toast.error('Failed to delete IDP');
    else {
      toast.success('IDP deleted');
      loadIdps();
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await (supabase.from('idp_goals') as any)
      .delete()
      .eq('id', id);
    if (error) toast.error('Failed to delete goal');
    else {
      toast.success('Goal deleted');
      loadIdps();
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      title: '',
      description: '',
      status: 'draft',
      start_date: getTodayString(),
      target_completion_date: ''
    });
    setEditingIdp(null);
  };

  const resetGoalForm = () => {
    setGoalFormData({
      title: '',
      description: '',
      category: 'skill',
      priority: 'medium',
      status: 'not_started',
      target_date: '',
      progress_percentage: 0
    });
    setEditingGoal(null);
    setSelectedIdpId(null);
  };

  const resetActivityForm = () => {
    setActivityFormData({
      title: '',
      description: '',
      activity_type: 'training',
      status: 'pending',
      due_date: ''
    });
    setSelectedGoalId(null);
  };

  const openEditIdp = (idp: IDP) => {
    setEditingIdp(idp);
    setFormData({
      employee_id: idp.employee_id,
      title: idp.title,
      description: idp.description || '',
      status: idp.status,
      start_date: idp.start_date,
      target_completion_date: idp.target_completion_date || ''
    });
    setDialogOpen(true);
  };

  const openAddGoal = (idpId: string) => {
    setSelectedIdpId(idpId);
    resetGoalForm();
    setSelectedIdpId(idpId);
    setGoalDialogOpen(true);
  };

  const openAddActivity = (goalId: string) => {
    setSelectedGoalId(goalId);
    resetActivityForm();
    setSelectedGoalId(goalId);
    setActivityDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-destructive/20 text-destructive',
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
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Individual Development Plans</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New IDP</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingIdp ? 'Edit' : 'Create'} Development Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employee *</Label>
                <Select value={formData.employee_id} onValueChange={(v) => setFormData({...formData, employee_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <Label>Target Completion</Label>
                  <Input type="date" value={formData.target_completion_date} onChange={(e) => setFormData({...formData, target_completion_date: e.target.value})} />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmit} className="w-full">{editingIdp ? 'Update' : 'Create'} IDP</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goal Dialog */}
      <Dialog open={goalDialogOpen} onOpenChange={(open) => { setGoalDialogOpen(open); if (!open) resetGoalForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit' : 'Add'} Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={goalFormData.title} onChange={(e) => setGoalFormData({...goalFormData, title: e.target.value})} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={goalFormData.description} onChange={(e) => setGoalFormData({...goalFormData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={goalFormData.category} onValueChange={(v) => setGoalFormData({...goalFormData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skill">Skill</SelectItem>
                    <SelectItem value="knowledge">Knowledge</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={goalFormData.priority} onValueChange={(v) => setGoalFormData({...goalFormData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Target Date</Label>
                <Input type="date" value={goalFormData.target_date} onChange={(e) => setGoalFormData({...goalFormData, target_date: e.target.value})} />
              </div>
              <div>
                <Label>Progress %</Label>
                <Input type="number" min="0" max="100" value={goalFormData.progress_percentage} onChange={(e) => setGoalFormData({...goalFormData, progress_percentage: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <Button onClick={handleGoalSubmit} className="w-full">{editingGoal ? 'Update' : 'Add'} Goal</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={(open) => { setActivityDialogOpen(open); if (!open) resetActivityForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={activityFormData.title} onChange={(e) => setActivityFormData({...activityFormData, title: e.target.value})} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={activityFormData.description} onChange={(e) => setActivityFormData({...activityFormData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={activityFormData.activity_type} onValueChange={(v) => setActivityFormData({...activityFormData, activity_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="mentoring">Mentoring</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={activityFormData.due_date} onChange={(e) => setActivityFormData({...activityFormData, due_date: e.target.value})} />
              </div>
            </div>
            <Button onClick={handleActivitySubmit} className="w-full">Add Activity</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* IDP List */}
      <div className="space-y-3">
        {idps.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No development plans yet</CardContent></Card>
        ) : (
          idps.map(idp => (
            <Card key={idp.id} className="overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedIdp(expandedIdp === idp.id ? null : idp.id)}
              >
                <div className="flex items-center gap-3">
                  {expandedIdp === idp.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{idp.title}</div>
                    <div className="text-sm text-muted-foreground">{idp.employee?.full_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <Progress value={calculateIdpProgress(idp)} className="h-2" />
                    <span className="text-xs text-muted-foreground">{calculateIdpProgress(idp)}% complete</span>
                  </div>
                  <Badge className={getStatusColor(idp.status)}>{idp.status}</Badge>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" onClick={() => openEditIdp(idp)}><Edit className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteIdp(idp.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              
              {expandedIdp === idp.id && (
                <div className="border-t p-4 bg-muted/20">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium flex items-center gap-2"><Target className="h-4 w-4" /> Goals</h4>
                    <Button size="sm" variant="outline" onClick={() => openAddGoal(idp.id)}><Plus className="h-3 w-3 mr-1" /> Add Goal</Button>
                  </div>
                  
                  {idp.goals?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No goals defined</p>
                  ) : (
                    <div className="space-y-2">
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
                              <span className="text-xs text-muted-foreground">{goal.progress_percentage}%</span>
                              <Badge className={getStatusColor(goal.status)}>{goal.status.replace('_', ' ')}</Badge>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {expandedGoal === goal.id && (
                            <div className="border-t p-3 bg-muted/10">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium flex items-center gap-1"><BookOpen className="h-3 w-3" /> Activities</span>
                                <Button size="sm" variant="ghost" onClick={() => openAddActivity(goal.id)}><Plus className="h-3 w-3" /></Button>
                              </div>
                              {goal.activities?.length === 0 ? (
                                <p className="text-xs text-muted-foreground">No activities</p>
                              ) : (
                                <ul className="space-y-1">
                                  {goal.activities?.map(activity => (
                                    <li key={activity.id} className="text-sm flex items-center justify-between">
                                      <span>{activity.title}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">{activity.activity_type}</Badge>
                                        <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                                      </div>
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
          ))
        )}
      </div>
    </div>
  );
}
