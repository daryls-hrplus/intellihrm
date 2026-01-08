import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Plus, CheckSquare, Clock, AlertCircle, Building2, Search, CalendarDays, X, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface TeamMember {
  id: string;
  full_name: string | null;
}

interface HRTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  company_id: string | null;
  created_at: string;
  completed_at: string | null;
  company?: { name: string } | null;
  assignee?: { full_name: string } | null;
}

const priorities = [
  { value: "low", label: "Low", color: "bg-slate-500" },
  { value: "medium", label: "Medium", color: "bg-amber-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

// Helper to avoid deep type instantiation
const query = (table: string) => supabase.from(table as any);

export default function HRTasksPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [tasks, setTasks] = useState<HRTask[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTask, setEditingTask] = useState<HRTask | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    company_id: "",
    assigned_to: "",
  });

  useEffect(() => {
    loadCompanies();
    loadTeamMembers();
    loadTasks();
  }, []);

  const loadCompanies = async () => {
    const res: any = await query("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(res.data || []);
  };

  const loadTeamMembers = async () => {
    const res: any = await query("profiles")
      .select("id, full_name")
      .eq("is_active", true)
      .order("full_name");
    setTeamMembers(res.data || []);
  };

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res: any = await query("hr_tasks")
        .select("*, company:companies(name), assignee:profiles!hr_tasks_assigned_to_fkey(full_name)")
        .order("created_at", { ascending: false });
      setTasks(res.data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.company_id || !formData.due_date) {
      toast({ title: t("common.error"), description: "Title, company, and due date are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTask) {
        const res: any = await query("hr_tasks")
          .update({
            title: formData.title,
            description: formData.description || null,
            priority: formData.priority,
            due_date: formData.due_date,
            company_id: formData.company_id,
            assigned_to: formData.assigned_to || null,
          })
          .eq("id", editingTask.id);

        if (res.error) throw res.error;
        toast({ title: t("common.success"), description: t("common.saved") });
      } else {
        const res: any = await query("hr_tasks").insert({
          title: formData.title,
          description: formData.description || null,
          priority: formData.priority,
          due_date: formData.due_date,
          company_id: formData.company_id,
          assigned_to: formData.assigned_to || null,
          created_by: profile?.id,
        });

        if (res.error) throw res.error;
        toast({ title: t("common.success"), description: t("common.created") });
      }

      closeDialog();
      loadTasks();
    } catch (error) {
      toast({ title: t("common.error"), description: "Failed to save task", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task: HRTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date || "",
      company_id: task.company_id || "",
      assigned_to: task.assigned_to || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    try {
      const res: any = await query("hr_tasks").delete().eq("id", taskId);
      if (res.error) throw res.error;
      toast({ title: t("common.success"), description: t("common.deleted") });
      loadTasks();
    } catch (error) {
      toast({ title: t("common.error"), description: "Failed to delete task", variant: "destructive" });
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTask(null);
    setFormData({ title: "", description: "", priority: "medium", due_date: "", company_id: "", assigned_to: "" });
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    const completedAt = newStatus === "completed" ? new Date().toISOString() : null;
    
    try {
      await query("hr_tasks")
        .update({ status: newStatus, completed_at: completedAt })
        .eq("id", taskId);
      loadTasks();
    } catch (error) {
      toast({ title: t("common.error"), description: "Failed to update task", variant: "destructive" });
    }
  };

  const stats = useMemo(() => ({
    active: tasks.filter(t => t.status !== "completed").length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length,
    completed: tasks.filter(t => t.status === "completed").length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search filter
    if (searchTerm) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Company filter
    if (selectedCompany !== "all") {
      result = result.filter(t => t.company_id === selectedCompany);
    }
    
    // Status filter
    if (statusFilter === "active") {
      result = result.filter(t => t.status !== "completed");
    } else if (statusFilter === "completed") {
      result = result.filter(t => t.status === "completed");
    } else if (statusFilter === "overdue") {
      result = result.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed");
    }

    return result;
  }, [tasks, searchTerm, selectedCompany, statusFilter]);

  const getPriorityColor = (priority: string) =>
    priorities.find(p => p.value === priority)?.color || "bg-slate-500";

  const priorityLabels: Record<string, string> = {
    low: t("helpdesk.priorities.low"),
    medium: t("helpdesk.priorities.medium"),
    high: t("helpdesk.priorities.high"),
    urgent: t("helpdesk.priorities.urgent"),
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    return dueDate && new Date(dueDate) < new Date() && status !== "completed";
  };

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.tasks") },
  ];

  const hasFilters = searchTerm || selectedCompany !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCompany("all");
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t("hrHub.tasks")}</h1>
            <p className="text-sm text-muted-foreground">{t("hrHub.tasksSubtitle")}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("hrHub.addTask")}
          </Button>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setStatusFilter("active")}
            className={`p-4 rounded-lg border text-left transition-all ${
              statusFilter === "active" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <CheckSquare className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{t("hrHub.activeTasks")}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("overdue")}
            className={`p-4 rounded-lg border text-left transition-all ${
              statusFilter === "overdue" ? "border-orange-500 bg-orange-500/5 ring-1 ring-orange-500" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xl font-semibold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">{t("hrHub.overdue")}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("completed")}
            className={`p-4 rounded-lg border text-left transition-all ${
              statusFilter === "completed" ? "border-green-500 bg-green-500/5 ring-1 ring-green-500" : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <CheckSquare className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-semibold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">{t("hrHub.completed")}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 px-3">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Task List */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{t("hrHub.noTasksFound")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-4 transition-colors ${
                      task.status === "completed" ? "bg-muted/30" : "hover:bg-muted/20"
                    }`}
                  >
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white ${getPriorityColor(task.priority)}`}>
                          {priorityLabels[task.priority]}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {task.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {task.company.name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className={`flex items-center gap-1 ${isOverdue(task.due_date, task.status) ? "text-orange-600 font-medium" : ""}`}>
                            <CalendarDays className="h-3 w-3" />
                            {formatDateForDisplay(task.due_date)}
                            {isOverdue(task.due_date, task.status) && " (Overdue)"}
                          </span>
                        )}
                        {task.assignee?.full_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(task)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Task Dialog */}
        <Dialog open={dialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? t("common.edit") : t("hrHub.addTask")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("common.company")} *</Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData({ ...formData, company_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("common.name")} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("hrHub.taskTitle")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("helpdesk.priority")}</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{priorityLabels[p.value]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("hrHub.dueDate")} *</Label>
                  <DatePicker
                    value={formData.due_date}
                    onChange={(date) => setFormData({ ...formData, due_date: date ? date.toISOString().split("T")[0] : "" })}
                    placeholder="Select due date"
                    fromDate={new Date()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("common.assignedTo")}</Label>
                <Select value={formData.assigned_to} onValueChange={(v) => setFormData({ ...formData, assigned_to: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>{member.full_name || "Unnamed"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("common.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("hrHub.taskDescription")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={closeDialog}>{t("common.cancel")}</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t("common.saving") : editingTask ? t("common.save") : t("hrHub.createTask")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}