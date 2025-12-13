import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CalendarPlus, CalendarDays } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export default function ApplyLeavePage() {
  const navigate = useNavigate();
  const { leaveTypes, leaveBalances, createLeaveRequest, loadingTypes } = useLeaveManagement();
  const [formData, setFormData] = useState({
    leave_type_id: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    start_half: "full" as "full" | "first_half" | "second_half",
    end_half: "full" as "full" | "first_half" | "second_half",
    reason: "",
    contact_during_leave: "",
    handover_notes: "",
  });

  const selectedType = leaveTypes.find((t) => t.id === formData.leave_type_id);
  const selectedBalance = leaveBalances.find((b) => b.leave_type_id === formData.leave_type_id);

  // Calculate duration
  const calculateDuration = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const daysDiff = differenceInDays(formData.end_date, formData.start_date) + 1;
    let duration = daysDiff;

    // Adjust for half days
    if (formData.start_half !== "full") duration -= 0.5;
    if (formData.end_half !== "full" && formData.start_date !== formData.end_date) duration -= 0.5;

    return Math.max(0, duration);
  };

  const duration = calculateDuration();

  const handleSubmit = async () => {
    if (!formData.leave_type_id || !formData.start_date || !formData.end_date) return;

    await createLeaveRequest.mutateAsync({
      leave_type_id: formData.leave_type_id,
      start_date: format(formData.start_date, "yyyy-MM-dd"),
      end_date: format(formData.end_date, "yyyy-MM-dd"),
      start_half: formData.start_half,
      end_half: formData.end_half,
      duration,
      reason: formData.reason || undefined,
      contact_during_leave: formData.contact_during_leave || undefined,
      handover_notes: formData.handover_notes || undefined,
      status: "pending",
    });

    navigate("/leave/my-leave");
  };

  const isValid = formData.leave_type_id && formData.start_date && formData.end_date && duration > 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Apply for Leave" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CalendarPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Apply for Leave</h1>
            <p className="text-muted-foreground">Submit a new leave request</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="leave_type">Leave Type *</Label>
            <Select
              value={formData.leave_type_id}
              onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => {
                  const balance = leaveBalances.find((b) => b.leave_type_id === type.id);
                  return (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                        <span>{type.name}</span>
                        {balance && (
                          <span className="text-muted-foreground">
                            ({balance.current_balance} available)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedType && selectedBalance && (
              <p className="text-sm text-muted-foreground">
                Available balance: <span className="font-medium text-foreground">{selectedBalance.current_balance}</span> {selectedType.accrual_unit}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => {
                      setFormData({ 
                        ...formData, 
                        start_date: date,
                        end_date: formData.end_date && date && date > formData.end_date ? date : formData.end_date 
                      });
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={formData.start_half}
                onValueChange={(value: "full" | "first_half" | "second_half") => 
                  setFormData({ ...formData, start_half: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Day</SelectItem>
                  <SelectItem value="first_half">First Half</SelectItem>
                  <SelectItem value="second_half">Second Half</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    disabled={(date) => date < (formData.start_date || new Date())}
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={formData.end_half}
                onValueChange={(value: "full" | "first_half" | "second_half") => 
                  setFormData({ ...formData, end_half: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Day</SelectItem>
                  <SelectItem value="first_half">First Half</SelectItem>
                  <SelectItem value="second_half">Second Half</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="rounded-lg bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-bold text-primary">
                {duration} {selectedType?.accrual_unit || "days"}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Optional: Provide a reason for your leave request"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact During Leave</Label>
            <Input
              id="contact"
              value={formData.contact_during_leave}
              onChange={(e) => setFormData({ ...formData, contact_during_leave: e.target.value })}
              placeholder="Phone number or email for emergencies"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handover">Handover Notes</Label>
            <Textarea
              id="handover"
              value={formData.handover_notes}
              onChange={(e) => setFormData({ ...formData, handover_notes: e.target.value })}
              placeholder="Any handover instructions for your team"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate("/leave")}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isValid || createLeaveRequest.isPending}
            >
              {createLeaveRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
