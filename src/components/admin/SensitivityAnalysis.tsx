import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  Play,
  BarChart3,
  AlertTriangle,
  Gauge
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend,
  ReferenceLine
} from "recharts";
import { ScenarioParameters } from "./ScenarioPlanning";

interface SensitivityAnalysisProps {
  scenarios: ScenarioParameters[];
  currentHeadcount: number;
}

interface ParameterSensitivity {
  parameter: string;
  label: string;
  baseValue: number;
  unit: string;
  lowValue: number;
  highValue: number;
  lowOutcome: number;
  highOutcome: number;
  baseOutcome: number;
  impact: number; // Absolute difference between high and low outcomes
  impactPercent: number;
  sensitivityCurve: { value: number; outcome: number; stdDev: number }[];
}

interface SensitivityResult {
  scenarioId: string;
  scenarioName: string;
  parameters: ParameterSensitivity[];
  mostSensitive: string;
  leastSensitive: string;
}

const SIMULATION_RUNS = 200; // Fewer runs for sensitivity analysis (speed)
const SENSITIVITY_STEPS = 7; // Number of points in sensitivity curve

export function SensitivityAnalysis({ scenarios, currentHeadcount }: SensitivityAnalysisProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SensitivityResult[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<string | null>(null);

  const parameterConfigs = [
    { key: "growthRate", label: "Growth Rate", unit: "%", min: 0, max: 50, step: 5 },
    { key: "attritionRate", label: "Attrition Rate", unit: "%", min: 0, max: 30, step: 3 },
    { key: "budgetConstraint", label: "Budget/Quarter", unit: " hires", min: 1, max: 20, step: 2 },
    { key: "timeHorizon", label: "Time Horizon", unit: " mo", min: 6, max: 24, step: 3 },
  ];

  const runMonteCarloForParams = (
    baseScenario: ScenarioParameters,
    overrides: Partial<ScenarioParameters>
  ): { mean: number; stdDev: number } => {
    const scenario = { ...baseScenario, ...overrides };
    const runs: number[] = [];

    for (let run = 0; run < SIMULATION_RUNS; run++) {
      let headcount = currentHeadcount;
      const variance = 0.15; // 15% variance

      const growthRate = scenario.growthRate * (1 + (Math.random() - 0.5) * variance * 2);
      const attritionRate = scenario.attritionRate * (1 + (Math.random() - 0.5) * variance * 2);
      const budgetConstraint = Math.round(scenario.budgetConstraint * (1 + (Math.random() - 0.5) * variance));

      const monthlyGrowthRate = growthRate / 100 / 12;
      const monthlyAttritionRate = attritionRate / 100 / 12;
      const maxHiresPerMonth = Math.ceil(budgetConstraint / 3);

      for (let month = 0; month < scenario.timeHorizon; month++) {
        const monthVariance = 1 + (Math.random() - 0.5) * 0.1;
        
        let attrition = Math.round(headcount * monthlyAttritionRate * monthVariance);
        
        if (scenario.seasonalAdjustment) {
          const monthIndex = (new Date().getMonth() + month + 1) % 12;
          if (monthIndex >= 0 && monthIndex <= 2) attrition = Math.round(attrition * (1.2 + Math.random() * 0.2));
          if (monthIndex === 8 || monthIndex === 9) attrition = Math.round(attrition * (1.1 + Math.random() * 0.2));
        }

        let targetHires = Math.round(headcount * monthlyGrowthRate * monthVariance) + attrition;
        
        if (scenario.aggressiveHiring) {
          targetHires = Math.round(targetHires * (1.2 + Math.random() * 0.2));
        }

        const hires = Math.min(targetHires, maxHiresPerMonth);
        headcount = Math.max(0, headcount - attrition + hires);
      }

      runs.push(headcount);
    }

    const mean = runs.reduce((a, b) => a + b, 0) / runs.length;
    const variance = runs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / runs.length;
    const stdDev = Math.sqrt(variance);

    return { mean, stdDev };
  };

  const analyzeScenario = (scenario: ScenarioParameters): SensitivityResult => {
    const parameters: ParameterSensitivity[] = [];

    for (const config of parameterConfigs) {
      const baseValue = (scenario as any)[config.key] as number;
      
      // Calculate low and high test values (±30% or within bounds)
      const range = config.max - config.min;
      const lowValue = Math.max(config.min, baseValue - range * 0.3);
      const highValue = Math.min(config.max, baseValue + range * 0.3);

      // Run simulations at base, low, and high values
      const baseResult = runMonteCarloForParams(scenario, {});
      const lowResult = runMonteCarloForParams(scenario, { [config.key]: lowValue });
      const highResult = runMonteCarloForParams(scenario, { [config.key]: highValue });

      // Generate sensitivity curve
      const sensitivityCurve: { value: number; outcome: number; stdDev: number }[] = [];
      const stepSize = (highValue - lowValue) / (SENSITIVITY_STEPS - 1);

      for (let i = 0; i < SENSITIVITY_STEPS; i++) {
        const testValue = lowValue + i * stepSize;
        const result = runMonteCarloForParams(scenario, { [config.key]: testValue });
        sensitivityCurve.push({
          value: Math.round(testValue * 10) / 10,
          outcome: Math.round(result.mean),
          stdDev: Math.round(result.stdDev * 10) / 10,
        });
      }

      const impact = Math.abs(highResult.mean - lowResult.mean);
      const impactPercent = (impact / baseResult.mean) * 100;

      parameters.push({
        parameter: config.key,
        label: config.label,
        baseValue,
        unit: config.unit,
        lowValue,
        highValue,
        lowOutcome: Math.round(lowResult.mean),
        highOutcome: Math.round(highResult.mean),
        baseOutcome: Math.round(baseResult.mean),
        impact: Math.round(impact),
        impactPercent,
        sensitivityCurve,
      });
    }

    // Sort by impact (descending)
    parameters.sort((a, b) => b.impact - a.impact);

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      parameters,
      mostSensitive: parameters[0]?.label || "",
      leastSensitive: parameters[parameters.length - 1]?.label || "",
    };
  };

  const runAnalysis = async () => {
    if (scenarios.length === 0) return;
    
    setIsRunning(true);
    
    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 50));

    const analysisResults: SensitivityResult[] = [];
    
    for (const scenario of scenarios) {
      const result = analyzeScenario(scenario);
      analysisResults.push(result);
    }

    setResults(analysisResults);
    setSelectedScenario(analysisResults[0]?.scenarioId || null);
    setSelectedParameter(analysisResults[0]?.parameters[0]?.parameter || null);
    setIsRunning(false);
  };

  const selectedResult = results.find(r => r.scenarioId === selectedScenario);
  const selectedParamData = selectedResult?.parameters.find(p => p.parameter === selectedParameter);

  // Prepare tornado chart data
  const tornadoData = selectedResult?.parameters.map(p => ({
    parameter: p.label,
    low: p.lowOutcome - p.baseOutcome,
    high: p.highOutcome - p.baseOutcome,
    impact: p.impact,
    impactPercent: p.impactPercent,
  })) || [];

  const scenarioColors = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
  ];

  const getImpactLevel = (impactPercent: number) => {
    if (impactPercent >= 15) return { level: "High Impact", color: "text-destructive", badge: "destructive" };
    if (impactPercent >= 8) return { level: "Medium Impact", color: "text-warning", badge: "secondary" };
    return { level: "Low Impact", color: "text-success", badge: "default" };
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Parameter Sensitivity Analysis
          </CardTitle>
          <CardDescription>
            Create scenarios first to analyze parameter sensitivity
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
            <Gauge className="h-5 w-5 text-primary" />
            Parameter Sensitivity Analysis
          </CardTitle>
          <CardDescription>
            Identify which parameters have the greatest impact on forecast outcomes and uncertainty
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runAnalysis} 
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Parameters...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Sensitivity Analysis
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
                onClick={() => {
                  setSelectedScenario(r.scenarioId);
                  setSelectedParameter(r.parameters[0]?.parameter || null);
                }}
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
              {/* Key Insights */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-success/20 bg-success/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Most Sensitive Parameter</p>
                        <p className="text-xl font-bold">{selectedResult.mostSensitive}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.parameters[0]?.impactPercent.toFixed(1)}% impact on forecast
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Least Sensitive Parameter</p>
                        <p className="text-xl font-bold">{selectedResult.leastSensitive}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.parameters[selectedResult.parameters.length - 1]?.impactPercent.toFixed(1)}% impact on forecast
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Parameter Impact Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Parameter Impact Ranking
                  </CardTitle>
                  <CardDescription>
                    Parameters ranked by their influence on headcount forecast (click to see details)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedResult.parameters.map((p, i) => {
                    const impact = getImpactLevel(p.impactPercent);
                    const isSelected = selectedParameter === p.parameter;
                    
                    return (
                      <div 
                        key={p.parameter}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedParameter(p.parameter)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground">#{i + 1}</span>
                            <div>
                              <p className="font-medium">{p.label}</p>
                              <p className="text-xs text-muted-foreground">
                                Base: {p.baseValue}{p.unit} → Range: {p.lowValue}{p.unit} to {p.highValue}{p.unit}
                              </p>
                            </div>
                          </div>
                          <Badge variant={impact.badge as any}>{impact.level}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Progress value={Math.min(p.impactPercent * 5, 100)} className="h-2" />
                          </div>
                          <div className="text-right min-w-[100px]">
                            <p className="font-semibold">{p.impact} employees</p>
                            <p className="text-xs text-muted-foreground">{p.impactPercent.toFixed(1)}% variation</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-destructive">Low: {p.lowOutcome}</span>
                          <span className="text-muted-foreground">Base: {p.baseOutcome}</span>
                          <span className="text-success">High: {p.highOutcome}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Tornado Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tornado Chart - Parameter Impact</CardTitle>
                  <CardDescription>
                    Shows how each parameter affects the forecast relative to base outcome ({selectedResult.parameters[0]?.baseOutcome})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={tornadoData} 
                        layout="vertical"
                        margin={{ left: 100, right: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis type="category" dataKey="parameter" className="text-xs" width={90} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [
                            `${value >= 0 ? "+" : ""}${value} employees`,
                            name === "low" ? "Low Value" : "High Value"
                          ]}
                        />
                        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
                        <Bar dataKey="low" fill="hsl(var(--destructive))" name="Low Value">
                          {tornadoData.map((entry, index) => (
                            <Cell key={`low-${index}`} fill={entry.low < 0 ? "hsl(var(--destructive))" : "hsl(var(--success))"} />
                          ))}
                        </Bar>
                        <Bar dataKey="high" fill="hsl(var(--success))" name="High Value">
                          {tornadoData.map((entry, index) => (
                            <Cell key={`high-${index}`} fill={entry.high < 0 ? "hsl(var(--destructive))" : "hsl(var(--success))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sensitivity Curve for Selected Parameter */}
              {selectedParamData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Sensitivity Curve: {selectedParamData.label}</CardTitle>
                    <CardDescription>
                      How changing {selectedParamData.label.toLowerCase()} affects the forecast outcome
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedParamData.sensitivityCurve}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="value" 
                            className="text-xs"
                            label={{ value: selectedParamData.label + selectedParamData.unit, position: "bottom", offset: -5 }}
                          />
                          <YAxis 
                            className="text-xs" 
                            yAxisId="left"
                            label={{ value: "Headcount", angle: -90, position: "insideLeft" }}
                          />
                          <YAxis 
                            className="text-xs" 
                            yAxisId="right"
                            orientation="right"
                            label={{ value: "Std Dev", angle: 90, position: "insideRight" }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number, name: string) => [
                              name === "outcome" ? `${value} employees` : `±${value}`,
                              name === "outcome" ? "Mean Headcount" : "Uncertainty (Std Dev)"
                            ]}
                          />
                          <Legend />
                          <ReferenceLine 
                            x={selectedParamData.baseValue} 
                            yAxisId="left"
                            stroke="hsl(var(--muted-foreground))" 
                            strokeDasharray="5 5"
                            label={{ value: "Current", position: "top", fontSize: 10 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="outcome"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            yAxisId="left"
                            dot={{ fill: "hsl(var(--primary))", r: 5 }}
                            name="Mean Headcount"
                          />
                          <Line
                            type="monotone"
                            dataKey="stdDev"
                            stroke="hsl(var(--warning))"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            yAxisId="right"
                            dot={{ fill: "hsl(var(--warning))", r: 3 }}
                            name="Uncertainty (Std Dev)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Analysis Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <Activity className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Focus Area</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{selectedResult.mostSensitive}</strong> has the highest impact. 
                          Small changes here significantly affect your headcount forecast.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Stable Parameter</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>{selectedResult.leastSensitive}</strong> has minimal impact. 
                          Variations here won't significantly change outcomes.
                        </p>
                      </div>
                    </div>
                    {selectedResult.parameters[0]?.impactPercent > 15 && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">High Uncertainty Warning</p>
                          <p className="text-xs text-muted-foreground">
                            Your forecast is highly sensitive to {selectedResult.mostSensitive.toLowerCase()}. 
                            Consider refining this parameter for more accurate projections.
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Parameter Range</p>
                        <p className="text-xs text-muted-foreground">
                          Across all parameters, headcount could range from {Math.min(...selectedResult.parameters.map(p => p.lowOutcome))} 
                          to {Math.max(...selectedResult.parameters.map(p => p.highOutcome))} employees.
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
