-- Create enum types for appraisal action rules
CREATE TYPE public.appraisal_condition_type AS ENUM (
  'score_below',
  'score_above',
  'gap_detected',
  'repeated_low',
  'improvement_trend',
  'competency_gap',
  'goal_not_met'
);

CREATE TYPE public.appraisal_action_type AS ENUM (
  'create_idp',
  'create_pip',
  'suggest_succession',
  'block_finalization',
  'require_comment',
  'notify_hr',
  'schedule_coaching',
  'require_development_plan'
);

-- Create appraisal form templates table
CREATE TABLE public.appraisal_form_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  description_en TEXT,
  
  -- Section toggles
  include_goals BOOLEAN NOT NULL DEFAULT true,
  include_competencies BOOLEAN NOT NULL DEFAULT true,
  include_responsibilities BOOLEAN NOT NULL DEFAULT true,
  include_360_feedback BOOLEAN NOT NULL DEFAULT false,
  include_values BOOLEAN NOT NULL DEFAULT false,
  
  -- Section weights (must sum to 100)
  goals_weight NUMERIC(5,2) NOT NULL DEFAULT 40,
  competencies_weight NUMERIC(5,2) NOT NULL DEFAULT 30,
  responsibilities_weight NUMERIC(5,2) NOT NULL DEFAULT 20,
  feedback_360_weight NUMERIC(5,2) NOT NULL DEFAULT 0,
  values_weight NUMERIC(5,2) NOT NULL DEFAULT 10,
  
  -- Scale configuration
  rating_scale_id UUID REFERENCES public.performance_rating_scales(id),
  overall_scale_id UUID REFERENCES public.overall_rating_scales(id),
  min_rating NUMERIC(3,1) NOT NULL DEFAULT 1,
  max_rating NUMERIC(3,1) NOT NULL DEFAULT 5,
  
  -- Template settings
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  allow_weight_override BOOLEAN NOT NULL DEFAULT true,
  requires_hr_approval_for_override BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  CONSTRAINT unique_template_code_per_company UNIQUE (company_id, code),
  CONSTRAINT weights_must_sum_to_100 CHECK (
    (CASE WHEN include_goals THEN goals_weight ELSE 0 END +
     CASE WHEN include_competencies THEN competencies_weight ELSE 0 END +
     CASE WHEN include_responsibilities THEN responsibilities_weight ELSE 0 END +
     CASE WHEN include_360_feedback THEN feedback_360_weight ELSE 0 END +
     CASE WHEN include_values THEN values_weight ELSE 0 END) = 100
  )
);

-- Create appraisal outcome action rules table
CREATE TABLE public.appraisal_outcome_action_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.appraisal_form_templates(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Rule identification
  rule_name TEXT NOT NULL,
  rule_code TEXT NOT NULL,
  description TEXT,
  
  -- Condition configuration
  condition_type public.appraisal_condition_type NOT NULL,
  condition_section TEXT NOT NULL CHECK (condition_section IN ('goals', 'competencies', 'responsibilities', 'feedback_360', 'values', 'overall')),
  condition_operator TEXT NOT NULL DEFAULT '<' CHECK (condition_operator IN ('<', '<=', '>', '>=', '=', '!=')),
  condition_threshold NUMERIC(5,2) NOT NULL,
  condition_cycles INTEGER DEFAULT 1,
  
  -- Action configuration
  action_type public.appraisal_action_type NOT NULL,
  action_is_mandatory BOOLEAN NOT NULL DEFAULT false,
  action_priority INTEGER NOT NULL DEFAULT 1,
  action_description TEXT,
  action_message TEXT,
  
  -- Override settings
  requires_hr_override BOOLEAN NOT NULL DEFAULT false,
  auto_execute BOOLEAN NOT NULL DEFAULT false,
  
  -- Rule status
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  CONSTRAINT unique_rule_code_per_template UNIQUE (template_id, rule_code)
);

-- Create appraisal action executions table
CREATE TABLE public.appraisal_action_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.appraisal_outcome_action_rules(id) ON DELETE CASCADE,
  
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triggered_score NUMERIC(5,2),
  triggered_section TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'overridden', 'dismissed', 'completed')),
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES public.profiles(id),
  
  created_idp_id UUID,
  created_pip_id UUID,
  created_succession_nomination_id UUID,
  
  override_reason TEXT,
  override_approved_by UUID REFERENCES public.profiles(id),
  override_approved_at TIMESTAMPTZ,
  
  acknowledged_by UUID REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMPTZ,
  acknowledgment_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create 360 feedback rater categories table
CREATE TABLE public.feedback_360_rater_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  weight_percentage NUMERIC(5,2) NOT NULL DEFAULT 25,
  min_raters INTEGER NOT NULL DEFAULT 1,
  max_raters INTEGER,
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_category_code_per_company UNIQUE (company_id, code)
);

-- Create 360 feedback cycles table
CREATE TABLE public.feedback_360_cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appraisal_cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  submission_deadline DATE NOT NULL,
  reminder_days_before INTEGER[] DEFAULT '{7, 3, 1}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  is_standalone BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Create 360 feedback questions table
CREATE TABLE public.feedback_360_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.feedback_360_rater_categories(id),
  competency_id UUID REFERENCES public.competencies(id),
  question_text TEXT NOT NULL,
  question_text_en TEXT,
  question_type TEXT NOT NULL DEFAULT 'rating' CHECK (question_type IN ('rating', 'text', 'multiple_choice', 'scale')),
  is_required BOOLEAN NOT NULL DEFAULT true,
  rating_scale_min INTEGER DEFAULT 1,
  rating_scale_max INTEGER DEFAULT 5,
  rating_scale_labels JSONB,
  choices JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create 360 feedback requests table
CREATE TABLE public.feedback_360_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cycle_id UUID NOT NULL REFERENCES public.feedback_360_cycles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  subject_employee_id UUID NOT NULL REFERENCES public.profiles(id),
  rater_id UUID NOT NULL REFERENCES public.profiles(id),
  rater_category_id UUID NOT NULL REFERENCES public.feedback_360_rater_categories(id),
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined', 'expired')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  last_reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  
  due_date DATE NOT NULL,
  is_mandatory BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_rater_per_subject_per_cycle UNIQUE (cycle_id, subject_employee_id, rater_id)
);

-- Create 360 feedback responses table
CREATE TABLE public.feedback_360_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.feedback_360_requests(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.feedback_360_questions(id) ON DELETE CASCADE,
  
  rating_value NUMERIC(3,1),
  text_response TEXT,
  selected_choices JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_response_per_question UNIQUE (request_id, question_id)
);

-- Create scale normalization rules table
CREATE TABLE public.scale_normalization_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  source_min NUMERIC(3,1) NOT NULL,
  source_max NUMERIC(3,1) NOT NULL,
  source_step NUMERIC(3,2) DEFAULT 0.5,
  
  target_min NUMERIC(3,1) NOT NULL DEFAULT 1,
  target_max NUMERIC(3,1) NOT NULL DEFAULT 5,
  target_step NUMERIC(3,2) DEFAULT 0.5,
  
  method TEXT NOT NULL DEFAULT 'linear' CHECK (method IN ('linear', 'percentile', 'custom_mapping')),
  custom_mapping JSONB,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns to appraisal_cycles for template integration
ALTER TABLE public.appraisal_cycles
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.appraisal_form_templates(id),
ADD COLUMN IF NOT EXISTS include_360_feedback BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback_360_weight NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_goals BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS include_competencies BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS include_responsibilities BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weights_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weights_override_approved_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS weights_override_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS weights_override_reason TEXT;

-- Enable RLS on all new tables
ALTER TABLE public.appraisal_form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_outcome_action_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_action_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_360_rater_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_360_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_360_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_360_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_360_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_normalization_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appraisal_form_templates
CREATE POLICY "Users can view templates in their company"
ON public.appraisal_form_templates FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage templates"
ON public.appraisal_form_templates FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for appraisal_outcome_action_rules
CREATE POLICY "Users can view action rules in their company"
ON public.appraisal_outcome_action_rules FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage action rules"
ON public.appraisal_outcome_action_rules FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for appraisal_action_executions
CREATE POLICY "Users can view their own action executions"
ON public.appraisal_action_executions FOR SELECT
USING (participant_id IN (SELECT id FROM public.appraisal_participants WHERE employee_id = auth.uid()));

CREATE POLICY "HR can manage action executions"
ON public.appraisal_action_executions FOR ALL
USING (TRUE);

-- RLS Policies for feedback_360_rater_categories
CREATE POLICY "Users can view rater categories in their company"
ON public.feedback_360_rater_categories FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage rater categories"
ON public.feedback_360_rater_categories FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for feedback_360_cycles
CREATE POLICY "Users can view 360 cycles in their company"
ON public.feedback_360_cycles FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage 360 cycles"
ON public.feedback_360_cycles FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for feedback_360_questions
CREATE POLICY "Users can view 360 questions in their company"
ON public.feedback_360_questions FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage 360 questions"
ON public.feedback_360_questions FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for feedback_360_requests
CREATE POLICY "Raters can view their own requests"
ON public.feedback_360_requests FOR SELECT
USING (rater_id = auth.uid());

CREATE POLICY "Subjects can view requests about them"
ON public.feedback_360_requests FOR SELECT
USING (subject_employee_id = auth.uid());

CREATE POLICY "HR can manage 360 requests"
ON public.feedback_360_requests FOR ALL
USING (TRUE);

-- RLS Policies for feedback_360_responses
CREATE POLICY "Raters can manage their own responses"
ON public.feedback_360_responses FOR ALL
USING (request_id IN (SELECT id FROM public.feedback_360_requests WHERE rater_id = auth.uid()));

CREATE POLICY "HR can view all responses"
ON public.feedback_360_responses FOR SELECT
USING (TRUE);

-- RLS Policies for scale_normalization_rules
CREATE POLICY "Users can view normalization rules in their company"
ON public.scale_normalization_rules FOR SELECT
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage normalization rules"
ON public.scale_normalization_rules FOR ALL
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_form_templates_company ON public.appraisal_form_templates(company_id);
CREATE INDEX idx_action_rules_template ON public.appraisal_outcome_action_rules(template_id);
CREATE INDEX idx_action_executions_participant ON public.appraisal_action_executions(participant_id);
CREATE INDEX idx_action_executions_status ON public.appraisal_action_executions(status);
CREATE INDEX idx_360_requests_cycle ON public.feedback_360_requests(cycle_id);
CREATE INDEX idx_360_requests_subject ON public.feedback_360_requests(subject_employee_id);
CREATE INDEX idx_360_requests_rater ON public.feedback_360_requests(rater_id);
CREATE INDEX idx_360_responses_request ON public.feedback_360_responses(request_id);
CREATE INDEX idx_appraisal_cycles_template ON public.appraisal_cycles(template_id);

-- Create triggers for updated_at
CREATE TRIGGER update_appraisal_form_templates_updated_at
BEFORE UPDATE ON public.appraisal_form_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisal_outcome_action_rules_updated_at
BEFORE UPDATE ON public.appraisal_outcome_action_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisal_action_executions_updated_at
BEFORE UPDATE ON public.appraisal_action_executions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_360_rater_categories_updated_at
BEFORE UPDATE ON public.feedback_360_rater_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_360_cycles_updated_at
BEFORE UPDATE ON public.feedback_360_cycles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_360_questions_updated_at
BEFORE UPDATE ON public.feedback_360_questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_360_requests_updated_at
BEFORE UPDATE ON public.feedback_360_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_360_responses_updated_at
BEFORE UPDATE ON public.feedback_360_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scale_normalization_rules_updated_at
BEFORE UPDATE ON public.scale_normalization_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();