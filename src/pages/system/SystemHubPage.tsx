import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Webhook,
  History,
  Shield,
  Cog,
  Wrench,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Server,
  Database,
  Lock,
} from "lucide-react";

const modules = [
  {
    title: "API Management",
    description: "API keys, webhooks, rate limits, and documentation",
    icon: Webhook,
    href: "/api-management",
    status: "active",
  },
  {
    title: "Audit Logs",
    description: "Activity log, user actions, data changes, and export",
    icon: History,
    href: "/audit-logs",
    status: "active",
  },
  {
    title: "Security Settings",
    description: "Role management, permissions, MFA settings, and session management",
    icon: Shield,
    href: "/security-settings",
    status: "active",
  },
  {
    title: "System Configuration",
    description: "Company settings, localization, branding, and feature flags",
    icon: Cog,
    href: "/system-config",
    status: "active",
  },
  {
    title: "Administration",
    description: "General system administration and maintenance",
    icon: Wrench,
    href: "/admin",
    status: "active",
  },
];

const systemHealth = [
  { name: "Database", status: "healthy", uptime: "99.9%" },
  { name: "API Gateway", status: "healthy", uptime: "99.8%" },
  { name: "Authentication", status: "healthy", uptime: "100%" },
  { name: "File Storage", status: "healthy", uptime: "99.7%" },
];

const recentActivity = [
  { action: "User role updated", user: "admin@company.com", time: "5 min ago", type: "security" },
  { action: "API key created", user: "system", time: "1 hour ago", type: "api" },
  { action: "Bulk data export", user: "hr.manager@company.com", time: "3 hours ago", type: "data" },
  { action: "Password policy updated", user: "admin@company.com", time: "1 day ago", type: "security" },
];

export default function SystemHubPage() {
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "Integration & Administration" }];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Integration & Administration
            </h1>
            <p className="text-muted-foreground">
              API management, system settings, audit logs, and security configuration
            </p>
          </div>
        </div>

        {/* System Health */}
        <Card className="bg-gradient-to-r from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {systemHealth.map((system, index) => (
                <div key={index} className="p-4 rounded-lg bg-background border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {system.name === "Database" && <Database className="h-4 w-4 text-muted-foreground" />}
                      {system.name === "API Gateway" && <Server className="h-4 w-4 text-muted-foreground" />}
                      {system.name === "Authentication" && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {system.name === "File Storage" && <Database className="h-4 w-4 text-muted-foreground" />}
                      <span className="font-medium text-sm">{system.name}</span>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground">Uptime: {system.uptime}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card
              key={module.title}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <module.icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest system and security events</CardDescription>
              </div>
              <button
                onClick={() => navigate("/audit-logs")}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {activity.type === "security" && <Shield className="h-5 w-5 text-yellow-600" />}
                    {activity.type === "api" && <Webhook className="h-5 w-5 text-blue-600" />}
                    {activity.type === "data" && <Database className="h-5 w-5 text-green-600" />}
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/api-management")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Webhook className="h-4 w-4" />
                Manage APIs
              </button>
              <button
                onClick={() => navigate("/audit-logs")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <History className="h-4 w-4" />
                View Logs
              </button>
              <button
                onClick={() => navigate("/security-settings")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Shield className="h-4 w-4" />
                Security
              </button>
              <button
                onClick={() => navigate("/system-config")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Cog className="h-4 w-4" />
                Configuration
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
