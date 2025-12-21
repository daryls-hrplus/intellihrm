import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Send,
  ArrowRight,
} from "lucide-react";

const insights = [
  {
    type: "warning",
    title: "Attrition Risk Detected",
    description: "Engineering department shows 15% higher turnover risk than company average. Key factors: below-market compensation, limited growth opportunities.",
    action: "View Full Analysis",
    module: "Workforce",
  },
  {
    type: "success",
    title: "Training ROI Positive",
    description: "Leadership development program shows 23% improvement in promotion rates for participants vs non-participants.",
    action: "See Details",
    module: "Training",
  },
  {
    type: "info",
    title: "Payroll Anomaly",
    description: "3 employees have overtime exceeding 150% of department average for 3 consecutive months. Review recommended.",
    action: "Review Cases",
    module: "Payroll",
  },
  {
    type: "warning",
    title: "Skills Gap Emerging",
    description: "Cloud architecture skills needed in 12 positions across IT and Engineering. Only 4 employees currently certified.",
    action: "Plan Training",
    module: "Workforce",
  },
];

const forecasts = [
  { metric: "Q1 Attrition", predicted: "6.2%", trend: "down", confidence: 85 },
  { metric: "Hiring Needs", predicted: "47 positions", trend: "up", confidence: 78 },
  { metric: "Training Completion", predicted: "89%", trend: "up", confidence: 92 },
  { metric: "Benefit Costs", predicted: "+4.3%", trend: "up", confidence: 81 },
];

export default function AIInsightsPage() {
  const breadcrumbItems = [
    { label: "Reporting & Analytics", href: "/reporting" },
    { label: "AI Insights" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              AI Insights
            </h1>
            <p className="text-muted-foreground">
              AI-powered recommendations, anomaly detection, and forecasting
            </p>
          </div>
          <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
        </div>

        {/* Natural Language Query */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Ask AI
            </CardTitle>
            <CardDescription>Ask questions about your HR data in natural language</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., What's the attrition trend in Engineering over the last 6 months?"
                className="flex-1"
              />
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Ask
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">Top performers at risk?</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">Training ROI this year?</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">Payroll cost trends?</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Forecasts */}
        <div className="grid gap-4 md:grid-cols-4">
          {forecasts.map((forecast, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{forecast.metric}</span>
                  {forecast.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className="text-2xl font-bold">{forecast.predicted}</p>
                <p className="text-xs text-muted-foreground mt-1">{forecast.confidence}% confidence</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Insights</CardTitle>
            <CardDescription>AI-detected patterns and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === "warning"
                    ? "bg-yellow-500/5 border-yellow-500/30"
                    : insight.type === "success"
                    ? "bg-green-500/5 border-green-500/30"
                    : "bg-blue-500/5 border-blue-500/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {insight.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                    {insight.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />}
                    {insight.type === "info" && <Brain className="h-5 w-5 text-blue-600 mt-0.5" />}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge variant="secondary" className="text-xs">{insight.module}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0">
                    {insight.action}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
