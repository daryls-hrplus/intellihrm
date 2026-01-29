-- ==============================================
-- AI Quiz Generation Tables
-- ==============================================

CREATE TABLE public.ai_generated_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  course_id UUID REFERENCES public.lms_courses(id),
  lesson_id UUID REFERENCES public.lms_lessons(id),
  source_content TEXT,
  source_type TEXT DEFAULT 'lesson_content' CHECK (source_type IN ('lesson_content', 'document', 'transcript', 'manual_input')),
  quiz_title TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  question_count INTEGER DEFAULT 10,
  generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed', 'approved')),
  ai_model_used TEXT,
  ai_confidence_score NUMERIC(5,2),
  bloom_taxonomy_distribution JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.ai_generated_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.ai_generated_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'short_answer')),
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  correct_option_index INTEGER,
  explanation TEXT,
  bloom_level TEXT CHECK (bloom_level IN ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create')),
  difficulty_score NUMERIC(3,2),
  ai_confidence_score NUMERIC(5,2),
  source_excerpt TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  original_text TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==============================================
-- Adaptive Learning Paths Tables
-- ==============================================

CREATE TABLE public.adaptive_learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  base_path_id UUID REFERENCES public.learning_paths(id),
  path_name TEXT NOT NULL,
  description TEXT,
  adaptation_strategy TEXT DEFAULT 'performance_based' CHECK (adaptation_strategy IN ('performance_based', 'time_based', 'engagement_based', 'hybrid')),
  is_active BOOLEAN DEFAULT true,
  min_mastery_threshold NUMERIC(5,2) DEFAULT 70.00,
  max_retry_attempts INTEGER DEFAULT 3,
  enable_skip_ahead BOOLEAN DEFAULT false,
  enable_remediation BOOLEAN DEFAULT true,
  ai_model_id UUID REFERENCES public.ai_model_registry(id),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.adaptive_path_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  adaptive_path_id UUID NOT NULL REFERENCES public.adaptive_learning_paths(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('skip', 'remediate', 'branch', 'accelerate', 'pause')),
  trigger_condition JSONB NOT NULL DEFAULT '{}',
  action_config JSONB NOT NULL DEFAULT '{}',
  target_course_id UUID REFERENCES public.lms_courses(id),
  target_module_id UUID REFERENCES public.lms_modules(id),
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.adaptive_learner_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  adaptive_path_id UUID NOT NULL REFERENCES public.adaptive_learning_paths(id),
  current_node_id UUID,
  mastery_scores JSONB DEFAULT '{}',
  path_history JSONB DEFAULT '[]',
  adaptations_applied JSONB DEFAULT '[]',
  predicted_completion_date DATE,
  actual_pace_multiplier NUMERIC(4,2) DEFAULT 1.00,
  engagement_score NUMERIC(5,2),
  risk_flags JSONB DEFAULT '[]',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, adaptive_path_id)
);

-- ==============================================
-- Learning Chatbot Tables
-- ==============================================

CREATE TABLE public.learning_chatbot_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  chatbot_name TEXT DEFAULT 'Learning Assistant',
  welcome_message TEXT DEFAULT 'Hi! I''m your learning assistant. How can I help you today?',
  personality_prompt TEXT,
  allowed_topics TEXT[] DEFAULT ARRAY['courses', 'learning_paths', 'certifications', 'skills'],
  restricted_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  escalation_keywords TEXT[] DEFAULT ARRAY['human', 'manager', 'help', 'complaint'],
  max_context_messages INTEGER DEFAULT 10,
  response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'casual', 'academic', 'encouraging')),
  ai_model_id UUID REFERENCES public.ai_model_registry(id),
  is_active BOOLEAN DEFAULT true,
  enable_course_search BOOLEAN DEFAULT true,
  enable_progress_queries BOOLEAN DEFAULT true,
  enable_skill_recommendations BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  session_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  message_count INTEGER DEFAULT 0,
  satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  escalated_to_human BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  topics_discussed TEXT[] DEFAULT ARRAY[]::TEXT[],
  courses_referenced UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chatbot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  response_time_ms INTEGER,
  context_sources JSONB DEFAULT '[]',
  intent_detected TEXT,
  entities_extracted JSONB DEFAULT '{}',
  was_helpful BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chatbot_knowledge_index (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('course', 'lesson', 'policy', 'faq', 'procedure')),
  source_id UUID,
  source_title TEXT NOT NULL,
  content_chunk TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  embedding_model TEXT,
  last_indexed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==============================================
-- Completion Risk Prediction Tables
-- ==============================================

CREATE TABLE public.completion_risk_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  enrollment_id UUID REFERENCES public.lms_enrollments(id),
  course_id UUID REFERENCES public.lms_courses(id),
  learning_path_id UUID REFERENCES public.learning_paths(id),
  risk_score NUMERIC(5,2) NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB NOT NULL DEFAULT '{}',
  predicted_completion_probability NUMERIC(5,2),
  predicted_completion_date DATE,
  days_behind_schedule INTEGER,
  engagement_trend TEXT CHECK (engagement_trend IN ('improving', 'stable', 'declining', 'inactive')),
  last_activity_at TIMESTAMP WITH TIME ZONE,
  intervention_recommended TEXT,
  ai_model_version TEXT,
  prediction_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prediction_id UUID NOT NULL REFERENCES public.completion_risk_predictions(id),
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('email_reminder', 'manager_alert', 'mentor_assignment', 'deadline_extension', 'content_simplification', 'peer_support', 'manual_outreach')),
  intervention_status TEXT DEFAULT 'pending' CHECK (intervention_status IN ('pending', 'scheduled', 'sent', 'completed', 'cancelled', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  executed_by UUID REFERENCES public.profiles(id),
  message_template TEXT,
  message_sent TEXT,
  recipient_response TEXT,
  outcome TEXT CHECK (outcome IN ('positive', 'neutral', 'negative', 'no_response')),
  outcome_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.risk_alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  rule_name TEXT NOT NULL,
  risk_threshold NUMERIC(5,2) NOT NULL DEFAULT 70.00,
  alert_recipients TEXT[] DEFAULT ARRAY['manager'],
  auto_intervention_type TEXT,
  notification_channel TEXT DEFAULT 'email' CHECK (notification_channel IN ('email', 'in_app', 'both')),
  cooldown_hours INTEGER DEFAULT 72,
  is_active BOOLEAN DEFAULT true,
  applies_to_compliance BOOLEAN DEFAULT true,
  applies_to_mandatory BOOLEAN DEFAULT true,
  applies_to_optional BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==============================================
-- Skills Transfer Index Tables
-- ==============================================

CREATE TABLE public.skills_transfer_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  course_id UUID REFERENCES public.lms_courses(id),
  learning_path_id UUID REFERENCES public.learning_paths(id),
  competency_id UUID REFERENCES public.competencies(id),
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('self', 'manager', 'peer', 'observation', 'performance_metric')),
  pre_training_score NUMERIC(5,2),
  post_training_score NUMERIC(5,2),
  transfer_score NUMERIC(5,2),
  transfer_index NUMERIC(5,2),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  follow_up_interval_days INTEGER DEFAULT 90,
  evidence_notes TEXT,
  evidence_attachments JSONB DEFAULT '[]',
  barriers_identified TEXT[],
  enablers_identified TEXT[],
  manager_validated BOOLEAN DEFAULT false,
  manager_id UUID REFERENCES public.profiles(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.transfer_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  course_id UUID REFERENCES public.lms_courses(id),
  competency_id UUID REFERENCES public.competencies(id),
  job_id UUID REFERENCES public.jobs(id),
  department_id UUID REFERENCES public.departments(id),
  benchmark_type TEXT DEFAULT 'company' CHECK (benchmark_type IN ('company', 'industry', 'role', 'department')),
  avg_transfer_index NUMERIC(5,2),
  median_transfer_index NUMERIC(5,2),
  percentile_25 NUMERIC(5,2),
  percentile_75 NUMERIC(5,2),
  sample_size INTEGER,
  time_to_proficiency_days INTEGER,
  measurement_period_start DATE,
  measurement_period_end DATE,
  data_source TEXT,
  is_current BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.transfer_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.skills_transfer_assessments(id) ON DELETE CASCADE,
  follow_up_number INTEGER NOT NULL DEFAULT 1,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  transfer_score NUMERIC(5,2),
  improvement_from_baseline NUMERIC(5,2),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'skipped', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ==============================================
-- Enable RLS on all tables
-- ==============================================

ALTER TABLE public.ai_generated_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_path_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_learner_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_chatbot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_knowledge_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_transfer_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfer_follow_ups ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- RLS Policies
-- ==============================================

-- AI Generated Quizzes - HR/Admin can manage, instructors can view their courses
CREATE POLICY "HR and admins can manage AI quizzes"
  ON public.ai_generated_quizzes FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view approved quizzes for enrolled courses"
  ON public.ai_generated_quizzes FOR SELECT
  USING (
    generation_status = 'approved' AND
    EXISTS (
      SELECT 1 FROM public.lms_enrollments e
      WHERE e.course_id = ai_generated_quizzes.course_id
      AND e.user_id = auth.uid()
    )
  );

-- AI Generated Questions
CREATE POLICY "HR and admins can manage AI questions"
  ON public.ai_generated_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_quizzes q
      WHERE q.id = ai_generated_questions.quiz_id
      AND public.is_admin_or_hr()
    )
  );

CREATE POLICY "Users can view approved quiz questions"
  ON public.ai_generated_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_generated_quizzes q
      WHERE q.id = ai_generated_questions.quiz_id
      AND q.generation_status = 'approved'
    )
  );

-- Adaptive Learning Paths
CREATE POLICY "HR and admins can manage adaptive paths"
  ON public.adaptive_learning_paths FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view active adaptive paths"
  ON public.adaptive_learning_paths FOR SELECT
  USING (is_active = true);

-- Adaptive Path Rules
CREATE POLICY "HR and admins can manage path rules"
  ON public.adaptive_path_rules FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view active rules"
  ON public.adaptive_path_rules FOR SELECT
  USING (is_active = true);

-- Adaptive Learner Progress
CREATE POLICY "Users can view own adaptive progress"
  ON public.adaptive_learner_progress FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Users can update own adaptive progress"
  ON public.adaptive_learner_progress FOR UPDATE
  USING (employee_id = auth.uid());

CREATE POLICY "HR can view all adaptive progress"
  ON public.adaptive_learner_progress FOR SELECT
  USING (public.is_admin_or_hr());

-- Learning Chatbot Config
CREATE POLICY "HR and admins can manage chatbot config"
  ON public.learning_chatbot_config FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view active chatbot config"
  ON public.learning_chatbot_config FOR SELECT
  USING (is_active = true);

-- Chatbot Conversations
CREATE POLICY "Users can manage own conversations"
  ON public.chatbot_conversations FOR ALL
  USING (employee_id = auth.uid());

CREATE POLICY "HR can view all conversations"
  ON public.chatbot_conversations FOR SELECT
  USING (public.is_admin_or_hr());

-- Chatbot Messages
CREATE POLICY "Users can manage messages in own conversations"
  ON public.chatbot_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbot_conversations c
      WHERE c.id = chatbot_messages.conversation_id
      AND c.employee_id = auth.uid()
    )
  );

CREATE POLICY "HR can view all messages"
  ON public.chatbot_messages FOR SELECT
  USING (public.is_admin_or_hr());

-- Chatbot Knowledge Index
CREATE POLICY "HR and admins can manage knowledge index"
  ON public.chatbot_knowledge_index FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can search knowledge index"
  ON public.chatbot_knowledge_index FOR SELECT
  USING (true);

-- Completion Risk Predictions
CREATE POLICY "Users can view own risk predictions"
  ON public.completion_risk_predictions FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "HR can manage all risk predictions"
  ON public.completion_risk_predictions FOR ALL
  USING (public.is_admin_or_hr());

-- Risk Interventions
CREATE POLICY "HR can manage interventions"
  ON public.risk_interventions FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view interventions for own predictions"
  ON public.risk_interventions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.completion_risk_predictions p
      WHERE p.id = risk_interventions.prediction_id
      AND p.employee_id = auth.uid()
    )
  );

-- Risk Alert Rules
CREATE POLICY "HR and admins can manage alert rules"
  ON public.risk_alert_rules FOR ALL
  USING (public.is_admin_or_hr());

-- Skills Transfer Assessments
CREATE POLICY "Users can view own transfer assessments"
  ON public.skills_transfer_assessments FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Users can create own transfer assessments"
  ON public.skills_transfer_assessments FOR INSERT
  WITH CHECK (employee_id = auth.uid() AND assessment_type = 'self');

CREATE POLICY "HR can manage all transfer assessments"
  ON public.skills_transfer_assessments FOR ALL
  USING (public.is_admin_or_hr());

-- Transfer Benchmarks
CREATE POLICY "HR can manage benchmarks"
  ON public.transfer_benchmarks FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view current benchmarks"
  ON public.transfer_benchmarks FOR SELECT
  USING (is_current = true);

-- Transfer Follow-ups
CREATE POLICY "HR can manage follow-ups"
  ON public.transfer_follow_ups FOR ALL
  USING (public.is_admin_or_hr());

CREATE POLICY "Users can view own follow-ups"
  ON public.transfer_follow_ups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.skills_transfer_assessments a
      WHERE a.id = transfer_follow_ups.assessment_id
      AND a.employee_id = auth.uid()
    )
  );

-- ==============================================
-- Indexes for performance
-- ==============================================

CREATE INDEX idx_ai_quizzes_course ON public.ai_generated_quizzes(course_id);
CREATE INDEX idx_ai_quizzes_status ON public.ai_generated_quizzes(generation_status);
CREATE INDEX idx_ai_questions_quiz ON public.ai_generated_questions(quiz_id);
CREATE INDEX idx_adaptive_paths_company ON public.adaptive_learning_paths(company_id);
CREATE INDEX idx_adaptive_progress_employee ON public.adaptive_learner_progress(employee_id);
CREATE INDEX idx_chatbot_conversations_employee ON public.chatbot_conversations(employee_id);
CREATE INDEX idx_chatbot_messages_conversation ON public.chatbot_messages(conversation_id);
CREATE INDEX idx_risk_predictions_employee ON public.completion_risk_predictions(employee_id);
CREATE INDEX idx_risk_predictions_level ON public.completion_risk_predictions(risk_level);
CREATE INDEX idx_transfer_assessments_employee ON public.skills_transfer_assessments(employee_id);
CREATE INDEX idx_transfer_benchmarks_course ON public.transfer_benchmarks(course_id);

-- ==============================================
-- Triggers for updated_at
-- ==============================================

CREATE TRIGGER update_ai_quizzes_updated_at BEFORE UPDATE ON public.ai_generated_quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_questions_updated_at BEFORE UPDATE ON public.ai_generated_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_paths_updated_at BEFORE UPDATE ON public.adaptive_learning_paths
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_rules_updated_at BEFORE UPDATE ON public.adaptive_path_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_adaptive_progress_updated_at BEFORE UPDATE ON public.adaptive_learner_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_config_updated_at BEFORE UPDATE ON public.learning_chatbot_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_index_updated_at BEFORE UPDATE ON public.chatbot_knowledge_index
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_predictions_updated_at BEFORE UPDATE ON public.completion_risk_predictions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_interventions_updated_at BEFORE UPDATE ON public.risk_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_risk_rules_updated_at BEFORE UPDATE ON public.risk_alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfer_assessments_updated_at BEFORE UPDATE ON public.skills_transfer_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfer_benchmarks_updated_at BEFORE UPDATE ON public.transfer_benchmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transfer_followups_updated_at BEFORE UPDATE ON public.transfer_follow_ups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();