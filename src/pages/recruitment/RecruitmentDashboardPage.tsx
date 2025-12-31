import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useLanguage } from "@/hooks/useLanguage";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, startOfDay, endOfDay } from "date-fns";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  UserPlus,
  Briefcase,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  BarChart3,
  ClipboardList,
  Award,
  FlaskConical,
  UsersRound,
  Mail,
  TrendingUp,
  Settings,
} from "lucide-react";

export default function RecruitmentDashboardPage() {
  const { t } = useLanguage();
  const { hasTabAccess } = useGranularPermissions();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();

  const allModules = {
    requisitions: { title: t("recruitment.tabs.requisitions"), description: t("recruitment.modules.management.description"), href: "/recruitment/requisitions", icon: Briefcase, color: "bg-primary/10 text-primary", tabCode: "requisitions" },
    candidates: { title: t("recruitment.tabs.candidates"), description: t("recruitment.modules.candidates.description"), href: "/recruitment/candidates", icon: Users, color: "bg-success/10 text-success", tabCode: "candidates" },
    applications: { title: t("recruitment.tabs.applications"), description: t("recruitment.modules.applications.description"), href: "/recruitment/applications", icon: FileText, color: "bg-info/10 text-info", tabCode: "applications" },
    pipeline: { title: t("recruitment.tabs.pipeline"), description: "Visual pipeline view of candidates", href: "/recruitment/pipeline", icon: Calendar, color: "bg-purple-500/10 text-purple-600", tabCode: "pipeline" },
    scorecards: { title: t("recruitment.tabs.scorecards"), description: "Interview scorecards and evaluation", href: "/recruitment/scorecards", icon: ClipboardList, color: "bg-orange-500/10 text-orange-600", tabCode: "scorecards" },
    offers: { title: t("recruitment.tabs.offers"), description: "Job offers and offer letters", href: "/recruitment/offers", icon: Award, color: "bg-green-500/10 text-green-600", tabCode: "offers" },
    referrals: { title: t("recruitment.tabs.referrals"), description: "Employee referral programs", href: "/recruitment/referrals", icon: UserPlus, color: "bg-cyan-500/10 text-cyan-600", tabCode: "referrals" },
    assessments: { title: t("recruitment.tabs.assessments"), description: "Candidate assessments and tests", href: "/recruitment/assessments", icon: FlaskConical, color: "bg-violet-500/10 text-violet-600", tabCode: "assessments" },
    panels: { title: t("recruitment.tabs.panels"), description: "Interview panels and interviewers", href: "/recruitment/panels", icon: UsersRound, color: "bg-pink-500/10 text-pink-600", tabCode: "panels" },
    templates: { title: t("recruitment.tabs.templates"), description: "Recruitment email templates", href: "/recruitment/email-templates", icon: Mail, color: "bg-blue-500/10 text-blue-600", tabCode: "email-templates" },
    sources: { title: t("recruitment.tabs.sources"), description: "Source effectiveness analysis", href: "/recruitment/sources", icon: TrendingUp, color: "bg-amber-500/10 text-amber-600", tabCode: "sources" },
    jobBoards: { title: t("recruitment.tabs.jobBoards"), description: "Job board integrations", href: "/recruitment/job-boards", icon: Settings, color: "bg-slate-500/10 text-slate-600", tabCode: "job-boards" },
    analytics: { title: t("recruitment.modules.analytics.title"), description: t("recruitment.modules.analytics.description"), href: "/recruitment/analytics", icon: BarChart3, color: "bg-chart-3/10 text-chart-3", tabCode: "analytics" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("recruitment", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "Core Recruitment",
      items: filterByAccess([allModules.requisitions, allModules.candidates, allModules.applications, allModules.pipeline]),
    },
    {
      titleKey: "Evaluation",
      items: filterByAccess([allModules.scorecards, allModules.assessments, allModules.panels]),
    },
    {
      titleKey: "Configuration",
      items: filterByAccess([allModules.offers, allModules.referrals, allModules.templates, allModules.sources, allModules.jobBoards]),
    },
    {
      titleKey: "Analytics",
      items: filterByAccess([allModules.analytics]),
    },
  ];

  const { data: openPositions = 0 } = useQuery({
    queryKey: ["recruitment-stats-open-positions", selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from("job_requisitions")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      if (selectedCompanyId) {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { count } = await query;
      return count || 0;
    },
  });

  const { data: totalCandidates = 0 } = useQuery({
    queryKey: ["recruitment-stats-candidates"],
    queryFn: async () => {
      const { count } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: interviewsToday = 0 } = useQuery({
    queryKey: ["recruitment-stats-interviews-today", selectedCompanyId],
    queryFn: async () => {
      const today = new Date();
      const { count } = await supabase
        .from("interview_schedules")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", startOfDay(today).toISOString())
        .lte("scheduled_at", endOfDay(today).toISOString())
        .eq("status", "scheduled");
      return count || 0;
    },
  });

  const { data: hiredThisMonth = 0 } = useQuery({
    queryKey: ["recruitment-stats-hired-month", selectedCompanyId],
    queryFn: async () => {
      const monthStart = startOfMonth(new Date());
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("stage", "hired")
        .gte("hired_at", monthStart.toISOString());
      return count || 0;
    },
  });

  const statCards = [
    { label: t("recruitment.stats.openPositions"), value: openPositions, icon: Briefcase, color: "bg-primary/10 text-primary" },
    { label: t("recruitment.stats.totalCandidates"), value: totalCandidates, icon: Users, color: "bg-info/10 text-info" },
    { label: t("recruitment.stats.interviewsToday"), value: interviewsToday, icon: Calendar, color: "bg-warning/10 text-warning" },
    { label: t("recruitment.stats.hiredThisMonth"), value: hiredThisMonth, icon: CheckCircle, color: "bg-success/10 text-success" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("recruitment.dashboard.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("recruitment.dashboard.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter 
                selectedCompanyId={selectedCompanyId} 
                onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
              />
              <DepartmentFilter
                companyId={selectedCompanyId}
                selectedDepartmentId={selectedDepartmentId}
                onDepartmentChange={setSelectedDepartmentId}
              />
              <ModuleBIButton module="recruitment" />
              <ModuleReportsButton module="recruitment" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <GroupedModuleCards sections={sections} defaultOpen={false} showToggleButton />
      </div>
    </AppLayout>
  );
}
