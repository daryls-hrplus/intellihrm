import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Users, Clock, CheckCircle, XCircle, AlertTriangle, Timer, Calendar, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

interface DirectReport {
  id: string;
  full_name: string;
  email: string;
  employee_id: string | null;
}

interface TeamTimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  status: string;
  employee: { full_name: string };
}

interface TimesheetSubmission {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  status: string;
  submitted_at: string;
  employee: { full_name: string };
}

interface AttendanceException {
  id: string;
  employee_id: string;
  exception_date: string;
  exception_type: string;
  reason: string | null;
  status: string;
  employee: { full_name: string };
}

export default function MssTimeAttendancePage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [teamEntries, setTeamEntries] = useState<TeamTimeEntry[]>([]);
  const [timesheets, setTimesheets] = useState<TimesheetSubmission[]>([]);
  const [exceptions, setExceptions] = useState<AttendanceException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetSubmission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDirectReports();
    }
  }, [user]);

  useEffect(() => {
    if (directReports.length > 0) {
      loadTeamData();
    }
  }, [directReports, selectedEmployee]);

  const loadDirectReports = async () => {
    if (!user) return;

    try {
      const { data } = await supabase.rpc("get_manager_direct_reports", {
        p_manager_id: user.id,
      });

      const reports = (data || []).map((r: { employee_id: string; employee_name: string; employee_email: string }) => ({
        id: r.employee_id,
        full_name: r.employee_name,
        email: r.employee_email,
        employee_id: null,
      }));

      setDirectReports(reports);
      
      // If no direct reports, stop loading immediately
      if (reports.length === 0) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading direct reports:", error);
      setIsLoading(false);
    }
  };

  const loadTeamData = async () => {
    if (directReports.length === 0) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const reportIds = selectedEmployee === "all" 
      ? directReports.map((r) => r.id)
      : [selectedEmployee];

    try {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

      // Load team time entries
      const { data: entries } = await supabase
        .from("time_clock_entries")
        .select("*, employee:profiles!time_clock_entries_employee_id_fkey(full_name)")
        .in("employee_id", reportIds)
        .gte("clock_in", weekStart.toISOString())
        .order("clock_in", { ascending: false });

      setTeamEntries((entries || []) as TeamTimeEntry[]);

      // Load pending timesheet submissions
      const { data: sheets } = await supabase
        .from("timesheet_submissions")
        .select("*, employee:profiles!timesheet_submissions_employee_id_fkey(full_name)")
        .in("employee_id", reportIds)
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      setTimesheets((sheets || []) as TimesheetSubmission[]);

      // Load attendance exceptions
      const { data: excs } = await supabase
        .from("attendance_exceptions")
        .select("*, employee:profiles!attendance_exceptions_employee_id_fkey(full_name)")
        .in("employee_id", reportIds)
        .eq("status", "pending")
        .order("exception_date", { ascending: false });

      setExceptions((excs || []) as AttendanceException[]);
    } catch (error) {
      console.error("Error loading team data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimesheetReview = async (approved: boolean) => {
    if (!selectedTimesheet || !user) return;
    setIsProcessing(true);

    try {
      const { error } = await supabase
        .from("timesheet_submissions")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq("id", selectedTimesheet.id);

      if (error) throw error;

      toast({
        title: approved ? "Timesheet Approved" : "Timesheet Rejected",
        description: `Timesheet for ${selectedTimesheet.employee.full_name} has been ${approved ? "approved" : "rejected"}.`,
      });

      setReviewDialog(false);
      setSelectedTimesheet(null);
      setReviewNotes("");
      loadTeamData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process timesheet.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExceptionReview = async (exceptionId: string, approved: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("attendance_exceptions")
        .update({
          status: approved ? "approved" : "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", exceptionId);

      if (error) throw error;

      toast({
        title: approved ? "Exception Approved" : "Exception Rejected",
      });

      loadTeamData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process exception.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-700",
      approved: "bg-green-500/20 text-green-700",
      rejected: "bg-red-500/20 text-red-700",
      in_progress: "bg-blue-500/20 text-blue-700",
      completed: "bg-green-500/20 text-green-700",
    };
    return <Badge className={colors[status] || "bg-muted"}>{status}</Badge>;
  };

  // Summary stats
  const clockedInCount = teamEntries.filter((e) => !e.clock_out).length;
  const pendingTimesheets = timesheets.length;
  const pendingExceptions = exceptions.length;

  const breadcrumbItems = [
    { label: t("mss.title"), href: "/mss" },
    { label: t("mss.teamTimeAttendance.breadcrumb") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("mss.teamTimeAttendance.title")}</h1>
            <p className="text-muted-foreground">{t("mss.teamTimeAttendance.subtitle")}</p>
          </div>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Direct Reports</SelectItem>
              {directReports.map((report) => (
                <SelectItem key={report.id} value={report.id}>
                  {report.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Direct Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{directReports.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Currently Clocked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{clockedInCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Timesheets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{pendingTimesheets}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold">{pendingExceptions}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="entries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="entries" className="gap-2">
              <Timer className="h-4 w-4" />
              Time Entries
            </TabsTrigger>
            <TabsTrigger value="timesheets" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Timesheet Approvals
              {pendingTimesheets > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingTimesheets}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="exceptions" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Exceptions
              {pendingExceptions > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingExceptions}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <CardTitle>Team Time Entries - This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : teamEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No time entries this week</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{entry.employee?.full_name}</TableCell>
                          <TableCell>{format(new Date(entry.clock_in), "EEE, MMM d")}</TableCell>
                          <TableCell>{format(new Date(entry.clock_in), "h:mm a")}</TableCell>
                          <TableCell>
                            {entry.clock_out ? format(new Date(entry.clock_out), "h:mm a") : "-"}
                          </TableCell>
                          <TableCell>{entry.total_hours?.toFixed(2) || "-"}</TableCell>
                          <TableCell>{getStatusBadge(entry.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timesheets">
            <Card>
              <CardHeader>
                <CardTitle>Pending Timesheet Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : timesheets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pending timesheets</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timesheets.map((sheet) => (
                        <TableRow key={sheet.id}>
                          <TableCell className="font-medium">{sheet.employee?.full_name}</TableCell>
                          <TableCell>
                            {format(new Date(sheet.period_start), "MMM d")} - {format(new Date(sheet.period_end), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{sheet.total_hours.toFixed(2)}</TableCell>
                          <TableCell>{format(new Date(sheet.submitted_at), "MMM d, h:mm a")}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTimesheet(sheet);
                                  setReviewDialog(true);
                                }}
                              >
                                Review
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
          </TabsContent>

          <TabsContent value="exceptions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Attendance Exceptions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : exceptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No pending exceptions</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exceptions.map((exc) => (
                        <TableRow key={exc.id}>
                          <TableCell className="font-medium">{exc.employee?.full_name}</TableCell>
                          <TableCell>{format(new Date(exc.exception_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{exc.exception_type.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{exc.reason || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => handleExceptionReview(exc.id, true)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600"
                                onClick={() => handleExceptionReview(exc.id, false)}
                              >
                                <XCircle className="h-4 w-4" />
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
          </TabsContent>
        </Tabs>

        {/* Timesheet Review Dialog */}
        <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Timesheet</DialogTitle>
            </DialogHeader>
            {selectedTimesheet && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Employee:</span>
                    <p className="font-medium">{selectedTimesheet.employee?.full_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Hours:</span>
                    <p className="font-medium">{selectedTimesheet.total_hours.toFixed(2)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Period:</span>
                    <p className="font-medium">
                      {format(new Date(selectedTimesheet.period_start), "MMM d")} - {format(new Date(selectedTimesheet.period_end), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div>
                  <Label>Review Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleTimesheetReview(false)}
                disabled={isProcessing}
              >
                Reject
              </Button>
              <Button onClick={() => handleTimesheetReview(true)} disabled={isProcessing}>
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
