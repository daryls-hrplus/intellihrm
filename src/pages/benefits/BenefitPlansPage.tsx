import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

interface BenefitPlan {
  id: string;
  category_id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  plan_type: string;
  provider_name: string | null;
  enrollment_type: string;
  employee_contribution: number;
  employer_contribution: number;
  contribution_frequency: string;
  currency: string;
  waiting_period_days: number;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  benefit_categories?: { name: string };
}

interface BenefitCategory {
  id: string;
  name: string;
  category_type: string;
}

interface Company {
  id: string;
  name: string;
}

const PLAN_TYPES = [
  'medical', 'dental', 'vision', 'life', 'disability', 
  '401k', 'pension', 'hsa', 'fsa', 'gym', 'wellness', 'eap', 'other'
];

const ENROLLMENT_TYPES = [
  { value: 'open', label: 'Open Enrollment' },
  { value: 'auto', label: 'Auto-Enrollment' },
  { value: 'both', label: 'Both' },
];

export default function BenefitPlansPage() {
  const { isAdmin, hasRole } = useAuth();
  const canManage = isAdmin || hasRole('hr_manager');
  
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [categories, setCategories] = useState<BenefitCategory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BenefitPlan | null>(null);
  
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    code: "",
    description: "",
    plan_type: "medical",
    provider_name: "",
    enrollment_type: "open",
    employee_contribution: 0,
    employer_contribution: 0,
    contribution_frequency: "monthly",
    currency: "USD",
    waiting_period_days: 0,
    is_active: true,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPlans();
      fetchCategories();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name').eq('is_active', true).order('name');
    if (data) {
      setCompanies(data);
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('benefit_categories').select('id, name, category_type').eq('company_id', selectedCompanyId).eq('is_active', true);
    setCategories(data || []);
  };

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('benefit_plans')
      .select('*, benefit_categories(name)')
      .eq('company_id', selectedCompanyId)
      .order('name');
    
    if (error) {
      toast.error("Failed to load plans");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code || !formData.category_id) {
      toast.error("Please fill required fields");
      return;
    }

    const payload = {
      ...formData,
      company_id: selectedCompanyId,
      end_date: formData.end_date || null,
    };

    if (editingPlan) {
      const { error } = await supabase.from('benefit_plans').update(payload).eq('id', editingPlan.id);
      if (error) {
        toast.error("Failed to update plan");
      } else {
        toast.success("Plan updated");
        fetchPlans();
      }
    } else {
      const { error } = await supabase.from('benefit_plans').insert(payload);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Plan created");
        fetchPlans();
      }
    }
    closeDialog();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    const { error } = await supabase.from('benefit_plans').delete().eq('id', id);
    if (error) {
      toast.error("Failed to delete plan");
    } else {
      toast.success("Plan deleted");
      fetchPlans();
    }
  };

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({
      category_id: categories[0]?.id || "",
      name: "",
      code: "",
      description: "",
      plan_type: "medical",
      provider_name: "",
      enrollment_type: "open",
      employee_contribution: 0,
      employer_contribution: 0,
      contribution_frequency: "monthly",
      currency: "USD",
      waiting_period_days: 0,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (plan: BenefitPlan) => {
    setEditingPlan(plan);
    setFormData({
      category_id: plan.category_id,
      name: plan.name,
      code: plan.code,
      description: plan.description || "",
      plan_type: plan.plan_type,
      provider_name: plan.provider_name || "",
      enrollment_type: plan.enrollment_type,
      employee_contribution: plan.employee_contribution,
      employer_contribution: plan.employer_contribution,
      contribution_frequency: plan.contribution_frequency,
      currency: plan.currency,
      waiting_period_days: plan.waiting_period_days,
      is_active: plan.is_active,
      start_date: plan.start_date,
      end_date: plan.end_date || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPlan(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Benefits", href: "/benefits" },
          { label: "Benefit Plans" }
        ]} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Benefit Plans</h1>
              <p className="text-muted-foreground">Manage benefit plans and coverage options</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canManage && (
              <Button onClick={openCreate} disabled={categories.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> Add Plan
              </Button>
            )}
          </div>
        </div>

        {categories.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            Please create benefit categories first before adding plans.
          </div>
        )}

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Employee Contrib.</TableHead>
                <TableHead>Employer Contrib.</TableHead>
                <TableHead>Status</TableHead>
                {canManage && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No plans found</TableCell></TableRow>
              ) : plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.benefit_categories?.name}</TableCell>
                  <TableCell className="capitalize">{plan.plan_type}</TableCell>
                  <TableCell>{ENROLLMENT_TYPES.find(t => t.value === plan.enrollment_type)?.label}</TableCell>
                  <TableCell>{plan.currency} {plan.employee_contribution}</TableCell>
                  <TableCell>{plan.currency} {plan.employer_contribution}</TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit Plan" : "New Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan Type *</Label>
                <Select value={formData.plan_type} onValueChange={v => setFormData({...formData, plan_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input value={formData.provider_name} onChange={e => setFormData({...formData, provider_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Enrollment Type *</Label>
                <Select value={formData.enrollment_type} onValueChange={v => setFormData({...formData, enrollment_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENROLLMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Employee Contribution</Label>
                <Input type="number" value={formData.employee_contribution} onChange={e => setFormData({...formData, employee_contribution: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Employer Contribution</Label>
                <Input type="number" value={formData.employer_contribution} onChange={e => setFormData({...formData, employer_contribution: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Contribution Frequency</Label>
                <Select value={formData.contribution_frequency} onValueChange={v => setFormData({...formData, contribution_frequency: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Waiting Period (days)</Label>
                <Input type="number" value={formData.waiting_period_days} onChange={e => setFormData({...formData, waiting_period_days: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingPlan ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
