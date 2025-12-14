import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccessRequestsAnalytics } from "@/components/admin/AccessRequestsAnalytics";
import { useTranslation } from "react-i18next";
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
  ShieldAlert,
  Mail,
  MailX,
  AlertTriangle,
  Grid3X3,
  ClipboardList,
  Zap,
  Upload,
  Palette,
  Tag,
  Lock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const getAdminModules = (t: (key: string) => string) => [
  {
    title: t("admin.modules.companyGroups.title"),
    description: t("admin.modules.companyGroups.description"),
    href: "/admin/company-groups",
    icon: Building,
    color: "bg-primary/10 text-primary",
  },
  {
    title: t("admin.modules.companies.title"),
    description: t("admin.modules.companies.description"),
    href: "/admin/companies",
    icon: Building2,
    color: "bg-info/10 text-info",
  },
  {
    title: t("admin.modules.users.title"),
    description: t("admin.modules.users.description"),
    href: "/admin/users",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: t("admin.modules.roles.title"),
    description: t("admin.modules.roles.description"),
    href: "/admin/roles",
    icon: Shield,
    color: "bg-warning/10 text-warning",
  },
  {
    title: t("admin.modules.auditLogs.title"),
    description: t("admin.modules.auditLogs.description"),
    href: "/admin/audit-logs",
    icon: FileText,
    color: "bg-secondary/10 text-secondary-foreground",
  },
  {
    title: t("admin.modules.piiAccess.title"),
    description: t("admin.modules.piiAccess.description"),
    href: "/admin/pii-access",
    icon: Eye,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: t("admin.modules.settings.title"),
    description: t("admin.modules.settings.description"),
    href: "/admin/settings",
    icon: Cog,
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    title: t("admin.modules.permissions.title"),
    description: t("admin.modules.permissions.description"),
    href: "/admin/permissions",
    icon: Grid3X3,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: t("admin.modules.accessRequests.title"),
    description: t("admin.modules.accessRequests.description"),
    href: "/admin/access-requests",
    icon: ClipboardList,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: t("admin.modules.autoApproval.title"),
    description: t("admin.modules.autoApproval.description"),
    href: "/admin/auto-approval",
    icon: Zap,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    title: t("admin.modules.bulkImport.title"),
    description: t("admin.modules.bulkImport.description"),
    href: "/admin/bulk-import",
    icon: Upload,
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Color Scheme",
    description: "Customize the application's color theme with live preview",
    href: "/admin/color-scheme",
    icon: Palette,
    color: "bg-gradient-to-r from-pink-500/10 to-violet-500/10 text-violet-600",
  },
  {
+    title: "Company Tags",
+    description: "Group companies with tags for scoped admin access",
+    href: "/admin/company-tags",
+    icon: Tag,
+    color: "bg-teal-500/10 text-teal-600",
+  },
+  {
+    title: "Granular Permissions",
+    description: "Configure module, tab, and action-level permissions",
+    href: "/admin/granular-permissions",
+    icon: Lock,
+    color: "bg-indigo-500/10 text-indigo-600",
+  },
+  {
    title: t("admin.modules.territories.title"),
    description: t("admin.modules.territories.description"),
    href: "/admin/territories",
    icon: Globe,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: t("admin.modules.languages.title"),
    description: t("admin.modules.languages.description"),
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

interface PiiAlert {
  id: string;
  user_email: string;
  alert_type: string;
  access_count: number;
  email_sent: boolean;
  created_at: string;
}

interface PiiAlertStats {
  total: number;
  emailsSent: number;
  last24Hours: number;
  recentAlerts: PiiAlert[];
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCompanies: 0, totalGroups: 0, admins: 0 });
  const [piiAlertStats, setPiiAlertStats] = useState<PiiAlertStats>({ total: 0, emailsSent: 0, last24Hours: 0, recentAlerts: [] });
  const [isLoading, setIsLoading] = useState(true);

  const adminModules = getAdminModules(t);

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

    const fetchPiiAlerts = async () => {
      try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [totalRes, emailsSentRes, last24HoursRes, recentRes] = await Promise.all([
          supabase.from("pii_access_alerts").select("id", { count: "exact", head: true }),
          supabase.from("pii_access_alerts").select("id", { count: "exact", head: true }).eq("email_sent", true),
          supabase.from("pii_access_alerts").select("id", { count: "exact", head: true }).gte("created_at", yesterday.toISOString()),
          supabase.from("pii_access_alerts").select("*").order("created_at", { ascending: false }).limit(5),
        ]);

        setPiiAlertStats({
          total: totalRes.count || 0,
          emailsSent: emailsSentRes.count || 0,
          last24Hours: last24HoursRes.count || 0,
          recentAlerts: (recentRes.data || []) as PiiAlert[],
        });
      } catch (error) {
        console.error("Error fetching PII alerts:", error);
      }
    };

    fetchStats();
    fetchPiiAlerts();
  }, []);

  const statCards = [
    { label: t("admin.stats.totalUsers"), value: stats.totalUsers, icon: Users, color: "bg-primary/10 text-primary" },
    { label: t("admin.stats.activeCompanies"), value: stats.totalCompanies, icon: Building2, color: "bg-info/10 text-info" },
    { label: t("admin.stats.companyGroups"), value: stats.totalGroups, icon: Building, color: "bg-success/10 text-success" },
    { label: t("admin.stats.admins"), value: stats.admins, icon: Shield, color: "bg-warning/10 text-warning" },
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
                {t("admin.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("admin.description")}
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

        {/* PII Alerts Widget */}
        <Card className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg">PII Security Alerts</CardTitle>
              </div>
              <NavLink
                to="/admin/pii-access"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="h-4 w-4" />
              </NavLink>
            </div>
            <CardDescription>
              Monitor suspicious PII access patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Alert Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-card-foreground">{piiAlertStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Alerts</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-warning">{piiAlertStats.last24Hours}</p>
                <p className="text-xs text-muted-foreground">Last 24 Hours</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-success">{piiAlertStats.emailsSent}</p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>

            {/* Recent Alerts */}
            {piiAlertStats.recentAlerts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Recent Alerts</p>
                {piiAlertStats.recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${alert.alert_type === "TEST_ALERT" ? "bg-info/10" : "bg-destructive/10"}`}>
                        <AlertTriangle className={`h-4 w-4 ${alert.alert_type === "TEST_ALERT" ? "text-info" : "text-destructive"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{alert.user_email}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.access_count} accesses • {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.alert_type === "TEST_ALERT" ? "secondary" : "destructive"} className="text-xs">
                        {alert.alert_type === "TEST_ALERT" ? "Test" : "Alert"}
                      </Badge>
                      {alert.email_sent ? (
                        <Mail className="h-4 w-4 text-success" />
                      ) : (
                        <MailX className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No security alerts yet</p>
                <p className="text-xs">Alerts will appear here when suspicious PII access is detected</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Access Request Analytics */}
        <AccessRequestsAnalytics />

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