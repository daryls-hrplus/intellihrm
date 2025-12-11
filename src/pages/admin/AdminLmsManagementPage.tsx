import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Pencil, Trash2, BookOpen, Layers, FileText, 
  HelpCircle, GraduationCap, Loader2, Eye, ChevronRight
} from "lucide-react";

interface Category {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

interface Course {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category_id: string | null;
  difficulty_level: string;
  duration_minutes: number | null;
  is_published: boolean;
  is_mandatory: boolean;
  passing_score: number | null;
  thumbnail_url: string | null;
  category?: Category;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  display_order: number;
  is_published: boolean;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: string;
  content: string | null;
  video_url: string | null;
  document_url: string | null;
  quiz_id: string | null;
  duration_minutes: number | null;
  display_order: number;
  is_published: boolean;
}

interface Quiz {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  is_published: boolean;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: any;
  points: number;
  display_order: number;
  explanation: string | null;
}

export default function AdminLmsManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("categories");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  // Selected states for drill-down
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  
  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [courseDialog, setCourseDialog] = useState(false);
  const [moduleDialog, setModuleDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [quizDialog, setQuizDialog] = useState(false);
  const [questionDialog, setQuestionDialog] = useState(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, coursesRes, quizzesRes] = await Promise.all([
        supabase.from('lms_categories').select('*').order('display_order'),
        supabase.from('lms_courses').select('*, category:lms_categories(*)').order('created_at', { ascending: false }),
        supabase.from('lms_quizzes').select('*').order('created_at', { ascending: false })
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (coursesRes.data) setCourses(coursesRes.data);
      if (quizzesRes.data) setQuizzes(quizzesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    const { data } = await supabase
      .from('lms_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('display_order');
    if (data) setModules(data);
  };

  const fetchLessons = async (moduleId: string) => {
    const { data } = await supabase
      .from('lms_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('display_order');
    if (data) setLessons(data);
  };

  const fetchQuestions = async (quizId: string) => {
    const { data } = await supabase
      .from('lms_quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('display_order');
    if (data) setQuestions(data);
  };

  // Category CRUD
  const saveCategory = async (formData: FormData) => {
    const data = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string || null,
      icon: formData.get('icon') as string || 'BookOpen',
      is_active: formData.get('is_active') === 'true'
    };

    if (editingCategory) {
      const { error } = await supabase.from('lms_categories').update(data).eq('id', editingCategory.id);
      if (error) throw error;
      toast({ title: "Category updated" });
    } else {
      const { error } = await supabase.from('lms_categories').insert(data);
      if (error) throw error;
      toast({ title: "Category created" });
    }
    setCategoryDialog(false);
    setEditingCategory(null);
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const { error } = await supabase.from('lms_categories').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category deleted" });
      fetchData();
    }
  };

  // Course CRUD
  const saveCourse = async (formData: FormData) => {
    const data = {
      code: formData.get('code') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      category_id: formData.get('category_id') as string || null,
      difficulty_level: formData.get('difficulty_level') as string,
      duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
      passing_score: parseInt(formData.get('passing_score') as string) || 70,
      is_published: formData.get('is_published') === 'true',
      is_mandatory: formData.get('is_mandatory') === 'true',
      created_by: user?.id
    };

    if (editingCourse) {
      const { error } = await supabase.from('lms_courses').update(data).eq('id', editingCourse.id);
      if (error) throw error;
      toast({ title: "Course updated" });
    } else {
      const { error } = await supabase.from('lms_courses').insert(data);
      if (error) throw error;
      toast({ title: "Course created" });
    }
    setCourseDialog(false);
    setEditingCourse(null);
    fetchData();
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its content?')) return;
    const { error } = await supabase.from('lms_courses').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Course deleted" });
      fetchData();
    }
  };

  // Module CRUD
  const saveModule = async (formData: FormData) => {
    const data = {
      course_id: selectedCourse!.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_published: formData.get('is_published') === 'true'
    };

    if (editingModule) {
      const { error } = await supabase.from('lms_modules').update(data).eq('id', editingModule.id);
      if (error) throw error;
      toast({ title: "Module updated" });
    } else {
      const { error } = await supabase.from('lms_modules').insert(data);
      if (error) throw error;
      toast({ title: "Module created" });
    }
    setModuleDialog(false);
    setEditingModule(null);
    fetchModules(selectedCourse!.id);
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    const { error } = await supabase.from('lms_modules').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Module deleted" });
      fetchModules(selectedCourse!.id);
    }
  };

  // Lesson CRUD
  const saveLesson = async (formData: FormData) => {
    const data = {
      module_id: selectedModule!.id,
      title: formData.get('title') as string,
      content_type: formData.get('content_type') as string,
      content: formData.get('content') as string || null,
      video_url: formData.get('video_url') as string || null,
      document_url: formData.get('document_url') as string || null,
      duration_minutes: parseInt(formData.get('duration_minutes') as string) || 0,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_published: formData.get('is_published') === 'true'
    };

    if (editingLesson) {
      const { error } = await supabase.from('lms_lessons').update(data).eq('id', editingLesson.id);
      if (error) throw error;
      toast({ title: "Lesson updated" });
    } else {
      const { error } = await supabase.from('lms_lessons').insert(data);
      if (error) throw error;
      toast({ title: "Lesson created" });
    }
    setLessonDialog(false);
    setEditingLesson(null);
    fetchLessons(selectedModule!.id);
  };

  const deleteLesson = async (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    const { error } = await supabase.from('lms_lessons').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lesson deleted" });
      fetchLessons(selectedModule!.id);
    }
  };

  // Quiz CRUD
  const saveQuiz = async (formData: FormData) => {
    const data = {
      course_id: selectedCourse!.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      passing_score: parseInt(formData.get('passing_score') as string) || 70,
      time_limit_minutes: parseInt(formData.get('time_limit_minutes') as string) || null,
      max_attempts: parseInt(formData.get('max_attempts') as string) || null,
      shuffle_questions: formData.get('shuffle_questions') === 'true',
      show_correct_answers: formData.get('show_correct_answers') === 'true',
      is_published: formData.get('is_published') === 'true'
    };

    if (editingQuiz) {
      const { error } = await supabase.from('lms_quizzes').update(data).eq('id', editingQuiz.id);
      if (error) throw error;
      toast({ title: "Quiz updated" });
    } else {
      const { error } = await supabase.from('lms_quizzes').insert(data);
      if (error) throw error;
      toast({ title: "Quiz created" });
    }
    setQuizDialog(false);
    setEditingQuiz(null);
    fetchData();
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Delete this quiz and all its questions?')) return;
    const { error } = await supabase.from('lms_quizzes').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Quiz deleted" });
      fetchData();
    }
  };

  // Question CRUD
  const saveQuestion = async (formData: FormData) => {
    const optionsRaw = formData.get('options') as string;
    const correctAnswerRaw = formData.get('correct_answer') as string;
    
    const data = {
      quiz_id: selectedQuiz!.id,
      question_text: formData.get('question_text') as string,
      question_type: formData.get('question_type') as string,
      options: optionsRaw ? JSON.parse(optionsRaw) : [],
      correct_answer: correctAnswerRaw ? JSON.parse(correctAnswerRaw) : null,
      points: parseInt(formData.get('points') as string) || 1,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      explanation: formData.get('explanation') as string || null
    };

    if (editingQuestion) {
      const { error } = await supabase.from('lms_quiz_questions').update(data).eq('id', editingQuestion.id);
      if (error) throw error;
      toast({ title: "Question updated" });
    } else {
      const { error } = await supabase.from('lms_quiz_questions').insert(data);
      if (error) throw error;
      toast({ title: "Question created" });
    }
    setQuestionDialog(false);
    setEditingQuestion(null);
    fetchQuestions(selectedQuiz!.id);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    const { error } = await supabase.from('lms_quiz_questions').delete().eq('id', id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Question deleted" });
      fetchQuestions(selectedQuiz!.id);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "LMS Management" }
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">LMS Management</h1>
            <p className="text-muted-foreground">Manage courses, modules, lessons, and quizzes</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Quizzes
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Course Categories</CardTitle>
                  <CardDescription>Organize courses into categories</CardDescription>
                </div>
                <Button onClick={() => { setEditingCategory(null); setCategoryDialog(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-mono">{category.code}</TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-muted-foreground">{category.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingCategory(category); setCategoryDialog(true); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCategory(category.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No categories yet. Create your first category.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            {!selectedCourse ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Courses</CardTitle>
                    <CardDescription>Manage training courses</CardDescription>
                  </div>
                  <Button onClick={() => { setEditingCourse(null); setCourseDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono">{course.code}</TableCell>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{course.category?.name || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{course.difficulty_level}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={course.is_published ? "default" : "secondary"}>
                              {course.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { 
                              setSelectedCourse(course); 
                              fetchModules(course.id);
                            }}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingCourse(course); setCourseDialog(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteCourse(course.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {courses.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No courses yet. Create your first course.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : !selectedModule ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <Button variant="ghost" className="mb-2" onClick={() => setSelectedCourse(null)}>
                      ← Back to Courses
                    </Button>
                    <CardTitle>{selectedCourse.title} - Modules</CardTitle>
                    <CardDescription>Manage course modules and content structure</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setEditingQuiz(null); setQuizDialog(true); }}>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Add Quiz
                    </Button>
                    <Button onClick={() => { setEditingModule(null); setModuleDialog(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modules.map((module) => (
                        <TableRow key={module.id}>
                          <TableCell>{module.display_order}</TableCell>
                          <TableCell className="font-medium">{module.title}</TableCell>
                          <TableCell className="text-muted-foreground">{module.description || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={module.is_published ? "default" : "secondary"}>
                              {module.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { 
                              setSelectedModule(module); 
                              fetchLessons(module.id);
                            }}>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingModule(module); setModuleDialog(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteModule(module.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {modules.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No modules yet. Add your first module.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <Button variant="ghost" className="mb-2" onClick={() => setSelectedModule(null)}>
                      ← Back to Modules
                    </Button>
                    <CardTitle>{selectedModule.title} - Lessons</CardTitle>
                    <CardDescription>Manage module lessons and content</CardDescription>
                  </div>
                  <Button onClick={() => { setEditingLesson(null); setLessonDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell>{lesson.display_order}</TableCell>
                          <TableCell className="font-medium">{lesson.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{lesson.content_type}</Badge>
                          </TableCell>
                          <TableCell>{lesson.duration_minutes || 0} min</TableCell>
                          <TableCell>
                            <Badge variant={lesson.is_published ? "default" : "secondary"}>
                              {lesson.is_published ? 'Published' : 'Draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingLesson(lesson); setLessonDialog(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {lessons.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No lessons yet. Add your first lesson.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes">
            {!selectedQuiz ? (
              <Card>
                <CardHeader>
                  <CardTitle>All Quizzes</CardTitle>
                  <CardDescription>View and manage all quizzes across courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Passing Score</TableHead>
                        <TableHead>Time Limit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => {
                        const course = courses.find(c => c.id === quiz.course_id);
                        return (
                          <TableRow key={quiz.id}>
                            <TableCell className="font-medium">{quiz.title}</TableCell>
                            <TableCell>{course?.title || '-'}</TableCell>
                            <TableCell>{quiz.passing_score}%</TableCell>
                            <TableCell>{quiz.time_limit_minutes ? `${quiz.time_limit_minutes} min` : 'No limit'}</TableCell>
                            <TableCell>
                              <Badge variant={quiz.is_published ? "default" : "secondary"}>
                                {quiz.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => { 
                                setSelectedQuiz(quiz); 
                                fetchQuestions(quiz.id);
                              }}>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteQuiz(quiz.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {quizzes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No quizzes yet. Create quizzes from the course modules view.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <Button variant="ghost" className="mb-2" onClick={() => setSelectedQuiz(null)}>
                      ← Back to Quizzes
                    </Button>
                    <CardTitle>{selectedQuiz.title} - Questions</CardTitle>
                    <CardDescription>Manage quiz questions</CardDescription>
                  </div>
                  <Button onClick={() => { setEditingQuestion(null); setQuestionDialog(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>{question.display_order}</TableCell>
                          <TableCell className="font-medium max-w-md truncate">{question.question_text}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{question.question_type}</Badge>
                          </TableCell>
                          <TableCell>{question.points}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => { setEditingQuestion(question); setQuestionDialog(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteQuestion(question.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {questions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No questions yet. Add your first question.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Category Dialog */}
        <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveCategory(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" name="code" defaultValue={editingCategory?.code} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={editingCategory?.name} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingCategory?.description || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input id="icon" name="icon" defaultValue={editingCategory?.icon || 'BookOpen'} placeholder="BookOpen" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_active" name="is_active" defaultChecked={editingCategory?.is_active ?? true} />
                  <Label htmlFor="is_active">Active</Label>
                  <input type="hidden" name="is_active" value={editingCategory?.is_active ? 'true' : 'false'} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setCategoryDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Course Dialog */}
        <Dialog open={courseDialog} onOpenChange={setCourseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add Course'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveCourse(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" name="code" defaultValue={editingCourse?.code} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" defaultValue={editingCourse?.title} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingCourse?.description || ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category</Label>
                    <Select name="category_id" defaultValue={editingCourse?.category_id || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level">Difficulty</Label>
                    <Select name="difficulty_level" defaultValue={editingCourse?.difficulty_level || 'beginner'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={editingCourse?.duration_minutes || 0} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passing_score">Passing Score (%)</Label>
                    <Input id="passing_score" name="passing_score" type="number" defaultValue={editingCourse?.passing_score || 70} />
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch id="is_published" name="is_published" defaultChecked={editingCourse?.is_published ?? false} />
                    <Label htmlFor="is_published">Published</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="is_mandatory" name="is_mandatory" defaultChecked={editingCourse?.is_mandatory ?? false} />
                    <Label htmlFor="is_mandatory">Mandatory</Label>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setCourseDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Module Dialog */}
        <Dialog open={moduleDialog} onOpenChange={setModuleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? 'Edit Module' : 'Add Module'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveModule(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingModule?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingModule?.description || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input id="display_order" name="display_order" type="number" defaultValue={editingModule?.display_order || modules.length} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_published" name="is_published" defaultChecked={editingModule?.is_published ?? true} />
                  <Label htmlFor="is_published">Published</Label>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setModuleDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Lesson Dialog */}
        <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveLesson(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingLesson?.title} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="content_type">Content Type</Label>
                    <Select name="content_type" defaultValue={editingLesson?.content_type || 'text'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text/HTML</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                    <Input id="duration_minutes" name="duration_minutes" type="number" defaultValue={editingLesson?.duration_minutes || 0} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content (HTML)</Label>
                  <Textarea id="content" name="content" rows={6} defaultValue={editingLesson?.content || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input id="video_url" name="video_url" defaultValue={editingLesson?.video_url || ''} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document_url">Document URL</Label>
                  <Input id="document_url" name="document_url" defaultValue={editingLesson?.document_url || ''} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input id="display_order" name="display_order" type="number" defaultValue={editingLesson?.display_order || lessons.length} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_published" name="is_published" defaultChecked={editingLesson?.is_published ?? true} />
                  <Label htmlFor="is_published">Published</Label>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setLessonDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Quiz Dialog */}
        <Dialog open={quizDialog} onOpenChange={setQuizDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingQuiz ? 'Edit Quiz' : 'Add Quiz'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveQuiz(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" defaultValue={editingQuiz?.title} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" defaultValue={editingQuiz?.description || ''} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passing_score">Passing Score (%)</Label>
                    <Input id="passing_score" name="passing_score" type="number" defaultValue={editingQuiz?.passing_score || 70} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time_limit_minutes">Time Limit (minutes)</Label>
                    <Input id="time_limit_minutes" name="time_limit_minutes" type="number" defaultValue={editingQuiz?.time_limit_minutes || ''} placeholder="No limit" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input id="max_attempts" name="max_attempts" type="number" defaultValue={editingQuiz?.max_attempts || ''} placeholder="Unlimited" />
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch id="shuffle_questions" name="shuffle_questions" defaultChecked={editingQuiz?.shuffle_questions ?? false} />
                    <Label htmlFor="shuffle_questions">Shuffle Questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show_correct_answers" name="show_correct_answers" defaultChecked={editingQuiz?.show_correct_answers ?? true} />
                    <Label htmlFor="show_correct_answers">Show Correct Answers</Label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="is_published" name="is_published" defaultChecked={editingQuiz?.is_published ?? false} />
                  <Label htmlFor="is_published">Published</Label>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setQuizDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Question Dialog */}
        <Dialog open={questionDialog} onOpenChange={setQuestionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add Question'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveQuestion(new FormData(e.currentTarget)); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question_text">Question</Label>
                  <Textarea id="question_text" name="question_text" defaultValue={editingQuestion?.question_text} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="question_type">Type</Label>
                    <Select name="question_type" defaultValue={editingQuestion?.question_type || 'single_choice'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_choice">Single Choice</SelectItem>
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="true_false">True/False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input id="points" name="points" type="number" defaultValue={editingQuestion?.points || 1} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="options">Options (JSON array)</Label>
                  <Textarea 
                    id="options" 
                    name="options" 
                    rows={3}
                    defaultValue={editingQuestion?.options ? JSON.stringify(editingQuestion.options, null, 2) : '["Option A", "Option B", "Option C", "Option D"]'} 
                    placeholder='["Option A", "Option B", "Option C"]'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct_answer">Correct Answer (JSON)</Label>
                  <Input 
                    id="correct_answer" 
                    name="correct_answer" 
                    defaultValue={editingQuestion?.correct_answer ? JSON.stringify(editingQuestion.correct_answer) : '"Option A"'} 
                    placeholder='"Option A" or ["Option A", "Option B"]'
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation (shown after answer)</Label>
                  <Textarea id="explanation" name="explanation" defaultValue={editingQuestion?.explanation || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input id="display_order" name="display_order" type="number" defaultValue={editingQuestion?.display_order || questions.length} />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setQuestionDialog(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
