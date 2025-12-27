import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface WriteOffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remainingBalance: number;
  currency: string;
  onConfirm: (reason: string) => Promise<void>;
}

export function WriteOffDialog({ 
  open, 
  onOpenChange, 
  remainingBalance, 
  currency,
  onConfirm 
}: WriteOffDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.length < 20) return;

    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
    setReason("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Write Off Balance
          </DialogTitle>
          <DialogDescription>
            This action will permanently close the recovery with the remaining balance unrecovered.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You are about to write off {formatCurrency(remainingBalance)}. This action cannot be undone.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Justification (minimum 20 characters) *</Label>
            <Textarea
              id="reason"
              placeholder="Provide detailed justification for writing off this balance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              minLength={20}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length}/20 characters minimum
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={reason.length < 20 || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Write Off Balance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
