import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle2,
  Clock,
  FileText,
  Key,
  BookOpen,
  MessageSquare,
  Package,
  Upload,
  UserMinus,
  Users,
  Calendar
} from 'lucide-react';
import { useOffboarding, OffboardingInstance, OffboardingTask } from '@/hooks/useOffboarding';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

export default function MyOffboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { fetchInstances, fetchTasks, updateTask, getOffboardingProgress } = useOffboarding();

  const [instance, setInstance] = useState<OffboardingInstance | null>(null);
  const [tasks, setTasks] = useState<OffboardingTask[]>([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbItems = [
    { label: t('common.home'), path: '/' },
    { label: 'Employee Self Service', path: '/ess' },
    { label: 'My Offboarding' },
  ];

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const instances = await fetchInstances({ employeeId: user?.id });
      const activeInstance = instances.find(i => i.status === 'in_progress') || instances[0];
      
      if (activeInstance) {
        setInstance(activeInstance);
        const tasksData = await fetchTasks(activeInstance.id);
        setTasks(tasksData);
        const progressData = await getOffboardingProgress(activeInstance.id);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading offboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskComplete = async (task: OffboardingTask) => {
    if (task.assigned_to_type !== 'employee') {
      toast.error('This task is assigned to someone else');
      return;
    }

    await updateTask(task.id, { status: 'completed' });
    loadData();
    toast.success('Task marked as complete!');
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'equipment': return <Package className="h-5 w-5 text-orange-500" />;
      case 'access': return <Key className="h-5 w-5 text-red-500" />;
      case 'knowledge_transfer': return <BookOpen className="h-5 w-5 text-purple-500" />;
      case 'exit_interview': return <MessageSquare className="h-5 w-5 text-teal-500" />;
      default: return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getTaskStatus = (task: OffboardingTask) => {
    if (task.status === 'completed') {
      return { color: 'bg-green-500/20 text-green-700', label: 'Completed' };
    }
    if (task.due_date && isPast(new Date(task.due_date))) {
      return { color: 'bg-destructive/20 text-destructive', label: 'Overdue' };
    }
    if (task.status === 'in_progress') {
      return { color: 'bg-blue-500/20 text-blue-700', label: 'In Progress' };
    }
    return { color: 'bg-muted text-muted-foreground', label: 'Pending' };
  };

  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null;
    const days = differenceInDays(new Date(dueDate), new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    return `${days} days left`;
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
        <div className="container mx-auto py-6 space-y-6">
          <Breadcrumbs items={breadcrumbItems} />
          <Card>
            <CardContent className="py-16 text-center">
              <UserMinus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Active Offboarding</h2>
              <p className="text-muted-foreground">
                You don't have any offboarding tasks at the moment.
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const myTasks = tasks.filter(t => t.assigned_to_type === 'employee');
  const otherTasks = tasks.filter(t => t.assigned_to_type !== 'employee');
  const isComplete = instance.status === 'completed';

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserMinus className="h-8 w-8" />
            Offboarding Checklist
          </h1>
          <p className="text-muted-foreground">Complete these tasks before your last working day</p>
        </div>

        {/* Last Working Date Card */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Working Date</p>
                  <p className="text-2xl font-bold">{format(new Date(instance.last_working_date), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold">
                  {Math.max(0, differenceInDays(new Date(instance.last_working_date), new Date()))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-primary">{progress.percentage}%</div>
                  <div>
                    <p className="font-medium">
                      {isComplete ? 'Offboarding Complete' : 'Tasks Progress'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {progress.completed} of {progress.total} tasks completed
                    </p>
                  </div>
                </div>
                <Progress value={progress.percentage} className="h-3" />
              </div>
              {isComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-8 w-8" />
                  <span className="text-lg font-semibold">All Done!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Manager Info */}
        {instance.manager && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Manager</p>
                  <p className="font-semibold">{(instance.manager as any)?.full_name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Your Tasks
            </CardTitle>
            <CardDescription>Tasks you need to complete before leaving</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No tasks assigned to you</p>
              ) : (
                myTasks.map(task => {
                  const status = getTaskStatus(task);
                  const isCompleted = task.status === 'completed';
                  
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                        isCompleted ? 'bg-muted/30' : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => !isCompleted && handleTaskComplete(task)}
                        disabled={isCompleted || instance.status !== 'in_progress'}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getTaskIcon(task.task_type)}
                            <span className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {task.name}
                            </span>
                            {task.is_required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 ml-7">{task.description}</p>
                        )}
                        {task.due_date && !isCompleted && (
                          <p className={`text-sm mt-2 ml-7 flex items-center gap-1 ${
                            isPast(new Date(task.due_date)) ? 'text-destructive' : 'text-muted-foreground'
                          }`}>
                            <Clock className="h-3 w-3" />
                            {getDaysRemaining(task.due_date)}
                          </p>
                        )}
                      </div>
                      {task.task_type === 'document' && !isCompleted && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Other Tasks */}
        {otherTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tasks for Others
              </CardTitle>
              <CardDescription>Tasks being handled by HR, IT, or your manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {otherTasks.map(task => {
                  const status = getTaskStatus(task);
                  const isCompleted = task.status === 'completed';
                  
                  return (
                    <div 
                      key={task.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${
                        isCompleted ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        isCompleted ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                      }`}>
                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              {getTaskIcon(task.task_type)}
                              <span className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {task.name}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 ml-7">
                              Assigned to: <span className="capitalize">{task.assigned_to?.full_name || task.assigned_to_type}</span>
                            </p>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
