
-- Demo Experiences - Configurable demo packages
CREATE TABLE public.demo_experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_code TEXT NOT NULL UNIQUE,
  experience_name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL DEFAULT 'general',
  target_roles TEXT[] DEFAULT '{}',
  featured_modules TEXT[] DEFAULT '{}',
  estimated_duration_minutes INTEGER DEFAULT 15,
  thumbnail_url TEXT,
  hero_video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Demo Experience Chapters - Sequential chapters within an experience
CREATE TABLE public.demo_experience_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.demo_experiences(id) ON DELETE CASCADE,
  chapter_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  chapter_type TEXT NOT NULL DEFAULT 'video',
  video_url TEXT,
  video_thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  cta_type TEXT DEFAULT 'next_chapter',
  cta_label TEXT,
  cta_url TEXT,
  feature_preview_route TEXT,
  interactive_elements JSONB DEFAULT '[]',
  is_gated BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_chapter_type CHECK (chapter_type IN ('video', 'interactive', 'feature_highlight', 'quiz'))
);

-- Demo Prospect Sessions - Anonymous/identified prospect tracking
CREATE TABLE public.demo_prospect_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_token TEXT NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  job_title TEXT,
  industry TEXT,
  employee_count TEXT,
  phone TEXT,
  source_utm_params JSONB DEFAULT '{}',
  personalization_answers JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  registration_id UUID REFERENCES public.demo_registrations(id),
  is_converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Demo Engagement Events - Granular analytics
CREATE TABLE public.demo_engagement_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.demo_prospect_sessions(id) ON DELETE CASCADE,
  experience_id UUID REFERENCES public.demo_experiences(id),
  chapter_id UUID REFERENCES public.demo_experience_chapters(id),
  event_type TEXT NOT NULL,
  video_watch_percentage INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'session_start', 'experience_start', 'chapter_start', 'chapter_complete', 'chapter_skip',
    'video_play', 'video_pause', 'video_seek', 'video_complete',
    'cta_click', 'lead_capture', 'feature_explore', 'quiz_answer', 'download'
  ))
);

-- Demo Lead Scores - Computed engagement scores
CREATE TABLE public.demo_lead_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE REFERENCES public.demo_prospect_sessions(id) ON DELETE CASCADE,
  email TEXT,
  total_watch_time_seconds INTEGER DEFAULT 0,
  chapters_completed INTEGER DEFAULT 0,
  features_explored INTEGER DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0,
  lead_temperature TEXT DEFAULT 'cold',
  recommended_follow_up TEXT,
  ai_insights JSONB DEFAULT '{}',
  last_computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_lead_temperature CHECK (lead_temperature IN ('cold', 'warm', 'hot', 'qualified')),
  CONSTRAINT valid_engagement_score CHECK (engagement_score >= 0 AND engagement_score <= 100)
);

-- Enable RLS on all tables
ALTER TABLE public.demo_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_experience_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_prospect_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_lead_scores ENABLE ROW LEVEL SECURITY;

-- Demo experiences are publicly viewable (for prospects)
CREATE POLICY "Demo experiences are publicly viewable"
ON public.demo_experiences FOR SELECT
USING (is_active = true);

-- Admins can manage demo experiences
CREATE POLICY "Admins can manage demo experiences"
ON public.demo_experiences FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin']));

-- Demo chapters are publicly viewable (for prospects)
CREATE POLICY "Demo chapters are publicly viewable"
ON public.demo_experience_chapters FOR SELECT
USING (is_active = true);

-- Admins can manage demo chapters
CREATE POLICY "Admins can manage demo chapters"
ON public.demo_experience_chapters FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin']));

-- Anyone can create/read their own session (via session token)
CREATE POLICY "Anyone can create demo sessions"
ON public.demo_prospect_sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view demo sessions"
ON public.demo_prospect_sessions FOR SELECT
USING (true);

CREATE POLICY "Anyone can update demo sessions"
ON public.demo_prospect_sessions FOR UPDATE
USING (true);

-- Anyone can create engagement events
CREATE POLICY "Anyone can create engagement events"
ON public.demo_engagement_events FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view engagement events"
ON public.demo_engagement_events FOR SELECT
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'super_admin']));

-- Anyone can manage lead scores
CREATE POLICY "Anyone can manage lead scores"
ON public.demo_lead_scores FOR ALL
USING (true);

-- Create indexes for performance
CREATE INDEX idx_demo_experiences_active ON public.demo_experiences(is_active, display_order);
CREATE INDEX idx_demo_chapters_experience ON public.demo_experience_chapters(experience_id, chapter_order);
CREATE INDEX idx_demo_sessions_token ON public.demo_prospect_sessions(session_token);
CREATE INDEX idx_demo_sessions_email ON public.demo_prospect_sessions(email) WHERE email IS NOT NULL;
CREATE INDEX idx_demo_events_session ON public.demo_engagement_events(session_id, created_at);
CREATE INDEX idx_demo_events_type ON public.demo_engagement_events(event_type);
CREATE INDEX idx_demo_lead_scores_temp ON public.demo_lead_scores(lead_temperature, engagement_score DESC);

-- Create updated_at triggers
CREATE TRIGGER update_demo_experiences_updated_at
BEFORE UPDATE ON public.demo_experiences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demo_chapters_updated_at
BEFORE UPDATE ON public.demo_experience_chapters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demo_sessions_updated_at
BEFORE UPDATE ON public.demo_prospect_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demo_lead_scores_updated_at
BEFORE UPDATE ON public.demo_lead_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial demo experiences
INSERT INTO public.demo_experiences (experience_code, experience_name, description, target_audience, target_roles, featured_modules, estimated_duration_minutes, display_order)
VALUES 
  ('hr-leaders', 'HR Leaders Experience', 'Discover how intellihrm empowers HR leaders with AI-driven insights, compliance automation, and strategic workforce planning.', 'enterprise', ARRAY['hr_manager', 'chro'], ARRAY['core_hr', 'talent', 'analytics', 'compliance'], 12, 1),
  ('payroll-managers', 'Payroll & Finance', 'See how intellihrm simplifies multi-country payroll, tax compliance, and financial reporting for Caribbean and African markets.', 'enterprise', ARRAY['payroll_admin', 'finance'], ARRAY['payroll', 'compensation', 'reports'], 10, 2),
  ('it-admins', 'IT & Security', 'Explore intellihrm''s enterprise security features, SSO integration, and audit compliance capabilities.', 'enterprise', ARRAY['it_admin', 'security'], ARRAY['security', 'integrations', 'audit'], 8, 3),
  ('quick-overview', 'Quick Platform Overview', 'A 5-minute tour of intellihrm''s core capabilities for busy decision makers.', 'general', ARRAY[]::TEXT[], ARRAY['overview'], 5, 0);

-- Seed chapters for HR Leaders experience
INSERT INTO public.demo_experience_chapters (experience_id, chapter_order, title, description, chapter_type, duration_seconds, cta_type)
VALUES 
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'hr-leaders'), 1, 'Welcome to intellihrm', 'See why leading organizations across the Caribbean and Africa trust intellihrm.', 'video', 45, 'next_chapter'),
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'hr-leaders'), 2, 'AI-Powered Dashboard', 'Your command center for workforce insights and actionable recommendations.', 'video', 90, 'next_chapter'),
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'hr-leaders'), 3, 'Compliance Made Simple', 'Automatic updates for regional labor laws and tax regulations.', 'video', 75, 'next_chapter'),
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'hr-leaders'), 4, 'Talent Intelligence', 'Predictive analytics for retention, succession, and skills gaps.', 'video', 120, 'next_chapter'),
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'hr-leaders'), 5, 'Get Started', 'Ready to transform your HR operations? Let''s talk.', 'video', 30, 'schedule_call');

-- Seed chapters for Quick Overview
INSERT INTO public.demo_experience_chapters (experience_id, chapter_order, title, description, chapter_type, duration_seconds, cta_type)
VALUES 
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'quick-overview'), 1, 'Platform Overview', 'A quick look at what makes intellihrm different.', 'video', 120, 'next_chapter'),
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'quick-overview'), 2, 'Key Features', 'The core capabilities that drive HR transformation.', 'video', 90, 'next_chapter'),
  ((SELECT id FROM public.demo_experiences WHERE experience_code = 'quick-overview'), 3, 'Next Steps', 'Choose your path: detailed demo or start a trial.', 'video', 30, 'schedule_call');
