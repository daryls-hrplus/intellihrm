import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Loader2,
  Play,
  ShieldAlert,
  Flame,
  Snowflake,
  Users,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  MinusCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine
} from "recharts";
import { ScenarioParameters } from "./ScenarioPlanning";

interface StressTestProps {
  scenarios: ScenarioParameters[];
  currentHeadcount: number;
}

interface StressCondition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  modifiers: {
    growthRateMultiplier: number;
    attritionRateMultiplier: number;
    budgetMultiplier: number;
    hiringEfficiencyMultiplier: number;
  };
  severity: "moderate" | "severe" | "extreme";
}

interface StressTestResult {
  scenarioId: string;
  scenarioName: string;
  baselineOutcome: number;
  stressResults: {
    conditionId: string;
    conditionName: string;
    outcome: number;
    change: number;
    changePercent: number;
    survivalRate: number;
  }[];
  resilienceScore: number;
  worstCase: string;
  bestCase: string;
}

const SIMULATION_RUNS = 300;

const stressConditions: StressCondition[] = [
  {
    id: "recession",
    name: "Recession",
    description: "Economic downturn with budget cuts and hiring freezes",
    icon: <TrendingDown className="h-5 w-5" />,
    color: "text-blue-500",
    modifiers: {
      growthRateMultiplier: 0.2,
      attritionRateMultiplier: 1.3,
      budgetMultiplier: 0.3,
      hiringEfficiencyMultiplier: 0.7,
    },
    severity: "severe",
  },
  {
    id: "rapid-growth",
    name: "Rapid Growth",
    description: "Aggressive expansion with high hiring demands",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "text-green-500",
    modifiers: {
      growthRateMultiplier: 2.0,
      attritionRateMultiplier: 1.1,
      budgetMultiplier: 1.5,
      hiringEfficiencyMultiplier: 0.85,
    },
    severity: "moderate",
  },
  {
    id: "high-turnover",
    name: "High Turnover Crisis",
    description: "Elevated attrition due to competitive market or culture issues",
    icon: <Users className="h-5 w-5" />,
    color: "text-orange-500",
    modifiers: {
      growthRateMultiplier: 0.8,
      attritionRateMultiplier: 2.0,
      budgetMultiplier: 1.0,
      hiringEfficiencyMultiplier: 0.9,
    },
    severity: "severe",
  },
  {
    id: "budget-crisis",
    name: "Budget Crisis",
    description: "Severe budget constraints with minimal hiring capacity",
    icon: <DollarSign className="h-5 w-5" />,
    color: "text-red-500",
    modifiers: {
      growthRateMultiplier: 0.5,
      attritionRateMultiplier: 1.2,
      budgetMultiplier: 0.2,
      hiringEfficiencyMultiplier: 0.8,
    },
    severity: "extreme",
  },
  {
    id: "talent-war",
    name: "Talent War",
    description: "Competitive market making hiring difficult and retention challenging",
    icon: <Flame className="h-5 w-5" />,
    color: "text-purple-500",
    modifiers: {
      growthRateMultiplier: 0.9,
      attritionRateMultiplier: 1.5,
      budgetMultiplier: 1.2,
      hiringEfficiencyMultiplier: 0.6,
    },
    severity: "moderate",
  },
  {
    id: "market-freeze",
    name: "Market Freeze",
    description: "Complete hiring freeze with focus on retention only",
    icon: <Snowflake className="h-5 w-5" />,
    color: "text-cyan-500",
    modifiers: {
      growthRateMultiplier: 0,
      attritionRateMultiplier: 1.1,
      budgetMultiplier: 0,
      hiringEfficiencyMultiplier: 0,
    },
    severity: "extreme",
  },
];

export function StressTestAnalysis({ scenarios, currentHeadcount }: StressTestProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<StressTestResult[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    stressConditions.map(c => c.id)
  );
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const toggleCondition = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const runSimulation = (
    scenario: ScenarioParameters,
    condition: StressCondition | null
  ): number => {
    const runs: number[] = [];

    for (let run = 0; run < SIMULATION_RUNS; run++) {
      let headcount = currentHeadcount;
      const variance = 0.15;

      // Apply stress modifiers
      const modifiers = condition?.modifiers || {
        growthRateMultiplier: 1,
        attritionRateMultiplier: 1,
        budgetMultiplier: 1,
        hiringEfficiencyMultiplier: 1,
      };

      const growthRate = scenario.growthRate * modifiers.growthRateMultiplier * (1 + (Math.random() - 0.5) * variance);
      const attritionRate = scenario.attritionRate * modifiers.attritionRateMultiplier * (1 + (Math.random() - 0.5) * variance);
      const budgetConstraint = Math.max(0, Math.round(scenario.budgetConstraint * modifiers.budgetMultiplier * (1 + (Math.random() - 0.5) * variance * 0.5)));
      const hiringEfficiency = modifiers.hiringEfficiencyMultiplier;

      const monthlyGrowthRate = growthRate / 100 / 12;
      const monthlyAttritionRate = attritionRate / 100 / 12;
      const maxHiresPerMonth = Math.ceil(budgetConstraint / 3);

      for (let month = 0; month < scenario.timeHorizon; month++) {
        const monthVariance = 1 + (Math.random() - 0.5) * 0.1;
        
        let attrition = Math.round(headcount * monthlyAttritionRate * monthVariance);
        
        if (scenario.seasonalAdjustment) {
          const monthIndex = (new Date().getMonth() + month + 1) % 12;
          if (monthIndex >= 0 && monthIndex <= 2) attrition = Math.round(attrition * 1.25);
          if (monthIndex === 8 || monthIndex === 9) attrition = Math.round(attrition * 1.15);
        }

        let targetHires = Math.round(headcount * monthlyGrowthRate * monthVariance) + attrition;
        
        if (scenario.aggressiveHiring) {
          targetHires = Math.round(targetHires * 1.25);
        }

        // Apply hiring efficiency (some hires may fall through)
        const effectiveHires = Math.min(
          Math.round(targetHires * hiringEfficiency),
          maxHiresPerMonth
        );
        
        headcount = Math.max(0, headcount - attrition + effectiveHires);
      }

      runs.push(headcount);
    }

    return Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);
  };

  const runStressTests = async () => {
    if (scenarios.length === 0 || selectedConditions.length === 0) return;
    
    setIsRunning(true);
    await new Promise(resolve => setTimeout(resolve, 50));

    const testResults: StressTestResult[] = [];

    for (const scenario of scenarios) {
      // Run baseline simulation
      const baselineOutcome = runSimulation(scenario, null);
      
      // Run stress condition simulations
      const stressResults = selectedConditions.map(conditionId => {
        const condition = stressConditions.find(c => c.id === conditionId)!;
        const outcome = runSimulation(scenario, condition);
        const change = outcome - baselineOutcome;
        const changePercent = (change / baselineOutcome) * 100;
        
        // Calculate survival rate (percentage of baseline maintained)
        const survivalRate = Math.max(0, Math.min(100, (outcome / baselineOutcome) * 100));

        return {
          conditionId,
          conditionName: condition.name,
          outcome,
          change,
          changePercent,
          survivalRate,
        };
      });

      // Calculate resilience score (average survival rate)
      const resilienceScore = stressResults.reduce((sum, r) => sum + r.survivalRate, 0) / stressResults.length;
      
      // Find worst and best cases
      const sortedResults = [...stressResults].sort((a, b) => a.outcome - b.outcome);
      const worstCase = sortedResults[0]?.conditionName || "";
      const bestCase = sortedResults[sortedResults.length - 1]?.conditionName || "";

      testResults.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        baselineOutcome,
        stressResults,
        resilienceScore,
        worstCase,
        bestCase,
      });
    }

    setResults(testResults);
    setSelectedScenario(testResults[0]?.scenarioId || null);
    setIsRunning(false);
  };

  const selectedResult = results.find(r => r.scenarioId === selectedScenario);

  // Prepare comparison chart data
  const comparisonData = selectedResult ? [
    { name: "Baseline", value: selectedResult.baselineOutcome, fill: "hsl(var(--primary))" },
    ...selectedResult.stressResults.map(r => ({
      name: r.conditionName,
      value: r.outcome,
      fill: r.outcome >= selectedResult.baselineOutcome ? "hsl(var(--success))" : "hsl(var(--destructive))",
    }))
  ] : [];

  // Prepare radar chart data for resilience
  const radarData = selectedResult?.stressResults.map(r => ({
    condition: r.conditionName,
    survival: r.survivalRate,
    fullMark: 100,
  })) || [];

  const getResilienceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", color: "text-success", badge: "default" };
    if (score >= 75) return { level: "Good", color: "text-primary", badge: "secondary" };
    if (score >= 60) return { level: "Moderate", color: "text-warning", badge: "secondary" };
    return { level: "Vulnerable", color: "text-destructive", badge: "destructive" };
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "moderate": return "secondary";
      case "severe": return "default";
      case "extreme": return "destructive";
      default: return "secondary";
    }
  };

  const scenarioColors = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
  ];

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Stress Test Analysis
          </CardTitle>
          <CardDescription>
            Create scenarios first to run stress tests
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Stress Test Analysis
          </CardTitle>
          <CardDescription>
            Test scenario resilience against extreme market conditions and economic shocks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stress Conditions Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Stress Conditions to Test</Label>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stressConditions.map(condition => (
                <div 
                  key={condition.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedConditions.includes(condition.id) 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleCondition(condition.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={condition.color}>{condition.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{condition.name}</p>
                        <p className="text-xs text-muted-foreground">{condition.description}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={selectedConditions.includes(condition.id)}
                      onCheckedChange={() => toggleCondition(condition.id)}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={getSeverityBadge(condition.severity) as any} className="text-xs">
                      {condition.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={runStressTests} 
            disabled={isRunning || selectedConditions.length === 0}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Stress Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Stress Tests ({selectedConditions.length} conditions)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Scenario Selector */}
          <div className="flex flex-wrap gap-2">
            {results.map((r, i) => (
              <Button
                key={r.scenarioId}
                variant={selectedScenario === r.scenarioId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedScenario(r.scenarioId)}
                style={{ 
                  borderColor: selectedScenario === r.scenarioId ? undefined : scenarioColors[i % scenarioColors.length],
                  color: selectedScenario !== r.scenarioId ? scenarioColors[i % scenarioColors.length] : undefined
                }}
              >
                {r.scenarioName}
              </Button>
            ))}
          </div>

          {selectedResult && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Baseline Forecast</p>
                        <p className="text-2xl font-bold">{selectedResult.baselineOutcome}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Expected headcount under normal conditions
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Resilience Score</p>
                        <p className="text-2xl font-bold">{selectedResult.resilienceScore.toFixed(0)}%</p>
                      </div>
                      <ShieldAlert className={`h-8 w-8 ${getResilienceLevel(selectedResult.resilienceScore).color}`} />
                    </div>
                    <Badge 
                      variant={getResilienceLevel(selectedResult.resilienceScore).badge as any} 
                      className="mt-2"
                    >
                      {getResilienceLevel(selectedResult.resilienceScore).level}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Worst Case</p>
                        <p className="text-lg font-bold text-destructive">{selectedResult.worstCase}</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedResult.stressResults.find(r => r.conditionName === selectedResult.worstCase)?.outcome} employees
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Best Case</p>
                        <p className="text-lg font-bold text-success">{selectedResult.bestCase}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedResult.stressResults.find(r => r.conditionName === selectedResult.bestCase)?.outcome} employees
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Stress Test Results Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stress Test Results</CardTitle>
                  <CardDescription>
                    Headcount outcomes under each stress condition compared to baseline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedResult.stressResults.map(r => {
                      const condition = stressConditions.find(c => c.id === r.conditionId);
                      const isPositive = r.change >= 0;
                      
                      return (
                        <div 
                          key={r.conditionId}
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className={condition?.color}>{condition?.icon}</span>
                              <div>
                                <p className="font-medium">{r.conditionName}</p>
                                <p className="text-xs text-muted-foreground">{condition?.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold">{r.outcome}</p>
                              <p className={`text-sm font-medium ${isPositive ? "text-success" : "text-destructive"}`}>
                                {isPositive ? "+" : ""}{r.change} ({r.changePercent.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Survival Rate</span>
                                <span>{r.survivalRate.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${
                                    r.survivalRate >= 90 ? "bg-success" :
                                    r.survivalRate >= 75 ? "bg-primary" :
                                    r.survivalRate >= 60 ? "bg-warning" : "bg-destructive"
                                  }`}
                                  style={{ width: `${r.survivalRate}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {r.survivalRate >= 90 ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                              ) : r.survivalRate >= 60 ? (
                                <MinusCircle className="h-5 w-5 text-warning" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Comparison Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Headcount Comparison</CardTitle>
                    <CardDescription>
                      Baseline vs stressed outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData} layout="vertical" margin={{ left: 100 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" className="text-xs" />
                          <YAxis type="category" dataKey="name" className="text-xs" width={90} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`${value} employees`, "Headcount"]}
                          />
                          <ReferenceLine x={selectedResult.baselineOutcome} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {comparisonData.map((entry, index) => (
                              <rect key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Resilience Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resilience Profile</CardTitle>
                    <CardDescription>
                      Survival rate across different stress conditions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid className="stroke-muted" />
                          <PolarAngleAxis dataKey="condition" className="text-xs" />
                          <PolarRadiusAxis angle={90} domain={[0, 100]} className="text-xs" />
                          <Radar
                            name="Survival Rate"
                            dataKey="survival"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`${value.toFixed(0)}%`, "Survival Rate"]}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cross-Scenario Comparison */}
              {results.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scenario Resilience Comparison</CardTitle>
                    <CardDescription>
                      Compare how different scenarios perform under stress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">Scenario</th>
                            <th className="text-right py-2 font-medium">Baseline</th>
                            <th className="text-right py-2 font-medium">Worst Case</th>
                            <th className="text-right py-2 font-medium">Best Case</th>
                            <th className="text-right py-2 font-medium">Resilience</th>
                            <th className="text-center py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r, i) => {
                            const resilience = getResilienceLevel(r.resilienceScore);
                            const worstOutcome = Math.min(...r.stressResults.map(s => s.outcome));
                            const bestOutcome = Math.max(...r.stressResults.map(s => s.outcome));
                            
                            return (
                              <tr 
                                key={r.scenarioId} 
                                className={`border-b cursor-pointer hover:bg-muted/50 ${
                                  selectedScenario === r.scenarioId ? "bg-muted/30" : ""
                                }`}
                                onClick={() => setSelectedScenario(r.scenarioId)}
                              >
                                <td className="py-2">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: scenarioColors[i % scenarioColors.length] }}
                                    />
                                    <span className="font-medium">{r.scenarioName}</span>
                                  </div>
                                </td>
                                <td className="py-2 text-right">{r.baselineOutcome}</td>
                                <td className="py-2 text-right text-destructive">{worstOutcome}</td>
                                <td className="py-2 text-right text-success">{bestOutcome}</td>
                                <td className="py-2 text-right font-medium">{r.resilienceScore.toFixed(0)}%</td>
                                <td className="py-2 text-center">
                                  <Badge variant={resilience.badge as any} className="text-xs">
                                    {resilience.level}
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
              )}

              {/* Insights */}
              <Card className="border-warning/20 bg-warning/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Stress Test Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <Activity className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Overall Resilience</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.resilienceScore >= 80
                            ? "Your scenario shows strong resilience across stress conditions. Well positioned for market volatility."
                            : selectedResult.resilienceScore >= 60
                            ? "Moderate resilience. Consider contingency plans for severe conditions."
                            : "Vulnerable to stress conditions. Recommend reviewing growth assumptions and building buffers."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-destructive mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Greatest Vulnerability</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{selectedResult.worstCase}</strong> poses the greatest risk, potentially reducing headcount by{" "}
                          {Math.abs(selectedResult.stressResults.find(r => r.conditionName === selectedResult.worstCase)?.changePercent || 0).toFixed(0)}%.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-warning mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Recommended Actions</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.resilienceScore < 70
                            ? "Build talent pipeline, increase retention programs, and diversify hiring channels."
                            : "Maintain current strategies while monitoring market conditions."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Opportunity</p>
                        <p className="text-xs text-muted-foreground">
                          Under <strong>{selectedResult.bestCase}</strong> conditions, you could see{" "}
                          {(selectedResult.stressResults.find(r => r.conditionName === selectedResult.bestCase)?.changePercent || 0) > 0 ? "growth" : "minimal decline"} of{" "}
                          {Math.abs(selectedResult.stressResults.find(r => r.conditionName === selectedResult.bestCase)?.changePercent || 0).toFixed(0)}%.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
