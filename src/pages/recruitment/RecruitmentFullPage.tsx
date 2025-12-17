import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  Plus, 
  Search,
  Send,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ClipboardList,
  UserPlus,
  Award,
  Mail,
  FlaskConical,
  UsersRound,
  TrendingUp,
} from "lucide-react";
import { InterviewScorecardsTab } from "@/components/recruitment/InterviewScorecardsTab";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { CandidatePipelineTab } from "@/components/recruitment/CandidatePipelineTab";
import { ReferralProgramTab } from "@/components/recruitment/ReferralProgramTab";
import { OfferManagementTab } from "@/components/recruitment/OfferManagementTab";
import { EmailTemplatesTab } from "@/components/recruitment/EmailTemplatesTab";
import { AssessmentsTab } from "@/components/recruitment/AssessmentsTab";
import { InterviewPanelsTab } from "@/components/recruitment/InterviewPanelsTab";
import { SourceEffectivenessTab } from "@/components/recruitment/SourceEffectivenessTab";
import { useRecruitment } from "@/hooks/useRecruitment";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";

export default function RecruitmentFullPage() {
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequisitionDialogOpen, setIsRequisitionDialogOpen] = useState(false);
  const [isJobBoardDialogOpen, setIsJobBoardDialogOpen] = useState(false);
  const [isCandidateDialogOpen, setIsCandidateDialogOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<string | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const { 
    requisitions, 
    requisitionsLoading, 
    jobBoardConfigs,
    candidates,
    candidatesLoading,
    applications,
    applicationsLoading,
    createRequisition,
    createJobBoardConfig,
    createCandidate,
    postJobToBoard,
    updateApplication,
  } = useRecruitment(companyId || undefined);

  // Fetch companies
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const query = supabase.from("companies").select("id, name").eq("is_active", true) as any;
      const { data } = await query;
      return data || [];
    },
  });

  // Fetch departments for selected company
  const { data: departments = [] } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const query = supabase.from("departments").select("id, name").eq("company_id", companyId).eq("is_active", true) as any;
      const { data } = await query;
      return data || [];
    },
    enabled: !!companyId,
  });

  // Form states
  const [requisitionForm, setRequisitionForm] = useState({
    title: "",
    department_id: "",
    location: "",
    employment_type: "full_time",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
    openings: "1",
    is_remote: false,
  });

  const [jobBoardForm, setJobBoardForm] = useState({
    name: "",
    code: "",
    api_endpoint: "",
    webhook_secret: "",
    auto_post: false,
  });

  const [candidateForm, setCandidateForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    current_company: "",
    current_title: "",
    years_experience: "",
  });

  const handleCreateRequisition = async () => {
    if (!companyId) return;
    
    await createRequisition.mutateAsync({
      company_id: companyId,
      title: requisitionForm.title,
      department_id: requisitionForm.department_id || null,
      location: requisitionForm.location || null,
      employment_type: requisitionForm.employment_type,
      experience_level: requisitionForm.experience_level || null,
      salary_min: requisitionForm.salary_min ? parseFloat(requisitionForm.salary_min) : null,
      salary_max: requisitionForm.salary_max ? parseFloat(requisitionForm.salary_max) : null,
      description: requisitionForm.description || null,
      requirements: requisitionForm.requirements || null,
      openings: parseInt(requisitionForm.openings) || 1,
      is_remote: requisitionForm.is_remote,
      status: "draft",
    });

    setIsRequisitionDialogOpen(false);
    setRequisitionForm({
      title: "",
      department_id: "",
      location: "",
      employment_type: "full_time",
      experience_level: "",
      salary_min: "",
      salary_max: "",
      description: "",
      requirements: "",
      openings: "1",
      is_remote: false,
    });
  };

  const handleCreateJobBoard = async () => {
    if (!companyId) return;

    await createJobBoardConfig.mutateAsync({
      company_id: companyId,
      name: jobBoardForm.name,
      code: jobBoardForm.code,
      api_endpoint: jobBoardForm.api_endpoint,
      webhook_secret: jobBoardForm.webhook_secret || null,
      auto_post: jobBoardForm.auto_post,
    });

    setIsJobBoardDialogOpen(false);
    setJobBoardForm({
      name: "",
      code: "",
      api_endpoint: "",
      webhook_secret: "",
      auto_post: false,
    });
  };

  const handleCreateCandidate = async () => {
    if (!companyId) return;

    await createCandidate.mutateAsync({
      company_id: companyId,
      first_name: candidateForm.first_name,
      last_name: candidateForm.last_name,
      email: candidateForm.email,
      phone: candidateForm.phone || null,
      location: candidateForm.location || null,
      current_company: candidateForm.current_company || null,
      current_title: candidateForm.current_title || null,
      years_experience: candidateForm.years_experience ? parseInt(candidateForm.years_experience) : null,
      source: "direct",
    });

    setIsCandidateDialogOpen(false);
    setCandidateForm({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      location: "",
      current_company: "",
      current_title: "",
      years_experience: "",
    });
  };

  const handlePostJob = async (jobBoardConfigId: string) => {
    if (!selectedRequisition) return;

    await postJobToBoard.mutateAsync({
      requisitionId: selectedRequisition,
      jobBoardConfigId,
    });

    setIsPostDialogOpen(false);
    setSelectedRequisition(null);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "outline",
      pending: "secondary",
      approved: "default",
      open: "default",
      on_hold: "secondary",
      filled: "secondary",
      cancelled: "destructive",
      closed: "secondary",
    };
    const colors: Record<string, string> = {
      draft: "",
      pending: "",
      approved: "bg-blue-100 text-blue-800",
      open: "bg-green-100 text-green-800",
      filled: "bg-purple-100 text-purple-800",
    };
    return <Badge variant={variants[status] || "outline"} className={colors[status]}>{status}</Badge>;
  };

  const getApplicationStageBadge = (stage: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800",
      interview: "bg-purple-100 text-purple-800",
      offer: "bg-green-100 text-green-800",
      hired: "bg-green-200 text-green-900",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[stage] || ""}>{stage}</Badge>;
  };

  // Filter requisitions
  const filteredRequisitions = requisitions?.filter(req => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.requisition_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Stats
  const openReqs = requisitions?.filter(r => r.status === "open").length || 0;
  const totalCandidates = candidates?.length || 0;
  const activeApplications = applications?.filter(a => !["hired", "rejected"].includes(a.status)).length || 0;
  const hiredThisMonth = applications?.filter(a => {
    if (a.status !== "hired" || !a.hired_at) return false;
    const hiredDate = new Date(a.hired_at);
    const now = new Date();
    return hiredDate.getMonth() === now.getMonth() && hiredDate.getFullYear() === now.getFullYear();
  }).length || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("recruitment.dashboard.title"), href: "/recruitment" },
            { label: t("recruitment.modules.management.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("recruitment.dashboard.title")}</h1>
            <p className="text-muted-foreground">
              {t("recruitment.dashboard.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModuleBIButton module="recruitment" />
            <ModuleReportsButton module="recruitment" />
          </div>
        </div>

        {/* Company Filter */}
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Select value={companyId} onValueChange={setCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company: any) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("recruitment.actions.searchRequisitions")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recruitment.stats.openPositions")}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openReqs}</div>
              <p className="text-xs text-muted-foreground">{t("recruitment.stats.activeRequisitions")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recruitment.stats.totalCandidates")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCandidates}</div>
              <p className="text-xs text-muted-foreground">{t("recruitment.stats.inTalentPool")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recruitment.stats.activeApplications")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeApplications}</div>
              <p className="text-xs text-muted-foreground">{t("recruitment.stats.inPipeline")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("recruitment.stats.hiredThisMonth")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{hiredThisMonth}</div>
              <p className="text-xs text-muted-foreground">{t("recruitment.stats.newHires")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requisitions" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="requisitions">
              <Briefcase className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.requisitions")}
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <Users className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.candidates")}
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.applications")}
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <TrendingUp className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.pipeline")}
            </TabsTrigger>
            <TabsTrigger value="scorecards">
              <ClipboardList className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.scorecards")}
            </TabsTrigger>
            <TabsTrigger value="offers">
              <Award className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.offers")}
            </TabsTrigger>
            <TabsTrigger value="referrals">
              <UserPlus className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.referrals")}
            </TabsTrigger>
            <TabsTrigger value="assessments">
              <FlaskConical className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.assessments")}
            </TabsTrigger>
            <TabsTrigger value="panels">
              <UsersRound className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.panels")}
            </TabsTrigger>
            <TabsTrigger value="emails">
              <Mail className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.templates")}
            </TabsTrigger>
            <TabsTrigger value="sources">
              <TrendingUp className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.sources")}
            </TabsTrigger>
            <TabsTrigger value="job-boards">
              <Settings className="mr-2 h-4 w-4" />
              {t("recruitment.tabs.jobBoards")}
            </TabsTrigger>
          </TabsList>

          {/* Job Requisitions Tab */}
          <TabsContent value="requisitions" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isRequisitionDialogOpen} onOpenChange={setIsRequisitionDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!companyId}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("recruitment.actions.newRequisition")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("recruitment.form.createRequisition")}</DialogTitle>
                    <DialogDescription>
                      {t("recruitment.form.createRequisitionDesc")}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Job Title *</Label>
                      <Input
                        value={requisitionForm.title}
                        onChange={(e) => setRequisitionForm({ ...requisitionForm, title: e.target.value })}
                        placeholder="e.g., Senior Software Engineer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select
                          value={requisitionForm.department_id}
                          onValueChange={(v) => setRequisitionForm({ ...requisitionForm, department_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept: any) => (
                              <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={requisitionForm.location}
                          onChange={(e) => setRequisitionForm({ ...requisitionForm, location: e.target.value })}
                          placeholder="e.g., New York, NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Employment Type</Label>
                        <Select
                          value={requisitionForm.employment_type}
                          onValueChange={(v) => setRequisitionForm({ ...requisitionForm, employment_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="temporary">Temporary</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Experience Level</Label>
                        <Select
                          value={requisitionForm.experience_level}
                          onValueChange={(v) => setRequisitionForm({ ...requisitionForm, experience_level: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entry">Entry Level</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                            <SelectItem value="mid">Mid Level</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Min Salary</Label>
                        <Input
                          type="number"
                          value={requisitionForm.salary_min}
                          onChange={(e) => setRequisitionForm({ ...requisitionForm, salary_min: e.target.value })}
                          placeholder="50000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Salary</Label>
                        <Input
                          type="number"
                          value={requisitionForm.salary_max}
                          onChange={(e) => setRequisitionForm({ ...requisitionForm, salary_max: e.target.value })}
                          placeholder="80000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Openings</Label>
                        <Input
                          type="number"
                          value={requisitionForm.openings}
                          onChange={(e) => setRequisitionForm({ ...requisitionForm, openings: e.target.value })}
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Job Description</Label>
                      <Textarea
                        value={requisitionForm.description}
                        onChange={(e) => setRequisitionForm({ ...requisitionForm, description: e.target.value })}
                        placeholder="Describe the role and responsibilities..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Requirements</Label>
                      <Textarea
                        value={requisitionForm.requirements}
                        onChange={(e) => setRequisitionForm({ ...requisitionForm, requirements: e.target.value })}
                        placeholder="List required qualifications and skills..."
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_remote"
                        checked={requisitionForm.is_remote}
                        onChange={(e) => setRequisitionForm({ ...requisitionForm, is_remote: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="is_remote">Remote position</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRequisitionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateRequisition} 
                      disabled={!requisitionForm.title || createRequisition.isPending}
                    >
                      {createRequisition.isPending ? "Creating..." : "Create Requisition"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {requisitionsLoading ? (
              <Card>
                <CardContent className="py-12 text-center">Loading requisitions...</CardContent>
              </Card>
            ) : filteredRequisitions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No job requisitions</h3>
                  <p className="text-sm text-muted-foreground">
                    {companyId ? "Create your first job requisition" : "Select a company to view requisitions"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRequisitions.map((req) => (
                  <Card key={req.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{req.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span>{req.requisition_number}</span>
                            {req.department && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {req.department.name}
                              </span>
                            )}
                            {req.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {req.location}
                                {req.is_remote && " (Remote)"}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(req.status)}
                          {(req.status === "approved" || req.status === "open") && (
                            <Dialog open={isPostDialogOpen && selectedRequisition === req.id} onOpenChange={(open) => {
                              setIsPostDialogOpen(open);
                              if (!open) setSelectedRequisition(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedRequisition(req.id)}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Post to Board
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Post to Job Board</DialogTitle>
                                  <DialogDescription>
                                    Select a job board to post this requisition
                                  </DialogDescription>
                                </DialogHeader>
                                {jobBoardConfigs && jobBoardConfigs.length > 0 ? (
                                  <div className="space-y-2">
                                    {jobBoardConfigs.filter(c => c.is_active).map((config) => (
                                      <Button
                                        key={config.id}
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => handlePostJob(config.id)}
                                        disabled={postJobToBoard.isPending}
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        {config.name}
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    No job boards configured. Add a job board in the Job Boards tab.
                                  </p>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {req.employment_type?.replace("_", " ")}
                        </span>
                        {(req.salary_min || req.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {req.salary_min?.toLocaleString()} - {req.salary_max?.toLocaleString()} {req.salary_currency}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {req.filled_count || 0} / {req.openings} filled
                        </span>
                        {req.target_hire_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Target: {formatDateForDisplay(req.target_hire_date, "PP")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Candidates Tab */}
          <TabsContent value="candidates" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isCandidateDialogOpen} onOpenChange={setIsCandidateDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!companyId}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Candidate</DialogTitle>
                    <DialogDescription>
                      Manually add a candidate to your talent pool
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name *</Label>
                        <Input
                          value={candidateForm.first_name}
                          onChange={(e) => setCandidateForm({ ...candidateForm, first_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name *</Label>
                        <Input
                          value={candidateForm.last_name}
                          onChange={(e) => setCandidateForm({ ...candidateForm, last_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={candidateForm.email}
                        onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                          value={candidateForm.phone}
                          onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={candidateForm.location}
                          onChange={(e) => setCandidateForm({ ...candidateForm, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Current Company</Label>
                        <Input
                          value={candidateForm.current_company}
                          onChange={(e) => setCandidateForm({ ...candidateForm, current_company: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Title</Label>
                        <Input
                          value={candidateForm.current_title}
                          onChange={(e) => setCandidateForm({ ...candidateForm, current_title: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={candidateForm.years_experience}
                        onChange={(e) => setCandidateForm({ ...candidateForm, years_experience: e.target.value })}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCandidateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateCandidate}
                      disabled={!candidateForm.first_name || !candidateForm.last_name || !candidateForm.email || createCandidate.isPending}
                    >
                      {createCandidate.isPending ? "Adding..." : "Add Candidate"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {candidatesLoading ? (
              <Card>
                <CardContent className="py-12 text-center">Loading candidates...</CardContent>
              </Card>
            ) : !candidates || candidates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No candidates</h3>
                  <p className="text-sm text-muted-foreground">
                    Candidates will appear here when they apply or are added manually
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Added</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">
                          {candidate.first_name} {candidate.last_name}
                        </TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>
                          {candidate.current_title && candidate.current_company
                            ? `${candidate.current_title} at ${candidate.current_company}`
                            : candidate.current_title || candidate.current_company || "-"}
                        </TableCell>
                        <TableCell>{candidate.location || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{candidate.source}</Badge>
                        </TableCell>
                        <TableCell>{formatDateForDisplay(candidate.created_at, "PP")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-4">
            {applicationsLoading ? (
              <Card>
                <CardContent className="py-12 text-center">Loading applications...</CardContent>
              </Card>
            ) : !applications || applications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Applications will appear here when candidates apply
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application #</TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.application_number}</TableCell>
                        <TableCell>
                          {app.candidate?.first_name} {app.candidate?.last_name}
                        </TableCell>
                        <TableCell>{app.requisition?.title || "-"}</TableCell>
                        <TableCell>{getApplicationStageBadge(app.stage)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{app.source}</Badge>
                        </TableCell>
                        <TableCell>{formatDateForDisplay(app.applied_at, "PP")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {app.stage !== "hired" && app.stage !== "rejected" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => updateApplication.mutate({ id: app.id, stage: "interview", status: "interview" })}
                                >
                                  Interview
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600"
                                  onClick={() => updateApplication.mutate({ id: app.id, stage: "hired", status: "hired", hired_at: new Date().toISOString() })}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => updateApplication.mutate({ id: app.id, stage: "rejected", status: "rejected" })}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <CandidatePipelineTab companyId={companyId} />
          </TabsContent>

          {/* Scorecards Tab */}
          <TabsContent value="scorecards" className="space-y-4">
            <InterviewScorecardsTab companyId={companyId} />
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers" className="space-y-4">
            <OfferManagementTab companyId={companyId} />
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals" className="space-y-4">
            <ReferralProgramTab companyId={companyId} />
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-4">
            <AssessmentsTab companyId={companyId} />
          </TabsContent>

          {/* Panels Tab */}
          <TabsContent value="panels" className="space-y-4">
            <InterviewPanelsTab companyId={companyId} />
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="emails" className="space-y-4">
            <EmailTemplatesTab companyId={companyId} />
          </TabsContent>

          {/* Source Effectiveness Tab */}
          <TabsContent value="sources" className="space-y-4">
            <SourceEffectivenessTab companyId={companyId} />
          </TabsContent>

          {/* Job Boards Tab */}
          <TabsContent value="job-boards" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isJobBoardDialogOpen} onOpenChange={setIsJobBoardDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!companyId}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Job Board
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Job Board Integration</DialogTitle>
                    <DialogDescription>
                      Configure a job board API endpoint for automated posting
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          value={jobBoardForm.name}
                          onChange={(e) => setJobBoardForm({ ...jobBoardForm, name: e.target.value })}
                          placeholder="e.g., Indeed, LinkedIn"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Code *</Label>
                        <Input
                          value={jobBoardForm.code}
                          onChange={(e) => setJobBoardForm({ ...jobBoardForm, code: e.target.value })}
                          placeholder="e.g., indeed, linkedin"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>API Endpoint *</Label>
                      <Input
                        value={jobBoardForm.api_endpoint}
                        onChange={(e) => setJobBoardForm({ ...jobBoardForm, api_endpoint: e.target.value })}
                        placeholder="https://api.jobboard.com/v1/jobs"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Webhook Secret (for receiving candidates)</Label>
                      <Input
                        value={jobBoardForm.webhook_secret}
                        onChange={(e) => setJobBoardForm({ ...jobBoardForm, webhook_secret: e.target.value })}
                        placeholder="Optional secret for webhook verification"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto_post"
                        checked={jobBoardForm.auto_post}
                        onChange={(e) => setJobBoardForm({ ...jobBoardForm, auto_post: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="auto_post">Auto-post approved requisitions</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsJobBoardDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateJobBoard}
                      disabled={!jobBoardForm.name || !jobBoardForm.code || !jobBoardForm.api_endpoint || createJobBoardConfig.isPending}
                    >
                      {createJobBoardConfig.isPending ? "Adding..." : "Add Job Board"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {!jobBoardConfigs || jobBoardConfigs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No job boards configured</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a job board integration to start posting jobs automatically
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {jobBoardConfigs.map((config) => (
                  <Card key={config.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{config.name}</CardTitle>
                          <CardDescription>{config.code}</CardDescription>
                        </div>
                        <Badge variant={config.is_active ? "default" : "secondary"}>
                          {config.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">API Endpoint:</span>
                          <p className="text-muted-foreground truncate">{config.api_endpoint}</p>
                        </div>
                        {config.auto_post && (
                          <Badge variant="outline" className="mt-2">Auto-post enabled</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Webhook URL</CardTitle>
                <CardDescription>
                  Configure your job board to send candidate applications to this webhook
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  {`${window.location.origin.replace('lovableproject.com', 'supabase.co')}/functions/v1/job-board-webhook`}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  This endpoint receives candidate applications and hired notifications from external job boards.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
