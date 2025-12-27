import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Plus, Edit, Trash2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  name: string;
}

interface PaymentRule {
  id: string;
  company_id: string;
  shift_id: string | null;
  name: string;
  code: string;
  description: string | null;
  payment_type: string;
  amount: number;
  applies_to: string;
  day_of_week: number[] | null;
  start_time: string | null;
  end_time: string | null;
  minimum_hours_threshold: number | null;
  is_taxable: boolean;
  is_active: boolean;
  priority: number;
  shift?: { name: string } | null;
}

export default function PaymentRulesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rules, setRules] = useState<PaymentRule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentRule | null>(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    shift_id: "",
    payment_type: "percentage",
    amount: 0,
    applies_to: "all_hours",
    day_of_week: [] as number[],
    start_time: "",
    end_time: "",
    minimum_hours_threshold: "",
    is_taxable: true,
    is_active: true,
    priority: 0
  });

  const breadcrumbItems = [
    { label: t("timeAttendance.title"), href: "/time-attendance" },
    { label: t("timeAttendance.modules.shifts.title"), href: "/time-attendance/shifts" },
    { label: t("timeAttendance.shifts.paymentRules") }
  ];

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadData();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    setCompanies(data || []);
    if (data && data.length > 0) {
      setSelectedCompany(data[0].id);
    }
    setLoading(false);
  };

  const loadData = async () => {
    await Promise.all([loadShifts(), loadRules()]);
  };

  const loadShifts = async () => {
    const { data } = await supabase
      .from('shifts')
      .select('id, name')
      .eq('company_id', selectedCompany)
      .eq('is_active', true)
      .order('name');
    setShifts(data || []);
  };

  const loadRules = async () => {
    const { data, error } = await supabase
      .from('shift_payment_rules')
      .select('*, shift:shifts(name)')
      .eq('company_id', selectedCompany)
      .order('priority', { ascending: false });
    
    if (error) {
      console.error("Failed to load payment rules:", error);
      return;
    }
    setRules(data || []);
  };

  const handleSave = async () => {
    if (!form.name || !form.code) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const payload = {
      company_id: selectedCompany,
      name: form.name,
      code: form.code,
      description: form.description || null,
      shift_id: form.shift_id || null,
      payment_type: form.payment_type,
      amount: form.amount,
      applies_to: form.applies_to,
      day_of_week: form.day_of_week.length > 0 ? form.day_of_week : null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      minimum_hours_threshold: form.minimum_hours_threshold ? parseFloat(form.minimum_hours_threshold) : null,
      is_taxable: form.is_taxable,
      is_active: form.is_active,
      priority: form.priority
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('shift_payment_rules').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('shift_payment_rules').insert(payload));
    }

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editing ? t("timeAttendance.shifts.paymentRuleUpdated") : t("timeAttendance.shifts.paymentRuleCreated"));
    setDialogOpen(false);
    resetForm();
    loadRules();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shift_payment_rules').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.paymentRuleDeleted"));
    loadRules();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      code: "",
      description: "",
      shift_id: "",
      payment_type: "percentage",
      amount: 0,
      applies_to: "all_hours",
      day_of_week: [],
      start_time: "",
      end_time: "",
      minimum_hours_threshold: "",
      is_taxable: true,
      is_active: true,
      priority: 0
    });
  };

  const openEdit = (rule: PaymentRule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      code: rule.code,
      description: rule.description || "",
      shift_id: rule.shift_id || "",
      payment_type: rule.payment_type,
      amount: rule.amount,
      applies_to: rule.applies_to,
      day_of_week: rule.day_of_week || [],
      start_time: rule.start_time || "",
      end_time: rule.end_time || "",
      minimum_hours_threshold: rule.minimum_hours_threshold?.toString() || "",
      is_taxable: rule.is_taxable,
      is_active: rule.is_active,
      priority: rule.priority
    });
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("timeAttendance.shifts.paymentRules")}</h1>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-success" />
              <CardTitle>{t("timeAttendance.shifts.paymentRules")}</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("timeAttendance.shifts.createPaymentRule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? t("common.edit") : t("timeAttendance.shifts.createPaymentRule")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("common.name")} *</Label>
                      <Input 
                        value={form.name} 
                        onChange={(e) => setForm({...form, name: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.code")} *</Label>
                      <Input 
                        value={form.code} 
                        onChange={(e) => setForm({...form, code: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.description")}</Label>
                    <Textarea 
                      value={form.description} 
                      onChange={(e) => setForm({...form, description: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("timeAttendance.shifts.applyToShift")}</Label>
                    <Select value={form.shift_id} onValueChange={(v) => setForm({...form, shift_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("timeAttendance.shifts.allShifts")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t("timeAttendance.shifts.allShifts")}</SelectItem>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.paymentType")}</Label>
                      <Select value={form.payment_type} onValueChange={(v) => setForm({...form, payment_type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">{t("timeAttendance.shifts.percentage")}</SelectItem>
                          <SelectItem value="flat_rate">{t("timeAttendance.shifts.flatRate")}</SelectItem>
                          <SelectItem value="multiplier">{t("timeAttendance.shifts.multiplier")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("common.amount")}</Label>
                      <Input 
                        type="number"
                        value={form.amount} 
                        onChange={(e) => setForm({...form, amount: parseFloat(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.appliesTo")}</Label>
                      <Select value={form.applies_to} onValueChange={(v) => setForm({...form, applies_to: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_hours">{t("timeAttendance.shifts.allHours")}</SelectItem>
                          <SelectItem value="overtime">{t("timeAttendance.overtime.title")}</SelectItem>
                          <SelectItem value="night_shift">{t("timeAttendance.shifts.nightShift")}</SelectItem>
                          <SelectItem value="weekend">{t("timeAttendance.shifts.weekend")}</SelectItem>
                          <SelectItem value="holiday">{t("timeAttendance.shifts.holiday")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.priority")}</Label>
                      <Input 
                        type="number"
                        value={form.priority} 
                        onChange={(e) => setForm({...form, priority: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("timeAttendance.shifts.taxable")}</Label>
                      <Switch 
                        checked={form.is_taxable} 
                        onCheckedChange={(v) => setForm({...form, is_taxable: v})} 
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("common.active")}</Label>
                      <Switch 
                        checked={form.is_active} 
                        onCheckedChange={(v) => setForm({...form, is_active: v})} 
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">{t("common.save")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t("timeAttendance.shifts.noPaymentRules")}
                    </TableCell>
                  </TableRow>
                ) : rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.code}</TableCell>
                    <TableCell className="capitalize">{rule.payment_type.replace('_', ' ')}</TableCell>
                    <TableCell>
                      {rule.payment_type === 'percentage' ? `${rule.amount}%` : 
                       rule.payment_type === 'multiplier' ? `${rule.amount}x` : 
                       `$${rule.amount}`}
                    </TableCell>
                    <TableCell>
                      <Badge className={rule.is_active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                        {rule.is_active ? t("common.active") : t("common.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
