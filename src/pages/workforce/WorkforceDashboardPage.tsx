import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  UserCheck,
  Network,
  FolderTree,
  ChevronRight,
  Loader2,
  UserPlus,
  Building2,
  TrendingUp,
  UserCog,
  LineChart,
} from "lucide-react";

const workforceModules = [
  {
    title: "Employees",
    description: "View and manage employee records",
    href: "/workforce/employees",
    icon: Users,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Positions",
    description: "Manage job positions and titles",
    href: "/workforce/positions",
    icon: UserCheck,
    color: "bg-info/10 text-info",
  },
  {
    title: "Employee Assignments",
    description: "Manage employee-position relationships",
    href: "/workforce/assignments",
    icon: UserCog,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Org Structure",
    description: "View organizational hierarchy",
    href: "/workforce/org-structure",
    icon: Network,
    color: "bg-success/10 text-success",
  },
  {
    title: "Departments",
    description: "Manage departments and teams",
    href: "/workforce/departments",
    icon: FolderTree,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Org Changes Report",
    description: "Track organizational changes over time",
    href: "/workforce/org-changes",
    icon: TrendingUp,
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    title: "Employee Transactions",
    description: "Manage hires, promotions, transfers, terminations",
    href: "/workforce/transactions",
    icon: UserPlus,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: "Workforce Forecasting",
    description: "Headcount forecasts, scenario planning, and analytics",
    href: "/workforce/forecasting",
    icon: LineChart,
    color: "bg-indigo-500/10 text-indigo-500",
  },
];

interface Stats {
  totalEmployees: number;
  activeCompanies: number;
  newThisMonth: number;
}

export default function WorkforceDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalEmployees: 0, activeCompanies: 0, newThisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [employeesRes, companiesRes, newRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
        ]);
        setStats({
          totalEmployees: employeesRes.count || 0,
          activeCompanies: companiesRes.count || 0,
          newThisMonth: newRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Employees", value: stats.totalEmployees, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Active Companies", value: stats.activeCompanies, icon: Building2, color: "bg-info/10 text-info" },
    { label: "New This Month", value: stats.newThisMonth, icon: UserPlus, color: "bg-success/10 text-success" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Workforce
              </h1>
              <p className="text-muted-foreground">
                Employee and organizational management
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 animate-slide-up">
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
                    <p className="mt-1 text-3xl font-bold text-card-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                    </p>
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
          {workforceModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${(index + 3) * 50}ms` }}
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