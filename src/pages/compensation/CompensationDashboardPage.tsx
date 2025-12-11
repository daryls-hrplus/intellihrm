import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  FileText,
  Calculator,
  ChevronRight,
  Users,
  Clock,
} from "lucide-react";

const compensationModules = [
  {
    title: "Salary Structure",
    description: "Manage pay grades and salary bands",
    href: "/compensation/salary-structure",
    icon: Wallet,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Salary Reviews",
    description: "Annual and periodic salary reviews",
    href: "/compensation/reviews",
    icon: TrendingUp,
    color: "bg-success/10 text-success",
  },
  {
    title: "Payroll",
    description: "Payroll processing and management",
    href: "/compensation/payroll",
    icon: Calculator,
    color: "bg-info/10 text-info",
  },
  {
    title: "Compensation Reports",
    description: "Analytics and compensation reports",
    href: "/compensation/reports",
    icon: FileText,
    color: "bg-warning/10 text-warning",
  },
];

const statCards = [
  { label: "Total Payroll", value: "$1.2M", icon: DollarSign, color: "bg-primary/10 text-primary" },
  { label: "Employees Paid", value: 156, icon: Users, color: "bg-success/10 text-success" },
  { label: "Pending Reviews", value: 12, icon: Clock, color: "bg-warning/10 text-warning" },
  { label: "Avg. Salary", value: "$72K", icon: TrendingUp, color: "bg-info/10 text-info" },
];

export default function CompensationDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Compensation
              </h1>
              <p className="text-muted-foreground">
                Salary management and payroll
              </p>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {compensationModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 font-semibold text-card-foreground">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}