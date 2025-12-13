import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import { ModuleBIButton } from "@/components/bi/ModuleBIButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target,
  ClipboardCheck,
  MessageSquare,
  Flag,
  ChevronRight,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  Award,
} from "lucide-react";

const performanceModules = [
  {
    title: "Appraisals",
    description: "Performance reviews and evaluations",
    href: "/performance/appraisals",
    icon: ClipboardCheck,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "360° Feedback",
    description: "Multi-source feedback collection",
    href: "/performance/360",
    icon: MessageSquare,
    color: "bg-sky-500/10 text-sky-600",
  },
  {
    title: "Goals",
    description: "Goal setting and tracking",
    href: "/performance/goals",
    icon: Flag,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    title: "Improvement Plans",
    description: "Track performance improvement plans",
    href: "/performance/pips",
    icon: AlertTriangle,
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    title: "Continuous Feedback",
    description: "Quick feedback and check-ins",
    href: "/performance/feedback",
    icon: MessageCircle,
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    title: "Recognition & Awards",
    description: "Celebrate achievements",
    href: "/performance/recognition",
    icon: Award,
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    title: "Analytics",
    description: "Performance insights and trends",
    href: "/performance/analytics",
    icon: BarChart3,
    color: "bg-muted text-muted-foreground",
  },
];

export default function PerformanceDashboardPage() {
  const { user } = useAuth();

  // Fetch goals data
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ["performance-goals-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_goals")
        .select("id, status, final_score");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch pending appraisal reviews
  const { data: appraisals = [], isLoading: appraisalsLoading } = useQuery({
    queryKey: ["appraisal-participants-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appraisal_participants")
        .select("id, status, overall_score");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const isLoading = goalsLoading || appraisalsLoading;

  // Calculate stats
  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'draft').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const pendingReviews = appraisals.filter(a => a.status === 'pending' || a.status === 'in_progress').length;
  
  // Calculate average rating from completed appraisals
  const completedAppraisals = appraisals.filter(a => a.status === 'completed' && a.overall_score != null);
  const avgRating = completedAppraisals.length > 0 
    ? (completedAppraisals.reduce((sum, a) => sum + (a.overall_score || 0), 0) / completedAppraisals.length).toFixed(1)
    : "N/A";

  const statCards = [
    { label: "Active Goals", value: activeGoals, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Pending Reviews", value: pendingReviews, icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    { label: "Goals Completed", value: completedGoals, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Avg. Rating", value: avgRating, icon: TrendingUp, color: "bg-sky-500/10 text-sky-600" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Performance
                </h1>
                <p className="text-muted-foreground">
                  Performance management and feedback
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModuleBIButton module="performance" />
              <ModuleReportsButton module="performance" />
            </div>
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
                    {isLoading ? (
                      <Skeleton className="h-9 w-16 mt-1" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-card-foreground">{stat.value}</p>
                    )}
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
          {performanceModules.map((module, index) => {
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