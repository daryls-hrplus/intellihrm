import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  ChevronDown,
  TrendingUp,
  Sparkles,
  BookmarkPlus,
  Activity,
  Shield,
  FileText,
  History,
} from "lucide-react";
import { Review360AnalyticsDashboard } from "@/components/performance/Review360AnalyticsDashboard";
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
import { EmployeeSignalSummary } from "@/components/feedback/signals/EmployeeSignalSummary";
import { SignalRadarChart } from "@/components/feedback/signals/SignalRadarChart";
import { SaveAsTemplateDialog } from "@/components/feedback/templates/SaveAsTemplateDialog";
import { AllEmployeeResultsDashboard } from "@/components/feedback/admin/AllEmployeeResultsDashboard";
import { ResponseMonitoringDashboard } from "@/components/feedback/admin/ResponseMonitoringDashboard";
import { InvestigationApprovalQueue } from "@/components/feedback/cycles/InvestigationApprovalQueue";
import { ExpandableCycleCard } from "@/components/feedback/cycles/ExpandableCycleCard";
import { ResultsPreviewDialog } from "@/components/feedback/cycles/ResultsPreviewDialog";
import { ResultsReleaseAuditLog } from "@/components/feedback/admin/ResultsReleaseAuditLog";
import { GovernanceTabContent } from "@/components/feedback/governance";
import { VisibilityRules, DEFAULT_VISIBILITY_RULES } from "@/components/feedback/cycles/CycleVisibilityRulesEditor";
import { useLanguage } from "@/hooks/useLanguage";
import { formatDateForDisplay } from "@/utils/dateUtils";

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
  creator_name?: string;
  company_id?: string;
  results_released_at?: string | null;
  results_released_by?: string | null;
  release_settings?: {
    auto_release_on_close: boolean;
    release_delay_days: number;
    require_hr_approval: boolean;
    notify_on_release: boolean;
  };
  visibility_rules?: VisibilityRules;
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
  "manage-cycles": "Create and manage 360° review cycles for your direct reports. Track completion rates and results.",
  "central-cycles": "View and manage organization-wide 360° review cycles created by HR.",
  "manager-cycles": "View all manager-created review cycles across the organization.",
};

export default function Review360Page() {
  const { t } = useLanguage();
  const { user, company, isAdmin, isHRManager } = useAuth();
  
  // HR/Admin defaults to central-cycles; employees default to my-reviews
  const getDefaultTab = () => {
    if (isAdmin || isHRManager) return "central-cycles";
    return "my-reviews";
  };
  
  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [managerCycles, setManagerCycles] = useState<ReviewCycle[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [myParticipations, setMyParticipations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<ReviewCycle | null>(null);
  const [participantsManagerOpen, setParticipantsManagerOpen] = useState(false);
  const [questionsManagerOpen, setQuestionsManagerOpen] = useState(false);
  const [peerNominationOpen, setPeerNominationOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [isCreatingManagerCycle, setIsCreatingManagerCycle] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [cycleToTemplate, setCycleToTemplate] = useState<ReviewCycle | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [cycleForPreview, setCycleForPreview] = useState<ReviewCycle | null>(null);
  
  // Company switcher for admin/HR
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Set correct default tab when roles load
  useEffect(() => {
    if (isAdmin || isHRManager) {
      setActiveTab("central-cycles");
    }
  }, [isAdmin, isHRManager]);

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
        fetchManagerCycles(),
        fetchPendingReviews(),
        fetchMyParticipations(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    // For admin/HR: fetch central cycles (is_manager_cycle = false)
    // For managers: fetch only their own manager cycles
    let query = supabase
      .from("review_cycles")
      .select("id, name, description, start_date, end_date, self_review_deadline, peer_nomination_deadline, feedback_deadline, status, include_self_review, include_manager_review, include_peer_review, include_direct_report_review, min_peer_reviewers, max_peer_reviewers, is_manager_cycle, created_by, company_id, visibility_rules")
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false });

    if (isAdmin || isHRManager) {
      // HR/Admin sees central cycles in the main tab
      query = query.eq("is_manager_cycle", false);
    } else {
      // Regular managers see only their own cycles
      query = query.eq("created_by", user?.id).eq("is_manager_cycle", true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching cycles:", error);
      return;
    }

    const cyclesWithStats = await addCycleStats(data || []);
    setCycles(cyclesWithStats);
  };

  const fetchManagerCycles = async () => {
    // Only HR/Admin can see all manager cycles
    if (!isAdmin && !isHRManager) return;

    const { data, error } = await supabase
      .from("review_cycles")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .eq("is_manager_cycle", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manager cycles:", error);
      return;
    }

    // Fetch creator names separately
    const cyclesWithCreators = await Promise.all(
      (data || []).map(async (cycle: any) => {
        let creatorName = "Unknown";
        if (cycle.created_by) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", cycle.created_by)
            .maybeSingle();
          creatorName = profile?.full_name || "Unknown";
        }
        return { ...cycle, creator_name: creatorName };
      })
    );

    const cyclesWithStats = await addCycleStats(cyclesWithCreators);
    setManagerCycles(cyclesWithStats);
  };

  const addCycleStats = async (cycleData: any[]) => {
    return Promise.all(
      cycleData.map(async (cycle) => {
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

  const handleCreateCycle = (isManagerCycle: boolean = false) => {
    setSelectedCycle(null);
    setIsCreatingManagerCycle(isManagerCycle);
    setCycleDialogOpen(true);
  };

  const handleEditCycle = (cycle: ReviewCycle) => {
    setSelectedCycle(cycle);
    setIsCreatingManagerCycle(cycle.is_manager_cycle || false);
    setCycleDialogOpen(true);
  };

  // HR stats show organization-wide metrics; ESS shows personal metrics
  const totalParticipants = [...cycles, ...managerCycles].reduce((sum, c) => sum + (c.participants_count || 0), 0);
  const pendingRelease = cycles.filter(c => c.status === "completed").length;
  
  const stats = isAdmin || isHRManager ? {
    activeCycles: cycles.filter((c) => c.status === "active" || c.status === "in_progress").length,
    totalParticipants,
    pendingRelease,
    managerCyclesCount: managerCycles.length,
  } : {
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
                  {t('performance.review360.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('performance.review360.subtitle')}
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
                  <SelectValue placeholder={t('common.selectCompany')} />
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
              <Button onClick={() => handleCreateCycle(false)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('performance.review360.createCentralCycle')}
              </Button>
            )}
            {!isAdmin && !isHRManager && (
              <Button onClick={() => handleCreateCycle(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('performance.review360.createTeamCycle')}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards - Different for HR vs ESS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('performance.stats.activeCycles')}</p>
                  <p className="text-2xl font-bold">{stats.activeCycles}</p>
                </div>
                <Clock className="h-8 w-8 text-info" />
              </div>
            </CardContent>
          </Card>
          {(isAdmin || isHRManager) ? (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Participants</p>
                      <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Release</p>
                      <p className="text-2xl font-bold">{stats.pendingRelease}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Manager Cycles</p>
                      <p className="text-2xl font-bold">{stats.managerCyclesCount}</p>
                    </div>
                    <FileText className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('performance.stats.pendingReviews')}</p>
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
                      <p className="text-sm text-muted-foreground">{t('performance.stats.completedCycles')}</p>
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
                      <p className="text-sm text-muted-foreground">{t('performance.stats.myParticipations')}</p>
                      <p className="text-2xl font-bold">{stats.myParticipations}</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Analytics Dashboard (Collapsible) */}
        <Collapsible open={showAnalytics} onOpenChange={setShowAnalytics}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('performance.review360.analyticsDashboard')}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAnalytics ? "rotate-180" : ""}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4">
            <Review360AnalyticsDashboard
              cycles={[...cycles, ...managerCycles]}
              pendingReviews={pendingReviews}
              participations={myParticipations}
            />
          </CollapsibleContent>
        </Collapsible>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap">
            {/* ESS Tabs - Only for non-HR users */}
            {!isAdmin && !isHRManager && (
              <>
                <TabsTrigger value="my-reviews" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  {t('performance.review360.myReviews')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">{t('performance.review360.tabs.myReviewsHelp')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="my-feedback" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  {t('performance.review360.myFeedback')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">{t('performance.review360.tabs.myFeedbackHelp')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="manage-cycles" className="gap-2">
                  <Settings className="h-4 w-4" />
                  {t('performance.review360.manageCycles')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">{t('performance.review360.tabs.manageCyclesHelp')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
              </>
            )}
            
            {/* HR/Admin Tabs */}
            {(isAdmin || isHRManager) && (
              <>
                <TabsTrigger value="central-cycles" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  {t('performance.review360.centralCycles')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">{t('performance.review360.tabs.centralCyclesHelp')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="all-results" className="gap-2">
                  <FileText className="h-4 w-4" />
                  All Results
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">View all employee 360 feedback results with filtering and export options.</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Monitoring
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">Track response completion and send reminders to pending reviewers.</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="manager-cycles" className="gap-2">
                  <Users className="h-4 w-4" />
                  {t('performance.review360.managerCycles')}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">{t('performance.review360.tabs.managerCyclesHelp')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="investigations" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Investigations
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">Review and approve investigation requests to access individual 360 feedback responses.</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="release-audit" className="gap-2">
                  <History className="h-4 w-4" />
                  Release Audit
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">View complete history of all results releases across 360 feedback cycles.</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
                <TabsTrigger value="governance" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Governance
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-72 p-3 text-left whitespace-normal">
                      <p className="text-sm leading-relaxed">Manage consent records, data policies, AI audit logs, and governance exceptions.</p>
                    </TooltipContent>
                  </Tooltip>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* ESS Tab Contents - Only for non-HR users */}
          {!isAdmin && !isHRManager && (
            <>
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
                <div className="space-y-6">
                  <MyFeedbackSummary participations={myParticipations} />
                  
                  {/* Talent Signals Section */}
                  {user?.id && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        My Talent Signals
                      </h3>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <SignalRadarChart employeeId={user.id} showCard />
                        <EmployeeSignalSummary employeeId={user.id} />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}

          {/* Central Cycles Tab - For HR/Admin */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="central-cycles" className="mt-6">
              <div className="space-y-4">
                {cycles.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">No Central Review Cycles</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create organization-wide 360° feedback cycles
                      </p>
                      <Button onClick={() => handleCreateCycle(false)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Central Cycle
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {cycles.map((cycle) => (
                      <ExpandableCycleCard
                        key={cycle.id}
                        cycle={cycle}
                        statusColors={statusColors}
                        onEdit={handleEditCycle}
                        onSaveAsTemplate={(c) => {
                          setCycleToTemplate(c);
                          setTemplateDialogOpen(true);
                        }}
                        onManageParticipants={(c) => {
                          setSelectedCycle(c);
                          setParticipantsManagerOpen(true);
                        }}
                        onManageQuestions={(c) => {
                          setSelectedCycle(c);
                          setQuestionsManagerOpen(true);
                        }}
                        onUpdate={fetchData}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Manager Cycles Tab - For HR/Admin to view all manager-created cycles */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="manager-cycles" className="mt-6">
              <div className="space-y-4">
                {managerCycles.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">No Manager Review Cycles</h3>
                      <p className="text-sm text-muted-foreground">
                        Managers have not created any team-specific review cycles yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {managerCycles.map((cycle) => (
                      <ExpandableCycleCard
                        key={cycle.id}
                        cycle={cycle}
                        statusColors={statusColors}
                        onEdit={handleEditCycle}
                        onSaveAsTemplate={(c) => {
                          setCycleToTemplate(c);
                          setTemplateDialogOpen(true);
                        }}
                        onManageParticipants={(c) => {
                          setSelectedCycle(c);
                          setParticipantsManagerOpen(true);
                        }}
                        onManageQuestions={(c) => {
                          setSelectedCycle(c);
                          setQuestionsManagerOpen(true);
                        }}
                        onUpdate={fetchData}
                        showCreator
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* All Results Tab - For HR/Admin */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="all-results" className="mt-6">
              <AllEmployeeResultsDashboard 
                companyId={selectedCompanyId} 
                cycles={[...cycles, ...managerCycles].map(c => ({ id: c.id, name: c.name, status: c.status }))}
              />
            </TabsContent>
          )}

          {/* Monitoring Tab - For HR/Admin */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="monitoring" className="mt-6">
              <ResponseMonitoringDashboard 
                companyId={selectedCompanyId} 
                cycles={[...cycles, ...managerCycles].map(c => ({ id: c.id, name: c.name, status: c.status }))}
              />
            </TabsContent>
          )}

          {/* Investigations Tab - For HR/Admin */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="investigations" className="mt-6">
              <InvestigationApprovalQueue companyId={selectedCompanyId} />
            </TabsContent>
          )}

          {/* Release Audit Tab - For HR/Admin */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="release-audit" className="mt-6">
              <ResultsReleaseAuditLog companyId={selectedCompanyId} />
            </TabsContent>
          )}

          {/* Governance Tab - For HR/Admin */}
          {(isAdmin || isHRManager) && (
            <TabsContent value="governance" className="mt-6">
              <GovernanceTabContent
                companyId={selectedCompanyId}
                cycles={[...cycles, ...managerCycles].map(c => ({ id: c.id, name: c.name }))}
              />
            </TabsContent>
          )}

          {/* My Team Cycles Tab - For regular managers */}
          {!isAdmin && !isHRManager && (
            <TabsContent value="manage-cycles" className="mt-6">
              <div className="space-y-4">
                {cycles.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 font-semibold">No Team Review Cycles</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create a 360° feedback cycle for your direct reports
                      </p>
                      <Button onClick={() => handleCreateCycle(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Team Cycle
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
                                  {formatDateForDisplay(cycle.start_date, "MMM d")} - {formatDateForDisplay(cycle.end_date, "MMM d, yyyy")}
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
                                  onClick={() => {
                                    setCycleToTemplate(cycle);
                                    setTemplateDialogOpen(true);
                                  }}
                                  title="Save as Template"
                                >
                                  <BookmarkPlus className="h-4 w-4" />
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
        isManagerCycle={isCreatingManagerCycle}
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

      {cycleToTemplate && (
        <SaveAsTemplateDialog
          open={templateDialogOpen}
          onOpenChange={setTemplateDialogOpen}
          cycleId={cycleToTemplate.id}
          cycleName={cycleToTemplate.name}
          onSuccess={() => {
            setTemplateDialogOpen(false);
            setCycleToTemplate(null);
          }}
        />
      )}

      {cycleForPreview && (
        <ResultsPreviewDialog
          open={previewDialogOpen}
          onOpenChange={(open) => {
            setPreviewDialogOpen(open);
            if (!open) setCycleForPreview(null);
          }}
          cycleId={cycleForPreview.id}
          cycleName={cycleForPreview.name}
          visibilityRules={cycleForPreview.visibility_rules || DEFAULT_VISIBILITY_RULES}
          companyId={cycleForPreview.company_id}
        />
      )}
    </AppLayout>
  );
}