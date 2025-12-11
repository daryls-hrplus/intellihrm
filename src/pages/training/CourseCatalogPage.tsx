import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen,
  Search,
  Clock,
  Users,
  Star,
  ChevronRight,
  Filter,
  Loader2,
  GraduationCap,
  CheckCircle,
  Play,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NavLink } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  code: string;
  icon: string;
}

interface Course {
  id: string;
  title: string;
  code: string;
  description: string | null;
  category_id: string | null;
  thumbnail_url: string | null;
  duration_minutes: number;
  difficulty_level: string;
  is_mandatory: boolean;
  category?: Category;
  enrollment_count?: number;
  is_enrolled?: boolean;
  enrollment_status?: string;
}

export default function CourseCatalogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [enrollingCourseId, setEnrollingCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, categoriesRes, enrollmentsRes] = await Promise.all([
        supabase
          .from("lms_courses")
          .select(`*, category:lms_categories(id, name, code, icon)`)
          .eq("is_published", true)
          .order("title"),
        supabase
          .from("lms_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order"),
        user
          ? supabase
              .from("lms_enrollments")
              .select("course_id, status")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (coursesRes.data) {
        const enrollmentMap = new Map(
          (enrollmentsRes.data || []).map((e: { course_id: string; status: string }) => [e.course_id, e.status])
        );
        
        const coursesWithEnrollment = coursesRes.data.map((course: Course) => ({
          ...course,
          is_enrolled: enrollmentMap.has(course.id),
          enrollment_status: enrollmentMap.get(course.id),
        }));
        setCourses(coursesWithEnrollment);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({ title: "Please log in to enroll", variant: "destructive" });
      return;
    }

    setEnrollingCourseId(courseId);
    try {
      const { error } = await supabase.from("lms_enrollments").insert({
        course_id: courseId,
        user_id: user.id,
        enrolled_by: user.id,
      });

      if (error) throw error;

      toast({ title: "Successfully enrolled in course" });
      fetchData();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({ title: "Failed to enroll", description: err.message, variant: "destructive" });
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || course.category_id === selectedCategory;
    const matchesDifficulty =
      selectedDifficulty === "all" || course.difficulty_level === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-success/10 text-success";
      case "intermediate":
        return "bg-warning/10 text-warning";
      case "advanced":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Training", href: "/training" },
            { label: "Course Catalog" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Course Catalog
              </h1>
              <p className="text-muted-foreground">
                Browse and enroll in available courses
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">No courses found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover hover:border-primary/20"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden rounded-t-xl bg-muted">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <BookOpen className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  {course.is_mandatory && (
                    <Badge className="absolute left-2 top-2 bg-destructive">
                      Mandatory
                    </Badge>
                  )}
                  {course.is_enrolled && (
                    <Badge
                      className={`absolute right-2 top-2 ${
                        course.enrollment_status === "completed"
                          ? "bg-success"
                          : "bg-info"
                      }`}
                    >
                      {course.enrollment_status === "completed" ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" /> Completed
                        </>
                      ) : (
                        "Enrolled"
                      )}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {course.category && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {course.category.name}
                        </span>
                      )}
                      <h3 className="mt-1 font-semibold text-foreground line-clamp-2">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {course.description || "No description available"}
                  </p>

                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(course.duration_minutes)}
                    </span>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(course.difficulty_level)}
                    >
                      {course.difficulty_level}
                    </Badge>
                  </div>

                  <div className="mt-4 flex gap-2">
                    {course.is_enrolled ? (
                      <Button asChild className="flex-1">
                        <NavLink to={`/training/course/${course.id}`}>
                          <Play className="mr-2 h-4 w-4" />
                          {course.enrollment_status === "completed"
                            ? "Review"
                            : "Continue"}
                        </NavLink>
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleEnroll(course.id)}
                          disabled={enrollingCourseId === course.id}
                          className="flex-1"
                        >
                          {enrollingCourseId === course.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <GraduationCap className="mr-2 h-4 w-4" />
                          )}
                          Enroll
                        </Button>
                        <Button variant="outline" asChild>
                          <NavLink to={`/training/course/${course.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </NavLink>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
