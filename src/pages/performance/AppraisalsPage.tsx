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
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  ClipboardCheck,
  Target,
  Users,
  BarChart3,
  HelpCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppraisalCycleDialog } from "@/components/performance/AppraisalCycleDialog";
import { AppraisalParticipantsManager } from "@/components/performance/AppraisalParticipantsManager";
import { AppraisalEvaluationDialog } from "@/components/performance/AppraisalEvaluationDialog";
import { format } from "date-fns";

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
}

interface MyAppraisal {
  id: string;
  cycle_id: string;
  cycle_name: string;
  evaluator_name: string | null;
  status: string;
  overall_score: number | null;
  competency_score: number | null;
  responsibility_score: number | null;
  goal_score: number | null;
  evaluation_deadline: string | null;
}

interface PendingEvaluation {
  id: string;
  employee_id: string;
  employee_name: string;
  cycle_id: string;
  cycle_name: string;
  status: string;
  evaluation_deadline: string | null;
}

const breadcrumbItems = [
  { label: "Performance", href: "/performance" },
  { label: "Appraisals" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  submitted: "bg-warning/10 text-warning",
  reviewed: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  finalized: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
};

const tabHelpText: Record<string, string> = {
  "my-appraisals": "View your performance appraisals across cycles. See your scores for competencies, responsibilities, and goals. Click on an appraisal to view detailed feedback.",
  "evaluate-team": "Evaluate team members assigned to you. Rate their competencies, responsibilities, and goals. Each category's item weights must total 100%.",
  "manage-cycles": "Create and manage appraisal cycles. Set category weights (competency, responsibility, goal) that total 100%. Add participants and track completion rates.",
};

export default function AppraisalsPage() {
  const { user, company, isAdmin, isHRManager } = useAuth();
  const [activeTab, setActiveTab] = useState("my-appraisals");
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [myAppraisals, setMyAppraisals] = useState<MyAppraisal[]>([]);
  const [pendingEvaluations, setPendingEvaluations] = useState<PendingEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | null>(null);
  const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<PendingEvaluation | null>(null);

  useEffect(() => {
    if (company?.id) {
      fetchData();
    }
  }, [company?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCycles(),
        fetchMyAppraisals(),
        fetchPendingEvaluations(),
      ]);
    } catch (error) {
      console.error("Error fetching appraisal data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    const { data, error } = await supabase
      .from("appraisal_cycles")
      .select("*")
      .eq("company_id", company?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cycles:", error);
      return;
    }

    // Get participant counts for each cycle
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

    setCycles(cyclesWithCounts);
  };

  const fetchMyAppraisals = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("appraisal_participants")
      .select(`
        id,
        cycle_id,
        status,
        overall_score,
        competency_score,
        responsibility_score,
        goal_score,
        appraisal_cycles!inner (
          name,
          evaluation_deadline
        ),
        evaluator:profiles!appraisal_participants_evaluator_id_fkey (
          full_name
        )
      `)
      .eq("employee_id", user.id);

    if (error) {
      console.error("Error fetching my appraisals:", error);
      return;
    }

    const formatted = (data || []).map((item: any) => ({
      id: item.id,
      cycle_id: item.cycle_id,
      cycle_name: item.appraisal_cycles?.name || "",
      evaluator_name: item.evaluator?.full_name || null,
      status: item.status,
      overall_score: item.overall_score,
      competency_score: item.competency_score,
      responsibility_score: item.responsibility_score,
      goal_score: item.goal_score,
      evaluation_deadline: item.appraisal_cycles?.evaluation_deadline || null,
    }));

    setMyAppraisals(formatted);
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
        employee:profiles!appraisal_participants_employee_id_fkey (
          full_name
        ),
        appraisal_cycles!inner (
          name,
          evaluation_deadline
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
    }));

    setPendingEvaluations(formatted);
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

  const handleStartEvaluation = (evaluation: PendingEvaluation) => {
    setSelectedParticipant(evaluation);
    setEvaluationDialogOpen(true);
  };

  const stats = {
    activeCycles: cycles.filter((c) => c.status === "active").length,
    pendingEvaluations: pendingEvaluations.length,
    completedAppraisals: myAppraisals.filter((a) => ["reviewed", "finalized"].includes(a.status)).length,
    myAppraisals: myAppraisals.length,
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Performance Appraisals
              </h1>
              <p className="text-muted-foreground">
                Evaluate employees on competencies, responsibilities, and goals
              </p>
            </div>
          </div>
          {(isAdmin || isHRManager) && (
            <Button onClick={handleCreateCycle}>
              <Plus className="mr-2 h-4 w-4" />
              Create Appraisal Cycle
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Cycles</p>
                  <p className="text-2xl font-bold">{stats.activeCycles}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Evaluations</p>
                  <p className="text-2xl font-bold">{stats.pendingEvaluations}</p>
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
                  <p className="text-2xl font-bold">{stats.completedAppraisals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Appraisals</p>
                  <p className="text-2xl font-bold">{stats.myAppraisals}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="my-appraisals" className="gap-2">
              <Target className="h-4 w-4" />
              My Appraisals
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                  <p className="text-sm leading-relaxed">{tabHelpText["my-appraisals"]}</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="evaluate-team" className="gap-2">
              <Users className="h-4 w-4" />
              Evaluate Team
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                  <p className="text-sm leading-relaxed">{tabHelpText["evaluate-team"]}</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            {(isAdmin || isHRManager) && (
              <TabsTrigger value="manage-cycles" className="gap-2">
                <Settings className="h-4 w-4" />
                Manage Cycles
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                    <p className="text-sm leading-relaxed">{tabHelpText["manage-cycles"]}</p>
                  </TooltipContent>
                </Tooltip>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="my-appraisals" className="mt-6">
            <div className="space-y-4">
              {myAppraisals.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No appraisals assigned to you yet</p>
                  </CardContent>
                </Card>
              ) : (
                myAppraisals.map((appraisal) => (
                  <Card key={appraisal.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{appraisal.cycle_name}</CardTitle>
                          <CardDescription>
                            Evaluator: {appraisal.evaluator_name || "Not assigned"}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[appraisal.status]}>
                          {appraisal.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Competency Score</p>
                          <p className="text-xl font-semibold">
                            {appraisal.competency_score?.toFixed(1) || "-"}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Responsibility Score</p>
                          <p className="text-xl font-semibold">
                            {appraisal.responsibility_score?.toFixed(1) || "-"}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Goal Score</p>
                          <p className="text-xl font-semibold">
                            {appraisal.goal_score?.toFixed(1) || "-"}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                          <p className="text-2xl font-bold text-primary">
                            {appraisal.overall_score?.toFixed(1) || "-"}%
                          </p>
                        </div>
                      </div>
                      {appraisal.evaluation_deadline && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Deadline: {format(new Date(appraisal.evaluation_deadline), "MMM d, yyyy")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="evaluate-team" className="mt-6">
            <div className="space-y-4">
              {pendingEvaluations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending evaluations</p>
                  </CardContent>
                </Card>
              ) : (
                pendingEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{evaluation.employee_name}</CardTitle>
                          <CardDescription>{evaluation.cycle_name}</CardDescription>
                        </div>
                        <Badge className={statusColors[evaluation.status]}>
                          {evaluation.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {evaluation.evaluation_deadline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Deadline: {format(new Date(evaluation.evaluation_deadline), "MMM d, yyyy")}
                          </div>
                        )}
                        <Button onClick={() => handleStartEvaluation(evaluation)}>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          {evaluation.status === "pending" ? "Start Evaluation" : "Continue Evaluation"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {(isAdmin || isHRManager) && (
            <TabsContent value="manage-cycles" className="mt-6">
              <div className="space-y-4">
                {cycles.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No appraisal cycles created yet</p>
                      <Button onClick={handleCreateCycle}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Cycle
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  cycles.map((cycle) => (
                    <Card key={cycle.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{cycle.name}</CardTitle>
                            <CardDescription>
                              {format(new Date(cycle.start_date), "MMM d, yyyy")} -{" "}
                              {format(new Date(cycle.end_date), "MMM d, yyyy")}
                            </CardDescription>
                          </div>
                          <Badge className={statusColors[cycle.status]}>{cycle.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Competency Weight</p>
                              <p className="text-xl font-semibold">{cycle.competency_weight}%</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Responsibility Weight</p>
                              <p className="text-xl font-semibold">{cycle.responsibility_weight}%</p>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm text-muted-foreground">Goal Weight</p>
                              <p className="text-xl font-semibold">{cycle.goal_weight}%</p>
                            </div>
                          </div>
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
                  ))
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>

        <AppraisalCycleDialog
          open={cycleDialogOpen}
          onOpenChange={setCycleDialogOpen}
          cycle={selectedCycle}
          companyId={company?.id}
          onSuccess={fetchData}
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
