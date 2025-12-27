import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useShiftSwapRequests } from "@/hooks/useShiftSwapRequests";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { ArrowLeftRight, Plus, Check, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface ShiftSwapRequestsTabProps {
  companyId: string;
}

export function ShiftSwapRequestsTab({ companyId }: ShiftSwapRequestsTabProps) {
  const { t } = useTranslation();
  const { swapRequests, isLoading, createSwapRequest, updateSwapRequestStatus } = useShiftSwapRequests(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  const [assignments, setAssignments] = useState<{ id: string; employee_id: string; shift: { name: string } | null }[]>([]);
  const [formData, setFormData] = useState({
    requester_id: "",
    requester_shift_assignment_id: "",
    target_employee_id: "",
    target_shift_assignment_id: "",
    swap_date: getTodayString(),
    reason: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [empRes, assignRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name").eq("company_id", companyId).order("full_name"),
        supabase.from("employee_shift_assignments").select("id, employee_id, shift:shifts(name)").eq("company_id", companyId),
      ]);
      setEmployees(empRes.data || []);
      setAssignments((assignRes.data || []) as typeof assignments);
    };
    loadData();
  }, [companyId]);

  const handleSubmit = async () => {
    await createSwapRequest({
      requester_id: formData.requester_id,
      requester_shift_assignment_id: formData.requester_shift_assignment_id,
      target_employee_id: formData.target_employee_id || undefined,
      target_shift_assignment_id: formData.target_shift_assignment_id || undefined,
      swap_date: formData.swap_date,
      reason: formData.reason || undefined,
    });
    setDialogOpen(false);
    setFormData({
      requester_id: "",
      requester_shift_assignment_id: "",
      target_employee_id: "",
      target_shift_assignment_id: "",
      swap_date: getTodayString(),
      reason: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      accepted: "default",
      approved: "default",
      completed: "default",
      rejected: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const requesterAssignments = assignments.filter(a => a.employee_id === formData.requester_id);
  const targetAssignments = assignments.filter(a => a.employee_id === formData.target_employee_id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5" />
          {t("timeAttendance.shifts.swap.title")}
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("timeAttendance.shifts.swap.requestSwap")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("timeAttendance.shifts.swap.requestSwap")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("timeAttendance.shifts.swap.requester")}</Label>
                  <Select value={formData.requester_id} onValueChange={v => setFormData(p => ({ ...p, requester_id: v, requester_shift_assignment_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Requester's Shift</Label>
                  <Select value={formData.requester_shift_assignment_id} onValueChange={v => setFormData(p => ({ ...p, requester_shift_assignment_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      {requesterAssignments.map(a => <SelectItem key={a.id} value={a.id}>{a.shift?.name || "Unknown"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Swap With (Optional)</Label>
                  <Select value={formData.target_employee_id} onValueChange={v => setFormData(p => ({ ...p, target_employee_id: v, target_shift_assignment_id: "" }))}>
                    <SelectTrigger><SelectValue placeholder="Any available" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any available</SelectItem>
                      {employees.filter(e => e.id !== formData.requester_id).map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target's Shift</Label>
                  <Select value={formData.target_shift_assignment_id} onValueChange={v => setFormData(p => ({ ...p, target_shift_assignment_id: v }))} disabled={!formData.target_employee_id}>
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      {targetAssignments.map(a => <SelectItem key={a.id} value={a.id}>{a.shift?.name || "Unknown"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Swap Date</Label>
                <Input type="date" value={formData.swap_date} onChange={e => setFormData(p => ({ ...p, swap_date: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea value={formData.reason} onChange={e => setFormData(p => ({ ...p, reason: e.target.value }))} placeholder="Why do you need to swap?" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!formData.requester_id || !formData.requester_shift_assignment_id}>Submit Request</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">{t("common.loading")}</div>
        ) : swapRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{t("timeAttendance.shifts.swap.noRequests")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requester</TableHead>
                <TableHead>Their Shift</TableHead>
                <TableHead>Swap With</TableHead>
                <TableHead>Their Shift</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swapRequests.map(req => (
                <TableRow key={req.id}>
                  <TableCell>{req.requester?.full_name || "Unknown"}</TableCell>
                  <TableCell>{req.requester_assignment?.shift?.name || "-"}</TableCell>
                  <TableCell>{req.target_employee?.full_name || "Open"}</TableCell>
                  <TableCell>{req.target_assignment?.shift?.name || "-"}</TableCell>
                  <TableCell>{formatDateForDisplay(req.swap_date)}</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell>
                    {req.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => updateSwapRequestStatus(req.id, "approved", undefined, true)}>
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => updateSwapRequestStatus(req.id, "rejected", undefined, true)}>
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                    {req.status === "accepted" && (
                      <Button size="sm" variant="outline" onClick={() => updateSwapRequestStatus(req.id, "approved", undefined, true)}>
                        <Clock className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
