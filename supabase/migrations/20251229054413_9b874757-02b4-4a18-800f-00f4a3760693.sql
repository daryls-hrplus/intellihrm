-- Pulse Survey Templates
CREATE TABLE public.pulse_survey_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration_minutes INTEGER DEFAULT 5,
  is_system_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pulse Surveys (instances of templates)
CREATE TABLE public.pulse_surveys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  template_id UUID REFERENCES public.pulse_survey_templates(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_departments UUID[] DEFAULT ARRAY[]::UUID[],
  target_audience VARCHAR(100) DEFAULT 'all',
  is_anonymous BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'draft',
  frequency VARCHAR(50) DEFAULT 'one_time',
  schedule_cron VARCHAR(100),
  next_scheduled_at TIMESTAMP WITH TIME ZONE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 1,
  response_count INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pulse Survey Responses
CREATE TABLE public.pulse_survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES auth.users(id),
  department_id UUID REFERENCES public.departments(id),
  is_anonymous BOOLEAN DEFAULT true,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  open_ended_responses JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sentiment Analysis Results
CREATE TABLE public.pulse_sentiment_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID NOT NULL REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  response_id UUID REFERENCES public.pulse_survey_responses(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  department_id UUID REFERENCES public.departments(id),
  question_text TEXT,
  response_text TEXT,
  sentiment_score NUMERIC(4,3) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label VARCHAR(50),
  confidence NUMERIC(4,3),
  emotions JSONB DEFAULT '{}'::jsonb,
  key_themes TEXT[],
  urgency_level VARCHAR(50) DEFAULT 'normal',
  requires_attention BOOLEAN DEFAULT false,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Aggregated Sentiment Metrics (for dashboards)
CREATE TABLE public.pulse_sentiment_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  department_id UUID REFERENCES public.departments(id),
  survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  avg_sentiment_score NUMERIC(4,3),
  positive_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  top_themes TEXT[],
  emotion_breakdown JSONB DEFAULT '{}'::jsonb,
  trend_direction VARCHAR(20),
  trend_change NUMERIC(5,2),
  engagement_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, department_id, survey_id, metric_date)
);

-- Urgent Sentiment Alerts
CREATE TABLE public.pulse_sentiment_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  survey_id UUID REFERENCES public.pulse_surveys(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  alert_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_metrics JSONB,
  recommended_actions TEXT[],
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Manager Coaching Nudges based on sentiment
CREATE TABLE public.pulse_coaching_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  manager_id UUID NOT NULL REFERENCES auth.users(id),
  department_id UUID REFERENCES public.departments(id),
  survey_id UUID REFERENCES public.pulse_surveys(id),
  nudge_type VARCHAR(100) NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  related_themes TEXT[],
  sentiment_context JSONB,
  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  is_acted_upon BOOLEAN DEFAULT false,
  acted_upon_at TIMESTAMP WITH TIME ZONE,
  action_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pulse_survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_sentiment_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_sentiment_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pulse_coaching_nudges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_survey_templates
CREATE POLICY "Users can view templates for their company" ON public.pulse_survey_templates
  FOR SELECT USING (company_id IS NULL OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create templates for their company" ON public.pulse_survey_templates
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company templates" ON public.pulse_survey_templates
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for pulse_surveys
CREATE POLICY "Users can view surveys for their company" ON public.pulse_surveys
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create surveys for their company" ON public.pulse_surveys
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update surveys for their company" ON public.pulse_surveys
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for pulse_survey_responses
CREATE POLICY "Users can view responses for their company surveys" ON public.pulse_survey_responses
  FOR SELECT USING (survey_id IN (SELECT id FROM public.pulse_surveys WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())));

CREATE POLICY "Users can submit responses" ON public.pulse_survey_responses
  FOR INSERT WITH CHECK (true);

-- RLS Policies for pulse_sentiment_analysis
CREATE POLICY "Users can view sentiment for their company" ON public.pulse_sentiment_analysis
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can insert sentiment analysis" ON public.pulse_sentiment_analysis
  FOR INSERT WITH CHECK (true);

-- RLS Policies for pulse_sentiment_metrics
CREATE POLICY "Users can view metrics for their company" ON public.pulse_sentiment_metrics
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can manage metrics" ON public.pulse_sentiment_metrics
  FOR ALL USING (true);

-- RLS Policies for pulse_sentiment_alerts
CREATE POLICY "Users can view alerts for their company" ON public.pulse_sentiment_alerts
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage alerts for their company" ON public.pulse_sentiment_alerts
  FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for pulse_coaching_nudges
CREATE POLICY "Managers can view their nudges" ON public.pulse_coaching_nudges
  FOR SELECT USING (manager_id = auth.uid() OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "System can create nudges" ON public.pulse_coaching_nudges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Managers can update their nudges" ON public.pulse_coaching_nudges
  FOR UPDATE USING (manager_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_pulse_surveys_company ON public.pulse_surveys(company_id);
CREATE INDEX idx_pulse_surveys_status ON public.pulse_surveys(status);
CREATE INDEX idx_pulse_responses_survey ON public.pulse_survey_responses(survey_id);
CREATE INDEX idx_pulse_sentiment_survey ON public.pulse_sentiment_analysis(survey_id);
CREATE INDEX idx_pulse_sentiment_dept ON public.pulse_sentiment_analysis(department_id);
CREATE INDEX idx_pulse_metrics_company_date ON public.pulse_sentiment_metrics(company_id, metric_date);
CREATE INDEX idx_pulse_alerts_company ON public.pulse_sentiment_alerts(company_id, is_resolved);
CREATE INDEX idx_pulse_nudges_manager ON public.pulse_coaching_nudges(manager_id, is_dismissed);

-- Insert default system templates
INSERT INTO public.pulse_survey_templates (name, description, category, questions, is_system_template, estimated_duration_minutes) VALUES
('Weekly Check-in', 'Quick weekly pulse to measure team morale', 'engagement', '[{"id": "q1", "type": "scale", "text": "How would you rate your overall mood this week?", "scale_min": 1, "scale_max": 5}, {"id": "q2", "type": "scale", "text": "How manageable is your current workload?", "scale_min": 1, "scale_max": 5}, {"id": "q3", "type": "open", "text": "What is one thing that would make your work week better?"}]', true, 2),
('Manager Effectiveness', 'Assess manager support and communication', 'feedback', '[{"id": "q1", "type": "scale", "text": "My manager provides clear direction and expectations", "scale_min": 1, "scale_max": 5}, {"id": "q2", "type": "scale", "text": "My manager recognizes my contributions", "scale_min": 1, "scale_max": 5}, {"id": "q3", "type": "open", "text": "How could your manager better support you?"}]', true, 3),
('Team Collaboration', 'Measure team dynamics and collaboration', 'engagement', '[{"id": "q1", "type": "scale", "text": "I feel valued by my team members", "scale_min": 1, "scale_max": 5}, {"id": "q2", "type": "scale", "text": "Team communication is effective", "scale_min": 1, "scale_max": 5}, {"id": "q3", "type": "open", "text": "What would improve team collaboration?"}]', true, 3),
('Work-Life Balance', 'Assess employee wellbeing and balance', 'wellbeing', '[{"id": "q1", "type": "scale", "text": "I am able to maintain a healthy work-life balance", "scale_min": 1, "scale_max": 5}, {"id": "q2", "type": "scale", "text": "I feel supported when dealing with stress", "scale_min": 1, "scale_max": 5}, {"id": "q3", "type": "open", "text": "What would help improve your work-life balance?"}]', true, 3),
('eNPS Quick Pulse', 'Employee Net Promoter Score survey', 'engagement', '[{"id": "q1", "type": "nps", "text": "How likely are you to recommend this company as a place to work?", "scale_min": 0, "scale_max": 10}, {"id": "q2", "type": "open", "text": "What is the primary reason for your score?"}]', true, 2);