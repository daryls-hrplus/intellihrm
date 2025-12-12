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
  Users,
  ClipboardList,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ReviewCycleDialog } from "@/components/performance/ReviewCycleDialog";
import { CycleParticipantsManager } from "@/components/performance/CycleParticipantsManager";
import { CycleQuestionsManager } from "@/components/performance/CycleQuestionsManager";
import { PeerNominationManager } from "@/components/performance/PeerNominationManager";
import { FeedbackFormDialog } from "@/components/performance/FeedbackFormDialog";
import { format } from "date-fns";

interface ReviewCycle {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  self_review_deadline: string | null;
  peer_nomination_deadline: string | null;
  feedback_deadline: string | null;
  status: string;
  include_self_review: boolean;
  include_manager_review: boolean;
  include_peer_review: boolean;
  include_direct_report_review: boolean;
  min_peer_reviewers: number;
  max_peer_reviewers: number;
  participants_count?: number;
  completion_rate?: number;
  is_manager_cycle?: boolean;
  created_by?: string;
}

interface FeedbackItem {
  id: string;
  participant_id: string;
  employee_id: string;
  employee_name: string;
  reviewer_type: string;
  cycle_id: string;
  cycle_name: string;
  deadline: string | null;
  status: string;
  is_central_cycle?: boolean;
  submitted_at?: string | null;
}

const breadcrumbItems = [
  { label: "Manager Self Service", href: "/mss" },
  { label: "360° Feedback" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  pending: "bg-muted text-muted-foreground",
  submitted: "bg-success/10 text-success",
};

const reviewerTypeLabels: Record<string, string> = {
  self: "Self Review",
  manager: "Manager Review",
  peer: "Peer Review",
  direct_report: "Direct Report Review",
};

export default function MssReview360Page() {
  const { user, company } = useAuth();
  const [activeTab, setActiveTab] = useState("team-cycles");
  const [myTeamCycles, setMyTeamCycles] = useState<ReviewCycle[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<FeedbackItem[]>([]);
  const [completedFeedback, setCompletedFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null);
  const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
  const [questionsManagerOpen, setQuestionsManagerOpen] = useState(false);
  const [peerNominationOpen, setPeerNominationOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);

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
        fetchPendingFeedback(),
        fetchCompletedFeedback(),
      ]);
    } catch (error) {
      console.error("Error fetching 360 data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTeamCycles = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("review_cycles")
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
          .from("review_participants")
          .select("*", { count: "exact", head: true })
          .eq("review_cycle_id", cycle.id);

        const { count: completed } = await supabase
          .from("review_participants")
          .select("*", { count: "exact", head: true })
          .eq("review_cycle_id", cycle.id)
          .eq("status", "completed");

        return {
          ...cycle,
          participants_count: total || 0,
          completion_rate: total ? Math.round(((completed || 0) / total) * 100) : 0,
        };
      })
    );

    setMyTeamCycles(cyclesWithCounts);
  };

  const fetchPendingFeedback = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("feedback_submissions")
      .select(`
        id,
        reviewer_type,
        status,
        review_participant:review_participants(
          id,
          employee_id,
          review_cycle:review_cycles(id, name, feedback_deadline, is_manager_cycle)
        )
      `)
      .eq("reviewer_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching pending feedback:", error);
      return;
    }

    const pending = await Promise.all(
      (data || []).map(async (item: any) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", item.review_participant?.employee_id)
          .single();

        return {
          id: item.id,
          participant_id: item.review_participant?.id,
          employee_id: item.review_participant?.employee_id,
          employee_name: profile?.full_name || "Unknown",
          reviewer_type: item.reviewer_type,
          cycle_id: item.review_participant?.review_cycle?.id,
          cycle_name: item.review_participant?.review_cycle?.name || "",
          deadline: item.review_participant?.review_cycle?.feedback_deadline,
          status: item.status,
          is_central_cycle: !item.review_participant?.review_cycle?.is_manager_cycle,
        };
      })
    );

    setPendingFeedback(pending);
  };

  const fetchCompletedFeedback = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("feedback_submissions")
      .select(`
        id,
        reviewer_type,
        status,
        submitted_at,
        review_participant:review_participants(
          id,
          employee_id,
          review_cycle:review_cycles(id, name, feedback_deadline, is_manager_cycle)
        )
      `)
      .eq("reviewer_id", user.id)
      .eq("status", "submitted");

    if (error) {
      console.error("Error fetching completed feedback:", error);
      return;
    }

    const completed = await Promise.all(
      (data || []).map(async (item: any) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", item.review_participant?.employee_id)
          .single();

        return {
          id: item.id,
          participant_id: item.review_participant?.id,
          employee_id: item.review_participant?.employee_id,
          employee_name: profile?.full_name || "Unknown",
          reviewer_type: item.reviewer_type,
          cycle_id: item.review_participant?.review_cycle?.id,
          cycle_name: item.review_participant?.review_cycle?.name || "",
          deadline: item.review_participant?.review_cycle?.feedback_deadline,
          status: item.status,
          is_central_cycle: !item.review_participant?.review_cycle?.is_manager_cycle,
          submitted_at: item.submitted_at,
        };
      })
    );

    setCompletedFeedback(completed);
  };

  const handleCreateCycle = () => {
    setSelectedCycle(null);
    setCycleDialogOpen(true);
  };

  const handleEditCycle = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setCycleDialogOpen(true);
  };

  const handleManageParticipants = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setParticipantsManagerOpen(true);
  };

  const handleManageQuestions = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setQuestionsManagerOpen(true);
  };

  const handleStartFeedback = (feedback: FeedbackItem) => {
    setSelectedFeedback(feedback);
    setFeedbackDialogOpen(true);
  };

  const stats = {
    activeCycles: myTeamCycles.filter((c) => c.status === "active" || c.status === "in_progress").length,
    pendingFeedback: pendingFeedback.length,
    totalCycles: myTeamCycles.length,
  };

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Team 360° Feedback
              </h1>
              <p className="text-muted-foreground">
                Create and manage 360° feedback cycles for your direct reports
              </p>
            </div>
          </div>
          <Button onClick={handleCreateCycle}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team Cycle
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
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
                  <p className="text-sm text-muted-foreground">Pending Feedback</p>
                  <p className="text-2xl font-bold">{stats.pendingFeedback}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cycles</p>
                  <p className="text-2xl font-bold">{stats.totalCycles}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="team-cycles" className="gap-2">
              <Users className="h-4 w-4" />
              Team Cycles
            </TabsTrigger>
            <TabsTrigger value="pending-feedback" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Pending Feedback
              {pendingFeedback.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingFeedback.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed-feedback" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed Feedback
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team-cycles" className="mt-6">
            <div className="space-y-4">
              {myTeamCycles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No team cycles created yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create 360° feedback cycles for your direct reports
                    </p>
                    <Button onClick={handleCreateCycle}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Team Cycle
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
                            {format(new Date(cycle.start_date), "MMM d, yyyy")} -{" "}
                            {format(new Date(cycle.end_date), "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">Team Cycle</Badge>
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
                              <UserPlus className="mr-2 h-4 w-4" />
                              Participants
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageQuestions(cycle)}
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Questions
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

          <TabsContent value="pending-feedback" className="mt-6">
            <div className="space-y-4">
              {pendingFeedback.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending feedback to provide</p>
                  </CardContent>
                </Card>
              ) : (
                pendingFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{feedback.employee_name}</CardTitle>
                          <CardDescription>
                            {feedback.cycle_name} • {reviewerTypeLabels[feedback.reviewer_type] || feedback.reviewer_type}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {feedback.is_central_cycle && (
                            <Badge variant="outline">Central Cycle</Badge>
                          )}
                          <Badge className={statusColors[feedback.status]}>
                            {feedback.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        {feedback.deadline && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            Deadline: {format(new Date(feedback.deadline), "MMM d, yyyy")}
                          </div>
                        )}
                        <Button onClick={() => handleStartFeedback(feedback)}>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Provide Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed-feedback" className="mt-6">
            <div className="space-y-4">
              {completedFeedback.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No completed feedback yet</p>
                  </CardContent>
                </Card>
              ) : (
                completedFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{feedback.employee_name}</CardTitle>
                          <CardDescription>
                            {feedback.cycle_name} • {reviewerTypeLabels[feedback.reviewer_type] || feedback.reviewer_type}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {feedback.is_central_cycle && (
                            <Badge variant="outline">Central Cycle</Badge>
                          )}
                          <Badge className={statusColors[feedback.status]}>
                            {feedback.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {feedback.submitted_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Submitted: {format(new Date(feedback.submitted_at), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                        <Button variant="outline" onClick={() => handleStartFeedback(feedback)}>
                          <ClipboardList className="mr-2 h-4 w-4" />
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

        <ReviewCycleDialog
          open={cycleDialogOpen}
          onOpenChange={setCycleDialogOpen}
          cycle={selectedCycle}
          companyId={company?.id}
          onSuccess={fetchData}
          isManagerCycle={true}
        />

        {selectedCycle && (
          <>
            <CycleParticipantsManager
              open={participantsManagerOpen}
              onOpenChange={setParticipantsManagerOpen}
              cycleId={selectedCycle.id}
              cycleName={selectedCycle.name}
              companyId={company?.id || ""}
              onUpdate={fetchData}
            />
            <CycleQuestionsManager
              open={questionsManagerOpen}
              onOpenChange={setQuestionsManagerOpen}
              cycleId={selectedCycle.id}
              cycleName={selectedCycle.name}
              companyId={company?.id || ""}
            />
          </>
        )}

        {selectedFeedback && (
          <FeedbackFormDialog
            open={feedbackDialogOpen}
            onOpenChange={setFeedbackDialogOpen}
            submissionId={selectedFeedback.id}
            participantId={selectedFeedback.participant_id}
            employeeName={selectedFeedback.employee_name}
            reviewerType={selectedFeedback.reviewer_type}
            onSuccess={fetchData}
          />
        )}
      </div>
    </AppLayout>
  );
}
