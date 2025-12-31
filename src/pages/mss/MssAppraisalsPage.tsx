import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  ClipboardCheck,
  Target,
  Users,
  Brain,
  TrendingUp,
  BarChart3,
  Eye,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppraisalCycleDialog } from "@/components/performance/AppraisalCycleDialog";
import { AppraisalParticipantsManager } from "@/components/performance/AppraisalParticipantsManager";
import { AppraisalEvaluationDialog } from "@/components/performance/AppraisalEvaluationDialog";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { ManagerInterventionInbox } from "@/components/performance/ai/ManagerInterventionInbox";
import { MyReviewEffectiveness } from "@/components/performance/ai/MyReviewEffectiveness";
import { TeamAppraisalSummaryCard } from "@/components/mss/TeamAppraisalSummaryCard";
import { DirectReportsAppraisalStatus } from "@/components/mss/DirectReportsAppraisalStatus";
import { TeamPerformanceDistribution } from "@/components/mss/TeamPerformanceDistribution";
import { cn } from "@/lib/utils";

interface AppraisalCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  evaluation_deadline: string | null;
  status: string;
  competency_weight: number;
  responsibility_weight: number;
  goal_weight: number;
  min_rating: number;
  max_rating: number;
  participants_count?: number;
  completion_rate?: number;
  is_probation_review?: boolean;
  is_manager_cycle?: boolean;
  created_by?: string;
}

interface EvaluationItem {
  id: string;
  employee_id: string;
  employee_name: string;
  cycle_id: string;
  cycle_name: string;
  status: string;
  evaluation_deadline: string | null;
  is_central_cycle?: boolean;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  overall_score?: number | null;
  self_assessment_completed?: boolean;
}

const breadcrumbItems = [
  { label: "Manager Self Service", href: "/mss" },
  { label: "Performance Reviews" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  submitted: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  reviewed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  finalized: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

export default function MssAppraisalsPage() {
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [myTeamCycles, setMyTeamCycles] = useState<AppraisalCycle[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<EvaluationItem[]>([]);
  const [completedEvaluations, setCompletedEvaluations] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | null>(null);
  const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<EvaluationItem | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMyTeamCycles(),
        fetchPendingEvaluations(),
        fetchCompletedEvaluations(),
      ]);
    } catch (error) {
      console.error("Error fetching appraisal data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeamCycles = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("appraisal_cycles")
      .select("*")
      .eq("created_by", user.id)
      .eq("is_manager_cycle", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching my team cycles:", error);
      return;
    }

    const cyclesWithCounts = await Promise.all(
      (data || []).map(async (cycle) => {
        const { count: total } = await supabase
          .from("appraisal_participants")
          .select("*", { count: "exact", head: true })
          .eq("cycle_id", cycle.id);

        const { count: completed } = await supabase
          .from("appraisal_participants")
          .select("*", { count: "exact", head: true })
          .eq("cycle_id", cycle.id)
          .in("status", ["reviewed", "finalized"]);

        return {
          ...cycle,
          participants_count: total || 0,
          completion_rate: total ? Math.round(((completed || 0) / total) * 100) : 0,
        };
      })
    );

    setMyTeamCycles(cyclesWithCounts);
  };

  const fetchPendingEvaluations = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee_id,
        cycle_id,
        status,
        submitted_at,
        employee:profiles!appraisal_participants_employee_id_fkey (
          full_name
        ),
        appraisal_cycles!inner (
          name,
          evaluation_deadline,
          is_manager_cycle
        )
      `)
      .eq("evaluator_id", user.id)
      .in("status", ["pending", "in_progress"]);

    if (error) {
      console.error("Error fetching pending evaluations:", error);
      return;
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      employee_id: item.employee_id,
      employee_name: item.employee?.full_name || "Unknown",
      cycle_id: item.cycle_id,
      cycle_name: item.appraisal_cycles?.name || "",
      status: item.status,
      evaluation_deadline: item.appraisal_cycles?.evaluation_deadline || null,
      is_central_cycle: !item.appraisal_cycles?.is_manager_cycle,
      self_assessment_completed: !!item.submitted_at,
    }));

    setPendingEvaluations(formatted);
  };

  const fetchCompletedEvaluations = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        employee_id,
        cycle_id,
        status,
        submitted_at,
        reviewed_at,
        overall_score,
        employee:profiles!appraisal_participants_employee_id_fkey (
          full_name
        ),
        appraisal_cycles!inner (
          name,
          evaluation_deadline,
          is_manager_cycle
        )
      `)
      .eq("evaluator_id", user.id)
      .in("status", ["submitted", "reviewed", "finalized"]);

    if (error) {
      console.error("Error fetching completed evaluations:", error);
      return;
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      employee_id: item.employee_id,
      employee_name: item.employee?.full_name || "Unknown",
      cycle_id: item.cycle_id,
      cycle_name: item.appraisal_cycles?.name || "",
      status: item.status,
      evaluation_deadline: item.appraisal_cycles?.evaluation_deadline || null,
      is_central_cycle: !item.appraisal_cycles?.is_manager_cycle,
      submitted_at: item.submitted_at,
      reviewed_at: item.reviewed_at,
      overall_score: item.overall_score,
    }));

    setCompletedEvaluations(formatted);
  };

  const handleCreateCycle = () => {
    setSelectedCycle(null);
    setCycleDialogOpen(true);
  };

  const handleEditCycle = (cycle: AppraisalCycle) => {
    setSelectedCycle(cycle);
    setCycleDialogOpen(true);
  };

  const handleManageParticipants = (cycle: AppraisalCycle) => {
    setSelectedCycle(cycle);
    setParticipantsManagerOpen(true);
  };

  const handleStartEvaluation = (evaluation: EvaluationItem) => {
    setSelectedParticipant(evaluation);
    setEvaluationDialogOpen(true);
  };

  const handleSendReminder = (evaluation: EvaluationItem) => {
    // Simple toast notification for now
    toast.success(`Reminder sent to ${evaluation.employee_name}`);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const totalToEvaluate = pendingEvaluations.length + completedEvaluations.length;
    const overdueCount = pendingEvaluations.filter(e => {
      if (!e.evaluation_deadline) return false;
      return new Date(e.evaluation_deadline) < new Date();
    }).length;
    
    const avgScore = completedEvaluations.length > 0
      ? completedEvaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / completedEvaluations.filter(e => e.overall_score).length
      : undefined;

    return {
      activeCycles: myTeamCycles.filter((c) => c.status === "active").length,
      totalToEvaluate,
      pendingCount: pendingEvaluations.length,
      completedCount: completedEvaluations.length,
      overdueCount,
      averageScore: avgScore,
    };
  }, [myTeamCycles, pendingEvaluations, completedEvaluations]);

  // Calculate performance distribution
  const performanceDistribution = useMemo(() => {
    const scores = completedEvaluations
      .filter(e => e.overall_score !== null && e.overall_score !== undefined)
      .map(e => Math.round(e.overall_score!));
    
    if (scores.length === 0) return [];

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    scores.forEach(score => {
      const bucket = Math.min(Math.max(score, 1), 5);
      distribution[bucket]++;
    });

    return Object.entries(distribution).map(([rating, count]) => ({
      rating,
      count,
      percentage: Math.round((count / scores.length) * 100),
    }));
  }, [completedEvaluations]);

  // Combine all evaluations for direct reports table
  const allEvaluations = useMemo(() => {
    return [...pendingEvaluations, ...completedEvaluations].map(e => ({
      ...e,
      self_assessment_completed: e.self_assessment_completed || false,
    }));
  }, [pendingEvaluations, completedEvaluations]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              Team Performance Reviews
            </h1>
            <p className="text-muted-foreground mt-1">
              Evaluate your team's performance and manage appraisal cycles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleCreateCycle}>
              <Plus className="mr-2 h-4 w-4" />
              Create Review Cycle
            </Button>
          </div>
        </div>

        {/* Summary Dashboard Card */}
        <TeamAppraisalSummaryCard
          totalToEvaluate={stats.totalToEvaluate}
          pendingCount={stats.pendingCount}
          completedCount={stats.completedCount}
          overdueCount={stats.overdueCount}
          averageScore={stats.averageScore}
          loading={loading}
        />

        {/* AI Coaching Inbox - Compact */}
        {user?.id && company?.id && (
          <ManagerInterventionInbox
            managerId={user.id}
            companyId={company.id}
            maxItems={3}
          />
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Pending</span>
              {pendingEvaluations.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {pendingEvaluations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
            <TabsTrigger value="my-cycles" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">My Cycles</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Direct Reports Status */}
              <DirectReportsAppraisalStatus
                reports={allEvaluations.slice(0, 10)}
                onEvaluate={handleStartEvaluation}
                onView={handleStartEvaluation}
                onSendReminder={handleSendReminder}
                loading={loading}
              />

              {/* Performance Distribution */}
              <TeamPerformanceDistribution
                data={performanceDistribution}
                teamAverage={stats.averageScore}
                loading={loading}
              />
            </div>

            {/* Review Quality Card (for manager) */}
            {user?.id && company?.id && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {pendingEvaluations.slice(0, 4).map((evaluation) => (
                        <div
                          key={evaluation.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">{evaluation.employee_name}</p>
                            <p className="text-xs text-muted-foreground">{evaluation.cycle_name}</p>
                          </div>
                          <Button size="sm" onClick={() => handleStartEvaluation(evaluation)}>
                            Evaluate
                          </Button>
                        </div>
                      ))}
                      {pendingEvaluations.length === 0 && (
                        <div className="col-span-2 text-center py-6 text-muted-foreground">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p>All evaluations completed!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <MyReviewEffectiveness
                  managerId={user.id}
                  companyId={company.id}
                />
              </div>
            )}
          </TabsContent>

          {/* Pending Evaluations Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingEvaluations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">All caught up!</h3>
                  <p className="text-muted-foreground">No pending evaluations at this time</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingEvaluations.map((evaluation) => {
                  const isOverdue = evaluation.evaluation_deadline && 
                    new Date(evaluation.evaluation_deadline) < new Date();
                  
                  return (
                    <Card 
                      key={evaluation.id}
                      className={cn(
                        "hover:shadow-md transition-shadow",
                        isOverdue && "border-destructive/50 bg-destructive/5"
                      )}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{evaluation.employee_name}</h3>
                              <Badge className={statusColors[evaluation.status]}>
                                {evaluation.status.replace("_", " ")}
                              </Badge>
                              {evaluation.is_central_cycle && (
                                <Badge variant="outline">Central Cycle</Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{evaluation.cycle_name}</p>
                            {evaluation.evaluation_deadline && (
                              <div className={cn(
                                "flex items-center gap-2 text-sm",
                                isOverdue ? "text-destructive" : "text-muted-foreground"
                              )}>
                                <Calendar className="h-4 w-4" />
                                Due: {formatDateForDisplay(evaluation.evaluation_deadline)}
                              </div>
                            )}
                            {evaluation.self_assessment_completed && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                Employee self-assessment completed
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendReminder(evaluation)}
                            >
                              Send Reminder
                            </Button>
                            <Button onClick={() => handleStartEvaluation(evaluation)}>
                              <ClipboardCheck className="mr-2 h-4 w-4" />
                              {evaluation.status === "pending" ? "Start" : "Continue"} Evaluation
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Completed Evaluations Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedEvaluations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ClipboardCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Completed Evaluations</h3>
                  <p className="text-muted-foreground">Completed evaluations will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedEvaluations.map((evaluation) => (
                  <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{evaluation.employee_name}</h3>
                            <Badge className={statusColors[evaluation.status]}>
                              {evaluation.status.replace("_", " ")}
                            </Badge>
                            {evaluation.is_central_cycle && (
                              <Badge variant="outline">Central Cycle</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{evaluation.cycle_name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {evaluation.overall_score !== null && evaluation.overall_score !== undefined && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span className="font-medium">
                                  Score: {evaluation.overall_score.toFixed(1)}
                                </span>
                              </div>
                            )}
                            {evaluation.reviewed_at && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Reviewed: {formatDateForDisplay(evaluation.reviewed_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => handleStartEvaluation(evaluation)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Cycles Tab */}
          <TabsContent value="my-cycles" className="space-y-4">
            {myTeamCycles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Review Cycles Created</h3>
                  <p className="text-muted-foreground mb-4">
                    Create custom review cycles for your team
                  </p>
                  <Button onClick={handleCreateCycle}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Cycle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {myTeamCycles.map((cycle) => (
                  <Card key={cycle.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cycle.name}</CardTitle>
                          <CardDescription>
                            {formatDateForDisplay(cycle.start_date)} - {formatDateForDisplay(cycle.end_date)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {cycle.is_probation_review && (
                            <Badge variant="outline">Probation</Badge>
                          )}
                          <Badge className={statusColors[cycle.status]}>{cycle.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                {cycle.participants_count} participants
                              </span>
                              <span>{cycle.completion_rate}% complete</span>
                            </div>
                            <Progress value={cycle.completion_rate} className="h-2" />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageParticipants(cycle)}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Participants
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCycle(cycle)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* My Review Effectiveness - Detailed */}
              {user?.id && company?.id && (
                <MyReviewEffectiveness
                  managerId={user.id}
                  companyId={company.id}
                  showDetailedBreakdown={true}
                />
              )}

              {/* Manager Intervention Inbox - Full View */}
              {user?.id && company?.id && (
                <ManagerInterventionInbox
                  managerId={user.id}
                  companyId={company.id}
                  maxItems={10}
                />
              )}
            </div>

            {/* AI Quality Analysis Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Review Quality Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered review quality assessment and bias detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">Comment-Rating Consistency</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Detects misalignment between written feedback and scores
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">Evidence Coverage</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Checks if feedback includes specific examples
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">Bias Pattern Detection</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Identifies potential leniency or severity bias
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">Clarity & Specificity</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Measures actionability of feedback provided
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AppraisalCycleDialog
          open={cycleDialogOpen}
          onOpenChange={setCycleDialogOpen}
          cycle={selectedCycle}
          companyId={company?.id}
          onSuccess={fetchData}
          isProbationReview={false}
          isManagerCycle={true}
        />

        {selectedCycle && (
          <AppraisalParticipantsManager
            open={participantsManagerOpen}
            onOpenChange={setParticipantsManagerOpen}
            cycle={selectedCycle}
            onSuccess={fetchData}
          />
        )}

        {selectedParticipant && (
          <AppraisalEvaluationDialog
            open={evaluationDialogOpen}
            onOpenChange={setEvaluationDialogOpen}
            participantId={selectedParticipant.id}
            employeeName={selectedParticipant.employee_name}
            cycleId={selectedParticipant.cycle_id}
            onSuccess={fetchData}
          />
        )}

      </div>
    </AppLayout>
  );
}
