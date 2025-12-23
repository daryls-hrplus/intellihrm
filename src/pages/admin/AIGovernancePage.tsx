import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIGovernance } from "@/hooks/useAIGovernance";
import { AIHumanReviewQueue } from "@/components/ai/AIHumanReviewQueue";
import { BiasIncidentPanel } from "@/components/ai/BiasIncidentPanel";
import { AIModelRegistryPanel } from "@/components/ai/AIModelRegistryPanel";
import { AIGuardrailsConfigPanel } from "@/components/ai/AIGuardrailsConfigPanel";
import { AIExplainabilityPanel } from "@/components/ai/AIExplainabilityPanel";
import {
  Shield, 
  AlertTriangle, 
  Users, 
  Bot, 
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { format, subDays } from "date-fns";

const RISK_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444"];

export default function AIGovernancePage() {
  const { 
    riskAssessments, 
    biasIncidents, 
    humanOverrides, 
    modelRegistry,
    summary,
    isLoading 
  } = useAIGovernance();

  // Generate risk distribution data
  const riskDistribution = [
    { name: "Low (0-40%)", value: riskAssessments.filter(r => (r.risk_score || 0) < 0.4).length },
    { name: "Medium (40-60%)", value: riskAssessments.filter(r => (r.risk_score || 0) >= 0.4 && (r.risk_score || 0) < 0.6).length },
    { name: "High (60-80%)", value: riskAssessments.filter(r => (r.risk_score || 0) >= 0.6 && (r.risk_score || 0) < 0.8).length },
    { name: "Critical (80%+)", value: riskAssessments.filter(r => (r.risk_score || 0) >= 0.8).length },
  ];

  // Generate trend data (last 7 days)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayAssessments = riskAssessments.filter(r => 
      r.created_at && r.created_at.startsWith(dateStr)
    );
    return {
      date: format(date, "MMM d"),
      interactions: dayAssessments.length,
      highRisk: dayAssessments.filter(r => (r.risk_score || 0) >= 0.6).length,
      avgRisk: dayAssessments.length > 0 
        ? Math.round(dayAssessments.reduce((sum, r) => sum + (r.risk_score || 0), 0) / dayAssessments.length * 100)
        : 0,
    };
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            AI Governance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            ISO 42001 Compliant AI Risk Management & Human Oversight
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalInteractions}</div>
              <p className="text-xs text-muted-foreground">
                AI interactions analyzed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Eye className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{summary.pendingReviewsCount}</div>
              <p className="text-xs text-muted-foreground">
                Requiring human oversight
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Bias Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{summary.openBiasIncidents}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting investigation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Model Compliance</CardTitle>
              <Bot className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {summary.compliantModels}/{summary.totalModels}
              </div>
              <p className="text-xs text-muted-foreground">
                Models ISO 42001 compliant
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Trend (7 Days)
              </CardTitle>
              <CardDescription>
                Daily AI interactions and risk levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="interactions" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorInteractions)" 
                      name="Total Interactions"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="highRisk" 
                      stroke="#ef4444" 
                      fillOpacity={1} 
                      fill="url(#colorHighRisk)" 
                      name="High Risk"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution Pie */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Risk Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of AI risk assessments by level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RISK_COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="bias" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Bias
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="overrides" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Overrides
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Config
            </TabsTrigger>
            <TabsTrigger value="explainability" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Explain
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <AIHumanReviewQueue />
          </TabsContent>

          <TabsContent value="bias">
            <BiasIncidentPanel />
          </TabsContent>

          <TabsContent value="models">
            <AIModelRegistryPanel />
          </TabsContent>

          <TabsContent value="overrides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Human Override History
                </CardTitle>
                <CardDescription>
                  Record of human modifications to AI outputs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {humanOverrides.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No overrides recorded</p>
                    <p className="text-sm">AI outputs have been accepted without modification</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {humanOverrides.map((override) => (
                      <div
                        key={override.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={
                            override.override_action === 'approved' ? 'default' :
                            override.override_action === 'rejected' ? 'destructive' :
                            'secondary'
                          }>
                            {override.override_action}
                          </Badge>
                          {override.justification_category && (
                            <Badge variant="outline">
                              {override.justification_category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{override.override_reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {override.created_at && format(new Date(override.created_at), "PPpp")}
                        </p>
                      </div>
                    ))}
              </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config">
            <AIGuardrailsConfigPanel />
          </TabsContent>

          <TabsContent value="explainability">
            <AIExplainabilityPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
