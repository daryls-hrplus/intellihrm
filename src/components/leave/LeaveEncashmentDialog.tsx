import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Banknote, Wallet } from "lucide-react";
import { useLeaveEncashment } from "@/hooks/useLeaveEnhancements";
import { useLeaveManagement, LeaveType, LeaveBalance } from "@/hooks/useLeaveManagement";
import { Card, CardContent } from "@/components/ui/card";

interface LeaveEncashmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveBalances: LeaveBalance[];
  leaveTypes: LeaveType[];
}

export function LeaveEncashmentDialog({ open, onOpenChange, leaveBalances, leaveTypes }: LeaveEncashmentDialogProps) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [daysRequested, setDaysRequested] = useState("");
  const [reason, setReason] = useState("");
  const { createEncashment } = useLeaveEncashment();

  const encashableTypes = leaveTypes.filter(lt => lt.can_be_encashed);
  const selectedBalance = leaveBalances.find(b => b.leave_type_id === leaveTypeId);
  const selectedType = leaveTypes.find(lt => lt.id === leaveTypeId);
  const maxDays = selectedBalance?.current_balance || 0;
  const days = parseFloat(daysRequested) || 0;
  const estimatedAmount = selectedType?.encashment_rate ? days * selectedType.encashment_rate : null;

  const handleSubmit = async () => {
    if (!leaveTypeId || days <= 0 || days > maxDays) return;
    
    await createEncashment.mutateAsync({
      leave_type_id: leaveTypeId,
      days_requested: days,
      rate_per_day: selectedType?.encashment_rate,
      reason: reason.trim() || undefined,
    });
    
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setLeaveTypeId("");
    setDaysRequested("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) resetForm(); onOpenChange(open); }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Request Leave Encashment
          </DialogTitle>
          <DialogDescription>
            Convert your unused leave balance to cash payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {encashableTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No leave types are configured for encashment.</p>
            </div>
          ) : (
            <>
              {/* Leave Type Selection */}
              <div className="space-y-2">
                <Label>Leave Type *</Label>
                <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {encashableTypes.map((lt) => {
                      const balance = leaveBalances.find(b => b.leave_type_id === lt.id);
                      return (
                        <SelectItem key={lt.id} value={lt.id}>
                          <div className="flex items-center justify-between w-full gap-4">
                            <span>{lt.name}</span>
                            <Badge variant="secondary">{balance?.current_balance || 0} days available</Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedBalance && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Available Balance</span>
                        <p className="font-semibold text-lg">{selectedBalance.current_balance} days</p>
                      </div>
                      {selectedType?.encashment_rate && (
                        <div>
                          <span className="text-muted-foreground">Rate per Day</span>
                          <p className="font-semibold text-lg">${selectedType.encashment_rate.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Days Requested */}
              <div className="space-y-2">
                <Label>Days to Encash *</Label>
                <Input
                  type="number"
                  min={0.5}
                  max={maxDays}
                  step={0.5}
                  value={daysRequested}
                  onChange={(e) => setDaysRequested(e.target.value)}
                  placeholder={`Max ${maxDays} days`}
                />
                {days > maxDays && (
                  <p className="text-sm text-destructive">Cannot exceed available balance</p>
                )}
              </div>

              {/* Estimated Amount */}
              {estimatedAmount !== null && days > 0 && days <= maxDays && (
                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Payment</span>
                    <span className="text-xl font-bold text-primary">${estimatedAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Final amount may vary based on HR review
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <Label>Reason (Optional)</Label>
                <Textarea
                  placeholder="Add any notes or reason for encashment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!leaveTypeId || days <= 0 || days > maxDays || createEncashment.isPending}
          >
            {createEncashment.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
