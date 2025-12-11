import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Building,
  Building2,
  Users,
  Shield,
  Globe,
  Languages,
  Settings,
  ChevronRight,
  Loader2,
  FileText,
  Eye,
  Cog,
} from "lucide-react";

const adminModules = [
  {
    title: "Company Groups",
    description: "Manage company groups and divisions",
    href: "/admin/company-groups",
    icon: Building,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Companies",
    description: "Manage organizations in the system",
    href: "/admin/companies",
    icon: Building2,
    color: "bg-info/10 text-info",
  },
  {
    title: "Users",
    description: "Manage user accounts and access",
    href: "/admin/users",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: "Roles & Permissions",
    description: "Configure role-based access control",
    href: "/admin/roles",
    icon: Shield,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Audit Logs",
    description: "Track all user actions and changes",
    href: "/admin/audit-logs",
    icon: FileText,
    color: "bg-secondary/10 text-secondary-foreground",
  },
  {
    title: "PII Access Report",
    description: "Monitor GDPR compliance and PII access",
    href: "/admin/pii-access",
    icon: Eye,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "System Settings",
    description: "Configure email alerts and thresholds",
    href: "/admin/settings",
    icon: Cog,
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    title: "Territories",
    description: "Manage geographic regions",
    href: "/admin/territories",
    icon: Globe,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: "Languages",
    description: "Configure system languages",
    href: "/admin/languages",
    icon: Languages,
    color: "bg-accent/10 text-accent-foreground",
  },
];

interface Stats {
  totalUsers: number;
  totalCompanies: number;
  totalGroups: number;
  admins: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCompanies: 0, totalGroups: 0, admins: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, companiesRes, groupsRes, adminsRes] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("companies").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("company_groups").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin"),
        ]);
        setStats({
          totalUsers: usersRes.count || 0,
          totalCompanies: companiesRes.count || 0,
          totalGroups: groupsRes.count || 0,
          admins: adminsRes.count || 0,
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
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "Active Companies", value: stats.totalCompanies, icon: Building2, color: "bg-info/10 text-info" },
    { label: "Company Groups", value: stats.totalGroups, icon: Building, color: "bg-success/10 text-success" },
    { label: "Admins", value: stats.admins, icon: Shield, color: "bg-warning/10 text-warning" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Admin & Security
              </h1>
              <p className="text-muted-foreground">
                System administration and security settings
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
          {adminModules.map((module, index) => {
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