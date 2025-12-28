import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Calculator,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart3,
  GitBranch,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Building2,
  Target,
  Layers,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

export default function PositionBudgetDashboardPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-for-budget"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return (data || []) as Company[];
    },
  });

  const { data: budgetPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["position-budget-plans", selectedCompanyId, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from("position_budget_plans")
        .select(`
          *,
          position_budget_scenarios(
            id,
            name,
            scenario_type,
            total_cost,
            total_headcount,
            variance_from_baseline,
            variance_percentage
          )
        `)
        .eq("fiscal_year", selectedYear)
        .order("created_at", { ascending: false });

      if (selectedCompanyId) {
        query = query.eq("company_id", selectedCompanyId);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: true,
  });

  const { data: pendingApprovals = [] } = useQuery({
    queryKey: ["pending-budget-approvals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("position_budget_approvals")
        .select(`
          *,
          position_budget_plans(name, fiscal_year, total_budgeted_amount)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      pending_approval: "bg-warning/10 text-warning",
      approved: "bg-success/10 text-success",
      active: "bg-primary/10 text-primary",
      closed: "bg-muted text-muted-foreground",
      rejected: "bg-destructive/10 text-destructive",
    };
    return <Badge className={styles[status] || "bg-muted"}>{status.replace("_", " ")}</Badge>;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  // Calculate summary stats
  const totalBudgeted = budgetPlans.reduce((sum, p) => sum + (p.total_budgeted_amount || 0), 0);
  const totalActual = budgetPlans.reduce((sum, p) => sum + (p.total_actual_amount || 0), 0);
  const activePlans = budgetPlans.filter(p => p.status === "active").length;
  const totalScenarios = budgetPlans.reduce((sum, p) => sum + (p.position_budget_scenarios?.length || 0), 0);

  const years = [2024, 2025, 2026, 2027];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Position-Based Budgeting" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Position-Based Budgeting
              </h1>
              <p className="text-muted-foreground">
                Workforce planning with scenarios, forecasting, and multi-level approvals
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/compensation/position-budget/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Budget Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompanyId || "all"} onValueChange={(v) => setSelectedCompanyId(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>FY {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budgeted</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalBudgeted)}</p>
                </div>
                <div className="rounded-lg bg-primary/10 p-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actual Spend</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
                  {totalBudgeted > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {((totalActual / totalBudgeted) * 100).toFixed(1)}% utilized
                    </p>
                  )}
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Plans</p>
                  <p className="text-2xl font-bold">{activePlans}</p>
                </div>
                <div className="rounded-lg bg-info/10 p-3">
                  <FileCheck className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Scenarios</p>
                  <p className="text-2xl font-bold">{totalScenarios}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <GitBranch className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/compensation/position-budget/scenarios">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2">
                    <Layers className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Scenario Comparison</p>
                    <p className="text-sm text-muted-foreground">Compare baseline vs growth</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/compensation/position-budget/whatif">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-violet-500/10 p-2">
                    <Target className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium">What-If Modeling</p>
                    <p className="text-sm text-muted-foreground">Interactive cost impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/compensation/position-budget/approvals">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <FileCheck className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Approvals</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingApprovals.length} pending
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/compensation/position-budget/cost-config">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-sky-500/10 p-2">
                    <BarChart3 className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cost Components</p>
                    <p className="text-sm text-muted-foreground">Configure fully loaded costs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Budget Plans</TabsTrigger>
            <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Budget Plans</CardTitle>
              </CardHeader>
              <CardContent>
                {plansLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : budgetPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <Calculator className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No budget plans found</p>
                    <Link to="/compensation/position-budget/new">
                      <Button className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Plan
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan Name</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Total Budget</TableHead>
                        <TableHead>Actual</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Scenarios</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetPlans.map((plan: any) => {
                        const variance = (plan.total_actual_amount || 0) - (plan.total_budgeted_amount || 0);
                        const utilizationPct = plan.total_budgeted_amount > 0
                          ? ((plan.total_actual_amount || 0) / plan.total_budgeted_amount) * 100
                          : 0;

                        return (
                          <TableRow key={plan.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-xs text-muted-foreground">v{plan.version}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>FY {plan.fiscal_year}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(plan.start_date), "MMM d")} - {format(new Date(plan.end_date), "MMM d, yyyy")}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(plan.total_budgeted_amount)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p>{formatCurrency(plan.total_actual_amount)}</p>
                                <Progress value={Math.min(utilizationPct, 100)} className="h-1.5 mt-1 w-20" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center gap-1 ${variance > 0 ? "text-destructive" : "text-success"}`}>
                                {variance > 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {formatCurrency(Math.abs(variance))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {plan.position_budget_scenarios?.length || 0} scenarios
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(plan.status)}</TableCell>
                            <TableCell>
                              <Link to={`/compensation/position-budget/${plan.id}`}>
                                <Button variant="ghost" size="sm">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variance">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Variance</CardTitle>
              </CardHeader>
              <CardContent>
                {budgetPlans.filter((p: any) => p.status === "active").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active budget plans to analyze
                  </div>
                ) : (
                  <div className="space-y-4">
                    {budgetPlans
                      .filter((p: any) => p.status === "active")
                      .map((plan: any) => {
                        const variance = (plan.total_actual_amount || 0) - (plan.total_budgeted_amount || 0);
                        const variancePct = plan.total_budgeted_amount > 0
                          ? (variance / plan.total_budgeted_amount) * 100
                          : 0;
                        const isOverBudget = variance > 0;

                        return (
                          <div key={plan.id} className="p-4 rounded-lg border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="font-medium">{plan.name}</p>
                                <p className="text-sm text-muted-foreground">FY {plan.fiscal_year}</p>
                              </div>
                              {isOverBudget && (
                                <Badge className="bg-destructive/10 text-destructive">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Over Budget
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Budgeted</p>
                                <p className="font-medium">{formatCurrency(plan.total_budgeted_amount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Actual</p>
                                <p className="font-medium">{formatCurrency(plan.total_actual_amount)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Variance</p>
                                <p className={`font-medium ${isOverBudget ? "text-destructive" : "text-success"}`}>
                                  {isOverBudget ? "+" : ""}{formatCurrency(variance)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Variance %</p>
                                <p className={`font-medium ${isOverBudget ? "text-destructive" : "text-success"}`}>
                                  {isOverBudget ? "+" : ""}{variancePct.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending approvals
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Plan</TableHead>
                        <TableHead>Approval Level</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApprovals.map((approval: any) => (
                        <TableRow key={approval.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{approval.position_budget_plans?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                FY {approval.position_budget_plans?.fiscal_year}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>{approval.level_name}</TableCell>
                          <TableCell>
                            {formatCurrency(approval.position_budget_plans?.total_budgeted_amount)}
                          </TableCell>
                          <TableCell>
                            {approval.submitted_at
                              ? format(new Date(approval.submitted_at), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Link to={`/compensation/position-budget/approvals/${approval.id}`}>
                              <Button size="sm">Review</Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
