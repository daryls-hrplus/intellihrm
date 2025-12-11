import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Clock,
  BarChart3,
  Lightbulb,
  RefreshCw
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";

interface ScenarioParameters {
  id: string;
  name: string;
  description: string;
  growthRate: number;
  attritionRate: number;
  budgetConstraint: number;
  timeHorizon: number;
  seasonalAdjustment: boolean;
  aggressiveHiring: boolean;
}

interface WhatIfAnalysisProps {
  scenarios: ScenarioParameters[];
  currentHeadcount: number;
}

type ParameterKey = "growthRate" | "attritionRate" | "budgetConstraint" | "timeHorizon";

interface ParameterConfig {
  key: ParameterKey;
  label: string;
  icon: typeof TrendingUp;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

const parameterConfigs: ParameterConfig[] = [
  {
    key: "growthRate",
    label: "Growth Rate",
    icon: TrendingUp,
    min: -10,
    max: 40,
    step: 5,
    unit: "%",
    description: "Annual growth target percentage"
  },
  {
    key: "attritionRate",
    label: "Attrition Rate",
    icon: TrendingDown,
    min: 0,
    max: 25,
    step: 2.5,
    unit: "%",
    description: "Expected annual turnover rate"
  },
  {
    key: "budgetConstraint",
    label: "Budget (Hires/Quarter)",
    icon: DollarSign,
    min: 0,
    max: 30,
    step: 3,
    unit: "",
    description: "Maximum hires per quarter"
  },
  {
    key: "timeHorizon",
    label: "Time Horizon",
    icon: Clock,
    min: 6,
    max: 24,
    step: 3,
    unit: " mo",
    description: "Forecast period in months"
  },
];

const scenarioColors = [
  "#0ea5e9", // sky-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
];

export function WhatIfAnalysis({ scenarios, currentHeadcount }: WhatIfAnalysisProps) {
  const [selectedParameter, setSelectedParameter] = useState<ParameterKey>("growthRate");
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(30);
  const [dataPoints, setDataPoints] = useState<number>(7);

  const paramConfig = parameterConfigs.find(p => p.key === selectedParameter)!;

  // Calculate scenario outcome for given parameter value
  const calculateOutcome = (scenario: ScenarioParameters, paramOverride: Partial<ScenarioParameters>) => {
    const params = { ...scenario, ...paramOverride };
    
    let headcount = currentHeadcount;
    let totalHires = 0;
    let totalAttrition = 0;

    const monthlyGrowthRate = params.growthRate / 100 / 12;
    const monthlyAttritionRate = params.attritionRate / 100 / 12;
    const maxHiresPerMonth = Math.ceil(params.budgetConstraint / 3);

    for (let i = 0; i < params.timeHorizon; i++) {
      const attrition = Math.round(headcount * monthlyAttritionRate);
      let targetHires = Math.round(headcount * monthlyGrowthRate) + attrition;
      
      if (params.aggressiveHiring) {
        targetHires = Math.round(targetHires * 1.3);
      }

      const hires = Math.min(targetHires, maxHiresPerMonth);
      headcount = headcount - attrition + hires;
      totalHires += hires;
      totalAttrition += attrition;
    }

    return {
      finalHeadcount: headcount,
      totalHires,
      totalAttrition,
      netChange: totalHires - totalAttrition,
      growthPercent: ((headcount - currentHeadcount) / currentHeadcount * 100)
    };
  };

  // Generate sensitivity data
  const sensitivityData = useMemo(() => {
    if (scenarios.length === 0) return [];

    const step = (rangeMax - rangeMin) / (dataPoints - 1);
    const data: any[] = [];

    for (let i = 0; i < dataPoints; i++) {
      const paramValue = rangeMin + (step * i);
      const point: any = {
        paramValue: Math.round(paramValue * 10) / 10,
        paramLabel: `${Math.round(paramValue * 10) / 10}${paramConfig.unit}`,
      };

      scenarios.forEach((scenario) => {
        const override = { [selectedParameter]: paramValue };
        const outcome = calculateOutcome(scenario, override);
        point[`${scenario.name}_headcount`] = outcome.finalHeadcount;
        point[`${scenario.name}_growth`] = Math.round(outcome.growthPercent * 10) / 10;
        point[`${scenario.name}_hires`] = outcome.totalHires;
      });

      data.push(point);
    }

    return data;
  }, [scenarios, selectedParameter, rangeMin, rangeMax, dataPoints, currentHeadcount]);

  // Find optimal values for each scenario
  const insights = useMemo(() => {
    if (sensitivityData.length === 0 || scenarios.length === 0) return [];

    return scenarios.map(scenario => {
      const maxHeadcount = sensitivityData.reduce((max, point) => {
        const hc = point[`${scenario.name}_headcount`];
        return hc > max.value ? { value: hc, param: point.paramValue } : max;
      }, { value: 0, param: 0 });

      const currentParamValue = scenario[selectedParameter] as number;
      const currentOutcome = calculateOutcome(scenario, {});

      return {
        scenario: scenario.name,
        currentValue: currentParamValue,
        currentHeadcount: currentOutcome.finalHeadcount,
        optimalValue: maxHeadcount.param,
        optimalHeadcount: maxHeadcount.value,
        improvement: maxHeadcount.value - currentOutcome.finalHeadcount,
      };
    });
  }, [sensitivityData, scenarios, selectedParameter]);

  const handleParameterChange = (param: string) => {
    setSelectedParameter(param as ParameterKey);
    const config = parameterConfigs.find(p => p.key === param)!;
    setRangeMin(config.min);
    setRangeMax(config.max);
  };

  if (scenarios.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No scenarios to analyze</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Create scenarios first to see what-if analysis and sensitivity charts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            What-If Analysis
          </CardTitle>
          <CardDescription>
            Analyze how changing a single parameter affects all scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Parameter to Analyze</Label>
              <Select value={selectedParameter} onValueChange={handleParameterChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parameterConfigs.map(param => (
                    <SelectItem key={param.key} value={param.key}>
                      <div className="flex items-center gap-2">
                        <param.icon className="h-4 w-4" />
                        {param.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Range: {rangeMin}{paramConfig.unit} - {rangeMax}{paramConfig.unit}</Label>
              <div className="pt-2">
                <Slider
                  value={[rangeMin, rangeMax]}
                  onValueChange={([min, max]) => {
                    setRangeMin(min);
                    setRangeMax(max);
                  }}
                  min={paramConfig.min}
                  max={paramConfig.max}
                  step={paramConfig.step}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data Points: {dataPoints}</Label>
              <div className="pt-2">
                <Slider
                  value={[dataPoints]}
                  onValueChange={([v]) => setDataPoints(v)}
                  min={5}
                  max={15}
                  step={1}
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => handleParameterChange(selectedParameter)}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Range
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity Chart - Final Headcount */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Final Headcount Sensitivity</CardTitle>
          <CardDescription>
            How final headcount changes as {paramConfig.label.toLowerCase()} varies from {rangeMin}{paramConfig.unit} to {rangeMax}{paramConfig.unit}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="paramLabel" 
                  className="text-xs"
                  label={{ value: paramConfig.label, position: "bottom", offset: -5 }}
                />
                <YAxis 
                  className="text-xs"
                  label={{ value: "Headcount", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    const scenarioName = name.replace("_headcount", "");
                    return [value, scenarioName];
                  }}
                />
                <Legend 
                  formatter={(value) => value.replace("_headcount", "")}
                />
                {scenarios.map((scenario, i) => (
                  <Line
                    key={scenario.id}
                    type="monotone"
                    dataKey={`${scenario.name}_headcount`}
                    stroke={scenarioColors[i % scenarioColors.length]}
                    strokeWidth={2}
                    dot={{ fill: scenarioColors[i % scenarioColors.length], r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Growth Percentage Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Growth Percentage Impact</CardTitle>
          <CardDescription>
            Percentage change in headcount across different {paramConfig.label.toLowerCase()} values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensitivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="paramLabel" className="text-xs" />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    return [`${value}%`, name.replace("_growth", "")];
                  }}
                />
                <Legend formatter={(value) => value.replace("_growth", "")} />
                {scenarios.map((scenario, i) => (
                  <Area
                    key={scenario.id}
                    type="monotone"
                    dataKey={`${scenario.name}_growth`}
                    stroke={scenarioColors[i % scenarioColors.length]}
                    fill={scenarioColors[i % scenarioColors.length]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Optimization Insights
          </CardTitle>
          <CardDescription>
            Recommendations based on {paramConfig.label.toLowerCase()} analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, i) => (
              <div 
                key={insight.scenario}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenarioColors[i % scenarioColors.length] }}
                  />
                  <span className="font-medium">{insight.scenario}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current {paramConfig.label}:</span>
                    <span className="font-medium">{insight.currentValue}{paramConfig.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Headcount:</span>
                    <span className="font-medium">{insight.currentHeadcount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Optimal in Range:</span>
                    <span className="font-medium">{insight.optimalValue}{paramConfig.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Optimal Headcount:</span>
                    <span className="font-medium">{insight.optimalHeadcount}</span>
                  </div>
                  
                  {insight.improvement !== 0 && (
                    <div className="pt-2 mt-2 border-t">
                      <Badge 
                        variant={insight.improvement > 0 ? "default" : "secondary"}
                        className="w-full justify-center"
                      >
                        {insight.improvement > 0 ? "+" : ""}{insight.improvement} headcount potential
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Scenario Values Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Scenario Parameters</CardTitle>
          <CardDescription>Reference values for each scenario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Scenario</th>
                  {parameterConfigs.map(p => (
                    <th key={p.key} className="text-center py-2 font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <p.icon className="h-3 w-3" />
                        {p.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario, i) => (
                  <tr key={scenario.id} className="border-b">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scenarioColors[i % scenarioColors.length] }}
                        />
                        {scenario.name}
                      </div>
                    </td>
                    {parameterConfigs.map(p => (
                      <td key={p.key} className={`py-2 text-center ${
                        p.key === selectedParameter ? 'bg-primary/10 font-medium' : ''
                      }`}>
                        {scenario[p.key]}{p.unit}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
