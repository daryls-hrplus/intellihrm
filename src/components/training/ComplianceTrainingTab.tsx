import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface ComplianceTrainingTabProps {
  companyId: string;
}

interface ComplianceTraining {
  id: string;
  name: string;
  description: string | null;
  is_mandatory: boolean;
  frequency_months: number | null;
  grace_period_days: number;
  applies_to_all: boolean;
  is_active: boolean;
  course: { title: string } | null;
}

interface Assignment {
  id: string;
  due_date: string;
  completed_at: string | null;
  status: string;
  compliance: { name: string } | null;
  employee: { full_name: string } | null;
}

export function ComplianceTrainingTab({ companyId }: ComplianceTrainingTabProps) {
  const [trainings, setTrainings] = useState<ComplianceTraining[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"requirements" | "assignments">("requirements");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    course_id: "",
    is_mandatory: true,
    frequency_months: "",
    grace_period_days: "30",
    applies_to_all: true,
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    
    // @ts-ignore - Supabase type instantiation issue
    const trainingsRes = await supabase
      .from("compliance_training")
      .select("*, course:lms_courses(title)")
      .eq("company_id", companyId)
      .order("name");
    
    // @ts-ignore - Supabase type instantiation issue
    const assignmentsRes = await supabase
      .from("compliance_training_assignments")
      .select("*, compliance:compliance_training(name), employee:profiles(full_name)")
      .order("due_date");
    
    // @ts-ignore - Supabase type instantiation issue
    const coursesRes = await supabase
      .from("lms_courses")
      .select("id, title")
      .eq("company_id", companyId)
      .eq("is_active", true);

    if (trainingsRes.data) setTrainings(trainingsRes.data);
    if (assignmentsRes.data) setAssignments(assignmentsRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.course_id) {
      toast.error("Name and course are required");
      return;
    }

    const payload = {
      company_id: companyId,
      name: formData.name,
      description: formData.description || null,
      course_id: formData.course_id,
      is_mandatory: formData.is_mandatory,
      frequency_months: formData.frequency_months ? parseInt(formData.frequency_months) : null,
      grace_period_days: parseInt(formData.grace_period_days) || 30,
      applies_to_all: formData.applies_to_all,
      is_active: true,
    };

    if (editingId) {
      const { error } = await supabase.from("compliance_training").update(payload).eq("id", editingId);
      if (error) {
        toast.error("Failed to update");
      } else {
        toast.success("Updated successfully");
        closeDialog();
        loadData();
      }
    } else {
      const { error } = await supabase.from("compliance_training").insert(payload);
      if (error) {
        toast.error("Failed to create");
      } else {
        toast.success("Created successfully");
        closeDialog();
        loadData();
      }
    }
  };

  const openEdit = (training: ComplianceTraining) => {
    setEditingId(training.id);
    setFormData({
      name: training.name,
      description: training.description || "",
      course_id: "",
      is_mandatory: training.is_mandatory,
      frequency_months: training.frequency_months?.toString() || "",
      grace_period_days: training.grace_period_days.toString(),
      applies_to_all: training.applies_to_all,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      course_id: "",
      is_mandatory: true,
      frequency_months: "",
      grace_period_days: "30",
      applies_to_all: true,
    });
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    if (status === "completed") return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    const daysUntilDue = differenceInDays(new Date(dueDate), new Date());
    if (daysUntilDue < 0) return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
    if (daysUntilDue <= 7) return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Due Soon</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
  };

  const stats = {
    total: assignments.length,
    completed: assignments.filter((a) => a.status === "completed").length,
    overdue: assignments.filter((a) => a.status !== "completed" && differenceInDays(new Date(a.due_date), new Date()) < 0).length,
    dueSoon: assignments.filter((a) => {
      const days = differenceInDays(new Date(a.due_date), new Date());
      return a.status !== "completed" && days >= 0 && days <= 7;
    }).length,
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Assignments</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overdue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.overdue}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Due This Week</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant={activeTab === "requirements" ? "default" : "outline"} onClick={() => setActiveTab("requirements")}>Requirements</Button>
        <Button variant={activeTab === "assignments" ? "default" : "outline"} onClick={() => setActiveTab("assignments")}>Assignments</Button>
      </div>

      {activeTab === "requirements" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Compliance Training Requirements</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Requirement</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Requirement" : "Add Requirement"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Course *</Label>
                    <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Renewal Frequency (months)</Label>
                      <Input type="number" value={formData.frequency_months} onChange={(e) => setFormData({ ...formData, frequency_months: e.target.value })} placeholder="Leave empty for one-time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (days)</Label>
                      <Input type="number" value={formData.grace_period_days} onChange={(e) => setFormData({ ...formData, grace_period_days: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="is_mandatory" checked={formData.is_mandatory} onCheckedChange={(c) => setFormData({ ...formData, is_mandatory: !!c })} />
                      <Label htmlFor="is_mandatory">Mandatory</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="applies_to_all" checked={formData.applies_to_all} onCheckedChange={(c) => setFormData({ ...formData, applies_to_all: !!c })} />
                      <Label htmlFor="applies_to_all">Applies to all employees</Label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                  <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Grace Period</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{t.course?.title}</TableCell>
                    <TableCell>{t.frequency_months ? `Every ${t.frequency_months} months` : "One-time"}</TableCell>
                    <TableCell>{t.grace_period_days} days</TableCell>
                    <TableCell><Badge variant={t.applies_to_all ? "default" : "secondary"}>{t.applies_to_all ? "All Employees" : "Selected"}</Badge></TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {trainings.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No compliance requirements</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === "assignments" && (
        <Card>
          <CardHeader>
            <CardTitle>Training Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.employee?.full_name}</TableCell>
                    <TableCell>{a.compliance?.name}</TableCell>
                    <TableCell>{formatDateForDisplay(a.due_date, "MMM d, yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(a.status, a.due_date)}</TableCell>
                    <TableCell>{a.completed_at ? formatDateForDisplay(a.completed_at, "MMM d, yyyy") : "-"}</TableCell>
                  </TableRow>
                ))}
                {assignments.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No assignments</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
