import { useState, useEffect } from "react";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GoalDialog } from "@/components/performance/GoalDialog";
import { GoalProgressDialog } from "@/components/performance/GoalProgressDialog";
import { GoalCommentsDialog } from "@/components/performance/GoalCommentsDialog";
import { format } from "date-fns";

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
    // Set employees for GoalDialog
    setEmployees((data || []).map((r: DirectReport) => ({
      id: r.employee_id,
      full_name: r.employee_name,
    })));
  };

  const fetchTeamGoals = async () => {
    if (!user?.id) return;

    // Get direct reports first
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
          <Button onClick={() => handleCreateGoal()}>
            <Plus className="mr-2 h-4 w-4" />
            Assign Goal
          </Button>
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
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{stats.overdueGoals}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-warning" />
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="team-goals" className="gap-2">
              <Target className="h-4 w-4" />
              Active Goals
              {teamGoals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {teamGoals.length}
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

          <TabsContent value="team-goals" className="mt-6">
            <div className="space-y-4">
              {teamGoals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No active goals for your team</p>
                    <Button onClick={() => handleCreateGoal()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Assign First Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                teamGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>
                            {goal.employee_name} • {goal.goal_type.replace(/_/g, " ")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={statusColors[goal.status]}>
                            {goal.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span>{goal.progress_percentage}%</span>
                          </div>
                          <Progress value={goal.progress_percentage} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {goal.due_date && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Due: {format(new Date(goal.due_date), "MMM d, yyyy")}
                              </div>
                            )}
                            {goal.weighting > 0 && (
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Weight: {goal.weighting}%
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewGoal(goal)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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

                  return (
                    <Card key={report.employee_id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{report.employee_name}</CardTitle>
                            <CardDescription>{report.position_title}</CardDescription>
                          </div>
                          <Badge variant="outline">
                            {employeeGoals.length} goal{employeeGoals.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {employeeGoals.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Average Progress</span>
                                <span>{avgProgress}%</span>
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
                              onClick={handleCreateGoal}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Assign Goal
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
              goal={selectedGoal}
              onSuccess={fetchData}
            />
            <GoalCommentsDialog
              open={commentsDialogOpen}
              onOpenChange={setCommentsDialogOpen}
              goalId={selectedGoal.id}
              goalTitle={selectedGoal.title}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
