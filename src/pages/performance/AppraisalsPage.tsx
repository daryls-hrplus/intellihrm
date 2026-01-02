import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  ClipboardCheck,
  Users,
  BarChart3,
  Building2,
  Scale,
  Target,
  TrendingUp,
  CalendarClock,
  FileCheck,
  Brain,
  ExternalLink,
  Percent,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AppraisalCycleDialog } from "@/components/performance/AppraisalCycleDialog";
import { AppraisalParticipantsManager } from "@/components/performance/AppraisalParticipantsManager";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useCalibrationSessions } from "@/hooks/useCalibrationSessions";
import { useGoalApprovals } from "@/hooks/useGoalApprovals";
import { useTalentRiskAnalysis } from "@/hooks/useTalentRiskAnalysis";
import { useAppraisalInterviews } from "@/hooks/useAppraisalInterviews";
import { GoalApprovalInbox } from "@/components/performance/GoalApprovalInbox";
import { TalentRiskList } from "@/components/performance/TalentRiskList";
import { PerformanceDistributionChart } from "@/components/performance/analytics/PerformanceDistributionChart";
import { CalibrationSessionCard } from "@/components/calibration/CalibrationSessionCard";
import { AppraisalInterviewCalendar } from "@/components/appraisals/AppraisalInterviewCalendar";
import { AITransparencyBanner } from "@/components/ai-governance/AITransparencyBanner";
import { AIExplainabilityPanel } from "@/components/ai-governance/AIExplainabilityPanel";
import { AIHumanOverrideDialog } from "@/components/ai-governance/AIHumanOverrideDialog";
import { AIBiasAlertBanner } from "@/components/ai-governance/AIBiasAlertBanner";
import { AIAuditTrailPanel } from "@/components/ai-governance/AIAuditTrailPanel";

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
  completed_count?: number;
  is_probation_review?: boolean;
  is_manager_cycle?: boolean;
  created_by?: string;
}

const breadcrumbItems = [
  { label: "Performance", href: "/performance" },
  { label: "Appraisal Administration" },
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
  scheduled: "bg-info/10 text-info",
};

export default function AppraisalsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, company, isAdmin, isHRManager } = useAuth();
  const [activeTab, setActiveTab] = useState("cycles");
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [managerCycles, setManagerCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | null>(null);
  const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
  const [isProbationReview, setIsProbationReview] = useState(false);
  const [isManagerCycle, setIsManagerCycle] = useState(false);

  // AI Governance state
  const [selectedRiskForReview, setSelectedRiskForReview] = useState<any>(null);
  const [humanOverrideDialogOpen, setHumanOverrideDialogOpen] = useState(false);

  // Company switcher for admin/HR
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");

  // HR-focused data hooks
  const { sessions: calibrationSessions, isLoading: calibrationLoading } = useCalibrationSessions({
    companyId: selectedCompanyId,
  });
  const { pendingApprovals, loading: approvalsLoading } = useGoalApprovals(selectedCompanyId);
  const { storedRisks, isLoadingRisks, riskSummary, runAnalysis, isAnalyzing, refetchRisks } = useTalentRiskAnalysis(selectedCompanyId);
  const { interviews, loading: interviewsLoading, fetchInterviews } = useAppraisalInterviews();

  // Fetch interviews when company changes
  useEffect(() => {
    if (selectedCompanyId) {
      fetchInterviews({ cycleId: undefined });
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (isAdmin || isHRManager) {
      fetchCompanies();
    }
  }, [isAdmin, isHRManager]);

  useEffect(() => {
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
      await Promise.all([fetchCycles(), fetchManagerCycles()]);
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
      .eq("company_id", selectedCompanyId)
      .eq("is_manager_cycle", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cycles:", error);
      return;
    }

    const cyclesWithCounts = await addParticipantCounts(data || []);
    setCycles(cyclesWithCounts);
  };

  const fetchManagerCycles = async () => {
    if (!isAdmin && !isHRManager) return;

    const { data, error } = await supabase
      .from("appraisal_cycles")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .eq("is_manager_cycle", true)
      .eq("is_probation_review", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manager cycles:", error);
      return;
    }

    const cyclesWithCounts = await addParticipantCounts(data || []);
    setManagerCycles(cyclesWithCounts);
  };

  const addParticipantCounts = async (cyclesList: any[]) => {
    return await Promise.all(
      cyclesList.map(async (cycle) => {
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
          completed_count: completed || 0,
          completion_rate: total ? Math.round(((completed || 0) / total) * 100) : 0,
        };
      })
    );
  };

  const handleCreateCycle = (probationReview: boolean = false, managerCycle: boolean = false) => {
    setSelectedCycle(null);
    setIsProbationReview(probationReview);
    setIsManagerCycle(managerCycle);
    setCycleDialogOpen(true);
  };

  const handleEditCycle = (cycle: AppraisalCycle) => {
    setSelectedCycle(cycle);
    setIsProbationReview(cycle.is_probation_review || false);
    setIsManagerCycle(cycle.is_manager_cycle || false);
    setCycleDialogOpen(true);
  };

  const handleManageParticipants = (cycle: AppraisalCycle) => {
    setSelectedCycle(cycle);
    setParticipantsManagerOpen(true);
  };

  // Calculate HR-focused stats
  const totalParticipants = cycles.reduce((sum, c) => sum + (c.participants_count || 0), 0);
  const totalCompleted = cycles.reduce((sum, c) => sum + (c.completed_count || 0), 0);
  const overallCompletionRate = totalParticipants > 0 ? Math.round((totalCompleted / totalParticipants) * 100) : 0;
  
  const stats = {
    activeCycles: cycles.filter((c) => c.status === "active").length,
    completionRate: overallCompletionRate,
    pendingCalibrations: calibrationSessions?.filter((s) => s.status === "pending" || s.status === "scheduled").length || 0,
    atRiskEmployees: riskSummary?.critical + riskSummary?.high || 0,
    pendingApprovals: pendingApprovals?.length || 0,
    scheduledInterviews: interviews?.filter((i) => i.status === "scheduled" || i.status === "confirmed").length || 0,
  };

  // Risk helper functions
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "text-destructive";
      case "high": return "text-warning";
      case "medium": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    return <AlertCircle className={`h-4 w-4 ${getRiskColor(level)}`} />;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "declining") return <TrendingUp className="h-4 w-4 text-destructive rotate-180" />;
    return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
  };

  // Restrict page to HR/Admin only
  if (!isAdmin && !isHRManager) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">
                This page is for HR Administrators. Please use the Employee Self-Service or Manager portals for your appraisals.
              </p>
              <div className="flex gap-3 mt-6 justify-center">
                <Button variant="outline" onClick={() => navigate("/ess/my-appraisals")}>
                  My Appraisals
                </Button>
                <Button onClick={() => navigate("/mss/appraisals")}>
                  Team Appraisals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <Breadcrumbs items={breadcrumbItems} />

        {/* Page Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Appraisal Administration
              </h1>
              <p className="text-muted-foreground">
                Manage appraisal cycles, calibration, and organizational performance
              </p>
            </div>
          </div>
          
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Company Switcher */}
            {companies.length > 0 && (
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[180px]">
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
            
            {/* Quick Action Buttons */}
            <Button variant="outline" size="sm" onClick={() => navigate("/performance/setup")}>
              <Settings className="mr-2 h-4 w-4" />
              Setup
            </Button>
          </div>
        </div>

        {/* HR Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("cycles")}>
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
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("cycles")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                </div>
                <Percent className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("calibration")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Calibrations</p>
                  <p className="text-2xl font-bold">{stats.pendingCalibrations}</p>
                </div>
                <Scale className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("talent")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">At-Risk Employees</p>
                  <p className="text-2xl font-bold">{stats.atRiskEmployees}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("approvals")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Goal Approvals</p>
                  <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                </div>
                <FileCheck className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab("interviews")}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scheduled Interviews</p>
                  <p className="text-2xl font-bold">{stats.scheduledInterviews}</p>
                </div>
                <CalendarClock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="cycles" className="gap-2">
              <Settings className="h-4 w-4" />
              Cycles
            </TabsTrigger>
            <TabsTrigger value="manager-reviews" className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Manager Reviews
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="calibration" className="gap-2">
              <Scale className="h-4 w-4" />
              Calibration
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <FileCheck className="h-4 w-4" />
              Approvals
              {stats.pendingApprovals > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {stats.pendingApprovals}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="talent" className="gap-2">
              <Brain className="h-4 w-4" />
              Talent AI
            </TabsTrigger>
            <TabsTrigger value="interviews" className="gap-2">
              <CalendarClock className="h-4 w-4" />
              Interviews
            </TabsTrigger>
          </TabsList>

          {/* Cycles Tab */}
          <TabsContent value="cycles" className="mt-6">
            {/* Tab Header with Create Button */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Appraisal Cycles</h2>
                <p className="text-sm text-muted-foreground">Configure and manage performance review cycles</p>
              </div>
              <Button onClick={() => handleCreateCycle(false, false)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Cycle
              </Button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </CardContent>
                </Card>
              ) : cycles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No appraisal cycles created yet</p>
                    <Button onClick={() => handleCreateCycle(false, false)}>
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
                            {formatDateForDisplay(cycle.start_date, "MMM d, yyyy")} -{" "}
                            {formatDateForDisplay(cycle.end_date, "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        <Badge className={statusColors[cycle.status]}>{cycle.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Competency</p>
                            <p className="text-xl font-semibold">{cycle.competency_weight}%</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Responsibility</p>
                            <p className="text-xl font-semibold">{cycle.responsibility_weight}%</p>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">Goals</p>
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

          {/* Manager Reviews Tab */}
          <TabsContent value="manager-reviews" className="mt-6">
            <div className="space-y-4">
              {managerCycles.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No manager-created probation reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                managerCycles.map((cycle) => (
                  <Card key={cycle.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{cycle.name}</CardTitle>
                          <CardDescription>
                            {formatDateForDisplay(cycle.start_date, "MMM d, yyyy")} -{" "}
                            {formatDateForDisplay(cycle.end_date, "MMM d, yyyy")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">Probation Review</Badge>
                          <Badge className={statusColors[cycle.status]}>{cycle.status}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageParticipants(cycle)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Participants
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">Organization-wide performance insights</p>
                </div>
                <Button onClick={() => navigate("/performance/intelligence-hub")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Intelligence Hub
                </Button>
              </div>
              <PerformanceDistributionChart companyId={selectedCompanyId} />
            </div>
          </TabsContent>

          {/* Calibration Tab */}
          <TabsContent value="calibration" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Calibration Sessions</h3>
                  <p className="text-sm text-muted-foreground">Review and manage calibration sessions</p>
                </div>
                <Button onClick={() => navigate("/performance/calibration")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Calibration Workspace
                </Button>
              </div>
              {calibrationLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </CardContent>
                </Card>
              ) : calibrationSessions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No calibration sessions created yet</p>
                    <Button onClick={() => navigate("/performance/calibration")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Session
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {calibrationSessions.slice(0, 4).map((session) => (
                    <CalibrationSessionCard
                      key={session.id}
                      session={session}
                      onOpen={() => navigate(`/performance/calibration/${session.id}`)}
                      onEdit={() => navigate("/performance/calibration")}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Goal Approvals</h3>
                <p className="text-sm text-muted-foreground">Review and approve pending goal submissions</p>
              </div>
              <GoalApprovalInbox companyId={selectedCompanyId} />
            </div>
          </TabsContent>

          {/* Talent AI Tab */}
          <TabsContent value="talent" className="mt-6">
            <div className="space-y-6">
              {/* AI Transparency Banner - ISO 42001 */}
              <AITransparencyBanner
                modelName="HRplus Talent Risk Analyzer"
                lastAnalysisDate={storedRisks?.[0]?.last_analyzed_at}
                confidenceLevel={riskSummary?.critical > 0 ? "high" : "medium"}
                humanReviewRequired={riskSummary?.critical > 0 || riskSummary?.high > 0}
                analyzedCount={storedRisks?.length}
              />

              {/* Bias Alert Banner - ISO 42001 */}
              <AIBiasAlertBanner companyId={selectedCompanyId} />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">AI-Powered Talent Insights</h3>
                  <p className="text-sm text-muted-foreground">Predictive risk analysis and talent trends</p>
                </div>
                <Button 
                  onClick={() => runAnalysis({})} 
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing..." : "Run AI Analysis"}
                </Button>
              </div>
              
              {/* Risk Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Critical Risk</p>
                    <p className="text-3xl font-bold text-destructive">{riskSummary?.critical || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">High Risk</p>
                    <p className="text-3xl font-bold text-warning">{riskSummary?.high || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Medium Risk</p>
                    <p className="text-3xl font-bold text-info">{riskSummary?.medium || 0}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Low Risk</p>
                    <p className="text-3xl font-bold text-success">{riskSummary?.low || 0}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Explainability Panel for Selected Risk */}
              {selectedRiskForReview && (
                <AIExplainabilityPanel
                  riskScore={selectedRiskForReview.risk_score}
                  riskLevel={selectedRiskForReview.risk_level}
                  riskCategory={selectedRiskForReview.risk_category || selectedRiskForReview.risk_type}
                  contributingFactors={selectedRiskForReview.risk_factors || []}
                  recommendedInterventions={selectedRiskForReview.triggered_interventions || []}
                  trendDirection={selectedRiskForReview.trend_direction}
                  confidenceScore={75}
                  onRequestHumanReview={() => setHumanOverrideDialogOpen(true)}
                />
              )}

              <TalentRiskList
                risks={storedRisks || []}
                isLoading={isLoadingRisks}
                onSelectRisk={(risk) => setSelectedRiskForReview(risk)}
                getRiskColor={getRiskColor}
                getRiskIcon={getRiskIcon}
                getTrendIcon={getTrendIcon}
              />

              {/* Audit Trail - ISO 42001 */}
              <AIAuditTrailPanel companyId={selectedCompanyId} />
            </div>
          </TabsContent>

          {/* Interviews Tab */}
          <TabsContent value="interviews" className="mt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Appraisal Interviews</h3>
                <p className="text-sm text-muted-foreground">Organization-wide interview schedule</p>
              </div>
              
              {interviewsLoading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </CardContent>
                </Card>
              ) : interviews.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No appraisal interviews scheduled</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2">
                  <AppraisalInterviewCalendar
                    interviews={interviews}
                    onSelectDate={(date) => console.log("Selected date:", date)}
                    onSelectInterview={(interview) => console.log("Selected interview:", interview)}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Upcoming Interviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {interviews
                          .filter((i) => i.status === "scheduled" || i.status === "confirmed")
                          .slice(0, 5)
                          .map((interview) => (
                            <div key={interview.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{interview.participant?.employee?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {interview.scheduled_at ? formatDateForDisplay(interview.scheduled_at, "MMM d, yyyy h:mm a") : "Not scheduled"}
                                </p>
                              </div>
                              <Badge className={statusColors[interview.status || "pending"]}>{interview.status}</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <AppraisalCycleDialog
          open={cycleDialogOpen}
          onOpenChange={setCycleDialogOpen}
          cycle={selectedCycle}
          companyId={selectedCompanyId}
          onSuccess={fetchData}
          isProbationReview={isProbationReview}
          isManagerCycle={isManagerCycle}
        />

        {selectedCycle && (
          <AppraisalParticipantsManager
            open={participantsManagerOpen}
            onOpenChange={setParticipantsManagerOpen}
            cycle={selectedCycle}
            onSuccess={fetchData}
          />
        )}

        {/* AI Human Override Dialog - ISO 42001 */}
        {selectedRiskForReview && (
          <AIHumanOverrideDialog
            open={humanOverrideDialogOpen}
            onOpenChange={setHumanOverrideDialogOpen}
            riskId={selectedRiskForReview.id}
            employeeName={`${selectedRiskForReview.profiles?.first_name || ''} ${selectedRiskForReview.profiles?.last_name || ''}`}
            currentRiskLevel={selectedRiskForReview.risk_level}
            currentRiskScore={selectedRiskForReview.risk_score}
            aiRecommendation={selectedRiskForReview.ai_recommendation || "No specific recommendation"}
            companyId={selectedCompanyId}
            onOverrideComplete={() => {
              refetchRisks();
              setSelectedRiskForReview(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}
