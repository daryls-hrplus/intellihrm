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
  Lightbulb,
  MessageSquare,
  MessageSquarePlus,
  FileEdit,
  ScrollText,
  Lock,
  Unlock,
  X,
  Star,
  Send,
  AlertTriangle,
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
import { ManagerCoachingPrompts } from "@/components/mss/ManagerCoachingPrompts";
import { ManagerCheckInPrompt } from "@/components/performance/ManagerCheckInPrompt";
import { ProgressVisualizationDashboard } from "@/components/performance/ProgressVisualizationDashboard";
import { ManagerCheckInReviewDialog } from "@/components/performance/ManagerCheckInReviewDialog";
import { RequestCheckInDialog } from "@/components/performance/RequestCheckInDialog";
import { GoalAdjustmentDialog } from "@/components/performance/goals/GoalAdjustmentDialog";
import { GoalAuditTrail } from "@/components/performance/goals/GoalAuditTrail";
import { GoalLockDialog } from "@/components/performance/goals/GoalLockDialog";
import { EnhancedGoalRatingDialog } from "@/components/performance/EnhancedGoalRatingDialog";
import { DisputeResolutionPanel } from "@/components/performance/DisputeResolutionPanel";
import { TeamInsightsPanel } from "@/components/performance/insights/TeamInsightsPanel";
import { EmployeeWorkloadHeatmap } from "@/components/performance/insights/EmployeeWorkloadHeatmap";
import { GoalQualityReport } from "@/components/performance/insights/GoalQualityReport";
import { GoalNotificationBell } from "@/components/performance/goals/GoalNotificationBell";
import { EnhancedCoachingNudges } from "@/components/performance/insights/EnhancedCoachingNudges";
import { GoalSkillGapCard } from "@/components/performance/goals/GoalSkillGapCard";
import { usePendingAdjustments } from "@/hooks/usePendingAdjustments";
import { useGoalAdjustments } from "@/hooks/useGoalAdjustments";
import { useGoalRatingSubmissions } from "@/hooks/useGoalRatingSubmissions";
import type { GoalRatingSubmission } from "@/types/goalRatings";
import { GoalCheckIn } from "@/hooks/useGoalCheckIns";
import { format, isPast } from "date-fns";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

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

export default function MssGoalsPage() {
  const { t } = useLanguage();
  
  const breadcrumbItems = [
    { label: t("mss.title"), href: "/mss" },
    { label: t("mss.teamGoals.breadcrumb") },
  ];

const statusColors: Record<GoalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  overdue: "bg-warning/10 text-warning",
};


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

  // Check-in review dialog
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<GoalCheckIn | null>(null);

  // Request check-in dialog
  const [requestCheckInDialogOpen, setRequestCheckInDialogOpen] = useState(false);
  const [preSelectedEmployeeId, setPreSelectedEmployeeId] = useState<string | undefined>();
  const [preSelectedGoalId, setPreSelectedGoalId] = useState<string | undefined>();
  
  // Goal Adjustment dialogs (MSS - manager full access)
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [auditTrailDialogOpen, setAuditTrailDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  
  // Rating dialogs
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [pendingRatings, setPendingRatings] = useState<GoalRatingSubmission[]>([]);
  const [readyToRelease, setReadyToRelease] = useState<GoalRatingSubmission[]>([]);
  
  // Pending adjustments for manager approval
  const { pendingAdjustments, pendingCount, approveAdjustment, rejectAdjustment } = usePendingAdjustments(company?.id);
  
  // Rating submissions hook
  const { fetchSubmissionsByStatus, releaseRating } = useGoalRatingSubmissions({ companyId: company?.id || "" });

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
        fetchRatingSubmissions(),
      ]);
    } catch (error) {
      console.error("Error fetching goals data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRatingSubmissions = async () => {
    if (!user?.id || !company?.id) return;
    
    try {
      // Fetch submissions awaiting manager rating
      const pending = await fetchSubmissionsByStatus("self_submitted", user.id);
      setPendingRatings(pending);
      
      // Fetch submissions ready to release
      const ready = await fetchSubmissionsByStatus("manager_submitted", user.id);
      setReadyToRelease(ready);
    } catch (error) {
      console.error("Error fetching rating submissions:", error);
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
      "Due Date": goal.due_date ? formatDateForDisplay(goal.due_date, "yyyy-MM-dd") : "",
      Category: goal.category || "",
    }));

    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `team-goals-${getTodayString()}.csv`;
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

  const handleReviewCheckIn = (checkIn: GoalCheckIn) => {
    setSelectedCheckIn(checkIn);
    setReviewDialogOpen(true);
  };

  const handleRequestCheckIn = (goal?: Goal) => {
    if (goal) {
      setPreSelectedEmployeeId(goal.employee_id || undefined);
      setPreSelectedGoalId(goal.id);
    } else {
      setPreSelectedEmployeeId(undefined);
      setPreSelectedGoalId(undefined);
    }
    setRequestCheckInDialogOpen(true);
  };
  
  // Goal Adjustment Handlers (MSS - manager full access)
  const handleRecordAdjustment = (goal: Goal) => {
    setSelectedGoal(goal);
    setAdjustmentDialogOpen(true);
  };
  
  const handleViewAuditTrail = (goal: Goal) => {
    setSelectedGoal(goal);
    setAuditTrailDialogOpen(true);
  };
  
  const handleLockGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setLockDialogOpen(true);
  };
  
  const handleUnlockGoal = async (goal: Goal) => {
    try {
      const { error } = await supabase
        .from("performance_goals")
        .update({ 
          is_locked: false, 
          locked_at: null, 
          locked_by: null, 
          lock_reason: null 
        })
        .eq("id", goal.id);
      
      if (error) throw error;
      toast.success("Goal unlocked successfully");
      fetchData();
    } catch (error) {
      console.error("Error unlocking goal:", error);
      toast.error("Failed to unlock goal");
    }
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
            {user?.id && company?.id && (
              <GoalNotificationBell userId={user.id} companyId={company.id} />
            )}
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

        {/* Manager Check-in Prompt */}
        <ManagerCheckInPrompt onReviewClick={handleReviewCheckIn} />

        {/* Analytics Section */}
        {showAnalytics && (
          <>
            <TeamGoalsAnalytics
              teamGoals={teamGoals}
              completedGoals={completedGoals}
              directReports={directReports}
            />
            <ProgressVisualizationDashboard
              teamGoals={teamGoals}
              directReports={directReports}
            />
          </>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="team-goals" className="gap-2">
              <Target className="h-4 w-4" />
              Active Goals
              {filteredGoals.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filteredGoals.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending-ratings" className="gap-2">
              <Star className="h-4 w-4" />
              Pending Ratings
              {pendingRatings.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingRatings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready-release" className="gap-2">
              <Send className="h-4 w-4" />
              Ready to Release
              {readyToRelease.length > 0 && (
                <Badge variant="outline" className="ml-1 border-primary text-primary">
                  {readyToRelease.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="disputes" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Disputes
            </TabsTrigger>
            <TabsTrigger value="pending-adjustments" className="gap-2">
              <FileEdit className="h-4 w-4" />
              Pending Adjustments
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="check-ins" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="by-employee" className="gap-2">
              <Users className="h-4 w-4" />
              By Employee
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed
            </TabsTrigger>
            <TabsTrigger value="coaching" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Coaching Insights
            </TabsTrigger>
            <TabsTrigger value="team-insights" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Team Insights
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
                    onRequestCheckIn={handleRequestCheckIn}
                    onRecordAdjustment={handleRecordAdjustment}
                    onViewAuditTrail={handleViewAuditTrail}
                    onLockGoal={handleLockGoal}
                    onUnlockGoal={handleUnlockGoal}
                  />
                ))
              )}
            </div>
          </TabsContent>

          {/* Pending Ratings Tab */}
          <TabsContent value="pending-ratings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Goals Awaiting Your Rating
                </CardTitle>
                <CardDescription>
                  Employees have submitted self-ratings for these goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingRatings.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRatings.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Goal ID: {submission.goal_id.slice(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">
                            Self Rating: {submission.self_rating || "-"} / 5
                          </p>
                        </div>
                        <Button size="sm" onClick={() => {
                          const goal = teamGoals.find(g => g.id === submission.goal_id);
                          if (goal) {
                            setSelectedGoal(goal);
                            setRatingDialogOpen(true);
                          }
                        }}>
                          <Star className="h-4 w-4 mr-1" />
                          Rate
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No goals awaiting your rating</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ready to Release Tab */}
          <TabsContent value="ready-release" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Ready to Release
                </CardTitle>
                <CardDescription>
                  Ratings you've completed that can be released to employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {readyToRelease.length > 0 ? (
                  <div className="space-y-3">
                    {readyToRelease.map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Goal ID: {submission.goal_id.slice(0, 8)}...</p>
                          <p className="text-sm text-muted-foreground">
                            Final Score: {submission.final_score?.toFixed(1) || "-"} / 5
                          </p>
                        </div>
                        <Button size="sm" onClick={async () => {
                          const { error } = await releaseRating(submission.id, user?.id || "");
                          if (!error) {
                            toast.success("Rating released to employee");
                            fetchData();
                          }
                        }}>
                          <Send className="h-4 w-4 mr-1" />
                          Release
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No ratings ready to release</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="mt-6">
            {company?.id && <DisputeResolutionPanel companyId={company.id} onResolved={fetchData} />}
          </TabsContent>

          {/* Pending Adjustments Tab */}
          <TabsContent value="pending-adjustments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileEdit className="h-5 w-5" />
                  Pending Goal Adjustments
                  {pendingCount > 0 && (
                    <Badge variant="destructive">{pendingCount}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Review and approve goal adjustments submitted by your team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAdjustments && pendingAdjustments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAdjustments.map((adjustment: any) => (
                      <Card key={adjustment.id} className="border-primary/20">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-medium">{adjustment.goal?.title || "Goal"}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {adjustment.change_type?.replace(/_/g, " ")} • {adjustment.adjustment_reason?.replace(/_/g, " ")}
                              </p>
                              {adjustment.reason_details && (
                                <p className="text-sm mt-2">{adjustment.reason_details}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => rejectAdjustment.mutate(adjustment.id)}
                              >
                                Reject
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => approveAdjustment.mutate(adjustment.id)}
                              >
                                Approve
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending adjustments to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="check-ins" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Team Check-ins Overview</CardTitle>
                  <CardDescription>Review and respond to employee goal check-ins</CardDescription>
                </div>
                <Button onClick={() => handleRequestCheckIn()}>
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Request Check-in
                </Button>
              </CardHeader>
              <CardContent>
                <ManagerCheckInPrompt onReviewClick={handleReviewCheckIn} />
              </CardContent>
            </Card>
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
                              Due: {formatDateForDisplay(goal.due_date, "MMM d, yyyy")}
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

          <TabsContent value="coaching" className="mt-6">
            {company?.id && user?.id && (
              <EnhancedCoachingNudges 
                companyId={company.id} 
                managerId={user.id}
                maxNudges={10}
              />
            )}
            <div className="mt-6">
              <ManagerCoachingPrompts managerId={user?.id} />
            </div>
          </TabsContent>

          {/* Team Insights Tab */}
          <TabsContent value="team-insights" className="mt-6 space-y-6">
            <TeamInsightsPanel 
              companyId={company?.id}
              directReportIds={directReports.map(r => r.employee_id)}
              onViewOverloaded={() => setActiveTab("by-employee")}
              onViewQualityIssues={() => setActiveTab("team-goals")}
            />
            
            <div className="grid gap-6 lg:grid-cols-2">
              <EmployeeWorkloadHeatmap 
                companyId={company?.id}
              />
              <GoalQualityReport 
                companyId={company?.id}
              />
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

        <ManagerCheckInReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          checkIn={selectedCheckIn}
          onSuccess={fetchData}
        />

        <RequestCheckInDialog
          open={requestCheckInDialogOpen}
          onOpenChange={setRequestCheckInDialogOpen}
          directReports={directReports}
          onSuccess={fetchData}
          preSelectedEmployeeId={preSelectedEmployeeId}
          preSelectedGoalId={preSelectedGoalId}
        />
        
        {/* Goal Adjustment Dialogs (MSS - manager full access) */}
        {selectedGoal && (
          <>
            <GoalAdjustmentDialog
              goalId={selectedGoal.id}
              goalTitle={selectedGoal.title}
              open={adjustmentDialogOpen}
              onOpenChange={setAdjustmentDialogOpen}
            />
            <GoalLockDialog
              goalId={selectedGoal.id}
              goalTitle={selectedGoal.title}
              open={lockDialogOpen}
              onOpenChange={(open) => {
                setLockDialogOpen(open);
                if (!open) fetchData();
              }}
            />
          </>
        )}
        
        {/* Audit Trail Dialog */}
        {selectedGoal && auditTrailDialogOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5" />
                  Audit Trail: {selectedGoal.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setAuditTrailDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[60vh]">
                <GoalAuditTrail goalId={selectedGoal.id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
