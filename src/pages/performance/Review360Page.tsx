import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  ClipboardList,
  BarChart3,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  Eye,
  MessageSquare,
  UserPlus,
  HelpCircle,
  Building2,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ReviewCycleDialog } from "@/components/performance/ReviewCycleDialog";
import { PendingReviewsCard } from "@/components/performance/PendingReviewsCard";
import { MyFeedbackSummary } from "@/components/performance/MyFeedbackSummary";
import { CycleParticipantsManager } from "@/components/performance/CycleParticipantsManager";
import { CycleQuestionsManager } from "@/components/performance/CycleQuestionsManager";
import { PeerNominationManager } from "@/components/performance/PeerNominationManager";
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
}

interface PendingReview {
  id: string;
  participant_id: string;
  employee_name: string;
  reviewer_type: string;
  cycle_name: string;
  deadline: string | null;
}

const breadcrumbItems = [
  { label: "Performance", href: "/performance" },
  { label: "360° Feedback" },
];

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-primary/10 text-primary",
  in_progress: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const tabHelpText: Record<string, string> = {
  "my-reviews": "View and complete feedback reviews assigned to you. Click on a pending review to provide feedback for colleagues, managers, or direct reports.",
  "my-feedback": "See aggregated feedback you've received from peers, managers, and direct reports. View scores and comments to understand your strengths and areas for improvement.",
  "manage-cycles": "Create and manage 360° review cycles. Configure participants, deadlines, review types, and questions. Track completion rates and export results.",
};

export default function Review360Page() {
  const { user, company, isAdmin, isHRManager } = useAuth();
  const [activeTab, setActiveTab] = useState("my-reviews");
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null);
  const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
  const [questionsManagerOpen, setQuestionsManagerOpen] = useState(false);
  const [peerNominationOpen, setPeerNominationOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  
  // Company switcher for admin/HR
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");

  useEffect(() => {
    if (isAdmin || isHRManager) {
      fetchCompanies();
    }
  }, [isAdmin, isHRManager]);

  useEffect(() => {
    // Set initial company when user's company loads
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchData();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(data || []);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCycles(),
        fetchPendingReviews(),
        fetchMyParticipations(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    const { data, error } = await supabase
      .from("review_cycles")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cycles:", error);
      return;
    }

    // Get participant counts
    const cyclesWithStats = await Promise.all(
      (data || []).map(async (cycle) => {
        const { count: participantCount } = await supabase
          .from("review_participants")
          .select("*", { count: "exact", head: true })
          .eq("review_cycle_id", cycle.id);

        const { count: completedCount } = await supabase
          .from("review_participants")
          .select("*", { count: "exact", head: true })
          .eq("review_cycle_id", cycle.id)
          .eq("status", "completed");

        return {
          ...cycle,
          participants_count: participantCount || 0,
          completion_rate: participantCount
            ? Math.round(((completedCount || 0) / participantCount) * 100)
            : 0,
        };
      })
    );

    setCycles(cyclesWithStats);
  };

  const fetchPendingReviews = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("feedback_submissions")
      .select(`
        id,
        reviewer_type,
        review_participant:review_participants(
          id,
          employee_id,
          review_cycle:review_cycles(name, feedback_deadline)
        )
      `)
      .eq("reviewer_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching pending reviews:", error);
      return;
    }

    // Get employee names
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
          employee_name: profile?.full_name || "Unknown",
          reviewer_type: item.reviewer_type,
          cycle_name: item.review_participant?.review_cycle?.name || "",
          deadline: item.review_participant?.review_cycle?.feedback_deadline,
        };
      })
    );

    setPendingReviews(pending);
  };

  const fetchMyParticipations = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("review_participants")
      .select(`
        *,
        review_cycle:review_cycles(name, status, feedback_deadline)
      `)
      .eq("employee_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching participations:", error);
      return;
    }

    setMyParticipations(data || []);
  };

  const handleCreateCycle = () => {
    setSelectedCycle(null);
    setCycleDialogOpen(true);
  };

  const handleEditCycle = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setCycleDialogOpen(true);
  };

  const stats = {
    activeCycles: cycles.filter((c) => c.status === "active" || c.status === "in_progress").length,
    pendingReviews: pendingReviews.length,
    completedCycles: cycles.filter((c) => c.status === "completed").length,
    myParticipations: myParticipations.length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Breadcrumbs items={breadcrumbItems} />
            <div className="flex items-center gap-3 mt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  360° Feedback
                </h1>
                <p className="text-muted-foreground">
                  Comprehensive feedback from all perspectives
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
                  <SelectValue placeholder="Select company" />
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
            {(isAdmin || isHRManager) && (
              <Button onClick={handleCreateCycle}>
                <Plus className="mr-2 h-4 w-4" />
                Create Review Cycle
              </Button>
            )}
          </div>
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
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Cycles</p>
                  <p className="text-2xl font-bold">{stats.completedCycles}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Participations</p>
                  <p className="text-2xl font-bold">{stats.myParticipations}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="my-reviews" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              My Reviews
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                  <p className="text-sm leading-relaxed">{tabHelpText["my-reviews"]}</p>
                </TooltipContent>
              </Tooltip>
            </TabsTrigger>
            <TabsTrigger value="my-feedback" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              My Feedback
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                  <p className="text-sm leading-relaxed">{tabHelpText["my-feedback"]}</p>
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

          <TabsContent value="my-reviews" className="mt-6">
            <div className="space-y-6">
              {/* Pending Reviews */}
              {pendingReviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Pending Reviews</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pendingReviews.map((review) => (
                      <PendingReviewsCard
                        key={review.id}
                        review={review}
                        onComplete={() => fetchData()}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* My Participations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">My Review Cycles</h3>
                {myParticipations.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      You are not part of any review cycles yet.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {myParticipations.map((participation) => (
                      <Card key={participation.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">
                              {participation.review_cycle?.name}
                            </CardTitle>
                            <Badge className={statusColors[participation.status]}>
                              {participation.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <CheckCircle className={`h-4 w-4 ${participation.self_review_completed ? "text-success" : "text-muted-foreground"}`} />
                              Self Review
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className={`h-4 w-4 ${participation.manager_review_completed ? "text-success" : "text-muted-foreground"}`} />
                              Manager Review
                            </div>
                          </div>
                          {participation.review_cycle?.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setSelectedParticipant(participation);
                                setPeerNominationOpen(true);
                              }}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Nominate Peers
                            </Button>
                          )}
                          {participation.overall_score && (
                            <div className="pt-2 border-t">
                              <p className="text-sm text-muted-foreground">Overall Score</p>
                              <p className="text-2xl font-bold text-primary">
                                {participation.overall_score.toFixed(1)}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-feedback" className="mt-6">
            <MyFeedbackSummary participations={myParticipations} />
          </TabsContent>

          {(isAdmin || isHRManager) && (
            <TabsContent value="manage-cycles" className="mt-6">
              <div className="space-y-4">
                {cycles.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">No Review Cycles</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first 360° feedback cycle to get started
                      </p>
                      <Button onClick={handleCreateCycle}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Review Cycle
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {cycles.map((cycle) => (
                      <Card key={cycle.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold">{cycle.name}</h3>
                                <Badge className={statusColors[cycle.status]}>
                                  {cycle.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {cycle.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(cycle.start_date), "MMM d")} - {format(new Date(cycle.end_date), "MMM d, yyyy")}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {cycle.participants_count} participants
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Completion</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={cycle.completion_rate} className="w-24 h-2" />
                                  <span className="text-sm font-medium">{cycle.completion_rate}%</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCycle(cycle);
                                    setParticipantsManagerOpen(true);
                                  }}
                                  title="Manage Participants"
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCycle(cycle);
                                    setQuestionsManagerOpen(true);
                                  }}
                                  title="Configure Questions"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCycle(cycle)}
                                  title="Edit Cycle"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <ReviewCycleDialog
        open={cycleDialogOpen}
        onOpenChange={setCycleDialogOpen}
        cycle={selectedCycle}
        companyId={selectedCompanyId}
        onSuccess={() => {
          fetchData();
          setCycleDialogOpen(false);
        }}
      />

      {selectedCycle && (
        <>
          <CycleParticipantsManager
            open={participantsManagerOpen}
            onOpenChange={setParticipantsManagerOpen}
            cycleId={selectedCycle.id}
            cycleName={selectedCycle.name}
            companyId={selectedCompanyId}
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

      {selectedParticipant && (
        <PeerNominationManager
          open={peerNominationOpen}
          onOpenChange={setPeerNominationOpen}
          participantId={selectedParticipant.id}
          cycleId={selectedParticipant.review_cycle_id}
          cycleName={selectedParticipant.review_cycle?.name || ""}
          companyId={company?.id || ""}
          minPeers={3}
          maxPeers={5}
          deadline={selectedParticipant.review_cycle?.peer_nomination_deadline}
        />
      )}
    </AppLayout>
  );
}