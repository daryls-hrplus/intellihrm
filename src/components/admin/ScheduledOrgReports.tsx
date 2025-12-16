import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Plus,
  Calendar,
  Mail,
  Clock,
  Building2,
  Trash2,
  Send,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface ScheduledReport {
  id: string;
  name: string;
  description: string | null;
  schedule_type: string;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  recipient_emails: string[];
  company_id: string | null;
  department_id: string | null;
  include_positions: boolean;
  include_employees: boolean;
  include_changes: boolean;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

interface Company {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  company_id: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface ScheduledOrgReportsProps {
  initialCompanyId?: string;
  initialDepartmentId?: string;
  autoOpenDialog?: boolean;
}

export function ScheduledOrgReports({ 
  initialCompanyId, 
  initialDepartmentId, 
  autoOpenDialog 
}: ScheduledOrgReportsProps) {
  const { user } = useAuth();
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    schedule_type: "weekly",
    day_of_week: 1,
    day_of_month: 1,
    time_of_day: "09:00",
    recipient_emails: "",
    company_id: initialCompanyId || "",
    department_id: initialDepartmentId || "",
    include_positions: true,
    include_employees: true,
    include_changes: true,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-open dialog with pre-filled values
  useEffect(() => {
    if (autoOpenDialog && !isLoading && !hasAutoOpened) {
      setHasAutoOpened(true);
      setIsDialogOpen(true);
    }
  }, [autoOpenDialog, isLoading, hasAutoOpened]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [reportsRes, companiesRes, deptsRes] = await Promise.all([
        supabase.from("scheduled_org_reports").select("*").order("created_at", { ascending: false }),
        supabase.from("companies").select("id, name").eq("is_active", true).order("name"),
        supabase.from("departments").select("id, name, company_id").eq("is_active", true).order("name"),
      ]);

      if (reportsRes.error) throw reportsRes.error;
      setReports(reportsRes.data || []);
      setCompanies(companiesRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load scheduled reports");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      schedule_type: "weekly",
      day_of_week: 1,
      day_of_month: 1,
      time_of_day: "09:00",
      recipient_emails: "",
      company_id: "",
      department_id: "",
      include_positions: true,
      include_employees: true,
      include_changes: true,
      is_active: true,
    });
    setEditingReport(null);
  };

  const openEditDialog = (report: ScheduledReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description || "",
      schedule_type: report.schedule_type,
      day_of_week: report.day_of_week ?? 1,
      day_of_month: report.day_of_month ?? 1,
      time_of_day: report.time_of_day.substring(0, 5),
      recipient_emails: report.recipient_emails.join(", "),
      company_id: report.company_id || "",
      department_id: report.department_id || "",
      include_positions: report.include_positions,
      include_employees: report.include_employees,
      include_changes: report.include_changes,
      is_active: report.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    const emails = formData.recipient_emails
      .split(",")
      .map(e => e.trim())
      .filter(e => e.includes("@"));

    if (emails.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        schedule_type: formData.schedule_type,
        day_of_week: formData.schedule_type === "weekly" ? formData.day_of_week : null,
        day_of_month: formData.schedule_type === "monthly" ? formData.day_of_month : null,
        time_of_day: formData.time_of_day + ":00",
        recipient_emails: emails,
        company_id: formData.company_id || null,
        department_id: formData.department_id || null,
        include_positions: formData.include_positions,
        include_employees: formData.include_employees,
        include_changes: formData.include_changes,
        is_active: formData.is_active,
        created_by: user?.id,
      };

      if (editingReport) {
        const { error } = await supabase
          .from("scheduled_org_reports")
          .update(payload)
          .eq("id", editingReport.id);

        if (error) throw error;
        toast.success("Schedule updated successfully");
      } else {
        const { error } = await supabase
          .from("scheduled_org_reports")
          .insert(payload);

        if (error) throw error;
        toast.success("Schedule created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error(error.message || "Failed to save schedule");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from("scheduled_org_reports")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      toast.success("Schedule deleted successfully");
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const handleToggleActive = async (report: ScheduledReport) => {
    try {
      const { error } = await supabase
        .from("scheduled_org_reports")
        .update({ is_active: !report.is_active })
        .eq("id", report.id);

      if (error) throw error;
      toast.success(report.is_active ? "Schedule paused" : "Schedule activated");
      fetchData();
    } catch (error) {
      console.error("Error toggling schedule:", error);
      toast.error("Failed to update schedule");
    }
  };

  const handleSendNow = async (report: ScheduledReport) => {
    setIsSending(report.id);
    try {
      const { data, error } = await supabase.functions.invoke("send-org-report", {
        body: { scheduleId: report.id },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Report sent to ${data.emailsSent} recipient(s)`);
        fetchData();
      } else {
        toast.error(data?.reason || "Failed to send report");
      }
    } catch (error: any) {
      console.error("Error sending report:", error);
      toast.error(error.message || "Failed to send report");
    } finally {
      setIsSending(null);
    }
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return "All Companies";
    return companies.find(c => c.id === companyId)?.name || "Unknown";
  };

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "All Departments";
    return departments.find(d => d.id === deptId)?.name || "Unknown";
  };

  const getScheduleLabel = (report: ScheduledReport) => {
    if (report.schedule_type === "daily") {
      return `Daily at ${report.time_of_day.substring(0, 5)}`;
    } else if (report.schedule_type === "weekly") {
      const day = DAYS_OF_WEEK.find(d => d.value === report.day_of_week)?.label || "Unknown";
      return `Every ${day} at ${report.time_of_day.substring(0, 5)}`;
    } else {
      return `Monthly on day ${report.day_of_month} at ${report.time_of_day.substring(0, 5)}`;
    }
  };

  const filteredDepartments = formData.company_id
    ? departments.filter(d => d.company_id === formData.company_id)
    : departments;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scheduled Org Reports</h2>
          <p className="text-muted-foreground">
            Configure automated organizational change reports to be sent via email
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReport ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
              <DialogDescription>
                Configure when and to whom the organizational changes report should be sent.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Report Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Weekly HR Report"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule_type">Frequency</Label>
                  <Select
                    value={formData.schedule_type}
                    onValueChange={(value) => setFormData({ ...formData, schedule_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {formData.schedule_type === "weekly" && (
                  <div className="space-y-2">
                    <Label htmlFor="day_of_week">Day of Week</Label>
                    <Select
                      value={String(formData.day_of_week)}
                      onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map(day => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.schedule_type === "monthly" && (
                  <div className="space-y-2">
                    <Label htmlFor="day_of_month">Day of Month</Label>
                    <Select
                      value={String(formData.day_of_month)}
                      onValueChange={(value) => setFormData({ ...formData, day_of_month: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={String(day)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="time_of_day">Time</Label>
                  <Input
                    id="time_of_day"
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_emails">Recipients (comma-separated) *</Label>
                <Textarea
                  id="recipient_emails"
                  value={formData.recipient_emails}
                  onChange={(e) => setFormData({ ...formData, recipient_emails: e.target.value })}
                  placeholder="hr@company.com, manager@company.com"
                  rows={2}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_id">Company (optional)</Label>
                  <Select
                    value={formData.company_id || "__all__"}
                    onValueChange={(value) => setFormData({ ...formData, company_id: value === "__all__" ? "" : value, department_id: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Companies</SelectItem>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department (optional)</Label>
                  <Select
                    value={formData.department_id || "__all__"}
                    onValueChange={(value) => setFormData({ ...formData, department_id: value === "__all__" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Departments</SelectItem>
                      {filteredDepartments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this report schedule"
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <Label>Report Contents</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include_positions"
                      checked={formData.include_positions}
                      onCheckedChange={(checked) => setFormData({ ...formData, include_positions: checked })}
                    />
                    <Label htmlFor="include_positions" className="cursor-pointer">Include Positions</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include_employees"
                      checked={formData.include_employees}
                      onCheckedChange={(checked) => setFormData({ ...formData, include_employees: checked })}
                    />
                    <Label htmlFor="include_employees" className="cursor-pointer">Include Employees</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="include_changes"
                      checked={formData.include_changes}
                      onCheckedChange={(checked) => setFormData({ ...formData, include_changes: checked })}
                    />
                    <Label htmlFor="include_changes" className="cursor-pointer">Include Changes Summary</Label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">Active (schedule is enabled)</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingReport ? "Save Changes" : "Create Schedule"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
            <p className="text-muted-foreground mb-4">
              Create your first scheduled report to automatically send organizational changes via email.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Configured Schedules</CardTitle>
            <CardDescription>
              Manage your automated report schedules. Use "Send Now" to test a report immediately.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        {report.description && (
                          <p className="text-xs text-muted-foreground">{report.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getScheduleLabel(report)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getCompanyName(report.company_id)}
                        </div>
                        {report.department_id && (
                          <span className="text-xs text-muted-foreground">
                            {getDepartmentName(report.department_id)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="text-sm">{report.recipient_emails.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={report.is_active ? "default" : "secondary"}
                        className={report.is_active ? "bg-green-500" : ""}
                      >
                        {report.is_active ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Paused</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.last_sent_at ? (
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(report.last_sent_at), "MMM d, yyyy HH:mm")}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendNow(report)}
                          disabled={isSending === report.id}
                        >
                          {isSending === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(report)}
                        >
                          {report.is_active ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Setting Up Automated Sending</CardTitle>
          <CardDescription>
            To fully automate report delivery, you need to set up a cron job to trigger the reports on schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            The schedules above define <strong>when</strong> reports should be sent and <strong>who</strong> should receive them.
            To actually trigger the sending automatically, you'll need to configure a cron job or external scheduler
            that calls the <code>send-org-report</code> edge function with the appropriate schedule ID.
          </p>
          <p>
            For now, you can use the <strong>Send Now</strong> button to manually trigger reports at any time.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this scheduled report. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}