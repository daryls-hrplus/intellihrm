import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, Receipt, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface TaxAllowance {
  id: string;
  employee_id: string;
  company_id: string;
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
  employee_name?: string;
}

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

export default function TaxAllowancesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [allowances, setAllowances] = useState<TaxAllowance[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    employee_id: "",
    allowance_name: "",
    allowance_code: "",
    description: "",
    instances_count: 1,
    amount_per_instance: 0,
    annual_limit: "",
    effective_date: getTodayString(),
    end_date: "",
    is_active: true,
    notes: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchAllowances();
      fetchEmployees();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(data || []);
    if (data && data.length > 0 && !selectedCompany) {
      setSelectedCompany(data[0].id);
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("company_id", selectedCompany)
      .eq("is_active", true)
      .order("full_name");
    setEmployees(data || []);
  };

  const fetchAllowances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employee_tax_allowances")
      .select(`
        *,
        profiles:employee_id (full_name)
      `)
      .eq("company_id", selectedCompany)
      .order("effective_date", { ascending: false });

    if (error) {
      console.error("Error fetching tax allowances:", error);
    } else {
      setAllowances(
        (data || []).map((a: any) => ({
          ...a,
          employee_name: a.profiles?.full_name || "Unknown",
        }))
      );
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      employee_id: "",
      allowance_name: "",
      allowance_code: "",
      description: "",
      instances_count: 1,
      amount_per_instance: 0,
      annual_limit: "",
      effective_date: getTodayString(),
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
      employee_id: allowance.employee_id,
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
    if (!form.employee_id) {
      toast({ title: "Error", description: "Please select an employee", variant: "destructive" });
      return;
    }
    if (!form.allowance_name.trim()) {
      toast({ title: "Error", description: "Allowance name is required", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload = {
      employee_id: form.employee_id,
      company_id: selectedCompany,
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

  const filteredAllowances = allowances.filter(
    (a) =>
      a.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.allowance_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.allowance_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totalAnnualDeductions = filteredAllowances
    .filter((a) => a.is_active)
    .reduce((sum, a) => sum + calculateAnnualAmount(a.instances_count, a.amount_per_instance, a.annual_limit), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.payroll", "Payroll"), href: "/payroll" },
            { label: t("payroll.taxAllowances.title", "Tax Allowances") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("payroll.taxAllowances.title", "Employee Tax Allowances")}
              </h1>
              <p className="text-muted-foreground">
                {t("payroll.taxAllowances.subtitle", "Manage non-taxable allowances to reduce employee tax burden")}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} disabled={!selectedCompany}>
            <Plus className="h-4 w-4 mr-2" />
            {t("payroll.taxAllowances.add", "Add Allowance")}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="w-64">
                <Label>{t("common.company", "Company")}</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-64">
                <Label>{t("common.search", "Search")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by employee or allowance..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.taxAllowances.totalActive", "Active Allowances")}</p>
                <p className="text-xl font-semibold">{filteredAllowances.filter((a) => a.is_active).length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.taxAllowances.employeesWithAllowances", "Employees with Allowances")}</p>
                <p className="text-xl font-semibold">
                  {new Set(filteredAllowances.filter((a) => a.is_active).map((a) => a.employee_id)).size}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Receipt className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("payroll.taxAllowances.totalAnnualDeductions", "Total Annual Deductions")}</p>
                <p className="text-xl font-semibold">${totalAnnualDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Allowances Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("payroll.taxAllowances.allAllowances", "All Tax Allowances")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredAllowances.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm
                  ? t("payroll.taxAllowances.noResults", "No matching allowances found")
                  : t("payroll.taxAllowances.noAllowances", "No tax allowances recorded")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.employee", "Employee")}</TableHead>
                    <TableHead>{t("payroll.taxAllowances.name", "Allowance")}</TableHead>
                    <TableHead>{t("payroll.taxAllowances.code", "Code")}</TableHead>
                    <TableHead className="text-center">{t("payroll.taxAllowances.instances", "Instances")}</TableHead>
                    <TableHead className="text-right">{t("payroll.taxAllowances.amountPerInstance", "Per Instance")}</TableHead>
                    <TableHead className="text-right">{t("payroll.taxAllowances.annualTotal", "Annual")}</TableHead>
                    <TableHead>{t("payroll.taxAllowances.effectiveDate", "Effective")}</TableHead>
                    <TableHead>{t("common.status", "Status")}</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllowances.map((allowance) => (
                    <TableRow key={allowance.id}>
                      <TableCell className="font-medium">{allowance.employee_name}</TableCell>
                      <TableCell>{allowance.allowance_name}</TableCell>
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
                      <TableCell>{formatDateForDisplay(allowance.effective_date, "MMM d, yyyy")}</TableCell>
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
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId
                ? t("payroll.taxAllowances.edit", "Edit Tax Allowance")
                : t("payroll.taxAllowances.add", "Add Tax Allowance")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("common.employee", "Employee")} *</Label>
              <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
    </AppLayout>
  );
}
