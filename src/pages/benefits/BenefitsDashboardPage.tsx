import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Gift,
  Heart,
  Shield,
  Stethoscope,
  ChevronRight,
  CheckCircle,
  Users,
  BarChart3,
  TrendingUp,
  Settings,
  Calendar,
  Clock,
  CalendarCheck,
  FileCheck,
  FileText,
  Scale,
  Calculator,
  Building2,
  Loader2,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

const getBenefitsModules = (t: any) => [
  {
    title: t("benefits.modules.categories.title"),
    description: t("benefits.modules.categories.description"),
    href: "/benefits/categories",
    icon: Gift,
    color: "bg-primary/10 text-primary",
    tabCode: "categories",
  },
  {
    title: t("benefits.modules.plans.title"),
    description: t("benefits.modules.plans.description"),
    href: "/benefits/plans",
    icon: Shield,
    color: "bg-success/10 text-success",
    tabCode: "plans",
  },
  {
    title: t("benefits.modules.providers.title"),
    description: t("benefits.modules.providers.description"),
    href: "/benefits/providers",
    icon: Building2,
    color: "bg-info/10 text-info",
    tabCode: "providers",
  },
  {
    title: t("benefits.modules.enrollments.title"),
    description: t("benefits.modules.enrollments.description"),
    href: "/benefits/enrollments",
    icon: Heart,
    color: "bg-accent/10 text-accent-foreground",
    tabCode: "enrollments",
  },
  {
    title: t("benefits.modules.claims.title"),
    description: t("benefits.modules.claims.description"),
    href: "/benefits/claims",
    icon: Stethoscope,
    color: "bg-warning/10 text-warning",
    tabCode: "claims",
  },
];

const getAnalyticsModules = (t: any) => [
  {
    title: t("benefits.modules.analytics.title"),
    description: t("benefits.modules.analytics.description"),
    href: "/benefits/analytics",
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
    tabCode: "analytics",
  },
  {
    title: t("benefits.modules.costProjections.title"),
    description: t("benefits.modules.costProjections.description"),
    href: "/benefits/cost-projections",
    icon: TrendingUp,
    color: "bg-success/10 text-success",
    tabCode: "cost_projections",
  },
  {
    title: t("benefits.modules.comparison.title"),
    description: t("benefits.modules.comparison.description"),
    href: "/benefits/compare",
    icon: Scale,
    color: "bg-info/10 text-info",
    tabCode: "compare",
  },
  {
    title: t("benefits.modules.calculator.title"),
    description: t("benefits.modules.calculator.description"),
    href: "/benefits/calculator",
    icon: Calculator,
    color: "bg-warning/10 text-warning",
    tabCode: "calculator",
  },
];

const getAdministrationModules = (t: any) => [
  {
    title: t("benefits.modules.autoEnrollment.title"),
    description: t("benefits.modules.autoEnrollment.description"),
    href: "/benefits/auto-enrollment",
    icon: Settings,
    color: "bg-primary/10 text-primary",
    tabCode: "auto_enrollment",
  },
  {
    title: t("benefits.modules.lifeEvents.title"),
    description: t("benefits.modules.lifeEvents.description"),
    href: "/benefits/life-events",
    icon: Calendar,
    color: "bg-success/10 text-success",
    tabCode: "life_events",
  },
  {
    title: t("benefits.modules.waitingPeriods.title"),
    description: t("benefits.modules.waitingPeriods.description"),
    href: "/benefits/waiting-periods",
    icon: Clock,
    color: "bg-info/10 text-info",
    tabCode: "waiting_periods",
  },
  {
    title: t("benefits.modules.openEnrollment.title"),
    description: t("benefits.modules.openEnrollment.description"),
    href: "/benefits/open-enrollment",
    icon: CalendarCheck,
    color: "bg-warning/10 text-warning",
    tabCode: "open_enrollment",
  },
];

const getComplianceModules = (t: any) => [
  {
    title: t("benefits.modules.eligibilityAudit.title"),
    description: t("benefits.modules.eligibilityAudit.description"),
    href: "/benefits/eligibility-audit",
    icon: FileCheck,
    color: "bg-primary/10 text-primary",
    tabCode: "eligibility_audit",
  },
  {
    title: t("benefits.modules.complianceReports.title"),
    description: t("benefits.modules.complianceReports.description"),
    href: "/benefits/compliance",
    icon: FileText,
    color: "bg-success/10 text-success",
    tabCode: "compliance",
  },
];

interface DashboardStats {
  activePlans: number;
  enrolledUsers: number;
  healthPlans: number;
  pendingClaims: number;
}

function ModuleSection({ title, modules, startIndex }: { title: string; modules: ReturnType<typeof getBenefitsModules>; startIndex: number }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <NavLink
              key={module.href}
              to={module.href}
              className="group rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
              style={{ animationDelay: `${(startIndex + index) * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`rounded-lg p-2.5 ${module.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </div>
              <h3 className="mt-3 font-semibold text-card-foreground text-sm">
                {module.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {module.description}
              </p>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default function BenefitsDashboardPage() {
  const { t } = useTranslation();
  const { hasTabAccess } = useGranularPermissions();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [stats, setStats] = useState<DashboardStats>({
    activePlans: 0,
    enrolledUsers: 0,
    healthPlans: 0,
    pendingClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  // Fetch stats when company selection changes
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const companyFilter = selectedCompanyId !== "all" ? selectedCompanyId : null;

        // Fetch active plans count
        let plansQuery = supabase
          .from("benefit_plans")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);
        if (companyFilter) {
          plansQuery = plansQuery.eq("company_id", companyFilter);
        }
        const { count: activePlansCount } = await plansQuery;

        // Fetch active enrollments count (unique employees)
        // Need to join with plans to filter by company
        let enrollmentsQuery = supabase
          .from("benefit_enrollments")
          .select("employee_id, plan_id, benefit_plans!inner(company_id)")
          .eq("status", "active");
        
        const { data: enrollments } = await enrollmentsQuery;
        
        let filteredEnrollments = enrollments || [];
        if (companyFilter) {
          filteredEnrollments = filteredEnrollments.filter(
            (e: any) => e.benefit_plans?.company_id === companyFilter
          );
        }
        const uniqueEnrolledUsers = new Set(filteredEnrollments.map((e: any) => e.employee_id)).size;

        // Fetch health plans count (plans with health-related categories)
        let categoriesQuery = supabase
          .from("benefit_categories")
          .select("id")
          .in("category_type", ["health", "medical", "dental", "vision"]);
        if (companyFilter) {
          categoriesQuery = categoriesQuery.eq("company_id", companyFilter);
        }
        const { data: healthCategories } = await categoriesQuery;
        
        const healthCategoryIds = healthCategories?.map(c => c.id) || [];
        let healthPlansCount = 0;
        if (healthCategoryIds.length > 0) {
          let healthPlansQuery = supabase
            .from("benefit_plans")
            .select("*", { count: "exact", head: true })
            .eq("is_active", true)
            .in("category_id", healthCategoryIds);
          if (companyFilter) {
            healthPlansQuery = healthPlansQuery.eq("company_id", companyFilter);
          }
          const { count } = await healthPlansQuery;
          healthPlansCount = count || 0;
        }

        // Fetch pending claims count - need to filter through enrollments and plans
        const { data: allClaims } = await supabase
          .from("benefit_claims")
          .select("id, enrollment_id, benefit_enrollments!inner(plan_id, benefit_plans!inner(company_id))")
          .eq("status", "submitted");
        
        let filteredClaims = allClaims || [];
        if (companyFilter) {
          filteredClaims = filteredClaims.filter(
            (c: any) => c.benefit_enrollments?.benefit_plans?.company_id === companyFilter
          );
        }
        const pendingClaimsCount = filteredClaims.length;

        setStats({
          activePlans: activePlansCount || 0,
          enrolledUsers: uniqueEnrolledUsers,
          healthPlans: healthPlansCount,
          pendingClaims: pendingClaimsCount,
        });
      } catch (error) {
        console.error("Error fetching benefits stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedCompanyId]);

  const statCards = [
    { label: t("benefits.activePlans"), value: stats.activePlans, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: t("benefits.enrolledUsers"), value: stats.enrolledUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("benefits.healthPlans"), value: stats.healthPlans, icon: Stethoscope, color: "bg-info/10 text-info" },
    { label: t("benefits.pendingClaims"), value: stats.pendingClaims, icon: FileText, color: "bg-warning/10 text-warning" },
  ];

  const benefitsModules = getBenefitsModules(t).filter(m => hasTabAccess("benefits", m.tabCode));
  const analyticsModules = getAnalyticsModules(t).filter(m => hasTabAccess("benefits", m.tabCode));
  const administrationModules = getAdministrationModules(t).filter(m => hasTabAccess("benefits", m.tabCode));
  const complianceModules = getComplianceModules(t).filter(m => hasTabAccess("benefits", m.tabCode));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("benefits.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("benefits.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModuleBIButton module="benefits" />
              <ModuleReportsButton module="benefits" />
            </div>
          </div>
        </div>

        {/* Company Filter */}
        <div className="flex items-center gap-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("benefits.allCompanies")}</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    {loading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                    )}
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <ModuleSection title={t("benefits.sections.coreBenefits")} modules={benefitsModules} startIndex={4} />
        <ModuleSection title={t("benefits.sections.analyticsReporting")} modules={analyticsModules} startIndex={8} />
        <ModuleSection title={t("benefits.sections.administration")} modules={administrationModules} startIndex={12} />
        <ModuleSection title={t("benefits.sections.compliance")} modules={complianceModules} startIndex={16} />
      </div>
    </AppLayout>
  );
}
