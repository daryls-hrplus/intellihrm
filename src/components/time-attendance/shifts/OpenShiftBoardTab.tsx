import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useOpenShifts } from "@/hooks/useOpenShifts";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { Briefcase, Plus, Hand, Check, X, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OpenShiftBoardTabProps {
  companyId: string;
}

export function OpenShiftBoardTab({ companyId }: OpenShiftBoardTabProps) {
  const { openShifts, isLoading, createOpenShift, claimOpenShift, reviewClaim, cancelOpenShift } = useOpenShifts(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shifts, setShifts] = useState<{ id: string; name: string; code: string; start_time: string; end_time: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    shift_id: "",
    shift_date: getTodayString(),
    start_time: "09:00",
    end_time: "17:00",
    positions_available: 1,
    department_id: "",
    location_name: "",
    premium_rate: "",
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [shiftRes, deptRes] = await Promise.all([
        supabase.from("shifts").select("id, name, code, start_time, end_time").eq("company_id", companyId).eq("is_active", true),
        supabase.from("departments").select("id, name").eq("company_id", companyId),
      ]);
      setShifts(shiftRes.data || []);
      setDepartments(deptRes.data || []);
    };
    loadData();
  }, [companyId]);

  const handleShiftSelect = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      setFormData(p => ({
        ...p,
        shift_id: shiftId,
        start_time: shift.start_time,
        end_time: shift.end_time,
      }));
    }
  };

  const handleSubmit = async () => {
    await createOpenShift({
      shift_id: formData.shift_id,
      shift_date: formData.shift_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      positions_available: formData.positions_available,
      department_id: formData.department_id || undefined,
      location_name: formData.location_name || undefined,
      premium_rate: formData.premium_rate ? parseFloat(formData.premium_rate) : undefined,
      notes: formData.notes || undefined,
    });
    setDialogOpen(false);
    setFormData({
      shift_id: "",
      shift_date: getTodayString(),
      start_time: "09:00",
      end_time: "17:00",
      positions_available: 1,
      department_id: "",
      location_name: "",
      premium_rate: "",
      notes: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500";
      case "filled": return "bg-blue-500";
      case "expired": return "bg-gray-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const activeShifts = openShifts.filter(s => s.status === "open");
  const otherShifts = openShifts.filter(s => s.status !== "open");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Open Shift Board
          </h3>
          <p className="text-sm text-muted-foreground">Post shifts for employees to claim</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Post Open Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Post Open Shift</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shift Type</Label>
                  <Select value={formData.shift_id} onValueChange={handleShiftSelect}>
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      {shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={formData.shift_date} onChange={e => setFormData(p => ({ ...p, shift_date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" value={formData.start_time} onChange={e => setFormData(p => ({ ...p, start_time: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={formData.end_time} onChange={e => setFormData(p => ({ ...p, end_time: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Positions Available</Label>
                  <Input type="number" min={1} value={formData.positions_available} onChange={e => setFormData(p => ({ ...p, positions_available: parseInt(e.target.value) || 1 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Premium Rate (%)</Label>
                  <Input type="number" placeholder="e.g., 10" value={formData.premium_rate} onChange={e => setFormData(p => ({ ...p, premium_rate: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={formData.department_id} onValueChange={v => setFormData(p => ({ ...p, department_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All departments</SelectItem>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g., Main Office" value={formData.location_name} onChange={e => setFormData(p => ({ ...p, location_name: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Additional details..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!formData.shift_id}>Post Shift</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <>
          {/* Active Open Shifts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeShifts.map(shift => (
              <Card key={shift.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(shift.status)}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base" style={{ color: shift.shift?.color }}>
                        {shift.shift?.name || "Unknown Shift"}
                      </CardTitle>
                      <CardDescription>
                        {formatDateForDisplay(shift.shift_date)} • {shift.start_time} - {shift.end_time}
                      </CardDescription>
                    </div>
                    {shift.premium_rate && (
                      <Badge variant="secondary">+{shift.premium_rate}%</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{shift.positions_filled} / {shift.positions_available} filled</span>
                  </div>
                  {shift.department?.name && (
                    <div className="text-sm text-muted-foreground">{shift.department.name}</div>
                  )}
                  {shift.location_name && (
                    <div className="text-sm text-muted-foreground">{shift.location_name}</div>
                  )}
                  
                  {/* Claims */}
                  {shift.claims && shift.claims.length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <div className="text-sm font-medium mb-2">Claims ({shift.claims.length})</div>
                      {shift.claims.filter(c => c.status === "pending").map(claim => (
                        <div key={claim.id} className="flex items-center justify-between py-1">
                          <span className="text-sm">{claim.employee?.full_name}</span>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reviewClaim(claim.id, "approved")}>
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reviewClaim(claim.id, "rejected")}>
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => claimOpenShift(shift.id)}>
                      <Hand className="h-4 w-4 mr-1" />
                      Claim
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => cancelOpenShift(shift.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeShifts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              No open shifts available
            </div>
          )}

          {/* Closed Shifts */}
          {otherShifts.length > 0 && (
            <div className="mt-8">
              <h4 className="font-medium mb-4 text-muted-foreground">Past / Filled Shifts</h4>
              <div className="grid gap-2">
                {otherShifts.slice(0, 5).map(shift => (
                  <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div>
                      <span className="font-medium">{shift.shift?.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {formatDateForDisplay(shift.shift_date)}
                      </span>
                    </div>
                    <Badge variant={shift.status === "filled" ? "default" : "outline"}>{shift.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
