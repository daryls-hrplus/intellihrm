import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { DepartmentFilter, useDepartmentFilter } from "@/components/filters/DepartmentFilter";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, CalendarDays, Settings, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface Employee {
  id: string;
  full_name: string;
  email: string;
}

interface LeaveType {
  id: string;
  name: string;
  color: string;
}

interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  current_balance: number;
  adjustment_amount: number;
  year: number;
  employee?: Employee;
  leave_type?: LeaveType;
}

interface Adjustment {
  id: string;
  balance_id: string;
  adjustment_type: string;
  amount: number;
  reason: string;
  effective_date: string;
  created_at: string;
  adjusted_by: string;
  adjuster?: { full_name: string };
  leave_balance?: {
    employee?: Employee;
    leave_type?: LeaveType;
  };
}

export default function LeaveBalanceAdjustmentsPage() {
  const { t } = useLanguage();
  const { user, isAdmin, hasRole } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { selectedDepartmentId, setSelectedDepartmentId } = useDepartmentFilter();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");

  const ADJUSTMENT_TYPES = [
    { value: "add", label: t("leave.balanceAdjustments.addDays"), icon: TrendingUp },
    { value: "deduct", label: t("leave.balanceAdjustments.deductDays"), icon: TrendingDown },
    { value: "correction", label: t("leave.balanceAdjustments.correction"), icon: Settings },
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);

  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    adjustment_type: "add",
    amount: "",
    reason: "",
    effective_date: new Date(),
  });

  // Fetch data
  useEffect(() => {
    if (!selectedCompanyId) return;

    const fetchData = async () => {
      setIsLoading(true);

      // Fetch employees
      const { data: empData } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", selectedCompanyId)
        .order("full_name");
      
      if (empData) setEmployees(empData);

      // Fetch leave types
      const { data: ltData } = await supabase
        .from("leave_types")
        .select("id, name, color")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name");
      
      if (ltData) setLeaveTypes(ltData);

      // Fetch recent adjustments
      const { data: adjData } = await supabase
        .from("leave_balance_adjustments")
        .select(`
          id,
          balance_id,
          adjustment_type,
          amount,
          reason,
          effective_date,
          created_at,
          adjusted_by,
          adjuster:profiles!leave_balance_adjustments_adjusted_by_fkey(full_name),
          leave_balance:leave_balances!leave_balance_adjustments_balance_id_fkey(
            employee:profiles(id, full_name, email),
            leave_type:leave_types(id, name, color)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (adjData) setAdjustments(adjData as unknown as Adjustment[]);

      setIsLoading(false);
    };

    fetchData();
  }, [selectedCompanyId]);

  // Fetch balances when employee is selected
  useEffect(() => {
    if (!formData.employee_id) {
      setLeaveBalances([]);
      return;
    }

    supabase
      .from("leave_balances")
      .select(`
        id,
        employee_id,
        leave_type_id,
        balance,
        year,
        leave_type:leave_types(id, name, color)
      `)
      .eq("employee_id", formData.employee_id)
      .eq("year", new Date().getFullYear())
      .then(({ data }) => {
        if (data) setLeaveBalances(data as unknown as LeaveBalance[]);
      });
  }, [formData.employee_id]);

  const resetForm = () => {
    setFormData({
      employee_id: "",
      leave_type_id: "",
      adjustment_type: "add",
      amount: "",
      reason: "",
      effective_date: new Date(),
    });
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.leave_type_id || !formData.amount || !formData.reason) {
      toast.error(t("validation.required"));
      return;
    }

    // Find or create balance record
    let balanceId: string;
    const existingBalance = leaveBalances.find(b => b.leave_type_id === formData.leave_type_id);

    if (existingBalance) {
      balanceId = existingBalance.id;
    } else {
      // Create new balance record
      const { data: newBalance, error: balanceError } = await supabase
        .from("leave_balances")
        .insert({
          employee_id: formData.employee_id,
          leave_type_id: formData.leave_type_id,
          year: new Date().getFullYear(),
          opening_balance: 0,
          accrued_amount: 0,
          used_amount: 0,
          adjustment_amount: 0,
          carried_forward: 0,
          current_balance: 0,
        })
        .select("id")
        .single();

      if (balanceError) {
        toast.error(t("common.error"));
        return;
      }
      balanceId = newBalance.id;
    }

    // Calculate adjustment amount
    const amount = parseFloat(formData.amount);
    const adjustmentAmount = formData.adjustment_type === "deduct" ? -amount : amount;

    // Create adjustment
    const { error: adjError } = await supabase
      .from("leave_balance_adjustments")
      .insert({
        balance_id: balanceId,
        adjustment_type: formData.adjustment_type,
        amount: adjustmentAmount,
        reason: formData.reason,
        effective_date: format(formData.effective_date, "yyyy-MM-dd"),
        adjusted_by: user?.id,
      });

    if (adjError) {
      toast.error(t("common.error"));
      return;
    }

    // Update balance - use current_balance field and adjustment_amount
    const currentBalance = existingBalance?.current_balance || 0;
    const currentAdjustment = existingBalance?.adjustment_amount || 0;
    const { error: updateError } = await supabase
      .from("leave_balances")
      .update({ 
        current_balance: currentBalance + adjustmentAmount,
        adjustment_amount: currentAdjustment + adjustmentAmount
      })
      .eq("id", balanceId);

    if (updateError) {
      toast.error(t("common.error"));
      return;
    }

    toast.success(t("common.success"));
    setIsDialogOpen(false);
    resetForm();

    // Refresh adjustments
    const { data: adjData } = await supabase
      .from("leave_balance_adjustments")
      .select(`
        id,
        balance_id,
        adjustment_type,
        amount,
        reason,
        effective_date,
        created_at,
        adjusted_by,
        adjuster:profiles!leave_balance_adjustments_adjusted_by_fkey(full_name),
        leave_balance:leave_balances!leave_balance_adjustments_balance_id_fkey(
          employee:profiles(id, full_name, email),
          leave_type:leave_types(id, name, color)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (adjData) setAdjustments(adjData as unknown as Adjustment[]);
  };

  const getAdjustmentBadge = (type: string, amount: number) => {
    if (amount > 0) {
      return <Badge className="bg-success/10 text-success border-0">+{amount}</Badge>;
    }
    return <Badge className="bg-destructive/10 text-destructive border-0">{amount}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.leave"), href: "/leave" },
            { label: t("leave.balanceAdjustments.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("leave.balanceAdjustments.title")}</h1>
              <p className="text-muted-foreground">{t("leave.balanceAdjustments.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={(id) => { setSelectedCompanyId(id); setSelectedDepartmentId("all"); }} 
            />
            <DepartmentFilter
              companyId={selectedCompanyId}
              selectedDepartmentId={selectedDepartmentId}
              onDepartmentChange={setSelectedDepartmentId}
            />
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("leave.balanceAdjustments.newAdjustment")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("leave.balanceAdjustments.createAdjustment")}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>{t("leave.balanceAdjustments.employee")} *</Label>
                    <Select
                      value={formData.employee_id}
                      onValueChange={(value) => setFormData({ ...formData, employee_id: value, leave_type_id: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("leave.balanceAdjustments.selectEmployee")} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("leave.balanceAdjustments.leaveType")} *</Label>
                    <Select
                      value={formData.leave_type_id}
                      onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("leave.balanceAdjustments.selectLeaveType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((lt) => (
                          <SelectItem key={lt.id} value={lt.id}>
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lt.color }} />
                              {lt.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.leave_type_id && leaveBalances.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t("leave.balanceAdjustments.currentBalance")}: {leaveBalances.find(b => b.leave_type_id === formData.leave_type_id)?.current_balance?.toFixed(1) || "0"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t("leave.balanceAdjustments.adjustmentType")} *</Label>
                    <Select
                      value={formData.adjustment_type}
                      onValueChange={(value) => setFormData({ ...formData, adjustment_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADJUSTMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("leave.balanceAdjustments.amount")} *</Label>
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder={t("leave.balanceAdjustments.enterAmount")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("leave.balanceAdjustments.effectiveDate")} *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {format(formData.effective_date, "PPP")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.effective_date}
                          onSelect={(date) => date && setFormData({ ...formData, effective_date: date })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("leave.balanceAdjustments.reason")} *</Label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder={t("leave.balanceAdjustments.reasonPlaceholder")}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                      {t("leave.balanceAdjustments.cancel")}
                    </Button>
                    <Button onClick={handleSubmit}>
                      {t("leave.balanceAdjustments.create")}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Adjustments Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("leave.balanceAdjustments.employee")}</TableHead>
                <TableHead>{t("leave.balanceAdjustments.leaveType")}</TableHead>
                <TableHead>{t("leave.balanceAdjustments.type")}</TableHead>
                <TableHead>{t("leave.balanceAdjustments.amount")}</TableHead>
                <TableHead>{t("leave.balanceAdjustments.reason")}</TableHead>
                <TableHead>{t("leave.balanceAdjustments.effectiveDate")}</TableHead>
                <TableHead>{t("leave.balanceAdjustments.adjustedBy")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("leave.balanceAdjustments.loading")}
                  </TableCell>
                </TableRow>
              ) : adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("leave.balanceAdjustments.noAdjustments")}
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{adj.leave_balance?.employee?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{adj.leave_balance?.employee?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2.5 w-2.5 rounded-full" 
                          style={{ backgroundColor: adj.leave_balance?.leave_type?.color || "#3B82F6" }} 
                        />
                        {adj.leave_balance?.leave_type?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{adj.adjustment_type}</TableCell>
                    <TableCell>{getAdjustmentBadge(adj.adjustment_type, adj.amount)}</TableCell>
                    <TableCell className="max-w-[200px] truncate" title={adj.reason}>
                      {adj.reason}
                    </TableCell>
                    <TableCell>{format(new Date(adj.effective_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{adj.adjuster?.full_name || "System"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
