import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleReportsButton } from "@/components/reports/ModuleReportsButton";
import {
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle,
  Loader2,
  Settings,
  Target,
} from "lucide-react";

const trainingModules = [
  {
    title: "Course Catalog",
    description: "Browse available training courses",
    href: "/training/catalog",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },
  {
    title: "My Learning",
    description: "Your enrolled courses and progress",
    href: "/training/my-learning",
    icon: GraduationCap,
    color: "bg-success/10 text-success",
  },
  {
    title: "Competency Gap Analysis",
    description: "Compare skills with job requirements",
    href: "/training/gap-analysis",
    icon: Target,
    color: "bg-info/10 text-info",
  },
  {
    title: "Live Sessions",
    description: "Upcoming webinars and workshops",
    href: "/training/sessions",
    icon: Video,
    color: "bg-secondary/10 text-secondary-foreground",
  },
  {
    title: "Certifications",
    description: "Track your certifications",
    href: "/training/certifications",
    icon: Award,
    color: "bg-warning/10 text-warning",
  },
  {
    title: "Training Calendar",
    description: "Schedule and upcoming events",
    href: "/training/calendar",
    icon: Calendar,
    color: "bg-destructive/10 text-destructive",
  },
  {
    title: "LMS Management",
    description: "Create and manage courses (Admin)",
    href: "/admin/lms",
    icon: Settings,
    color: "bg-muted text-muted-foreground",
    adminOnly: true,
  },
];

interface Stats {
  coursesAvailable: number;
  inProgress: number;
  completed: number;
  certifications: number;
}

export default function TrainingDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    coursesAvailable: 0,
    inProgress: 0,
    completed: 0,
    certifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const [coursesRes, enrollmentsRes, certificatesRes] = await Promise.all([
        supabase
          .from("lms_courses")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
        user
          ? supabase
              .from("lms_enrollments")
              .select("status")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
        user
          ? supabase
              .from("lms_certificates")
              .select("id", { count: "exact", head: true })
              .eq("user_id", user.id)
          : Promise.resolve({ count: 0 }),
      ]);

      const enrollments = enrollmentsRes.data || [];
      setStats({
        coursesAvailable: coursesRes.count || 0,
        inProgress: enrollments.filter(
          (e: { status: string }) => e.status === "enrolled" || e.status === "in_progress"
        ).length,
        completed: enrollments.filter((e: { status: string }) => e.status === "completed").length,
        certifications: certificatesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: "Courses Available", value: stats.coursesAvailable, icon: BookOpen, color: "bg-primary/10 text-primary" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "bg-success/10 text-success" },
    { label: "Certifications", value: stats.certifications, icon: Award, color: "bg-info/10 text-info" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Training
                </h1>
                <p className="text-muted-foreground">
                  Learning and development
                </p>
              </div>
            </div>
            <ModuleReportsButton module="training" />
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
                    <p className="mt-1 text-3xl font-bold text-card-foreground">
                      {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stat.value}
                    </p>
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
          {trainingModules.map((module, index) => {
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