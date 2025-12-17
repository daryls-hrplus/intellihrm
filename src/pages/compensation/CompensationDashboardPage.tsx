import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { CompensationCompanyFilter, useCompensationCompanyFilter } from "@/components/compensation/CompensationCompanyFilter";
import { useCompensationStats } from "@/hooks/useCompensationStats";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  Users,
  Clock,
  Coins,
  Layers,
  History,
  Award,
  Gift,
  BarChart3,
  Scale,
  Receipt,
  PiggyBank,
  Gem,
  Target,
  CalendarIcon,
  ListOrdered,
} from "lucide-react";

export default function CompensationDashboardPage() {
  const { t } = useTranslation();
  const { selectedCompanyId, setSelectedCompanyId } = useCompensationCompanyFilter();
  const { hasTabAccess } = useGranularPermissions();
  const [asOfDate, setAsOfDate] = useState<Date>(new Date());
  const stats = useCompensationStats(selectedCompanyId, asOfDate);

  const allModules = {
    payElements: { title: t("compensation.modules.payElements.title"), description: t("compensation.modules.payElements.description"), href: "/compensation/pay-elements", icon: Coins, color: "bg-primary/10 text-primary", tabCode: "pay_elements" },
    salaryGrades: { title: t("compensation.modules.salaryGrades.title"), description: t("compensation.modules.salaryGrades.description"), href: "/compensation/salary-grades", icon: Layers, color: "bg-emerald-500/10 text-emerald-600", tabCode: "salary_grades" },
    spinalPoints: { title: t("compensation.modules.spinalPoints.title"), description: t("compensation.modules.spinalPoints.description"), href: "/compensation/spinal-points", icon: ListOrdered, color: "bg-slate-500/10 text-slate-600", tabCode: "spinal_points" },
    positionCompensation: { title: t("compensation.modules.positionCompensation.title"), description: t("compensation.modules.positionCompensation.description"), href: "/compensation/position-compensation", icon: Wallet, color: "bg-sky-500/10 text-sky-600", tabCode: "position_compensation" },
    employeeCompensation: { title: t("compensation.modules.employeeCompensation.title"), description: t("compensation.modules.employeeCompensation.description"), href: "/compensation/employee-compensation", icon: Users, color: "bg-blue-500/10 text-blue-600", tabCode: "employee_compensation" },
    history: { title: t("compensation.modules.history.title"), description: t("compensation.modules.history.description"), href: "/compensation/history", icon: History, color: "bg-violet-500/10 text-violet-600", tabCode: "history" },
    meritCycles: { title: t("compensation.modules.meritCycles.title"), description: t("compensation.modules.meritCycles.description"), href: "/compensation/merit-cycles", icon: Award, color: "bg-amber-500/10 text-amber-600", tabCode: "merit_cycles" },
    bonus: { title: t("compensation.modules.bonus.title"), description: t("compensation.modules.bonus.description"), href: "/compensation/bonus", icon: Gift, color: "bg-rose-500/10 text-rose-600", tabCode: "bonus" },
    marketBenchmarking: { title: t("compensation.modules.marketBenchmarking.title"), description: t("compensation.modules.marketBenchmarking.description"), href: "/compensation/market-benchmarking", icon: BarChart3, color: "bg-indigo-500/10 text-indigo-600", tabCode: "market_benchmarking" },
    compaRatio: { title: t("compensation.modules.compaRatio.title"), description: t("compensation.modules.compaRatio.description"), href: "/compensation/compa-ratio", icon: Target, color: "bg-teal-500/10 text-teal-600", tabCode: "compa_ratio" },
    payEquity: { title: t("compensation.modules.payEquity.title"), description: t("compensation.modules.payEquity.description"), href: "/compensation/pay-equity", icon: Scale, color: "bg-pink-500/10 text-pink-600", tabCode: "pay_equity" },
    totalRewards: { title: t("compensation.modules.totalRewards.title"), description: t("compensation.modules.totalRewards.description"), href: "/compensation/total-rewards", icon: Receipt, color: "bg-cyan-500/10 text-cyan-600", tabCode: "total_rewards" },
    budgets: { title: t("compensation.modules.budgets.title"), description: t("compensation.modules.budgets.description"), href: "/compensation/budgets", icon: PiggyBank, color: "bg-orange-500/10 text-orange-600", tabCode: "budgets" },
    equity: { title: t("compensation.modules.equity.title"), description: t("compensation.modules.equity.description"), href: "/compensation/equity", icon: Gem, color: "bg-fuchsia-500/10 text-fuchsia-600", tabCode: "equity" },
    analytics: { title: t("compensation.modules.analytics.title"), description: t("compensation.modules.analytics.description"), href: "/compensation/analytics", icon: TrendingUp, color: "bg-lime-500/10 text-lime-600", tabCode: "analytics" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("compensation", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "compensation.groups.payStructure",
      items: filterByAccess([allModules.payElements, allModules.salaryGrades, allModules.spinalPoints]),
    },
    {
      titleKey: "compensation.groups.employeePay",
      items: filterByAccess([allModules.positionCompensation, allModules.employeeCompensation, allModules.history]),
    },
    {
      titleKey: "compensation.groups.incentives",
      items: filterByAccess([allModules.meritCycles, allModules.bonus, allModules.equity]),
    },
    {
      titleKey: "compensation.groups.analyticsBenchmarking",
      items: filterByAccess([allModules.marketBenchmarking, allModules.compaRatio, allModules.payEquity, allModules.totalRewards, allModules.budgets, allModules.analytics]),
    },
  ];

  function formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  }

  const statCards = [
    { label: t("compensation.totalCompensation"), value: formatCurrency(stats.totalPayroll), icon: DollarSign, color: "bg-primary/10 text-primary" },
    { label: t("compensation.employees"), value: stats.employeesPaid, icon: Users, color: "bg-success/10 text-success" },
    { label: t("compensation.pendingReviews"), value: stats.pendingReviews, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: t("compensation.avgSalary"), value: formatCurrency(stats.avgSalary), icon: TrendingUp, color: "bg-info/10 text-info" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {t("compensation.title")}
                </h1>
                <p className="text-muted-foreground">
                  {t("compensation.subtitle")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModuleBIButton module="compensation" />
              <ModuleReportsButton module="compensation" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <CompensationCompanyFilter
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={setSelectedCompanyId}
            showAllOption={true}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !asOfDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {asOfDate ? format(asOfDate, "PPP") : <span>{t("compensation.asOfDate")}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={asOfDate}
                onSelect={(date) => date && setAsOfDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
                    {stats.isLoading ? (
                      <Skeleton className="h-9 w-20 mt-1" />
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

        <GroupedModuleCards sections={sections} />
      </div>
    </AppLayout>
  );
}
