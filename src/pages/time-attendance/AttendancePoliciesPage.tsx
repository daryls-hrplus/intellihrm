import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Shield } from "lucide-react";

interface AttendancePolicy {
  id: string;
  name: string;
  code: string;
  description: string | null;
  grace_period_minutes: number;
  late_threshold_minutes: number;
  early_departure_threshold_minutes: number;
  auto_deduct_late: boolean;
  late_deduction_minutes: number;
  round_clock_in: string;
  round_clock_out: string;
  require_photo_clock_in: boolean;
  require_photo_clock_out: boolean;
  require_geolocation: boolean;
  max_daily_hours: number;
  is_default: boolean;
  is_active: boolean;
}

const roundingOptions = [
  { value: "none", label: "No Rounding" },
  { value: "nearest_5", label: "Nearest 5 min" },
  { value: "nearest_15", label: "Nearest 15 min" },
  { value: "nearest_30", label: "Nearest 30 min" },
  { value: "up", label: "Round Up" },
  { value: "down", label: "Round Down" },
];

export default function AttendancePoliciesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    grace_period_minutes: 0,
    late_threshold_minutes: 15,
    early_departure_threshold_minutes: 15,
    auto_deduct_late: false,
    late_deduction_minutes: 0,
    round_clock_in: "none",
    round_clock_out: "none",
    require_photo_clock_in: false,
    require_photo_clock_out: false,
    require_geolocation: false,
    max_daily_hours: 24,
    is_default: false,
  });

  useEffect(() => {
    if (profile?.company_id) loadPolicies();
  }, [profile?.company_id]);

  const loadPolicies = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("attendance_policies")
      .select("*")
      .eq("company_id", profile?.company_id)
      .order("name");
    if (data) setPolicies(data);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!profile?.company_id) return;
    try {
      const payload = { ...formData, company_id: profile.company_id };
      if (editingPolicy) {
        await supabase.from("attendance_policies").update(payload).eq("id", editingPolicy.id);
        toast({ title: "Policy updated" });
      } else {
        await supabase.from("attendance_policies").insert(payload);
        toast({ title: "Policy created" });
      }
      setDialogOpen(false);
      resetForm();
      loadPolicies();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save policy", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("attendance_policies").delete().eq("id", id);
    toast({ title: "Policy deleted" });
    loadPolicies();
  };

  const openEdit = (policy: AttendancePolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      code: policy.code,
      description: policy.description || "",
      grace_period_minutes: policy.grace_period_minutes,
      late_threshold_minutes: policy.late_threshold_minutes,
      early_departure_threshold_minutes: policy.early_departure_threshold_minutes,
      auto_deduct_late: policy.auto_deduct_late,
      late_deduction_minutes: policy.late_deduction_minutes,
      round_clock_in: policy.round_clock_in,
      round_clock_out: policy.round_clock_out,
      require_photo_clock_in: policy.require_photo_clock_in,
      require_photo_clock_out: policy.require_photo_clock_out,
      require_geolocation: policy.require_geolocation,
      max_daily_hours: policy.max_daily_hours,
      is_default: policy.is_default,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPolicy(null);
    setFormData({
      name: "", code: "", description: "", grace_period_minutes: 0, late_threshold_minutes: 15,
      early_departure_threshold_minutes: 15, auto_deduct_late: false, late_deduction_minutes: 0,
      round_clock_in: "none", round_clock_out: "none", require_photo_clock_in: false,
      require_photo_clock_out: false, require_geolocation: false, max_daily_hours: 24, is_default: false,
    });
  };

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Time & Attendance", href: "/time-attendance" }, { label: "Attendance Policies" }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold">Attendance Policies</h1>
              <p className="text-muted-foreground">Configure late rules, rounding, and requirements</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Policy</Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Grace Period</TableHead>
                <TableHead>Late Threshold</TableHead>
                <TableHead>Rounding</TableHead>
                <TableHead>Requirements</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No policies configured</TableCell></TableRow>
              ) : policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div className="font-medium">{policy.name}</div>
                    <div className="text-sm text-muted-foreground">{policy.code}</div>
                  </TableCell>
                  <TableCell>{policy.grace_period_minutes} min</TableCell>
                  <TableCell>{policy.late_threshold_minutes} min</TableCell>
                  <TableCell>
                    <div className="text-sm">In: {roundingOptions.find(r => r.value === policy.round_clock_in)?.label}</div>
                    <div className="text-sm">Out: {roundingOptions.find(r => r.value === policy.round_clock_out)?.label}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {policy.require_photo_clock_in && <Badge variant="outline">Photo In</Badge>}
                      {policy.require_photo_clock_out && <Badge variant="outline">Photo Out</Badge>}
                      {policy.require_geolocation && <Badge variant="outline">GPS</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{policy.is_default && <Badge>Default</Badge>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(policy)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(policy.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingPolicy ? "Edit Policy" : "Add Attendance Policy"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Code *</Label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Time Thresholds</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Grace Period (min)</Label><Input type="number" value={formData.grace_period_minutes} onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Late Threshold (min)</Label><Input type="number" value={formData.late_threshold_minutes} onChange={(e) => setFormData({ ...formData, late_threshold_minutes: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-2"><Label>Early Departure (min)</Label><Input type="number" value={formData.early_departure_threshold_minutes} onChange={(e) => setFormData({ ...formData, early_departure_threshold_minutes: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Rounding Rules</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clock In Rounding</Label>
                  <Select value={formData.round_clock_in} onValueChange={(v) => setFormData({ ...formData, round_clock_in: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roundingOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Clock Out Rounding</Label>
                  <Select value={formData.round_clock_out} onValueChange={(v) => setFormData({ ...formData, round_clock_out: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{roundingOptions.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Requirements & Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Require Photo on Clock In</Label><Switch checked={formData.require_photo_clock_in} onCheckedChange={(v) => setFormData({ ...formData, require_photo_clock_in: v })} /></div>
                <div className="flex items-center justify-between"><Label>Require Photo on Clock Out</Label><Switch checked={formData.require_photo_clock_out} onCheckedChange={(v) => setFormData({ ...formData, require_photo_clock_out: v })} /></div>
                <div className="flex items-center justify-between"><Label>Require Geolocation</Label><Switch checked={formData.require_geolocation} onCheckedChange={(v) => setFormData({ ...formData, require_geolocation: v })} /></div>
                <div className="flex items-center justify-between"><Label>Auto-deduct Late Time</Label><Switch checked={formData.auto_deduct_late} onCheckedChange={(v) => setFormData({ ...formData, auto_deduct_late: v })} /></div>
                <div className="flex items-center justify-between"><Label>Set as Default Policy</Label><Switch checked={formData.is_default} onCheckedChange={(v) => setFormData({ ...formData, is_default: v })} /></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.code}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
