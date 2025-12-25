import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  Settings2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CheckInSchedule {
  id: string;
  company_id: string;
  goal_cycle_id: string | null;
  employee_id: string | null;
  goal_id: string | null;
  cadence: string;
  day_of_week: number | null;
  day_of_month: number | null;
  reminder_days_before: number;
  auto_create_check_in: boolean;
  require_manager_review: boolean;
  is_active: boolean;
  goal_cycle?: { name: string } | null;
}

interface CheckInCadenceConfigProps {
  companyId: string;
}

const CADENCE_OPTIONS = [
  { value: "weekly", label: "Weekly", description: "Every week on a specific day" },
  { value: "bi_weekly", label: "Bi-Weekly", description: "Every two weeks" },
  { value: "monthly", label: "Monthly", description: "Once per month on a specific day" },
  { value: "quarterly", label: "Quarterly", description: "Once per quarter" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function CheckInCadenceConfig({ companyId }: CheckInCadenceConfigProps) {
  const [schedules, setSchedules] = useState<CheckInSchedule[]>([]);
  const [goalCycles, setGoalCycles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<CheckInSchedule | null>(null);

  // Form state
  const [goalCycleId, setGoalCycleId] = useState<string>("");
  const [cadence, setCadence] = useState<string>("monthly");
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(15);
  const [reminderDays, setReminderDays] = useState<number>(3);
  const [autoCreate, setAutoCreate] = useState(true);
  const [requireReview, setRequireReview] = useState(true);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from("goal_check_in_schedules")
        .select(`
          *,
          goal_cycle:goal_cycles(name)
        `)
        .eq("company_id", companyId)
        .is("employee_id", null)
        .is("goal_id", null)
        .order("created_at", { ascending: false });

      if (schedulesError) throw schedulesError;
      setSchedules((schedulesData || []) as CheckInSchedule[]);

      // Fetch goal cycles for dropdown
      const { data: cyclesData, error: cyclesError } = await supabase
        .from("goal_cycles")
        .select("id, name")
        .eq("company_id", companyId)
        .order("start_date", { ascending: false });

      if (cyclesError) throw cyclesError;
      setGoalCycles(cyclesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load check-in schedules");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGoalCycleId("");
    setCadence("monthly");
    setDayOfWeek(null);
    setDayOfMonth(15);
    setReminderDays(3);
    setAutoCreate(true);
    setRequireReview(true);
    setEditingSchedule(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        company_id: companyId,
        goal_cycle_id: goalCycleId || null,
        cadence,
        day_of_week: cadence === "weekly" || cadence === "bi_weekly" ? dayOfWeek : null,
        day_of_month: cadence === "monthly" || cadence === "quarterly" ? dayOfMonth : null,
        reminder_days_before: reminderDays,
        auto_create_check_in: autoCreate,
        require_manager_review: requireReview,
        is_active: true,
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from("goal_check_in_schedules")
          .update(data)
          .eq("id", editingSchedule.id);

        if (error) throw error;
        toast.success("Schedule updated successfully");
      } else {
        const { error } = await supabase
          .from("goal_check_in_schedules")
          .insert(data);

        if (error) throw error;
        toast.success("Schedule created successfully");
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goal_check_in_schedules")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Schedule deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("goal_check_in_schedules")
        .update({ is_active: !isActive })
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling schedule:", error);
      toast.error("Failed to update schedule");
    }
  };

  const openEditDialog = (schedule: CheckInSchedule) => {
    setEditingSchedule(schedule);
    setGoalCycleId(schedule.goal_cycle_id || "");
    setCadence(schedule.cadence);
    setDayOfWeek(schedule.day_of_week);
    setDayOfMonth(schedule.day_of_month);
    setReminderDays(schedule.reminder_days_before);
    setAutoCreate(schedule.auto_create_check_in);
    setRequireReview(schedule.require_manager_review);
    setIsDialogOpen(true);
  };

  const getCadenceDescription = (schedule: CheckInSchedule) => {
    const cadenceOption = CADENCE_OPTIONS.find(c => c.value === schedule.cadence);
    let detail = "";

    if (schedule.cadence === "weekly" || schedule.cadence === "bi_weekly") {
      const day = DAYS_OF_WEEK.find(d => d.value === schedule.day_of_week);
      detail = day ? ` on ${day.label}` : "";
    } else if (schedule.cadence === "monthly" || schedule.cadence === "quarterly") {
      detail = schedule.day_of_month ? ` on day ${schedule.day_of_month}` : "";
    }

    return `${cadenceOption?.label || schedule.cadence}${detail}`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Check-in Cadence Configuration
          </CardTitle>
          <CardDescription>
            Configure default check-in schedules for goal cycles
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Edit Schedule" : "Create Check-in Schedule"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Cycle (Optional)</Label>
                <Select value={goalCycleId} onValueChange={setGoalCycleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All cycles (company default)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All cycles (company default)</SelectItem>
                    {goalCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Leave empty to apply as company-wide default
                </p>
              </div>

              <div className="space-y-2">
                <Label>Check-in Cadence</Label>
                <Select value={cadence} onValueChange={setCadence}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CADENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div>{option.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(cadence === "weekly" || cadence === "bi_weekly") && (
                <div className="space-y-2">
                  <Label>Day of Week</Label>
                  <Select
                    value={dayOfWeek?.toString() || ""}
                    onValueChange={(v) => setDayOfWeek(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(cadence === "monthly" || cadence === "quarterly") && (
                <div className="space-y-2">
                  <Label>Day of Month</Label>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={dayOfMonth || ""}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || null)}
                    placeholder="1-28"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use 1-28 to ensure consistent scheduling across all months
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Reminder Days Before</Label>
                <Input
                  type="number"
                  min={0}
                  max={14}
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Send reminder this many days before the check-in is due
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-create Check-ins</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically create pending check-ins on schedule
                  </p>
                </div>
                <Switch checked={autoCreate} onCheckedChange={setAutoCreate} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Manager Review</Label>
                  <p className="text-xs text-muted-foreground">
                    Check-ins require manager review to complete
                  </p>
                </div>
                <Switch checked={requireReview} onCheckedChange={setRequireReview} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editingSchedule ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading schedules...
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-8">
            <Settings2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No check-in schedules configured</p>
            <p className="text-sm text-muted-foreground">
              Create a schedule to define when employees should submit goal check-ins
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scope</TableHead>
                <TableHead>Cadence</TableHead>
                <TableHead>Reminders</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    {schedule.goal_cycle?.name || (
                      <Badge variant="secondary">Company Default</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {getCadenceDescription(schedule)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.reminder_days_before} days before
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {schedule.auto_create_check_in && (
                        <Badge variant="outline" className="text-xs">Auto-create</Badge>
                      )}
                      {schedule.require_manager_review && (
                        <Badge variant="outline" className="text-xs">Manager Review</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.is_active}
                      onCheckedChange={() => handleToggleActive(schedule.id, schedule.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(schedule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="mt-4 p-4 bg-muted/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">How check-in schedules work:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Company defaults apply to all goal cycles without specific schedules</li>
              <li>Cycle-specific schedules override company defaults</li>
              <li>When auto-create is enabled, pending check-ins are created automatically</li>
              <li>Employees receive reminders before each scheduled check-in</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
