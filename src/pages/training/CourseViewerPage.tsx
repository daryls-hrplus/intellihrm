import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  FileText,
  Video,
  ChevronDown,
  ChevronRight,
  Loader2,
  Award,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  code: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  content: string | null;
  video_url: string | null;
  document_url: string | null;
  duration_minutes: number;
  display_order: number;
  quiz_id: string | null;
  is_completed?: boolean;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  status: string;
}

interface LessonProgress {
  lesson_id: string;
  is_completed: boolean;
}

export default function CourseViewerPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const [courseRes, modulesRes, enrollmentRes] = await Promise.all([
        supabase.from("lms_courses").select("*").eq("id", courseId).single(),
        supabase
          .from("lms_modules")
          .select(`*, lessons:lms_lessons(*)`)
          .eq("course_id", courseId)
          .order("display_order")
          .order("display_order", { referencedTable: "lms_lessons" }),
        supabase
          .from("lms_enrollments")
          .select("*")
          .eq("course_id", courseId)
          .eq("user_id", user!.id)
          .maybeSingle(),
      ]);

      if (courseRes.data) setCourse(courseRes.data);
      if (modulesRes.data) {
        setModules(modulesRes.data);
        // Expand all modules by default
        setExpandedModules(new Set(modulesRes.data.map((m: Module) => m.id)));
      }
      if (enrollmentRes.data) {
        setEnrollment(enrollmentRes.data);
        // Fetch lesson progress
        const { data: progressData } = await supabase
          .from("lms_lesson_progress")
          .select("lesson_id, is_completed")
          .eq("enrollment_id", enrollmentRes.data.id);
        if (progressData) setLessonProgress(progressData);
      }

      // Set first lesson as current if none selected
      if (modulesRes.data && modulesRes.data.length > 0) {
        const firstLesson = modulesRes.data[0]?.lessons?.[0];
        if (firstLesson) setCurrentLesson(firstLesson);
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return lessonProgress.some((p) => p.lesson_id === lessonId && p.is_completed);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const markLessonComplete = async () => {
    if (!currentLesson || !enrollment) return;

    setIsMarkingComplete(true);
    try {
      // Upsert lesson progress
      const { error: progressError } = await supabase
        .from("lms_lesson_progress")
        .upsert({
          enrollment_id: enrollment.id,
          lesson_id: currentLesson.id,
          user_id: user!.id,
          is_completed: true,
          completed_at: new Date().toISOString(),
        });

      if (progressError) throw progressError;

      // Update lesson progress state
      setLessonProgress((prev) => [
        ...prev.filter((p) => p.lesson_id !== currentLesson.id),
        { lesson_id: currentLesson.id, is_completed: true },
      ]);

      // Calculate new progress percentage
      const allLessons = modules.flatMap((m) => m.lessons);
      const completedCount = lessonProgress.filter((p) => p.is_completed).length + 1;
      const newProgress = Math.round((completedCount / allLessons.length) * 100);

      // Update enrollment progress
      const newStatus = newProgress === 100 ? "completed" : "in_progress";
      await supabase
        .from("lms_enrollments")
        .update({
          progress_percentage: newProgress,
          status: newStatus,
          started_at: enrollment.status === "enrolled" ? new Date().toISOString() : undefined,
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
        })
        .eq("id", enrollment.id);

      setEnrollment((prev) =>
        prev ? { ...prev, progress_percentage: newProgress, status: newStatus } : null
      );

      toast({ title: "Lesson completed!" });

      // Auto-advance to next lesson
      goToNextLesson();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast({ title: "Failed to save progress", variant: "destructive" });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getAllLessons = () => modules.flatMap((m) => m.lessons);

  const goToNextLesson = () => {
    if (!currentLesson) return;
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex < allLessons.length - 1) {
      setCurrentLesson(allLessons[currentIndex + 1]);
    }
  };

  const goToPreviousLesson = () => {
    if (!currentLesson) return;
    const allLessons = getAllLessons();
    const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(allLessons[currentIndex - 1]);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "document":
        return FileText;
      case "quiz":
        return ClipboardList;
      default:
        return BookOpen;
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Course not found</h2>
          <Button asChild className="mt-4">
            <NavLink to="/training/catalog">Back to Catalog</NavLink>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const allLessons = getAllLessons();
  const currentLessonIndex = currentLesson
    ? allLessons.findIndex((l) => l.id === currentLesson.id)
    : -1;

  return (
    <AppLayout>
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Training", href: "/training" },
            { label: "My Learning", href: "/training/my-learning" },
            { label: course.title },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Course Outline */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Course Outline</h2>
              </div>

              {enrollment && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{enrollment.progress_percentage}%</span>
                  </div>
                  <Progress value={enrollment.progress_percentage} className="h-2" />
                </div>
              )}

              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {modules.map((module) => (
                  <Collapsible
                    key={module.id}
                    open={expandedModules.has(module.id)}
                    onOpenChange={() => toggleModule(module.id)}
                  >
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      <span className="text-left">{module.title}</span>
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-2">
                      {module.lessons.map((lesson) => {
                        const Icon = getContentIcon(lesson.content_type);
                        const completed = isLessonCompleted(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                              currentLesson?.id === lesson.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-muted-foreground"
                            )}
                          >
                            {completed ? (
                              <CheckCircle className="h-4 w-4 text-success shrink-0" />
                            ) : (
                              <Icon className="h-4 w-4 shrink-0" />
                            )}
                            <span className="text-left truncate">{lesson.title}</span>
                          </button>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {currentLesson ? (
              <div className="rounded-xl border border-border bg-card shadow-card">
                {/* Lesson Header */}
                <div className="border-b border-border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Badge variant="outline" className="capitalize">
                      {currentLesson.content_type}
                    </Badge>
                    {currentLesson.duration_minutes > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {currentLesson.duration_minutes}m
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {currentLesson.title}
                  </h2>
                </div>

                {/* Lesson Content */}
                <div className="p-6">
                  {currentLesson.content_type === "video" && currentLesson.video_url ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={currentLesson.video_url}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : currentLesson.content_type === "document" && currentLesson.document_url ? (
                    <div className="rounded-lg border border-border p-8 text-center">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4">
                        <Button asChild>
                          <a
                            href={currentLesson.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Document
                          </a>
                        </Button>
                      </p>
                    </div>
                  ) : currentLesson.content_type === "quiz" && currentLesson.quiz_id ? (
                    <div className="text-center py-8">
                      <ClipboardList className="mx-auto h-12 w-12 text-primary" />
                      <h3 className="mt-4 font-semibold">Quiz Time!</h3>
                      <p className="mt-2 text-muted-foreground">
                        Test your knowledge with this quiz
                      </p>
                      <Button asChild className="mt-4">
                        <NavLink
                          to={`/training/quiz/${currentLesson.quiz_id}?enrollment=${enrollment?.id}`}
                        >
                          Start Quiz
                        </NavLink>
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: currentLesson.content || "<p>No content available</p>",
                      }}
                    />
                  )}
                </div>

                {/* Lesson Footer */}
                <div className="border-t border-border p-4 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousLesson}
                    disabled={currentLessonIndex === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {!isLessonCompleted(currentLesson.id) && (
                      <Button onClick={markLessonComplete} disabled={isMarkingComplete}>
                        {isMarkingComplete ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Mark Complete
                      </Button>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={goToNextLesson}
                    disabled={currentLessonIndex === allLessons.length - 1}
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">Select a lesson to begin</h3>
              </div>
            )}

            {/* Course Completion */}
            {enrollment?.status === "completed" && (
              <div className="mt-6 rounded-xl border border-success/20 bg-success/5 p-6 text-center">
                <Award className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-4 text-lg font-semibold text-success">
                  Course Completed!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Congratulations on completing this course
                </p>
                <Button asChild className="mt-4">
                  <NavLink to="/training/certifications">View Certificate</NavLink>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
