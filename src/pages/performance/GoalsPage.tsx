import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { GoalDialog } from "@/components/performance/GoalDialog";
import { GoalCard } from "@/components/performance/GoalCard";
import { GoalsList } from "@/components/performance/GoalsList";
import { GoalTemplatesManager } from "@/components/performance/GoalTemplatesManager";
import { GoalHierarchyView } from "@/components/performance/GoalHierarchyView";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Label } from "@/components/ui/label";

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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

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
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id]);

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

  const filteredGoals = goals.filter((goal) => {
    const matchesSearch =
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || goal.status === statusFilter;
    const matchesLevel = levelFilter === "all" || goal.goal_level === levelFilter;
    const matchesType = typeFilter === "all" || goal.goal_type === typeFilter;
    return matchesSearch && matchesStatus && matchesLevel && matchesType;
  });

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === "active" || g.status === "in_progress").length,
    completed: goals.filter((g) => g.status === "completed").length,
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
                  Goals Management
                </h1>
                <p className="text-muted-foreground">
                  Set, track, and achieve your performance goals
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
                  <SelectValue placeholder="Select Company" />
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
            <Button onClick={handleCreateGoal}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Goals</p>
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
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
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
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="my-goals" className="gap-2">
                <User className="h-4 w-4" />
                My Goals
              </TabsTrigger>
              <TabsTrigger value="team-goals" className="gap-2">
                <Users className="h-4 w-4" />
                Team Goals
              </TabsTrigger>
              <TabsTrigger value="company-goals" className="gap-2">
                <Building2 className="h-4 w-4" />
                Company Goals
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="gap-2">
                <ChevronRight className="h-4 w-4" />
                Hierarchy
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <LayoutGrid className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="smart_goal">SMART Goal</SelectItem>
                <SelectItem value="okr_objective">OKR Objective</SelectItem>
                <SelectItem value="okr_key_result">Key Result</SelectItem>
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="my-goals" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading goals...</div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEditGoal} onRefresh={fetchGoals} />
                ))}
                {filteredGoals.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No goals found. Create your first goal to get started.
                  </div>
                )}
              </div>
            ) : (
              <GoalsList goals={filteredGoals} onEdit={handleEditGoal} onRefresh={fetchGoals} />
            )}
          </TabsContent>

          <TabsContent value="team-goals" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading goals...</div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEditGoal} onRefresh={fetchGoals} />
                ))}
                {filteredGoals.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No team goals found.
                  </div>
                )}
              </div>
            ) : (
              <GoalsList goals={filteredGoals} onEdit={handleEditGoal} onRefresh={fetchGoals} />
            )}
          </TabsContent>

          <TabsContent value="company-goals" className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading goals...</div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onEdit={handleEditGoal} onRefresh={fetchGoals} />
                ))}
                {filteredGoals.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No company goals found.
                  </div>
                )}
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
    </AppLayout>
  );
}
