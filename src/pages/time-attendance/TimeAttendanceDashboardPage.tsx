import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { 
  Clock, 
  Calendar, 
  Timer, 
  UserCheck,
  ArrowRight,
  Users,
  AlertCircle,
  TrendingUp,
  ClipboardList,
  Settings,
  Sun,
  MapPin,
  Briefcase,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export default function TimeAttendanceDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [stats, setStats] = useState({
    presentToday: 0,
    absent: 0,
    onLeave: 0,
    totalStaff: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.company_id) return;
      
      setIsLoading(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const companyFilter = selectedCompanyId !== "all" ? selectedCompanyId : profile.company_id;

      try {
        // Get total employees
        const { count: totalStaff } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyFilter);

        // Get employees who clocked in today
        const { data: clockedInToday } = await supabase
          .from('time_clock_entries')
          .select('employee_id')
          .eq('company_id', companyFilter)
          .gte('clock_in', `${today}T00:00:00`)
          .lte('clock_in', `${today}T23:59:59`);

        const presentToday = new Set((clockedInToday || []).map(e => e.employee_id)).size;

        // Get employees on leave today
        const leaveResult = await (supabase as any)
          .from('leave_requests')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyFilter)
          .eq('status', 'approved')
          .lte('start_date', today)
          .gte('end_date', today);
        const onLeave = leaveResult.count as number | null;

        // Calculate absent (total - present - on leave)
        const absent = Math.max(0, (totalStaff || 0) - presentToday - (onLeave || 0));

        setStats({
          presentToday,
          absent,
          onLeave: onLeave || 0,
          totalStaff: totalStaff || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [profile?.company_id, selectedCompanyId]);

  const features = [
    {
      title: t("timeAttendance.modules.timeTracking.title"),
      description: t("timeAttendance.modules.timeTracking.description"),
      icon: Timer,
      href: "/time-attendance/tracking",
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("timeAttendance.modules.records.title"),
      description: t("timeAttendance.modules.records.description"),
      icon: ClipboardList,
      href: "/time-attendance/records",
      color: "bg-success/10 text-success",
    },
    {
      title: t("timeAttendance.modules.schedules.title"),
      description: t("timeAttendance.modules.schedules.description"),
      icon: Calendar,
      href: "/time-attendance/schedules",
      color: "bg-warning/10 text-warning",
    },
    {
      title: t("timeAttendance.modules.overtime.title"),
      description: t("timeAttendance.modules.overtime.description"),
      icon: Clock,
      href: "/time-attendance/overtime",
      color: "bg-secondary/10 text-secondary-foreground",
    },
    {
      title: t("timeAttendance.modules.shifts.title"),
      description: t("timeAttendance.modules.shifts.description"),
      icon: Sun,
      href: "/time-attendance/shifts",
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      title: t("timeAttendance.modules.geofencing.title"),
      description: t("timeAttendance.modules.geofencing.description"),
      icon: MapPin,
      href: "/time-attendance/geofencing",
      color: "bg-teal-500/10 text-teal-600",
    },
    {
      title: t("timeAttendance.modules.projects.title"),
      description: t("timeAttendance.modules.projects.description"),
      icon: Briefcase,
      href: "/time-attendance/projects",
      color: "bg-violet-500/10 text-violet-600",
    },
    {
      title: t("timeAttendance.modules.timesheetApprovals.title"),
      description: t("timeAttendance.modules.timesheetApprovals.description"),
      icon: ClipboardList,
      href: "/time-attendance/timesheet-approvals",
      color: "bg-indigo-500/10 text-indigo-600",
    },
    {
      title: t("timeAttendance.modules.devices.title"),
      description: t("timeAttendance.modules.devices.description"),
      icon: Settings,
      href: "/time-attendance/devices",
      color: "bg-slate-500/10 text-slate-600",
    },
    {
      title: t("timeAttendance.modules.policies.title"),
      description: t("timeAttendance.modules.policies.description"),
      icon: Settings,
      href: "/time-attendance/policies",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      title: t("timeAttendance.modules.exceptions.title"),
      description: t("timeAttendance.modules.exceptions.description"),
      icon: AlertCircle,
      href: "/time-attendance/exceptions",
      color: "bg-red-500/10 text-red-600",
    },
    {
      title: t("timeAttendance.modules.live.title"),
      description: t("timeAttendance.modules.live.description"),
      icon: UserCheck,
      href: "/time-attendance/live",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: t("timeAttendance.modules.import.title"),
      description: t("timeAttendance.modules.import.description"),
      icon: ClipboardList,
      href: "/time-attendance/import",
      color: "bg-cyan-500/10 text-cyan-600",
    },
    {
      title: t("timeAttendance.modules.analytics.title"),
      description: t("timeAttendance.modules.analytics.description"),
      icon: TrendingUp,
      href: "/time-attendance/analytics",
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  const statCards = [
    { label: t("timeAttendance.stats.presentToday"), value: stats.presentToday, icon: UserCheck, color: "text-success" },
    { label: t("timeAttendance.stats.absent"), value: stats.absent, icon: AlertCircle, color: "text-destructive" },
    { label: t("timeAttendance.stats.onLeave"), value: stats.onLeave, icon: Calendar, color: "text-warning" },
    { label: t("timeAttendance.stats.totalStaff"), value: stats.totalStaff, icon: Users, color: "text-muted-foreground" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("timeAttendance.title") }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("timeAttendance.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("timeAttendance.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LeaveCompanyFilter 
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <ModuleBIButton module="time_attendance" />
            <ModuleReportsButton module="time_attendance" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-semibold">
                      {isLoading ? "..." : stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group cursor-pointer transition-all hover:shadow-md"
                onClick={() => navigate(feature.href)}
              >
                <CardHeader className="pb-2">
                  <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="flex items-center justify-between text-base">
                    {feature.title}
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t("timeAttendance.todayOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              {t("timeAttendance.clickFeatureToStart")}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
