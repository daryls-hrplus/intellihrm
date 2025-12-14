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
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Clock, LogIn, LogOut, Calendar, Timer, MapPin, Camera } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { FaceCaptureDialog } from "@/components/time-attendance/FaceCaptureDialog";

interface TimeEntry {
  id: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  status: string;
  notes: string | null;
  clock_in_latitude: number | null;
  clock_in_longitude: number | null;
}

interface AttendanceSummary {
  id: string;
  work_date: string;
  status: string | null;
  total_work_hours: number | null;
  late_minutes: number | null;
  early_departure_minutes: number | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
}

export default function MyTimeAttendancePage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { getCurrentPosition, loading: geoLoading } = useGeolocation();
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [pendingAction, setPendingAction] = useState<"clock_in" | "clock_out" | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Load current open entry
      const { data: openEntry } = await supabase
        .from("time_clock_entries")
        .select("*")
        .eq("employee_id", user.id)
        .is("clock_out", null)
        .order("clock_in", { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentEntry(openEntry);

      // Load recent time entries
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const { data: entries } = await supabase
        .from("time_clock_entries")
        .select("*")
        .eq("employee_id", user.id)
        .gte("clock_in", weekStart.toISOString())
        .order("clock_in", { ascending: false });

      setTimeEntries(entries || []);

      // Load attendance summary
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());
      const { data: summary } = await supabase
        .from("attendance_summary")
        .select("*")
        .eq("employee_id", user.id)
        .gte("work_date", format(monthStart, "yyyy-MM-dd"))
        .lte("work_date", format(monthEnd, "yyyy-MM-dd"))
        .order("work_date", { ascending: false });

      setAttendanceSummary(summary || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockAction = async (action: "clock_in" | "clock_out") => {
    setPendingAction(action);
    setShowFaceCapture(true);
  };

  const processClockAction = async (photoUrl?: string) => {
    if (!user || !profile?.company_id || !pendingAction) return;
    setIsClocking(true);

    try {
      let position: GeolocationPosition | null = null;
      try {
        position = await getCurrentPosition();
      } catch {
        // Geolocation optional
      }

      if (pendingAction === "clock_in") {
        const { error } = await supabase.from("time_clock_entries").insert({
          company_id: profile.company_id,
          employee_id: user.id,
          clock_in: new Date().toISOString(),
          status: "in_progress",
          clock_in_latitude: position?.coords.latitude,
          clock_in_longitude: position?.coords.longitude,
          clock_in_photo_url: photoUrl,
        });

        if (error) throw error;
        toast({ title: "Clocked In", description: "You have successfully clocked in." });
      } else {
        if (!currentEntry) {
          toast({ title: "Error", description: "No active clock-in found.", variant: "destructive" });
          return;
        }

        const clockIn = new Date(currentEntry.clock_in);
        const clockOut = new Date();
        const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

        const { error } = await supabase
          .from("time_clock_entries")
          .update({
            clock_out: clockOut.toISOString(),
            status: "completed",
            total_hours: Math.round(totalHours * 100) / 100,
            clock_out_latitude: position?.coords.latitude,
            clock_out_longitude: position?.coords.longitude,
            clock_out_photo_url: photoUrl,
          })
          .eq("id", currentEntry.id);

        if (error) throw error;
        toast({ title: "Clocked Out", description: `Total hours: ${totalHours.toFixed(2)}` });
      }

      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to process clock action.", variant: "destructive" });
    } finally {
      setIsClocking(false);
      setPendingAction(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      present: "bg-green-500/20 text-green-700",
      absent: "bg-red-500/20 text-red-700",
      late: "bg-yellow-500/20 text-yellow-700",
      early_departure: "bg-orange-500/20 text-orange-700",
      in_progress: "bg-blue-500/20 text-blue-700",
      completed: "bg-green-500/20 text-green-700",
    };
    return <Badge className={colors[status || ""] || "bg-muted"}>{status || "N/A"}</Badge>;
  };

  const breadcrumbItems = [
    { label: "Employee Self-Service", href: "/ess" },
    { label: "My Time & Attendance" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Time & Attendance</h1>
            <p className="text-muted-foreground">Track your work hours and attendance</p>
          </div>
        </div>

        {/* Clock In/Out Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Clock
            </CardTitle>
            <CardDescription>
              {currentEntry 
                ? `Clocked in since ${format(new Date(currentEntry.clock_in), "h:mm a")}`
                : "You are not currently clocked in"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {!currentEntry ? (
                <Button 
                  onClick={() => handleClockAction("clock_in")} 
                  disabled={isClocking}
                  className="gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Clock In
                </Button>
              ) : (
                <Button 
                  onClick={() => handleClockAction("clock_out")} 
                  disabled={isClocking}
                  variant="destructive"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Clock Out
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location and photo will be captured
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="entries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="entries" className="gap-2">
              <Timer className="h-4 w-4" />
              Time Entries
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <Calendar className="h-4 w-4" />
              Attendance Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries">
            <Card>
              <CardHeader>
                <CardTitle>This Week's Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : timeEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No time entries this week</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeEntries.map((entry) => (
                        <TableRow key={entry.id}>
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

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>This Month's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : attendanceSummary.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No attendance records this month</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Hours Worked</TableHead>
                        <TableHead>Late (mins)</TableHead>
                        <TableHead>Early Out (mins)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceSummary.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{format(new Date(record.work_date), "EEE, MMM d")}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{record.total_work_hours?.toFixed(2) || "-"}</TableCell>
                          <TableCell>{record.late_minutes || "-"}</TableCell>
                          <TableCell>{record.early_departure_minutes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <FaceCaptureDialog
          open={showFaceCapture}
          onOpenChange={(open) => {
            setShowFaceCapture(open);
            if (!open) setPendingAction(null);
          }}
          onCapture={(photo) => processClockAction(photo)}
          title={pendingAction === "clock_in" ? "Clock In Photo" : "Clock Out Photo"}
          description="Please capture a photo to verify your identity"
        />
      </div>
    </AppLayout>
  );
}
