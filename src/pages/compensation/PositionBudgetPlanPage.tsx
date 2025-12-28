import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Save,
  Plus,
  Trash2,
  Copy,
  SendHorizonal,
  ArrowLeft,
  Users,
  DollarSign,
  Building2,
  Briefcase,
  Calculator,
  GitBranch,
  Target,
  FileCheck,
} from "lucide-react";

export default function PositionBudgetPlanPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(window.location.search);
  const idFromQuery = searchParams.get("id");
  const effectivePlanId = planId || idFromQuery;
  const isNew = !effectivePlanId;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fiscal_year: new Date().getFullYear(),
    start_date: `${new Date().getFullYear()}-01-01`,
    end_date: `${new Date().getFullYear()}-12-31`,
    plan_type: "annual",
    currency_code: "USD",
    company_id: "",
  });

  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    position_title: "",
    department_id: "",
    base_salary: 0,
    bonus_amount: 0,
    benefits_amount: 0,
    employer_taxes_amount: 0,
    allowances_amount: 0,
    overhead_amount: 0,
    headcount: 1,
    fte: 1.0,
    is_new_position: false,
    is_vacant: false,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments", formData.company_id],
    queryFn: async () => {
      if (!formData.company_id) return [];
      const { data } = await supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", formData.company_id)
        .eq("is_active", true)
        .order("name");
      return data || [];
    },
    enabled: !!formData.company_id,
  });

  const { data: plan, isLoading: planLoading } = useQuery({
    queryKey: ["position-budget-plan", effectivePlanId],
    queryFn: async () => {
      if (isNew || !effectivePlanId) return null;
      const { data, error } = await supabase
        .from("position_budget_plans")
        .select(`
          *,
          position_budget_scenarios(
            *,
            position_budget_items(*)
          )
        `)
        .eq("id", effectivePlanId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew && !!effectivePlanId,
  });

  // Set form data when plan loads
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description || "",
        fiscal_year: plan.fiscal_year,
        start_date: plan.start_date,
        end_date: plan.end_date,
        plan_type: plan.plan_type,
        currency_code: plan.currency_code,
        company_id: plan.company_id,
      });
      if (plan.position_budget_scenarios?.length > 0) {
        setSelectedScenarioId(plan.position_budget_scenarios[0].id);
      }
    }
  }, [plan]);

  const savePlanMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        const { data: newPlan, error: planError } = await supabase
          .from("position_budget_plans")
          .insert({
            ...formData,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (planError) throw planError;

        // Create baseline scenario
        const { error: scenarioError } = await supabase
          .from("position_budget_scenarios")
          .insert({
            plan_id: newPlan.id,
            name: "Baseline",
            scenario_type: "baseline",
            created_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (scenarioError) throw scenarioError;
        return newPlan;
      } else {
        const { data, error } = await supabase
          .from("position_budget_plans")
          .update(formData)
          .eq("id", effectivePlanId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      toast.success(isNew ? "Budget plan created" : "Budget plan saved");
      queryClient.invalidateQueries({ queryKey: ["position-budget-plan"] });
      if (isNew) {
        navigate(`/compensation/position-budgeting/plans?id=${data.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save plan");
    },
  });

  const addScenarioMutation = useMutation({
    mutationFn: async (scenarioType: string) => {
      const names: Record<string, string> = {
        growth: "Growth Scenario",
        reduction: "Reduction Scenario",
        what_if: "What-If Scenario",
      };
      const { data, error } = await supabase
        .from("position_budget_scenarios")
        .insert({
          plan_id: effectivePlanId,
          name: names[scenarioType] || "New Scenario",
          scenario_type: scenarioType,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scenario created");
      queryClient.invalidateQueries({ queryKey: ["position-budget-plan"] });
    },
  });

  const addBudgetItemMutation = useMutation({
    mutationFn: async () => {
      if (!selectedScenarioId) throw new Error("No scenario selected");
      const { error } = await supabase
        .from("position_budget_items")
        .insert({
          scenario_id: selectedScenarioId,
          ...newItem,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Position added to budget");
      setShowAddItemDialog(false);
      setNewItem({
        position_title: "",
        department_id: "",
        base_salary: 0,
        bonus_amount: 0,
        benefits_amount: 0,
        employer_taxes_amount: 0,
        allowances_amount: 0,
        overhead_amount: 0,
        headcount: 1,
        fte: 1.0,
        is_new_position: false,
        is_vacant: false,
      });
      queryClient.invalidateQueries({ queryKey: ["position-budget-plan"] });
    },
  });

  const submitForApprovalMutation = useMutation({
    mutationFn: async () => {
      // Get approval levels
      const { data: levels } = await supabase
        .from("position_budget_approval_levels")
        .select("*")
        .eq("company_id", formData.company_id)
        .eq("is_active", true)
        .order("level_order");

      if (!levels || levels.length === 0) {
        // No approval workflow, directly approve
        await supabase
          .from("position_budget_plans")
          .update({ status: "approved" })
          .eq("id", effectivePlanId);
        return;
      }

      // Create approval records
      for (const level of levels) {
        await supabase
          .from("position_budget_approvals")
          .insert({
            plan_id: effectivePlanId,
            approval_level_id: level.id,
            level_order: level.level_order,
            level_name: level.level_name,
            approver_id: level.approver_id,
            submitted_at: level.level_order === 1 ? new Date().toISOString() : null,
          });
      }

      await supabase
        .from("position_budget_plans")
        .update({ status: "pending_approval" })
        .eq("id", effectivePlanId);
    },
    onSuccess: () => {
      toast.success("Plan submitted for approval");
      queryClient.invalidateQueries({ queryKey: ["position-budget-plan"] });
    },
  });

  const selectedScenario = plan?.position_budget_scenarios?.find(
    (s: any) => s.id === selectedScenarioId
  );
  const budgetItems = selectedScenario?.position_budget_items || [];

  const formatCurrency = (value: number | null) => {
    if (!value) return "$0";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  };

  if (!isNew && planLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Compensation", href: "/compensation" },
            { label: "Position-Based Budgeting", href: "/compensation/position-budgeting" },
            { label: isNew ? "New Plan" : plan?.name || "Plan" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/compensation/position-budgeting">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {isNew ? "New Budget Plan" : plan?.name}
              </h1>
              {!isNew && (
                <Badge className="mt-1">{plan?.status?.replace("_", " ")}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isNew && plan?.status === "draft" && (
              <Button
                variant="outline"
                onClick={() => submitForApprovalMutation.mutate()}
                disabled={submitForApprovalMutation.isPending}
              >
                <SendHorizonal className="mr-2 h-4 w-4" />
                Submit for Approval
              </Button>
            )}
            <Button
              onClick={() => savePlanMutation.mutate()}
              disabled={savePlanMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {isNew ? "Create Plan" : "Save Changes"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Plan Details</TabsTrigger>
            {!isNew && <TabsTrigger value="positions">Position Items</TabsTrigger>}
            {!isNew && <TabsTrigger value="scenarios">Scenarios</TabsTrigger>}
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Plan Configuration</CardTitle>
                <CardDescription>
                  Define the budget plan parameters and fiscal period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Plan Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., FY 2025 Workforce Budget"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Company *</Label>
                    <Select
                      value={formData.company_id}
                      onValueChange={(v) => setFormData({ ...formData, company_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Budget plan description and objectives..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Fiscal Year *</Label>
                    <Select
                      value={formData.fiscal_year.toString()}
                      onValueChange={(v) => setFormData({ ...formData, fiscal_year: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <SelectItem key={y} value={y.toString()}>FY {y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan Type</Label>
                    <Select
                      value={formData.plan_type}
                      onValueChange={(v) => setFormData({ ...formData, plan_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual">Annual</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="multi_year">Multi-Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {!isNew && (
            <TabsContent value="positions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Position Budget Items</CardTitle>
                    <CardDescription>
                      Add positions and their fully loaded costs
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {plan?.position_budget_scenarios?.length > 0 && (
                      <Select
                        value={selectedScenarioId || ""}
                        onValueChange={setSelectedScenarioId}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select scenario" />
                        </SelectTrigger>
                        <SelectContent>
                          {plan.position_budget_scenarios.map((s: any) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.scenario_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
                      <DialogTrigger asChild>
                        <Button disabled={!selectedScenarioId}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Position
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add Position to Budget</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Position Title *</Label>
                              <Input
                                value={newItem.position_title}
                                onChange={(e) => setNewItem({ ...newItem, position_title: e.target.value })}
                                placeholder="e.g., Senior Software Engineer"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Department</Label>
                              <Select
                                value={newItem.department_id}
                                onValueChange={(v) => setNewItem({ ...newItem, department_id: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {departments.map((d: any) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                              <Label>Headcount</Label>
                              <Input
                                type="number"
                                min={1}
                                value={newItem.headcount}
                                onChange={(e) => setNewItem({ ...newItem, headcount: parseInt(e.target.value) || 1 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>FTE</Label>
                              <Input
                                type="number"
                                step={0.1}
                                min={0.1}
                                max={1}
                                value={newItem.fte}
                                onChange={(e) => setNewItem({ ...newItem, fte: parseFloat(e.target.value) || 1 })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Position Status</Label>
                              <Select
                                value={newItem.is_vacant ? "vacant" : newItem.is_new_position ? "new" : "filled"}
                                onValueChange={(v) => setNewItem({
                                  ...newItem,
                                  is_vacant: v === "vacant",
                                  is_new_position: v === "new",
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="filled">Filled</SelectItem>
                                  <SelectItem value="vacant">Vacant</SelectItem>
                                  <SelectItem value="new">New Position</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <p className="text-sm font-medium mb-3">Cost Components (Annual)</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Base Salary</Label>
                                <Input
                                  type="number"
                                  value={newItem.base_salary}
                                  onChange={(e) => setNewItem({ ...newItem, base_salary: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Bonus</Label>
                                <Input
                                  type="number"
                                  value={newItem.bonus_amount}
                                  onChange={(e) => setNewItem({ ...newItem, bonus_amount: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Benefits</Label>
                                <Input
                                  type="number"
                                  value={newItem.benefits_amount}
                                  onChange={(e) => setNewItem({ ...newItem, benefits_amount: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Employer Taxes</Label>
                                <Input
                                  type="number"
                                  value={newItem.employer_taxes_amount}
                                  onChange={(e) => setNewItem({ ...newItem, employer_taxes_amount: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Allowances</Label>
                                <Input
                                  type="number"
                                  value={newItem.allowances_amount}
                                  onChange={(e) => setNewItem({ ...newItem, allowances_amount: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Overhead</Label>
                                <Input
                                  type="number"
                                  value={newItem.overhead_amount}
                                  onChange={(e) => setNewItem({ ...newItem, overhead_amount: parseFloat(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => addBudgetItemMutation.mutate()}
                              disabled={!newItem.position_title || addBudgetItemMutation.isPending}
                            >
                              Add Position
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {budgetItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="mx-auto h-12 w-12 opacity-50 mb-4" />
                      <p>No positions added yet</p>
                      <p className="text-sm">Add positions to build your budget</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Position</TableHead>
                          <TableHead>Headcount</TableHead>
                          <TableHead>Base Salary</TableHead>
                          <TableHead>Total Comp</TableHead>
                          <TableHead>Fully Loaded</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {budgetItems.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.position_title}</p>
                                {item.job_family && (
                                  <p className="text-xs text-muted-foreground">{item.job_family}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.headcount} ({item.fte} FTE)</TableCell>
                            <TableCell>{formatCurrency(item.base_salary)}</TableCell>
                            <TableCell>{formatCurrency(item.total_compensation)}</TableCell>
                            <TableCell className="font-medium">{formatCurrency(item.fully_loaded_cost)}</TableCell>
                            <TableCell>
                              {item.is_new_position ? (
                                <Badge className="bg-success/10 text-success">New</Badge>
                              ) : item.is_vacant ? (
                                <Badge className="bg-warning/10 text-warning">Vacant</Badge>
                              ) : (
                                <Badge className="bg-primary/10 text-primary">Filled</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {budgetItems.length > 0 && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Headcount</p>
                          <p className="text-lg font-bold">
                            {budgetItems.reduce((sum: number, i: any) => sum + (i.headcount || 0), 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Base Salary</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(budgetItems.reduce((sum: number, i: any) => sum + (i.base_salary || 0), 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Compensation</p>
                          <p className="text-lg font-bold">
                            {formatCurrency(budgetItems.reduce((sum: number, i: any) => sum + (i.total_compensation || 0), 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Fully Loaded Cost</p>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(budgetItems.reduce((sum: number, i: any) => sum + (i.fully_loaded_cost || 0), 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!isNew && (
            <TabsContent value="scenarios">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Budget Scenarios</CardTitle>
                    <CardDescription>
                      Create and compare different budget scenarios
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => addScenarioMutation.mutate("growth")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Growth
                    </Button>
                    <Button variant="outline" onClick={() => addScenarioMutation.mutate("reduction")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Reduction
                    </Button>
                    <Button variant="outline" onClick={() => addScenarioMutation.mutate("what_if")}>
                      <Plus className="mr-2 h-4 w-4" />
                      What-If
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!plan?.position_budget_scenarios?.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <GitBranch className="mx-auto h-12 w-12 opacity-50 mb-4" />
                      <p>No scenarios created yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {plan.position_budget_scenarios.map((scenario: any) => (
                        <Card key={scenario.id} className="border-2">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="font-medium">{scenario.name}</p>
                                <Badge variant="outline" className="mt-1">
                                  {scenario.scenario_type}
                                </Badge>
                              </div>
                              {scenario.scenario_type === "baseline" && (
                                <Target className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Cost</span>
                                <span className="font-medium">{formatCurrency(scenario.total_cost)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Headcount</span>
                                <span className="font-medium">{scenario.total_headcount}</span>
                              </div>
                              {scenario.scenario_type !== "baseline" && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">vs Baseline</span>
                                  <span className={`font-medium ${scenario.variance_from_baseline > 0 ? "text-destructive" : "text-success"}`}>
                                    {scenario.variance_from_baseline > 0 ? "+" : ""}
                                    {formatCurrency(scenario.variance_from_baseline)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              className="w-full mt-4"
                              onClick={() => setSelectedScenarioId(scenario.id)}
                            >
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}
