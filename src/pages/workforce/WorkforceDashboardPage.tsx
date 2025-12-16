import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { DraggableModuleCards, ModuleCardItem } from "@/components/ui/DraggableModuleCards";
import {
  Users,
  UserCheck,
  Network,
  FolderTree,
  Loader2,
  UserPlus,
  Building2,
  TrendingUp,
  UserCog,
  LineChart,
  BarChart3,
  Layers,
  Briefcase,
  Target,
  ClipboardList,
  Rocket,
  UserMinus,
  GraduationCap,
} from "lucide-react";

interface Stats {
  totalEmployees: number;
  activeCompanies: number;
  newThisMonth: number;
}

export default function WorkforceDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({ totalEmployees: 0, activeCompanies: 0, newThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { hasTabAccess, isLoading: permissionsLoading } = useGranularPermissions();

  const workforceModulesAll = [
    {
      title: t("workforce.modules.companyGroups.title"),
      description: t("workforce.modules.companyGroups.description"),
      href: "/workforce/company-groups",
      icon: Layers,
      color: "bg-cyan-500/10 text-cyan-500",
      tabCode: "company_groups",
    },
    {
      title: t("workforce.modules.companies.title"),
      description: t("workforce.modules.companies.description"),
      href: "/workforce/companies",
      icon: Building2,
      color: "bg-orange-500/10 text-orange-500",
      tabCode: "companies",
    },
    {
      title: t("workforce.modules.employees.title"),
      description: t("workforce.modules.employees.description"),
      href: "/workforce/employees",
      icon: Users,
      color: "bg-primary/10 text-primary",
      tabCode: "employees",
    },
    {
      title: t("workforce.modules.positions.title"),
      description: t("workforce.modules.positions.description"),
      href: "/workforce/positions",
      icon: UserCheck,
      color: "bg-info/10 text-info",
      tabCode: "positions",
    },
    {
      title: t("workforce.modules.assignments.title"),
      description: t("workforce.modules.assignments.description"),
      href: "/workforce/assignments",
      icon: UserCog,
      color: "bg-purple-500/10 text-purple-500",
      tabCode: "assignments",
    },
    {
      title: t("workforce.modules.orgStructure.title"),
      description: t("workforce.modules.orgStructure.description"),
      href: "/workforce/org-structure",
      icon: Network,
      color: "bg-success/10 text-success",
      tabCode: "org_structure",
    },
    {
      title: t("workforce.modules.departments.title"),
      description: t("workforce.modules.departments.description"),
      href: "/workforce/departments",
      icon: FolderTree,
      color: "bg-warning/10 text-warning",
      tabCode: "departments",
    },
    {
      title: t("workforce.modules.orgChanges.title"),
      description: t("workforce.modules.orgChanges.description"),
      href: "/workforce/org-changes",
      icon: TrendingUp,
      color: "bg-accent/10 text-accent-foreground",
      tabCode: "org_changes",
    },
    {
      title: t("workforce.modules.transactions.title"),
      description: t("workforce.modules.transactions.description"),
      href: "/workforce/transactions",
      icon: UserPlus,
      color: "bg-destructive/10 text-destructive",
      tabCode: "transactions",
    },
    {
      title: t("workforce.modules.forecasting.title"),
      description: t("workforce.modules.forecasting.description"),
      href: "/workforce/forecasting",
      icon: LineChart,
      color: "bg-indigo-500/10 text-indigo-500",
      tabCode: "forecasting",
    },
    {
      title: t("workforce.modules.jobFamilies.title"),
      description: t("workforce.modules.jobFamilies.description"),
      href: "/workforce/job-families",
      icon: FolderTree,
      color: "bg-teal-500/10 text-teal-500",
      tabCode: "job_families",
    },
    {
      title: t("workforce.modules.jobs.title"),
      description: t("workforce.modules.jobs.description"),
      href: "/workforce/jobs",
      icon: Briefcase,
      color: "bg-emerald-500/10 text-emerald-500",
      tabCode: "jobs",
    },
    {
      title: t("workforce.modules.competencies.title"),
      description: t("workforce.modules.competencies.description"),
      href: "/workforce/competencies",
      icon: Target,
      color: "bg-rose-500/10 text-rose-500",
      tabCode: "competencies",
    },
    {
      title: t("workforce.modules.responsibilities.title"),
      description: t("workforce.modules.responsibilities.description"),
      href: "/workforce/responsibilities",
      icon: ClipboardList,
      color: "bg-amber-500/10 text-amber-500",
      tabCode: "responsibilities",
    },
    {
      title: t("workforce.modules.onboarding.title"),
      description: t("workforce.modules.onboarding.description"),
      href: "/workforce/onboarding",
      icon: Rocket,
      color: "bg-emerald-500/10 text-emerald-500",
      tabCode: "onboarding",
    },
    {
      title: t("workforce.modules.offboarding.title"),
      description: t("workforce.modules.offboarding.description"),
      href: "/workforce/offboarding",
      icon: UserMinus,
      color: "bg-red-500/10 text-red-500",
      tabCode: "offboarding",
    },
    {
      title: t("workforce.modules.qualifications.title", "Qualifications"),
      description: t("workforce.modules.qualifications.description", "Manage academic qualifications and professional certifications"),
      href: "/workforce/qualifications",
      icon: GraduationCap,
      color: "bg-sky-500/10 text-sky-500",
      tabCode: "qualifications",
    },
    {
      title: t("workforce.modules.analytics.title"),
      description: t("workforce.modules.analytics.description"),
      href: "/workforce/analytics",
      icon: BarChart3,
      color: "bg-violet-500/10 text-violet-500",
      tabCode: "analytics",
    },
  ];

  // Filter modules based on granular tab permissions
  const workforceModules = workforceModulesAll.filter((module) =>
    hasTabAccess("workforce", module.tabCode)
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [employeesRes, companiesRes, newRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
        ]);
        setStats({
          totalEmployees: employeesRes.count || 0,
          activeCompanies: companiesRes.count || 0,
          newThisMonth: newRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: t("workforce.employeeCount"), value: stats.totalEmployees, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("workforce.activeCompanies"), value: stats.activeCompanies, icon: Building2, color: "bg-info/10 text-info" },
    { label: t("workforce.newThisMonth"), value: stats.newThisMonth, icon: UserPlus, color: "bg-success/10 text-success" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("workforce.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("workforce.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModuleBIButton module="workforce" />
              <ModuleReportsButton module="workforce" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
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

        <DraggableModuleCards 
          modules={workforceModules as ModuleCardItem[]} 
          preferenceKey="workforce-dashboard-order"
        />
      </div>
    </AppLayout>
  );
}
