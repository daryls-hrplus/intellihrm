import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  BarChart2,
  Network,
  GitBranch,
  Users,
  Target,
  Brain,
  ArrowRight,
  Zap,
} from "lucide-react";

const modules = [
  {
    title: "Workforce Planning",
    description: "Strategic headcount planning, demand forecasting, and succession readiness",
    icon: Users,
    href: "/workforce",
    metrics: [
      { label: "Headcount", value: "1,247" },
      { label: "Open Positions", value: "32" },
    ],
  },
  {
    title: "Workforce Analytics",
    description: "Insights, dashboards, and predictive workforce models",
    icon: BarChart2,
    href: "/workforce-analytics",
    metrics: [
      { label: "Attrition Risk", value: "4.2%" },
      { label: "Engagement", value: "78%" },
    ],
  },
  {
    title: "Organization Design",
    description: "Organizational structure, restructuring scenarios, and what-if analysis",
    icon: Network,
    href: "/org-design",
    metrics: [
      { label: "Departments", value: "24" },
      { label: "Layers", value: "5" },
    ],
  },
  {
    title: "Scenario Planning",
    description: "What-if analysis, budget impact modeling, and timeline projections",
    icon: GitBranch,
    href: "/scenario-planning",
    metrics: [
      { label: "Active Scenarios", value: "3" },
      { label: "Simulations", value: "12" },
    ],
  },
];

const aiInsights = [
  {
    type: "warning",
    title: "Attrition Risk Alert",
    description: "Engineering department shows 15% higher turnover risk than average",
    action: "View Analysis",
  },
  {
    type: "info",
    title: "Skills Gap Identified",
    description: "Cloud architecture skills needed in 6 positions across IT",
    action: "View Details",
  },
  {
    type: "success",
    title: "Succession Ready",
    description: "85% of critical positions have identified successors",
    action: "Review Plans",
  },
];

export default function StrategicPlanningHubPage() {
  const navigate = useNavigate();

  const breadcrumbItems = [{ label: "Strategic Planning" }];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              Strategic Planning
            </h1>
            <p className="text-muted-foreground">
              Forward-looking workforce planning, analytics, and organizational design
            </p>
          </div>
        </div>

        {/* AI Insights */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Real-time strategic recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {aiInsights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === "warning"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : insight.type === "success"
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  <button className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline">
                    {insight.action} <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <Card
              key={module.title}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(module.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="mt-1">{module.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {module.metrics.map((metric, index) => (
                    <div key={index} className="flex-1 p-3 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
                onClick={() => navigate("/workforce")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Target className="h-4 w-4" />
                Plan Headcount
              </button>
              <button
                onClick={() => navigate("/workforce-analytics")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <BarChart2 className="h-4 w-4" />
                View Analytics
              </button>
              <button
                onClick={() => navigate("/scenario-planning")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                Create Scenario
              </button>
              <button
                onClick={() => navigate("/org-design")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                <Network className="h-4 w-4" />
                Design Org
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
