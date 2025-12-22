import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

interface AddCompensationHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  full_name: string;
}

export function AddCompensationHistoryDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: AddCompensationHistoryDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: "",
    change_type: "",
    effective_date: "",
    previous_salary: "",
    new_salary: "",
    reason: "",
    notes: "",
    currency: "USD",
  });

  useEffect(() => {
    if (open && companyId) {
      loadEmployees();
    }
  }, [open, companyId]);

  const loadEmployees = async () => {
    // @ts-ignore - Supabase type instantiation issue
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("full_name");
    if (data && !error) setEmployees(data as Employee[]);
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.change_type || !formData.effective_date || !formData.new_salary) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const previousSalary = formData.previous_salary ? parseFloat(formData.previous_salary) : null;
      const newSalary = parseFloat(formData.new_salary);
      
      let changeAmount: number | null = null;
      let changePercentage: number | null = null;
      
      if (previousSalary !== null && previousSalary > 0) {
        changeAmount = newSalary - previousSalary;
        changePercentage = parseFloat(((changeAmount / previousSalary) * 100).toFixed(2));
      }

      const { error } = await supabase.from("compensation_history").insert({
        company_id: companyId,
        employee_id: formData.employee_id,
        change_type: formData.change_type,
        effective_date: formData.effective_date,
        previous_salary: previousSalary,
        new_salary: newSalary,
        change_amount: changeAmount,
        change_percentage: changePercentage,
        reason: formData.reason || null,
        notes: formData.notes || null,
        currency: formData.currency,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success(t("compensation.history.recordAdded"));
      onOpenChange(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      change_type: "",
      effective_date: "",
      previous_salary: "",
      new_salary: "",
      reason: "",
      notes: "",
      currency: "USD",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("compensation.history.addRecord")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">{t("compensation.history.employee")} *</Label>
            <Select
              value={formData.employee_id}
              onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.selectEmployee")} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="change_type">{t("compensation.history.type")} *</Label>
            <Select
              value={formData.change_type}
              onValueChange={(value) => setFormData({ ...formData, change_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("compensation.history.selectType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hire">{t("compensation.history.changeTypes.hire")}</SelectItem>
                <SelectItem value="promotion">{t("compensation.history.changeTypes.promotion")}</SelectItem>
                <SelectItem value="merit">{t("compensation.history.changeTypes.merit")}</SelectItem>
                <SelectItem value="adjustment">{t("compensation.history.changeTypes.adjustment")}</SelectItem>
                <SelectItem value="market">{t("compensation.history.changeTypes.market")}</SelectItem>
                <SelectItem value="demotion">{t("compensation.history.changeTypes.demotion")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_date">{t("compensation.history.effectiveDate")} *</Label>
            <Input
              id="effective_date"
              type="date"
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="previous_salary">{t("compensation.history.previous")}</Label>
              <Input
                id="previous_salary"
                type="number"
                placeholder="0.00"
                value={formData.previous_salary}
                onChange={(e) => setFormData({ ...formData, previous_salary: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_salary">{t("compensation.history.new")} *</Label>
              <Input
                id="new_salary"
                type="number"
                placeholder="0.00"
                value={formData.new_salary}
                onChange={(e) => setFormData({ ...formData, new_salary: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("compensation.history.reason")}</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t("compensation.history.reasonPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("common.notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("common.notesPlaceholder")}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
