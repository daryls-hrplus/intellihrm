import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, startOfDay, endOfDay } from "date-fns";
import { LeaveCompanyFilter, useLeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import {
  UserPlus,
  Briefcase,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle,
  BarChart3,
} from "lucide-react";

const recruitmentModules = [
  {
    title: "Recruitment Management",
    description: "Requisitions, candidates, applications & job board config",
    href: "/recruitment/manage",
    icon: Briefcase,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Candidates",
    description: "View and manage applicants",
    href: "/recruitment/manage?tab=candidates",
    icon: Users,
    color: "bg-success/10 text-success",
  },
  {
    title: "Applications",
    description: "Review job applications",
    href: "/recruitment/manage?tab=applications",
    icon: FileText,
    color: "bg-info/10 text-info",
  },
  {
    title: "Interview Schedule",
    description: "Manage interview calendar",
    href: "/recruitment/manage?tab=interviews",
    icon: Calendar,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Recruitment Analytics",
    description: "Pipeline metrics, hiring trends & source analysis",
    href: "/recruitment/analytics",
    icon: BarChart3,
    color: "bg-chart-3/10 text-chart-3",
  },
];

export default function RecruitmentDashboardPage() {
  const { selectedCompanyId, setSelectedCompanyId } = useLeaveCompanyFilter();

  // Fetch open positions count
  const { data: openPositions = 0 } = useQuery({
    queryKey: ["recruitment-stats-open-positions", selectedCompanyId],
    queryFn: async () => {
      let query = supabase
        .from("job_requisitions")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      if (selectedCompanyId) {
        query = query.eq("company_id", selectedCompanyId);
      }
      const { count } = await query;
      return count || 0;
    },
  });

  // Fetch total candidates count (candidates table doesn't have company_id, so we can't filter)
  const { data: totalCandidates = 0 } = useQuery({
    queryKey: ["recruitment-stats-candidates"],
    queryFn: async () => {
      const { count } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  // Fetch interviews scheduled for today
  const { data: interviewsToday = 0 } = useQuery({
    queryKey: ["recruitment-stats-interviews-today", selectedCompanyId],
    queryFn: async () => {
      const today = new Date();
      // interview_schedules doesn't have company_id directly, would need to join
      const { count } = await supabase
        .from("interview_schedules")
        .select("*", { count: "exact", head: true })
        .gte("scheduled_at", startOfDay(today).toISOString())
        .lte("scheduled_at", endOfDay(today).toISOString())
        .eq("status", "scheduled");
      return count || 0;
    },
  });

  // Fetch hired this month count
  const { data: hiredThisMonth = 0 } = useQuery({
    queryKey: ["recruitment-stats-hired-month", selectedCompanyId],
    queryFn: async () => {
      const monthStart = startOfMonth(new Date());
      // applications doesn't have company_id directly
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("stage", "hired")
        .gte("hired_at", monthStart.toISOString());
      return count || 0;
    },
  });

  const statCards = [
    { label: "Open Positions", value: openPositions, icon: Briefcase, color: "bg-primary/10 text-primary", href: "/recruitment/manage?tab=requisitions" },
    { label: "Total Candidates", value: totalCandidates, icon: Users, color: "bg-info/10 text-info", href: "/recruitment/manage?tab=candidates" },
    { label: "Interviews Today", value: interviewsToday, icon: Calendar, color: "bg-warning/10 text-warning", href: "/recruitment/manage?tab=applications" },
    { label: "Hired This Month", value: hiredThisMonth, icon: CheckCircle, color: "bg-success/10 text-success", href: "/recruitment/manage?tab=applications" },
  ];

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
                  Manage job requisitions, candidates, and hiring
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LeaveCompanyFilter 
                selectedCompanyId={selectedCompanyId} 
                onCompanyChange={setSelectedCompanyId} 
              />
              <ModuleBIButton module="recruitment" />
              <ModuleReportsButton module="recruitment" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <NavLink
                key={stat.label}
                to={stat.href}
                className="rounded-xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-card-hover hover:border-primary/20"
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
              </NavLink>
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
