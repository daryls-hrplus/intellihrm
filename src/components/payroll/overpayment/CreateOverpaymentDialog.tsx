import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useOverpaymentRecovery, OverpaymentPriority } from "@/hooks/useOverpaymentRecovery";
import { useCompanyCurrencyList } from "@/hooks/useCompanyCurrencies";
import { toast } from "sonner";

interface CreateOverpaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | null;
  onSuccess: () => void;
}

interface Employee {
  id: string;
  full_name: string | null;
}

const OVERPAYMENT_REASONS = [
  "Salary Calculation Error",
  "Overtime Miscalculation",
  "Leave Balance Error",
  "Allowance Overpayment",
  "Bonus Overpayment",
  "Duplicate Payment",
  "Advance Not Deducted",
  "System Error",
  "Other",
];

export function CreateOverpaymentDialog({ 
  open, 
  onOpenChange, 
  companyId,
  onSuccess 
}: CreateOverpaymentDialogProps) {
  const { createRecord } = useOverpaymentRecovery(companyId);
  const { currencies, defaultCurrency, isLoading: currenciesLoading } = useCompanyCurrencyList(companyId || undefined);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    overpayment_date: new Date().toISOString().split('T')[0],
    discovery_date: new Date().toISOString().split('T')[0],
    reason: "",
    reason_details: "",
    original_amount: "",
    recovery_amount_per_cycle: "",
    currency: "",
    priority: "normal" as OverpaymentPriority,
    notes: "",
    create_linked_deduction: true,
  });

  // Set default currency when loaded
  useEffect(() => {
    if (defaultCurrency && !formData.currency) {
      setFormData(prev => ({ ...prev, currency: defaultCurrency.code }));
    }
  }, [defaultCurrency]);

  useEffect(() => {
    if (open && companyId) {
      loadEmployees();
    }
  }, [open, companyId]);

  const loadEmployees = async () => {
    if (!companyId) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("company_id", companyId)
      .order("full_name");

    if (error) {
      toast.error("Failed to load employees");
    } else {
      setEmployees(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyId || !formData.employee_id || !formData.reason || !formData.original_amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const originalAmount = parseFloat(formData.original_amount);
    const recoveryAmount = parseFloat(formData.recovery_amount_per_cycle);

    if (isNaN(originalAmount) || originalAmount <= 0) {
      toast.error("Please enter a valid original amount");
      return;
    }

    if (isNaN(recoveryAmount) || recoveryAmount <= 0) {
      toast.error("Please enter a valid recovery amount per cycle");
      return;
    }

    if (recoveryAmount > originalAmount) {
      toast.error("Recovery amount per cycle cannot exceed original amount");
      return;
    }

    setIsSubmitting(true);

    const result = await createRecord({
      company_id: companyId,
      employee_id: formData.employee_id,
      overpayment_date: formData.overpayment_date,
      discovery_date: formData.discovery_date,
      reason: formData.reason,
      reason_details: formData.reason_details || undefined,
      original_amount: originalAmount,
      recovery_amount_per_cycle: recoveryAmount,
      currency: formData.currency,
      priority: formData.priority,
      notes: formData.notes || undefined,
      create_linked_deduction: formData.create_linked_deduction,
    });

    setIsSubmitting(false);

    if (result) {
      resetForm();
      onSuccess();
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: "",
      overpayment_date: new Date().toISOString().split('T')[0],
      discovery_date: new Date().toISOString().split('T')[0],
      reason: "",
      reason_details: "",
      original_amount: "",
      recovery_amount_per_cycle: "",
      currency: defaultCurrency?.code || "",
      priority: "normal",
      notes: "",
      create_linked_deduction: true,
    });
  };

  const suggestRecoveryAmount = () => {
    const originalAmount = parseFloat(formData.original_amount);
    if (!isNaN(originalAmount) && originalAmount > 0) {
      // Suggest 10% of original or full amount if small
      const suggested = originalAmount <= 100 ? originalAmount : Math.ceil(originalAmount / 10);
      setFormData(prev => ({ ...prev, recovery_amount_per_cycle: suggested.toString() }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Overpayment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select 
              value={formData.employee_id} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, employee_id: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Select employee"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name || "Unnamed"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overpayment_date">Overpayment Date *</Label>
              <Input
                type="date"
                id="overpayment_date"
                value={formData.overpayment_date}
                onChange={(e) => setFormData(prev => ({ ...prev, overpayment_date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discovery_date">Discovery Date</Label>
              <Input
                type="date"
                id="discovery_date"
                value={formData.discovery_date}
                onChange={(e) => setFormData(prev => ({ ...prev, discovery_date: e.target.value }))}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select 
              value={formData.reason} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, reason: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {OVERPAYMENT_REASONS.map(reason => (
                  <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason Details */}
          <div className="space-y-2">
            <Label htmlFor="reason_details">Details</Label>
            <Textarea
              id="reason_details"
              placeholder="Provide additional details about the overpayment..."
              value={formData.reason_details}
              onChange={(e) => setFormData(prev => ({ ...prev, reason_details: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="original_amount">Original Amount *</Label>
              <Input
                type="number"
                id="original_amount"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={formData.original_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, original_amount: e.target.value }))}
                onBlur={suggestRecoveryAmount}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recovery_amount">Recovery Per Cycle *</Label>
              <Input
                type="number"
                id="recovery_amount"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={formData.recovery_amount_per_cycle}
                onChange={(e) => setFormData(prev => ({ ...prev, recovery_amount_per_cycle: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Currency & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
                disabled={currenciesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={currenciesLoading ? "Loading..." : "Select currency"} />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.id} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val as OverpaymentPriority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Create Linked Deduction */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create_linked_deduction"
              checked={formData.create_linked_deduction}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, create_linked_deduction: checked === true }))
              }
            />
            <Label htmlFor="create_linked_deduction" className="text-sm">
              Create linked regular deduction for automatic recovery
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
