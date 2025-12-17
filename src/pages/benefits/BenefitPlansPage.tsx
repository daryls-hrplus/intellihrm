import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useTranslation } from "react-i18next";
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
import { getTodayString } from "@/utils/dateUtils";

interface BenefitPlan {
  id: string;
  category_id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  plan_type: string;
  provider_id: string | null;
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
  benefit_providers?: { name: string };
}

interface BenefitCategory {
  id: string;
  name: string;
  category_type: string;
}

interface BenefitProvider {
  id: string;
  name: string;
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
  const { t } = useTranslation();
  const { isAdmin, hasRole } = useAuth();
  const canManage = isAdmin || hasRole('hr_manager');
  
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [categories, setCategories] = useState<BenefitCategory[]>([]);
  const [providers, setProviders] = useState<BenefitProvider[]>([]);
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
    provider_id: "",
    enrollment_type: "open",
    employee_contribution: 0,
    employee_contribution_type: "amount",
    employer_contribution: 0,
    employer_contribution_type: "amount",
    contribution_frequency: "monthly",
    currency: "USD",
    waiting_period_days: 0,
    is_active: true,
    start_date: getTodayString(),
    end_date: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPlans();
      fetchCategories();
      fetchProviders();
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

  const fetchProviders = async () => {
    const { data } = await supabase.from('benefit_providers').select('id, name').eq('company_id', selectedCompanyId).eq('is_active', true).order('name');
    setProviders(data || []);
  };

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('benefit_plans')
      .select('*, benefit_categories(name), benefit_providers(name)')
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
      provider_id: formData.provider_id || null,
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
      provider_id: "",
      enrollment_type: "open",
      employee_contribution: 0,
      employee_contribution_type: "amount",
      employer_contribution: 0,
      employer_contribution_type: "amount",
      contribution_frequency: "monthly",
      currency: "USD",
      waiting_period_days: 0,
      is_active: true,
      start_date: getTodayString(),
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
      provider_id: plan.provider_id || "",
      enrollment_type: plan.enrollment_type,
      employee_contribution: plan.employee_contribution,
      employee_contribution_type: (plan as any).employee_contribution_type || "amount",
      employer_contribution: plan.employer_contribution,
      employer_contribution_type: (plan as any).employer_contribution_type || "amount",
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
          { label: t("navigation.benefits"), href: "/benefits" },
          { label: t("benefits.plans.title") }
        ]} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("benefits.plans.title")}</h1>
              <p className="text-muted-foreground">{t("benefits.plans.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canManage && (
              <Button onClick={openCreate} disabled={categories.length === 0}>
                <Plus className="h-4 w-4 mr-2" /> {t("benefits.plans.addPlan")}
              </Button>
            )}
          </div>
        </div>

        {categories.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            {t("benefits.plans.noCategoriesWarning")}
          </div>
        )}

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("benefits.plans.name")}</TableHead>
                <TableHead>{t("benefits.plans.category")}</TableHead>
                <TableHead>{t("benefits.plans.type")}</TableHead>
                <TableHead>{t("benefits.plans.enrollment")}</TableHead>
                <TableHead>{t("benefits.plans.employeeContrib")}</TableHead>
                <TableHead>{t("benefits.plans.employerContrib")}</TableHead>
                <TableHead>{t("benefits.plans.status")}</TableHead>
                {canManage && <TableHead className="w-[100px]">{t("common.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8">{t("common.loading")}</TableCell></TableRow>
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">{t("benefits.plans.noPlans")}</TableCell></TableRow>
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
            <DialogTitle>{editingPlan ? t("benefits.plans.editPlan") : t("benefits.plans.newPlan")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.name")} *</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.code")} *</Label>
                <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("benefits.plans.category")} *</Label>
                <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v})}>
                  <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("benefits.plans.planType")} *</Label>
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
                <Label>{t("benefits.plans.provider")}</Label>
                <Select value={formData.provider_id || "none"} onValueChange={v => setFormData({...formData, provider_id: v === "none" ? "" : v})}>
                  <SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("benefits.plans.noProvider")}</SelectItem>
                    {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("benefits.plans.enrollmentType")} *</Label>
                <Select value={formData.enrollment_type} onValueChange={v => setFormData({...formData, enrollment_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ENROLLMENT_TYPES.map(et => <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("common.description")}</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("benefits.plans.employeeContrib")}</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={formData.employee_contribution} 
                    onChange={e => setFormData({...formData, employee_contribution: parseFloat(e.target.value) || 0})} 
                    className="flex-1"
                  />
                  <Select value={formData.employee_contribution_type} onValueChange={v => setFormData({...formData, employee_contribution_type: v})}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">{formData.currency || "$"}</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("benefits.plans.employerContrib")}</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={formData.employer_contribution} 
                    onChange={e => setFormData({...formData, employer_contribution: parseFloat(e.target.value) || 0})} 
                    className="flex-1"
                  />
                  <Select value={formData.employer_contribution_type} onValueChange={v => setFormData({...formData, employer_contribution_type: v})}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amount">{formData.currency || "$"}</SelectItem>
                      <SelectItem value="percentage">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("common.currency")}</Label>
                <Input value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("benefits.plans.contributionFrequency")}</Label>
                <Select value={formData.contribution_frequency} onValueChange={v => setFormData({...formData, contribution_frequency: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("benefits.plans.monthly")}</SelectItem>
                    <SelectItem value="bi-weekly">{t("benefits.plans.biWeekly")}</SelectItem>
                    <SelectItem value="weekly">{t("benefits.plans.weekly")}</SelectItem>
                    <SelectItem value="annually">{t("benefits.plans.annually")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("benefits.plans.waitingPeriod")}</Label>
                <Input type="number" value={formData.waiting_period_days} onChange={e => setFormData({...formData, waiting_period_days: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.startDate")} *</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>{t("common.endDate")}</Label>
                <Input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmit}>{editingPlan ? t("common.update") : t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
