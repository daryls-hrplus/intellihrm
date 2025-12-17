import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Target,
  Flag,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Building2,
  User,
  ChevronRight,
  LayoutGrid,
  List,
  UserCircle,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { GoalDialog } from "@/components/performance/GoalDialog";
import { GoalCard } from "@/components/performance/GoalCard";
import { GoalsList } from "@/components/performance/GoalsList";
import { GoalTemplatesManager } from "@/components/performance/GoalTemplatesManager";
import { GoalHierarchyView } from "@/components/performance/GoalHierarchyView";
import { ContactReportDialog } from "@/components/performance/ContactReportDialog";
import { GoalsAnalyticsDashboard } from "@/components/performance/GoalsAnalyticsDashboard";
import { GoalsFilters } from "@/components/performance/GoalsFilters";
import { EnhancedGoalCard } from "@/components/performance/EnhancedGoalCard";
import { GoalProgressDialog } from "@/components/performance/GoalProgressDialog";
import { GoalCommentsDialog } from "@/components/performance/GoalCommentsDialog";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useLanguage } from "@/hooks/useLanguage";
import { isPast } from "date-fns";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";

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
  employee?: { full_name: string } | null;
  department?: { name: string } | null;
}

const statusColors: Record<GoalStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  overdue: "bg-warning/10 text-warning",
};

const breadcrumbItems = [
  { label: "Performance", href: "/performance" },
  { label: "Goals" },
];

export default function GoalsPage() {
  const { t } = useLanguage();
  const { user, company, isAdmin, isHRManager } = useAuth();
  const { logView } = useAuditLog();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState("my-goals");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [directReports, setDirectReports] = useState<{ employee_id: string; employee_name: string; position_title: string }[]>([]);
  const [directReportGoals, setDirectReportGoals] = useState<Goal[]>([]);
  const [contactReportOpen, setContactReportOpen] = useState(false);
  const [selectedReportGoal, setSelectedReportGoal] = useState<Goal | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);

  // Fetch companies for company switcher
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  // Fetch employees when company is selected
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!selectedCompanyId) return;
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", selectedCompanyId)
        .order("full_name");
      setEmployees((data as { id: string; full_name: string }[]) || []);
    };
    fetchEmployees();
  }, [selectedCompanyId]);

  // Update selectedCompanyId when company from auth changes
  useEffect(() => {
    if (company?.id) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id]);

  // Fetch direct reports for manager
  useEffect(() => {
    const fetchDirectReports = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase.rpc("get_manager_direct_reports", {
          p_manager_id: user.id,
        });

        if (error) throw error;
        setDirectReports((data as { employee_id: string; employee_name: string; position_title: string }[]) || []);
      } catch (error) {
        console.error("Error fetching direct reports:", error);
      }
    };

    fetchDirectReports();
  }, [user?.id]);

  // Fetch goals of direct reports when on direct-reports tab
  useEffect(() => {
    const fetchDirectReportGoals = async () => {
      if (activeTab !== "direct-reports" || directReports.length === 0) {
        setDirectReportGoals([]);
        return;
      }

      setLoading(true);
      try {
        const reportIds = directReports.map((r) => r.employee_id);
        const { data, error } = await supabase
          .from("performance_goals")
          .select(`
            *,
            employee:profiles!performance_goals_employee_id_fkey(full_name),
            department:departments(name)
          `)
          .in("employee_id", reportIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDirectReportGoals((data as Goal[]) || []);
      } catch (error) {
        console.error("Error fetching direct report goals:", error);
        toast.error("Failed to load team member goals");
      } finally {
        setLoading(false);
      }
    };

    fetchDirectReportGoals();
  }, [activeTab, directReports]);

  const fetchGoals = async () => {
    const companyIdToUse = selectedCompanyId || company?.id;
    if (!companyIdToUse) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("performance_goals")
        .select(`
          *,
          employee:profiles!performance_goals_employee_id_fkey(full_name),
          department:departments(name)
        `)
        .eq("company_id", companyIdToUse)
        .order("created_at", { ascending: false });

      if (activeTab === "my-goals" && user?.id) {
        query = query.eq("employee_id", user.id);
      } else if (activeTab === "team-goals") {
        query = query.in("goal_level", ["team", "department"]);
      } else if (activeTab === "company-goals") {
        query = query.eq("goal_level", "company");
      }

      const { data, error } = await query;

      if (error) throw error;
      setGoals((data as Goal[]) || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const companyIdToUse = selectedCompanyId || company?.id;
    if (companyIdToUse) {
      fetchGoals();
    }
  }, [selectedCompanyId, company?.id, activeTab]);

  useEffect(() => {
    logView("performance_goals", undefined, "Goals Page");
  }, []);

  // Filtered goals with overdue check
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch =
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Handle overdue status filter
      const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
      const effectiveStatus = isOverdue ? "overdue" : goal.status;
      const matchesStatus = statusFilter === "all" || effectiveStatus === statusFilter;
      
      const matchesLevel = levelFilter === "all" || goal.goal_level === levelFilter;
      const matchesType = typeFilter === "all" || goal.goal_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesLevel && matchesType;
    });
  }, [goals, searchQuery, statusFilter, levelFilter, typeFilter]);

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== "all" || levelFilter !== "all" || typeFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setLevelFilter("all");
    setTypeFilter("all");
  };

  const handleExport = () => {
    const data = filteredGoals.map(goal => ({
      Title: goal.title,
      Type: goal.goal_type.replace(/_/g, " "),
      Level: goal.goal_level,
      Status: goal.status,
      Progress: `${goal.progress_percentage}%`,
      Weight: `${goal.weighting}%`,
      "Due Date": goal.due_date ? formatDateForDisplay(goal.due_date, "yyyy-MM-dd") : "",
      Owner: goal.employee?.full_name || "",
    }));

    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(row => Object.values(row).join(",")).join("\n");
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goals-${getTodayString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Goals exported successfully");
  };

  // Stats with overdue calculation
  const overdueCount = goals.filter(g => 
    g.due_date && isPast(new Date(g.due_date)) && g.status !== "completed"
  ).length;

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "active" || g.status === "in_progress").length,
    completed: goals.filter((g) => g.status === "completed").length,
    overdue: overdueCount,
    avgProgress: goals.length > 0
      ? Math.round(goals.reduce((acc, g) => acc + (g.progress_percentage || 0), 0) / goals.length)
      : 0,
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setDialogOpen(true);
  };

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setDialogOpen(true);
  };

  const handleContactReport = (goal: Goal) => {
    setSelectedReportGoal(goal);
    setContactReportOpen(true);
  };

  const handleUpdateProgress = (goal: Goal) => {
    setSelectedGoal(goal);
    setProgressDialogOpen(true);
  };

  const handleViewComments = (goal: Goal) => {
    setSelectedGoal(goal);
    setCommentsDialogOpen(true);
  };

  const filteredDirectReportGoals = useMemo(() => {
    return directReportGoals.filter((goal) => {
      const matchesSearch =
        goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isOverdue = goal.due_date && isPast(new Date(goal.due_date)) && goal.status !== "completed";
      const effectiveStatus = isOverdue ? "overdue" : goal.status;
      const matchesStatus = statusFilter === "all" || effectiveStatus === statusFilter;
      
      const matchesLevel = levelFilter === "all" || goal.goal_level === levelFilter;
      const matchesType = typeFilter === "all" || goal.goal_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesLevel && matchesType;
    });
  }, [directReportGoals, searchQuery, statusFilter, levelFilter, typeFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Flag className="h-5 w-5 text-success" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t('performance.goals.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('performance.goals.subtitle')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Company Switcher */}
            {(isAdmin || isHRManager) && companies.length > 0 && (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('performance.goals.selectCompany')} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" onClick={() => setShowAnalytics(!showAnalytics)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              {showAnalytics ? t('performance.goals.hideAnalytics') : t('performance.goals.showAnalytics')}
            </Button>
            <Button onClick={handleCreateGoal}>
              <Plus className="mr-2 h-4 w-4" />
              {t('performance.goals.createGoal')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('performance.stats.totalGoals')}</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('performance.stats.active')}</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.overdue > 0 ? "border-warning/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('performance.stats.overdue')}</p>
                  <p className={`text-2xl font-bold ${stats.overdue > 0 ? "text-warning" : ""}`}>
                    {stats.overdue}
                  </p>
                </div>
                <AlertCircle className={`h-8 w-8 ${stats.overdue > 0 ? "text-warning" : "text-muted-foreground"}`} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('performance.stats.completed')}</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('performance.stats.avgProgress')}</p>
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Dashboard - uses filtered data */}
        {showAnalytics && filteredGoals.length > 0 && (
          <GoalsAnalyticsDashboard goals={filteredGoals} />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="flex-wrap">
              <TabsTrigger value="my-goals" className="gap-2">
                <User className="h-4 w-4" />
                {t('performance.goals.myGoals')}
              </TabsTrigger>
              {directReports.length > 0 && (
                <TabsTrigger value="direct-reports" className="gap-2">
                  <UserCircle className="h-4 w-4" />
                  {t('performance.goals.directReports')}
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {directReports.length}
                  </Badge>
                </TabsTrigger>
              )}
              <TabsTrigger value="team-goals" className="gap-2">
                <Users className="h-4 w-4" />
                {t('performance.goals.teamGoals')}
              </TabsTrigger>
              <TabsTrigger value="company-goals" className="gap-2">
                <Building2 className="h-4 w-4" />
                {t('performance.goals.companyGoals')}
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="gap-2">
                <ChevronRight className="h-4 w-4" />
                {t('performance.goals.hierarchy')}
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                {t('performance.goals.templates')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Filters */}
          <div className="mt-4">
            <GoalsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              levelFilter={levelFilter}
              onLevelChange={setLevelFilter}
              onExport={handleExport}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle
            />
          </div>

          <TabsContent value="my-goals" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">{t('common.loading')}</div>
            ) : filteredGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {hasActiveFilters ? t('common.noResults') : t('performance.goals.noGoalsFound')}
                  </p>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={clearFilters}>{t('performance.goals.filters.clearFilters')}</Button>
                  ) : (
                    <Button onClick={handleCreateGoal}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('performance.goals.createGoal')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <EnhancedGoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={handleEditGoal} 
                    onRefresh={fetchGoals}
                    onUpdateProgress={handleUpdateProgress}
                    onViewComments={handleViewComments}
                  />
                ))}
              </div>
            ) : (
              <GoalsList goals={filteredGoals} onEdit={handleEditGoal} onRefresh={fetchGoals} />
            )}
          </TabsContent>

          <TabsContent value="team-goals" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading goals...</div>
            ) : filteredGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No team goals found.</p>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <EnhancedGoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={handleEditGoal} 
                    onRefresh={fetchGoals}
                    showOwner
                  />
                ))}
              </div>
            ) : (
              <GoalsList goals={filteredGoals} onEdit={handleEditGoal} onRefresh={fetchGoals} />
            )}
          </TabsContent>

          <TabsContent value="company-goals" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading goals...</div>
            ) : filteredGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No company goals found.</p>
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <EnhancedGoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={handleEditGoal} 
                    onRefresh={fetchGoals}
                  />
                ))}
              </div>
            ) : (
              <GoalsList goals={filteredGoals} onEdit={handleEditGoal} onRefresh={fetchGoals} />
            )}
          </TabsContent>

          <TabsContent value="hierarchy" className="mt-6">
            <GoalHierarchyView companyId={company?.id} />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <GoalTemplatesManager companyId={company?.id} />
          </TabsContent>

          <TabsContent value="direct-reports" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading team goals...</div>
            ) : directReports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                You don't have any direct reports.
              </div>
            ) : filteredDirectReportGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {hasActiveFilters ? "No goals match your filters" : "No goals found for your direct reports."}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDirectReportGoals.map((goal) => (
                  <EnhancedGoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onEdit={handleEditGoal} 
                    onRefresh={fetchGoals}
                    onUpdateProgress={handleUpdateProgress}
                    onViewComments={handleViewComments}
                    showOwner
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDirectReportGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {goal.employee?.full_name}
                          </p>
                        </div>
                        <Badge className={statusColors[goal.status]}>
                          {goal.status.replace("_", " ")}
                        </Badge>
                        <div className="w-32">
                          <Progress value={goal.progress_percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {goal.progress_percentage}%
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditGoal(goal)}
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleContactReport(goal)}
                          >
                            <UserCircle className="mr-1 h-4 w-4" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={selectedGoal}
        companyId={selectedCompanyId || company?.id}
        employees={employees}
        onSuccess={fetchGoals}
      />

      {selectedReportGoal && (
        <ContactReportDialog
          open={contactReportOpen}
          onOpenChange={setContactReportOpen}
          goal={selectedReportGoal}
        />
      )}

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
        </>
      )}
    </AppLayout>
  );
}
