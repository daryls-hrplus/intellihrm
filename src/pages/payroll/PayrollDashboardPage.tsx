import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { supabase } from "@/integrations/supabase/client";
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
} from "lucide-react";
import { DraggableModuleCards, ModuleCardItem } from "@/components/ui/DraggableModuleCards";
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
      // Fetch payroll runs summary (company-wide)
      const { data: payrollRuns } = await supabase
        .from('payroll_runs')
        .select('total_gross_pay, total_net_pay, employee_count, status, pay_period_id, pay_group_id, created_at')
        .order('created_at', { ascending: false });

      const totalPayroll = payrollRuns?.reduce((sum, r) => sum + (r.total_gross_pay || 0), 0) || 0;

      // Get the most recent payroll run to determine current period
      let currentPeriodLabel = "-";
      let currentPeriodEmployees = 0;
      let pendingApprovals = 0;
      const latestRun = payrollRuns?.[0];
      
      if (latestRun) {
        // Current period is based on when payroll was run (created_at)
        currentPeriodLabel = format(new Date(latestRun.created_at), 'MMM yyyy');
        
        if (latestRun.pay_period_id) {
          // Get runs in the current pay period
          const currentPeriodRuns = payrollRuns?.filter(r => r.pay_period_id === latestRun.pay_period_id) || [];
          
          // Count employees from all runs in the current pay period
          currentPeriodEmployees = currentPeriodRuns
            .filter(r => ['draft', 'calculating', 'calculated', 'pending_approval', 'approved', 'processing', 'paid'].includes(r.status))
            .reduce((sum, r) => sum + (r.employee_count || 0), 0);
          
          // Count unique pay groups with runs that are calculated but not yet approved
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

  const features = [
    {
      title: t("payroll.modules.payGroups.title"),
      description: t("payroll.modules.payGroups.description"),
      icon: Users,
      href: "/payroll/pay-groups",
      color: "bg-primary/10 text-primary",
      tabCode: "pay_groups",
    },
    {
      title: t("payroll.modules.processing.title"),
      description: t("payroll.modules.processing.description"),
      icon: Calculator,
      href: "/payroll/processing",
      color: "bg-success/10 text-success",
      tabCode: "processing",
    },
    {
      title: t("payroll.modules.payPeriods.title"),
      description: t("payroll.modules.payPeriods.description"),
      icon: CalendarCheck,
      href: "/payroll/pay-periods",
      color: "bg-warning/10 text-warning",
      tabCode: "pay_periods",
    },
    {
      title: t("payroll.modules.reports.title"),
      description: t("payroll.modules.reports.description"),
      icon: FileSpreadsheet,
      href: "/payroll/reports",
      color: "bg-secondary/10 text-secondary-foreground",
      tabCode: "reports",
    },
    {
      title: t("payroll.modules.taxConfig.title"),
      description: t("payroll.modules.taxConfig.description"),
      icon: Receipt,
      href: "/payroll/tax-config",
      color: "bg-muted text-muted-foreground",
      tabCode: "tax_config",
    },
    {
      title: t("payroll.modules.statutoryTypes.title", "Statutory Deduction Types"),
      description: t("payroll.modules.statutoryTypes.description", "Manage country-level statutory deductions"),
      icon: FileSpreadsheet,
      href: "/payroll/statutory-deduction-types",
      color: "bg-warning/10 text-warning",
      tabCode: "statutory_types",
    },
    {
      title: t("payroll.modules.yearEnd.title"),
      description: t("payroll.modules.yearEnd.description"),
      icon: FileSpreadsheet,
      href: "/payroll/year-end",
      color: "bg-destructive/10 text-destructive",
      tabCode: "year_end",
    },
    {
      title: "Pay Period Payroll Entries",
      description: "Manage compensation entries for pay periods",
      icon: Clock,
      href: "/payroll/salary-overtime",
      color: "bg-accent/10 text-accent-foreground",
      tabCode: "salary_overtime",
    },
    {
      title: "Regular Deductions",
      description: "Manage recurring employee deductions",
      icon: Clock,
      href: "/payroll/regular-deductions",
      color: "bg-destructive/10 text-destructive",
      tabCode: "regular_deductions",
    },
    {
      title: t("compensation.modules.payElements.title", "Pay Elements"),
      description: t("compensation.modules.payElements.description", "Define and manage pay element types"),
      icon: DollarSign,
      href: "/payroll/pay-elements",
      color: "bg-success/10 text-success",
      tabCode: "pay_elements",
    },
    {
      title: t("payroll.modules.benefitMapping.title", "Benefit Payroll Mappings"),
      description: t("payroll.modules.benefitMapping.description", "Map benefit plans to pay element codes"),
      icon: LinkIcon,
      href: "/payroll/benefit-mappings",
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "benefit_mappings",
    },
    {
      title: t("payroll.modules.leavePaymentConfig.title", "Leave Payment Config"),
      description: t("payroll.modules.leavePaymentConfig.description", "Configure leave payment rules and payroll mappings"),
      icon: Settings,
      href: "/payroll/leave-payment-config",
      color: "bg-primary/10 text-primary",
      tabCode: "leave_payment_config",
    },
    {
      title: t("payroll.modules.leaveBuyout.title", "Leave Buyout"),
      description: t("payroll.modules.leaveBuyout.description", "Manage leave balance buyout agreements"),
      icon: DollarSign,
      href: "/payroll/leave-buyout",
      color: "bg-success/10 text-success",
      tabCode: "leave_buyout",
    },
    {
      title: t("payroll.modules.templates.title"),
      description: t("payroll.modules.templates.description"),
      icon: Palette,
      href: "/payroll/templates",
      color: "bg-purple-500/10 text-purple-600",
      tabCode: "templates",
    },
    {
      title: t("payroll.modules.glInterface.title", "GL Interface"),
      description: t("payroll.modules.glInterface.description", "General ledger integration, cost centers, and journal entries"),
      icon: BookOpen,
      href: "/payroll/gl",
      color: "bg-accent/10 text-accent-foreground",
      tabCode: "gl_interface",
    },
    {
      title: t("payroll.modules.expenseClaims.title", "Expense Claims"),
      description: t("payroll.modules.expenseClaims.description", "Approve expense claims for payment in payroll"),
      icon: Receipt,
      href: "/payroll/expense-claims",
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "expense_claims",
    },
    {
      title: t("payroll.modules.archiveSettings.title", "Archive Settings"),
      description: t("payroll.modules.archiveSettings.description", "Configure payroll data retention and archiving"),
      icon: Archive,
      href: "/payroll/archive-settings",
      color: "bg-slate-500/10 text-slate-600",
      tabCode: "archive_settings",
    },
  ].filter(f => hasTabAccess("payroll", f.tabCode));

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

        {/* Features */}
        <DraggableModuleCards 
          modules={features} 
          preferenceKey="payroll_dashboard_order" 
        />

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
