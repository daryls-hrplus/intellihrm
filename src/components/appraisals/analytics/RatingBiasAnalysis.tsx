import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  ZAxis,
  Cell
} from "recharts";
import { 
  AlertTriangle, 
  Shield, 
  Scale, 
  TrendingUp, 
  Users, 
  HelpCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface BiasIndicator {
  id: string;
  name: string;
  description: string;
  score: number; // 0-100, higher is better (less bias)
  severity: "low" | "medium" | "high";
  affectedEmployees?: number;
  recommendation?: string;
}

interface ManagerRatingPattern {
  managerId: string;
  managerName: string;
  teamSize: number;
  avgRating: number;
  ratingVariance: number;
  centralTendencyScore: number;
  leniencyScore: number;
}

interface RatingBiasAnalysisProps {
  companyId: string;
  cycleId?: string;
}

// Mock data
const generateBiasIndicators = (): BiasIndicator[] => [
  {
    id: "central_tendency",
    name: "Central Tendency Bias",
    description: "Managers rating everyone near the middle of the scale",
    score: 72,
    severity: "medium",
    affectedEmployees: 45,
    recommendation: "Encourage managers to differentiate ratings based on actual performance",
  },
  {
    id: "leniency",
    name: "Leniency Bias",
    description: "Systematic inflation of ratings above true performance",
    score: 85,
    severity: "low",
    affectedEmployees: 18,
    recommendation: "Calibration sessions help normalize rating expectations",
  },
  {
    id: "recency",
    name: "Recency Bias",
    description: "Recent events disproportionately influencing annual ratings",
    score: 68,
    severity: "medium",
    affectedEmployees: 62,
    recommendation: "Implement continuous feedback to capture year-round performance",
  },
  {
    id: "halo",
    name: "Halo Effect",
    description: "One positive trait influencing overall perception",
    score: 78,
    severity: "low",
    affectedEmployees: 28,
    recommendation: "Use behavioral anchors and specific competency ratings",
  },
  {
    id: "similar_to_me",
    name: "Similar-to-Me Bias",
    description: "Higher ratings for employees similar to the manager",
    score: 55,
    severity: "high",
    affectedEmployees: 95,
    recommendation: "Implement blind calibration and diverse review panels",
  },
];

const generateManagerPatterns = (): ManagerRatingPattern[] => [
  { managerId: "1", managerName: "Sarah Johnson", teamSize: 12, avgRating: 3.8, ratingVariance: 0.6, centralTendencyScore: 75, leniencyScore: 82 },
  { managerId: "2", managerName: "Michael Chen", teamSize: 8, avgRating: 4.2, ratingVariance: 0.3, centralTendencyScore: 45, leniencyScore: 35 },
  { managerId: "3", managerName: "Emily Davis", teamSize: 15, avgRating: 3.5, ratingVariance: 0.8, centralTendencyScore: 85, leniencyScore: 70 },
  { managerId: "4", managerName: "James Wilson", teamSize: 10, avgRating: 3.2, ratingVariance: 1.1, centralTendencyScore: 90, leniencyScore: 88 },
  { managerId: "5", managerName: "Lisa Anderson", teamSize: 6, avgRating: 4.5, ratingVariance: 0.2, centralTendencyScore: 20, leniencyScore: 25 },
  { managerId: "6", managerName: "Robert Taylor", teamSize: 9, avgRating: 3.6, ratingVariance: 0.7, centralTendencyScore: 72, leniencyScore: 68 },
];

export function RatingBiasAnalysis({ companyId, cycleId }: RatingBiasAnalysisProps) {
  const biasIndicators = generateBiasIndicators();
  const managerPatterns = generateManagerPatterns();

  const overallBiasScore = useMemo(() => {
    return Math.round(biasIndicators.reduce((sum, b) => sum + b.score, 0) / biasIndicators.length);
  }, [biasIndicators]);

  const highSeverityCount = biasIndicators.filter(b => b.severity === "high").length;

  const scatterData = managerPatterns.map(m => ({
    x: m.avgRating,
    y: m.ratingVariance,
    z: m.teamSize,
    name: m.managerName,
    centralTendency: m.centralTendencyScore,
    leniency: m.leniencyScore,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getSeverityBadge = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">High Risk</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Rating Bias Analysis
              </CardTitle>
              <CardDescription>
                AI-powered detection of systematic rating biases
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(overallBiasScore)}`}>
                {overallBiasScore}
              </div>
              <div className="text-xs text-muted-foreground">Fairness Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {highSeverityCount > 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                {highSeverityCount} high-severity bias indicator{highSeverityCount > 1 ? 's' : ''} detected. 
                Review the recommendations below to improve rating fairness.
              </AlertDescription>
            </Alert>
          )}

          {/* Bias Indicators */}
          <div className="space-y-4">
            {biasIndicators.map((indicator) => (
              <div key={indicator.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {indicator.severity === "high" ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : indicator.severity === "medium" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <div className="font-medium">{indicator.name}</div>
                      <div className="text-xs text-muted-foreground">{indicator.description}</div>
                    </div>
                  </div>
                  {getSeverityBadge(indicator.severity)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fairness Score</span>
                    <span className={`font-medium ${getScoreColor(indicator.score)}`}>
                      {indicator.score}/100
                    </span>
                  </div>
                  <Progress 
                    value={indicator.score} 
                    className="h-2"
                  />
                  {indicator.affectedEmployees && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {indicator.affectedEmployees} employees potentially affected
                    </div>
                  )}
                </div>

                {indicator.recommendation && (
                  <div className="mt-3 p-2 rounded bg-muted/50 text-xs">
                    <span className="font-medium">Recommendation: </span>
                    {indicator.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manager Rating Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Manager Rating Patterns
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    This chart shows each manager's average rating vs their rating variance. 
                    Managers with high average and low variance may exhibit leniency bias. 
                    Managers clustered around 3.0 with low variance may show central tendency bias.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <CardDescription>
            Identify managers with potential rating biases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Average Rating" 
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  label={{ value: 'Average Rating', position: 'bottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Rating Variance"
                  domain={[0, 'auto']}
                  label={{ value: 'Rating Variance', angle: -90, position: 'left' }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 400]} />
                <RechartsTooltip
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 bg-card border rounded-lg shadow-lg">
                        <div className="font-medium">{data.name}</div>
                        <div className="text-sm space-y-1 mt-1">
                          <div>Team Size: {data.z}</div>
                          <div>Avg Rating: {data.x.toFixed(2)}</div>
                          <div>Variance: {data.y.toFixed(2)}</div>
                          <div className={data.centralTendency < 50 ? "text-red-600" : "text-green-600"}>
                            Central Tendency: {data.centralTendency}%
                          </div>
                          <div className={data.leniency < 50 ? "text-red-600" : "text-green-600"}>
                            Leniency Score: {data.leniency}%
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => {
                    const isHighRisk = entry.centralTendency < 50 || entry.leniency < 50;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isHighRisk ? "hsl(0, 84%, 60%)" : "hsl(var(--primary))"}
                        opacity={0.8}
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Manager Table */}
          <div className="mt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Manager</th>
                  <th className="text-center py-2 font-medium">Team</th>
                  <th className="text-center py-2 font-medium">Avg Rating</th>
                  <th className="text-center py-2 font-medium">Variance</th>
                  <th className="text-center py-2 font-medium">Central Tendency</th>
                  <th className="text-center py-2 font-medium">Leniency</th>
                </tr>
              </thead>
              <tbody>
                {managerPatterns.map((manager) => {
                  const hasIssue = manager.centralTendencyScore < 50 || manager.leniencyScore < 50;
                  return (
                    <tr key={manager.managerId} className={`border-b last:border-0 ${hasIssue ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
                      <td className="py-3 font-medium">{manager.managerName}</td>
                      <td className="py-3 text-center text-muted-foreground">{manager.teamSize}</td>
                      <td className="py-3 text-center">{manager.avgRating.toFixed(2)}</td>
                      <td className="py-3 text-center">{manager.ratingVariance.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <Badge 
                          variant="outline" 
                          className={manager.centralTendencyScore >= 60 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
                        >
                          {manager.centralTendencyScore}%
                        </Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge 
                          variant="outline" 
                          className={manager.leniencyScore >= 60 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
                        >
                          {manager.leniencyScore}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
