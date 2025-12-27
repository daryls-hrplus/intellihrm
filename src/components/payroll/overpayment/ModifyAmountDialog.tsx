import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

interface ModifyAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAmount: number;
  currency: string;
  onConfirm: (newAmount: number, reason: string) => Promise<void>;
}

export function ModifyAmountDialog({ 
  open, 
  onOpenChange, 
  currentAmount, 
  currency,
  onConfirm 
}: ModifyAmountDialogProps) {
  const [newAmount, setNewAmount] = useState(currentAmount.toString());
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0 || !reason) return;

    setIsSubmitting(true);
    await onConfirm(amount, reason);
    setIsSubmitting(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAmount(currentAmount.toString());
    setReason("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modify Recovery Amount
          </DialogTitle>
          <DialogDescription>
            Change the per-cycle recovery amount. Current amount: {formatCurrency(currentAmount)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_amount">New Amount Per Cycle *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {currency}
              </span>
              <Input
                type="number"
                id="new_amount"
                className="pl-14"
                step="0.01"
                min="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change *</Label>
            <Textarea
              id="reason"
              placeholder="Explain why the recovery amount is being changed..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!newAmount || !reason || isSubmitting || parseFloat(newAmount) <= 0}
            >
              {isSubmitting ? "Updating..." : "Update Amount"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
