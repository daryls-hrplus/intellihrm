import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  GraduationCap,
  Package,
  Upload,
  ExternalLink,
  User,
  Calendar,
  Users
} from 'lucide-react';
import { useOnboarding, OnboardingInstance, OnboardingTask } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, isPast, differenceInDays } from 'date-fns';

export default function AdminOnboardingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { fetchTasks, updateTask, updateInstance, getOnboardingProgress } = useOnboarding();

  const [instance, setInstance] = useState<OnboardingInstance | null>(null);
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [taskNote, setTaskNote] = useState('');

  const breadcrumbItems = [
    { label: t('common.home'), path: '/' },
    { label: t('common.admin'), path: '/admin' },
    { label: 'Employee Onboarding', path: '/admin/onboarding' },
    { label: instance?.profiles?.full_name || 'Details' },
  ];

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch instance
      const { data: instanceData } = await supabase
        .from('onboarding_instances')
        .select(`
          *,
          profiles:employee_id(full_name, email, avatar_url),
          buddy:buddy_id(full_name),
          manager:manager_id(full_name),
          onboarding_templates:template_id(name),
          companies:company_id(name)
        `)
        .eq('id', id)
        .single();

      if (instanceData) {
        setInstance(instanceData as unknown as OnboardingInstance);
      }

      // Fetch tasks
      const tasksData = await fetchTasks(id!);
      setTasks(tasksData);

      // Get progress
      const progressData = await getOnboardingProgress(id!);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskStatusChange = async (task: OnboardingTask, completed: boolean) => {
    const newStatus = completed ? 'completed' : 'pending';
    await updateTask(task.id, { status: newStatus });
    loadData();
    toast.success(completed ? 'Task marked as complete' : 'Task marked as pending');
  };

  const handleAddNote = async () => {
    if (selectedTask && taskNote) {
      await updateTask(selectedTask.id, { notes: taskNote });
      setNoteDialogOpen(false);
      setTaskNote('');
      setSelectedTask(null);
      loadData();
      toast.success('Note added');
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'training': return <GraduationCap className="h-5 w-5 text-purple-500" />;
      case 'equipment': return <Package className="h-5 w-5 text-orange-500" />;
      default: return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getTaskStatusBadge = (task: OnboardingTask) => {
    if (task.status === 'completed') {
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Completed</Badge>;
    }
    if (task.status === 'skipped') {
      return <Badge variant="secondary">Skipped</Badge>;
    }
    if (task.due_date && isPast(new Date(task.due_date))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (task.status === 'in_progress') {
      return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">In Progress</Badge>;
    }
    return <Badge variant="outline">Pending</Badge>;
  };

  const getDueDateInfo = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const days = differenceInDays(date, new Date());
    
    if (days < 0) {
      return <span className="text-destructive text-sm">{Math.abs(days)} days overdue</span>;
    }
    if (days === 0) {
      return <span className="text-amber-600 text-sm">Due today</span>;
    }
    if (days <= 3) {
      return <span className="text-amber-600 text-sm">Due in {days} days</span>;
    }
    return <span className="text-muted-foreground text-sm">Due {format(date, 'MMM d')}</span>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-48 bg-muted rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!instance) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <p>Onboarding not found</p>
        </div>
      </AppLayout>
    );
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'skipped');
  const overdueTasks = tasks.filter(t => 
    (t.status === 'pending' || t.status === 'in_progress') && 
    t.due_date && 
    isPast(new Date(t.due_date))
  );

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/onboarding')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Onboarding Progress</h1>
          </div>
        </div>

        {/* Employee Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={(instance.profiles as any)?.avatar_url} />
                <AvatarFallback className="text-2xl">
                  {getInitials((instance.profiles as any)?.full_name || 'E')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold">{(instance.profiles as any)?.full_name}</h2>
                  <p className="text-muted-foreground">{(instance.profiles as any)?.email}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="font-medium">{format(new Date(instance.start_date), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Manager</p>
                      <p className="font-medium">{(instance.manager as any)?.full_name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Buddy</p>
                      <p className="font-medium">{(instance.buddy as any)?.full_name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Template</p>
                      <p className="font-medium">{(instance.onboarding_templates as any)?.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:text-right">
                <Badge className={
                  instance.status === 'completed' ? 'bg-green-500/20 text-green-700' :
                  instance.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                  'bg-blue-500/20 text-blue-700'
                }>
                  {instance.status === 'in_progress' ? 'In Progress' : 
                   instance.status.charAt(0).toUpperCase() + instance.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{progress.percentage}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              <Progress value={progress.percentage} className="mt-4 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueTasks.length}</p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Tasks</CardTitle>
            <CardDescription>Track and manage all onboarding tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks found</p>
              ) : (
                tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      task.status === 'completed' ? 'bg-muted/30' : ''
                    }`}
                  >
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={(checked) => handleTaskStatusChange(task, checked as boolean)}
                      disabled={instance.status !== 'in_progress'}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        {getTaskIcon(task.task_type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.name}
                            </p>
                            {task.is_required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                            {getTaskStatusBadge(task)}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="capitalize text-muted-foreground">
                              Assigned to: {task.assigned_to?.full_name || task.assigned_to_type}
                            </span>
                            {getDueDateInfo(task.due_date)}
                          </div>
                          {task.notes && (
                            <p className="text-sm bg-muted/50 rounded p-2 mt-2">{task.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.task_type === 'training' && task.training_course_id && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Course
                        </Button>
                      )}
                      {task.task_type === 'document' && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setTaskNote(task.notes || '');
                          setNoteDialogOpen(true);
                        }}
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Task Notes</DialogTitle>
              <DialogDescription>Add notes or comments for this task.</DialogDescription>
            </DialogHeader>
            <Textarea
              value={taskNote}
              onChange={(e) => setTaskNote(e.target.value)}
              placeholder="Enter notes..."
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddNote}>Save Note</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
