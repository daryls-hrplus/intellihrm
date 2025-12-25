import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Target,
  TrendingUp,
  Calendar,
  Search,
  MessageSquare,
  UserCircle,
  Plus,
  AlertCircle,
  CheckCircle,
  BarChart3,
  X,
  Download,
  ClipboardCheck,
  Flag,
  History,
  MoreVertical,
  Info,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isPast, differenceInDays } from "date-fns";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { GoalProgressDialog } from "@/components/performance/GoalProgressDialog";
import { GoalCommentsDialog } from "@/components/performance/GoalCommentsDialog";
import { ContactManagerDialog } from "@/components/performance/ContactManagerDialog";
import { GoalDialog } from "@/components/performance/GoalDialog";
import { GoalsAnalyticsDashboard } from "@/components/performance/GoalsAnalyticsDashboard";
import { GoalCheckInDialog } from "@/components/performance/GoalCheckInDialog";
import { GoalMilestonesManager } from "@/components/performance/GoalMilestonesManager";
import { CheckInHistoryTimeline } from "@/components/performance/CheckInHistoryTimeline";
import { useGoalCheckIns } from "@/hooks/useGoalCheckIns";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

type GoalStatus = "draft" | "active" | "in_progress" | "completed" | "cancelled" | "overdue";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  progress_percentage: number;
  due_date: string | null;
  target_value: number | null;
  current_value: number | null;
  unit_of_measure: string | null;
  weighting: number | null;
  goal_type: string;
  goal_level?: string;
  category?: string | null;
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", className: "bg-info/10 text-info" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  overdue: { label: "Overdue", className: "bg-warning/10 text-warning" },
};

export default function MyGoalsPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [contactManagerOpen, setContactManagerOpen] = useState(false);
  const [createGoalOpen, setCreateGoalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  
  // Check-in, Milestones, History dialogs
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [milestonesDialogOpen, setMilestonesDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  const { getOverdueCheckIns } = useGoalCheckIns();
  const [pendingCheckIns, setPendingCheckIns] = useState<Record<string, { dueDate: string | null; daysToDue: number | null }>>({});

  const fetchGoals = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("performance_goals")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals((data as Goal[]) || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchPendingCheckIns();
  }, [user?.id]);
  
  const fetchPendingCheckIns = async () => {
    if (!user?.id) return;
    
    try {
      // Get check-in schedules for user's goals
      const { data: schedules } = await supabase
        .from("goal_check_in_schedules")
        .select("goal_id, next_check_in_date")
        .eq("is_active", true);
      
      if (schedules) {
        const checkInDates: Record<string, { dueDate: string | null; daysToDue: number | null }> = {};
        schedules.forEach((s) => {
          if (s.next_check_in_date) {
            const daysToDue = differenceInDays(new Date(s.next_check_in_date), new Date());
            checkInDates[s.goal_id] = { 
              dueDate: s.next_check_in_date, 
              daysToDue 
            };
          }
        });
        setPendingCheckIns(checkInDates);
      }
    } catch (error) {
      console.error("Error fetching pending check-ins:", error);
    }
  };

  // Filtered goals with overdue detection
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch = 
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
      const effectiveStatus = isOverdue ? "overdue" : goal.status;
      const matchesStatus = statusFilter === "all" || effectiveStatus === statusFilter;
      const matchesType = typeFilter === "all" || goal.goal_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [goals, searchQuery, statusFilter, typeFilter]);

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
  };

  // Stats
  const activeGoals = goals.filter(
    (g) => g.status === "active" || g.status === "in_progress"
  );
  const completedGoals = goals.filter((g) => g.status === "completed");
  const overdueGoals = goals.filter(
    (g) => g.due_date && isPast(new Date(g.due_date)) && g.status !== "completed"
  );
  const averageProgress =
    activeGoals.length > 0
      ? Math.round(
          activeGoals.reduce((sum, g) => sum + g.progress_percentage, 0) /
            activeGoals.length
        )
      : 0;

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressDialogOpen(true);
  };

  const handleViewComments = (goal: Goal) => {
    setSelectedGoal(goal);
    setCommentsDialogOpen(true);
  };

  const handleContactManager = (goal: Goal) => {
    setSelectedGoal(goal);
    setContactManagerOpen(true);
  };
  
  const handleCheckIn = (goal: Goal) => {
    setSelectedGoal(goal);
    setCheckInDialogOpen(true);
  };
  
  const handleViewMilestones = (goal: Goal) => {
    setSelectedGoal(goal);
    setMilestonesDialogOpen(true);
  };
  
  const handleViewHistory = (goal: Goal) => {
    setSelectedGoal(goal);
    setHistoryDialogOpen(true);
  };

  const handleExport = () => {
    const data = filteredGoals.map(goal => ({
      Title: goal.title,
      Type: goal.goal_type.replace(/_/g, " "),
      Status: goal.status,
      Progress: `${goal.progress_percentage}%`,
      Weight: goal.weighting ? `${goal.weighting}%` : "",
      "Due Date": goal.due_date ? formatDateForDisplay(goal.due_date, "yyyy-MM-dd") : "",
    }));

    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-goals-${getTodayString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Goals exported successfully");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("ess.title"), href: "/ess" },
            { label: t("pages.myGoals.title") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("pages.myGoals.title")}</h1>
            <p className="text-muted-foreground">
              {t("pages.myGoals.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {showAnalytics ? t("pages.myGoals.hideAnalytics") : t("pages.myGoals.showAnalytics")}
            </Button>
            <Button onClick={() => setCreateGoalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("pages.myGoals.createGoal")}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myGoals.activeGoals")}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGoals.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myGoals.avgProgress")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageProgress}%</div>
            </CardContent>
          </Card>
          <Card className={overdueGoals.length > 0 ? "border-warning/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myGoals.overdue")}</CardTitle>
              <AlertCircle className={`h-4 w-4 ${overdueGoals.length > 0 ? "text-warning" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueGoals.length > 0 ? "text-warning" : ""}`}>
                {overdueGoals.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("pages.myGoals.completed")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedGoals.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard */}
        {showAnalytics && goals.length > 0 && (
          <GoalsAnalyticsDashboard goals={goals} compact />
        )}
        
        {/* Progress ≠ Rating Guidance */}
        {goals.length > 0 && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Progress ≠ Rating:</strong> Goal progress tracks your journey toward targets. 
              Final performance ratings are determined during formal reviews considering multiple factors.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="smart_goal">SMART Goal</SelectItem>
                <SelectItem value="okr_objective">OKR Objective</SelectItem>
                <SelectItem value="okr_key_result">Key Result</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading goals...
          </div>
        ) : filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No goals found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting your filters"
                  : "You don't have any goals assigned yet"}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button className="mt-4" onClick={() => setCreateGoalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Goal
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredGoals.map((goal) => {
              const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
              const daysUntilDue = goal.due_date ? differenceInDays(new Date(goal.due_date), new Date()) : null;
              const isAtRisk = daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7 && goal.progress_percentage < 80;
              const effectiveStatus = isOverdue ? "overdue" : goal.status;
              const status = statusConfig[effectiveStatus] || statusConfig.active;
              const isEditable = goal.status === "active" || goal.status === "in_progress";

              return (
                <Card 
                  key={goal.id} 
                  className={`overflow-hidden transition-all ${isOverdue ? "border-warning/50" : ""} ${isAtRisk && !isOverdue ? "border-warning/30" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{goal.title}</h3>
                          <Badge className={status.className}>{status.label}</Badge>
                          {goal.weighting && (
                            <Badge variant="outline">Weight: {goal.weighting}%</Badge>
                          )}
                          {isAtRisk && !isOverdue && (
                            <Badge variant="outline" className="border-warning text-warning">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              At Risk
                            </Badge>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {goal.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {goal.due_date && (
                            <span className={`flex items-center gap-1 ${isOverdue ? "text-warning font-medium" : ""}`}>
                              <Calendar className="h-3.5 w-3.5" />
                              {isOverdue ? (
                                `Overdue by ${Math.abs(daysUntilDue!)} days`
                              ) : daysUntilDue !== null && daysUntilDue <= 7 ? (
                                <span className="text-warning">{daysUntilDue} days left</span>
                              ) : (
                                `Due: ${formatDateForDisplay(goal.due_date, "MMM d, yyyy")}`
                              )}
                            </span>
                          )}
                          {goal.target_value && (
                            <span>
                              {goal.current_value || 0} / {goal.target_value}{" "}
                              {goal.unit_of_measure}
                            </span>
                          )}
                          {/* Check-in Due Date Indicator */}
                          {pendingCheckIns[goal.id] && pendingCheckIns[goal.id].daysToDue !== null && (
                            <Badge 
                              variant={pendingCheckIns[goal.id].daysToDue! <= 0 ? "destructive" : pendingCheckIns[goal.id].daysToDue! <= 3 ? "outline" : "secondary"}
                              className={`flex items-center gap-1 ${pendingCheckIns[goal.id].daysToDue! <= 3 ? "border-warning text-warning" : ""}`}
                            >
                              <Clock className="h-3 w-3" />
                              {pendingCheckIns[goal.id].daysToDue! <= 0 
                                ? "Check-in overdue" 
                                : `Check-in in ${pendingCheckIns[goal.id].daysToDue} days`}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Primary Actions */}
                        {isEditable && (
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(goal)}
                          >
                            <ClipboardCheck className="h-4 w-4 mr-1" />
                            Check-in
                          </Button>
                        )}
                        {isEditable && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateProgress(goal)}
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Update Progress
                          </Button>
                        )}
                        
                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewMilestones(goal)}>
                              <Flag className="mr-2 h-4 w-4" />
                              View Milestones
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewHistory(goal)}>
                              <History className="mr-2 h-4 w-4" />
                              Progress History
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewComments(goal)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Comments
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleContactManager(goal)}>
                              <UserCircle className="mr-2 h-4 w-4" />
                              Contact Manager
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className={`font-medium ${goal.progress_percentage >= 100 ? "text-success" : ""}`}>
                          {goal.progress_percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={goal.progress_percentage} 
                        className={`h-2 ${isOverdue ? "[&>div]:bg-warning" : ""}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Dialogs */}
        {selectedGoal && (
          <>
            <GoalProgressDialog
              open={progressDialogOpen}
              onOpenChange={setProgressDialogOpen}
              goal={selectedGoal as any}
              onSuccess={fetchGoals}
            />
            <GoalCommentsDialog
              open={commentsDialogOpen}
              onOpenChange={setCommentsDialogOpen}
              goalId={selectedGoal.id}
              goalTitle={selectedGoal.title}
            />
            <ContactManagerDialog
              open={contactManagerOpen}
              onOpenChange={setContactManagerOpen}
              goal={selectedGoal}
            />
            <GoalCheckInDialog
              open={checkInDialogOpen}
              onOpenChange={setCheckInDialogOpen}
              goal={selectedGoal as any}
              onSuccess={() => {
                fetchGoals();
                fetchPendingCheckIns();
              }}
            />
          </>
        )}
        
        {/* Milestones Dialog */}
        {selectedGoal && milestonesDialogOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Milestones: {selectedGoal.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setMilestonesDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[60vh]">
                <GoalMilestonesManager goalId={selectedGoal.id} />
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* History Dialog */}
        {selectedGoal && historyDialogOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Progress History: {selectedGoal.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setHistoryDialogOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[60vh]">
                <CheckInHistoryTimeline goalId={selectedGoal.id} showChart />
              </CardContent>
            </Card>
          </div>
        )}

        <GoalDialog
          open={createGoalOpen}
          onOpenChange={setCreateGoalOpen}
          goal={null}
          companyId={company?.id}
          employees={user ? [{ id: user.id, full_name: "Me" }] : []}
          onSuccess={fetchGoals}
        />
      </div>
    </AppLayout>
  );
}
