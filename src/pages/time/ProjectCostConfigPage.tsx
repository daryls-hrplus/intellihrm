import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, Plus, Pencil, Trash2, DollarSign, Target } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CostRate {
  id: string;
  project_id: string;
  project_name?: string;
  employee_id: string | null;
  employee_name?: string;
  job_id: string | null;
  job_name?: string;
  cost_rate: number;
  bill_rate: number;
  effective_start_date: string;
  effective_end_date: string | null;
  is_active: boolean;
}

interface Budget {
  id: string;
  project_id: string;
  project_name?: string;
  budget_type: string;
  budget_amount: number;
  alert_threshold_percent: number;
  critical_threshold_percent: number;
  is_active: boolean;
}

export default function ProjectCostConfigPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("rates");
  const [costRates, setCostRates] = useState<CostRate[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Rate dialog state
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CostRate | null>(null);
  const [rateForm, setRateForm] = useState({
    project_id: "",
    employee_id: "",
    job_id: "",
    cost_rate: "",
    bill_rate: "",
    effective_start_date: format(new Date(), 'yyyy-MM-dd'),
    is_active: true,
  });

  // Budget dialog state
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({
    project_id: "",
    budget_type: "labor",
    budget_amount: "",
    alert_threshold_percent: "80",
    critical_threshold_percent: "100",
    is_active: true,
  });

  useEffect(() => {
    if (profile?.company_id) {
      fetchData();
    }
  }, [profile?.company_id]);

  const fetchData = async () => {
    if (!profile?.company_id) return;
    setIsLoading(true);

    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', profile.company_id)
        .order('name');
      setProjects(projectsData || []);

      // Fetch employees
      const { data: employeesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('full_name');
      setEmployees(employeesData || []);

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('title');
      setJobs(jobsData || []);

      // Fetch cost rates
      const { data: ratesData } = await supabase
        .from('project_cost_rates')
        .select(`
          *,
          projects:project_id (name),
          profiles:employee_id (full_name),
          jobs:job_id (title)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      const formattedRates = (ratesData || []).map((r: any) => ({
        ...r,
        project_name: r.projects?.name,
        employee_name: r.profiles?.full_name,
        job_name: r.jobs?.title,
      }));
      setCostRates(formattedRates);

      // Fetch budgets
      const { data: budgetsData } = await supabase
        .from('project_budgets')
        .select(`
          *,
          projects:project_id (name)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      const formattedBudgets = (budgetsData || []).map((b: any) => ({
        ...b,
        project_name: b.projects?.name,
      }));
      setBudgets(formattedBudgets);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load configuration data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRate = async () => {
    if (!profile?.company_id || !rateForm.project_id) {
      toast.error('Please select a project');
      return;
    }

    try {
      const rateData = {
        company_id: profile.company_id,
        project_id: rateForm.project_id,
        employee_id: rateForm.employee_id || null,
        job_id: rateForm.job_id || null,
        cost_rate: parseFloat(rateForm.cost_rate) || 0,
        bill_rate: parseFloat(rateForm.bill_rate) || 0,
        effective_start_date: rateForm.effective_start_date,
        is_active: rateForm.is_active,
      };

      if (editingRate) {
        await supabase
          .from('project_cost_rates')
          .update(rateData)
          .eq('id', editingRate.id);
        toast.success('Rate updated successfully');
      } else {
        await supabase
          .from('project_cost_rates')
          .insert(rateData);
        toast.success('Rate created successfully');
      }

      setRateDialogOpen(false);
      setEditingRate(null);
      resetRateForm();
      fetchData();
    } catch (error) {
      console.error('Error saving rate:', error);
      toast.error('Failed to save rate');
    }
  };

  const handleSaveBudget = async () => {
    if (!profile?.company_id || !budgetForm.project_id) {
      toast.error('Please select a project');
      return;
    }

    try {
      const budgetData = {
        company_id: profile.company_id,
        project_id: budgetForm.project_id,
        budget_type: budgetForm.budget_type,
        budget_amount: parseFloat(budgetForm.budget_amount) || 0,
        alert_threshold_percent: parseFloat(budgetForm.alert_threshold_percent) || 80,
        critical_threshold_percent: parseFloat(budgetForm.critical_threshold_percent) || 100,
        is_active: budgetForm.is_active,
      };

      if (editingBudget) {
        await supabase
          .from('project_budgets')
          .update(budgetData)
          .eq('id', editingBudget.id);
        toast.success('Budget updated successfully');
      } else {
        await supabase
          .from('project_budgets')
          .insert(budgetData);
        toast.success('Budget created successfully');
      }

      setBudgetDialogOpen(false);
      setEditingBudget(null);
      resetBudgetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget');
    }
  };

  const handleDeleteRate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate?')) return;
    
    try {
      await supabase.from('project_cost_rates').delete().eq('id', id);
      toast.success('Rate deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete rate');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await supabase.from('project_budgets').delete().eq('id', id);
      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  const resetRateForm = () => {
    setRateForm({
      project_id: "",
      employee_id: "",
      job_id: "",
      cost_rate: "",
      bill_rate: "",
      effective_start_date: format(new Date(), 'yyyy-MM-dd'),
      is_active: true,
    });
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      project_id: "",
      budget_type: "labor",
      budget_amount: "",
      alert_threshold_percent: "80",
      critical_threshold_percent: "100",
      is_active: true,
    });
  };

  const openEditRate = (rate: CostRate) => {
    setEditingRate(rate);
    setRateForm({
      project_id: rate.project_id,
      employee_id: rate.employee_id || "",
      job_id: rate.job_id || "",
      cost_rate: rate.cost_rate.toString(),
      bill_rate: rate.bill_rate.toString(),
      effective_start_date: rate.effective_start_date,
      is_active: rate.is_active,
    });
    setRateDialogOpen(true);
  };

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      project_id: budget.project_id,
      budget_type: budget.budget_type,
      budget_amount: budget.budget_amount.toString(),
      alert_threshold_percent: budget.alert_threshold_percent.toString(),
      critical_threshold_percent: budget.critical_threshold_percent.toString(),
      is_active: budget.is_active,
    });
    setBudgetDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("timeAttendance.title"), href: "/time-attendance" },
            { label: "Project Costs", href: "/time/project-costs" },
            { label: "Configuration" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cost Configuration</h1>
              <p className="text-muted-foreground">Configure project cost rates and budgets</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="rates" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Cost Rates
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-2">
              <Target className="h-4 w-4" />
              Budgets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Cost Rates</CardTitle>
                  <CardDescription>Set employee or job-specific rates for projects</CardDescription>
                </div>
                <Button onClick={() => { resetRateForm(); setEditingRate(null); setRateDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Employee/Job</TableHead>
                      <TableHead className="text-right">Cost Rate</TableHead>
                      <TableHead className="text-right">Bill Rate</TableHead>
                      <TableHead>Effective Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : costRates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No cost rates configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      costRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.project_name}</TableCell>
                          <TableCell>
                            {rate.employee_name || rate.job_name || <span className="text-muted-foreground">Default</span>}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(rate.cost_rate)}/hr</TableCell>
                          <TableCell className="text-right">{formatCurrency(rate.bill_rate)}/hr</TableCell>
                          <TableCell>{format(new Date(rate.effective_start_date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant={rate.is_active ? "default" : "secondary"}>
                              {rate.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditRate(rate)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteRate(rate.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budgets" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Budgets</CardTitle>
                  <CardDescription>Set labor budgets and alert thresholds</CardDescription>
                </div>
                <Button onClick={() => { resetBudgetForm(); setEditingBudget(null); setBudgetDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Budget Amount</TableHead>
                      <TableHead className="text-right">Warning %</TableHead>
                      <TableHead className="text-right">Critical %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                      </TableRow>
                    ) : budgets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No budgets configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      budgets.map((budget) => (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">{budget.project_name}</TableCell>
                          <TableCell className="capitalize">{budget.budget_type}</TableCell>
                          <TableCell className="text-right">{formatCurrency(budget.budget_amount)}</TableCell>
                          <TableCell className="text-right">{budget.alert_threshold_percent}%</TableCell>
                          <TableCell className="text-right">{budget.critical_threshold_percent}%</TableCell>
                          <TableCell>
                            <Badge variant={budget.is_active ? "default" : "secondary"}>
                              {budget.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditBudget(budget)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteBudget(budget.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Rate Dialog */}
        <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRate ? "Edit Cost Rate" : "Add Cost Rate"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={rateForm.project_id} onValueChange={(v) => setRateForm({ ...rateForm, project_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Employee (optional)</Label>
                <Select value={rateForm.employee_id} onValueChange={(v) => setRateForm({ ...rateForm, employee_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All employees</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Role (optional)</Label>
                <Select value={rateForm.job_id} onValueChange={(v) => setRateForm({ ...rateForm, job_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All job roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All job roles</SelectItem>
                    {jobs.map((j) => (
                      <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Rate ($/hr)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={rateForm.cost_rate}
                    onChange={(e) => setRateForm({ ...rateForm, cost_rate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bill Rate ($/hr)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={rateForm.bill_rate}
                    onChange={(e) => setRateForm({ ...rateForm, bill_rate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={rateForm.effective_start_date}
                  onChange={(e) => setRateForm({ ...rateForm, effective_start_date: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={rateForm.is_active}
                  onCheckedChange={(v) => setRateForm({ ...rateForm, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Dialog */}
        <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <Select value={budgetForm.project_id} onValueChange={(v) => setBudgetForm({ ...budgetForm, project_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Type</Label>
                <Select value={budgetForm.budget_type} onValueChange={(v) => setBudgetForm({ ...budgetForm, budget_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="overhead">Overhead</SelectItem>
                    <SelectItem value="total">Total</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={budgetForm.budget_amount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, budget_amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Warning Threshold (%)</Label>
                  <Input
                    type="number"
                    value={budgetForm.alert_threshold_percent}
                    onChange={(e) => setBudgetForm({ ...budgetForm, alert_threshold_percent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Critical Threshold (%)</Label>
                  <Input
                    type="number"
                    value={budgetForm.critical_threshold_percent}
                    onChange={(e) => setBudgetForm({ ...budgetForm, critical_threshold_percent: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={budgetForm.is_active}
                  onCheckedChange={(v) => setBudgetForm({ ...budgetForm, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveBudget}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
