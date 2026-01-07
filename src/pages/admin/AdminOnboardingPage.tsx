import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Users, 
  FileText, 
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Package,
  User,
  BarChart3
} from 'lucide-react';
import { OnboardingAnalytics } from '@/components/admin/OnboardingAnalytics';
import { useOnboarding, OnboardingTemplate, OnboardingTemplateTask, OnboardingInstance } from '@/hooks/useOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getTodayString, formatDateForDisplay } from '@/utils/dateUtils';
import { usePageAudit } from "@/hooks/usePageAudit";

export default function AdminOnboardingPage() {
  usePageAudit('onboarding_templates', 'Admin');
  const { t } = useTranslation();
  const { 
    isLoading, 
    fetchTemplates, 
    createTemplate, 
    updateTemplate, 
    deleteTemplate,
    fetchTemplateTasks,
    createTemplateTask,
    updateTemplateTask,
    deleteTemplateTask,
    fetchInstances,
    createInstance,
    updateInstance,
    fetchTasks,
    getOnboardingProgress
  } = useOnboarding();

  const [activeTab, setActiveTab] = useState('instances');
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [instances, setInstances] = useState<OnboardingInstance[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Template Dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OnboardingTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<{
    name: string;
    description: string;
    company_id: string;
    job_id: string;
    is_active: boolean;
    start_date: string;
    end_date: string;
  }>({
    name: '',
    description: '',
    company_id: '',
    job_id: '',
    is_active: true,
    start_date: getTodayString(),
    end_date: '',
  });

  // Task Dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateTasks, setTemplateTasks] = useState<Record<string, OnboardingTemplateTask[]>>({});
  const [editingTask, setEditingTask] = useState<OnboardingTemplateTask | null>(null);
  const [taskForm, setTaskForm] = useState<{
    name: string;
    description: string;
    task_type: 'document' | 'equipment' | 'general' | 'training';
    is_required: boolean;
    due_days: number;
    assigned_to_type: 'employee' | 'manager' | 'hr' | 'buddy';
    training_course_id: string;
  }>({
    name: '',
    description: '',
    task_type: 'general',
    is_required: true,
    due_days: 7,
    assigned_to_type: 'employee',
    training_course_id: '',
  });

  // Instance Dialog
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [instanceForm, setInstanceForm] = useState({
    employee_id: '',
    template_id: '',
    company_id: '',
    buddy_id: '',
    manager_id: '',
    start_date: getTodayString(),
    target_completion_date: '',
    notes: '',
  });

  // Expanded templates
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  
  // Instance progress
  const [instanceProgress, setInstanceProgress] = useState<Record<string, { total: number; completed: number; percentage: number }>>({});

  const breadcrumbItems = [
    { label: t('common.home'), path: '/' },
    { label: 'Workforce', path: '/workforce' },
    { label: 'Employee Onboarding' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadInstances();
  }, [selectedCompany, selectedStatus]);

  const loadData = async () => {
    const [templatesData, companiesData, employeesData, coursesData] = await Promise.all([
      fetchTemplates(),
      supabase.from('companies').select('id, name').eq('is_active', true).order('name'),
      supabase.from('profiles').select('id, full_name, email').order('full_name'),
      supabase.from('lms_courses' as any).select('id, title').eq('is_active', true).order('title'),
    ]);

    setTemplates(templatesData);
    setCompanies(companiesData.data || []);
    setEmployees((employeesData.data || []) as any);
    setCourses((coursesData.data || []) as any);
    
    await loadInstances();
  };

  const loadInstances = async () => {
    const filters: any = {};
    if (selectedCompany !== 'all') filters.companyId = selectedCompany;
    if (selectedStatus !== 'all') filters.status = selectedStatus;
    
    const instancesData = await fetchInstances(filters);
    setInstances(instancesData);

    // Load progress for each instance
    const progressData: Record<string, any> = {};
    for (const instance of instancesData) {
      progressData[instance.id] = await getOnboardingProgress(instance.id);
    }
    setInstanceProgress(progressData);
  };

  const loadJobs = async (companyId: string) => {
    const { data } = await supabase
      .from('jobs')
      .select('id, name, code')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    setJobs((data || []).map(j => ({ id: j.id, title: j.name || j.code || 'Untitled' })));
  };

  const handleTemplateSubmit = async () => {
    if (!templateForm.name || !templateForm.company_id) {
      toast.error('Please fill in required fields');
      return;
    }

    const data = {
      ...templateForm,
      job_id: templateForm.job_id && templateForm.job_id !== 'none' ? templateForm.job_id : null,
      end_date: templateForm.end_date || null,
    };

    let result;
    if (editingTemplate) {
      result = await updateTemplate(editingTemplate.id, data);
    } else {
      result = await createTemplate(data);
    }

    if (result) {
      toast.success(editingTemplate ? 'Template updated' : 'Template created');
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
      loadData();
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (await deleteTemplate(id)) {
      toast.success('Template deleted');
      loadData();
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskForm.name || !selectedTemplateId) {
      toast.error('Please fill in required fields');
      return;
    }

    const data = {
      ...taskForm,
      template_id: selectedTemplateId,
      training_course_id: taskForm.training_course_id || null,
      display_order: templateTasks[selectedTemplateId]?.length || 0,
    };

    let result;
    if (editingTask) {
      result = await updateTemplateTask(editingTask.id, data);
    } else {
      result = await createTemplateTask(data);
    }

    if (result) {
      toast.success(editingTask ? 'Task updated' : 'Task created');
      setTaskDialogOpen(false);
      setEditingTask(null);
      resetTaskForm();
      loadTemplateTasks(selectedTemplateId);
    }
  };

  const handleDeleteTask = async (id: string, templateId: string) => {
    if (await deleteTemplateTask(id)) {
      toast.success('Task deleted');
      loadTemplateTasks(templateId);
    }
  };

  const handleInstanceSubmit = async () => {
    if (!instanceForm.employee_id || !instanceForm.template_id || !instanceForm.company_id) {
      toast.error('Please fill in required fields');
      return;
    }

    const data = {
      ...instanceForm,
      buddy_id: instanceForm.buddy_id && instanceForm.buddy_id !== 'none' ? instanceForm.buddy_id : null,
      manager_id: instanceForm.manager_id && instanceForm.manager_id !== 'none' ? instanceForm.manager_id : null,
      target_completion_date: instanceForm.target_completion_date || null,
      notes: instanceForm.notes || null,
    };

    const result = await createInstance(data);
    if (result) {
      toast.success('Onboarding started for employee');
      setInstanceDialogOpen(false);
      resetInstanceForm();
      loadInstances();
    }
  };

  const loadTemplateTasks = async (templateId: string) => {
    const tasks = await fetchTemplateTasks(templateId);
    setTemplateTasks(prev => ({ ...prev, [templateId]: tasks }));
  };

  const toggleTemplateExpand = (templateId: string) => {
    const newExpanded = new Set(expandedTemplates);
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId);
    } else {
      newExpanded.add(templateId);
      if (!templateTasks[templateId]) {
        loadTemplateTasks(templateId);
      }
    }
    setExpandedTemplates(newExpanded);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      company_id: '',
      job_id: '',
      is_active: true,
      start_date: getTodayString(),
      end_date: '',
    });
  };

  const resetTaskForm = () => {
    setTaskForm({
      name: '',
      description: '',
      task_type: 'general',
      is_required: true,
      due_days: 7,
      assigned_to_type: 'employee',
      training_course_id: '',
    });
  };

  const resetInstanceForm = () => {
    setInstanceForm({
      employee_id: '',
      template_id: '',
      company_id: '',
      buddy_id: '',
      manager_id: '',
      start_date: getTodayString(),
      target_completion_date: '',
      notes: '',
    });
  };

  const openEditTemplate = (template: OnboardingTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      company_id: template.company_id,
      job_id: template.job_id || '',
      is_active: template.is_active,
      start_date: template.start_date,
      end_date: template.end_date || '',
    });
    loadJobs(template.company_id);
    setTemplateDialogOpen(true);
  };

  const openAddTask = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditingTask(null);
    resetTaskForm();
    setTaskDialogOpen(true);
  };

  const openEditTask = (task: OnboardingTemplateTask) => {
    setSelectedTemplateId(task.template_id);
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description || '',
      task_type: task.task_type,
      is_required: task.is_required,
      due_days: task.due_days,
      assigned_to_type: task.assigned_to_type,
      training_course_id: task.training_course_id || '',
    });
    setTaskDialogOpen(true);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'training': return <GraduationCap className="h-4 w-4" />;
      case 'equipment': return <Package className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">In Progress</Badge>;
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstances = instances.filter(i =>
    i.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Employee Onboarding</h1>
            <p className="text-muted-foreground">Manage onboarding templates and track new employee progress</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="instances">Active Onboarding</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setInstanceDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start Onboarding
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredInstances.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No onboarding records found
                  </CardContent>
                </Card>
              ) : (
                filteredInstances.map(instance => (
                  <Card key={instance.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            {instance.profiles?.full_name}
                          </CardTitle>
                          <CardDescription>
                            {instance.profiles?.email} • {instance.companies?.name}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(instance.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.location.href = `/workforce/onboarding/${instance.id}`}>
                                View Details
                              </DropdownMenuItem>
                              {instance.status === 'in_progress' && (
                                <DropdownMenuItem 
                                  onClick={async () => {
                                    await updateInstance(instance.id, { status: 'cancelled' });
                                    loadInstances();
                                  }}
                                >
                                  Cancel Onboarding
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Template</p>
                          <p className="font-medium">{instance.onboarding_templates?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formatDateForDisplay(instance.start_date, 'MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Manager</p>
                          <p className="font-medium">{instance.manager?.full_name || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Buddy</p>
                          <p className="font-medium">{instance.buddy?.full_name || '-'}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>
                            {instanceProgress[instance.id]?.completed || 0} / {instanceProgress[instance.id]?.total || 0} tasks
                          </span>
                        </div>
                        <Progress value={instanceProgress[instance.id]?.percentage || 0} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => {
                setEditingTemplate(null);
                resetTemplateForm();
                setTemplateDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="space-y-4">
              {filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No templates found. Create one to get started.
                  </CardContent>
                </Card>
              ) : (
                filteredTemplates.map(template => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => toggleTemplateExpand(template.id)}
                        >
                          {expandedTemplates.has(template.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <div>
                            <CardTitle>{template.name}</CardTitle>
                            <CardDescription>
                              {template.companies?.name}
                              {template.jobs?.title && ` • ${template.jobs.title}`}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditTemplate(template)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAddTask(template.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    {expandedTemplates.has(template.id) && (
                      <CardContent>
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Due (Days)</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Required</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(templateTasks[template.id] || []).length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    No tasks defined. Add tasks to this template.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                (templateTasks[template.id] || []).map(task => (
                                  <TableRow key={task.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{task.name}</p>
                                        {task.description && (
                                          <p className="text-sm text-muted-foreground">{task.description}</p>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        {getTaskTypeIcon(task.task_type)}
                                        <span className="capitalize">{task.task_type}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{task.due_days}</TableCell>
                                    <TableCell className="capitalize">{task.assigned_to_type}</TableCell>
                                    <TableCell>
                                      {task.is_required ? (
                                        <Badge variant="outline">Required</Badge>
                                      ) : (
                                        <span className="text-muted-foreground">Optional</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => openEditTask(task)}>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={() => handleDeleteTask(task.id, template.id)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="mt-4">
                          <Button variant="outline" size="sm" onClick={() => openAddTask(template.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <OnboardingAnalytics companyId={selectedCompany} />
          </TabsContent>
        </Tabs>

        {/* Template Dialog */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
              <DialogDescription>
                Define an onboarding template with tasks for new employees.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Template Name *</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Software Developer Onboarding"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this onboarding template"
                />
              </div>
              <div>
                <Label>Company *</Label>
                <Select 
                  value={templateForm.company_id} 
                  onValueChange={(v) => {
                    setTemplateForm(prev => ({ ...prev, company_id: v, job_id: '' }));
                    loadJobs(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job (Optional)</Label>
                <Select 
                  value={templateForm.job_id} 
                  onValueChange={(v) => setTemplateForm(prev => ({ ...prev, job_id: v }))}
                  disabled={!templateForm.company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific job</SelectItem>
                    {jobs.map(j => (
                      <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={templateForm.start_date}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="date"
                    value={templateForm.end_date}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleTemplateSubmit} disabled={isLoading}>
                {editingTemplate ? 'Save' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Dialog */}
        <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
              <DialogDescription>
                Define a task for this onboarding template.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Task Name *</Label>
                <Input
                  value={taskForm.name}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Complete company policy training"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed instructions for this task"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Task Type</Label>
                  <Select 
                    value={taskForm.task_type} 
                    onValueChange={(v: any) => setTaskForm(prev => ({ ...prev, task_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned To</Label>
                  <Select 
                    value={taskForm.assigned_to_type} 
                    onValueChange={(v: any) => setTaskForm(prev => ({ ...prev, assigned_to_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="buddy">Buddy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Due (Days from Start)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={taskForm.due_days}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_days: parseInt(e.target.value) || 7 }))}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={taskForm.is_required}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, is_required: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Required task</span>
                  </label>
                </div>
              </div>
              {taskForm.task_type === 'training' && (
                <div>
                  <Label>Training Course</Label>
                  <Select 
                    value={taskForm.training_course_id} 
                    onValueChange={(v) => setTaskForm(prev => ({ ...prev, training_course_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleTaskSubmit} disabled={isLoading}>
                {editingTask ? 'Save' : 'Add'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instance Dialog */}
        <Dialog open={instanceDialogOpen} onOpenChange={setInstanceDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Start Employee Onboarding</DialogTitle>
              <DialogDescription>
                Begin the onboarding process for a new employee.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Employee *</Label>
                <Select 
                  value={instanceForm.employee_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, employee_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name} ({e.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Company *</Label>
                <Select 
                  value={instanceForm.company_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, company_id: v, template_id: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Onboarding Template *</Label>
                <Select 
                  value={instanceForm.template_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, template_id: v }))}
                  disabled={!instanceForm.company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter(t => t.company_id === instanceForm.company_id && t.is_active)
                      .map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Manager</Label>
                <Select 
                  value={instanceForm.manager_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, manager_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No manager assigned</SelectItem>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Buddy/Mentor</Label>
                <Select 
                  value={instanceForm.buddy_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, buddy_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select buddy (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No buddy assigned</SelectItem>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={instanceForm.start_date}
                    onChange={(e) => setInstanceForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Target Completion</Label>
                  <Input
                    type="date"
                    value={instanceForm.target_completion_date}
                    onChange={(e) => setInstanceForm(prev => ({ ...prev, target_completion_date: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={instanceForm.notes}
                  onChange={(e) => setInstanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes for this onboarding"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInstanceDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleInstanceSubmit} disabled={isLoading}>
                Start Onboarding
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
