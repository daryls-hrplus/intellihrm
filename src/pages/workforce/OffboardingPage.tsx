import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
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
  Key,
  BookOpen,
  MessageSquare,
  Package,
  User,
  BarChart3,
  UserMinus
} from 'lucide-react';
import { useOffboarding, OffboardingTemplate, OffboardingTemplateTask, OffboardingInstance } from '@/hooks/useOffboarding';
import { OffboardingAnalytics } from '@/components/admin/OffboardingAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getTodayString, formatDateForDisplay } from '@/utils/dateUtils';

export default function OffboardingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
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
    getOffboardingProgress
  } = useOffboarding();

  const [activeTab, setActiveTab] = useState('instances');
  const [templates, setTemplates] = useState<OffboardingTemplate[]>([]);
  const [instances, setInstances] = useState<OffboardingInstance[]>([]);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string; email: string }[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Template Dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OffboardingTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    company_id: '',
    is_active: true,
    start_date: getTodayString(),
    end_date: '',
  });

  // Task Dialog
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateTasks, setTemplateTasks] = useState<Record<string, OffboardingTemplateTask[]>>({});
  const [editingTask, setEditingTask] = useState<OffboardingTemplateTask | null>(null);
  const [taskForm, setTaskForm] = useState<{
    name: string;
    description: string;
    task_type: 'general' | 'document' | 'equipment' | 'access' | 'knowledge_transfer' | 'exit_interview';
    is_required: boolean;
    due_days_before: number;
    assigned_to_type: 'employee' | 'manager' | 'hr' | 'it';
  }>({
    name: '',
    description: '',
    task_type: 'general',
    is_required: true,
    due_days_before: 0,
    assigned_to_type: 'hr',
  });

  // Instance Dialog
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [instanceForm, setInstanceForm] = useState({
    employee_id: '',
    template_id: '',
    company_id: '',
    manager_id: '',
    last_working_date: '',
    termination_reason: '',
    notes: '',
  });

  // Expanded templates
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  
  // Instance progress
  const [instanceProgress, setInstanceProgress] = useState<Record<string, { total: number; completed: number; percentage: number }>>({});

  const breadcrumbItems = [
    { label: t('common.home'), path: '/' },
    { label: t('navigation.workforce'), path: '/workforce' },
    { label: t('workforce.offboarding.title') },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadInstances();
  }, [selectedCompany, selectedStatus]);

  const loadData = async () => {
    const [templatesData, companiesData, employeesData] = await Promise.all([
      fetchTemplates(),
      supabase.from('companies').select('id, name').eq('is_active', true).order('name'),
      supabase.from('profiles').select('id, full_name, email').order('full_name'),
    ]);

    setTemplates(templatesData);
    setCompanies(companiesData.data || []);
    setEmployees((employeesData.data || []) as any);
    
    await loadInstances();
  };

  const loadInstances = async () => {
    const filters: any = {};
    if (selectedCompany !== 'all') filters.companyId = selectedCompany;
    if (selectedStatus !== 'all') filters.status = selectedStatus;
    
    const instancesData = await fetchInstances(filters);
    setInstances(instancesData);

    const progressData: Record<string, any> = {};
    for (const instance of instancesData) {
      progressData[instance.id] = await getOffboardingProgress(instance.id);
    }
    setInstanceProgress(progressData);
  };

  const handleTemplateSubmit = async () => {
    if (!templateForm.name || !templateForm.company_id) {
      toast.error(t('common.fillRequired'));
      return;
    }

    const data = {
      ...templateForm,
      end_date: templateForm.end_date || null,
    };

    let result;
    if (editingTemplate) {
      result = await updateTemplate(editingTemplate.id, data);
    } else {
      result = await createTemplate(data);
    }

    if (result) {
      toast.success(editingTemplate ? t('workforce.offboarding.templateUpdated') : t('workforce.offboarding.templateCreated'));
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      resetTemplateForm();
      loadData();
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (await deleteTemplate(id)) {
      toast.success(t('workforce.offboarding.templateDeleted'));
      loadData();
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskForm.name || !selectedTemplateId) {
      toast.error(t('common.fillRequired'));
      return;
    }

    const data = {
      ...taskForm,
      template_id: selectedTemplateId,
      display_order: templateTasks[selectedTemplateId]?.length || 0,
    };

    let result;
    if (editingTask) {
      result = await updateTemplateTask(editingTask.id, data);
    } else {
      result = await createTemplateTask(data);
    }

    if (result) {
      toast.success(editingTask ? t('workforce.offboarding.taskUpdated') : t('workforce.offboarding.taskCreated'));
      setTaskDialogOpen(false);
      setEditingTask(null);
      resetTaskForm();
      loadTemplateTasks(selectedTemplateId);
    }
  };

  const handleDeleteTask = async (id: string, templateId: string) => {
    if (await deleteTemplateTask(id)) {
      toast.success(t('workforce.offboarding.taskDeleted'));
      loadTemplateTasks(templateId);
    }
  };

  const handleInstanceSubmit = async () => {
    if (!instanceForm.employee_id || !instanceForm.template_id || !instanceForm.company_id || !instanceForm.last_working_date) {
      toast.error(t('common.fillRequired'));
      return;
    }

    const data = {
      ...instanceForm,
      manager_id: instanceForm.manager_id && instanceForm.manager_id !== 'none' ? instanceForm.manager_id : null,
      termination_reason: instanceForm.termination_reason || null,
      notes: instanceForm.notes || null,
    };

    const result = await createInstance(data);
    if (result) {
      toast.success(t('workforce.offboarding.offboardingStarted'));
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
      due_days_before: 0,
      assigned_to_type: 'hr',
    });
  };

  const resetInstanceForm = () => {
    setInstanceForm({
      employee_id: '',
      template_id: '',
      company_id: '',
      manager_id: '',
      last_working_date: '',
      termination_reason: '',
      notes: '',
    });
  };

  const openEditTemplate = (template: OffboardingTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description || '',
      company_id: template.company_id,
      is_active: template.is_active,
      start_date: template.start_date,
      end_date: template.end_date || '',
    });
    setTemplateDialogOpen(true);
  };

  const openAddTask = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditingTask(null);
    resetTaskForm();
    setTaskDialogOpen(true);
  };

  const openEditTask = (task: OffboardingTemplateTask) => {
    setSelectedTemplateId(task.template_id);
    setEditingTask(task);
    setTaskForm({
      name: task.name,
      description: task.description || '',
      task_type: task.task_type,
      is_required: task.is_required,
      due_days_before: task.due_days_before,
      assigned_to_type: task.assigned_to_type,
    });
    setTaskDialogOpen(true);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'equipment': return <Package className="h-4 w-4" />;
      case 'access': return <Key className="h-4 w-4" />;
      case 'knowledge_transfer': return <BookOpen className="h-4 w-4" />;
      case 'exit_interview': return <MessageSquare className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">{t('common.completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('common.cancelled')}</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/30">{t('common.inProgress')}</Badge>;
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserMinus className="h-8 w-8" />
              {t('workforce.offboarding.title')}
            </h1>
            <p className="text-muted-foreground">{t('workforce.offboarding.subtitle')}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="instances">{t('workforce.offboarding.activeOffboarding')}</TabsTrigger>
            <TabsTrigger value="templates">{t('common.templates')}</TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('common.analytics')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="instances" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('workforce.offboarding.searchEmployees')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('workforce.allCompanies')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('workforce.allCompanies')}</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('common.allStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.allStatus')}</SelectItem>
                    <SelectItem value="in_progress">{t('common.inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('common.completed')}</SelectItem>
                    <SelectItem value="cancelled">{t('common.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setInstanceDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('workforce.offboarding.startOffboarding')}
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredInstances.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {t('workforce.offboarding.noRecordsFound')}
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/workforce/offboarding/${instance.id}`)}
                          >
                            {t('common.viewDetails')}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{t('common.template')}</p>
                          <p className="font-medium">{instance.offboarding_templates?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('workforce.offboarding.lastWorkingDate')}</p>
                          <p className="font-medium">{formatDateForDisplay(instance.last_working_date, 'MMM dd, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('common.reason')}</p>
                          <p className="font-medium">{instance.termination_reason || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t('common.progress')}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={instanceProgress[instance.id]?.percentage || 0} className="h-2 flex-1" />
                            <span className="text-sm font-medium">
                              {instanceProgress[instance.id]?.percentage || 0}%
                            </span>
                          </div>
                        </div>
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
                  placeholder={t('workforce.offboarding.searchTemplates')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => { resetTemplateForm(); setEditingTemplate(null); setTemplateDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                {t('workforce.offboarding.createTemplate')}
              </Button>
            </div>

            <div className="space-y-2">
              {filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    {t('workforce.offboarding.noTemplatesFound')}
                  </CardContent>
                </Card>
              ) : (
                filteredTemplates.map(template => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-2 cursor-pointer flex-1"
                          onClick={() => toggleTemplateExpand(template.id)}
                        >
                          {expandedTemplates.has(template.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>
                              {template.companies?.name} • {template.description || t('common.noDescription')}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? t('common.active') : t('common.inactive')}
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
                                {t('common.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAddTask(template.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                {t('workforce.offboarding.addTask')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('common.delete')}
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
                                <TableHead>{t('common.task')}</TableHead>
                                <TableHead>{t('common.type')}</TableHead>
                                <TableHead>{t('workforce.offboarding.daysBefore')}</TableHead>
                                <TableHead>{t('workforce.offboarding.assignedTo')}</TableHead>
                                <TableHead>{t('common.required')}</TableHead>
                                <TableHead className="w-12"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(templateTasks[template.id] || []).length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    {t('workforce.offboarding.noTasksDefined')}
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
                                      <div className="flex items-center gap-2">
                                        {getTaskTypeIcon(task.task_type)}
                                        <span className="capitalize">{task.task_type.replace('_', ' ')}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>{task.due_days_before} days</TableCell>
                                    <TableCell className="capitalize">{task.assigned_to_type}</TableCell>
                                    <TableCell>
                                      <Badge variant={task.is_required ? 'default' : 'outline'}>
                                        {task.is_required ? t('common.required') : t('common.optional')}
                                      </Badge>
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
                                            {t('common.edit')}
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            className="text-destructive"
                                            onClick={() => handleDeleteTask(task.id, template.id)}
                                          >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            {t('common.delete')}
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
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <OffboardingAnalytics companyId={selectedCompany} />
          </TabsContent>
        </Tabs>

        {/* Template Dialog */}
        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTemplate ? t('workforce.offboarding.editTemplate') : t('workforce.offboarding.createTemplate')}</DialogTitle>
              <DialogDescription>
                {editingTemplate ? t('workforce.offboarding.updateTemplateDetails') : t('workforce.offboarding.createTemplateDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('workforce.offboarding.templateName')} *</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('workforce.offboarding.templateNamePlaceholder')}
                />
              </div>
              <div>
                <Label>{t('common.description')}</Label>
                <Textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('workforce.offboarding.templateDescriptionPlaceholder')}
                />
              </div>
              <div>
                <Label>{t('common.company')} *</Label>
                <Select 
                  value={templateForm.company_id} 
                  onValueChange={(v) => setTemplateForm(prev => ({ ...prev, company_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectCompany')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('common.startDate')}</Label>
                  <Input
                    type="date"
                    value={templateForm.start_date}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>{t('common.endDate')}</Label>
                  <Input
                    type="date"
                    value={templateForm.end_date}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleTemplateSubmit} disabled={isLoading}>
                {editingTemplate ? t('common.update') : t('common.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Task Dialog */}
        <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? t('workforce.offboarding.editTask') : t('workforce.offboarding.addOffboardingTask')}</DialogTitle>
              <DialogDescription>
                {editingTask ? t('workforce.offboarding.updateTaskDetails') : t('workforce.offboarding.addTaskDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('workforce.offboarding.taskName')} *</Label>
                <Input
                  value={taskForm.name}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('workforce.offboarding.taskNamePlaceholder')}
                />
              </div>
              <div>
                <Label>{t('common.description')}</Label>
                <Textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('workforce.offboarding.taskDescriptionPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('workforce.offboarding.taskType')}</Label>
                  <Select 
                    value={taskForm.task_type} 
                    onValueChange={(v: any) => setTaskForm(prev => ({ ...prev, task_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">{t('workforce.offboarding.taskTypes.general')}</SelectItem>
                      <SelectItem value="document">{t('workforce.offboarding.taskTypes.document')}</SelectItem>
                      <SelectItem value="equipment">{t('workforce.offboarding.taskTypes.equipment')}</SelectItem>
                      <SelectItem value="access">{t('workforce.offboarding.taskTypes.accessRevocation')}</SelectItem>
                      <SelectItem value="knowledge_transfer">{t('workforce.offboarding.taskTypes.knowledgeTransfer')}</SelectItem>
                      <SelectItem value="exit_interview">{t('workforce.offboarding.taskTypes.exitInterview')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('workforce.offboarding.assignedTo')}</Label>
                  <Select 
                    value={taskForm.assigned_to_type} 
                    onValueChange={(v: any) => setTaskForm(prev => ({ ...prev, assigned_to_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">{t('common.employee')}</SelectItem>
                      <SelectItem value="manager">{t('common.manager')}</SelectItem>
                      <SelectItem value="hr">{t('common.hr')}</SelectItem>
                      <SelectItem value="it">{t('common.it')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('workforce.offboarding.daysBeforeLastDate')}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={taskForm.due_days_before}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, due_days_before: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={taskForm.is_required}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, is_required: e.target.checked }))}
                      className="rounded"
                    />
                    <span>{t('workforce.offboarding.requiredTask')}</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleTaskSubmit} disabled={isLoading}>
                {editingTask ? t('common.update') : t('workforce.offboarding.addTask')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instance Dialog */}
        <Dialog open={instanceDialogOpen} onOpenChange={setInstanceDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('workforce.offboarding.startOffboarding')}</DialogTitle>
              <DialogDescription>
                {t('workforce.offboarding.startOffboardingDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('common.employee')} *</Label>
                <Select 
                  value={instanceForm.employee_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, employee_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectEmployee')} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('common.company')} *</Label>
                <Select 
                  value={instanceForm.company_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, company_id: v, template_id: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectCompany')} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('workforce.offboarding.offboardingTemplate')} *</Label>
                <Select 
                  value={instanceForm.template_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, template_id: v }))}
                  disabled={!instanceForm.company_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectTemplate')} />
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
                <Label>{t('common.manager')}</Label>
                <Select 
                  value={instanceForm.manager_id} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, manager_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('workforce.offboarding.selectManagerOptional')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('workforce.offboarding.noManagerAssigned')}</SelectItem>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('workforce.offboarding.lastWorkingDate')} *</Label>
                <Input
                  type="date"
                  value={instanceForm.last_working_date}
                  onChange={(e) => setInstanceForm(prev => ({ ...prev, last_working_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>{t('workforce.offboarding.terminationReason')}</Label>
                <Select 
                  value={instanceForm.termination_reason} 
                  onValueChange={(v) => setInstanceForm(prev => ({ ...prev, termination_reason: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.selectReason')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resignation">{t('workforce.offboarding.reasons.resignation')}</SelectItem>
                    <SelectItem value="retirement">{t('workforce.offboarding.reasons.retirement')}</SelectItem>
                    <SelectItem value="termination">{t('workforce.offboarding.reasons.termination')}</SelectItem>
                    <SelectItem value="layoff">{t('workforce.offboarding.reasons.layoff')}</SelectItem>
                    <SelectItem value="contract_end">{t('workforce.offboarding.reasons.contractEnd')}</SelectItem>
                    <SelectItem value="other">{t('common.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('common.notes')}</Label>
                <Textarea
                  value={instanceForm.notes}
                  onChange={(e) => setInstanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('workforce.offboarding.notesPlaceholder')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInstanceDialogOpen(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleInstanceSubmit} disabled={isLoading}>
                {t('workforce.offboarding.startOffboarding')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
