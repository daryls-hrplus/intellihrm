import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
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

const features = [
  {
    title: "Time Tracking",
    description: "Clock in/out and track work hours",
    icon: Timer,
    href: "/time-attendance/tracking",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Attendance Records",
    description: "View and manage attendance history",
    icon: ClipboardList,
    href: "/time-attendance/records",
    color: "bg-success/10 text-success",
  },
  {
    title: "Schedules",
    description: "Create and manage work schedules",
    icon: Calendar,
    href: "/time-attendance/schedules",
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Overtime Management",
    description: "Track and approve overtime requests",
    icon: Clock,
    href: "/time-attendance/overtime",
    color: "bg-secondary/10 text-secondary-foreground",
  },
  {
    title: "Shift Management",
    description: "Configure shifts, rounding rules, and pay differentials",
    icon: Sun,
    href: "/time-attendance/shifts",
    color: "bg-orange-500/10 text-orange-600",
  },
{
    title: "Geofencing",
    description: "Location-based clock in/out restrictions",
    icon: MapPin,
    href: "/time-attendance/geofencing",
    color: "bg-teal-500/10 text-teal-600",
  },
  {
    title: "Project Time Tracking",
    description: "Track time against clients, projects and tasks",
    icon: Briefcase,
    href: "/time-attendance/projects",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Timesheet Approvals",
    description: "Submit timesheets for workflow approval",
    icon: ClipboardList,
    href: "/time-attendance/timesheet-approvals",
    color: "bg-indigo-500/10 text-indigo-600",
  },
  {
    title: "Timeclock Devices",
    description: "Manage physical timeclock terminals",
    icon: Settings,
    href: "/time-attendance/devices",
    color: "bg-slate-500/10 text-slate-600",
  },
  {
    title: "Attendance Policies",
    description: "Configure late rules and rounding",
    icon: Settings,
    href: "/time-attendance/policies",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Exceptions",
    description: "Review missing punches and corrections",
    icon: AlertCircle,
    href: "/time-attendance/exceptions",
    color: "bg-red-500/10 text-red-600",
  },
  {
    title: "Live Dashboard",
    description: "Real-time attendance feed",
    icon: UserCheck,
    href: "/time-attendance/live",
    color: "bg-green-500/10 text-green-600",
  },
  {
    title: "Punch Import",
    description: "Import punches from external systems",
    icon: ClipboardList,
    href: "/time-attendance/import",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    title: "Analytics",
    description: "Attendance trends and insights",
    icon: TrendingUp,
    href: "/time-attendance/analytics",
    color: "bg-purple-500/10 text-purple-600",
  },
];

const stats = [
  { label: "Present Today", value: "218", icon: UserCheck, color: "text-success" },
  { label: "Absent", value: "12", icon: AlertCircle, color: "text-destructive" },
  { label: "On Leave", value: "15", icon: Calendar, color: "text-warning" },
  { label: "Total Staff", value: "245", icon: Users, color: "text-muted-foreground" },
];

export default function TimeAttendanceDashboardPage() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Time & Attendance" }]} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Time & Attendance
              </h1>
              <p className="text-muted-foreground">
                Track work hours, manage schedules, and monitor attendance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModuleBIButton module="time_attendance" />
            <ModuleReportsButton module="time_attendance" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xl font-semibold">{stat.value}</p>
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
              Today's Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Click on a feature above to get started with time tracking.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
