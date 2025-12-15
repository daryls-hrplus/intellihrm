import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Plus, Pencil, Trash2, Loader2, Search, AlertCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface PayElement {
  id: string;
  code: string;
  name: string;
}

interface EmployeeCompensation {
  id: string;
  company_id: string;
  employee_id: string;
  pay_element_id: string;
  amount: number;
  currency: string;
  frequency: string;
  is_override: boolean;
  override_reason: string | null;
  notes: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  employee?: Employee;
  pay_element?: PayElement;
}

export default function EmployeeCompensationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [compensationItems, setCompensationItems] = useState<EmployeeCompensation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeeCompensation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formEmployeeId, setFormEmployeeId] = useState("");
  const [formPayElementId, setFormPayElementId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formIsOverride, setFormIsOverride] = useState(false);
  const [formOverrideReason, setFormOverrideReason] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadEmployees();
      loadPayElements();
      loadCompensationItems();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("company_id", selectedCompanyId)
      .order("full_name");

    if (data) {
      setEmployees(data);
    }
  };

  const loadPayElements = async () => {
    const { data } = await supabase
      .from("pay_elements")
      .select("id, code, name")
      .eq("company_id", selectedCompanyId)
      .eq("is_active", true)
      .order("display_order");

    if (data) {
      setPayElements(data);
    }
  };

  const loadCompensationItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_compensation")
      .select(`
        *,
        employee:profiles!employee_compensation_employee_id_fkey(id, full_name, email),
        pay_element:pay_elements!employee_compensation_pay_element_id_fkey(id, code, name)
      `)
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(t("common.error"));
    } else {
      setCompensationItems((data as EmployeeCompensation[]) || []);
    }
    setIsLoading(false);
  };

  const filteredItems = compensationItems.filter((item) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const employeeName = item.employee?.full_name?.toLowerCase() || "";
    const employeeEmail = item.employee?.email?.toLowerCase() || "";
    const payElementName = item.pay_element?.name?.toLowerCase() || "";
    return employeeName.includes(search) || employeeEmail.includes(search) || payElementName.includes(search);
  });

  const openCreate = () => {
    setEditing(null);
    setFormEmployeeId("");
    setFormPayElementId("");
    setFormAmount("");
    setFormCurrency("USD");
    setFormFrequency("monthly");
    setFormIsOverride(false);
    setFormOverrideReason("");
    setFormNotes("");
    setFormStartDate(new Date().toISOString().split("T")[0]);
    setFormEndDate("");
    setFormIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (item: EmployeeCompensation) => {
    setEditing(item);
    setFormEmployeeId(item.employee_id);
    setFormPayElementId(item.pay_element_id);
    setFormAmount(item.amount.toString());
    setFormCurrency(item.currency);
    setFormFrequency(item.frequency);
    setFormIsOverride(item.is_override);
    setFormOverrideReason(item.override_reason || "");
    setFormNotes(item.notes || "");
    setFormStartDate(item.start_date);
    setFormEndDate(item.end_date || "");
    setFormIsActive(item.is_active);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formEmployeeId || !formPayElementId || !formAmount) {
      toast.error(t("compensation.employeeCompensation.validation.required"));
      return;
    }

    setIsProcessing(true);
    const data = {
      company_id: selectedCompanyId,
      employee_id: formEmployeeId,
      pay_element_id: formPayElementId,
      amount: parseFloat(formAmount),
      currency: formCurrency,
      frequency: formFrequency,
      is_override: formIsOverride,
      override_reason: formIsOverride ? formOverrideReason.trim() || null : null,
      notes: formNotes.trim() || null,
      start_date: formStartDate,
      end_date: formEndDate || null,
      is_active: formIsActive,
      updated_by: user?.id,
    };

    let error;
    if (editing) {
      const { error: updateError } = await supabase
        .from("employee_compensation")
        .update(data)
        .eq("id", editing.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("employee_compensation")
        .insert({ ...data, created_by: user?.id });
      error = insertError;
    }

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(editing ? t("common.updated") : t("common.created"));
      setDialogOpen(false);
      loadCompensationItems();
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("compensation.employeeCompensation.deleteConfirm"))) return;
    
    const { error } = await supabase
      .from("employee_compensation")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("common.deleted"));
      loadCompensationItems();
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const frequencyOptions = [
    { value: "monthly", label: t("compensation.employeeCompensation.frequency.monthly") },
    { value: "annual", label: t("compensation.employeeCompensation.frequency.annual") },
    { value: "weekly", label: t("compensation.employeeCompensation.frequency.weekly") },
    { value: "bi-weekly", label: t("compensation.employeeCompensation.frequency.biWeekly") },
    { value: "one-time", label: t("compensation.employeeCompensation.frequency.oneTime") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("compensation.title"), href: "/compensation" },
            { label: t("compensation.employeeCompensation.title") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("compensation.employeeCompensation.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("compensation.employeeCompensation.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("common.selectCompany")} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t("compensation.employeeCompensation.add")}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t("compensation.employeeCompensation.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t("compensation.employeeCompensation.noItems")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("compensation.employeeCompensation.employee")}</TableHead>
                    <TableHead>{t("compensation.employeeCompensation.payElement")}</TableHead>
                    <TableHead className="text-right">{t("compensation.employeeCompensation.amount")}</TableHead>
                    <TableHead>{t("compensation.employeeCompensation.frequencyLabel")}</TableHead>
                    <TableHead>{t("compensation.employeeCompensation.effectiveDates")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-right">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.employee?.full_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.employee?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{item.pay_element?.name}</span>
                          {item.is_override && (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {t("compensation.employeeCompensation.override")}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatAmount(item.amount, item.currency)}
                      </TableCell>
                      <TableCell className="capitalize">{item.frequency}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {item.start_date} → {item.end_date || t("common.present")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_active ? "default" : "secondary"}>
                          {item.is_active ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? t("compensation.employeeCompensation.dialog.editTitle")
                  : t("compensation.employeeCompensation.dialog.createTitle")}
              </DialogTitle>
              <DialogDescription>
                {t("compensation.employeeCompensation.dialog.description")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("compensation.employeeCompensation.employee")} *</Label>
                <Select value={formEmployeeId} onValueChange={setFormEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("compensation.employeeCompensation.dialog.selectEmployee")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.full_name} ({e.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("compensation.employeeCompensation.payElement")} *</Label>
                <Select value={formPayElementId} onValueChange={setFormPayElementId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("compensation.employeeCompensation.dialog.selectPayElement")} />
                  </SelectTrigger>
                  <SelectContent>
                    {payElements.map((pe) => (
                      <SelectItem key={pe.id} value={pe.id}>
                        {pe.name} ({pe.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("compensation.employeeCompensation.amount")} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("compensation.employeeCompensation.currency")}</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="AUD">AUD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("compensation.employeeCompensation.frequencyLabel")}</Label>
                  <Select value={formFrequency} onValueChange={setFormFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("common.startDate")} *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("common.endDate")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isOverride"
                  checked={formIsOverride}
                  onCheckedChange={setFormIsOverride}
                />
                <Label htmlFor="isOverride">{t("compensation.employeeCompensation.dialog.isOverride")}</Label>
              </div>

              {formIsOverride && (
                <div className="space-y-2">
                  <Label htmlFor="overrideReason">{t("compensation.employeeCompensation.dialog.overrideReason")}</Label>
                  <Input
                    id="overrideReason"
                    value={formOverrideReason}
                    onChange={(e) => setFormOverrideReason(e.target.value)}
                    placeholder={t("compensation.employeeCompensation.dialog.overrideReasonPlaceholder")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Textarea
                  id="notes"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="isActive">{t("common.active")}</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editing ? t("common.update") : t("common.create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
