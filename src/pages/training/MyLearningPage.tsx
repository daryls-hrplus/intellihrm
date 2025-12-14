import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  Play,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink } from "react-router-dom";

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  due_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  progress_percentage: number;
  status: string;
  course: {
    id: string;
    title: string;
    code: string;
    description: string | null;
    thumbnail_url: string | null;
    duration_minutes: number;
    difficulty_level: string;
    category: {
      name: string;
    } | null;
  };
}

export default function MyLearningPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("in_progress");

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lms_enrollments")
        .select(`
          *,
          course:lms_courses(
            id, title, code, description, thumbnail_url, 
            duration_minutes, difficulty_level,
            category:lms_categories(name)
          )
        `)
        .eq("user_id", user!.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const inProgressEnrollments = enrollments.filter(
    (e) => e.status === "enrolled" || e.status === "in_progress"
  );
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "completed"
  );

  const stats = {
    total: enrollments.length,
    inProgress: inProgressEnrollments.length,
    completed: completedEnrollments.length,
    totalHours: Math.round(
      enrollments.reduce((acc, e) => acc + (e.course?.duration_minutes || 0), 0) / 60
    ),
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-success">{t("training.stats.completed")}</Badge>;
      case "in_progress":
        return <Badge className="bg-info">{t("training.stats.inProgress")}</Badge>;
      case "enrolled":
        return <Badge variant="outline">{t("training.modules.myLearning.startCourse")}</Badge>;
      case "expired":
        return <Badge className="bg-destructive">{t("training.modules.certifications.expired")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const CourseCard = ({ enrollment }: { enrollment: Enrollment }) => (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover hover:border-primary/20">
      <div className="relative aspect-video overflow-hidden rounded-t-xl bg-muted">
        {enrollment.course.thumbnail_url ? (
          <img
            src={enrollment.course.thumbnail_url}
            alt={enrollment.course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <BookOpen className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          {getStatusBadge(enrollment.status)}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {enrollment.course.category && (
          <span className="text-xs font-medium text-muted-foreground">
            {enrollment.course.category.name}
          </span>
        )}
        <h3 className="mt-1 font-semibold text-foreground line-clamp-2">
          {enrollment.course.title}
        </h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("common.progress")}</span>
            <span className="font-medium">{enrollment.progress_percentage}%</span>
          </div>
          <Progress value={enrollment.progress_percentage} className="h-2" />
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(enrollment.course.duration_minutes)}
          </span>
          {enrollment.due_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due {new Date(enrollment.due_date).toLocaleDateString()}
            </span>
          )}
        </div>

        <Button asChild className="mt-4">
          <NavLink to={`/training/course/${enrollment.course_id}`}>
            {enrollment.status === "completed" ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> {t("training.modules.myLearning.reviewCourse")}
              </>
            ) : enrollment.status === "in_progress" ? (
              <>
                <Play className="mr-2 h-4 w-4" /> {t("training.modules.courseCatalog.continue")}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> {t("training.modules.myLearning.startCourse")}
              </>
            )}
          </NavLink>
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("training.dashboard.title"), href: "/training" },
            { label: t("training.modules.myLearning.title") },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <GraduationCap className="h-5 w-5 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("training.modules.myLearning.title")}
            </h1>
            <p className="text-muted-foreground">
              {t("training.modules.myLearning.trackProgress")}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("training.stats.totalCourses")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("training.stats.inProgress")}</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("training.stats.completed")}</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("training.stats.totalHours")}</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">
              {t("training.modules.myLearning.noCourses")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("training.modules.myLearning.browseCatalog")}
            </p>
            <Button asChild className="mt-4">
              <NavLink to="/training/catalog">{t("training.modules.myLearning.browseCourses")}</NavLink>
            </Button>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="in_progress">
                {t("training.modules.myLearning.inProgressTab")} ({inProgressEnrollments.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                {t("training.modules.myLearning.completedTab")} ({completedEnrollments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in_progress" className="mt-6">
              {inProgressEnrollments.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">
                    {t("training.modules.myLearning.noCoursesInProgress")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgressEnrollments.map((enrollment) => (
                    <CourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
              {completedEnrollments.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground">
                    {t("training.modules.myLearning.noCompletedCourses")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedEnrollments.map((enrollment) => (
                    <CourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}
