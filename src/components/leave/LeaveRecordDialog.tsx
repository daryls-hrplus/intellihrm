import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { LeaveRequest, LeaveType } from "@/hooks/useLeaveManagement";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface LeaveRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest | null;
  leaveTypes: LeaveType[];
  companyId?: string;
  onSave: (data: Partial<LeaveRequest>) => void;
  isSaving: boolean;
}

export function LeaveRecordDialog({
  open,
  onOpenChange,
  request,
  leaveTypes,
  companyId,
  onSave,
  isSaving,
}: LeaveRecordDialogProps) {
  const { t } = useLanguage();
  const isEditing = !!request;

  // Form state
  const [employeeId, setEmployeeId] = useState("");
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<LeaveRequest["status"]>("approved");

  // Fetch employees for the company
  const { data: employees = [] } = useQuery({
    queryKey: ["employees-for-leave", companyId],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("is_active", true)
        .order("full_name");

      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (request) {
        setEmployeeId(request.employee_id);
        setLeaveTypeId(request.leave_type_id);
        setStartDate(request.start_date);
        setEndDate(request.end_date);
        setDuration(request.duration.toString());
        setReason(request.reason || "");
        setStatus(request.status);
      } else {
        setEmployeeId("");
        setLeaveTypeId("");
        setStartDate("");
        setEndDate("");
        setDuration("");
        setReason("");
        setStatus("approved");
      }
    }
  }, [open, request]);

  // Calculate duration when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDuration(diffDays.toString());
    }
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<LeaveRequest> = {
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      duration: parseFloat(duration),
      reason: reason || null,
      status,
      source: "hr_admin",
    };

    if (isEditing) {
      data.id = request.id;
    }

    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("leave.employeeRecords.editRecord", "Edit Leave Record")
              : t("leave.employeeRecords.addRecord", "Add Leave Record")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">{t("leave.employeeRecords.employee", "Employee")}</Label>
            <Select value={employeeId} onValueChange={setEmployeeId} disabled={isEditing}>
              <SelectTrigger>
                <SelectValue placeholder={t("leave.employeeRecords.selectEmployee", "Select employee")} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leaveType">{t("leave.employeeRecords.leaveType", "Leave Type")}</Label>
            <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
              <SelectTrigger>
                <SelectValue placeholder={t("leave.employeeRecords.selectLeaveType", "Select leave type")} />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: type.color }} />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("leave.startDate", "Start Date")}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t("leave.endDate", "End Date")}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">{t("leave.employeeRecords.duration", "Duration (days)")}</Label>
              <Input
                id="duration"
                type="number"
                step="0.5"
                min="0.5"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("leave.common.status", "Status")}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as LeaveRequest["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t("leave.status.pending", "Pending")}</SelectItem>
                  <SelectItem value="approved">{t("leave.status.approved", "Approved")}</SelectItem>
                  <SelectItem value="rejected">{t("leave.status.rejected", "Rejected")}</SelectItem>
                  <SelectItem value="cancelled">{t("leave.status.cancelled", "Cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("leave.reason", "Reason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("leave.reasonPlaceholder", "Optional reason for leave")}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isSaving || !employeeId || !leaveTypeId || !startDate || !endDate}>
              {isSaving
                ? t("common.saving", "Saving...")
                : isEditing
                ? t("common.save", "Save")
                : t("common.create", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
