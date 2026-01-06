import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, set } from "date-fns";
import { Clock, AlertTriangle, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PunchEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  rounded_clock_in: string | null;
  rounded_clock_out: string | null;
  override_clock_in: string | null;
  override_clock_out: string | null;
  override_reason: string | null;
  total_hours: number | null;
  payable_hours: number | null;
  employee?: { full_name: string };
}

interface PunchOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  punch: PunchEntry | null;
  onSuccess: () => void;
}

export function PunchOverrideDialog({ open, onOpenChange, punch, onSuccess }: PunchOverrideDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [overrideClockIn, setOverrideClockIn] = useState("");
  const [overrideClockOut, setOverrideClockOut] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  useEffect(() => {
    if (punch && open) {
      // Pre-fill with existing override or rounded/actual time
      const effectiveIn = punch.override_clock_in || punch.rounded_clock_in || punch.clock_in;
      const effectiveOut = punch.override_clock_out || punch.rounded_clock_out || punch.clock_out;
      
      setOverrideClockIn(effectiveIn ? format(new Date(effectiveIn), "HH:mm") : "");
      setOverrideClockOut(effectiveOut ? format(new Date(effectiveOut), "HH:mm") : "");
      setOverrideReason(punch.override_reason || "");
    }
  }, [punch, open]);

  if (!punch) return null;

  const punchDate = new Date(punch.clock_in);

  const handleSubmit = async () => {
    if (!overrideReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for the override.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert time strings to full timestamps
      const [inHours, inMinutes] = overrideClockIn.split(":").map(Number);
      const [outHours, outMinutes] = overrideClockOut ? overrideClockOut.split(":").map(Number) : [null, null];

      const overrideIn = set(punchDate, { hours: inHours, minutes: inMinutes, seconds: 0 });
      const overrideOut = outHours !== null 
        ? set(punchDate, { hours: outHours, minutes: outMinutes!, seconds: 0 })
        : null;

      // Handle overnight shifts
      let finalOverrideOut = overrideOut;
      if (overrideOut && overrideOut < overrideIn) {
        finalOverrideOut = new Date(overrideOut);
        finalOverrideOut.setDate(finalOverrideOut.getDate() + 1);
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("time_clock_entries")
        .update({
          override_clock_in: overrideIn.toISOString(),
          override_clock_out: finalOverrideOut?.toISOString() || null,
          override_reason: overrideReason.trim(),
          override_by: user?.id,
          override_at: new Date().toISOString(),
        })
        .eq("id", punch.id);

      if (error) throw error;

      toast({
        title: "Override Saved",
        description: "The time entry has been updated with your override.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error saving override:", error);
      toast({
        title: "Error",
        description: "Failed to save override. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearOverride = async () => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("time_clock_entries")
        .update({
          override_clock_in: null,
          override_clock_out: null,
          override_reason: null,
          override_by: null,
          override_at: null,
        })
        .eq("id", punch.id);

      if (error) throw error;

      toast({
        title: "Override Cleared",
        description: "The override has been removed.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error clearing override:", error);
      toast({
        title: "Error",
        description: "Failed to clear override.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "h:mm a");
  };

  const hasExistingOverride = punch.override_clock_in || punch.override_clock_out;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Override Time Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee & Date Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{punch.employee?.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {format(punchDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>

          {/* Current Times Reference */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Actual In:</span>
              <p className="font-medium">{formatTime(punch.clock_in)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Actual Out:</span>
              <p className="font-medium">{formatTime(punch.clock_out)}</p>
            </div>
            {punch.rounded_clock_in && (
              <div>
                <span className="text-muted-foreground">Rounded In:</span>
                <p className="font-medium text-primary">{formatTime(punch.rounded_clock_in)}</p>
              </div>
            )}
            {punch.rounded_clock_out && (
              <div>
                <span className="text-muted-foreground">Rounded Out:</span>
                <p className="font-medium text-primary">{formatTime(punch.rounded_clock_out)}</p>
              </div>
            )}
          </div>

          {hasExistingOverride && (
            <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">This entry has an existing override</span>
            </div>
          )}

          {/* Override Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="override-in">Override Clock In</Label>
              <Input
                id="override-in"
                type="time"
                value={overrideClockIn}
                onChange={(e) => setOverrideClockIn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="override-out">Override Clock Out</Label>
              <Input
                id="override-out"
                type="time"
                value={overrideClockOut}
                onChange={(e) => setOverrideClockOut(e.target.value)}
                disabled={!punch.clock_out}
              />
              {!punch.clock_out && (
                <p className="text-xs text-muted-foreground">Employee still clocked in</p>
              )}
            </div>
          </div>

          {/* Override Reason */}
          <div className="space-y-2">
            <Label htmlFor="override-reason">
              Reason for Override <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="override-reason"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Explain why this override is needed..."
              rows={3}
            />
          </div>

          {/* Preview of payable hours */}
          {overrideClockIn && overrideClockOut && (
            <div className="p-3 bg-green-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Estimated payable hours: {(() => {
                    const [inH, inM] = overrideClockIn.split(":").map(Number);
                    const [outH, outM] = overrideClockOut.split(":").map(Number);
                    let hours = outH - inH + (outM - inM) / 60;
                    if (hours < 0) hours += 24; // overnight
                    return hours.toFixed(2);
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasExistingOverride && (
            <Button
              variant="outline"
              onClick={handleClearOverride}
              disabled={isSubmitting}
              className="text-destructive"
            >
              Clear Override
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Override"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
