-- Training Programs (top-level containers)
CREATE TABLE public.training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  program_type TEXT NOT NULL DEFAULT 'onboarding' CHECK (program_type IN ('onboarding', 'compliance', 'skills', 'leadership', 'custom')),
  thumbnail_url TEXT,
  estimated_duration_minutes INTEGER,
  passing_score INTEGER DEFAULT 80,
  max_attempts INTEGER DEFAULT 3,
  certificate_template_id UUID,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Modules (sections within a program)
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  is_gateway BOOLEAN DEFAULT false, -- Must pass to continue
  prerequisite_module_id UUID REFERENCES public.training_modules(id),
  estimated_duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Content (videos/slides within modules)
CREATE TABLE public.training_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL DEFAULT 'video' CHECK (content_type IN ('video', 'document', 'interactive', 'quiz_only')),
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  video_url TEXT,
  video_duration_seconds INTEGER,
  thumbnail_url TEXT,
  transcript TEXT,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  min_watch_percentage INTEGER DEFAULT 90, -- Must watch X% before quiz
  has_quiz BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Training Topics (for topic-based branching)
CREATE TABLE public.training_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  icon_name TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Link content to topics
CREATE TABLE public.training_content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.training_content(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.training_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, topic_id)
);

-- Quiz Questions
CREATE TABLE public.training_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.training_content(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.training_topics(id),
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'multi_select', 'true_false', 'short_answer')),
  question_text TEXT NOT NULL,
  question_text_en TEXT,
  explanation TEXT, -- Shown after answer
  explanation_en TEXT,
  points INTEGER DEFAULT 1,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  time_limit_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz Answer Options
CREATE TABLE public.training_quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.training_quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_text_en TEXT,
  is_correct BOOLEAN DEFAULT false,
  feedback_text TEXT, -- Shown if selected
  feedback_text_en TEXT,
  sequence_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Branching Rules (topic-based remediation)
CREATE TABLE public.training_branch_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.training_content(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.training_topics(id) ON DELETE CASCADE,
  min_topic_score INTEGER DEFAULT 0, -- Below this triggers remediation
  remediation_content_id UUID REFERENCES public.training_content(id), -- Content to show if weak
  remediation_module_id UUID REFERENCES public.training_modules(id), -- Or full module
  is_blocking BOOLEAN DEFAULT false, -- Must pass remediation to continue
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(content_id, topic_id)
);

-- Employee Program Enrollments
CREATE TABLE public.training_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  enrolled_by UUID REFERENCES public.profiles(id),
  enrollment_type TEXT DEFAULT 'assigned' CHECK (enrollment_type IN ('assigned', 'self', 'auto')),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'expired')),
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  final_score NUMERIC(5,2),
  attempts_used INTEGER DEFAULT 0,
  certificate_issued_at TIMESTAMPTZ,
  certificate_url TEXT,
  certificate_verification_code TEXT,
  manager_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, program_id)
);

-- Module Progress
CREATE TABLE public.training_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed', 'remediation')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, module_id)
);

-- Content Progress
CREATE TABLE public.training_content_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.training_content(id) ON DELETE CASCADE,
  watch_percentage INTEGER DEFAULT 0,
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  video_completed BOOLEAN DEFAULT false,
  quiz_started_at TIMESTAMPTZ,
  quiz_completed_at TIMESTAMPTZ,
  quiz_score NUMERIC(5,2),
  quiz_attempts INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'watching', 'quiz_pending', 'completed', 'failed', 'remediation')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, content_id)
);

-- Quiz Attempts (full audit trail)
CREATE TABLE public.training_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.training_content(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  total_points INTEGER,
  earned_points INTEGER,
  time_taken_seconds INTEGER,
  passed BOOLEAN,
  weak_topics UUID[], -- Topics where performance was weak
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz Answers (individual answers for audit)
CREATE TABLE public.training_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.training_quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.training_quiz_questions(id),
  selected_options UUID[], -- For multiple choice/multi-select
  text_answer TEXT, -- For short answer
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMPTZ DEFAULT now()
);

-- Remediation Assignments (when topics are weak)
CREATE TABLE public.training_remediation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  triggered_by_content_id UUID REFERENCES public.training_content(id),
  topic_id UUID NOT NULL REFERENCES public.training_topics(id),
  remediation_content_id UUID REFERENCES public.training_content(id),
  remediation_module_id UUID REFERENCES public.training_modules(id),
  original_score NUMERIC(5,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  post_remediation_score NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training Analytics Events
CREATE TABLE public.training_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.training_enrollments(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  program_id UUID REFERENCES public.training_programs(id),
  content_id UUID REFERENCES public.training_content(id),
  event_type TEXT NOT NULL, -- video_play, video_pause, video_seek, quiz_start, quiz_submit, etc.
  event_data JSONB,
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Certificate Templates
CREATE TABLE public.training_certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  template_html TEXT,
  background_image_url TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_branch_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_remediation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_certificate_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Programs/Modules/Content (read for all, manage for admin/hr)
CREATE POLICY "Anyone can view active programs" ON public.training_programs FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/HR can manage programs" ON public.training_programs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view active modules" ON public.training_modules FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/HR can manage modules" ON public.training_modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view active content" ON public.training_content FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/HR can manage content" ON public.training_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view topics" ON public.training_topics FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/HR can manage topics" ON public.training_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view content topics" ON public.training_content_topics FOR SELECT USING (true);
CREATE POLICY "Admin/HR can manage content topics" ON public.training_content_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view quiz questions" ON public.training_quiz_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/HR can manage quiz questions" ON public.training_quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view quiz options" ON public.training_quiz_options FOR SELECT USING (true);
CREATE POLICY "Admin/HR can manage quiz options" ON public.training_quiz_options FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view branch rules" ON public.training_branch_rules FOR SELECT USING (true);
CREATE POLICY "Admin/HR can manage branch rules" ON public.training_branch_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

-- Enrollments: Users see own, managers see team, admin/hr see all
CREATE POLICY "Users view own enrollments" ON public.training_enrollments FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Users update own enrollments" ON public.training_enrollments FOR UPDATE USING (employee_id = auth.uid());
CREATE POLICY "Admin/HR manage all enrollments" ON public.training_enrollments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

-- Progress tables: Users manage own
CREATE POLICY "Users manage own module progress" ON public.training_module_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM public.training_enrollments WHERE id = enrollment_id AND employee_id = auth.uid())
);
CREATE POLICY "Admin/HR manage all module progress" ON public.training_module_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Users manage own content progress" ON public.training_content_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM public.training_enrollments WHERE id = enrollment_id AND employee_id = auth.uid())
);
CREATE POLICY "Admin/HR manage all content progress" ON public.training_content_progress FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Users manage own quiz attempts" ON public.training_quiz_attempts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.training_enrollments WHERE id = enrollment_id AND employee_id = auth.uid())
);
CREATE POLICY "Admin/HR view all quiz attempts" ON public.training_quiz_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Users manage own quiz answers" ON public.training_quiz_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.training_quiz_attempts a JOIN public.training_enrollments e ON a.enrollment_id = e.id WHERE a.id = attempt_id AND e.employee_id = auth.uid())
);
CREATE POLICY "Admin/HR view all quiz answers" ON public.training_quiz_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Users view own remediation" ON public.training_remediation FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.training_enrollments WHERE id = enrollment_id AND employee_id = auth.uid())
);
CREATE POLICY "Admin/HR manage all remediation" ON public.training_remediation FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Users create own analytics" ON public.training_analytics FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Users view own analytics" ON public.training_analytics FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Admin/HR view all analytics" ON public.training_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Anyone can view certificate templates" ON public.training_certificate_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admin/HR can manage templates" ON public.training_certificate_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
);

-- Triggers for updated_at
CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON public.training_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON public.training_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_content_updated_at BEFORE UPDATE ON public.training_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_enrollments_updated_at BEFORE UPDATE ON public.training_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_module_progress_updated_at BEFORE UPDATE ON public.training_module_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_content_progress_updated_at BEFORE UPDATE ON public.training_content_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate certificate verification code
CREATE TRIGGER generate_training_cert_code BEFORE INSERT ON public.training_enrollments FOR EACH ROW EXECUTE FUNCTION public.generate_verification_code();

-- Create indexes for performance
CREATE INDEX idx_training_enrollments_employee ON public.training_enrollments(employee_id);
CREATE INDEX idx_training_enrollments_program ON public.training_enrollments(program_id);
CREATE INDEX idx_training_enrollments_status ON public.training_enrollments(status);
CREATE INDEX idx_training_content_progress_enrollment ON public.training_content_progress(enrollment_id);
CREATE INDEX idx_training_quiz_attempts_enrollment ON public.training_quiz_attempts(enrollment_id);
CREATE INDEX idx_training_analytics_employee ON public.training_analytics(employee_id);
CREATE INDEX idx_training_analytics_created ON public.training_analytics(created_at DESC);