import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { useGranularPermissions } from "@/hooks/useGranularPermissions";
import { GroupedModuleCards, GroupedModuleItem, ModuleSection } from "@/components/ui/GroupedModuleCards";
import { 
  Clock, 
  Calendar, 
  Timer, 
  UserCheck,
  Users,
  AlertCircle,
  TrendingUp,
  ClipboardList,
  Settings,
  Sun,
  MapPin,
  Briefcase,
  Moon,
  Camera,
  Sliders,
  DollarSign,
  SplitSquareHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTodayString } from "@/utils/dateUtils";

export default function TimeAttendanceDashboardPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { hasTabAccess } = useGranularPermissions();
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
      const today = getTodayString();
      const companyFilter = selectedCompanyId !== "all" ? selectedCompanyId : profile.company_id;

      try {
        const { count: totalStaff } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyFilter);

        const { data: clockedInToday } = await supabase
          .from('time_clock_entries')
          .select('employee_id')
          .eq('company_id', companyFilter)
          .gte('clock_in', `${today}T00:00:00`)
          .lte('clock_in', `${today}T23:59:59`);

        const presentToday = new Set((clockedInToday || []).map(e => e.employee_id)).size;

        const leaveResult = await (supabase as any)
          .from('leave_requests')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyFilter)
          .eq('status', 'approved')
          .lte('start_date', today)
          .gte('end_date', today);
        const onLeave = leaveResult.count as number | null;

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

  // Define all modules
  const allModules = {
    // Daily Operations
    tracking: {
      title: t("timeAttendance.modules.timeTracking.title"),
      description: t("timeAttendance.modules.timeTracking.description"),
      icon: Timer,
      href: "/time-attendance/tracking",
      color: "bg-primary/10 text-primary",
      tabCode: "tracking",
    },
    records: {
      title: t("timeAttendance.modules.records.title"),
      description: t("timeAttendance.modules.records.description"),
      icon: ClipboardList,
      href: "/time-attendance/records",
      color: "bg-success/10 text-success",
      tabCode: "records",
    },
    live: {
      title: t("timeAttendance.modules.live.title"),
      description: t("timeAttendance.modules.live.description"),
      icon: UserCheck,
      href: "/time-attendance/live",
      color: "bg-green-500/10 text-green-600",
      tabCode: "live",
    },
    exceptions: {
      title: t("timeAttendance.modules.exceptions.title"),
      description: t("timeAttendance.modules.exceptions.description"),
      icon: AlertCircle,
      href: "/time-attendance/exceptions",
      color: "bg-red-500/10 text-red-600",
      tabCode: "exceptions",
    },
    // Scheduling
    schedules: {
      title: t("timeAttendance.modules.schedules.title"),
      description: t("timeAttendance.modules.schedules.description"),
      icon: Calendar,
      href: "/time-attendance/schedules",
      color: "bg-warning/10 text-warning",
      tabCode: "schedules",
    },
    shifts: {
      title: t("timeAttendance.modules.shifts.title"),
      description: t("timeAttendance.modules.shifts.description"),
      icon: Sun,
      href: "/time-attendance/shifts",
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "shifts",
    },
    overtime: {
      title: t("timeAttendance.modules.overtime.title"),
      description: t("timeAttendance.modules.overtime.description"),
      icon: Clock,
      href: "/time-attendance/overtime",
      color: "bg-secondary/10 text-secondary-foreground",
      tabCode: "overtime",
    },
    // Project Time
    projects: {
      title: t("timeAttendance.modules.projects.title"),
      description: t("timeAttendance.modules.projects.description"),
      icon: Briefcase,
      href: "/time-attendance/projects",
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "projects",
    },
    timesheetApprovals: {
      title: t("timeAttendance.modules.timesheetApprovals.title"),
      description: t("timeAttendance.modules.timesheetApprovals.description"),
      icon: ClipboardList,
      href: "/time-attendance/timesheet-approvals",
      color: "bg-indigo-500/10 text-indigo-600",
      tabCode: "timesheet_approvals",
    },
    projectCosts: {
      title: "Project Costs",
      description: "Track labor costs, budgets, and profitability by project",
      icon: DollarSign,
      href: "/time/project-costs",
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "project_costs",
    },
    costConfig: {
      title: "Cost Configuration",
      description: "Configure project rates and budgets",
      icon: Settings,
      href: "/time/project-cost-config",
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "cost_config",
    },
    costAllocation: {
      title: "Cost Allocation",
      description: "Split time entries across projects",
      icon: SplitSquareHorizontal,
      href: "/time/cost-allocation",
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "cost_allocation",
    },
    // Configuration
    policies: {
      title: t("timeAttendance.modules.policies.title"),
      description: t("timeAttendance.modules.policies.description"),
      icon: Settings,
      href: "/time-attendance/policies",
      color: "bg-amber-500/10 text-amber-600",
      tabCode: "policies",
    },
    devices: {
      title: t("timeAttendance.modules.devices.title"),
      description: t("timeAttendance.modules.devices.description"),
      icon: Settings,
      href: "/time-attendance/devices",
      color: "bg-slate-500/10 text-slate-600",
      tabCode: "devices",
    },
    geofencing: {
      title: t("timeAttendance.modules.geofencing.title"),
      description: t("timeAttendance.modules.geofencing.description"),
      icon: MapPin,
      href: "/time-attendance/geofencing",
      color: "bg-teal-500/10 text-teal-600",
      tabCode: "geofencing",
    },
    import: {
      title: t("timeAttendance.modules.import.title"),
      description: t("timeAttendance.modules.import.description"),
      icon: ClipboardList,
      href: "/time-attendance/import",
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "import",
    },
    shiftDifferentials: {
      title: "Shift Differentials",
      description: "Configure night, weekend, and holiday pay premiums",
      icon: Moon,
      href: "/time/shift-differentials",
      color: "bg-indigo-500/10 text-indigo-600",
      tabCode: "shift_differentials",
    },
    geofenceLocations: {
      title: "Geofence Locations",
      description: "Define approved work locations for clock-in validation",
      icon: MapPin,
      href: "/time/geofence-locations",
      color: "bg-emerald-500/10 text-emerald-600",
      tabCode: "geofence_locations",
    },
    faceVerification: {
      title: "Face Verification",
      description: "Enroll employee faces and manage verification settings",
      icon: Camera,
      href: "/time/face-verification",
      color: "bg-rose-500/10 text-rose-600",
      tabCode: "face_verification",
    },
    // Analytics
    analytics: {
      title: t("timeAttendance.modules.analytics.title"),
      description: t("timeAttendance.modules.analytics.description"),
      icon: TrendingUp,
      href: "/time-attendance/analytics",
      color: "bg-purple-500/10 text-purple-600",
      tabCode: "analytics",
    },
    absenteeismCost: {
      title: "Absenteeism Cost",
      description: "Analyze absence costs, Bradford Factor, and department impact",
      icon: DollarSign,
      href: "/time-attendance/absenteeism-cost",
      color: "bg-red-500/10 text-red-600",
      tabCode: "absenteeism_cost",
    },
    wellness: {
      title: "Wellness Monitoring",
      description: "AI-powered fatigue detection and burnout risk analysis",
      icon: UserCheck,
      href: "/time-attendance/wellness",
      color: "bg-pink-500/10 text-pink-600",
      tabCode: "wellness",
    },
    overtimeAlerts: {
      title: "Overtime Alerts",
      description: "Proactive overtime risk notifications",
      icon: AlertCircle,
      href: "/time-attendance/overtime-alerts",
      color: "bg-orange-500/10 text-orange-600",
      tabCode: "overtime_alerts",
    },
    laborCompliance: {
      title: "Labor Compliance",
      description: "Multi-country labor law compliance",
      icon: Settings,
      href: "/time-attendance/labor-compliance",
      color: "bg-blue-500/10 text-blue-600",
      tabCode: "labor_compliance",
    },
    flexTime: {
      title: "Flex Time",
      description: "Manage flexible working hour balances",
      icon: Clock,
      href: "/time-attendance/flex-time",
      color: "bg-violet-500/10 text-violet-600",
      tabCode: "flex_time",
    },
    regularization: {
      title: "Regularization",
      description: "Attendance correction requests",
      icon: ClipboardList,
      href: "/time-attendance/regularization",
      color: "bg-cyan-500/10 text-cyan-600",
      tabCode: "regularization",
    },
    cbaRules: {
      title: "CBA Time Rules",
      description: "Collective bargaining agreement rules",
      icon: Sliders,
      href: "/time-attendance/cba-rules",
      color: "bg-amber-500/10 text-amber-600",
      tabCode: "cba_rules",
    },
    auditTrail: {
      title: "Audit Trail",
      description: "Complete time & attendance change history",
      icon: Clock,
      href: "/time-attendance/audit-trail",
      color: "bg-slate-500/10 text-slate-600",
      tabCode: "audit_trail",
    },
  };

  // Filter by permissions
  const filterByAccess = (modules: GroupedModuleItem[]): GroupedModuleItem[] => {
    return modules.filter(m => hasTabAccess("time_attendance", m.tabCode || ""));
  };

  // Build grouped sections
  const sections: ModuleSection[] = [
    {
      titleKey: "Daily Operations",
      items: filterByAccess([
        allModules.tracking,
        allModules.records,
        allModules.live,
        allModules.exceptions,
      ]),
    },
    {
      titleKey: "Scheduling",
      items: filterByAccess([
        allModules.schedules,
        allModules.shifts,
        allModules.overtime,
      ]),
    },
    {
      titleKey: "Project Time & Costs",
      items: filterByAccess([
        allModules.projects,
        allModules.timesheetApprovals,
        allModules.projectCosts,
        allModules.costConfig,
        allModules.costAllocation,
      ]),
    },
    {
      titleKey: "Time & Attendance Setup",
      items: filterByAccess([
        allModules.policies,
        allModules.devices,
        allModules.geofencing,
        allModules.import,
        allModules.shiftDifferentials,
        allModules.geofenceLocations,
        allModules.faceVerification,
      ]),
    },
    {
      titleKey: "Analytics & Intelligence",
      items: filterByAccess([
        allModules.analytics,
        allModules.absenteeismCost,
        allModules.wellness,
        allModules.overtimeAlerts,
      ]),
    },
    {
      titleKey: "Compliance & Governance",
      items: filterByAccess([
        allModules.laborCompliance,
        allModules.flexTime,
        allModules.regularization,
        allModules.cbaRules,
        allModules.auditTrail,
      ]),
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

        {/* Grouped Modules */}
        <GroupedModuleCards sections={sections} defaultOpen={true} showToggleButton />
      </div>
    </AppLayout>
  );
}
