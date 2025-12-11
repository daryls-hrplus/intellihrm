-- LMS Course Categories
CREATE TABLE public.lms_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'BookOpen',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LMS Courses
CREATE TABLE public.lms_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.lms_categories(id),
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  passing_score INTEGER DEFAULT 70,
  certificate_template TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LMS Course Modules (sections within a course)
CREATE TABLE public.lms_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LMS Lessons (content within modules)
CREATE TABLE public.lms_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.lms_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'document', 'scorm', 'quiz')),
  content TEXT,
  video_url TEXT,
  document_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  quiz_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LMS Enrollments
CREATE TABLE public.lms_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  enrolled_by UUID,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- LMS Lesson Progress
CREATE TABLE public.lms_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.lms_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lms_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- LMS Quizzes
CREATE TABLE public.lms_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INTEGER,
  passing_score INTEGER NOT NULL DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  shuffle_questions BOOLEAN NOT NULL DEFAULT false,
  show_correct_answers BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key to lms_lessons for quiz_id
ALTER TABLE public.lms_lessons 
ADD CONSTRAINT lms_lessons_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES public.lms_quizzes(id) ON DELETE SET NULL;

-- LMS Quiz Questions
CREATE TABLE public.lms_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.lms_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'multi_select')),
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer JSONB NOT NULL,
  points INTEGER NOT NULL DEFAULT 1,
  explanation TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LMS Quiz Attempts
CREATE TABLE public.lms_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.lms_quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES public.lms_enrollments(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  time_spent_seconds INTEGER,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LMS Certificates
CREATE TABLE public.lms_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.lms_enrollments(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.lms_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  final_score INTEGER,
  verification_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lms_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lms_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lms_categories
CREATE POLICY "Authenticated users can view active categories" ON public.lms_categories
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage categories" ON public.lms_categories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for lms_courses
CREATE POLICY "Authenticated users can view published courses" ON public.lms_courses
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage all courses" ON public.lms_courses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "HR managers can manage courses" ON public.lms_courses
  FOR ALL USING (has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_modules
CREATE POLICY "Authenticated users can view published modules" ON public.lms_modules
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage modules" ON public.lms_modules
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_lessons
CREATE POLICY "Authenticated users can view published lessons" ON public.lms_lessons
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage lessons" ON public.lms_lessons
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_enrollments
CREATE POLICY "Users can view own enrollments" ON public.lms_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments" ON public.lms_enrollments
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can enroll themselves" ON public.lms_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage enrollments" ON public.lms_enrollments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Users can update own enrollment progress" ON public.lms_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for lms_lesson_progress
CREATE POLICY "Users can manage own lesson progress" ON public.lms_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.lms_lesson_progress
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_quizzes
CREATE POLICY "Authenticated users can view published quizzes" ON public.lms_quizzes
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_published = true);

CREATE POLICY "Admins can manage quizzes" ON public.lms_quizzes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_quiz_questions
CREATE POLICY "Authenticated users can view questions" ON public.lms_quiz_questions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage questions" ON public.lms_quiz_questions
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_quiz_attempts
CREATE POLICY "Users can manage own quiz attempts" ON public.lms_quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts" ON public.lms_quiz_attempts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for lms_certificates
CREATE POLICY "Users can view own certificates" ON public.lms_certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can verify certificates" ON public.lms_certificates
  FOR SELECT USING (true);

CREATE POLICY "System can issue certificates" ON public.lms_certificates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create indexes for performance
CREATE INDEX idx_lms_courses_category ON public.lms_courses(category_id);
CREATE INDEX idx_lms_courses_published ON public.lms_courses(is_published);
CREATE INDEX idx_lms_modules_course ON public.lms_modules(course_id);
CREATE INDEX idx_lms_lessons_module ON public.lms_lessons(module_id);
CREATE INDEX idx_lms_enrollments_user ON public.lms_enrollments(user_id);
CREATE INDEX idx_lms_enrollments_course ON public.lms_enrollments(course_id);
CREATE INDEX idx_lms_lesson_progress_enrollment ON public.lms_lesson_progress(enrollment_id);
CREATE INDEX idx_lms_quiz_attempts_user ON public.lms_quiz_attempts(user_id);
CREATE INDEX idx_lms_certificates_user ON public.lms_certificates(user_id);

-- Insert sample categories
INSERT INTO public.lms_categories (name, code, description, icon, display_order) VALUES
('Compliance', 'COMPLIANCE', 'Mandatory compliance and regulatory training', 'Shield', 1),
('Technical Skills', 'TECHNICAL', 'Technical and software training', 'Code', 2),
('Leadership', 'LEADERSHIP', 'Leadership and management development', 'Users', 3),
('Soft Skills', 'SOFT_SKILLS', 'Communication, teamwork, and interpersonal skills', 'Heart', 4),
('Onboarding', 'ONBOARDING', 'New employee orientation and onboarding', 'UserPlus', 5),
('Safety', 'SAFETY', 'Workplace health and safety training', 'AlertTriangle', 6);