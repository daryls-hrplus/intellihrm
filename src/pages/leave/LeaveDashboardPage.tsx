import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  CalendarPlus,
  CalendarCheck,
  ClipboardList,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const leaveModules = [
  {
    title: "My Leave",
    description: "View and manage your leave requests",
    href: "/leave/my-leave",
    icon: Calendar,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Apply for Leave",
    description: "Submit new leave applications",
    href: "/leave/apply",
    icon: CalendarPlus,
    color: "bg-success/10 text-success",
  },
  {
    title: "Leave Approvals",
    description: "Review and approve team leave requests",
    href: "/leave/approvals",
    icon: CalendarCheck,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Leave Policies",
    description: "View company leave policies",
    href: "/leave/policies",
    icon: ClipboardList,
    color: "bg-info/10 text-info",
  },
  {
    title: "Leave Reports",
    description: "Analytics and reporting",
    href: "/leave/reports",
    icon: BarChart3,
    color: "bg-destructive/10 text-destructive",
  },
];

export default function LeaveDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Leave Management
              </h1>
              <p className="text-muted-foreground">
                Manage time off and leave requests
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leaveModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-3 ${module.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 font-semibold text-card-foreground">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </NavLink>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}