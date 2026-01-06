import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { LeaveIntelligence } from "@/components/leave/LeaveIntelligence";
import { RODOverdueAlerts } from "@/components/leave/RODOverdueAlerts";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { useQuery } from "@tanstack/react-query";
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
  Ban,
  Users,
  Banknote,
  FileSpreadsheet,
  Percent,
  CalendarRange,
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
  
  // Company filter state - "all" means all companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(isAdminOrHR ? "all" : (company?.id || ""));
  
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

  // Set default for non-admin users
  useEffect(() => {
    if (!isAdminOrHR && company?.id && !selectedCompanyId) {
      setSelectedCompanyId(company.id);
    }
  }, [company?.id, selectedCompanyId, isAdminOrHR]);

  // Pass undefined for "all" to fetch all companies, otherwise pass the selected company ID
  const effectiveCompanyId = selectedCompanyId === "all" ? undefined : (selectedCompanyId || company?.id);
  const {
    leaveBalances = [],
    allLeaveRequests = [],
    allLeaveBalances = [],
  } = useLeaveManagement(effectiveCompanyId);
  
  const pendingCount = (allLeaveRequests ?? []).filter(r => r.status === "pending").length;
  const approvedThisYear = (allLeaveRequests ?? []).filter(r => r.status === "approved").length;
  const displayBalancesRaw = selectedCompanyId === "all" ? (allLeaveBalances ?? []) : (leaveBalances ?? []);
  const displayBalances = Array.isArray(displayBalancesRaw) ? displayBalancesRaw : [];
  const totalBalance = displayBalances.reduce((sum, b) => sum + (b.current_balance || 0), 0);

  // Fetch all overdue RODs for HR view
  const { data: allOverdueRods = [] } = useQuery({
    queryKey: ['hr-overdue-rods', effectiveCompanyId],
    queryFn: async () => {
      let query = supabase
        .from('resumption_of_duty')
        .select(`
          *,
          profiles!resumption_of_duty_employee_id_fkey (
            id,
            full_name,
            email,
            avatar_url
          ),
          leave_requests (
            id,
            request_number,
            start_date,
            end_date,
            duration,
            leave_types (
              id,
              name,
              code
            )
          )
        `)
        .in('status', ['overdue', 'no_show'])
        .order('leave_end_date', { ascending: true });

      if (effectiveCompanyId) {
        query = query.eq('company_id', effectiveCompanyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as import("@/hooks/useResumptionOfDuty").ResumptionOfDuty[];
    },
    enabled: isAdminOrHR
  });

  // Define all modules
  const allModules = {
    // Leave Records Management
    employeeRecords: {
      title: t("leave.modules.employeeRecords", "Employee Leave Records"),
      description: t("leave.modules.employeeRecordsDesc", "View and manage all employee leave transactions"),
      href: "/leave/employee-records",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
      tabCode: "employee_records",
    },
    employeeBalances: {
      title: t("leave.modules.employeeBalances", "Employee Balances"),
      description: t("leave.modules.employeeBalancesDesc", "View and manage leave balances for all employees"),
      href: "/leave/employee-balances",
      icon: CalendarPlus,
      color: "bg-success/10 text-success",
      tabCode: "employee_balances",
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
    leaveYears: {
      title: t("leave.modules.leaveYears", "Leave Years"),
      description: t("leave.modules.leaveYearsDesc", "Configure leave periods and fiscal years"),
      href: "/leave/years",
      icon: Calendar,
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "leave_years",
    },
    scheduleConfig: {
      title: t("leave.modules.scheduleConfig", "Schedule Configuration"),
      description: t("leave.modules.scheduleConfigDesc", "Configure automated leave processing schedules"),
      href: "/leave/schedule-config",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600",
      tabCode: "schedule_config",
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
    // New Enhancement Modules
    blackoutPeriods: {
      title: t("leave.modules.blackoutPeriods", "Blackout Periods"),
      description: t("leave.modules.blackoutPeriodsDesc", "Configure periods when leave requests are restricted"),
      href: "/leave/blackout-periods",
      icon: Ban,
      color: "bg-red-500/10 text-red-600",
      tabCode: "blackout_periods",
    },
    conflictRules: {
      title: t("leave.modules.conflictRules", "Conflict Rules"),
      description: t("leave.modules.conflictRulesDesc", "Set team overlap limits and conflict detection rules"),
      href: "/leave/conflict-rules",
      icon: Users,
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "conflict_rules",
    },
    encashment: {
      title: t("leave.modules.encashment", "Leave Encashment"),
      description: t("leave.modules.encashmentDesc", "Process leave encashment requests and payouts"),
      href: "/leave/encashment",
      icon: Banknote,
      color: "bg-green-500/10 text-green-600",
      tabCode: "encashment",
    },
    liability: {
      title: t("leave.modules.liability", "Leave Liability"),
      description: t("leave.modules.liabilityDesc", "View leave liability reports and financial impact"),
      href: "/leave/liability",
      icon: FileSpreadsheet,
      color: "bg-blue-500/10 text-blue-600",
      tabCode: "liability",
    },
    prorataSettings: {
      title: t("leave.modules.prorataSettings", "Pro-rata Settings"),
      description: t("leave.modules.prorataSettingsDesc", "Configure pro-rata entitlement calculations"),
      href: "/leave/prorata-settings",
      icon: Percent,
      color: "bg-purple-500/10 text-purple-600",
      tabCode: "prorata_settings",
    },
    planner: {
      title: t("leave.modules.planner", "Leave Planner"),
      description: t("leave.modules.plannerDesc", "Plan and schedule future leave requests"),
      href: "/leave/planner",
      icon: CalendarRange,
      color: "bg-teal-500/10 text-teal-600",
      tabCode: "planner",
    },
  };

  // Filter by permissions
  const filterByAccess = (modules: GroupedModuleItem[]): GroupedModuleItem[] => {
    return modules.filter(m => hasTabAccess("leave", m.tabCode || ""));
  };

  // Build grouped sections
  const sections: ModuleSection[] = [
    {
      titleKey: "Leave Records",
      items: filterByAccess([
        allModules.employeeRecords,
        allModules.employeeBalances,
        allModules.teamCalendar,
      ]),
    },
    {
      titleKey: "Processing",
      items: filterByAccess([
        allModules.approvals,
        allModules.balanceAdjustments,
        allModules.compensatoryTime,
        allModules.balanceRecalculation,
        allModules.encashment,
      ]),
    },
    {
      titleKey: "Planning",
      items: filterByAccess([
        allModules.planner,
        allModules.liability,
      ]),
    },
    {
      titleKey: "Analytics",
      items: filterByAccess([
        allModules.analytics,
      ]),
    },
    {
      titleKey: "Leave Setup",
      items: filterByAccess([
        allModules.types,
        allModules.leaveYears,
        allModules.accrualRules,
        allModules.rolloverRules,
        allModules.holidays,
        allModules.compTimePolicies,
        allModules.scheduleConfig,
        allModules.blackoutPeriods,
        allModules.conflictRules,
        allModules.prorataSettings,
      ]),
    },
  ];

  const statCards = [
    { label: t("leave.stats.availableDays"), value: totalBalance.toFixed(1), icon: Calendar, color: "bg-primary/10 text-primary" },
    { label: t("leave.stats.pendingRequests"), value: pendingCount, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: t("leave.stats.approvedThisYear"), value: approvedThisYear, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: t("leave.stats.leaveTypes"), value: displayBalances.length, icon: CalendarCheck, color: "bg-info/10 text-info" },
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
              {isAdminOrHR && companies.length > 0 && (
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger className="w-[220px]">
                    <Building2 className="mr-2 h-4 w-4" />
                    <SelectValue placeholder={t("leave.selectCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="font-medium">All Companies</span>
                    </SelectItem>
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

        {/* Overdue Resumptions for HR */}
        {isAdminOrHR && allOverdueRods.length > 0 && (
          <RODOverdueAlerts 
            overdueRods={allOverdueRods} 
            title="Overdue Resumptions Requiring Attention" 
          />
        )}

        {/* Leave Intelligence for Managers */}
        {isAdminOrHR && <LeaveIntelligence />}

        <GroupedModuleCards sections={sections} defaultOpen={true} showToggleButton />
      </div>
    </AppLayout>
  );
}
