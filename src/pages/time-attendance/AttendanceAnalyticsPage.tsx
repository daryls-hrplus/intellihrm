import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";
import { BarChart3, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--success))"];

export default function AttendanceAnalyticsPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [stats, setStats] = useState({
    totalPunches: 0,
    avgHoursPerDay: 0,
    lateArrivals: 0,
    earlyDepartures: 0,
  });
  const [dailyData, setDailyData] = useState<{ date: string; punches: number; hours: number }[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<{ hour: string; clockIn: number; clockOut: number }[]>([]);

  useEffect(() => {
    if (profile?.company_id) loadAnalytics();
  }, [profile?.company_id, period]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    const startDate = format(subDays(new Date(), parseInt(period)), "yyyy-MM-dd");
    const endDate = format(new Date(), "yyyy-MM-dd");

    const { data: entries } = await supabase
      .from("time_clock_entries")
      .select("*")
      .eq("company_id", profile?.company_id)
      .gte("clock_in", `${startDate}T00:00:00`)
      .lte("clock_in", `${endDate}T23:59:59`);

    const { data: exceptions } = await supabase
      .from("attendance_exceptions")
      .select("*")
      .eq("company_id", profile?.company_id)
      .gte("exception_date", startDate)
      .lte("exception_date", endDate);

    if (entries) {
      const totalHours = entries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
      setStats({
        totalPunches: entries.length,
        avgHoursPerDay: entries.length > 0 ? totalHours / (parseInt(period) || 1) : 0,
        lateArrivals: exceptions?.filter(e => e.exception_type === "late_arrival").length || 0,
        earlyDepartures: exceptions?.filter(e => e.exception_type === "early_departure").length || 0,
      });

      const days = eachDayOfInterval({ start: subDays(new Date(), parseInt(period)), end: new Date() });
      const daily = days.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayEntries = entries.filter(e => e.clock_in?.startsWith(dayStr));
        return {
          date: format(day, "MMM d"),
          punches: dayEntries.length,
          hours: dayEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0),
        };
      });
      setDailyData(daily);

      const statusCounts: Record<string, number> = {};
      entries.forEach(e => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });
      setStatusDistribution(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

      const hourlyIn: Record<number, number> = {};
      const hourlyOut: Record<number, number> = {};
      entries.forEach(e => {
        if (e.clock_in) {
          const hour = parseISO(e.clock_in).getHours();
          hourlyIn[hour] = (hourlyIn[hour] || 0) + 1;
        }
        if (e.clock_out) {
          const hour = parseISO(e.clock_out).getHours();
          hourlyOut[hour] = (hourlyOut[hour] || 0) + 1;
        }
      });
      const hourly = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, "0")}:00`,
        clockIn: hourlyIn[i] || 0,
        clockOut: hourlyOut[i] || 0,
      }));
      setHourlyDistribution(hourly);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("navigation.timeAttendance"), href: "/time-attendance" }, { label: t("timeAttendance.analytics.title") }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><BarChart3 className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold">{t("timeAttendance.analytics.title")}</h1>
              <p className="text-muted-foreground">{t("timeAttendance.analytics.subtitle")}</p>
            </div>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t("timeAttendance.analytics.last7Days")}</SelectItem>
              <SelectItem value="30">{t("timeAttendance.analytics.last30Days")}</SelectItem>
              <SelectItem value="90">{t("timeAttendance.analytics.last90Days")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.analytics.totalPunches")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalPunches}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.analytics.avgHoursPerDay")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.avgHoursPerDay.toFixed(1)}h</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.analytics.lateArrivals")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">{stats.lateArrivals}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">{t("timeAttendance.analytics.earlyDepartures")}</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.earlyDepartures}</div></CardContent></Card>
        </div>

        <Tabs defaultValue="trends">
          <TabsList>
            <TabsTrigger value="trends">{t("timeAttendance.analytics.dailyTrends")}</TabsTrigger>
            <TabsTrigger value="distribution">{t("timeAttendance.analytics.statusDistribution")}</TabsTrigger>
            <TabsTrigger value="hourly">{t("timeAttendance.analytics.hourlyPatterns")}</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader><CardTitle>{t("timeAttendance.analytics.dailyTrends")}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="punches" stroke="hsl(var(--primary))" strokeWidth={2} name={t("timeAttendance.analytics.punches")} />
                    <Line type="monotone" dataKey="hours" stroke="hsl(var(--success))" strokeWidth={2} name={t("timeAttendance.analytics.hours")} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution">
            <Card>
              <CardHeader><CardTitle>{t("timeAttendance.analytics.statusDistribution")}</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {statusDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hourly">
            <Card>
              <CardHeader><CardTitle>{t("timeAttendance.analytics.hourlyPatterns")}</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="clockIn" fill="hsl(var(--success))" name={t("timeAttendance.analytics.clockIns")} />
                    <Bar dataKey="clockOut" fill="hsl(var(--destructive))" name={t("timeAttendance.analytics.clockOuts")} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}