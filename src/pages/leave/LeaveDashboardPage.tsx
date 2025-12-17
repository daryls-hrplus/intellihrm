import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { supabase } from "@/integrations/supabase/client";
import { GroupedModuleCards, GroupedModuleItem, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CalendarPlus,
  CalendarCheck,
  Clock,
  CheckCircle,
  Settings,
  TrendingUp,
  RotateCcw,
  PartyPopper,
  Building2,
  Calculator,
  BarChart3,
  Timer,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function LeaveDashboardPage() {
  const { t } = useLanguage();
  const { company, isAdmin, hasRole } = useAuth();
  const { hasTabAccess } = useGranularPermissions();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  
  // Company filter state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(company?.id || "");
  
  // Fetch companies for filter
  useEffect(() => {
    if (isAdminOrHR) {
      supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setCompanies(data);
        });
    }
  }, [isAdminOrHR]);

  // Set default company when loaded
  useEffect(() => {
    if (company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id, selectedCompanyId]);

  const { leaveBalances, allLeaveRequests } = useLeaveManagement(selectedCompanyId || company?.id);
  
  const pendingCount = allLeaveRequests.filter(r => r.status === "pending").length;
  const approvedThisYear = allLeaveRequests.filter(r => r.status === "approved").length;
  const totalBalance = leaveBalances.reduce((sum, b) => sum + (b.current_balance || 0), 0);

  // Define all modules
  const allModules = {
    // Self-Service
    myLeave: {
      title: t("leave.modules.myLeave"),
      description: t("leave.modules.myLeaveDesc"),
      href: "/leave/my-leave",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      tabCode: "my_leave",
    },
    applyLeave: {
      title: t("leave.modules.applyLeave"),
      description: t("leave.modules.applyLeaveDesc"),
      href: "/leave/apply",
      icon: CalendarPlus,
      color: "bg-success/10 text-success",
      tabCode: "apply",
    },
    teamCalendar: {
      title: t("leave.modules.teamCalendar"),
      description: t("leave.modules.teamCalendarDesc"),
      href: "/leave/calendar",
      icon: Calendar,
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "calendar",
    },
    // Approvals & Processing
    approvals: {
      title: t("leave.modules.approvals"),
      description: t("leave.modules.approvalsDesc"),
      href: "/leave/approvals",
      icon: CalendarCheck,
      color: "bg-warning/10 text-warning",
      tabCode: "approvals",
    },
    balanceAdjustments: {
      title: t("leave.modules.balanceAdjustments"),
      description: t("leave.modules.balanceAdjustmentsDesc"),
      href: "/leave/balance-adjustments",
      icon: Settings,
      color: "bg-slate-500/10 text-slate-600",
      tabCode: "balance_adjustments",
    },
    // Leave Configuration
    types: {
      title: t("leave.modules.types"),
      description: t("leave.modules.typesDesc"),
      href: "/leave/types",
      icon: Settings,
      color: "bg-info/10 text-info",
      tabCode: "types",
    },
    accrualRules: {
      title: t("leave.modules.accrualRules"),
      description: t("leave.modules.accrualRulesDesc"),
      href: "/leave/accrual-rules",
      icon: TrendingUp,
      color: "bg-primary/10 text-primary",
      tabCode: "accrual_rules",
    },
    rolloverRules: {
      title: t("leave.modules.rolloverRules"),
      description: t("leave.modules.rolloverRulesDesc"),
      href: "/leave/rollover-rules",
      icon: RotateCcw,
      color: "bg-secondary/10 text-secondary-foreground",
      tabCode: "rollover_rules",
    },
    holidays: {
      title: t("leave.modules.holidays"),
      description: t("leave.modules.holidaysDesc"),
      href: "/leave/holidays",
      icon: PartyPopper,
      color: "bg-destructive/10 text-destructive",
      tabCode: "holidays",
    },
    compTimePolicies: {
      title: t("leave.modules.compTimePolicies"),
      description: t("leave.modules.compTimePoliciesDesc"),
      href: "/leave/comp-time-policies",
      icon: Settings,
      color: "bg-muted text-muted-foreground",
      tabCode: "comp_time_policies",
    },
    // Time Banking
    compensatoryTime: {
      title: t("leave.modules.compensatoryTime"),
      description: t("leave.modules.compensatoryTimeDesc"),
      href: "/leave/compensatory-time",
      icon: Timer,
      color: "bg-info/10 text-info",
      tabCode: "compensatory_time",
    },
    balanceRecalculation: {
      title: t("leave.modules.balanceRecalculation"),
      description: t("leave.modules.balanceRecalculationDesc"),
      href: "/leave/balance-recalculation",
      icon: Calculator,
      color: "bg-accent text-accent-foreground",
      tabCode: "balance_recalculation",
    },
    // Analytics
    analytics: {
      title: t("leave.modules.analytics"),
      description: t("leave.modules.analyticsDesc"),
      href: "/leave/analytics",
      icon: BarChart3,
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "analytics",
    },
  };

  // Filter by permissions
  const filterByAccess = (modules: GroupedModuleItem[]): GroupedModuleItem[] => {
    return modules.filter(m => hasTabAccess("leave", m.tabCode || ""));
  };

  // Build grouped sections
  const sections: ModuleSection[] = [
    {
      titleKey: "Self-Service",
      items: filterByAccess([
        allModules.myLeave,
        allModules.applyLeave,
        allModules.teamCalendar,
      ]),
    },
    {
      titleKey: "Approvals & Processing",
      items: filterByAccess([
        allModules.approvals,
        allModules.balanceAdjustments,
      ]),
    },
    {
      titleKey: "Leave Configuration",
      items: filterByAccess([
        allModules.types,
        allModules.accrualRules,
        allModules.rolloverRules,
        allModules.holidays,
        allModules.compTimePolicies,
      ]),
    },
    {
      titleKey: "Time Banking",
      items: filterByAccess([
        allModules.compensatoryTime,
        allModules.balanceRecalculation,
      ]),
    },
    {
      titleKey: "Analytics",
      items: filterByAccess([
        allModules.analytics,
      ]),
    },
  ];

  const statCards = [
    { label: t("leave.stats.availableDays"), value: totalBalance.toFixed(1), icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: t("leave.stats.pendingRequests"), value: pendingCount, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: t("leave.stats.approvedThisYear"), value: approvedThisYear, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: t("leave.stats.leaveTypes"), value: leaveBalances.length, icon: CalendarCheck, color: "bg-info/10 text-info" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("leave.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("leave.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdminOrHR && companies.length > 1 && (
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[200px]">
                    <Building2 className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t("leave.selectCompany")} />
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
              <ModuleBIButton module="leave" />
              <ModuleReportsButton module="leave" />
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

        <GroupedModuleCards sections={sections} />
      </div>
    </AppLayout>
  );
}
