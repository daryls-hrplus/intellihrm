import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Brain,
  ArrowUpRight,
  RefreshCw,
  Download
} from "lucide-react";

const insights = [
  {
    title: "Skills Gap Analysis",
    description: "12 critical skills gaps identified across engineering and data teams",
    type: "warning",
    impact: "High",
    action: "View Skills Report"
  },
  {
    title: "Succession Readiness",
    description: "78% of key positions have at least one ready-now successor",
    type: "success",
    impact: "Medium",
    action: "View Succession Plans"
  },
  {
    title: "Attrition Risk",
    description: "15 high-performers flagged as flight risk based on engagement scores",
    type: "critical",
    impact: "High",
    action: "View At-Risk Employees"
  },
  {
    title: "Talent Pool Health",
    description: "Leadership pipeline strength increased 12% quarter-over-quarter",
    type: "success",
    impact: "Medium",
    action: "View Talent Pools"
  }
];

const metrics = [
  { label: "High Performers", value: "234", change: "+8%", icon: Users },
  { label: "Succession Coverage", value: "78%", change: "+5%", icon: Target },
  { label: "Skills Gaps", value: "12", change: "-3", icon: AlertTriangle },
  { label: "Flight Risk", value: "15", change: "+2", icon: TrendingUp },
];

export default function TalentInsightsPage() {
  const breadcrumbItems = [
    { label: "Admin & Insights", href: "/admin" },
    { label: "Talent Insights" },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Brain className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Talent Insights</h1>
              <p className="text-muted-foreground">
                AI-powered analysis of skills gaps, succession readiness, and attrition risk
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
                      <p className="text-sm text-emerald-600">{metric.change}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 p-3">
                      <Icon className="h-5 w-5 text-emerald-600" />
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
              <Brain className="h-5 w-5 text-emerald-600" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>
              Actionable recommendations based on your talent data
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
              <CardTitle>Skills Distribution</CardTitle>
              <CardDescription>Current vs required skills across teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Skills gap visualization</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Succession Pipeline</CardTitle>
              <CardDescription>Readiness levels for key positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Succession pipeline chart</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
