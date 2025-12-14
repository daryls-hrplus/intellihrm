import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement, LeaveAccrualRule } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Plus, TrendingUp, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function LeaveAccrualRulesPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();
  const { leaveTypes, accrualRules, loadingAccrualRules, createAccrualRule } = useLeaveManagement(selectedCompanyId);
  const [isOpen, setIsOpen] = useState(false);
  const [isRunningAccrual, setIsRunningAccrual] = useState(false);
  const [formData, setFormData] = useState({
    leave_type_id: "",
    name: "",
    description: "",
    accrual_frequency: "monthly" as "daily" | "monthly" | "annually" | "bi_weekly" | "weekly",
    accrual_amount: 0,
    years_of_service_min: 0,
    years_of_service_max: null as number | null,
    employee_status: "",
    employee_type: "",
    priority: 0,
    start_date: new Date().toISOString().split('T')[0],
    end_date: "" as string,
  });

  const resetForm = () => {
    setFormData({
      leave_type_id: "",
      name: "",
      description: "",
      accrual_frequency: "monthly",
      accrual_amount: 0,
      years_of_service_min: 0,
      years_of_service_max: null,
      employee_status: "",
      employee_type: "",
      priority: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
    });
  };

  const handleSubmit = async () => {
    if (!selectedCompanyId || !formData.leave_type_id) return;

    await createAccrualRule.mutateAsync({
      ...formData,
      company_id: selectedCompanyId,
      years_of_service_max: formData.years_of_service_max || undefined,
      employee_status: formData.employee_status || undefined,
      employee_type: formData.employee_type || undefined,
      end_date: formData.end_date || undefined,
    });
    setIsOpen(false);
    resetForm();
  };

  const handleRunAccrual = async (accrualType: "daily" | "monthly") => {
    setIsRunningAccrual(true);
    try {
      const { data, error } = await supabase.functions.invoke("scheduled-leave-accrual", {
        body: { accrual_type: accrualType },
      });
      
      if (error) throw error;
      
      const accrualLabel = accrualType === "daily" ? t("leave.accrualRules.daily") : t("leave.accrualRules.monthly");
      toast.success(t("leave.accrualRules.accrualCompleted", { type: accrualLabel, count: data.processed }));
    } catch (error) {
      console.error("Accrual error:", error);
      toast.error(t("leave.accrualRules.accrualFailed"));
    } finally {
      setIsRunningAccrual(false);
    }
  };

  const frequencyLabels: Record<string, string> = {
    daily: t("leave.accrualRules.daily"),
    monthly: t("leave.accrualRules.monthly"),
    annually: t("leave.accrualRules.annually"),
    bi_weekly: t("leave.accrualRules.biWeekly"),
    weekly: t("leave.accrualRules.weekly"),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.accrualRules.title") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("leave.accrualRules.title")}</h1>
              <p className="text-muted-foreground">{t("leave.accrualRules.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId} 
              onCompanyChange={setSelectedCompanyId} 
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isRunningAccrual}>
                  {isRunningAccrual ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {t("leave.accrualRules.runAccrual")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleRunAccrual("daily")}>
                  {t("leave.accrualRules.runDailyNow")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRunAccrual("monthly")}>
                  {t("leave.accrualRules.runMonthlyNow")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("leave.accrualRules.addRule")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t("leave.accrualRules.addRule")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leave_type">{t("leave.accrualRules.leaveType")} *</Label>
                    <Select
                      value={formData.leave_type_id}
                      onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("leave.accrualRules.selectLeaveType")} />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("leave.accrualRules.ruleName")} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("leave.accrualRules.ruleNamePlaceholder")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("leave.accrualRules.description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t("leave.accrualRules.descriptionPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">{t("leave.accrualRules.frequency")} *</Label>
                    <Select
                      value={formData.accrual_frequency}
                      onValueChange={(value: "daily" | "monthly" | "annually" | "bi_weekly" | "weekly") => 
                        setFormData({ ...formData, accrual_frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t("leave.accrualRules.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("leave.accrualRules.weekly")}</SelectItem>
                        <SelectItem value="bi_weekly">{t("leave.accrualRules.biWeekly")}</SelectItem>
                        <SelectItem value="monthly">{t("leave.accrualRules.monthly")}</SelectItem>
                        <SelectItem value="annually">{t("leave.accrualRules.annually")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accrual_amount">{t("leave.accrualRules.amount")} *</Label>
                    <Input
                      id="accrual_amount"
                      type="number"
                      step="0.25"
                      value={formData.accrual_amount}
                      onChange={(e) => setFormData({ ...formData, accrual_amount: parseFloat(e.target.value) || 0 })}
                      placeholder={t("leave.accrualRules.amountPlaceholder")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="yos_min">{t("leave.accrualRules.minYearsOfService")}</Label>
                    <Input
                      id="yos_min"
                      type="number"
                      value={formData.years_of_service_min}
                      onChange={(e) => setFormData({ ...formData, years_of_service_min: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yos_max">{t("leave.accrualRules.maxYearsOfService")}</Label>
                    <Input
                      id="yos_max"
                      type="number"
                      value={formData.years_of_service_max || ""}
                      onChange={(e) => setFormData({ ...formData, years_of_service_max: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder={t("leave.rolloverRules.noLimit")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employee_status">{t("leave.accrualRules.employeeStatus")}</Label>
                    <Input
                      id="employee_status"
                      value={formData.employee_status}
                      onChange={(e) => setFormData({ ...formData, employee_status: e.target.value })}
                      placeholder={t("leave.accrualRules.employeeStatusPlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee_type">{t("leave.accrualRules.employeeType")}</Label>
                    <Input
                      id="employee_type"
                      value={formData.employee_type}
                      onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}
                      placeholder={t("leave.accrualRules.employeeTypePlaceholder")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">{t("leave.accrualRules.startDate")} *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">{t("leave.accrualRules.endDate")}</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      placeholder={t("leave.accrualRules.noEnd")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">{t("leave.accrualRules.priority")}</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    {t("leave.common.cancel")}
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.leave_type_id}>
                    {t("leave.common.create")}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("leave.accrualRules.ruleName")}</TableHead>
                <TableHead>{t("leave.accrualRules.leaveType")}</TableHead>
                <TableHead>{t("leave.accrualRules.frequency")}</TableHead>
                <TableHead>{t("leave.accrualRules.amount")}</TableHead>
                <TableHead>{t("leave.accrualRules.yearsOfService")}</TableHead>
                <TableHead>{t("leave.accrualRules.validityPeriod")}</TableHead>
                <TableHead>{t("leave.accrualRules.priority")}</TableHead>
                <TableHead>{t("leave.common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingAccrualRules ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("leave.accrualRules.loading")}
                  </TableCell>
                </TableRow>
              ) : accrualRules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("leave.accrualRules.noRules")}
                  </TableCell>
                </TableRow>
              ) : (
                accrualRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: rule.leave_type?.color || "#3B82F6" }} 
                        />
                        {rule.leave_type?.name || "Unknown"}
                      </div>
                    </TableCell>
                    <TableCell>{frequencyLabels[rule.accrual_frequency]}</TableCell>
                    <TableCell>{rule.accrual_amount}</TableCell>
                    <TableCell>
                      {rule.years_of_service_min} - {rule.years_of_service_max || "∞"} years
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(rule.start_date).toLocaleDateString()} - {rule.end_date ? new Date(rule.end_date).toLocaleDateString() : t("leave.accrualRules.noEnd")}
                      </span>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? t("leave.common.active") : t("leave.common.inactive")}
                      </Badge>
                    </TableCell>
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
