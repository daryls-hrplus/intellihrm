import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    title: "Payroll Processing",
    description: "Run payroll calculations and generate pay slips",
    icon: Calculator,
    href: "/payroll/processing",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Pay Periods",
    description: "Configure pay periods and schedules",
    icon: CalendarCheck,
    href: "/payroll/periods",
    color: "bg-success/10 text-success",
  },
  {
    title: "Payroll Reports",
    description: "Generate payroll summaries and reports",
    icon: FileSpreadsheet,
    href: "/payroll/reports",
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Tax Configuration",
    description: "Manage tax brackets and deductions",
    icon: Receipt,
    href: "/payroll/tax",
    color: "bg-secondary/10 text-secondary-foreground",
  },
];

const stats = [
  { label: "Current Period", value: "Dec 2024", icon: CalendarCheck },
  { label: "Total Payroll", value: "$1.2M", icon: DollarSign },
  { label: "Employees Paid", value: "245", icon: Users },
  { label: "Pending Approvals", value: "12", icon: Clock },
];

export default function PayrollDashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Payroll" }]} />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payroll Management
            </h1>
            <p className="text-muted-foreground">
              Process payroll, manage deductions, and generate reports
            </p>
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
              Recent Payroll Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              No recent payroll activity. Start by configuring pay periods.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
