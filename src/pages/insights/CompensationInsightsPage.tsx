import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Scale,
  Brain,
  ArrowUpRight,
  RefreshCw,
  Download
} from "lucide-react";

const insights = [
  {
    title: "Pay Equity Analysis",
    description: "3 departments showing gender pay gap above 5% threshold",
    type: "critical",
    impact: "High",
    action: "View Pay Equity Report"
  },
  {
    title: "Market Competitiveness",
    description: "Engineering salaries are 8% below market median",
    type: "warning",
    impact: "High",
    action: "View Market Data"
  },
  {
    title: "Budget Utilization",
    description: "Compensation budget 92% utilized with Q4 merit cycle pending",
    type: "info",
    impact: "Medium",
    action: "View Budget Analysis"
  },
  {
    title: "Compa-Ratio Distribution",
    description: "15% of employees are above 120% compa-ratio",
    type: "warning",
    impact: "Medium",
    action: "View Compa Analysis"
  }
];

const metrics = [
  { label: "Avg Compa-Ratio", value: "98%", change: "+2%", icon: Scale },
  { label: "Market Position", value: "P52", change: "+3", icon: TrendingUp },
  { label: "Pay Equity Score", value: "87", change: "-2", icon: AlertTriangle },
  { label: "Budget Used", value: "$4.2M", change: "92%", icon: DollarSign },
];

export default function CompensationInsightsPage() {
  const breadcrumbItems = [
    { label: "Admin & Insights", href: "/admin" },
    { label: "Compensation Insights" },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={breadcrumbItems} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Compensation Insights</h1>
              <p className="text-muted-foreground">
                Pay equity analysis, market benchmarking, and budget impact modeling
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
                      <p className="text-sm text-amber-600">{metric.change}</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-3">
                      <Icon className="h-5 w-5 text-amber-600" />
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
              <Brain className="h-5 w-5 text-amber-600" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>
              Actionable recommendations based on your compensation data
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
              <CardTitle>Compa-Ratio Distribution</CardTitle>
              <CardDescription>Employee distribution across pay ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Compa-ratio histogram</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Market Benchmark Comparison</CardTitle>
              <CardDescription>Your pay vs market by job family</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">Market comparison chart</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
