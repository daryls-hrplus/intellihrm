import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2,
  Clock,
  Users,
  FolderKanban,
  Building2,
  DollarSign,
  CheckCircle,
  Send
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Client {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

interface Project {
  id: string;
  company_id: string;
  client_id: string | null;
  name: string;
  code: string;
  description: string | null;
  status: string;
  budget_hours: number | null;
  billable: boolean;
  hourly_rate: number | null;
  is_active: boolean;
  client?: { name: string } | null;
}

interface Task {
  id: string;
  project_id: string;
  name: string;
  code: string | null;
  status: string;
  estimated_hours: number | null;
  billable: boolean;
  is_active: boolean;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  project_id: string;
  task_id: string | null;
  entry_date: string;
  hours: number;
  description: string | null;
  billable: boolean;
  status: string;
  project?: { name: string; code: string } | null;
  task?: { name: string } | null;
  profile?: { full_name: string } | null;
}

export default function ProjectTimeTrackingPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timesheet");
  
  // Clients
  const [clients, setClients] = useState<Client[]>([]);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    code: "",
    description: "",
    contact_name: "",
    contact_email: "",
    is_active: true
  });
  
  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    client_id: "",
    name: "",
    code: "",
    description: "",
    status: "active",
    budget_hours: "",
    billable: true,
    hourly_rate: ""
  });
  
  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [taskForm, setTaskForm] = useState({
    name: "",
    code: "",
    estimated_hours: "",
    billable: true
  });
  
  // Time Entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [timeEntryDialogOpen, setTimeEntryDialogOpen] = useState(false);
  const [timeEntryForm, setTimeEntryForm] = useState({
    project_id: "",
    task_id: "",
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    hours: "",
    description: "",
    billable: true
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadAllData();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error("Failed to load companies");
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadAllData = async () => {
    await Promise.all([
      loadClients(),
      loadProjects(),
      loadTimeEntries()
    ]);
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('project_clients')
      .select('*')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (!error) setClients(data || []);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, client:project_clients(name)')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (!error) setProjects(data || []);
  };

  const loadTasks = async (projectId: string) => {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order');
    
    if (!error) setTasks(data || []);
  };

const loadTimeEntries = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data, error } = await supabase
      .from('project_time_entries')
      .select('*, project:projects(name, code), task:project_tasks(name)')
      .eq('company_id', selectedCompany)
      .eq('employee_id', user.user.id)
      .order('entry_date', { ascending: false })
      .limit(100);
    
    if (!error) setTimeEntries(data as TimeEntry[] || []);
  };

  // Client CRUD
  const handleSaveClient = async () => {
    if (!clientForm.name || !clientForm.code) {
      toast.error("Name and code are required");
      return;
    }

    const { error } = await supabase.from('project_clients').insert({
      company_id: selectedCompany,
      name: clientForm.name,
      code: clientForm.code,
      description: clientForm.description || null,
      contact_name: clientForm.contact_name || null,
      contact_email: clientForm.contact_email || null,
      is_active: clientForm.is_active
    });

    if (error) {
      toast.error("Failed to save client");
      console.error(error);
      return;
    }

    toast.success("Client created");
    setClientDialogOpen(false);
    setClientForm({ name: "", code: "", description: "", contact_name: "", contact_email: "", is_active: true });
    loadClients();
  };

  const handleDeleteClient = async (id: string) => {
    const { error } = await supabase.from('project_clients').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete client");
      return;
    }
    toast.success("Client deleted");
    loadClients();
  };

  // Project CRUD
  const handleSaveProject = async () => {
    if (!projectForm.name || !projectForm.code) {
      toast.error("Name and code are required");
      return;
    }

    const { error } = await supabase.from('projects').insert({
      company_id: selectedCompany,
      client_id: projectForm.client_id || null,
      name: projectForm.name,
      code: projectForm.code,
      description: projectForm.description || null,
      status: projectForm.status,
      budget_hours: projectForm.budget_hours ? parseFloat(projectForm.budget_hours) : null,
      billable: projectForm.billable,
      hourly_rate: projectForm.hourly_rate ? parseFloat(projectForm.hourly_rate) : null
    });

    if (error) {
      toast.error("Failed to save project");
      console.error(error);
      return;
    }

    toast.success("Project created");
    setProjectDialogOpen(false);
    setProjectForm({ client_id: "", name: "", code: "", description: "", status: "active", budget_hours: "", billable: true, hourly_rate: "" });
    loadProjects();
  };

  const handleDeleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete project");
      return;
    }
    toast.success("Project deleted");
    loadProjects();
  };

  // Task CRUD
  const handleSaveTask = async () => {
    if (!taskForm.name || !selectedProject) {
      toast.error("Task name and project are required");
      return;
    }

    const { error } = await supabase.from('project_tasks').insert({
      project_id: selectedProject,
      name: taskForm.name,
      code: taskForm.code || null,
      estimated_hours: taskForm.estimated_hours ? parseFloat(taskForm.estimated_hours) : null,
      billable: taskForm.billable
    });

    if (error) {
      toast.error("Failed to save task");
      console.error(error);
      return;
    }

    toast.success("Task created");
    setTaskDialogOpen(false);
    setTaskForm({ name: "", code: "", estimated_hours: "", billable: true });
    loadTasks(selectedProject);
  };

  const handleDeleteTask = async (id: string) => {
    const { error } = await supabase.from('project_tasks').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete task");
      return;
    }
    toast.success("Task deleted");
    if (selectedProject) loadTasks(selectedProject);
  };

  // Time Entry CRUD
  const handleSaveTimeEntry = async () => {
    if (!timeEntryForm.project_id || !timeEntryForm.hours || !timeEntryForm.entry_date) {
      toast.error("Project, date and hours are required");
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      toast.error("You must be logged in");
      return;
    }

    const { error } = await supabase.from('project_time_entries').insert({
      company_id: selectedCompany,
      employee_id: user.user.id,
      project_id: timeEntryForm.project_id,
      task_id: timeEntryForm.task_id || null,
      entry_date: timeEntryForm.entry_date,
      hours: parseFloat(timeEntryForm.hours),
      description: timeEntryForm.description || null,
      billable: timeEntryForm.billable,
      status: 'draft'
    });

    if (error) {
      toast.error("Failed to save time entry");
      console.error(error);
      return;
    }

    toast.success("Time entry created");
    setTimeEntryDialogOpen(false);
    setTimeEntryForm({ project_id: "", task_id: "", entry_date: format(new Date(), 'yyyy-MM-dd'), hours: "", description: "", billable: true });
    loadTimeEntries();
  };

  const handleSubmitTimeEntry = async (id: string) => {
    const { error } = await supabase
      .from('project_time_entries')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast.error("Failed to submit");
      return;
    }
    toast.success("Time entry submitted");
    loadTimeEntries();
  };

  const handleDeleteTimeEntry = async (id: string) => {
    const { error } = await supabase.from('project_time_entries').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Deleted");
    loadTimeEntries();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'submitted': return <Badge className="bg-warning/20 text-warning">Submitted</Badge>;
      case 'approved': return <Badge className="bg-success/20 text-success">Approved</Badge>;
      case 'rejected': return <Badge className="bg-destructive/20 text-destructive">Rejected</Badge>;
      case 'active': return <Badge className="bg-success/20 text-success">Active</Badge>;
      case 'on_hold': return <Badge className="bg-warning/20 text-warning">On Hold</Badge>;
      case 'completed': return <Badge className="bg-primary/20 text-primary">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalHoursThisWeek = timeEntries
    .filter(e => {
      const entryDate = new Date(e.entry_date);
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      return entryDate >= weekStart;
    })
    .reduce((sum, e) => sum + e.hours, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs 
          items={[
            { label: "Time & Attendance", href: "/time-attendance" },
            { label: "Project Time Tracking" }
          ]} 
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Project Time Tracking
              </h1>
              <p className="text-muted-foreground">
                Track time spent on clients, projects and tasks
              </p>
            </div>
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHoursThisWeek.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">Hours logged</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.filter(c => c.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Send className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{timeEntries.filter(e => e.status === 'draft').length}</div>
              <p className="text-xs text-muted-foreground">To submit</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="timesheet" className="gap-2">
              <Clock className="h-4 w-4" />
              My Timesheet
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Building2 className="h-4 w-4" />
              Clients
            </TabsTrigger>
          </TabsList>

          {/* Timesheet Tab */}
          <TabsContent value="timesheet">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Time Entries</CardTitle>
                  <CardDescription>Log hours against projects and tasks</CardDescription>
                </div>
                <Dialog open={timeEntryDialogOpen} onOpenChange={setTimeEntryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Log Time
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Log Time Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Project *</Label>
                        <Select 
                          value={timeEntryForm.project_id} 
                          onValueChange={(v) => {
                            setTimeEntryForm({...timeEntryForm, project_id: v, task_id: ""});
                            loadTasks(v);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.filter(p => p.status === 'active').map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.client?.name ? `${p.client.name} - ` : ''}{p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {timeEntryForm.project_id && tasks.length > 0 && (
                        <div className="space-y-2">
                          <Label>Task</Label>
                          <Select 
                            value={timeEntryForm.task_id} 
                            onValueChange={(v) => setTimeEntryForm({...timeEntryForm, task_id: v === "__none__" ? "" : v})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select task (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">No specific task</SelectItem>
                              {tasks.filter(t => t.is_active).map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date *</Label>
                          <Input 
                            type="date"
                            value={timeEntryForm.entry_date}
                            onChange={(e) => setTimeEntryForm({...timeEntryForm, entry_date: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hours *</Label>
                          <Input 
                            type="number"
                            step="0.25"
                            min="0.25"
                            max="24"
                            value={timeEntryForm.hours}
                            onChange={(e) => setTimeEntryForm({...timeEntryForm, hours: e.target.value})}
                            placeholder="2.5"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={timeEntryForm.description}
                          onChange={(e) => setTimeEntryForm({...timeEntryForm, description: e.target.value})}
                          placeholder="What did you work on?"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={timeEntryForm.billable}
                          onCheckedChange={(c) => setTimeEntryForm({...timeEntryForm, billable: c})}
                        />
                        <Label>Billable</Label>
                      </div>
                      <Button onClick={handleSaveTimeEntry} className="w-full">
                        Save Time Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No time entries yet. Click "Log Time" to add your first entry.
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{format(new Date(entry.entry_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell className="font-medium">{entry.project?.name}</TableCell>
                          <TableCell>{entry.task?.name || '-'}</TableCell>
                          <TableCell>{entry.hours}h</TableCell>
                          <TableCell>
                            {entry.billable ? (
                              <Badge variant="outline" className="text-success"><DollarSign className="h-3 w-3" /></Badge>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {entry.status === 'draft' && (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => handleSubmitTimeEntry(entry.id)}>
                                    <Send className="h-4 w-4 text-primary" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTimeEntry(entry.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage projects and tasks</CardDescription>
                </div>
                <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Client</Label>
                        <Select 
                          value={projectForm.client_id} 
                          onValueChange={(v) => setProjectForm({...projectForm, client_id: v === "__none__" ? "" : v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No client</SelectItem>
                            {clients.filter(c => c.is_active).map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input 
                            value={projectForm.name}
                            onChange={(e) => setProjectForm({...projectForm, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input 
                            value={projectForm.code}
                            onChange={(e) => setProjectForm({...projectForm, code: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({...projectForm, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Budget Hours</Label>
                          <Input 
                            type="number"
                            value={projectForm.budget_hours}
                            onChange={(e) => setProjectForm({...projectForm, budget_hours: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Hourly Rate</Label>
                          <Input 
                            type="number"
                            value={projectForm.hourly_rate}
                            onChange={(e) => setProjectForm({...projectForm, hourly_rate: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={projectForm.billable}
                          onCheckedChange={(c) => setProjectForm({...projectForm, billable: c})}
                        />
                        <Label>Billable</Label>
                      </div>
                      <Button onClick={handleSaveProject} className="w-full">
                        Create Project
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No projects
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <span className="font-medium">{project.name}</span>
                              <span className="text-muted-foreground ml-2 text-sm">{project.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>{project.client?.name || '-'}</TableCell>
                          <TableCell>{project.budget_hours ? `${project.budget_hours}h` : '-'}</TableCell>
                          <TableCell>{project.hourly_rate ? `$${project.hourly_rate}/h` : '-'}</TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteProject(project.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Clients</CardTitle>
                  <CardDescription>Manage client organizations</CardDescription>
                </div>
                <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input 
                            value={clientForm.name}
                            onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Code *</Label>
                          <Input 
                            value={clientForm.code}
                            onChange={(e) => setClientForm({...clientForm, code: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={clientForm.description}
                          onChange={(e) => setClientForm({...clientForm, description: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Contact Name</Label>
                          <Input 
                            value={clientForm.contact_name}
                            onChange={(e) => setClientForm({...clientForm, contact_name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Email</Label>
                          <Input 
                            type="email"
                            value={clientForm.contact_email}
                            onChange={(e) => setClientForm({...clientForm, contact_email: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={clientForm.is_active}
                          onCheckedChange={(c) => setClientForm({...clientForm, is_active: c})}
                        />
                        <Label>Active</Label>
                      </div>
                      <Button onClick={handleSaveClient} className="w-full">
                        Create Client
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No clients
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.code}</TableCell>
                          <TableCell>-</TableCell>
                          <TableCell>
                            <Badge className={client.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                              {client.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClient(client.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
