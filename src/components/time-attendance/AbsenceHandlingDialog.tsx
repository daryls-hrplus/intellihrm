import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { format, set } from "date-fns";
import { UserX, Clock, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AbsenceException {
  id: string;
  employee_id: string;
  exception_date: string;
  exception_type: string;
  reason: string | null;
  status: string;
  shift_id: string | null;
  scheduled_time: string | null;
  employee?: { full_name: string };
  shifts?: { name: string; start_time: string; end_time: string };
}

interface AbsenceHandlingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absence: AbsenceException | null;
  onSuccess: () => void;
}

type ResolutionType = 'excused' | 'unexcused' | 'manual_punch' | 'link_leave' | 'no_show';

export function AbsenceHandlingDialog({ open, onOpenChange, absence, onSuccess }: AbsenceHandlingDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [resolutionType, setResolutionType] = useState<ResolutionType>('excused');
  const [reason, setReason] = useState("");
  const [manualClockIn, setManualClockIn] = useState("");
  const [manualClockOut, setManualClockOut] = useState("");

  if (!absence) return null;

  const handleSubmit = async () => {
    if (!reason.trim() && resolutionType !== 'manual_punch') {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this resolution.",
        variant: "destructive",
      });
      return;
    }

    if (resolutionType === 'manual_punch' && (!manualClockIn || !manualClockOut)) {
      toast({
        title: "Times Required",
        description: "Please enter both clock in and clock out times.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (resolutionType === 'manual_punch') {
        // Create a manual time clock entry
        const entryDate = new Date(absence.exception_date);
        const [inHours, inMinutes] = manualClockIn.split(":").map(Number);
        const [outHours, outMinutes] = manualClockOut.split(":").map(Number);

        const clockIn = set(entryDate, { hours: inHours, minutes: inMinutes, seconds: 0 });
        let clockOut = set(entryDate, { hours: outHours, minutes: outMinutes, seconds: 0 });
        
        // Handle overnight shifts
        if (clockOut < clockIn) {
          clockOut = new Date(clockOut);
          clockOut.setDate(clockOut.getDate() + 1);
        }

        // Get company_id from the employee profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', absence.employee_id)
          .single();

        // Create the time clock entry
        const { error: entryError } = await supabase
          .from('time_clock_entries')
          .insert({
            company_id: profile?.company_id,
            employee_id: absence.employee_id,
            clock_in: clockIn.toISOString(),
            clock_out: clockOut.toISOString(),
            clock_in_method: 'manual_entry',
            clock_out_method: 'manual_entry',
            shift_id: absence.shift_id,
            status: 'completed',
            notes: `Manual entry by timekeeper: ${reason || 'Forgot to punch'}`,
            adjusted_by: user?.id,
            adjusted_at: new Date().toISOString(),
            adjustment_reason: reason || 'Manual entry for missed punch',
          });

        if (entryError) throw entryError;

        // Update exception as resolved
        const { error: updateError } = await supabase
          .from('attendance_exceptions')
          .update({
            status: 'resolved',
            exception_type: 'missing_punch_resolved',
            review_notes: `Manual punch entered: ${manualClockIn} - ${manualClockOut}. ${reason}`,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
            auto_resolved: false,
          })
          .eq('id', absence.id);

        if (updateError) throw updateError;

        toast({
          title: "Manual Punch Created",
          description: "Time entry has been created and exception resolved.",
        });

      } else {
        // Update exception with resolution
        const newExceptionType = resolutionType === 'excused' ? 'excused_absence'
          : resolutionType === 'unexcused' ? 'unexcused_absence'
          : resolutionType === 'no_show' ? 'no_show'
          : 'absent';

        const newStatus = resolutionType === 'link_leave' ? 'pending' : 'resolved';

        const { error } = await supabase
          .from('attendance_exceptions')
          .update({
            status: newStatus,
            exception_type: newExceptionType,
            reason: reason,
            review_notes: `Marked as ${resolutionType.replace('_', ' ')} by timekeeper`,
            reviewed_by: user?.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', absence.id);

        if (error) throw error;

        toast({
          title: "Absence Updated",
          description: `Marked as ${resolutionType.replace('_', ' ')}.`,
        });
      }

      onOpenChange(false);
      onSuccess();

    } catch (error) {
      console.error('Error handling absence:', error);
      toast({
        title: "Error",
        description: "Failed to update absence. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = format(new Date(absence.exception_date), "EEEE, MMMM d, yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-destructive" />
            Handle Absence
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Absence Info */}
          <div className="p-3 bg-destructive/10 rounded-lg space-y-2">
            <p className="font-medium">{absence.employee?.full_name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
            {absence.shifts && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {absence.shifts.name}: {absence.shifts.start_time} - {absence.shifts.end_time}
              </div>
            )}
            <Badge variant="destructive" className="mt-2">
              No Punch Recorded
            </Badge>
          </div>

          {/* Resolution Options */}
          <div className="space-y-3">
            <Label>Resolution Type</Label>
            <RadioGroup value={resolutionType} onValueChange={(v) => setResolutionType(v as ResolutionType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excused" id="excused" />
                <Label htmlFor="excused" className="font-normal cursor-pointer">
                  Excused Absence (sick, emergency, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unexcused" id="unexcused" />
                <Label htmlFor="unexcused" className="font-normal cursor-pointer">
                  Unexcused Absence
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_show" id="no_show" />
                <Label htmlFor="no_show" className="font-normal cursor-pointer">
                  No-Show (disciplinary)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual_punch" id="manual_punch" />
                <Label htmlFor="manual_punch" className="font-normal cursor-pointer">
                  Enter Manual Punch (forgot to clock in)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="link_leave" id="link_leave" />
                <Label htmlFor="link_leave" className="font-normal cursor-pointer">
                  Link to Leave Request
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Manual Punch Inputs */}
          {resolutionType === 'manual_punch' && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="clock-in">Clock In Time</Label>
                <Input
                  id="clock-in"
                  type="time"
                  value={manualClockIn}
                  onChange={(e) => setManualClockIn(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clock-out">Clock Out Time</Label>
                <Input
                  id="clock-out"
                  type="time"
                  value={manualClockOut}
                  onChange={(e) => setManualClockOut(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Reason/Notes */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              {resolutionType === 'manual_punch' ? 'Notes (optional)' : 'Reason'} 
              {resolutionType !== 'manual_punch' && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                resolutionType === 'excused' ? "e.g., Called in sick, doctor's note provided" :
                resolutionType === 'unexcused' ? "e.g., No call, no show" :
                resolutionType === 'no_show' ? "e.g., Second occurrence this month" :
                resolutionType === 'manual_punch' ? "e.g., Forgot to punch, confirmed by supervisor" :
                "Additional notes..."
              }
              rows={3}
            />
          </div>

          {/* Warning for disciplinary actions */}
          {(resolutionType === 'no_show' || resolutionType === 'unexcused') && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-700">
                This will be recorded for Bradford Factor calculation and may trigger disciplinary workflows.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Resolution"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
