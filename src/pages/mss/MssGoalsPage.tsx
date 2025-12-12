import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  Eye,
  BarChart3,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GoalDialog } from "@/components/performance/GoalDialog";
import { GoalProgressDialog } from "@/components/performance/GoalProgressDialog";
import { GoalCommentsDialog } from "@/components/performance/GoalCommentsDialog";
import { TeamGoalsAnalytics } from "@/components/mss/TeamGoalsAnalytics";
import { TeamGoalsFilters } from "@/components/mss/TeamGoalsFilters";
import { TeamGoalCard } from "@/components/mss/TeamGoalCard";
import { SendReminderDialog } from "@/components/mss/SendReminderDialog";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

type GoalStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
type GoalType = 'okr_objective' | 'okr_key_result' | 'smart_goal';
type GoalLevel = 'company' | 'department' | 'team' | 'individual';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  goal_level: GoalLevel;
  status: GoalStatus;
  progress_percentage: number;
  weighting: number;
  start_date: string;
  due_date: string | null;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
  employee_id: string | null;
  department_id: string | null;
  parent_goal_id: string | null;
  category: string | null;
  employee_name?: string;
}

interface DirectReport {
  employee_id: string;
  employee_name: string;
  employee_email: string;
  position_title: string;
}

const breadcrumbItems = [
  { label: "Manager Self Service", href: "/mss" },
  { label: "Team Goals" },
];

const statusColors: Record<GoalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  overdue: "bg-warning/10 text-warning",
};

export default function MssGoalsPage() {
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState("team-goals");
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [teamGoals, setTeamGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Reminder dialog
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderType, setReminderType] = useState<"reminder" | "update_request">("reminder");

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDirectReports(),
        fetchTeamGoals(),
        fetchCompletedGoals(),
      ]);
    } catch (error) {
      console.error("Error fetching goals data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectReports = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .rpc('get_manager_direct_reports', { p_manager_id: user.id });

    if (error) {
      console.error("Error fetching direct reports:", error);
      return;
    }

    setDirectReports(data || []);
    setEmployees((data || []).map((r: DirectReport) => ({
      id: r.employee_id,
      full_name: r.employee_name,
    })));
  };

  const fetchTeamGoals = async () => {
    if (!user?.id) return;

    const { data: reports } = await supabase
      .rpc('get_manager_direct_reports', { p_manager_id: user.id });

    if (!reports || reports.length === 0) {
      setTeamGoals([]);
      return;
    }

    const employeeIds = reports.map((r: DirectReport) => r.employee_id);

    const { data, error } = await supabase
      .from("performance_goals")
      .select("*, employee:profiles!performance_goals_employee_id_fkey(full_name)")
      .in("employee_id", employeeIds)
      .not("status", "eq", "completed")
      .not("status", "eq", "cancelled")
      .order("due_date", { ascending: true });

    if (error) {
      console.error("Error fetching team goals:", error);
      return;
    }

    const formatted = (data || []).map((goal: any) => ({
      ...goal,
      employee_name: goal.employee?.full_name || "Unknown",
    }));

    setTeamGoals(formatted);
  };

  const fetchCompletedGoals = async () => {
    if (!user?.id) return;

    const { data: reports } = await supabase
      .rpc('get_manager_direct_reports', { p_manager_id: user.id });

    if (!reports || reports.length === 0) {
      setCompletedGoals([]);
      return;
    }

    const employeeIds = reports.map((r: DirectReport) => r.employee_id);

    const { data, error } = await supabase
      .from("performance_goals")
      .select("*, employee:profiles!performance_goals_employee_id_fkey(full_name)")
      .in("employee_id", employeeIds)
      .or("status.eq.completed,status.eq.cancelled")
      .order("updated_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching completed goals:", error);
      return;
    }

    const formatted = (data || []).map((goal: any) => ({
      ...goal,
      employee_name: goal.employee?.full_name || "Unknown",
    }));

    setCompletedGoals(formatted);
  };

  // Filtered goals
  const filteredGoals = useMemo(() => {
    return teamGoals.filter((goal) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !goal.title.toLowerCase().includes(query) &&
          !goal.employee_name?.toLowerCase().includes(query) &&
          !goal.category?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Employee filter
      if (selectedEmployee !== "all" && goal.employee_id !== selectedEmployee) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all") {
        const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
        const effectiveStatus = isOverdue ? "overdue" : goal.status;
        if (effectiveStatus !== selectedStatus) {
          return false;
        }
      }

      // Priority/Weight filter
      if (selectedPriority !== "all") {
        if (selectedPriority === "high" && goal.weighting < 30) return false;
        if (selectedPriority === "medium" && (goal.weighting < 15 || goal.weighting >= 30)) return false;
        if (selectedPriority === "low" && goal.weighting >= 15) return false;
      }

      return true;
    });
  }, [teamGoals, searchQuery, selectedEmployee, selectedStatus, selectedPriority]);

  const hasActiveFilters = Boolean(searchQuery) || selectedEmployee !== "all" || selectedStatus !== "all" || selectedPriority !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedEmployee("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
  };

  const handleExport = () => {
    const data = filteredGoals.map(goal => ({
      Employee: goal.employee_name,
      Title: goal.title,
      Type: goal.goal_type.replace(/_/g, " "),
      Status: goal.status,
      Progress: `${goal.progress_percentage}%`,
      Weight: `${goal.weighting}%`,
      "Due Date": goal.due_date ? format(new Date(goal.due_date), "yyyy-MM-dd") : "",
      Category: goal.category || "",
    }));

    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-goals-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Goals exported successfully");
  };

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setGoalDialogOpen(true);
  };

  const handleViewGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setGoalDialogOpen(true);
  };

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressDialogOpen(true);
  };

  const handleViewComments = (goal: Goal) => {
    setSelectedGoal(goal);
    setCommentsDialogOpen(true);
  };

  const handleSendReminder = (goal: Goal) => {
    setSelectedGoal(goal);
    setReminderType("reminder");
    setReminderDialogOpen(true);
  };

  const handleRequestUpdate = (goal: Goal) => {
    setSelectedGoal(goal);
    setReminderType("update_request");
    setReminderDialogOpen(true);
  };

  const activeGoals = teamGoals.filter(g => g.status === "active" || g.status === "in_progress");
  const overdueGoals = teamGoals.filter(g => g.status === "overdue" || (g.due_date && new Date(g.due_date) < new Date() && g.status !== "completed"));

  const stats = {
    totalTeamGoals: teamGoals.length,
    activeGoals: activeGoals.length,
    overdueGoals: overdueGoals.length,
    completedGoals: completedGoals.filter(g => g.status === "completed").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Team Goals
              </h1>
              <p className="text-muted-foreground">
                Manage and track goals for your direct reports
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {showAnalytics ? "Hide" : "Show"} Analytics
            </Button>
            <Button onClick={handleCreateGoal}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Goal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Goals</p>
                  <p className="text-2xl font-bold">{stats.totalTeamGoals}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.activeGoals}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.overdueGoals > 0 ? "border-warning/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className={`text-2xl font-bold ${stats.overdueGoals > 0 ? "text-warning" : ""}`}>
                    {stats.overdueGoals}
                  </p>
                </div>
                <AlertCircle className={`h-8 w-8 ${stats.overdueGoals > 0 ? "text-warning" : "text-muted-foreground"}`} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedGoals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section */}
        {showAnalytics && (
          <TeamGoalsAnalytics
            teamGoals={teamGoals}
            completedGoals={completedGoals}
            directReports={directReports}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="team-goals" className="gap-2">
              <Target className="h-4 w-4" />
              Active Goals
              {filteredGoals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filteredGoals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="by-employee" className="gap-2">
              <Users className="h-4 w-4" />
              By Employee
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team-goals" className="mt-6 space-y-4">
            {/* Filters */}
            <TeamGoalsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedEmployee={selectedEmployee}
              onEmployeeChange={setSelectedEmployee}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              directReports={directReports}
              onExport={handleExport}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Goals List */}
            <div className="space-y-4">
              {filteredGoals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters ? "No goals match your filters" : "No active goals for your team"}
                    </p>
                    {hasActiveFilters ? (
                      <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={handleCreateGoal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Assign First Goal
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredGoals.map((goal) => (
                  <TeamGoalCard
                    key={goal.id}
                    goal={goal}
                    onView={handleViewGoal}
                    onUpdateProgress={handleUpdateProgress}
                    onViewComments={handleViewComments}
                    onSendReminder={handleSendReminder}
                    onRequestUpdate={handleRequestUpdate}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="by-employee" className="mt-6">
            <div className="space-y-4">
              {directReports.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No direct reports found</p>
                  </CardContent>
                </Card>
              ) : (
                directReports.map((report) => {
                  const employeeGoals = teamGoals.filter(g => g.employee_id === report.employee_id);
                  const avgProgress = employeeGoals.length > 0
                    ? Math.round(employeeGoals.reduce((sum, g) => sum + g.progress_percentage, 0) / employeeGoals.length)
                    : 0;
                  const overdueCount = employeeGoals.filter(g => 
                    g.due_date && isPast(new Date(g.due_date)) && g.status !== "completed"
                  ).length;

                  return (
                    <Card key={report.employee_id} className={overdueCount > 0 ? "border-warning/30" : ""}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{report.employee_name}</CardTitle>
                            <CardDescription>{report.position_title}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {overdueCount > 0 && (
                              <Badge variant="outline" className="border-warning text-warning">
                                {overdueCount} overdue
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {employeeGoals.length} goal{employeeGoals.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {employeeGoals.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Average Progress</span>
                                <span className="font-medium">{avgProgress}%</span>
                              </div>
                              <Progress value={avgProgress} className="h-2" />
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {report.employee_email}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedEmployee(report.employee_id);
                                setActiveTab("team-goals");
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Goals
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-4">
              {completedGoals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed goals yet</p>
                  </CardContent>
                </Card>
              ) : (
                completedGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>
                            {goal.employee_name} • {goal.goal_type.replace(/_/g, " ")}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[goal.status]}>
                          {goal.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Final: {goal.progress_percentage}%
                          </div>
                          {goal.due_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Due: {format(new Date(goal.due_date), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewGoal(goal)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <GoalDialog
          open={goalDialogOpen}
          onOpenChange={setGoalDialogOpen}
          goal={selectedGoal}
          companyId={company?.id}
          employees={employees}
          onSuccess={fetchData}
        />

        {selectedGoal && (
          <>
            <GoalProgressDialog
              open={progressDialogOpen}
              onOpenChange={setProgressDialogOpen}
              goal={selectedGoal as any}
              onSuccess={fetchData}
            />
            <GoalCommentsDialog
              open={commentsDialogOpen}
              onOpenChange={setCommentsDialogOpen}
              goalId={selectedGoal.id}
              goalTitle={selectedGoal.title}
            />
            <SendReminderDialog
              open={reminderDialogOpen}
              onOpenChange={setReminderDialogOpen}
              goal={selectedGoal}
              type={reminderType}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
