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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCompensatoryTime } from "@/hooks/useCompensatoryTime";

interface CompTimeEarnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const workTypes = [
  { value: 'overtime', label: 'Overtime' },
  { value: 'holiday_work', label: 'Holiday Work' },
  { value: 'weekend_work', label: 'Weekend Work' },
  { value: 'other', label: 'Other' },
];

export function CompTimeEarnDialog({ open, onOpenChange }: CompTimeEarnDialogProps) {
  const { submitEarnedRequest, policies } = useCompensatoryTime();
  const [workDate, setWorkDate] = useState<Date>();
  const [workType, setWorkType] = useState<string>('overtime');
  const [hoursEarned, setHoursEarned] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!workDate || !hoursEarned || !reason) return;

    await submitEarnedRequest.mutateAsync({
      work_date: format(workDate, 'yyyy-MM-dd'),
      work_type: workType as any,
      hours_earned: parseFloat(hoursEarned),
      reason,
      notes: notes || null,
      policy_id: policies[0]?.id || null,
    });

    // Reset form
    setWorkDate(undefined);
    setWorkType('overtime');
    setHoursEarned('');
    setReason('');
    setNotes('');
    onOpenChange(false);
  };

  const isValid = workDate && hoursEarned && parseFloat(hoursEarned) > 0 && reason.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Compensatory Time</DialogTitle>
          <DialogDescription>
            Submit a request for comp time earned from extra work hours
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Work Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !workDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {workDate ? format(workDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={workDate}
                    onSelect={setWorkDate}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Work Type *</Label>
              <Select value={workType} onValueChange={setWorkType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hours Earned *</Label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={hoursEarned}
              onChange={(e) => setHoursEarned(e.target.value)}
              placeholder="e.g., 4"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason *</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the work performed..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
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
            disabled={!isValid || submitEarnedRequest.isPending}
          >
            {submitEarnedRequest.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
