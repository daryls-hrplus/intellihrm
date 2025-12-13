import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  ChevronRight,
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
} from "lucide-react";

const compensationModules = [
  { title: "Pay Elements", description: "Manage salary, wages, allowances", href: "/compensation/pay-elements", icon: Coins, color: "bg-primary/10 text-primary" },
  { title: "Salary Grades", description: "Define salary bands and ranges", href: "/compensation/salary-grades", icon: Layers, color: "bg-emerald-500/10 text-emerald-600" },
  { title: "Position Compensation", description: "Configure compensation for positions", href: "/compensation/position-compensation", icon: Wallet, color: "bg-sky-500/10 text-sky-600" },
  { title: "Compensation History", description: "Track salary changes over time", href: "/compensation/history", icon: History, color: "bg-violet-500/10 text-violet-600" },
  { title: "Merit Cycles", description: "Annual merit increase programs", href: "/compensation/merit-cycles", icon: Award, color: "bg-amber-500/10 text-amber-600" },
  { title: "Bonus Management", description: "Manage bonus plans and awards", href: "/compensation/bonus", icon: Gift, color: "bg-rose-500/10 text-rose-600" },
  { title: "Market Benchmarking", description: "Compare to market data", href: "/compensation/market-benchmarking", icon: BarChart3, color: "bg-indigo-500/10 text-indigo-600" },
  { title: "Compa-Ratio Analysis", description: "Pay vs grade midpoint analysis", href: "/compensation/compa-ratio", icon: Target, color: "bg-teal-500/10 text-teal-600" },
  { title: "Pay Equity", description: "Analyze compensation gaps", href: "/compensation/pay-equity", icon: Scale, color: "bg-pink-500/10 text-pink-600" },
  { title: "Total Rewards", description: "Employee compensation statements", href: "/compensation/total-rewards", icon: Receipt, color: "bg-cyan-500/10 text-cyan-600" },
  { title: "Budgets", description: "Track compensation budgets", href: "/compensation/budgets", icon: PiggyBank, color: "bg-orange-500/10 text-orange-600" },
  { title: "Equity Management", description: "Stock options and RSUs", href: "/compensation/equity", icon: Gem, color: "bg-fuchsia-500/10 text-fuchsia-600" },
  { title: "Analytics", description: "Compensation insights and trends", href: "/compensation/analytics", icon: TrendingUp, color: "bg-lime-500/10 text-lime-600" },
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <ModuleBIButton module="compensation" />
              <ModuleReportsButton module="compensation" />
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