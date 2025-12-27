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
import { Timer, Plus, Edit, Trash2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface Shift {
  id: string;
  name: string;
}

interface RoundingRule {
  id: string;
  company_id: string;
  shift_id: string | null;
  name: string;
  description: string | null;
  rule_type: string;
  rounding_interval: number;
  rounding_direction: string;
  grace_period_minutes: number;
  grace_period_direction: string | null;
  apply_to_overtime: boolean;
  is_active: boolean;
  shift?: { name: string } | null;
}

export default function RoundingRulesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rules, setRules] = useState<RoundingRule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RoundingRule | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    shift_id: "",
    rule_type: "both",
    rounding_interval: 15,
    rounding_direction: "nearest",
    grace_period_minutes: 5,
    grace_period_direction: "both",
    apply_to_overtime: true,
    is_active: true
  });

  const breadcrumbItems = [
    { label: t("timeAttendance.title"), href: "/time-attendance" },
    { label: t("timeAttendance.modules.shifts.title"), href: "/time-attendance/shifts" },
    { label: t("timeAttendance.shifts.roundingRules") }
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
      .from('shift_rounding_rules')
      .select('*, shift:shifts(name)')
      .eq('company_id', selectedCompany)
      .order('name');
    
    if (error) {
      console.error("Failed to load rounding rules:", error);
      return;
    }
    setRules(data || []);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error(t("common.fillRequired"));
      return;
    }

    const payload = {
      company_id: selectedCompany,
      name: form.name,
      description: form.description || null,
      shift_id: form.shift_id || null,
      rule_type: form.rule_type,
      rounding_interval: form.rounding_interval,
      rounding_direction: form.rounding_direction,
      grace_period_minutes: form.grace_period_minutes,
      grace_period_direction: form.grace_period_direction || null,
      apply_to_overtime: form.apply_to_overtime,
      is_active: form.is_active
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from('shift_rounding_rules').update(payload).eq('id', editing.id));
    } else {
      ({ error } = await supabase.from('shift_rounding_rules').insert(payload));
    }

    if (error) {
      toast.error(t("common.error"));
      console.error(error);
      return;
    }

    toast.success(editing ? t("timeAttendance.shifts.roundingRuleUpdated") : t("timeAttendance.shifts.roundingRuleCreated"));
    setDialogOpen(false);
    resetForm();
    loadRules();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('shift_rounding_rules').delete().eq('id', id);
    if (error) {
      toast.error(t("common.error"));
      return;
    }
    toast.success(t("timeAttendance.shifts.roundingRuleDeleted"));
    loadRules();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      description: "",
      shift_id: "",
      rule_type: "both",
      rounding_interval: 15,
      rounding_direction: "nearest",
      grace_period_minutes: 5,
      grace_period_direction: "both",
      apply_to_overtime: true,
      is_active: true
    });
  };

  const openEdit = (rule: RoundingRule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      description: rule.description || "",
      shift_id: rule.shift_id || "",
      rule_type: rule.rule_type,
      rounding_interval: rule.rounding_interval,
      rounding_direction: rule.rounding_direction,
      grace_period_minutes: rule.grace_period_minutes,
      grace_period_direction: rule.grace_period_direction || "both",
      apply_to_overtime: rule.apply_to_overtime,
      is_active: rule.is_active
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
          <h1 className="text-2xl font-bold">{t("timeAttendance.shifts.roundingRules")}</h1>
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
              <Timer className="h-5 w-5 text-secondary" />
              <CardTitle>{t("timeAttendance.shifts.roundingRules")}</CardTitle>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("timeAttendance.shifts.createRoundingRule")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? t("common.edit") : t("timeAttendance.shifts.createRoundingRule")}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-2">
                    <Label>{t("common.name")} *</Label>
                    <Input 
                      value={form.name} 
                      onChange={(e) => setForm({...form, name: e.target.value})} 
                    />
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
                      <Label>{t("timeAttendance.shifts.ruleType")}</Label>
                      <Select value={form.rule_type} onValueChange={(v) => setForm({...form, rule_type: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clock_in">{t("timeAttendance.shifts.clockIn")}</SelectItem>
                          <SelectItem value="clock_out">{t("timeAttendance.shifts.clockOut")}</SelectItem>
                          <SelectItem value="both">{t("common.both")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.roundingInterval")}</Label>
                      <Select value={form.rounding_interval.toString()} onValueChange={(v) => setForm({...form, rounding_interval: parseInt(v)})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 min</SelectItem>
                          <SelectItem value="6">6 min</SelectItem>
                          <SelectItem value="10">10 min</SelectItem>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.roundingDirection")}</Label>
                      <Select value={form.rounding_direction} onValueChange={(v) => setForm({...form, rounding_direction: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">{t("timeAttendance.shifts.roundUp")}</SelectItem>
                          <SelectItem value="down">{t("timeAttendance.shifts.roundDown")}</SelectItem>
                          <SelectItem value="nearest">{t("timeAttendance.shifts.roundNearest")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("timeAttendance.shifts.gracePeriod")}</Label>
                      <Input 
                        type="number"
                        value={form.grace_period_minutes} 
                        onChange={(e) => setForm({...form, grace_period_minutes: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label>{t("timeAttendance.shifts.applyToOvertime")}</Label>
                      <Switch 
                        checked={form.apply_to_overtime} 
                        onCheckedChange={(v) => setForm({...form, apply_to_overtime: v})} 
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
                  <TableHead>{t("timeAttendance.shifts.shift")}</TableHead>
                  <TableHead>{t("timeAttendance.shifts.interval")}</TableHead>
                  <TableHead>{t("timeAttendance.shifts.direction")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t("timeAttendance.shifts.noRoundingRules")}
                    </TableCell>
                  </TableRow>
                ) : rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.shift?.name || t("timeAttendance.shifts.allShifts")}</TableCell>
                    <TableCell>{rule.rounding_interval} min</TableCell>
                    <TableCell className="capitalize">{rule.rounding_direction}</TableCell>
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
