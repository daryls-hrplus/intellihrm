import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  FileBarChart,
  Brain,
  Download,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
} from "lucide-react";

const modules = [
  {
    title: "Cross-Module Dashboards",
    description: "Unified dashboards spanning all HR modules",
    icon: LayoutDashboard,
    href: "/dashboards",
    badge: "12 Active",
  },
  {
    title: "Report Builder",
    description: "Custom report creation with templates and scheduling",
    icon: FileBarChart,
    href: "/report-builder",
    badge: "48 Templates",
  },
  {
    title: "AI Insights",
    description: "AI-powered recommendations, anomaly detection, and forecasting",
    icon: Brain,
    href: "/ai-insights",
    badge: "New",
  },
  {
    title: "Data Export",
    description: "Bulk export, scheduled exports, and API data access",
    icon: Download,
    href: "/data-export",
    badge: null,
  },
];

const recentReports = [
  { name: "Monthly Headcount Summary", module: "Workforce", lastRun: "2 hours ago", status: "completed" },
  { name: "Payroll Cost Analysis", module: "Payroll", lastRun: "1 day ago", status: "completed" },
  { name: "Leave Balance Report", module: "Leave", lastRun: "3 days ago", status: "completed" },
  { name: "Training Compliance", module: "Training", lastRun: "1 week ago", status: "scheduled" },
];

const keyMetrics = [
  { label: "Total Employees", value: "1,247", change: "+3.2%", icon: Users },
  { label: "Monthly Payroll", value: "$2.4M", change: "+1.8%", icon: DollarSign },
  { label: "Avg Tenure", value: "4.2 yrs", change: "+0.3", icon: Calendar },
  { label: "Attrition Rate", value: "8.4%", change: "-1.2%", icon: TrendingUp },
];

export default function ReportingHubPage() {
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "Reporting & Analytics" }];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Reporting & Analytics
            </h1>
            <p className="text-muted-foreground">
              Cross-module dashboards, custom reports, and AI-powered insights
            </p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          {keyMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-xs ${metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : ''}`}>
                      {metric.change} vs last month
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <metric.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                  {module.badge && (
                    <Badge variant={module.badge === "New" ? "default" : "secondary"}>
                      {module.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Recent Reports
                </CardTitle>
                <CardDescription>Your recently generated and scheduled reports</CardDescription>
              </div>
              <button
                onClick={() => navigate("/report-builder")}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <FileBarChart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.module}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{report.lastRun}</span>
                    <Badge variant={report.status === "completed" ? "secondary" : "outline"}>
                      {report.status}
                    </Badge>
                  </div>
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
                onClick={() => navigate("/dashboards")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                View Dashboards
              </button>
              <button
                onClick={() => navigate("/report-builder")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <FileBarChart className="h-4 w-4" />
                Create Report
              </button>
              <button
                onClick={() => navigate("/ai-insights")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Brain className="h-4 w-4" />
                AI Analysis
              </button>
              <button
                onClick={() => navigate("/data-export")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
