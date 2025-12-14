import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t } = useLanguage();
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
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.apply.title") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <CalendarPlus className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("leave.apply.title")}</h1>
            <p className="text-muted-foreground">{t("leave.apply.subtitle")}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          {/* Leave Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="leave_type">{t("leave.apply.leaveType")} *</Label>
            <Select
              value={formData.leave_type_id}
              onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("leave.apply.selectLeaveType")} />
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
                            ({balance.current_balance} {t("leave.apply.available")})
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
                {t("leave.apply.availableBalance")}: <span className="font-medium text-foreground">{selectedBalance.current_balance}</span> {selectedType.accrual_unit}
              </p>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("leave.apply.startDate")} *</Label>
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
                    {formData.start_date ? format(formData.start_date, "PPP") : t("leave.apply.selectDate")}
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
                  <SelectItem value="full">{t("leave.apply.fullDay")}</SelectItem>
                  <SelectItem value="first_half">{t("leave.apply.firstHalf")}</SelectItem>
                  <SelectItem value="second_half">{t("leave.apply.secondHalf")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("leave.apply.endDate")} *</Label>
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
                    {formData.end_date ? format(formData.end_date, "PPP") : t("leave.apply.selectDate")}
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
                  <SelectItem value="full">{t("leave.apply.fullDay")}</SelectItem>
                  <SelectItem value="first_half">{t("leave.apply.firstHalf")}</SelectItem>
                  <SelectItem value="second_half">{t("leave.apply.secondHalf")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="rounded-lg bg-primary/5 p-4 text-center">
              <p className="text-sm text-muted-foreground">{t("leave.apply.totalDuration")}</p>
              <p className="text-2xl font-bold text-primary">
                {duration} {selectedType?.accrual_unit || t("leave.leaveTypes.days").toLowerCase()}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t("leave.apply.reason")}</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder={t("leave.apply.reasonPlaceholder")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">{t("leave.apply.contactDuringLeave")}</Label>
            <Input
              id="contact"
              value={formData.contact_during_leave}
              onChange={(e) => setFormData({ ...formData, contact_during_leave: e.target.value })}
              placeholder={t("leave.apply.contactPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="handover">{t("leave.apply.handoverNotes")}</Label>
            <Textarea
              id="handover"
              value={formData.handover_notes}
              onChange={(e) => setFormData({ ...formData, handover_notes: e.target.value })}
              placeholder={t("leave.apply.handoverPlaceholder")}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => navigate("/leave")}>
              {t("leave.common.cancel")}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!isValid || createLeaveRequest.isPending}
            >
              {createLeaveRequest.isPending ? t("leave.apply.submitting") : t("leave.apply.submitRequest")}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
