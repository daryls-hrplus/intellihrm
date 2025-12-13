import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCompensatoryTime } from "@/hooks/useCompensatoryTime";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CompTimeUseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

export function CompTimeUseDialog({ open, onOpenChange, availableBalance }: CompTimeUseDialogProps) {
  const { submitUsedRequest } = useCompensatoryTime();
  const [useDate, setUseDate] = useState<Date>();
  const [hoursUsed, setHoursUsed] = useState<string>('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!useDate || !hoursUsed) return;

    await submitUsedRequest.mutateAsync({
      use_date: format(useDate, 'yyyy-MM-dd'),
      hours_used: parseFloat(hoursUsed),
      reason: reason || null,
    });

    // Reset form
    setUseDate(undefined);
    setHoursUsed('');
    setReason('');
    onOpenChange(false);
  };

  const requestedHours = parseFloat(hoursUsed) || 0;
  const exceedsBalance = requestedHours > availableBalance;
  const isValid = useDate && hoursUsed && requestedHours > 0 && !exceedsBalance;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Use Compensatory Time</DialogTitle>
          <DialogDescription>
            Request to use your earned comp time balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Available balance: <strong>{availableBalance.toFixed(1)} hours</strong>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Date to Use *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !useDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {useDate ? format(useDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={useDate}
                  onSelect={setUseDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Hours to Use *</Label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              max={availableBalance}
              value={hoursUsed}
              onChange={(e) => setHoursUsed(e.target.value)}
              placeholder={`Max: ${availableBalance.toFixed(1)}`}
            />
            {exceedsBalance && (
              <p className="text-sm text-destructive">
                Cannot exceed available balance of {availableBalance.toFixed(1)} hours
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for using comp time..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || submitUsedRequest.isPending}
          >
            {submitUsedRequest.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
