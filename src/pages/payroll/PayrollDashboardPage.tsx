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
  ArrowRight,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Settings,
  BookOpen,
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
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch current pay period (period that contains today or most recent past period)
      const { data: currentPeriod } = await supabase
        .from('pay_periods')
        .select('period_start, period_end')
        .lte('period_start', today)
        .order('period_start', { ascending: false })
        .limit(1)
        .single();

      // Fetch payroll runs summary
      const { data: payrollRuns } = await supabase
        .from('payroll_runs')
        .select('total_gross_pay, total_net_pay, employee_count, status');

      const totalPayroll = payrollRuns?.reduce((sum, r) => sum + (r.total_gross_pay || 0), 0) || 0;
      // Count total employees across all calculated/approved/paid runs (not just paid)
      const totalEmployees = payrollRuns?.filter(r => ['calculated', 'approved', 'paid'].includes(r.status)).reduce((sum, r) => sum + (r.employee_count || 0), 0) || 0;
      const pendingApprovals = payrollRuns?.filter(r => ['calculated', 'pending_approval'].includes(r.status)).length || 0;

      const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
          return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `$${(amount / 1000).toFixed(1)}K`;
        }
        return `$${amount.toFixed(0)}`;
      };

      setStats({
        currentPeriod: currentPeriod 
          ? format(new Date(currentPeriod.period_start), 'MMM yyyy')
          : "-",
        totalPayroll: formatCurrency(totalPayroll),
        employeesPaid: totalEmployees.toString(),
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
      title: t("payroll.modules.salaryOvertime.title"),
      description: t("payroll.modules.salaryOvertime.description"),
      icon: Clock,
      href: "/payroll/salary-overtime",
      color: "bg-accent/10 text-accent-foreground",
      tabCode: "salary_overtime",
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
      title: t("payroll.modules.glInterface.title", "GL Interface"),
      description: t("payroll.modules.glInterface.description", "General ledger integration, cost centers, and journal entries"),
      icon: BookOpen,
      href: "/payroll/gl",
      color: "bg-accent/10 text-accent-foreground",
      tabCode: "gl_interface",
    },
  ].filter(f => hasTabAccess("payroll", f.tabCode));

  const statItems = [
    { label: t("payroll.stats.currentPeriod"), value: stats.currentPeriod, icon: CalendarCheck },
    { label: t("payroll.stats.totalPayroll"), value: stats.totalPayroll, icon: DollarSign },
    { label: t("payroll.stats.employeesPaid"), value: stats.employeesPaid, icon: Users },
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(feature.href)}
              >
                <CardHeader className="pb-2">
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-base">
                    {feature.title}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
