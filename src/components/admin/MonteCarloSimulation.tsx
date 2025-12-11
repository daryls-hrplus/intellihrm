import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  BarChart3,
  Loader2,
  Play,
  Info,
  Percent,
  Users,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
  ComposedChart,
  Line
} from "recharts";
import { ScenarioParameters } from "./ScenarioPlanning";

interface MonteCarloSimulationProps {
  scenarios: ScenarioParameters[];
  currentHeadcount: number;
}

interface SimulationResult {
  scenarioId: string;
  scenarioName: string;
  runs: number[];
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  probabilityOfTarget: number;
  riskMetrics: {
    downsideRisk: number;
    upsideOpportunity: number;
    volatility: number;
    valueAtRisk: number;
  };
  distribution: { range: string; count: number; percentage: number }[];
  confidenceIntervals: { month: string; p10: number; p50: number; p90: number; mean: number }[];
}

const SIMULATION_RUNS = 1000;
const VARIANCE_FACTOR = 0.2; // 20% variance in parameters

export function MonteCarloSimulation({ scenarios, currentHeadcount }: MonteCarloSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [targetHeadcount, setTargetHeadcount] = useState(Math.round(currentHeadcount * 1.15));
  const [varianceFactor, setVarianceFactor] = useState(20);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const runSimulation = async (scenario: ScenarioParameters): Promise<SimulationResult> => {
    const runs: number[] = [];
    const monthlyProjections: number[][] = [];

    // Initialize monthly projections array
    for (let i = 0; i < scenario.timeHorizon; i++) {
      monthlyProjections.push([]);
    }

    // Run Monte Carlo simulations
    for (let run = 0; run < SIMULATION_RUNS; run++) {
      let headcount = currentHeadcount;
      const variance = varianceFactor / 100;

      // Add randomness to parameters
      const growthRate = scenario.growthRate * (1 + (Math.random() - 0.5) * variance * 2);
      const attritionRate = scenario.attritionRate * (1 + (Math.random() - 0.5) * variance * 2);
      const budgetConstraint = Math.round(scenario.budgetConstraint * (1 + (Math.random() - 0.5) * variance));

      const monthlyGrowthRate = growthRate / 100 / 12;
      const monthlyAttritionRate = attritionRate / 100 / 12;
      const maxHiresPerMonth = Math.ceil(budgetConstraint / 3);

      for (let month = 0; month < scenario.timeHorizon; month++) {
        // Add random variance to monthly calculations
        const monthVariance = 1 + (Math.random() - 0.5) * 0.1;
        
        let attrition = Math.round(headcount * monthlyAttritionRate * monthVariance);
        
        // Seasonal adjustment with randomness
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
        
        monthlyProjections[month].push(headcount);
      }

      runs.push(headcount);
    }

    // Sort runs for percentile calculation
    const sortedRuns = [...runs].sort((a, b) => a - b);

    const getPercentile = (arr: number[], p: number) => {
      const index = Math.floor(arr.length * p);
      return arr[index];
    };

    const mean = runs.reduce((a, b) => a + b, 0) / runs.length;
    const variance_calc = runs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / runs.length;
    const stdDev = Math.sqrt(variance_calc);

    // Calculate distribution buckets
    const min = Math.min(...runs);
    const max = Math.max(...runs);
    const bucketSize = Math.ceil((max - min) / 10) || 1;
    const distribution: { range: string; count: number; percentage: number }[] = [];

    for (let i = 0; i < 10; i++) {
      const bucketMin = min + i * bucketSize;
      const bucketMax = bucketMin + bucketSize;
      const count = runs.filter(r => r >= bucketMin && r < bucketMax).length;
      distribution.push({
        range: `${bucketMin}-${bucketMax}`,
        count,
        percentage: (count / runs.length) * 100,
      });
    }

    // Calculate confidence intervals for each month
    const confidenceIntervals = monthlyProjections.map((monthData, i) => {
      const sorted = [...monthData].sort((a, b) => a - b);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = (new Date().getMonth() + i + 1) % 12;
      
      return {
        month: months[monthIndex],
        p10: getPercentile(sorted, 0.1),
        p50: getPercentile(sorted, 0.5),
        p90: getPercentile(sorted, 0.9),
        mean: sorted.reduce((a, b) => a + b, 0) / sorted.length,
      };
    });

    // Calculate risk metrics
    const probabilityOfTarget = runs.filter(r => r >= targetHeadcount).length / runs.length * 100;
    const downsideRuns = runs.filter(r => r < currentHeadcount);
    const upsideRuns = runs.filter(r => r > targetHeadcount);

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      runs,
      percentiles: {
        p10: getPercentile(sortedRuns, 0.1),
        p25: getPercentile(sortedRuns, 0.25),
        p50: getPercentile(sortedRuns, 0.5),
        p75: getPercentile(sortedRuns, 0.75),
        p90: getPercentile(sortedRuns, 0.9),
      },
      mean,
      stdDev,
      min,
      max,
      probabilityOfTarget,
      riskMetrics: {
        downsideRisk: (downsideRuns.length / runs.length) * 100,
        upsideOpportunity: (upsideRuns.length / runs.length) * 100,
        volatility: (stdDev / mean) * 100,
        valueAtRisk: currentHeadcount - getPercentile(sortedRuns, 0.05),
      },
      distribution,
      confidenceIntervals,
    };
  };

  const runAllSimulations = async () => {
    if (scenarios.length === 0) return;
    
    setIsRunning(true);
    
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));

    const simulationResults: SimulationResult[] = [];
    
    for (const scenario of scenarios) {
      const result = await runSimulation(scenario);
      simulationResults.push(result);
    }

    setResults(simulationResults);
    setSelectedScenario(simulationResults[0]?.scenarioId || null);
    setIsRunning(false);
  };

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error("No simulation results to export. Run simulation first.");
      return;
    }

    const lines: string[] = [];
    
    // Header
    lines.push("MONTE CARLO SIMULATION REPORT");
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Current Headcount: ${currentHeadcount}`);
    lines.push(`Target Headcount: ${targetHeadcount}`);
    lines.push(`Simulations: ${SIMULATION_RUNS.toLocaleString()}`);
    lines.push(`Parameter Variance: ±${varianceFactor}%`);
    lines.push("");
    
    // Summary for all scenarios
    lines.push("SCENARIO SUMMARY");
    lines.push("Scenario,P10,P25,P50 (Median),P75,P90,Mean,Std Dev,Min,Max,Target Probability,Downside Risk,Upside Opportunity,Volatility");
    results.forEach(r => {
      lines.push(`"${r.scenarioName}",${r.percentiles.p10},${r.percentiles.p25},${r.percentiles.p50},${r.percentiles.p75},${r.percentiles.p90},${r.mean.toFixed(1)},${r.stdDev.toFixed(1)},${r.min},${r.max},${r.probabilityOfTarget.toFixed(1)}%,${r.riskMetrics.downsideRisk.toFixed(1)}%,${r.riskMetrics.upsideOpportunity.toFixed(1)}%,${r.riskMetrics.volatility.toFixed(1)}%`);
    });
    lines.push("");

    // Confidence intervals for each scenario
    results.forEach(r => {
      lines.push(`CONFIDENCE INTERVALS: ${r.scenarioName}`);
      lines.push("Month,P10,P50 (Median),P90,Mean");
      r.confidenceIntervals.forEach(ci => {
        lines.push(`${ci.month},${ci.p10},${ci.p50},${ci.p90},${ci.mean.toFixed(1)}`);
      });
      lines.push("");
    });

    // Distribution for each scenario
    results.forEach(r => {
      lines.push(`PROBABILITY DISTRIBUTION: ${r.scenarioName}`);
      lines.push("Range,Count,Percentage");
      r.distribution.forEach(d => {
        lines.push(`"${d.range}",${d.count},${d.percentage.toFixed(1)}%`);
      });
      lines.push("");
    });

    const csvContent = lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monte-carlo-simulation-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

  const exportToPDF = () => {
    if (results.length === 0) {
      toast.error("No simulation results to export. Run simulation first.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      return;
    }

    const getRiskColor = (prob: number) => {
      if (prob >= 70) return "#22c55e";
      if (prob >= 40) return "#eab308";
      return "#ef4444";
    };

    const summaryRows = results.map(r => `
      <tr>
        <td>${r.scenarioName}</td>
        <td>${r.percentiles.p10}</td>
        <td><strong>${r.percentiles.p50}</strong></td>
        <td>${r.percentiles.p90}</td>
        <td>${r.mean.toFixed(1)}</td>
        <td>${r.stdDev.toFixed(1)}</td>
        <td>
          <span style="padding: 2px 8px; border-radius: 4px; background: ${getRiskColor(r.probabilityOfTarget)}; color: white;">
            ${r.probabilityOfTarget.toFixed(1)}%
          </span>
        </td>
      </tr>
    `).join("");

    const riskRows = results.map(r => `
      <tr>
        <td>${r.scenarioName}</td>
        <td style="color: #ef4444;">${r.riskMetrics.downsideRisk.toFixed(1)}%</td>
        <td style="color: #22c55e;">${r.riskMetrics.upsideOpportunity.toFixed(1)}%</td>
        <td>${r.riskMetrics.volatility.toFixed(1)}%</td>
        <td>${r.riskMetrics.valueAtRisk.toFixed(0)}</td>
      </tr>
    `).join("");

    const confidenceIntervalTables = results.map(r => `
      <h3>Confidence Intervals: ${r.scenarioName}</h3>
      <table>
        <thead>
          <tr><th>Month</th><th>P10</th><th>P50 (Median)</th><th>P90</th><th>Mean</th></tr>
        </thead>
        <tbody>
          ${r.confidenceIntervals.map(ci => `
            <tr>
              <td>${ci.month}</td>
              <td style="color: #ef4444;">${ci.p10}</td>
              <td><strong>${ci.p50}</strong></td>
              <td style="color: #22c55e;">${ci.p90}</td>
              <td>${ci.mean.toFixed(1)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Monte Carlo Simulation Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          h3 { color: #4b5563; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; }
          .meta { color: #6b7280; margin-bottom: 20px; }
          .config { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .config span { margin-right: 20px; }
          .print-btn { background: #3b82f6; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 20px; }
          .print-btn:hover { background: #2563eb; }
          @media print { .print-btn { display: none; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <h1>Monte Carlo Simulation Report</h1>
        <p class="meta">Generated: ${new Date().toLocaleString()}</p>
        
        <div class="config">
          <span><strong>Current Headcount:</strong> ${currentHeadcount}</span>
          <span><strong>Target Headcount:</strong> ${targetHeadcount}</span>
          <span><strong>Simulations:</strong> ${SIMULATION_RUNS.toLocaleString()}</span>
          <span><strong>Variance:</strong> ±${varianceFactor}%</span>
        </div>
        
        <h2>Percentile Summary</h2>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>P10</th>
              <th>P50 (Median)</th>
              <th>P90</th>
              <th>Mean</th>
              <th>Std Dev</th>
              <th>Target Prob.</th>
            </tr>
          </thead>
          <tbody>${summaryRows}</tbody>
        </table>

        <h2>Risk Metrics</h2>
        <table>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Downside Risk</th>
              <th>Upside Opportunity</th>
              <th>Volatility (CV)</th>
              <th>Value at Risk (5%)</th>
            </tr>
          </thead>
          <tbody>${riskRows}</tbody>
        </table>

        ${confidenceIntervalTables}
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success("PDF report opened in new tab");
  };

  const selectedResult = results.find(r => r.scenarioId === selectedScenario);

  const scenarioColors = [
    "hsl(var(--primary))",
    "hsl(var(--success))",
    "hsl(var(--warning))",
    "hsl(var(--destructive))",
  ];

  const getRiskLevel = (probability: number) => {
    if (probability >= 70) return { level: "Low Risk", color: "text-success", badge: "default" };
    if (probability >= 40) return { level: "Medium Risk", color: "text-warning", badge: "secondary" };
    return { level: "High Risk", color: "text-destructive", badge: "destructive" };
  };

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Monte Carlo Simulation
          </CardTitle>
          <CardDescription>
            Create scenarios first to run probabilistic simulations
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
            <Activity className="h-5 w-5 text-primary" />
            Monte Carlo Simulation
          </CardTitle>
          <CardDescription>
            Run {SIMULATION_RUNS.toLocaleString()} probabilistic simulations to understand headcount forecast uncertainty and risk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Headcount
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[targetHeadcount]}
                  onValueChange={([v]) => setTargetHeadcount(v)}
                  min={currentHeadcount}
                  max={Math.round(currentHeadcount * 2)}
                  step={1}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-sm">{targetHeadcount}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Target: {((targetHeadcount - currentHeadcount) / currentHeadcount * 100).toFixed(1)}% growth from current
              </p>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Parameter Variance
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[varianceFactor]}
                  onValueChange={([v]) => setVarianceFactor(v)}
                  min={5}
                  max={50}
                  step={5}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-sm">±{varianceFactor}%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Higher variance = more uncertainty in projections
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={runAllSimulations} 
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running {SIMULATION_RUNS.toLocaleString()} Simulations...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Monte Carlo Simulation
                </>
              )}
            </Button>

            {results.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Results
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Overview */}
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
              {/* Risk Metrics Dashboard */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Target Probability</p>
                        <p className="text-2xl font-bold">{selectedResult.probabilityOfTarget.toFixed(1)}%</p>
                      </div>
                      <Target className={`h-8 w-8 ${getRiskLevel(selectedResult.probabilityOfTarget).color}`} />
                    </div>
                    <Badge variant={getRiskLevel(selectedResult.probabilityOfTarget).badge as any} className="mt-2">
                      {getRiskLevel(selectedResult.probabilityOfTarget).level}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Downside Risk</p>
                        <p className="text-2xl font-bold">{selectedResult.riskMetrics.downsideRisk.toFixed(1)}%</p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-destructive" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Chance of going below current headcount
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Upside Opportunity</p>
                        <p className="text-2xl font-bold">{selectedResult.riskMetrics.upsideOpportunity.toFixed(1)}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-success" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Chance of exceeding target
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Volatility (CV)</p>
                        <p className="text-2xl font-bold">{selectedResult.riskMetrics.volatility.toFixed(1)}%</p>
                      </div>
                      <AlertTriangle className={`h-8 w-8 ${selectedResult.riskMetrics.volatility > 15 ? "text-warning" : "text-muted-foreground"}`} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Coefficient of variation
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Percentile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Forecast Range Summary
                  </CardTitle>
                  <CardDescription>
                    Percentile distribution of final headcount across {SIMULATION_RUNS.toLocaleString()} simulations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-5">
                    {[
                      { label: "P10 (Pessimistic)", value: selectedResult.percentiles.p10, color: "bg-destructive/20" },
                      { label: "P25", value: selectedResult.percentiles.p25, color: "bg-warning/20" },
                      { label: "P50 (Median)", value: selectedResult.percentiles.p50, color: "bg-primary/20" },
                      { label: "P75", value: selectedResult.percentiles.p75, color: "bg-success/20" },
                      { label: "P90 (Optimistic)", value: selectedResult.percentiles.p90, color: "bg-success/30" },
                    ].map((p) => (
                      <div key={p.label} className={`p-4 rounded-lg ${p.color}`}>
                        <p className="text-xs text-muted-foreground">{p.label}</p>
                        <p className="text-2xl font-bold">{p.value}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.value >= currentHeadcount ? "+" : ""}{((p.value - currentHeadcount) / currentHeadcount * 100).toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Mean</p>
                      <p className="text-xl font-semibold">{Math.round(selectedResult.mean)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Std Deviation</p>
                      <p className="text-xl font-semibold">{Math.round(selectedResult.stdDev)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Minimum</p>
                      <p className="text-xl font-semibold">{selectedResult.min}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Maximum</p>
                      <p className="text-xl font-semibold">{selectedResult.max}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confidence Interval Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Headcount Projection with Confidence Intervals</CardTitle>
                  <CardDescription>
                    Shaded area shows P10-P90 range (80% confidence), line shows median (P50)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={selectedResult.confidenceIntervals}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, name: string) => [
                            value,
                            name === "p10" ? "P10 (10th percentile)" :
                            name === "p50" ? "P50 (Median)" :
                            name === "p90" ? "P90 (90th percentile)" :
                            name === "mean" ? "Mean" : name
                          ]}
                        />
                        <Legend />
                        <defs>
                          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="p90"
                          stroke="none"
                          fill="url(#confidenceGradient)"
                          name="P90"
                        />
                        <Area
                          type="monotone"
                          dataKey="p10"
                          stroke="none"
                          fill="hsl(var(--background))"
                          name="P10"
                        />
                        <Line
                          type="monotone"
                          dataKey="p50"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", r: 4 }}
                          name="P50 (Median)"
                        />
                        <Line
                          type="monotone"
                          dataKey="mean"
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Mean"
                        />
                        <ReferenceLine 
                          y={currentHeadcount} 
                          stroke="hsl(var(--muted-foreground))" 
                          strokeDasharray="3 3"
                          label={{ value: "Current", position: "left", fontSize: 10 }}
                        />
                        <ReferenceLine 
                          y={targetHeadcount} 
                          stroke="hsl(var(--success))" 
                          strokeDasharray="3 3"
                          label={{ value: "Target", position: "right", fontSize: 10 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Probability Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Final Headcount Distribution</CardTitle>
                  <CardDescription>
                    Histogram showing the probability distribution of final headcount outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedResult.distribution}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="range" 
                          className="text-xs" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          className="text-xs" 
                          tickFormatter={(v) => `${v.toFixed(0)}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value.toFixed(1)}%`, "Probability"]}
                        />
                        <Bar 
                          dataKey="percentage" 
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                        <ReferenceLine 
                          x={selectedResult.distribution.findIndex(d => {
                            const [min] = d.range.split("-").map(Number);
                            return targetHeadcount >= min && targetHeadcount < min + (selectedResult.max - selectedResult.min) / 10;
                          })}
                          stroke="hsl(var(--success))"
                          strokeWidth={2}
                          label={{ value: "Target", position: "top", fontSize: 10 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Comparison */}
              {results.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Scenario Risk Comparison</CardTitle>
                    <CardDescription>
                      Compare risk profiles across all scenarios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium">Scenario</th>
                            <th className="text-right py-2 font-medium">P10</th>
                            <th className="text-right py-2 font-medium">P50</th>
                            <th className="text-right py-2 font-medium">P90</th>
                            <th className="text-right py-2 font-medium">Target Prob.</th>
                            <th className="text-right py-2 font-medium">Volatility</th>
                            <th className="text-center py-2 font-medium">Risk Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r, i) => {
                            const risk = getRiskLevel(r.probabilityOfTarget);
                            return (
                              <tr 
                                key={r.scenarioId} 
                                className={`border-b cursor-pointer hover:bg-muted/50 ${selectedScenario === r.scenarioId ? "bg-muted/30" : ""}`}
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
                                <td className="py-2 text-right text-destructive">{r.percentiles.p10}</td>
                                <td className="py-2 text-right font-medium">{r.percentiles.p50}</td>
                                <td className="py-2 text-right text-success">{r.percentiles.p90}</td>
                                <td className="py-2 text-right">{r.probabilityOfTarget.toFixed(1)}%</td>
                                <td className="py-2 text-right">{r.riskMetrics.volatility.toFixed(1)}%</td>
                                <td className="py-2 text-center">
                                  <Badge variant={risk.badge as any} className="text-xs">
                                    {risk.level}
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
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Simulation Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Expected Outcome</p>
                        <p className="text-xs text-muted-foreground">
                          There's a 50% chance headcount will be between {selectedResult.percentiles.p25} and {selectedResult.percentiles.p75} employees.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-success mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Target Achievement</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.probabilityOfTarget >= 50 
                            ? `Strong likelihood (${selectedResult.probabilityOfTarget.toFixed(0)}%) of reaching target headcount of ${targetHeadcount}.`
                            : `Low likelihood (${selectedResult.probabilityOfTarget.toFixed(0)}%) of reaching target. Consider adjusting parameters.`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 ${selectedResult.riskMetrics.downsideRisk > 20 ? "text-destructive" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium">Downside Risk</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.riskMetrics.downsideRisk > 20
                            ? `Caution: ${selectedResult.riskMetrics.downsideRisk.toFixed(0)}% chance of headcount declining below current levels.`
                            : `Low downside risk - only ${selectedResult.riskMetrics.downsideRisk.toFixed(0)}% chance of decline.`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Activity className={`h-4 w-4 mt-0.5 ${selectedResult.riskMetrics.volatility > 15 ? "text-warning" : "text-muted-foreground"}`} />
                      <div>
                        <p className="text-sm font-medium">Forecast Certainty</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedResult.riskMetrics.volatility > 15
                            ? `High uncertainty (${selectedResult.riskMetrics.volatility.toFixed(0)}% CV) - results may vary significantly.`
                            : `Moderate certainty (${selectedResult.riskMetrics.volatility.toFixed(0)}% CV) - projections are relatively stable.`}
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
