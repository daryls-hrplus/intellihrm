import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const benefitsModules = [
  {
    title: "Benefit Categories",
    description: "Manage benefit category types",
    href: "/benefits/categories",
    icon: Gift,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Benefit Plans",
    description: "Configure benefit plans and coverage",
    href: "/benefits/plans",
    icon: Shield,
    color: "bg-success/10 text-success",
  },
  {
    title: "Benefit Providers",
    description: "Manage insurance companies and providers",
    href: "/benefits/providers",
    icon: Building2,
    color: "bg-info/10 text-info",
  },
  {
    title: "Enrollments",
    description: "Manage employee benefit enrollments",
    href: "/benefits/enrollments",
    icon: Heart,
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    title: "Claims",
    description: "Submit and track benefit claims",
    href: "/benefits/claims",
    icon: Stethoscope,
    color: "bg-warning/10 text-warning",
  },
];

const analyticsModules = [
  {
    title: "Benefits Analytics",
    description: "Enrollment trends, utilization rates, and cost analysis",
    href: "/benefits/analytics",
    icon: BarChart3,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Cost Projections",
    description: "Forecast future benefit costs and budget planning",
    href: "/benefits/cost-projections",
    icon: TrendingUp,
    color: "bg-success/10 text-success",
  },
  {
    title: "Plan Comparison",
    description: "Compare different benefit plans side by side",
    href: "/benefits/compare",
    icon: Scale,
    color: "bg-info/10 text-info",
  },
  {
    title: "Benefit Calculator",
    description: "Calculate employee benefit costs and contributions",
    href: "/benefits/calculator",
    icon: Calculator,
    color: "bg-warning/10 text-warning",
  },
];

const administrationModules = [
  {
    title: "Auto-Enrollment Rules",
    description: "Configure automatic benefit enrollment criteria",
    href: "/benefits/auto-enrollment",
    icon: Settings,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Life Event Management",
    description: "Handle qualifying life events for enrollment changes",
    href: "/benefits/life-events",
    icon: Calendar,
    color: "bg-success/10 text-success",
  },
  {
    title: "Waiting Period Tracking",
    description: "Track employee benefit eligibility timelines",
    href: "/benefits/waiting-periods",
    icon: Clock,
    color: "bg-info/10 text-info",
  },
  {
    title: "Open Enrollment Tracker",
    description: "Monitor open enrollment period progress",
    href: "/benefits/open-enrollment",
    icon: CalendarCheck,
    color: "bg-warning/10 text-warning",
  },
];

const complianceModules = [
  {
    title: "Eligibility Audit",
    description: "Verify dependent and employee eligibility",
    href: "/benefits/eligibility-audit",
    icon: FileCheck,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Compliance Reports",
    description: "Generate ACA, ERISA, and COBRA compliance reports",
    href: "/benefits/compliance",
    icon: FileText,
    color: "bg-success/10 text-success",
  },
];

interface DashboardStats {
  activePlans: number;
  enrolledUsers: number;
  healthPlans: number;
  pendingClaims: number;
}

function ModuleSection({ title, modules, startIndex }: { title: string; modules: typeof benefitsModules; startIndex: number }) {
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
    { label: "Active Plans", value: stats.activePlans, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Enrolled Users", value: stats.enrolledUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Health Plans", value: stats.healthPlans, icon: Stethoscope, color: "bg-info/10 text-info" },
    { label: "Pending Claims", value: stats.pendingClaims, icon: FileText, color: "bg-warning/10 text-warning" },
  ];

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
                  Benefits
                </h1>
                <p className="text-muted-foreground">
                  Employee benefits and perks management
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
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
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

        <ModuleSection title="Core Benefits" modules={benefitsModules} startIndex={4} />
        <ModuleSection title="Analytics & Reporting" modules={analyticsModules} startIndex={8} />
        <ModuleSection title="Administration" modules={administrationModules} startIndex={12} />
        <ModuleSection title="Compliance" modules={complianceModules} startIndex={16} />
      </div>
    </AppLayout>
  );
}
