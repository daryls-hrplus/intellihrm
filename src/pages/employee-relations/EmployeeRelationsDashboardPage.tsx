import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  Heart,
  AlertTriangle,
  Scale,
  Award,
  DoorOpen,
  Activity,
  BarChart3,
  MessageSquare,
  Building2,
  Gavel,
  Loader2,
  Users,
  FileText,
} from "lucide-react";

interface Stats {
  openCases: number;
  pendingGrievances: number;
  recognitionsThisMonth: number;
  activeUnions: number;
}

export default function EmployeeRelationsDashboardPage() {
  const { t } = useTranslation();
  const { hasTabAccess } = useGranularPermissions();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [stats, setStats] = useState<Stats>({ openCases: 0, pendingGrievances: 0, recognitionsThisMonth: 0, activeUnions: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", selectedCompanyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name, code")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCompanyId,
  });

  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  useEffect(() => {
    setSelectedDepartmentId("all");
  }, [selectedCompanyId]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedCompanyId) return;
      setIsLoadingStats(true);
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [casesRes, grievancesRes, recognitionsRes, unionsRes] = await Promise.all([
          supabase.from("er_cases").select("id", { count: "exact", head: true }).eq("company_id", selectedCompanyId).eq("status", "open"),
          supabase.from("grievances").select("id", { count: "exact", head: true }).eq("company_id", selectedCompanyId).in("status", ["filed", "under_review", "in_progress"]),
          supabase.from("er_recognition").select("id", { count: "exact", head: true }).eq("company_id", selectedCompanyId).gte("award_date", startOfMonth.toISOString().split('T')[0]),
          supabase.from("unions").select("id", { count: "exact", head: true }).eq("company_id", selectedCompanyId).eq("is_active", true),
        ]);
        setStats({
          openCases: casesRes.count || 0,
          pendingGrievances: grievancesRes.count || 0,
          recognitionsThisMonth: recognitionsRes.count || 0,
          activeUnions: unionsRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    fetchStats();
  }, [selectedCompanyId]);

  const allModules = {
    analytics: { title: t("employeeRelationsModule.analytics.title"), description: t("employeeRelationsModule.analytics.description"), href: `/employee-relations/analytics?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: BarChart3, color: "bg-violet-500/10 text-violet-500", tabCode: "analytics" },
    cases: { title: t("employeeRelationsModule.cases.title"), description: t("employeeRelationsModule.cases.description"), href: `/employee-relations/cases?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: AlertTriangle, color: "bg-warning/10 text-warning", tabCode: "cases" },
    disciplinary: { title: t("employeeRelationsModule.disciplinary.title"), description: t("employeeRelationsModule.disciplinary.description"), href: `/employee-relations/disciplinary?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: Scale, color: "bg-destructive/10 text-destructive", tabCode: "disciplinary" },
    grievances: { title: t("employeeRelationsModule.grievances.title"), description: t("employeeRelationsModule.grievances.description"), href: `/employee-relations/grievances?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: FileText, color: "bg-orange-500/10 text-orange-500", tabCode: "grievances" },
    recognition: { title: t("employeeRelationsModule.recognition.title"), description: t("employeeRelationsModule.recognition.description"), href: `/employee-relations/recognition?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: Award, color: "bg-amber-500/10 text-amber-500", tabCode: "recognition" },
    surveys: { title: t("employeeRelationsModule.surveys.title"), description: t("employeeRelationsModule.surveys.description"), href: `/employee-relations/surveys?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: MessageSquare, color: "bg-info/10 text-info", tabCode: "surveys" },
    wellness: { title: t("employeeRelationsModule.wellness.title"), description: t("employeeRelationsModule.wellness.description"), href: `/employee-relations/wellness?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: Activity, color: "bg-success/10 text-success", tabCode: "wellness" },
    exitInterviews: { title: t("employeeRelationsModule.exitInterviews.title"), description: t("employeeRelationsModule.exitInterviews.description"), href: `/employee-relations/exit-interviews?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: DoorOpen, color: "bg-cyan-500/10 text-cyan-500", tabCode: "exit-interviews" },
    unions: { title: t("employeeRelationsModule.unions.title"), description: t("employeeRelationsModule.unions.description"), href: `/employee-relations/unions?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: Building2, color: "bg-primary/10 text-primary", tabCode: "unions" },
    courtJudgements: { title: t("employeeRelationsModule.courtJudgements.title"), description: t("employeeRelationsModule.courtJudgements.description"), href: `/employee-relations/court-judgements?company=${selectedCompanyId}&department=${selectedDepartmentId}`, icon: Gavel, color: "bg-rose-500/10 text-rose-500", tabCode: "court-judgements" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("employee_relations", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "Cases & Disciplinary",
      items: filterByAccess([allModules.cases, allModules.disciplinary, allModules.grievances]),
    },
    {
      titleKey: "Recognition & Engagement",
      items: filterByAccess([allModules.recognition, allModules.surveys, allModules.wellness]),
    },
    {
      titleKey: "Exit & Legal",
      items: filterByAccess([allModules.exitInterviews, allModules.unions, allModules.courtJudgements]),
    },
    {
      titleKey: "Analytics",
      items: filterByAccess([allModules.analytics]),
    },
  ];

  const statCards = [
    { label: t("employeeRelationsModule.stats.openCases"), value: stats.openCases, icon: AlertTriangle, color: "bg-warning/10 text-warning" },
    { label: t("employeeRelationsModule.stats.pendingGrievances"), value: stats.pendingGrievances, icon: FileText, color: "bg-orange-500/10 text-orange-500" },
    { label: t("employeeRelationsModule.stats.recognitionsThisMonth"), value: stats.recognitionsThisMonth, icon: Award, color: "bg-amber-500/10 text-amber-500" },
    { label: t("employeeRelationsModule.stats.activeUnions"), value: stats.activeUnions, icon: Users, color: "bg-primary/10 text-primary" },
  ];

  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: t("employeeRelationsModule.title") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t('employeeRelationsModule.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('employeeRelationsModule.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('common.selectCompany')} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t('common.selectDepartment')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.allDepartments')}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ModuleBIButton module="employee_relations" />
              <ModuleReportsButton module="employee_relations" />
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
                      {isLoadingStats ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
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

        <GroupedModuleCards sections={sections} defaultOpen={true} showToggleButton />
      </div>
    </AppLayout>
  );
}
