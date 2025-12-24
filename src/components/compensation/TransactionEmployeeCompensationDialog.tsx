import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { TransactionType } from "@/hooks/useEmployeeTransactions";

interface PayElement {
  id: string;
  code: string;
  name: string;
  element_type?: { code: string; name: string };
}

interface EditingRecord {
  id: string;
  pay_element_id: string;
  amount: number;
  currency: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  is_override: boolean;
  notes: string | null;
}

interface TransactionEmployeeCompensationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  positionId: string;
  positionTitle: string;
  companyId: string;
  transactionType: TransactionType;
  defaultStartDate: string;
  defaultEndDate?: string;
  editingRecord?: EditingRecord;
  onSuccess: () => void;
}

export function TransactionEmployeeCompensationDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  positionId,
  positionTitle,
  companyId,
  transactionType,
  defaultStartDate,
  defaultEndDate,
  editingRecord,
  onSuccess,
}: TransactionEmployeeCompensationDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [positionPayElementIds, setPositionPayElementIds] = useState<string[]>([]);
  const [resolvedCompanyId, setResolvedCompanyId] = useState(companyId);
  const [formIsOverride, setFormIsOverride] = useState(false);
  const [formOverrideReason, setFormOverrideReason] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStartDate, setFormStartDate] = useState(defaultStartDate || "");
  const [formEndDate, setFormEndDate] = useState(defaultEndDate || "");
  const [formIsActive, setFormIsActive] = useState(true);

  const isEditing = !!editingRecord;

  const frequencyOptions = [
    { value: "monthly", label: t("compensation.employeeCompensation.frequency.monthly", "Monthly") },
    { value: "annual", label: t("compensation.employeeCompensation.frequency.annual", "Annual") },
    { value: "weekly", label: t("compensation.employeeCompensation.frequency.weekly", "Weekly") },
    { value: "bi-weekly", label: t("compensation.employeeCompensation.frequency.biWeekly", "Bi-Weekly") },
    { value: "one-time", label: t("compensation.employeeCompensation.frequency.oneTime", "One-Time") },
  ];

  // Form state
  const [formPayElementId, setFormPayElementId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formFrequency, setFormFrequency] = useState("monthly");

  useEffect(() => {
    if (open) {
      loadPayElements();
      loadPositionPayElements();
      loadPositionCompanyId();
      
      // If editing, populate form with existing values
      if (editingRecord) {
        setFormPayElementId(editingRecord.pay_element_id);
        setFormAmount(editingRecord.amount.toString());
        setFormCurrency(editingRecord.currency);
        setFormFrequency(editingRecord.frequency);
        setFormIsOverride(editingRecord.is_override);
        setFormOverrideReason("");
        setFormNotes(editingRecord.notes || "");
        setFormStartDate(editingRecord.start_date);
        setFormEndDate(editingRecord.end_date || "");
        setFormIsActive(editingRecord.is_active);
      } else {
        // Reset form with defaults for new record
        setFormPayElementId("");
        setFormAmount("");
        setFormCurrency("USD");
        setFormFrequency("monthly");
        setFormIsOverride(false);
        setFormOverrideReason("");
        setFormNotes("");
        setFormStartDate(defaultStartDate || "");
        setFormEndDate(defaultEndDate || "");
        setFormIsActive(true);
      }
      setResolvedCompanyId(companyId);
    }
  }, [open, defaultStartDate, defaultEndDate, companyId, editingRecord]);

  const loadPayElements = async () => {
    const { data } = await supabase
      .from("pay_elements")
      .select(`
        id, code, name,
        element_type:lookup_values!pay_elements_element_type_id_fkey(code, name)
      `)
      .eq("is_active", true)
      .order("display_order");

    if (data) {
      setPayElements(data as PayElement[]);
    }
  };

  const loadPositionPayElements = async () => {
    if (!positionId) return;

    const { data } = await supabase
      .from("position_compensation")
      .select("pay_element_id")
      .eq("position_id", positionId)
      .eq("is_active", true);

    if (data) {
      setPositionPayElementIds(data.map(pc => pc.pay_element_id));
    }
  };

  const loadPositionCompanyId = async () => {
    // If companyId is already provided, use it
    if (companyId) {
      setResolvedCompanyId(companyId);
      return;
    }

    // Otherwise, fetch from the position
    if (!positionId) return;

    const { data } = await supabase
      .from("positions")
      .select("company_id")
      .eq("id", positionId)
      .single();

    if (data?.company_id) {
      setResolvedCompanyId(data.company_id);
    }
  };

  const handleSubmit = async () => {
    if (!formPayElementId || !formAmount || !formStartDate) {
      toast.error(t("compensation.employeeCompensation.validation.required", "Please fill in all required fields"));
      return;
    }

    if (!resolvedCompanyId) {
      toast.error(t("compensation.employeeCompensation.validation.companyRequired", "Company information is required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const compensationData = {
        company_id: resolvedCompanyId,
        employee_id: employeeId,
        position_id: positionId,
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

      if (isEditing && editingRecord) {
        // Update existing record
        const { error } = await supabase
          .from("employee_compensation")
          .update(compensationData)
          .eq("id", editingRecord.id);

        if (error) throw error;
        toast.success(t("compensation.employeeCompensation.updated", "Compensation record updated"));
      } else {
        // Create new record
        const { error } = await supabase.from("employee_compensation").insert({
          ...compensationData,
          created_by: user?.id,
        });

        if (error) throw error;
        toast.success(t("compensation.employeeCompensation.added", "Compensation record added"));
      }
      
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
          <DialogTitle>
            {isEditing 
              ? t("compensation.employeeCompensation.dialog.editTitle", "Edit Compensation")
              : t("compensation.employeeCompensation.dialog.createTitle", "Add Compensation")}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t("compensation.employeeCompensation.dialog.editDescription", "Update the compensation element for this employee")
              : t("compensation.employeeCompensation.dialog.description", "Add a compensation element for this employee")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pre-filled Employee & Position Info */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("common.employee")}</span>
              <span className="font-medium">{employeeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("common.position")}</span>
              <span className="font-medium">{positionTitle || "—"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("compensation.employeeCompensation.payElement")} *</Label>
            <Select value={formPayElementId} onValueChange={setFormPayElementId}>
              <SelectTrigger>
                <SelectValue placeholder={t("compensation.employeeCompensation.dialog.selectPayElement", "Select pay element")} />
              </SelectTrigger>
              <SelectContent>
                {payElements.map((pe) => (
                  <SelectItem key={pe.id} value={pe.id}>
                    {pe.name} ({pe.code}) {positionPayElementIds.includes(pe.id) && "★"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {positionPayElementIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                ★ = {t("compensation.employeeCompensation.dialog.linkedToPosition", "Linked to position")}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("compensation.employeeCompensation.amount", "Amount")} *</Label>
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
              <Label>{t("compensation.employeeCompensation.currency", "Currency")}</Label>
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
                  <SelectItem value="JMD">JMD</SelectItem>
                  <SelectItem value="TTD">TTD</SelectItem>
                  <SelectItem value="XCD">XCD</SelectItem>
                  <SelectItem value="BBD">BBD</SelectItem>
                  <SelectItem value="GHS">GHS</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("compensation.employeeCompensation.frequencyLabel", "Frequency")}</Label>
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
            <Label htmlFor="isOverride">{t("compensation.employeeCompensation.dialog.isOverride", "This is an override")}</Label>
          </div>

          {formIsOverride && (
            <div className="space-y-2">
              <Label htmlFor="overrideReason">{t("compensation.employeeCompensation.dialog.overrideReason", "Override Reason")}</Label>
              <Input
                id="overrideReason"
                value={formOverrideReason}
                onChange={(e) => setFormOverrideReason(e.target.value)}
                placeholder={t("compensation.employeeCompensation.dialog.overrideReasonPlaceholder", "Enter reason for override")}
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
              placeholder={t("common.notesPlaceholder", "Add any notes...")}
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
