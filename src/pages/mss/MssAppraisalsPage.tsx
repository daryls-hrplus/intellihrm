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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppraisalCycleDialog } from "@/components/performance/AppraisalCycleDialog";
import { AppraisalParticipantsManager } from "@/components/performance/AppraisalParticipantsManager";
import { AppraisalEvaluationDialog } from "@/components/performance/AppraisalEvaluationDialog";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

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
}

const breadcrumbItems = [
  { label: "Manager Self Service", href: "/mss" },
  { label: "Performance Appraisals" },
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

export default function MssAppraisalsPage() {
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState("probation-reviews");
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
      .eq("is_probation_review", true)
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

  const stats = {
    activeCycles: myTeamCycles.filter((c) => c.status === "active").length,
    pendingEvaluations: pendingEvaluations.length,
    totalCycles: myTeamCycles.length,
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
                Team Probation Reviews
              </h1>
              <p className="text-muted-foreground">
                Create and manage probation reviews for your direct reports
              </p>
            </div>
          </div>
          <Button onClick={handleCreateCycle}>
            <Plus className="mr-2 h-4 w-4" />
            Create Probation Review
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Reviews</p>
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
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalCycles}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="probation-reviews" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Probation Reviews
            </TabsTrigger>
            <TabsTrigger value="pending-evaluations" className="gap-2">
              <Users className="h-4 w-4" />
              Pending Evaluations
              {pendingEvaluations.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingEvaluations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed-evaluations" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed Evaluations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="probation-reviews" className="mt-6">
            <div className="space-y-4">
              {myTeamCycles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No probation reviews created yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create probation reviews for your direct reports
                    </p>
                    <Button onClick={handleCreateCycle}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Probation Review
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                myTeamCycles.map((cycle) => (
                  <Card key={cycle.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cycle.name}</CardTitle>
                          <CardDescription>
                            {formatDateForDisplay(cycle.start_date)} -{" "}
                            {formatDateForDisplay(cycle.end_date)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">Probation Review</Badge>
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
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending-evaluations" className="mt-6">
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
                        <div className="flex gap-2">
                          {evaluation.is_central_cycle && (
                            <Badge variant="outline">Central Cycle</Badge>
                          )}
                          <Badge className={statusColors[evaluation.status]}>
                            {evaluation.status.replace("_", " ")}
                          </Badge>
                        </div>
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

          <TabsContent value="completed-evaluations" className="mt-6">
            <div className="space-y-4">
              {completedEvaluations.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed evaluations yet</p>
                  </CardContent>
                </Card>
              ) : (
                completedEvaluations.map((evaluation) => (
                  <Card key={evaluation.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{evaluation.employee_name}</CardTitle>
                          <CardDescription>{evaluation.cycle_name}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {evaluation.is_central_cycle && (
                            <Badge variant="outline">Central Cycle</Badge>
                          )}
                          <Badge className={statusColors[evaluation.status]}>
                            {evaluation.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {evaluation.overall_score && (
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Score: {evaluation.overall_score.toFixed(1)}
                            </div>
                          )}
                          {evaluation.submitted_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Submitted: {format(new Date(evaluation.submitted_at), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" onClick={() => handleStartEvaluation(evaluation)}>
                          <ClipboardCheck className="mr-2 h-4 w-4" />
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

        <AppraisalCycleDialog
          open={cycleDialogOpen}
          onOpenChange={setCycleDialogOpen}
          cycle={selectedCycle}
          companyId={company?.id}
          onSuccess={fetchData}
          isProbationReview={true}
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