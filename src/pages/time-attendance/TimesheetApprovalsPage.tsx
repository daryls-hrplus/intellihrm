import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkflow } from "@/hooks/useWorkflow";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, startOfWeek, endOfWeek, parseISO } from "date-fns";
import { Send, Clock, CheckCircle, FileText, Loader2 } from "lucide-react";

interface TimesheetSubmission {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  status: string;
  workflow_instance_id: string | null;
  submitted_at: string | null;
  notes: string | null;
  rejection_reason: string | null;
  employee?: { full_name: string; email: string };
}

interface TimeEntry {
  id: string;
  entry_date: string;
  hours: number;
  notes: string | null;
  project?: { name: string } | null;
  task?: { name: string } | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-500/20 text-blue-700",
  pending_approval: "bg-yellow-500/20 text-yellow-700",
  approved: "bg-green-500/20 text-green-700",
  rejected: "bg-red-500/20 text-red-700",
  returned: "bg-orange-500/20 text-orange-700",
};

export default function TimesheetApprovalsPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { startWorkflow } = useWorkflow();

  const [mySubmissions, setMySubmissions] = useState<TimesheetSubmission[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<TimesheetSubmission[]>([]);
  const [unsubmittedEntries, setUnsubmittedEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<{ start: Date; end: Date } | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewEntriesDialog, setViewEntriesDialog] = useState(false);
  const [viewingSubmission, setViewingSubmission] = useState<TimesheetSubmission | null>(null);
  const [submissionEntries, setSubmissionEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    if (user && profile?.company_id) {
      loadData();
    }
  }, [user, profile?.company_id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadMySubmissions(), loadUnsubmittedEntries(), loadPendingApprovals()]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMySubmissions = async () => {
    const { data } = await supabase
      .from("timesheet_submissions")
      .select("*")
      .eq("employee_id", user?.id)
      .order("period_start", { ascending: false });
    if (data) setMySubmissions(data);
  };

  const loadUnsubmittedEntries = async () => {
    const { data } = await supabase
      .from("project_time_entries")
      .select(`id, entry_date, hours, notes, project:projects(name), task:project_tasks(name)`)
      .eq("employee_id", user?.id)
      .is("submission_id", null)
      .order("entry_date", { ascending: false });
    if (data) setUnsubmittedEntries(data as unknown as TimeEntry[]);
  };

  const loadPendingApprovals = async () => {
    const { data } = await supabase
      .from("timesheet_submissions")
      .select(`*, employee:profiles!timesheet_submissions_employee_id_fkey(full_name, email)`)
      .eq("company_id", profile?.company_id)
      .in("status", ["submitted", "pending_approval"])
      .neq("employee_id", user?.id)
      .order("submitted_at", { ascending: true });
    if (data) setPendingApprovals(data as TimesheetSubmission[]);
  };

  const handleSubmitTimesheet = async () => {
    if (!selectedPeriod || !profile?.company_id) return;
    setIsSubmitting(true);
    try {
      const { data: entries } = await supabase
        .from("project_time_entries")
        .select("id, hours")
        .eq("employee_id", user?.id)
        .is("submission_id", null)
        .gte("entry_date", format(selectedPeriod.start, "yyyy-MM-dd"))
        .lte("entry_date", format(selectedPeriod.end, "yyyy-MM-dd"));

      if (!entries || entries.length === 0) {
        toast({ title: t("common.error"), description: t("common.noData"), variant: "destructive" });
        return;
      }

      const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
      const { data: submission, error } = await supabase
        .from("timesheet_submissions")
        .insert({
          company_id: profile.company_id,
          employee_id: user?.id,
          period_start: format(selectedPeriod.start, "yyyy-MM-dd"),
          period_end: format(selectedPeriod.end, "yyyy-MM-dd"),
          total_hours: totalHours,
          status: "submitted",
          submitted_at: new Date().toISOString(),
          submitted_by: user?.id,
          notes: submissionNotes || null,
        })
        .select()
        .single();

      if (error || !submission) throw error;

      await supabase.from("timesheet_submission_entries").insert(entries.map((e) => ({ submission_id: submission.id, time_entry_id: e.id })));
      await supabase.from("project_time_entries").update({ submission_id: submission.id }).in("id", entries.map((e) => e.id));

      try {
        await startWorkflow("timesheet_approval", "timesheet_submission", submission.id);
        await supabase.from("timesheet_submissions").update({ status: "pending_approval" }).eq("id", submission.id);
      } catch { /* workflow template may not exist */ }

      toast({ title: t("common.success"), description: t("timeAttendance.timesheets.timesheetSubmitted") });
      setSubmitDialogOpen(false);
      setSubmissionNotes("");
      loadData();
    } catch (error) {
      toast({ title: t("common.error"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEntries = async (submission: TimesheetSubmission) => {
    setViewingSubmission(submission);
    const { data } = await supabase
      .from("timesheet_submission_entries")
      .select(`time_entry:project_time_entries(id, entry_date, hours, notes, project:projects(name), task:project_tasks(name))`)
      .eq("submission_id", submission.id);
    if (data) setSubmissionEntries(data.map((d: any) => d.time_entry).filter(Boolean));
    setViewEntriesDialog(true);
  };

  const openSubmitDialog = () => {
    const today = new Date();
    setSelectedPeriod({ start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) });
    setSubmitDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Breadcrumbs items={[{ label: t("timeAttendance.title"), href: "/time-attendance" }, { label: t("timeAttendance.timesheets.title") }]} />
        <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("timeAttendance.title"), href: "/time-attendance" }, { label: t("timeAttendance.timesheets.title") }]} />
        
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.timesheets.unsubmitted")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{unsubmittedEntries.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.timesheets.pending")}</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{mySubmissions.filter((s) => s.status === "pending_approval").length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.timesheets.approved")}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{mySubmissions.filter((s) => s.status === "approved").length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("timeAttendance.timesheets.toReview")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{pendingApprovals.length}</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="my-submissions">
          <TabsList>
            <TabsTrigger value="my-submissions">{t("timeAttendance.timesheets.mySubmissions")}</TabsTrigger>
            <TabsTrigger value="pending-review">
              {t("timeAttendance.timesheets.pendingReview")}
              {pendingApprovals.length > 0 && <Badge variant="secondary" className="ml-2">{pendingApprovals.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-submissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t("timeAttendance.timesheets.mySubmissions")}</h3>
              <Button onClick={openSubmitDialog} disabled={unsubmittedEntries.length === 0}>
                <Send className="h-4 w-4 mr-2" />{t("timeAttendance.timesheets.submitTimesheet")}
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("timeAttendance.timesheets.period")}</TableHead>
                    <TableHead>{t("timeAttendance.timesheets.hours")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("timeAttendance.timesheets.submitted")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySubmissions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("timeAttendance.timesheets.noSubmissions")}</TableCell></TableRow>
                  ) : mySubmissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{format(parseISO(s.period_start), "MMM d")} - {format(parseISO(s.period_end), "MMM d, yyyy")}</TableCell>
                      <TableCell>{s.total_hours}h</TableCell>
                      <TableCell><Badge className={statusColors[s.status]}>{s.status.replace("_", " ")}</Badge></TableCell>
                      <TableCell>{s.submitted_at ? format(parseISO(s.submitted_at), "MMM d, HH:mm") : "-"}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => handleViewEntries(s)}>{t("common.view")}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pending-review" className="space-y-4">
            <h3 className="text-lg font-medium">{t("timeAttendance.timesheets.pendingReview")}</h3>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.employee")}</TableHead>
                    <TableHead>{t("timeAttendance.timesheets.period")}</TableHead>
                    <TableHead>{t("timeAttendance.timesheets.hours")}</TableHead>
                    <TableHead>{t("timeAttendance.timesheets.submitted")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("timeAttendance.timesheets.noTimesheetsPending")}</TableCell></TableRow>
                  ) : pendingApprovals.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.employee?.full_name || t("timeAttendance.timesheets.unknown")}</TableCell>
                      <TableCell>{format(parseISO(s.period_start), "MMM d")} - {format(parseISO(s.period_end), "MMM d, yyyy")}</TableCell>
                      <TableCell>{s.total_hours}h</TableCell>
                      <TableCell>{s.submitted_at ? format(parseISO(s.submitted_at), "MMM d, HH:mm") : "-"}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewEntries(s)}>{t("common.view")}</Button>
                        {s.workflow_instance_id && <Button variant="outline" size="sm" onClick={() => navigate("/workflow/approvals")}>{t("timeAttendance.timesheets.review")}</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("timeAttendance.timesheets.submitTimesheet")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {selectedPeriod && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("timeAttendance.timesheets.period")}</p>
                <p className="font-medium">{format(selectedPeriod.start, "MMMM d")} - {format(selectedPeriod.end, "MMMM d, yyyy")}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {unsubmittedEntries.filter((e) => parseISO(e.entry_date) >= selectedPeriod.start && parseISO(e.entry_date) <= selectedPeriod.end).length} {t("timeAttendance.timesheets.entries")}, {unsubmittedEntries.filter((e) => parseISO(e.entry_date) >= selectedPeriod.start && parseISO(e.entry_date) <= selectedPeriod.end).reduce((sum, e) => sum + Number(e.hours), 0).toFixed(1)}h
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("timeAttendance.timesheets.notes")}</Label>
              <Textarea value={submissionNotes} onChange={(e) => setSubmissionNotes(e.target.value)} placeholder={t("timeAttendance.timesheets.addNotes")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSubmitTimesheet} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("timeAttendance.timesheets.submitting")}</> : <><Send className="h-4 w-4 mr-2" />{t("common.submit")}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewEntriesDialog} onOpenChange={setViewEntriesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("timeAttendance.timesheets.timesheetEntries")}
              {viewingSubmission && <span className="text-muted-foreground font-normal ml-2">({format(parseISO(viewingSubmission.period_start), "MMM d")} - {format(parseISO(viewingSubmission.period_end), "MMM d, yyyy")})</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.date")}</TableHead>
                  <TableHead>{t("timeAttendance.timesheets.project")}</TableHead>
                  <TableHead>{t("timeAttendance.timesheets.task")}</TableHead>
                  <TableHead>{t("timeAttendance.timesheets.hours")}</TableHead>
                  <TableHead>{t("common.notes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissionEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(parseISO(e.entry_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{e.project?.name || "-"}</TableCell>
                    <TableCell>{e.task?.name || "-"}</TableCell>
                    <TableCell>{e.hours}h</TableCell>
                    <TableCell className="max-w-xs truncate">{e.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setViewEntriesDialog(false)}>{t("common.close")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}