import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calculator,
  Save,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Percent,
} from "lucide-react";

interface WhatIfChange {
  type: "salary_adjustment" | "headcount_change" | "new_position" | "remove_position" | "benefits_change";
  label: string;
  value: number;
  impactAmount: number;
}

export default function PositionBudgetWhatIfPage() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  
  // What-if adjustments
  const [salaryAdjustment, setSalaryAdjustment] = useState(0);
  const [headcountChange, setHeadcountChange] = useState(0);
  const [benefitsChange, setBenefitsChange] = useState(0);
  const [inflationRate, setInflationRate] = useState(3);
  const [attritionRate, setAttritionRate] = useState(10);
  const [applyInflation, setApplyInflation] = useState(false);
  const [applyAttrition, setApplyAttrition] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ["position-budget-plans-whatif"],
    queryFn: async () => {
      const { data } = await supabase
        .from("position_budget_plans")
        .select(`
          id,
          name,
          fiscal_year,
          status,
          position_budget_scenarios(
            id,
            name,
            scenario_type,
            total_cost,
            total_headcount
          )
        `)
        .in("status", ["draft", "approved", "active"])
        .order("fiscal_year", { ascending: false });
      return data || [];
    },
  });

  const selectedPlan = plans.find((p: any) => p.id === selectedPlanId);
  const selectedScenario = selectedPlan?.position_budget_scenarios?.find(
    (s: any) => s.id === selectedScenarioId
  );

  const { data: budgetItems = [] } = useQuery({
    queryKey: ["budget-items-whatif", selectedScenarioId],
    queryFn: async () => {
      if (!selectedScenarioId) return [];
      const { data } = await supabase
        .from("position_budget_items")
        .select("*")
        .eq("scenario_id", selectedScenarioId);
      return data || [];
    },
    enabled: !!selectedScenarioId,
  });

  // Calculate baseline values
  const baselineTotals = useMemo(() => {
    const totalBaseSalary = budgetItems.reduce((sum, i: any) => sum + (i.base_salary || 0), 0);
    const totalBenefits = budgetItems.reduce((sum, i: any) => sum + (i.benefits_amount || 0), 0);
    const totalHeadcount = budgetItems.reduce((sum, i: any) => sum + (i.headcount || 0), 0);
    const totalFullyLoaded = budgetItems.reduce((sum, i: any) => sum + (i.fully_loaded_cost || 0), 0);
    
    return {
      totalBaseSalary,
      totalBenefits,
      totalHeadcount,
      totalFullyLoaded,
    };
  }, [budgetItems]);

  // Calculate projected values with what-if adjustments
  const projectedTotals = useMemo(() => {
    let projectedSalary = baselineTotals.totalBaseSalary;
    let projectedBenefits = baselineTotals.totalBenefits;
    let projectedHeadcount = baselineTotals.totalHeadcount;
    
    // Apply salary adjustment
    projectedSalary *= (1 + salaryAdjustment / 100);
    
    // Apply benefits change
    projectedBenefits *= (1 + benefitsChange / 100);
    
    // Apply headcount change
    const avgSalaryPerHead = baselineTotals.totalHeadcount > 0
      ? baselineTotals.totalBaseSalary / baselineTotals.totalHeadcount
      : 0;
    const avgBenefitsPerHead = baselineTotals.totalHeadcount > 0
      ? baselineTotals.totalBenefits / baselineTotals.totalHeadcount
      : 0;
    
    projectedHeadcount += headcountChange;
    projectedSalary += headcountChange * avgSalaryPerHead;
    projectedBenefits += headcountChange * avgBenefitsPerHead;
    
    // Apply inflation if enabled
    if (applyInflation) {
      projectedSalary *= (1 + inflationRate / 100);
    }
    
    // Apply attrition if enabled (reduces headcount but assumes replacement cost)
    if (applyAttrition) {
      const attritionHeadcount = Math.floor(projectedHeadcount * (attritionRate / 100));
      // Attrition creates temporary savings but replacement costs are typically higher
      const replacementMultiplier = 1.2; // 20% higher cost for new hires
      projectedSalary -= attritionHeadcount * avgSalaryPerHead * 0.5; // 6 months savings
      projectedSalary += attritionHeadcount * avgSalaryPerHead * 0.5 * replacementMultiplier;
    }
    
    // Calculate fully loaded (simplified: salary + benefits + 30% overhead)
    const projectedFullyLoaded = projectedSalary + projectedBenefits + (projectedSalary * 0.3);
    
    return {
      projectedSalary,
      projectedBenefits,
      projectedHeadcount,
      projectedFullyLoaded,
    };
  }, [baselineTotals, salaryAdjustment, headcountChange, benefitsChange, inflationRate, attritionRate, applyInflation, applyAttrition]);

  const costDifference = projectedTotals.projectedFullyLoaded - baselineTotals.totalFullyLoaded;
  const costDifferencePct = baselineTotals.totalFullyLoaded > 0
    ? (costDifference / baselineTotals.totalFullyLoaded) * 100
    : 0;

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const resetAdjustments = () => {
    setSalaryAdjustment(0);
    setHeadcountChange(0);
    setBenefitsChange(0);
    setInflationRate(3);
    setAttritionRate(10);
    setApplyInflation(false);
    setApplyAttrition(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Position-Based Budgeting", href: "/compensation/position-budget" },
            { label: "What-If Modeling" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/compensation/position-budget">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Target className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                What-If Modeling
              </h1>
              <p className="text-muted-foreground">
                Interactive scenario builder with real-time cost impact
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={resetAdjustments}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save as Scenario
            </Button>
          </div>
        </div>

        {/* Plan & Scenario Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a budget plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} (FY {plan.fiscal_year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlan && (
                <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPlan.position_budget_scenarios?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedScenarioId ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Adjustments Panel */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Adjustments</CardTitle>
                  <CardDescription>
                    Modify parameters to see cost impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Salary Adjustment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Salary Adjustment</Label>
                      <span className={`text-sm font-medium ${salaryAdjustment > 0 ? "text-destructive" : salaryAdjustment < 0 ? "text-success" : ""}`}>
                        {salaryAdjustment > 0 ? "+" : ""}{salaryAdjustment}%
                      </span>
                    </div>
                    <Slider
                      value={[salaryAdjustment]}
                      onValueChange={([v]) => setSalaryAdjustment(v)}
                      min={-20}
                      max={20}
                      step={0.5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-20%</span>
                      <span>0%</span>
                      <span>+20%</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Headcount Change */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Headcount Change</Label>
                      <span className={`text-sm font-medium ${headcountChange > 0 ? "text-destructive" : headcountChange < 0 ? "text-success" : ""}`}>
                        {headcountChange > 0 ? "+" : ""}{headcountChange}
                      </span>
                    </div>
                    <Slider
                      value={[headcountChange]}
                      onValueChange={([v]) => setHeadcountChange(v)}
                      min={-50}
                      max={50}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-50</span>
                      <span>0</span>
                      <span>+50</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Benefits Change */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Benefits Adjustment</Label>
                      <span className={`text-sm font-medium ${benefitsChange > 0 ? "text-destructive" : benefitsChange < 0 ? "text-success" : ""}`}>
                        {benefitsChange > 0 ? "+" : ""}{benefitsChange}%
                      </span>
                    </div>
                    <Slider
                      value={[benefitsChange]}
                      onValueChange={([v]) => setBenefitsChange(v)}
                      min={-30}
                      max={30}
                      step={1}
                    />
                  </div>

                  <Separator />

                  {/* Inflation */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Apply Inflation</Label>
                      <Switch checked={applyInflation} onCheckedChange={setApplyInflation} />
                    </div>
                    {applyInflation && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rate</span>
                          <span className="text-sm font-medium">{inflationRate}%</span>
                        </div>
                        <Slider
                          value={[inflationRate]}
                          onValueChange={([v]) => setInflationRate(v)}
                          min={0}
                          max={10}
                          step={0.5}
                        />
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Attrition */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Apply Attrition Impact</Label>
                      <Switch checked={applyAttrition} onCheckedChange={setApplyAttrition} />
                    </div>
                    {applyAttrition && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rate</span>
                          <span className="text-sm font-medium">{attritionRate}%</span>
                        </div>
                        <Slider
                          value={[attritionRate]}
                          onValueChange={([v]) => setAttritionRate(v)}
                          min={0}
                          max={25}
                          step={1}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-4">
              {/* Impact Summary */}
              <Card className={`border-2 ${costDifference > 0 ? "border-destructive/30" : costDifference < 0 ? "border-success/30" : "border-border"}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Cost Impact</h3>
                    <Badge
                      className={`text-lg px-3 py-1 ${
                        costDifference > 0
                          ? "bg-destructive/10 text-destructive"
                          : costDifference < 0
                          ? "bg-success/10 text-success"
                          : "bg-muted"
                      }`}
                    >
                      {costDifference > 0 ? (
                        <ArrowUpRight className="mr-1 h-4 w-4" />
                      ) : costDifference < 0 ? (
                        <ArrowDownRight className="mr-1 h-4 w-4" />
                      ) : null}
                      {costDifference > 0 ? "+" : ""}
                      {formatCurrency(costDifference)} ({costDifferencePct > 0 ? "+" : ""}{costDifferencePct.toFixed(1)}%)
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Baseline</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Base Salary</span>
                          <span className="font-medium">{formatCurrency(baselineTotals.totalBaseSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Benefits</span>
                          <span className="font-medium">{formatCurrency(baselineTotals.totalBenefits)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Headcount</span>
                          <span className="font-medium">{baselineTotals.totalHeadcount}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Fully Loaded</span>
                          <span className="text-lg font-bold">{formatCurrency(baselineTotals.totalFullyLoaded)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Projected</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Base Salary</span>
                          <span className={`font-medium ${projectedTotals.projectedSalary !== baselineTotals.totalBaseSalary ? "text-primary" : ""}`}>
                            {formatCurrency(projectedTotals.projectedSalary)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Benefits</span>
                          <span className={`font-medium ${projectedTotals.projectedBenefits !== baselineTotals.totalBenefits ? "text-primary" : ""}`}>
                            {formatCurrency(projectedTotals.projectedBenefits)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Headcount</span>
                          <span className={`font-medium ${projectedTotals.projectedHeadcount !== baselineTotals.totalHeadcount ? "text-primary" : ""}`}>
                            {projectedTotals.projectedHeadcount}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Fully Loaded</span>
                          <span className={`text-lg font-bold ${costDifference !== 0 ? "text-primary" : ""}`}>
                            {formatCurrency(projectedTotals.projectedFullyLoaded)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Adjustments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Adjustments</CardTitle>
                </CardHeader>
                <CardContent>
                  {salaryAdjustment === 0 && headcountChange === 0 && benefitsChange === 0 && !applyInflation && !applyAttrition ? (
                    <p className="text-muted-foreground text-center py-4">
                      No adjustments applied. Use the sliders to model different scenarios.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {salaryAdjustment !== 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>Salary Adjustment</span>
                          </div>
                          <Badge className={salaryAdjustment > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}>
                            {salaryAdjustment > 0 ? "+" : ""}{salaryAdjustment}%
                          </Badge>
                        </div>
                      )}
                      {headcountChange !== 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Headcount Change</span>
                          </div>
                          <Badge className={headcountChange > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}>
                            {headcountChange > 0 ? "+" : ""}{headcountChange} positions
                          </Badge>
                        </div>
                      )}
                      {benefitsChange !== 0 && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <span>Benefits Adjustment</span>
                          </div>
                          <Badge className={benefitsChange > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}>
                            {benefitsChange > 0 ? "+" : ""}{benefitsChange}%
                          </Badge>
                        </div>
                      )}
                      {applyInflation && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span>Inflation Applied</span>
                          </div>
                          <Badge className="bg-warning/10 text-warning">
                            +{inflationRate}%
                          </Badge>
                        </div>
                      )}
                      {applyAttrition && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                            <span>Attrition Impact</span>
                          </div>
                          <Badge className="bg-amber-500/10 text-amber-600">
                            {attritionRate}% rate
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Select a budget plan and scenario to start modeling
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
