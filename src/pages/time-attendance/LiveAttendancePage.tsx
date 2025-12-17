import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { getTodayString } from "@/utils/dateUtils";
import { Activity, UserCheck, UserX, Clock, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface LiveEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  status: string;
  employee?: { full_name: string; avatar_url: string | null };
}

export default function LiveAttendancePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [entries, setEntries] = useState<LiveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (profile?.company_id) {
      loadEntries();
      const channel = supabase
        .channel("live-attendance")
        .on("postgres_changes", { event: "*", schema: "public", table: "time_clock_entries" }, () => {
          loadEntries();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [profile?.company_id]);

  const loadEntries = async () => {
    setIsLoading(true);
    const today = getTodayString();
    const { data } = await supabase
      .from("time_clock_entries")
      .select("id, employee_id, clock_in, clock_out, status, employee:profiles!time_clock_entries_employee_id_fkey(full_name, avatar_url)")
      .eq("company_id", profile?.company_id)
      .gte("clock_in", `${today}T00:00:00`)
      .order("clock_in", { ascending: false });
    if (data) setEntries(data as LiveEntry[]);
    setLastRefresh(new Date());
    setIsLoading(false);
  };

  const clockedIn = entries.filter(e => !e.clock_out);
  const clockedOut = entries.filter(e => e.clock_out);

  const getWorkingDuration = (clockIn: string) => {
    const mins = differenceInMinutes(new Date(), parseISO(clockIn));
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("navigation.timeAttendance"), href: "/time-attendance" }, { label: t("timeAttendance.live.title") }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10"><Activity className="h-6 w-6 text-green-600" /></div>
            <div>
              <h1 className="text-2xl font-bold">{t("timeAttendance.live.title")}</h1>
              <p className="text-muted-foreground">{t("timeAttendance.live.subtitle")} - {t("timeAttendance.live.lastRefresh")}: {format(lastRefresh, "HH:mm:ss")}</p>
            </div>
          </div>
          <Button variant="outline" onClick={loadEntries}><RefreshCw className="h-4 w-4 mr-2" />{t("common.refresh")}</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-500/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><UserCheck className="h-4 w-4 text-green-600" />{t("timeAttendance.live.currentlyClockedIn")}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-green-600">{clockedIn.length}</div></CardContent>
          </Card>
          <Card className="border-muted">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><UserX className="h-4 w-4 text-muted-foreground" />{t("timeAttendance.live.clockedOutToday")}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{clockedOut.length}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" />{t("timeAttendance.live.totalPunchesToday")}</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{entries.length}</div></CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-green-600" />{t("timeAttendance.live.currentlyWorking")} ({clockedIn.length})</CardTitle></CardHeader>
            <CardContent>
              {clockedIn.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("timeAttendance.live.noEmployeesWorking")}</p>
              ) : (
                <div className="space-y-3">
                  {clockedIn.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-3">
                        <Avatar><AvatarFallback>{entry.employee?.full_name?.charAt(0) || "?"}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{entry.employee?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{t("timeAttendance.live.clockIn")}: {format(parseISO(entry.clock_in), "HH:mm")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-500/20 text-green-700">{t("timeAttendance.timeTracking.active")}</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{getWorkingDuration(entry.clock_in)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />{t("timeAttendance.live.recentActivity")}</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("timeAttendance.live.employee")}</TableHead>
                    <TableHead>{t("timeAttendance.live.clockIn")}</TableHead>
                    <TableHead>{t("timeAttendance.live.clockOut")}</TableHead>
                    <TableHead>{t("timeAttendance.live.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 10).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.employee?.full_name}</TableCell>
                      <TableCell>{format(parseISO(entry.clock_in), "HH:mm")}</TableCell>
                      <TableCell>{entry.clock_out ? format(parseISO(entry.clock_out), "HH:mm") : "-"}</TableCell>
                      <TableCell>
                        <Badge className={entry.clock_out ? "bg-muted text-muted-foreground" : "bg-green-500/20 text-green-700"}>
                          {entry.clock_out ? t("timeAttendance.timeTracking.completed") : t("timeAttendance.timeTracking.active")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}