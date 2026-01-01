import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Calendar, Lock, CalendarClock } from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { format } from "date-fns";

interface GoalCycle {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  cycle_type: string;
  start_date: string;
  end_date: string;
  goal_setting_start: string | null;
  goal_setting_end: string | null;
  review_start: string | null;
  review_end: string | null;
  freeze_date: string | null;
  status: string;
  is_active: boolean;
}

interface GoalCyclesManagerProps {
  companyId: string;
}

const cycleTypes = [
  { value: "financial_year", label: "Financial Year" },
  { value: "calendar_year", label: "Calendar Year" },
  { value: "rolling", label: "Rolling" },
  { value: "project_based", label: "Project Based" },
  { value: "quarterly", label: "Quarterly" },
];

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "review", label: "In Review" },
  { value: "closed", label: "Closed" },
];

export function GoalCyclesManager({ companyId }: GoalCyclesManagerProps) {
  const [cycles, setCycles] = useState<GoalCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<GoalCycle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cycle_type: "financial_year",
    start_date: "",
    end_date: "",
    goal_setting_start: "",
    goal_setting_end: "",
    review_start: "",
    review_end: "",
    freeze_date: "",
    status: "draft",
    is_active: true,
  });

  useEffect(() => {
    fetchCycles();
  }, [companyId]);

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("goal_cycles")
        .select("*")
        .eq("company_id", companyId)
        .order("start_date", { ascending: false });
      
      if (error) throw error;
      setCycles(data || []);
    } catch (error) {
      console.error("Error fetching goal cycles:", error);
      toast.error("Failed to load goal cycles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (cycle?: GoalCycle) => {
    if (cycle) {
      setEditingCycle(cycle);
      setFormData({
        name: cycle.name,
        description: cycle.description || "",
        cycle_type: cycle.cycle_type,
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        goal_setting_start: cycle.goal_setting_start || "",
        goal_setting_end: cycle.goal_setting_end || "",
        review_start: cycle.review_start || "",
        review_end: cycle.review_end || "",
        freeze_date: cycle.freeze_date || "",
        status: cycle.status,
        is_active: cycle.is_active,
      });
    } else {
      setEditingCycle(null);
      setFormData({
        name: "",
        description: "",
        cycle_type: "financial_year",
        start_date: "",
        end_date: "",
        goal_setting_start: "",
        goal_setting_end: "",
        review_start: "",
        review_end: "",
        freeze_date: "",
        status: "draft",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        company_id: companyId,
        name: formData.name,
        description: formData.description || null,
        cycle_type: formData.cycle_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        goal_setting_start: formData.goal_setting_start || null,
        goal_setting_end: formData.goal_setting_end || null,
        review_start: formData.review_start || null,
        review_end: formData.review_end || null,
        freeze_date: formData.freeze_date || null,
        status: formData.status,
        is_active: formData.is_active,
      };

      if (editingCycle) {
        const { error } = await supabase
          .from("goal_cycles")
          .update(payload)
          .eq("id", editingCycle.id);
        if (error) throw error;
        toast.success("Goal cycle updated");
      } else {
        const { error } = await supabase
          .from("goal_cycles")
          .insert(payload);
        if (error) throw error;
        toast.success("Goal cycle created");
      }
      
      setDialogOpen(false);
      fetchCycles();
    } catch (error) {
      console.error("Error saving goal cycle:", error);
      toast.error("Failed to save goal cycle");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal cycle? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from("goal_cycles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Goal cycle deleted");
      fetchCycles();
    } catch (error) {
      console.error("Error deleting goal cycle:", error);
      toast.error("Failed to delete goal cycle");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      active: "default",
      review: "outline",
      closed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Goal Cycles
            </CardTitle>
            <CardDescription>
              Define goal cycles with timeframes for setting, reviewing, and freezing goals
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Cycle
          </Button>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No goal cycles configured. Create your first cycle to organize goals by time periods.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Freeze Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell className="font-medium">{cycle.name}</TableCell>
                    <TableCell>
                      {cycleTypes.find(t => t.value === cycle.cycle_type)?.label || cycle.cycle_type}
                    </TableCell>
                    <TableCell>
                      {formatDateForDisplay(cycle.start_date)} - {formatDateForDisplay(cycle.end_date)}
                    </TableCell>
                    <TableCell>
                      {cycle.freeze_date ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Lock className="h-3 w-3" />
                          {formatDateForDisplay(cycle.freeze_date)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(cycle.status)}</TableCell>
                    <TableCell>
                      <Badge variant={cycle.is_active ? "default" : "secondary"}>
                        {cycle.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cycle)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(cycle.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCycle ? "Edit Goal Cycle" : "Create Goal Cycle"}</DialogTitle>
            <DialogDescription>
              Configure the timeframe and settings for this goal cycle
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Cycle Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., FY 2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle_type">Cycle Type</Label>
                <Select value={formData.cycle_type} onValueChange={(v) => setFormData({ ...formData, cycle_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cycleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cycle Start Date *</Label>
                <DatePicker
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select start date"
                />
              </div>
              <div className="space-y-2">
                <Label>Cycle End Date *</Label>
                <DatePicker
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select end date"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Goal Setting Window
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Setting Start</Label>
                  <DatePicker
                    value={formData.goal_setting_start}
                    onChange={(date) => setFormData({ ...formData, goal_setting_start: date ? format(date, "yyyy-MM-dd") : "" })}
                    placeholder="Select date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Setting End</Label>
                  <DatePicker
                    value={formData.goal_setting_end}
                    onChange={(date) => setFormData({ ...formData, goal_setting_end: date ? format(date, "yyyy-MM-dd") : "" })}
                    placeholder="Select date"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Review Window
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Review Start</Label>
                  <DatePicker
                    value={formData.review_start}
                    onChange={(date) => setFormData({ ...formData, review_start: date ? format(date, "yyyy-MM-dd") : "" })}
                    placeholder="Select date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review End</Label>
                  <DatePicker
                    value={formData.review_end}
                    onChange={(date) => setFormData({ ...formData, review_end: date ? format(date, "yyyy-MM-dd") : "" })}
                    placeholder="Select date"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-4 bg-amber-50 dark:bg-amber-950/20">
              <h4 className="font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Lock className="h-4 w-4" />
                Freeze Date (Auto-Lock)
              </h4>
              <p className="text-sm text-muted-foreground">
                Goals in this cycle will be automatically locked after this date
              </p>
              <div className="space-y-2">
                <DatePicker
                  value={formData.freeze_date}
                  onChange={(date) => setFormData({ ...formData, freeze_date: date ? format(date, "yyyy-MM-dd") : "" })}
                  placeholder="Select freeze date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : editingCycle ? "Update Cycle" : "Create Cycle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
