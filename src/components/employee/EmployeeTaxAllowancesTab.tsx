import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface TaxAllowance {
  id: string;
  allowance_name: string;
  allowance_code: string | null;
  description: string | null;
  instances_count: number;
  amount_per_instance: number;
  annual_limit: number | null;
  effective_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
}

interface EmployeeTaxAllowancesTabProps {
  employeeId: string;
  companyId?: string;
}

export function EmployeeTaxAllowancesTab({ employeeId, companyId }: EmployeeTaxAllowancesTabProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [allowances, setAllowances] = useState<TaxAllowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string | null>(companyId || null);

  const [form, setForm] = useState({
    allowance_name: "",
    allowance_code: "",
    description: "",
    instances_count: 1,
    amount_per_instance: 0,
    annual_limit: "",
    effective_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    fetchAllowances();
    if (!companyId) {
      fetchEmployeeCompany();
    }
  }, [employeeId, companyId]);

  const fetchEmployeeCompany = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", employeeId)
      .single();
    if (data?.company_id) {
      setResolvedCompanyId(data.company_id);
    }
  };

  const fetchAllowances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employee_tax_allowances")
      .select("*")
      .eq("employee_id", employeeId)
      .order("effective_date", { ascending: false });

    if (error) {
      console.error("Error fetching tax allowances:", error);
    } else {
      setAllowances(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      allowance_name: "",
      allowance_code: "",
      description: "",
      instances_count: 1,
      amount_per_instance: 0,
      annual_limit: "",
      effective_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      is_active: true,
      notes: "",
    });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (allowance: TaxAllowance) => {
    setForm({
      allowance_name: allowance.allowance_name,
      allowance_code: allowance.allowance_code || "",
      description: allowance.description || "",
      instances_count: allowance.instances_count,
      amount_per_instance: allowance.amount_per_instance,
      annual_limit: allowance.annual_limit?.toString() || "",
      effective_date: allowance.effective_date,
      end_date: allowance.end_date || "",
      is_active: allowance.is_active,
      notes: allowance.notes || "",
    });
    setEditingId(allowance.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.allowance_name.trim()) {
      toast({ title: "Error", description: "Allowance name is required", variant: "destructive" });
      return;
    }
    if (!resolvedCompanyId) {
      toast({ title: "Error", description: "Company not found for this employee", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload = {
      employee_id: employeeId,
      company_id: resolvedCompanyId,
      allowance_name: form.allowance_name.trim(),
      allowance_code: form.allowance_code.trim() || null,
      description: form.description.trim() || null,
      instances_count: form.instances_count,
      amount_per_instance: form.amount_per_instance,
      annual_limit: form.annual_limit ? parseFloat(form.annual_limit) : null,
      effective_date: form.effective_date,
      end_date: form.end_date || null,
      is_active: form.is_active,
      notes: form.notes.trim() || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("employee_tax_allowances").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("employee_tax_allowances").insert(payload));
    }

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: editingId ? "Tax allowance updated" : "Tax allowance added" });
      setDialogOpen(false);
      fetchAllowances();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tax allowance?")) return;

    const { error } = await supabase.from("employee_tax_allowances").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Tax allowance deleted" });
      fetchAllowances();
    }
  };

  const calculateAnnualAmount = (instances: number, amount: number, limit: number | null) => {
    const total = instances * amount;
    return limit !== null ? Math.min(total, limit) : total;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          {t("payroll.taxAllowances.title", "Tax Allowances")}
        </CardTitle>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t("common.add", "Add")}
        </Button>
      </CardHeader>
      <CardContent>
        {allowances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("payroll.taxAllowances.noAllowances", "No tax allowances recorded")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("payroll.taxAllowances.name", "Allowance Name")}</TableHead>
                <TableHead>{t("payroll.taxAllowances.code", "Code")}</TableHead>
                <TableHead className="text-center">{t("payroll.taxAllowances.instances", "Instances")}</TableHead>
                <TableHead className="text-right">{t("payroll.taxAllowances.amountPerInstance", "Amount/Instance")}</TableHead>
                <TableHead className="text-right">{t("payroll.taxAllowances.annualTotal", "Annual Total")}</TableHead>
                <TableHead>{t("payroll.taxAllowances.effectiveDate", "Effective")}</TableHead>
                <TableHead>{t("common.status", "Status")}</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowances.map((allowance) => (
                <TableRow key={allowance.id}>
                  <TableCell className="font-medium">{allowance.allowance_name}</TableCell>
                  <TableCell>{allowance.allowance_code || "-"}</TableCell>
                  <TableCell className="text-center">{allowance.instances_count}</TableCell>
                  <TableCell className="text-right">
                    ${allowance.amount_per_instance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ${calculateAnnualAmount(allowance.instances_count, allowance.amount_per_instance, allowance.annual_limit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    {allowance.annual_limit && (
                      <span className="text-xs text-muted-foreground ml-1">(capped)</span>
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(allowance.effective_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={allowance.is_active ? "default" : "secondary"}>
                      {allowance.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(allowance)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(allowance.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t("payroll.taxAllowances.edit", "Edit Tax Allowance") : t("payroll.taxAllowances.add", "Add Tax Allowance")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.name", "Allowance Name")} *</Label>
                <Input
                  value={form.allowance_name}
                  onChange={(e) => setForm({ ...form, allowance_name: e.target.value })}
                  placeholder="e.g., Child Allowance"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.code", "Code")}</Label>
                <Input
                  value={form.allowance_code}
                  onChange={(e) => setForm({ ...form, allowance_code: e.target.value })}
                  placeholder="e.g., CHILD_ALW"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.taxAllowances.description", "Description")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the allowance..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.instances", "Instances")} *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.instances_count}
                  onChange={(e) => setForm({ ...form, instances_count: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">e.g., number of children</p>
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.amountPerInstance", "Amount/Instance")} *</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount_per_instance}
                  onChange={(e) => setForm({ ...form, amount_per_instance: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.annualLimit", "Annual Limit")}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.annual_limit}
                  onChange={(e) => setForm({ ...form, annual_limit: e.target.value })}
                  placeholder="No limit"
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">
                {t("payroll.taxAllowances.calculatedAnnual", "Calculated Annual Deduction")}:
                <span className="ml-2 text-primary">
                  ${calculateAnnualAmount(
                    form.instances_count,
                    form.amount_per_instance,
                    form.annual_limit ? parseFloat(form.annual_limit) : null
                  ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.effectiveDate", "Effective Date")} *</Label>
                <Input
                  type="date"
                  value={form.effective_date}
                  onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("payroll.taxAllowances.endDate", "End Date")}</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("common.notes", "Notes")}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
              <Label>{t("common.active", "Active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common.save", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
