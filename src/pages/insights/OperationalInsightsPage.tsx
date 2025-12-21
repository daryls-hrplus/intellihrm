import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Brain,
  ArrowUpRight,
  RefreshCw,
  Download,
  Users
} from "lucide-react";

const insights = [
  {
    title: "Overtime Trend Alert",
    description: "Operations team overtime increased 23% this month - review staffing levels",
    type: "warning",
    impact: "High",
    action: "View Overtime Report"
  },
  {
    title: "Attendance Patterns",
    description: "Monday absences 40% higher than average - consider flexible scheduling",
    type: "info",
    impact: "Medium",
    action: "View Attendance Data"
  },
  {
    title: "Productivity Insights",
    description: "Remote workers showing 12% higher productivity scores",
    type: "success",
    impact: "Medium",
    action: "View Productivity Report"
  },
  {
    title: "Time-to-Fill Impact",
    description: "Extended vacancies in customer service affecting SLA metrics",
    type: "critical",
    impact: "High",
    action: "View Recruitment Status"
  }
];

const metrics = [
  { label: "Attendance Rate", value: "94.2%", change: "+1.2%", icon: Users },
  { label: "Avg Hours/Week", value: "41.3", change: "+2.1", icon: Clock },
  { label: "Productivity Index", value: "87", change: "+5", icon: Activity },
  { label: "Overtime Hours", value: "2,340", change: "+23%", icon: TrendingUp },
];

export default function OperationalInsightsPage() {
  const breadcrumbItems = [
    { label: "Admin & Insights", href: "/admin" },
    { label: "Operational Insights" },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
              <Activity className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Operational Insights</h1>
              <p className="text-muted-foreground">
                Attendance patterns, productivity metrics, and operational efficiency analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                      <p className="mt-1 text-3xl font-bold">{metric.value}</p>
                      <p className="text-sm text-indigo-600">{metric.change}</p>
                    </div>
                    <div className="rounded-lg bg-indigo-500/10 p-3">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>
              Actionable recommendations based on your operational data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.type === "critical"
                            ? "destructive"
                            : insight.type === "warning"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {insight.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    {insight.action}
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>Daily attendance patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Attendance trend chart</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overtime by Department</CardTitle>
              <CardDescription>Overtime hours distribution across teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Overtime distribution chart</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
