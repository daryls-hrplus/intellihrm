import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Moon, Sun, Calendar } from "lucide-react";

interface ShiftDifferential {
  id: string;
  company_id: string;
  name: string;
  code: string;
  differential_type: string;
  start_time: string;
  end_time: string;
  applies_to_days: string[];
  multiplier: number;
  flat_amount: number;
  calculation_method: string;
  min_hours_for_differential: number;
  is_active: boolean;
  priority: number;
  effective_start_date: string | null;
  effective_end_date: string | null;
}

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const DIFFERENTIAL_TYPES = [
  { value: "night", label: "Night Shift", icon: Moon },
  { value: "evening", label: "Evening Shift", icon: Moon },
  { value: "early_morning", label: "Early Morning", icon: Sun },
  { value: "weekend", label: "Weekend", icon: Calendar },
  { value: "holiday", label: "Holiday", icon: Calendar },
  { value: "custom", label: "Custom", icon: Calendar },
];

const DEFAULT_DIFFERENTIAL: Partial<ShiftDifferential> = {
  name: "",
  code: "",
  differential_type: "night",
  start_time: "18:00",
  end_time: "06:00",
  applies_to_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  multiplier: 1.15,
  flat_amount: 0,
  calculation_method: "multiplier",
  min_hours_for_differential: 2,
  is_active: true,
  priority: 1,
};

export default function ShiftDifferentialsPage() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const [differentials, setDifferentials] = useState<ShiftDifferential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<ShiftDifferential>>(DEFAULT_DIFFERENTIAL);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (companyId) fetchDifferentials();
  }, [companyId]);

  const fetchDifferentials = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("shift_differentials")
      .select("*")
      .eq("company_id", companyId)
      .order("priority");

    if (error) {
      toast.error("Failed to load shift differentials");
    } else {
      setDifferentials(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!companyId || !editing.name || !editing.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: editing.name,
        code: editing.code,
        differential_type: editing.differential_type,
        start_time: editing.start_time,
        end_time: editing.end_time,
        applies_to_days: editing.applies_to_days,
        multiplier: editing.multiplier,
        flat_amount: editing.flat_amount,
        calculation_method: editing.calculation_method,
        min_hours_for_differential: editing.min_hours_for_differential,
        is_active: editing.is_active,
        priority: editing.priority,
        company_id: companyId,
      };

      if (editing.id) {
        const { error } = await supabase
          .from("shift_differentials")
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        toast.success("Shift differential updated");
      } else {
        const { error } = await supabase
          .from("shift_differentials")
          .insert(payload);
        if (error) throw error;
        toast.success("Shift differential created");
      }

      setIsDialogOpen(false);
      setEditing(DEFAULT_DIFFERENTIAL);
      fetchDifferentials();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shift differential?")) return;
    const { error } = await supabase.from("shift_differentials").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted");
      fetchDifferentials();
    }
  };

  const getTypeIcon = (type: string) => {
    const found = DIFFERENTIAL_TYPES.find(t => t.value === type);
    if (found) {
      const Icon = found.icon;
      return <Icon className="h-4 w-4" />;
    }
    return null;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Time & Attendance", href: "/time" },
            { label: "Shift Differentials" }
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shift Differentials</h1>
            <p className="text-muted-foreground">
              Configure premium pay for night, weekend, and holiday shifts
            </p>
          </div>
          <Button onClick={() => { setEditing(DEFAULT_DIFFERENTIAL); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Differential
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configured Differentials</CardTitle>
            <CardDescription>
              Differentials are applied automatically based on clock-in times
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : differentials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shift differentials configured. Add one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {differentials.map((diff) => (
                    <TableRow key={diff.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{diff.name}</div>
                          <div className="text-xs text-muted-foreground">{diff.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(diff.differential_type)}
                          <span className="capitalize">{diff.differential_type.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {diff.start_time} - {diff.end_time}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {DAYS_OF_WEEK.filter(d => diff.applies_to_days?.includes(d.value)).map(d => (
                            <Badge key={d.value} variant="outline" className="text-xs">
                              {d.label}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {diff.calculation_method === "multiplier" || diff.calculation_method === "both" ? (
                          <Badge variant="secondary">{diff.multiplier}x</Badge>
                        ) : null}
                        {diff.calculation_method === "flat" || diff.calculation_method === "both" ? (
                          <Badge variant="outline">+${diff.flat_amount}</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant={diff.is_active ? "default" : "secondary"}>
                          {diff.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditing(diff); setIsDialogOpen(true); }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(diff.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing.id ? "Edit" : "Add"} Shift Differential</DialogTitle>
              <DialogDescription>
                Configure when and how the differential applies
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={editing.name || ""}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Night Shift Premium"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={editing.code || ""}
                    onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                    placeholder="NIGHT_DIFF"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editing.differential_type}
                    onValueChange={(v) => setEditing({ ...editing, differential_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFERENTIAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Calculation Method</Label>
                  <Select
                    value={editing.calculation_method}
                    onValueChange={(v) => setEditing({ ...editing, calculation_method: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiplier">Multiplier Only</SelectItem>
                      <SelectItem value="flat">Flat Amount Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={editing.start_time || ""}
                    onChange={(e) => setEditing({ ...editing, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editing.end_time || ""}
                    onChange={(e) => setEditing({ ...editing, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Multiplier</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.multiplier || ""}
                    onChange={(e) => setEditing({ ...editing, multiplier: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Flat Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editing.flat_amount || ""}
                    onChange={(e) => setEditing({ ...editing, flat_amount: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Applies to Days</Label>
                <div className="flex flex-wrap gap-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={editing.applies_to_days?.includes(day.value)}
                        onCheckedChange={(checked) => {
                          const days = editing.applies_to_days || [];
                          setEditing({
                            ...editing,
                            applies_to_days: checked
                              ? [...days, day.value]
                              : days.filter(d => d !== day.value)
                          });
                        }}
                      />
                      <Label htmlFor={day.value}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Hours Required</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editing.min_hours_for_differential || ""}
                    onChange={(e) => setEditing({ ...editing, min_hours_for_differential: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={editing.priority || ""}
                    onChange={(e) => setEditing({ ...editing, priority: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editing.is_active}
                  onCheckedChange={(checked) => setEditing({ ...editing, is_active: checked })}
                />
                <Label>Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
