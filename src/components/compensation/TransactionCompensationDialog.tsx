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
import { TransactionType } from "@/hooks/useEmployeeTransactions";

interface TransactionCompensationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  positionId: string;
  positionTitle: string;
  companyId: string;
  effectiveDate: string;
  transactionType: TransactionType;
  onSuccess: () => void;
}

const transactionTypeToChangeType: Record<TransactionType, string> = {
  HIRE: "hire",
  CONFIRMATION: "adjustment",
  PROBATION_EXT: "adjustment",
  ACTING: "acting",
  PROMOTION: "promotion",
  TRANSFER: "adjustment",
  TERMINATION: "adjustment",
};

export function TransactionCompensationDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  positionId,
  positionTitle,
  companyId,
  effectiveDate,
  transactionType,
  onSuccess,
}: TransactionCompensationDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSalary, setCurrentSalary] = useState<number | null>(null);
  const [resolvedPositionTitle, setResolvedPositionTitle] = useState(positionTitle);
  const [resolvedCompanyId, setResolvedCompanyId] = useState(companyId);
  const [formData, setFormData] = useState({
    change_type: transactionTypeToChangeType[transactionType] || "adjustment",
    effective_date: effectiveDate || "",
    previous_salary: "",
    new_salary: "",
    reason: "",
    notes: "",
    currency: "USD",
  });

  useEffect(() => {
    setResolvedPositionTitle(positionTitle);
  }, [positionTitle]);

  useEffect(() => {
    setResolvedCompanyId(companyId);
  }, [companyId]);

  useEffect(() => {
    if (open && employeeId && positionId) {
      loadCurrentCompensation();
      loadPositionDetails();
      setFormData((prev) => ({
        ...prev,
        change_type: transactionTypeToChangeType[transactionType] || "adjustment",
        effective_date: effectiveDate || "",
      }));
    }
  }, [open, employeeId, positionId, effectiveDate, transactionType, positionTitle]);

  const loadCurrentCompensation = async () => {
    // Get current compensation from employee_positions
    const { data } = await supabase
      .from("employee_positions")
      .select("compensation_amount")
      .eq("employee_id", employeeId)
      .eq("position_id", positionId)
      .eq("is_active", true)
      .single();

    if (data?.compensation_amount) {
      setCurrentSalary(data.compensation_amount);
      setFormData((prev) => ({
        ...prev,
        previous_salary: data.compensation_amount?.toString() || "",
      }));
    }
  };

  const loadPositionDetails = async () => {
    const { data } = await supabase
      .from("positions")
      .select("title, company_id")
      .eq("id", positionId)
      .single();

    if (data) {
      if (!positionTitle && data.title) {
        setResolvedPositionTitle(data.title);
      }
      // If companyId is not provided, use the position's company_id
      if (!companyId && data.company_id) {
        setResolvedCompanyId(data.company_id);
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.change_type || !formData.effective_date || !formData.new_salary) {
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
        company_id: resolvedCompanyId || null,
        employee_id: employeeId,
        position_id: positionId,
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
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("compensation.history.addRecord")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Pre-filled Employee & Position Info */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("common.employee")}</span>
              <span className="font-medium">{employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("common.position")}</span>
              <span className="font-medium">{resolvedPositionTitle || "—"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("compensation.history.type")} *</Label>
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
                  <SelectItem value="acting">{t("compensation.history.changeTypes.acting")}</SelectItem>
                  <SelectItem value="market">{t("compensation.history.changeTypes.market")}</SelectItem>
                  <SelectItem value="demotion">{t("compensation.history.changeTypes.demotion")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("compensation.history.effectiveDate")} *</Label>
              <Input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("compensation.history.previous")}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.previous_salary}
                  onChange={(e) => setFormData({ ...formData, previous_salary: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("compensation.history.new")} *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.new_salary}
                  onChange={(e) => setFormData({ ...formData, new_salary: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Change Preview */}
          {formData.previous_salary && formData.new_salary && (
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Change Amount</span>
                <span className={`font-medium ${parseFloat(formData.new_salary) - parseFloat(formData.previous_salary) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {parseFloat(formData.new_salary) - parseFloat(formData.previous_salary) >= 0 ? '+' : ''}
                  ${(parseFloat(formData.new_salary) - parseFloat(formData.previous_salary)).toLocaleString()}
                  {parseFloat(formData.previous_salary) > 0 && (
                    <span className="ml-2 text-sm">
                      ({(((parseFloat(formData.new_salary) - parseFloat(formData.previous_salary)) / parseFloat(formData.previous_salary)) * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t("compensation.history.reason")}</Label>
            <Input
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t("compensation.history.reasonPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("common.notes")}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("common.notesPlaceholder")}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
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
