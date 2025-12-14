import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Plus, CheckSquare, Clock, AlertCircle, User } from "lucide-react";

interface HRTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  created_at: string;
  completed_at: string | null;
}

const priorities = [
  { value: "low", label: "Low", color: "bg-gray-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// Mock data for now - would come from database
const mockTasks: HRTask[] = [
  { id: "1", title: "Review Q4 Performance Reports", description: "Complete review of all department reports", priority: "high", status: "pending", due_date: "2025-12-20", assigned_to: null, created_at: new Date().toISOString(), completed_at: null },
  { id: "2", title: "Update Employee Handbook", description: "Annual handbook revision", priority: "medium", status: "in_progress", due_date: "2025-12-31", assigned_to: null, created_at: new Date().toISOString(), completed_at: null },
  { id: "3", title: "Schedule Year-End Reviews", description: "Coordinate with department heads", priority: "urgent", status: "pending", due_date: "2025-12-15", assigned_to: null, created_at: new Date().toISOString(), completed_at: null },
  { id: "4", title: "Process New Hire Paperwork", description: "5 new hires starting in January", priority: "high", status: "pending", due_date: "2025-12-18", assigned_to: null, created_at: new Date().toISOString(), completed_at: null },
];

export default function HRTasksPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [tasks, setTasks] = useState<HRTask[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  const handleSubmit = () => {
    if (!formData.title) {
      toast({ title: t("common.error"), description: t("validation.required"), variant: "destructive" });
      return;
    }

    const newTask: HRTask = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      status: "pending",
      due_date: formData.due_date || null,
      assigned_to: null,
      created_at: new Date().toISOString(),
      completed_at: null,
    };

    setTasks([newTask, ...tasks]);
    toast({ title: t("common.success"), description: t("common.created") });
    setDialogOpen(false);
    setFormData({ title: "", description: "", priority: "medium", due_date: "" });
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        return {
          ...task,
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null,
        };
      }
      return task;
    }));
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return task.status !== "completed";
    if (activeTab === "completed") return task.status === "completed";
    if (activeTab === "overdue") {
      return task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";
    }
    return true;
  });

  const getPriorityColor = (priority: string) =>
    priorities.find(p => p.value === priority)?.color || "bg-gray-500";

  const stats = {
    total: tasks.filter(t => t.status !== "completed").length,
    urgent: tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const priorityLabels: Record<string, string> = {
    low: t("helpdesk.priorities.low"),
    medium: t("helpdesk.priorities.medium"),
    high: t("helpdesk.priorities.high"),
    urgent: t("helpdesk.priorities.urgent"),
  };

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.tasks") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("hrHub.tasks")}</h1>
            <p className="text-muted-foreground">{t("hrHub.tasksSubtitle")}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("hrHub.addTask")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.activeTasks")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.urgent}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.urgent")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.overdue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckSquare className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.completed")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">{t("common.active")} ({stats.total})</TabsTrigger>
                <TabsTrigger value="overdue">{t("hrHub.overdue")} ({stats.overdue})</TabsTrigger>
                <TabsTrigger value="completed">{t("hrHub.completed")} ({stats.completed})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("hrHub.noTasksFound")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      task.status === "completed" ? "bg-muted/50 opacity-60" : "hover:bg-muted/30"
                    }`}
                  >
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={() => toggleTaskComplete(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-medium ${task.status === "completed" ? "line-through" : ""}`}>
                          {task.title}
                        </h3>
                        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                          {priorityLabels[task.priority]}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          {t("hrHub.due")}: {format(new Date(task.due_date), "MMM d, yyyy")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("hrHub.addTask")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("common.name")} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("hrHub.taskTitle")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("helpdesk.priorities.medium")}</Label>
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
                <div>
                  <Label>{t("hrHub.dueDate")}</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t("common.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("hrHub.taskDescription")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSubmit}>{t("hrHub.createTask")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
