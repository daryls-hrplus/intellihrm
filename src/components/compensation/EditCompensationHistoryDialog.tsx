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
import { format } from "date-fns";

interface EditCompensationHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: any;
  onSuccess: () => void;
}

export function EditCompensationHistoryDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: EditCompensationHistoryDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    change_type: "",
    effective_date: "",
    previous_salary: "",
    new_salary: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    if (open && record) {
      setFormData({
        change_type: record.change_type || "",
        effective_date: record.effective_date ? format(new Date(record.effective_date), "yyyy-MM-dd") : "",
        previous_salary: record.previous_salary?.toString() || "",
        new_salary: record.new_salary?.toString() || "",
        reason: record.reason || "",
        notes: record.notes || "",
      });
    }
  }, [open, record]);

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

      // @ts-ignore - Supabase type instantiation issue
      const { error } = await supabase
        .from("compensation_history")
        .update({
          change_type: formData.change_type,
          effective_date: formData.effective_date,
          previous_salary: previousSalary,
          new_salary: newSalary,
          change_amount: changeAmount,
          change_percentage: changePercentage,
          reason: formData.reason || null,
          notes: formData.notes || null,
        })
        .eq("id", record.id);

      if (error) throw error;

      toast.success(t("compensation.history.recordUpdated"));
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
          <DialogTitle>{t("compensation.history.editRecord")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>{t("compensation.history.employee")}</Label>
            <Input value={record?.employee?.full_name || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>{t("common.position")}</Label>
            <Input value={record?.position?.title || "-"} disabled />
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
