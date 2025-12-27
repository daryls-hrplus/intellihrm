import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

interface SuspendRecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string, scheduledResumeDate?: string, notes?: string) => Promise<void>;
}

const SUSPEND_REASONS = [
  "Employee financial hardship",
  "Leave of absence",
  "Payroll investigation",
  "Employee dispute",
  "Management decision",
  "Other",
];

export function SuspendRecoveryDialog({ open, onOpenChange, onConfirm }: SuspendRecoveryDialogProps) {
  const [reason, setReason] = useState("");
  const [scheduledResumeDate, setScheduledResumeDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    setIsSubmitting(true);
    await onConfirm(reason, scheduledResumeDate || undefined, notes || undefined);
    setIsSubmitting(false);
    resetForm();
  };

  const resetForm = () => {
    setReason("");
    setScheduledResumeDate("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Suspend Recovery
          </DialogTitle>
          <DialogDescription>
            Suspending this recovery will pause all deductions until resumed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for suspension" />
              </SelectTrigger>
              <SelectContent>
                {SUSPEND_REASONS.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_date">Scheduled Resume Date (Optional)</Label>
            <Input
              type="date"
              id="resume_date"
              value={scheduledResumeDate}
              onChange={(e) => setScheduledResumeDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for indefinite suspension
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!reason || isSubmitting}>
              {isSubmitting ? "Suspending..." : "Suspend Recovery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
