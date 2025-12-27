import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { supabase } from "@/integrations/supabase/client";
import { GroupedModuleCards, ModuleSection } from "@/components/ui/GroupedModuleCards";
import { 
  Wallet, 
  Calculator, 
  FileSpreadsheet, 
  Receipt, 
  CalendarCheck,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Settings,
  BookOpen,
  Palette,
  Archive,
  Link as LinkIcon,
  PartyPopper,
  RefreshCw,
  Globe,
  CalendarRange,
  Coins,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

export default function PayrollDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { hasTabAccess } = useGranularPermissions();

  const [stats, setStats] = useState({
    currentPeriod: "-",
    totalPayroll: "$0",
    employeesPaid: "0",
    pendingApprovals: "0",
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: payrollRuns } = await supabase
        .from('payroll_runs')
        .select('total_gross_pay, total_net_pay, employee_count, status, pay_period_id, pay_group_id, created_at')
        .order('created_at', { ascending: false });

      const totalPayroll = payrollRuns?.reduce((sum, r) => sum + (r.total_gross_pay || 0), 0) || 0;

      let currentPeriodLabel = "-";
      let currentPeriodEmployees = 0;
      let pendingApprovals = 0;
      const latestRun = payrollRuns?.[0];
      
      if (latestRun) {
        currentPeriodLabel = format(new Date(latestRun.created_at), 'MMM yyyy');
        
        if (latestRun.pay_period_id) {
          const currentPeriodRuns = payrollRuns?.filter(r => r.pay_period_id === latestRun.pay_period_id) || [];
          
          currentPeriodEmployees = currentPeriodRuns
            .filter(r => ['draft', 'calculating', 'calculated', 'pending_approval', 'approved', 'processing', 'paid'].includes(r.status))
            .reduce((sum, r) => sum + (r.employee_count || 0), 0);
          
          const pendingPayGroups = new Set(
            currentPeriodRuns
              .filter(r => ['calculated', 'pending_approval'].includes(r.status) && r.pay_group_id)
              .map(r => r.pay_group_id)
          );
          pendingApprovals = pendingPayGroups.size;
        }
      }

      const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
          return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `$${(amount / 1000).toFixed(1)}K`;
        }
        return `$${amount.toFixed(0)}`;
      };

      setStats({
        currentPeriod: currentPeriodLabel,
        totalPayroll: formatCurrency(totalPayroll),
        employeesPaid: currentPeriodEmployees.toString(),
        pendingApprovals: pendingApprovals.toString(),
      });
    };

    fetchStats();
  }, []);

  const allModules = {
    payGroups: { title: t("payroll.modules.payGroups.title"), description: t("payroll.modules.payGroups.description"), icon: Users, href: "/payroll/pay-groups", color: "bg-primary/10 text-primary", tabCode: "pay_groups" },
    processing: { title: t("payroll.modules.processing.title"), description: t("payroll.modules.processing.description"), icon: Calculator, href: "/payroll/processing", color: "bg-success/10 text-success", tabCode: "processing" },
    offCycle: { title: "Off-Cycle Payroll", description: "Process corrections, adjustments, and supplemental payments", icon: RefreshCw, href: "/payroll/off-cycle", color: "bg-warning/10 text-warning", tabCode: "off_cycle" },
    payPeriods: { title: t("payroll.modules.payPeriods.title"), description: t("payroll.modules.payPeriods.description"), icon: CalendarCheck, href: "/payroll/pay-periods", color: "bg-warning/10 text-warning", tabCode: "pay_periods" },
    reports: { title: t("payroll.modules.reports.title"), description: t("payroll.modules.reports.description"), icon: FileSpreadsheet, href: "/payroll/reports", color: "bg-secondary/10 text-secondary-foreground", tabCode: "reports" },
    taxConfig: { title: t("payroll.modules.taxConfig.title"), description: t("payroll.modules.taxConfig.description"), icon: Receipt, href: "/payroll/tax-config", color: "bg-muted text-muted-foreground", tabCode: "tax_config" },
    statutoryTypes: { title: t("payroll.modules.statutoryTypes.title", "Statutory Deduction Types"), description: t("payroll.modules.statutoryTypes.description", "Manage country-level statutory deductions"), icon: FileSpreadsheet, href: "/payroll/statutory-deduction-types", color: "bg-warning/10 text-warning", tabCode: "statutory_types" },
    yearEnd: { title: t("payroll.modules.yearEnd.title"), description: t("payroll.modules.yearEnd.description"), icon: FileSpreadsheet, href: "/payroll/year-end", color: "bg-destructive/10 text-destructive", tabCode: "year_end" },
    salaryOvertime: { title: "Pay Period Payroll Entries", description: "Manage compensation entries for pay periods", icon: Clock, href: "/payroll/salary-overtime", color: "bg-accent/10 text-accent-foreground", tabCode: "salary_overtime" },
    regularDeductions: { title: "Regular Deductions", description: "Manage recurring employee deductions", icon: Clock, href: "/payroll/regular-deductions", color: "bg-destructive/10 text-destructive", tabCode: "regular_deductions" },
    payElements: { title: t("compensation.modules.payElements.title", "Pay Elements"), description: t("compensation.modules.payElements.description", "Define and manage pay element types"), icon: DollarSign, href: "/payroll/pay-elements", color: "bg-success/10 text-success", tabCode: "pay_elements" },
    benefitMapping: { title: t("payroll.modules.benefitMapping.title", "Benefit Payroll Mappings"), description: t("payroll.modules.benefitMapping.description", "Map benefit plans to pay element codes"), icon: LinkIcon, href: "/payroll/benefit-mappings", color: "bg-cyan-500/10 text-cyan-600", tabCode: "benefit_mappings" },
    transactionMapping: { title: "Transaction Payroll Mappings", description: "Map workforce employee transactions to pay elements", icon: LinkIcon, href: "/payroll/transaction-mappings", color: "bg-violet-500/10 text-violet-600", tabCode: "transaction_mappings" },
    statutoryMapping: { title: t("payroll.modules.statutoryMapping.title", "Statutory Pay Mappings"), description: t("payroll.modules.statutoryMapping.description", "Map statutory deductions to pay elements"), icon: LinkIcon, href: "/payroll/statutory-pay-element-mappings", color: "bg-amber-500/10 text-amber-600", tabCode: "statutory_mappings" },
    leavePaymentConfig: { title: t("payroll.modules.leavePaymentConfig.title", "Leave Payment Config"), description: t("payroll.modules.leavePaymentConfig.description", "Configure leave payment rules and payroll mappings"), icon: Settings, href: "/payroll/leave-payment-config", color: "bg-primary/10 text-primary", tabCode: "leave_payment_config" },
    leaveBuyout: { title: t("payroll.modules.leaveBuyout.title", "Leave Buyout"), description: t("payroll.modules.leaveBuyout.description", "Manage leave balance buyout agreements"), icon: DollarSign, href: "/payroll/leave-buyout", color: "bg-success/10 text-success", tabCode: "leave_buyout" },
    templates: { title: t("payroll.modules.templates.title"), description: t("payroll.modules.templates.description"), icon: Palette, href: "/payroll/templates", color: "bg-purple-500/10 text-purple-600", tabCode: "templates" },
    glInterface: { title: t("payroll.modules.glInterface.title", "GL Interface"), description: t("payroll.modules.glInterface.description", "General ledger integration, cost centers, and journal entries"), icon: BookOpen, href: "/payroll/gl", color: "bg-accent/10 text-accent-foreground", tabCode: "gl_interface" },
    expenseClaims: { title: t("payroll.modules.expenseClaims.title", "Expense Claims"), description: t("payroll.modules.expenseClaims.description", "Approve expense claims for payment in payroll"), icon: Receipt, href: "/payroll/expense-claims", color: "bg-orange-500/10 text-orange-600", tabCode: "expense_claims" },
    archiveSettings: { title: t("payroll.modules.archiveSettings.title", "Archive Settings"), description: t("payroll.modules.archiveSettings.description", "Configure payroll data retention and archiving"), icon: Archive, href: "/payroll/archive-settings", color: "bg-slate-500/10 text-slate-600", tabCode: "archive_settings" },
    taxAllowances: { title: t("payroll.modules.taxAllowances.title", "Tax Allowances"), description: t("payroll.modules.taxAllowances.description", "Manage non-taxable allowances for employees"), icon: Receipt, href: "/payroll/tax-allowances", color: "bg-emerald-500/10 text-emerald-600", tabCode: "tax_allowances" },
    bankFileBuilder: { title: t("payroll.modules.bankFileBuilder.title", "Bank File Builder"), description: t("payroll.modules.bankFileBuilder.description", "AI-powered bank file configuration and generation"), icon: FileSpreadsheet, href: "/payroll/bank-file-builder", color: "bg-indigo-500/10 text-indigo-600", tabCode: "bank_file_builder" },
    holidays: { title: t("leave.holidays.title", "Holidays Calendar"), description: t("leave.holidays.subtitle", "Manage country and company holidays"), icon: PartyPopper, href: "/payroll/holidays", color: "bg-pink-500/10 text-pink-600", tabCode: "holidays" },
    openingBalances: { title: "Opening Balances", description: "Import brought forward YTD balances for mid-year employees", icon: FileSpreadsheet, href: "/payroll/opening-balances", color: "bg-teal-500/10 text-teal-600", tabCode: "opening_balances" },
    countryYearSetup: { title: "Country Year Setup", description: "Configure fiscal years, tax years, and regional settings per country", icon: Globe, href: "/payroll/country-year-setup", color: "bg-violet-500/10 text-violet-600", tabCode: "country_year_setup" },
    yearEndClosing: { title: "Year End Closing", description: "Roll pay groups into new fiscal year, reset YTD, generate new periods", icon: Archive, href: "/payroll/year-end-closing", color: "bg-rose-500/10 text-rose-600", tabCode: "year_end_closing" },
    semiMonthlyRules: { title: "Semi-Monthly Rules", description: "Configure statutory and deduction handling for semi-monthly payroll", icon: CalendarRange, href: "/payroll/semimonthly-rules", color: "bg-cyan-500/10 text-cyan-600", tabCode: "semimonthly_rules" },
    tipPools: { title: "Tips & Tronc", description: "Manage tip pooling and tronc distribution for hospitality", icon: Coins, href: "/payroll/tip-pools", color: "bg-amber-500/10 text-amber-600", tabCode: "tip_pools" },
    statutoryTaxRelief: { title: "Statutory Tax Relief", description: "Configure social security deductions that reduce taxable income", icon: Calculator, href: "/payroll/statutory-tax-relief", color: "bg-lime-500/10 text-lime-600", tabCode: "statutory_tax_relief" },
    taxReliefSchemes: { title: "Tax Relief Schemes", description: "Personal reliefs, savings, housing, education & youth incentives", icon: Receipt, href: "/payroll/tax-relief-schemes", color: "bg-sky-500/10 text-sky-600", tabCode: "tax_relief_schemes" },
    retroactivePay: { title: "Retroactive Pay", description: "Configure and generate back pay adjustments by pay group", icon: History, href: "/payroll/retroactive-pay", color: "bg-fuchsia-500/10 text-fuchsia-600", tabCode: "retroactive_pay" },
  };

  const filterByAccess = (modules: typeof allModules[keyof typeof allModules][]) =>
    modules.filter(m => hasTabAccess("payroll", m.tabCode));

  const sections: ModuleSection[] = [
    {
      titleKey: "Processing",
      items: filterByAccess([allModules.processing, allModules.offCycle, allModules.payPeriods, allModules.salaryOvertime, allModules.regularDeductions, allModules.expenseClaims, allModules.tipPools, allModules.retroactivePay, allModules.openingBalances, allModules.yearEndClosing]),
    },
    {
      titleKey: "Configuration",
      items: filterByAccess([allModules.payGroups, allModules.semiMonthlyRules, allModules.statutoryTaxRelief, allModules.taxReliefSchemes, allModules.payElements, allModules.taxConfig, allModules.statutoryTypes, allModules.taxAllowances, allModules.countryYearSetup, allModules.templates, allModules.holidays]),
    },
    {
      titleKey: "Integration",
      items: filterByAccess([allModules.benefitMapping, allModules.transactionMapping, allModules.statutoryMapping, allModules.leavePaymentConfig, allModules.leaveBuyout, allModules.glInterface, allModules.bankFileBuilder]),
    },
    {
      titleKey: "Reporting & Analytics",
      items: filterByAccess([allModules.reports, allModules.yearEnd, allModules.archiveSettings]),
    },
  ];

  const statItems = [
    { label: t("payroll.stats.currentPeriod"), value: stats.currentPeriod, icon: CalendarCheck },
    { label: t("payroll.stats.totalPayroll"), value: stats.totalPayroll, icon: DollarSign },
    { label: t("payroll.stats.paidProcessing", "Paid/Processing"), value: stats.employeesPaid, icon: Users },
    { label: t("payroll.stats.pendingApprovals"), value: stats.pendingApprovals, icon: Clock },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("navigation.payroll") }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("payroll.management")}
              </h1>
              <p className="text-muted-foreground">
                {t("payroll.managementSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModuleBIButton module="payroll" />
            <ModuleReportsButton module="payroll" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {statItems.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <GroupedModuleCards sections={sections} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("payroll.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              {t("payroll.noRecentActivity")}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
