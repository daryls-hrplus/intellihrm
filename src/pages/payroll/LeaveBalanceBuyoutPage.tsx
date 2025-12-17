import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Upload, FileText, Check, X, DollarSign } from "lucide-react";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { useCurrencies, formatCurrency } from "@/hooks/useCurrencies";

interface LeaveBuyout {
  id: string;
  company_id: string;
  employee_id: string;
  leave_type_id: string;
  leave_days_bought: number;
  buyout_rate: number;
  daily_rate_amount: number;
  total_buyout_amount: number;
  currency_id: string | null;
  agreement_date: string;
  transaction_date: string;
  pay_group_id: string | null;
  pay_period_id: string | null;
  agreement_document_url: string | null;
  agreement_document_name: string | null;
  status: string;
  notes: string | null;
  employee?: { full_name: string };
  leave_type?: { name: string };
  pay_group?: { name: string };
  pay_period?: { period_number: string; period_start: string; period_end: string };
  currency?: { code: string; symbol: string };
}

interface Employee {
  id: string;
  full_name: string;
  pay_group_id?: string;
}

interface LeaveType {
  id: string;
  name: string;
}

interface PayGroup {
  id: string;
  name: string;
  company_id: string;
}

interface PayPeriod {
  id: string;
  period_number: string;
  period_start: string;
  period_end: string;
}

export default function LeaveBalanceBuyoutPage() {
  const { t } = useTranslation();
  const { currencies } = useCurrencies();
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [buyouts, setBuyouts] = useState<LeaveBuyout[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [payGroups, setPayGroups] = useState<PayGroup[]>([]);
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuyout, setEditingBuyout] = useState<LeaveBuyout | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    leave_days_bought: "",
    buyout_rate: "1",
    daily_rate_amount: "",
    currency_id: "",
    agreement_date: getTodayString(),
    transaction_date: getTodayString(),
    pay_group_id: "",
    pay_period_id: "",
    agreement_document_url: "",
    agreement_document_name: "",
    notes: ""
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchBuyouts();
      fetchEmployees();
      fetchLeaveTypes();
      fetchPayGroups();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (formData.pay_group_id) {
      fetchPayPeriods(formData.pay_group_id);
    }
  }, [formData.pay_group_id]);

  useEffect(() => {
    // Auto-select pay period based on transaction date
    if (formData.transaction_date && payPeriods.length > 0) {
      const transactionDate = new Date(formData.transaction_date);
      const matchingPeriod = payPeriods.find(p => {
        const periodStart = new Date(p.period_start);
        const periodEnd = new Date(p.period_end);
        return transactionDate >= periodStart && transactionDate <= periodEnd;
      }) || payPeriods.find(p => new Date(p.period_start) >= transactionDate);
      
      if (matchingPeriod) {
        setFormData(prev => ({ ...prev, pay_period_id: matchingPeriod.id }));
      }
    }
  }, [formData.transaction_date, payPeriods]);

  useEffect(() => {
    // Calculate total amount
    const days = parseFloat(formData.leave_days_bought) || 0;
    const rate = parseFloat(formData.buyout_rate) || 1;
    const dailyAmount = parseFloat(formData.daily_rate_amount) || 0;
    const total = days * rate * dailyAmount;
    // This is just for display, actual calculation done on save
  }, [formData.leave_days_bought, formData.buyout_rate, formData.daily_rate_amount]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0].id);
      }
    }
  };

  const fetchBuyouts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("leave_balance_buyouts")
      .select(`
        *,
        employee:profiles!leave_balance_buyouts_employee_id_fkey(full_name),
        leave_type:leave_types(name),
        pay_group:pay_groups(name),
        pay_period:pay_periods(period_number, period_start, period_end),
        currency:currencies(code, symbol)
      ` as any)
      .eq("company_id", selectedCompany)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setBuyouts((data as any) || []);
    }
    setIsLoading(false);
  };

  const fetchEmployees = async () => {
    const { data } = await (supabase
      .from("profiles" as any)
      .select("id, full_name")
      .eq("company_id", selectedCompany)
      .eq("is_active", true)
      .order("full_name"));
    if (data) setEmployees(data as unknown as Employee[]);
  };

  const fetchLeaveTypes = async () => {
    const { data, error } = await supabase
      .from("leave_types")
      .select("id, name")
      .eq("company_id", selectedCompany)
      .eq("is_active", true)
      .order("name");
    if (!error && data) setLeaveTypes(data as LeaveType[]);
  };

  const fetchPayGroups = async () => {
    const { data, error } = await supabase
      .from("pay_groups")
      .select("id, name, company_id")
      .eq("company_id", selectedCompany)
      .eq("is_active", true)
      .order("name");
    if (!error && data) setPayGroups(data as PayGroup[]);
  };

  const fetchPayPeriods = async (payGroupId: string) => {
    const { data, error } = await supabase
      .from("pay_periods")
      .select("id, period_number, period_start, period_end")
      .eq("pay_group_id", payGroupId)
      .gte("period_end", getTodayString())
      .order("period_start");
    if (!error && data) setPayPeriods(data as PayPeriod[]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${selectedCompany}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("leave-buyout-agreements")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage
        .from("leave-buyout-agreements")
        .getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        agreement_document_url: filePath,
        agreement_document_name: file.name
      }));
      toast({ title: "Document uploaded successfully" });
    }
    setUploadingFile(false);
  };

  const calculateTotal = () => {
    const days = parseFloat(formData.leave_days_bought) || 0;
    const rate = parseFloat(formData.buyout_rate) || 1;
    const dailyAmount = parseFloat(formData.daily_rate_amount) || 0;
    return days * rate * dailyAmount;
  };

  const handleSave = async () => {
    if (!formData.employee_id || !formData.leave_type_id || !formData.leave_days_bought || !formData.daily_rate_amount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const total = calculateTotal();
    const payload = {
      company_id: selectedCompany,
      employee_id: formData.employee_id,
      leave_type_id: formData.leave_type_id,
      leave_days_bought: parseFloat(formData.leave_days_bought),
      buyout_rate: parseFloat(formData.buyout_rate) || 1,
      daily_rate_amount: parseFloat(formData.daily_rate_amount),
      total_buyout_amount: total,
      currency_id: formData.currency_id || null,
      agreement_date: formData.agreement_date,
      transaction_date: formData.transaction_date,
      pay_group_id: formData.pay_group_id || null,
      pay_period_id: formData.pay_period_id || null,
      agreement_document_url: formData.agreement_document_url || null,
      agreement_document_name: formData.agreement_document_name || null,
      notes: formData.notes || null
    };

    let error;
    if (editingBuyout) {
      ({ error } = await supabase
        .from("leave_balance_buyouts")
        .update(payload)
        .eq("id", editingBuyout.id));
    } else {
      ({ error } = await supabase
        .from("leave_balance_buyouts")
        .insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingBuyout ? "Buyout updated" : "Buyout created" });
      setIsDialogOpen(false);
      resetForm();
      fetchBuyouts();
    }
  };

  const handleEdit = (buyout: LeaveBuyout) => {
    setEditingBuyout(buyout);
    setFormData({
      employee_id: buyout.employee_id,
      leave_type_id: buyout.leave_type_id,
      leave_days_bought: buyout.leave_days_bought.toString(),
      buyout_rate: buyout.buyout_rate.toString(),
      daily_rate_amount: buyout.daily_rate_amount.toString(),
      currency_id: buyout.currency_id || "",
      agreement_date: buyout.agreement_date,
      transaction_date: buyout.transaction_date,
      pay_group_id: buyout.pay_group_id || "",
      pay_period_id: buyout.pay_period_id || "",
      agreement_document_url: buyout.agreement_document_url || "",
      agreement_document_name: buyout.agreement_document_name || "",
      notes: buyout.notes || ""
    });
    if (buyout.pay_group_id) {
      fetchPayPeriods(buyout.pay_group_id);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this buyout?")) return;
    
    const { error } = await supabase
      .from("leave_balance_buyouts")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Buyout deleted" });
      fetchBuyouts();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "approved") {
      updates.approved_at = new Date().toISOString();
    } else if (newStatus === "paid") {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("leave_balance_buyouts")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Status updated to ${newStatus}` });
      fetchBuyouts();
    }
  };

  const resetForm = () => {
    setEditingBuyout(null);
    setFormData({
      employee_id: "",
      leave_type_id: "",
      leave_days_bought: "",
      buyout_rate: "1",
      daily_rate_amount: "",
      currency_id: "",
      agreement_date: getTodayString(),
      transaction_date: getTodayString(),
      pay_group_id: "",
      pay_period_id: "",
      agreement_document_url: "",
      agreement_document_name: "",
      notes: ""
    });
    setPayPeriods([]);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      paid: "outline",
      cancelled: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("payroll.leaveBuyout.title", "Leave Balance Buyout")}</h1>
          <p className="text-muted-foreground">{t("payroll.leaveBuyout.description", "Manage leave balance buyout agreements")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t("common.add", "Add Buyout")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("payroll.leaveBuyout.list", "Buyout Transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : buyouts.length === 0 ? (
            <p className="text-muted-foreground">No buyout transactions found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.employee", "Employee")}</TableHead>
                  <TableHead>{t("leave.leaveType", "Leave Type")}</TableHead>
                  <TableHead>{t("payroll.leaveBuyout.days", "Days")}</TableHead>
                  <TableHead>{t("payroll.leaveBuyout.rate", "Rate")}</TableHead>
                  <TableHead>{t("payroll.leaveBuyout.total", "Total Amount")}</TableHead>
                  <TableHead>{t("payroll.leaveBuyout.agreementDate", "Agreement Date")}</TableHead>
                  <TableHead>{t("payroll.leaveBuyout.transactionDate", "Transaction Date")}</TableHead>
                  <TableHead>{t("payroll.leaveBuyout.payPeriod", "Pay Period")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead>{t("common.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buyouts.map(buyout => (
                  <TableRow key={buyout.id}>
                    <TableCell>{buyout.employee?.full_name}</TableCell>
                    <TableCell>{buyout.leave_type?.name}</TableCell>
                    <TableCell>{buyout.leave_days_bought}</TableCell>
                    <TableCell>{(buyout.buyout_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell>
                      {buyout.currency?.symbol || "$"}{buyout.total_buyout_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDateForDisplay(buyout.agreement_date, "MMM dd, yyyy")}</TableCell>
                    <TableCell>{formatDateForDisplay(buyout.transaction_date, "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      {buyout.pay_period ? (
                        <span className="text-sm">
                          {buyout.pay_period.period_number}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(buyout.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {buyout.agreement_document_url && (
                          <Button variant="ghost" size="icon" title="View Agreement">
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {buyout.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(buyout.id, "approved")}
                            title="Approve"
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {buyout.status === "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStatusChange(buyout.id, "paid")}
                            title="Mark as Paid"
                          >
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(buyout)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(buyout.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBuyout ? t("payroll.leaveBuyout.edit", "Edit Buyout") : t("payroll.leaveBuyout.create", "Create Leave Buyout")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>{t("common.employee", "Employee")} *</Label>
              <Select value={formData.employee_id} onValueChange={v => setFormData(p => ({ ...p, employee_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("leave.leaveType", "Leave Type")} *</Label>
              <Select value={formData.leave_type_id} onValueChange={v => setFormData(p => ({ ...p, leave_type_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(lt => (
                    <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.leaveBuyout.days", "Days to Buy Out")} *</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.leave_days_bought}
                onChange={e => setFormData(p => ({ ...p, leave_days_bought: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.leaveBuyout.rate", "Buyout Rate")} (0-1)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.buyout_rate}
                onChange={e => setFormData(p => ({ ...p, buyout_rate: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">1 = 100%, 0.75 = 75%</p>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.leaveBuyout.dailyRate", "Daily Rate Amount")} *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.daily_rate_amount}
                onChange={e => setFormData(p => ({ ...p, daily_rate_amount: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("common.currency", "Currency")}</Label>
              <Select value={formData.currency_id} onValueChange={v => setFormData(p => ({ ...p, currency_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.leaveBuyout.agreementDate", "Agreement Date")} *</Label>
              <Input
                type="date"
                value={formData.agreement_date}
                onChange={e => setFormData(p => ({ ...p, agreement_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.leaveBuyout.transactionDate", "Transaction Date")} *</Label>
              <Input
                type="date"
                value={formData.transaction_date}
                onChange={e => setFormData(p => ({ ...p, transaction_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.payGroup", "Pay Group")}</Label>
              <Select value={formData.pay_group_id} onValueChange={v => setFormData(p => ({ ...p, pay_group_id: v, pay_period_id: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pay group" />
                </SelectTrigger>
                <SelectContent>
                  {payGroups.map(pg => (
                    <SelectItem key={pg.id} value={pg.id}>{pg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("payroll.leaveBuyout.payPeriod", "Pay Period")}</Label>
              <Select 
                value={formData.pay_period_id} 
                onValueChange={v => setFormData(p => ({ ...p, pay_period_id: v }))}
                disabled={!formData.pay_group_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-selected from transaction date" />
                </SelectTrigger>
                <SelectContent>
                  {payPeriods.map(pp => (
                    <SelectItem key={pp.id} value={pp.id}>
                      {pp.period_number} ({formatDateForDisplay(pp.period_start, "MMM dd")} - {formatDateForDisplay(pp.period_end, "MMM dd")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>{t("payroll.leaveBuyout.agreement", "Agreement Document")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="flex-1"
                />
                {formData.agreement_document_name && (
                  <span className="text-sm text-muted-foreground">{formData.agreement_document_name}</span>
                )}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>{t("common.notes", "Notes")}</Label>
              <Textarea
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="col-span-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("payroll.leaveBuyout.totalAmount", "Total Buyout Amount")}:</span>
                <span className="text-xl font-bold">
                  {currencies.find(c => c.id === formData.currency_id)?.symbol || "$"}
                  {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.leave_days_bought || 0} days × {((parseFloat(formData.buyout_rate) || 1) * 100).toFixed(0)}% × {formData.daily_rate_amount || 0} daily rate
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={handleSave}>
              {editingBuyout ? t("common.save", "Save") : t("common.create", "Create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
