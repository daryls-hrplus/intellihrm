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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AttendanceException {
  id: string;
  employee_id: string;
  exception_date: string;
  exception_type: string;
  original_time: string | null;
  corrected_time: string | null;
  reason: string | null;
  status: string;
  review_notes: string | null;
  employee?: { full_name: string };
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  approved: "bg-green-500/20 text-green-700",
  rejected: "bg-red-500/20 text-red-700",
  auto_resolved: "bg-blue-500/20 text-blue-700",
};

export default function AttendanceExceptionsPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [exceptions, setExceptions] = useState<AttendanceException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<AttendanceException | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const exceptionTypes: Record<string, string> = {
    missing_clock_in: t("timeAttendance.exceptions.types.missingClockIn"),
    missing_clock_out: t("timeAttendance.exceptions.types.missingClockOut"),
    late_arrival: t("timeAttendance.exceptions.types.lateArrival"),
    early_departure: t("timeAttendance.exceptions.types.earlyDeparture"),
    long_break: t("timeAttendance.exceptions.types.longBreak"),
    short_hours: t("timeAttendance.exceptions.types.shortHours"),
    overtime_unapproved: t("timeAttendance.exceptions.types.overtimeUnapproved"),
    manual_correction: t("timeAttendance.exceptions.types.manualCorrection"),
  };

  useEffect(() => {
    if (profile?.company_id) loadExceptions();
  }, [profile?.company_id]);

  const loadExceptions = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("attendance_exceptions")
      .select("*, employee:profiles!attendance_exceptions_employee_id_fkey(full_name)")
      .eq("company_id", profile?.company_id)
      .order("exception_date", { ascending: false });
    if (data) setExceptions(data as AttendanceException[]);
    setIsLoading(false);
  };

  const handleReview = async (action: "approved" | "rejected") => {
    if (!selectedException) return;
    await supabase.from("attendance_exceptions").update({
      status: action,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      review_notes: reviewNotes,
    }).eq("id", selectedException.id);
    toast({ title: t(`timeAttendance.exceptions.${action}`) });
    setReviewDialogOpen(false);
    setReviewNotes("");
    loadExceptions();
  };

  const openReview = (exception: AttendanceException) => {
    setSelectedException(exception);
    setReviewNotes("");
    setReviewDialogOpen(true);
  };

  const pendingExceptions = exceptions.filter(e => e.status === "pending");
  const resolvedExceptions = exceptions.filter(e => e.status !== "pending");

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("navigation.timeAttendance"), href: "/time-attendance" }, { label: t("timeAttendance.exceptions.title") }]} />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10"><AlertTriangle className="h-6 w-6 text-warning" /></div>
          <div>
            <h1 className="text-2xl font-bold">{t("timeAttendance.exceptions.title")}</h1>
            <p className="text-muted-foreground">{t("timeAttendance.exceptions.subtitle")}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.exceptions.pendingReview")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{pendingExceptions.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.exceptions.approved")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{exceptions.filter(e => e.status === "approved").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.exceptions.rejected")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{exceptions.filter(e => e.status === "rejected").length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.exceptions.autoResolved")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{exceptions.filter(e => e.status === "auto_resolved").length}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">{t("timeAttendance.exceptions.pending")} ({pendingExceptions.length})</TabsTrigger>
            <TabsTrigger value="resolved">{t("timeAttendance.exceptions.resolved")} ({resolvedExceptions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.employee")}</TableHead>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("common.type")}</TableHead>
                    <TableHead>{t("timeAttendance.exceptions.originalTime")}</TableHead>
                    <TableHead>{t("timeAttendance.exceptions.correctedTime")}</TableHead>
                    <TableHead>{t("timeAttendance.exceptions.reason")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingExceptions.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("timeAttendance.exceptions.noPending")}</TableCell></TableRow>
                  ) : pendingExceptions.map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell className="font-medium">{exception.employee?.full_name}</TableCell>
                      <TableCell>{format(parseISO(exception.exception_date), "MMM d, yyyy")}</TableCell>
                      <TableCell><Badge variant="outline">{exceptionTypes[exception.exception_type]}</Badge></TableCell>
                      <TableCell>{exception.original_time ? format(parseISO(exception.original_time), "HH:mm") : "-"}</TableCell>
                      <TableCell>{exception.corrected_time ? format(parseISO(exception.corrected_time), "HH:mm") : "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{exception.reason || "-"}</TableCell>
                      <TableCell><Button size="sm" onClick={() => openReview(exception)}>{t("common.review")}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.employee")}</TableHead>
                    <TableHead>{t("common.date")}</TableHead>
                    <TableHead>{t("common.type")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("timeAttendance.exceptions.reason")}</TableHead>
                    <TableHead>{t("timeAttendance.exceptions.reviewNotes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedExceptions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("timeAttendance.exceptions.noResolved")}</TableCell></TableRow>
                  ) : resolvedExceptions.map((exception) => (
                    <TableRow key={exception.id}>
                      <TableCell className="font-medium">{exception.employee?.full_name}</TableCell>
                      <TableCell>{format(parseISO(exception.exception_date), "MMM d, yyyy")}</TableCell>
                      <TableCell><Badge variant="outline">{exceptionTypes[exception.exception_type]}</Badge></TableCell>
                      <TableCell><Badge className={statusColors[exception.status]}>{exception.status}</Badge></TableCell>
                      <TableCell className="max-w-xs truncate">{exception.reason || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">{exception.review_notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("timeAttendance.exceptions.reviewException")}</DialogTitle></DialogHeader>
          {selectedException && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div><span className="text-sm text-muted-foreground">{t("common.employee")}:</span><p className="font-medium">{selectedException.employee?.full_name}</p></div>
                <div><span className="text-sm text-muted-foreground">{t("common.date")}:</span><p className="font-medium">{format(parseISO(selectedException.exception_date), "MMM d, yyyy")}</p></div>
                <div><span className="text-sm text-muted-foreground">{t("common.type")}:</span><p className="font-medium">{exceptionTypes[selectedException.exception_type]}</p></div>
                <div><span className="text-sm text-muted-foreground">{t("timeAttendance.exceptions.reason")}:</span><p className="font-medium">{selectedException.reason || t("common.notProvided")}</p></div>
              </div>
              <div className="space-y-2"><Label>{t("timeAttendance.exceptions.reviewNotes")}</Label><Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder={t("timeAttendance.exceptions.addNotesPlaceholder")} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={() => handleReview("rejected")}><XCircle className="h-4 w-4 mr-2" />{t("common.reject")}</Button>
            <Button onClick={() => handleReview("approved")}><CheckCircle className="h-4 w-4 mr-2" />{t("common.approve")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
