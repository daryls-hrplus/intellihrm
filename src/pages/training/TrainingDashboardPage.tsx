import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Calendar,
  Clock,
  CheckCircle,
  Loader2,
  Settings,
  Target,
  FileText,
  ExternalLink,
  DollarSign,
  Users,
  ClipboardCheck,
  Route,
  Shield,
  Link,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Monitor,
  PenTool,
} from "lucide-react";

interface Stats {
  coursesAvailable: number;
  inProgress: number;
  completed: number;
  certifications: number;
}

export default function TrainingDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { hasTabAccess } = useGranularPermissions();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const [stats, setStats] = useState<Stats>({
    coursesAvailable: 0,
    inProgress: 0,
    completed: 0,
    certifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user, selectedCompanyId]);

  const fetchStats = async () => {
    try {
      const [coursesRes, enrollmentsRes, certificatesRes] = await Promise.all([
        supabase
          .from("lms_courses")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
        user
          ? supabase
              .from("lms_enrollments")
              .select("status")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
        user
          ? supabase
              .from("lms_certificates")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id)
          : Promise.resolve({ count: 0 }),
      ]);

      const enrollments = enrollmentsRes.data || [];
      setStats({
        coursesAvailable: coursesRes.count || 0,
        inProgress: enrollments.filter(
          (e: { status: string }) => e.status === "enrolled" || e.status === "in_progress"
        ).length,
        completed: enrollments.filter((e: { status: string }) => e.status === "completed").length,
        certifications: certificatesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: t("training.stats.coursesAvailable"), value: stats.coursesAvailable, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: t("training.stats.inProgress"), value: stats.inProgress, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: t("training.stats.completed"), value: stats.completed, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: t("training.stats.certifications"), value: stats.certifications, icon: Award, color: "bg-info/10 text-info" },
  ];

  const allModules = {
    catalog: { title: t("training.modules.courseCatalog.title"), description: t("training.modules.courseCatalog.description"), href: "/training/catalog", icon: BookOpen, color: "bg-primary/10 text-primary", tabCode: "catalog" },
    employeeLearning: { title: t("training.modules.employeeLearning.title"), description: t("training.modules.employeeLearning.description"), href: "/training/employee-learning", icon: GraduationCap, color: "bg-success/10 text-success", tabCode: "employee-learning" },
    employeeCertifications: { title: t("training.modules.employeeCertifications.title"), description: t("training.modules.employeeCertifications.description"), href: "/training/employee-certifications", icon: Award, color: "bg-warning/10 text-warning", tabCode: "employee-certifications" },
    learningPaths: { title: t("training.modules.learningPaths.title"), description: t("training.modules.learningPaths.description"), href: "/training/learning-paths", icon: Route, color: "bg-info/10 text-info", tabCode: "learning-paths" },
    gapAnalysis: { title: t("training.modules.gapAnalysis.title"), description: t("training.modules.gapAnalysis.description"), href: "/training/gap-analysis", icon: Target, color: "bg-secondary/10 text-secondary-foreground", tabCode: "gap-analysis" },
    virtualClassroom: { title: t("training.modules.virtualClassroom.title"), description: t("training.modules.virtualClassroom.description"), href: "/training/virtual-classroom", icon: Monitor, color: "bg-info/10 text-info", tabCode: "virtual-classroom" },
    requests: { title: t("training.modules.requests.title"), description: t("training.modules.requests.description"), href: "/training/requests", icon: FileText, color: "bg-warning/10 text-warning", tabCode: "requests" },
    external: { title: t("training.modules.external.title"), description: t("training.modules.external.description"), href: "/training/external", icon: ExternalLink, color: "bg-accent/10 text-accent-foreground", tabCode: "external" },
    budgets: { title: t("training.modules.budgets.title"), description: t("training.modules.budgets.description"), href: "/training/budgets", icon: DollarSign, color: "bg-success/10 text-success", tabCode: "budgets" },
    instructors: { title: t("training.modules.instructors.title"), description: t("training.modules.instructors.description"), href: "/training/instructors", icon: Users, color: "bg-primary/10 text-primary", tabCode: "instructors" },
    evaluations: { title: t("training.modules.evaluations.title"), description: t("training.modules.evaluations.description"), href: "/training/evaluations", icon: ClipboardCheck, color: "bg-info/10 text-info", tabCode: "evaluations" },
    compliance: { title: t("training.modules.compliance.title"), description: t("training.modules.compliance.description"), href: "/training/compliance", icon: Shield, color: "bg-destructive/10 text-destructive", tabCode: "compliance" },
    courseCompetencies: { title: t("training.modules.courseCompetencies.title"), description: t("training.modules.courseCompetencies.description"), href: "/training/course-competencies", icon: Link, color: "bg-warning/10 text-warning", tabCode: "course-competencies" },
    recertification: { title: t("training.modules.recertification.title"), description: t("training.modules.recertification.description"), href: "/training/recertification", icon: RefreshCw, color: "bg-secondary/10 text-secondary-foreground", tabCode: "recertification" },
    needs: { title: t("training.modules.needs.title"), description: t("training.modules.needs.description"), href: "/training/needs", icon: TrendingUp, color: "bg-accent/10 text-accent-foreground", tabCode: "needs" },
    contentAuthoring: { title: t("training.modules.contentAuthoring.title"), description: t("training.modules.contentAuthoring.description"), href: "/training/content-authoring", icon: PenTool, color: "bg-primary/10 text-primary", tabCode: "content-authoring" },
    liveSessions: { title: t("training.modules.liveSessions.title"), description: t("training.modules.liveSessions.description"), href: "/training/sessions", icon: Video, color: "bg-muted text-muted-foreground", tabCode: "sessions" },
    calendar: { title: t("training.modules.calendar.title"), description: t("training.modules.calendar.description"), href: "/training/calendar", icon: Calendar, color: "bg-destructive/10 text-destructive", tabCode: "calendar" },
    analytics: { title: t("training.modules.analytics.title"), description: t("training.modules.analytics.description"), href: "/training/analytics", icon: BarChart3, color: "bg-primary/10 text-primary", tabCode: "analytics" },
    lms: { title: t("training.modules.lms.title"), description: t("training.modules.lms.description"), href: "/admin/lms", icon: Settings, color: "bg-muted text-muted-foreground", tabCode: "lms" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("training", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "Course Development & Delivery",
      items: filterByAccess([allModules.contentAuthoring, allModules.virtualClassroom, allModules.liveSessions, allModules.courseCompetencies, allModules.lms]),
    },
    {
      titleKey: "Learning & Development",
      items: filterByAccess([allModules.catalog, allModules.employeeLearning, allModules.employeeCertifications, allModules.learningPaths]),
    },
    {
      titleKey: "Planning & Assessment",
      items: filterByAccess([allModules.needs, allModules.gapAnalysis, allModules.evaluations, allModules.compliance, allModules.recertification]),
    },
    {
      titleKey: "Operations",
      items: filterByAccess([allModules.requests, allModules.external, allModules.instructors, allModules.budgets, allModules.calendar]),
    },
    {
      titleKey: "Analytics",
      items: filterByAccess([allModules.analytics]),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("training.dashboard.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("training.dashboard.subtitle")}
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
              <ModuleBIButton module="training" />
              <ModuleReportsButton module="training" />
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
                    <p className="mt-1 text-3xl font-bold text-card-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <GroupedModuleCards sections={sections} />
      </div>
    </AppLayout>
  );
}
