import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import {
  UserPlus,
  Briefcase,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
} from "lucide-react";

const recruitmentModules = [
  {
    title: "Job Postings",
    description: "Manage open positions",
    href: "/recruitment/jobs",
    icon: Briefcase,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Candidates",
    description: "View and manage applicants",
    href: "/recruitment/candidates",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: "Applications",
    description: "Review job applications",
    href: "/recruitment/applications",
    icon: FileText,
    color: "bg-info/10 text-info",
  },
  {
    title: "Interview Schedule",
    description: "Manage interview calendar",
    href: "/recruitment/interviews",
    icon: Calendar,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Onboarding",
    description: "New hire onboarding process",
    href: "/recruitment/onboarding",
    icon: UserPlus,
    color: "bg-destructive/10 text-destructive",
  },
];

const statCards = [
  { label: "Open Positions", value: 12, icon: Briefcase, color: "bg-primary/10 text-primary" },
  { label: "Total Candidates", value: 87, icon: Users, color: "bg-info/10 text-info" },
  { label: "Interviews Today", value: 5, icon: Calendar, color: "bg-warning/10 text-warning" },
  { label: "Hired This Month", value: 8, icon: CheckCircle, color: "bg-success/10 text-success" },
];

export default function RecruitmentDashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Recruitment
                </h1>
                <p className="text-muted-foreground">
                  Hiring and onboarding
                </p>
              </div>
            </div>
            <ModuleReportsButton module="recruitment" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recruitmentModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <NavLink
                key={module.href}
                to={module.href}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${(index + 4) * 50}ms` }}
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