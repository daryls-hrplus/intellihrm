import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Users,
  Target,
  Shield,
  Star,
  Activity,
  RefreshCw
} from "lucide-react";
import { IndicatorScoreCard } from "./IndicatorScoreCard";
import { IndicatorAlertsBanner } from "./IndicatorAlertsBanner";
import { 
  useTalentIndicatorDefinitions, 
  useTalentIndicatorScores,
  type IndicatorScore 
} from "@/hooks/useTalentIndicators";

interface HRDashboardRiskSignalsProps {
  companyId: string;
}

const categoryConfig = {
  readiness: { icon: Target, label: "Readiness", color: "text-blue-500" },
  risk: { icon: AlertTriangle, label: "Risk", color: "text-destructive" },
  potential: { icon: Star, label: "Potential", color: "text-warning" },
  engagement: { icon: Activity, label: "Engagement", color: "text-success" },
  performance: { icon: BarChart3, label: "Performance", color: "text-primary" },
};

export function HRDashboardRiskSignals({ companyId }: HRDashboardRiskSignalsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"summary" | "detailed">("summary");
  
  const { data: definitions = [], isLoading: defsLoading } = useTalentIndicatorDefinitions(companyId);
  const { data: scores = [], isLoading: scoresLoading, refetch } = useTalentIndicatorScores(companyId);

  const isLoading = defsLoading || scoresLoading;

  // Group scores by category
  const scoresByCategory = scores.reduce((acc, score) => {
    const category = score.indicator?.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(score);
    return acc;
  }, {} as Record<string, IndicatorScore[]>);

  // Calculate summary stats
  const summaryStats = {
    totalEmployees: new Set(scores.map((s) => s.employee_id)).size,
    criticalAlerts: scores.filter((s) => s.level === "critical").length,
    highRisk: scores.filter((s) => s.indicator?.category === "risk" && s.level === "high").length,
    improving: scores.filter((s) => s.trend === "improving").length,
    declining: scores.filter((s) => s.trend === "declining").length,
  };

  const filteredScores = selectedCategory === "all" 
    ? scores 
    : scores.filter((s) => s.indicator?.category === selectedCategory);

  // Get latest score per employee per indicator
  const latestScores = Object.values(
    filteredScores.reduce((acc, score) => {
      const key = `${score.employee_id}-${score.indicator_id}`;
      if (!acc[key] || new Date(score.computed_at) > new Date(acc[key].computed_at)) {
        acc[key] = score;
      }
      return acc;
    }, {} as Record<string, IndicatorScore>)
  );

  return (
    <div className="space-y-6">
      {/* Alerts Banner */}
      <IndicatorAlertsBanner companyId={companyId} maxItems={3} />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Employees Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={summaryStats.criticalAlerts > 0 ? "border-destructive/30" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${summaryStats.criticalAlerts > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <div>
                <p className="text-2xl font-bold">{summaryStats.criticalAlerts}</p>
                <p className="text-xs text-muted-foreground">Critical Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={summaryStats.highRisk > 0 ? "border-orange-500/30" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${summaryStats.highRisk > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
              <div>
                <p className="text-2xl font-bold">{summaryStats.highRisk}</p>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.improving}</p>
                <p className="text-xs text-muted-foreground">Improving</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.declining}</p>
                <p className="text-xs text-muted-foreground">Declining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Talent Indicators</CardTitle>
              <CardDescription>
                Organization-wide readiness and risk signals from 360 feedback
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className={`h-4 w-4 ${config.color}`} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : latestScores.length === 0 ? (
            <div className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No Indicator Data</p>
              <p className="text-sm text-muted-foreground mt-1">
                Indicator scores will appear here after 360 feedback cycles are processed.
              </p>
            </div>
          ) : (
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "summary" | "detailed")}>
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary View</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {latestScores.slice(0, 20).map((score) => (
                      <IndicatorScoreCard 
                        key={score.id} 
                        score={score} 
                        showEmployee 
                        compact 
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="detailed">
                <ScrollArea className="h-[500px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {latestScores.slice(0, 12).map((score) => (
                      <IndicatorScoreCard 
                        key={score.id} 
                        score={score} 
                        showEmployee 
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
