import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PayrollDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      title: t("payroll.modules.payGroups.title"),
      description: t("payroll.modules.payGroups.description"),
      icon: Users,
      href: "/payroll/pay-groups",
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("payroll.modules.processing.title"),
      description: t("payroll.modules.processing.description"),
      icon: Calculator,
      href: "/payroll/processing",
      color: "bg-success/10 text-success",
    },
    {
      title: t("payroll.modules.payPeriods.title"),
      description: t("payroll.modules.payPeriods.description"),
      icon: CalendarCheck,
      href: "/payroll/pay-periods",
      color: "bg-warning/10 text-warning",
    },
    {
      title: t("payroll.modules.reports.title"),
      description: t("payroll.modules.reports.description"),
      icon: FileSpreadsheet,
      href: "/payroll/reports",
      color: "bg-secondary/10 text-secondary-foreground",
    },
    {
      title: t("payroll.modules.taxConfig.title"),
      description: t("payroll.modules.taxConfig.description"),
      icon: Receipt,
      href: "/payroll/tax-config",
      color: "bg-muted text-muted-foreground",
    },
    {
      title: t("payroll.modules.yearEnd.title"),
      description: t("payroll.modules.yearEnd.description"),
      icon: FileSpreadsheet,
      href: "/payroll/year-end",
      color: "bg-destructive/10 text-destructive",
    },
    {
      title: t("payroll.modules.salaryOvertime.title"),
      description: t("payroll.modules.salaryOvertime.description"),
      icon: Clock,
      href: "/payroll/salary-overtime",
      color: "bg-accent/10 text-accent-foreground",
    },
    {
      title: t("payroll.modules.leavePaymentConfig.title", "Leave Payment Config"),
      description: t("payroll.modules.leavePaymentConfig.description", "Configure leave payment rules and payroll mappings"),
      icon: Settings,
      href: "/payroll/leave-payment-config",
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("payroll.modules.leaveBuyout.title", "Leave Buyout"),
      description: t("payroll.modules.leaveBuyout.description", "Manage leave balance buyout agreements"),
      icon: DollarSign,
      href: "/payroll/leave-buyout",
      color: "bg-success/10 text-success",
    },
  ];

  const stats = [
    { label: t("payroll.stats.currentPeriod"), value: "Dec 2024", icon: CalendarCheck },
    { label: t("payroll.stats.totalPayroll"), value: "$1.2M", icon: DollarSign },
    { label: t("payroll.stats.employeesPaid"), value: "245", icon: Users },
    { label: t("payroll.stats.pendingApprovals"), value: "12", icon: Clock },
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
          {stats.map((stat) => {
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
