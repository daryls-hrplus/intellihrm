-- =============================================
-- ENABLEMENT TOURS & ONBOARDING SYSTEM
-- Comprehensive in-app guided tours with video integration
-- =============================================

-- Central repository for all guided tours
CREATE TABLE public.enablement_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_code TEXT NOT NULL UNIQUE,
  tour_name TEXT NOT NULL,
  description TEXT,
  module_code TEXT NOT NULL,
  feature_code TEXT,
  target_roles TEXT[] DEFAULT '{}',
  tour_type TEXT DEFAULT 'walkthrough' CHECK (tour_type IN ('walkthrough', 'spotlight', 'announcement')),
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  estimated_duration_seconds INTEGER,
  auto_trigger_on TEXT CHECK (auto_trigger_on IN ('first_visit', 'first_action', 'schedule', 'manual')),
  trigger_route TEXT,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual steps within each tour
CREATE TABLE public.enablement_tour_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.enablement_tours(id) ON DELETE CASCADE NOT NULL,
  step_order INTEGER NOT NULL,
  target_selector TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  placement TEXT DEFAULT 'bottom' CHECK (placement IN ('top', 'bottom', 'left', 'right', 'auto', 'center')),
  video_id UUID REFERENCES public.enablement_video_library(id),
  highlight_type TEXT DEFAULT 'spotlight' CHECK (highlight_type IN ('spotlight', 'tooltip', 'modal', 'beacon')),
  action_type TEXT CHECK (action_type IN ('click', 'input', 'hover', 'scroll', 'wait', 'none')),
  action_target TEXT,
  skip_if_missing BOOLEAN DEFAULT false,
  disable_overlay BOOLEAN DEFAULT false,
  disable_scroll BOOLEAN DEFAULT false,
  spot_light_padding INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tour_id, step_order)
);

-- Track tour completion per user per company
CREATE TABLE public.enablement_tour_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tour_id UUID REFERENCES public.enablement_tours(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_step_completed INTEGER DEFAULT 0,
  total_steps INTEGER,
  was_skipped BOOLEAN DEFAULT false,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  feedback_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tour_id, company_id)
);

-- Contextual tooltips for specific UI elements
CREATE TABLE public.enablement_help_tooltips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tooltip_code TEXT NOT NULL UNIQUE,
  module_code TEXT NOT NULL,
  feature_code TEXT,
  element_selector TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  video_id UUID REFERENCES public.enablement_video_library(id),
  learn_more_url TEXT,
  target_roles TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  company_id UUID REFERENCES public.companies(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track first-time visits to features/modules
CREATE TABLE public.enablement_user_feature_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  module_code TEXT NOT NULL,
  feature_code TEXT DEFAULT '',
  first_visit_at TIMESTAMPTZ DEFAULT now(),
  visit_count INTEGER DEFAULT 1,
  last_visit_at TIMESTAMPTZ DEFAULT now(),
  tour_triggered BOOLEAN DEFAULT false,
  tour_completed BOOLEAN DEFAULT false
);

-- Unique index handling the feature_code properly
CREATE UNIQUE INDEX idx_enablement_visits_unique ON public.enablement_user_feature_visits(user_id, company_id, module_code, feature_code);

-- Detailed analytics for tour engagement
CREATE TABLE public.enablement_tour_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id UUID REFERENCES public.enablement_tours(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  company_id UUID REFERENCES public.companies(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('start', 'step_view', 'step_complete', 'skip', 'finish', 'abandon', 'video_play', 'video_complete', 'feedback')),
  step_id UUID REFERENCES public.enablement_tour_steps(id),
  video_id UUID REFERENCES public.enablement_video_library(id),
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_enablement_tours_module ON public.enablement_tours(module_code);
CREATE INDEX idx_enablement_tours_active ON public.enablement_tours(is_active) WHERE is_active = true;
CREATE INDEX idx_enablement_tour_steps_tour ON public.enablement_tour_steps(tour_id);
CREATE INDEX idx_enablement_tour_completions_user ON public.enablement_tour_completions(user_id);
CREATE INDEX idx_enablement_tour_completions_tour ON public.enablement_tour_completions(tour_id);
CREATE INDEX idx_enablement_help_tooltips_module ON public.enablement_help_tooltips(module_code);
CREATE INDEX idx_enablement_user_visits_user ON public.enablement_user_feature_visits(user_id);
CREATE INDEX idx_enablement_tour_analytics_tour ON public.enablement_tour_analytics(tour_id);
CREATE INDEX idx_enablement_tour_analytics_user ON public.enablement_tour_analytics(user_id);
CREATE INDEX idx_enablement_tour_analytics_created ON public.enablement_tour_analytics(created_at);

-- Enable RLS on all tables
ALTER TABLE public.enablement_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_tour_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_tour_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_help_tooltips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_user_feature_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enablement_tour_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enablement_tours (readable by authenticated, writable by admins)
CREATE POLICY "Tours are readable by authenticated users"
  ON public.enablement_tours FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tours are insertable by admins"
  ON public.enablement_tours FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tours are updatable by admins"
  ON public.enablement_tours FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tours are deletable by admins"
  ON public.enablement_tours FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

-- RLS Policies for enablement_tour_steps
CREATE POLICY "Tour steps are readable by authenticated users"
  ON public.enablement_tour_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tour steps are insertable by admins"
  ON public.enablement_tour_steps FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tour steps are updatable by admins"
  ON public.enablement_tour_steps FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tour steps are deletable by admins"
  ON public.enablement_tour_steps FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

-- RLS Policies for enablement_tour_completions (users manage their own)
CREATE POLICY "Users can view their own tour completions"
  ON public.enablement_tour_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tour completions"
  ON public.enablement_tour_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tour completions"
  ON public.enablement_tour_completions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tour completions"
  ON public.enablement_tour_completions FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

-- RLS Policies for enablement_help_tooltips
CREATE POLICY "Tooltips are readable by authenticated users"
  ON public.enablement_help_tooltips FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Tooltips are insertable by admins"
  ON public.enablement_help_tooltips FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tooltips are updatable by admins"
  ON public.enablement_help_tooltips FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

CREATE POLICY "Tooltips are deletable by admins"
  ON public.enablement_help_tooltips FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

-- RLS Policies for enablement_user_feature_visits (users manage their own)
CREATE POLICY "Users can manage their own feature visits"
  ON public.enablement_user_feature_visits FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feature visits"
  ON public.enablement_user_feature_visits FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

-- RLS Policies for enablement_tour_analytics
CREATE POLICY "Users can insert their own analytics"
  ON public.enablement_tour_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analytics"
  ON public.enablement_tour_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
  ON public.enablement_tour_analytics FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role IN ('admin', 'system_admin', 'enablement_admin')
    )
  );

-- Add columns to enablement_video_library for tour integration
ALTER TABLE public.enablement_video_library 
ADD COLUMN IF NOT EXISTS tour_step_id UUID REFERENCES public.enablement_tour_steps(id),
ADD COLUMN IF NOT EXISTS auto_play_on_step BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS chapters JSONB DEFAULT '[]';

-- Add updated_at triggers
CREATE TRIGGER update_enablement_tours_updated_at
  BEFORE UPDATE ON public.enablement_tours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enablement_tour_completions_updated_at
  BEFORE UPDATE ON public.enablement_tour_completions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enablement_help_tooltips_updated_at
  BEFORE UPDATE ON public.enablement_help_tooltips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create analytics summary view
CREATE OR REPLACE VIEW public.enablement_tour_analytics_summary AS
SELECT 
  t.id as tour_id,
  t.tour_code,
  t.tour_name,
  t.module_code,
  t.is_active,
  COUNT(DISTINCT CASE WHEN a.event_type = 'start' THEN a.user_id END) as total_starts,
  COUNT(DISTINCT CASE WHEN a.event_type = 'finish' THEN a.user_id END) as total_completions,
  COUNT(DISTINCT CASE WHEN a.event_type = 'skip' THEN a.user_id END) as total_skips,
  COUNT(DISTINCT CASE WHEN a.event_type = 'abandon' THEN a.user_id END) as total_abandons,
  COUNT(DISTINCT CASE WHEN a.event_type = 'video_play' THEN a.user_id END) as video_plays,
  ROUND(
    COUNT(DISTINCT CASE WHEN a.event_type = 'finish' THEN a.user_id END)::numeric /
    NULLIF(COUNT(DISTINCT CASE WHEN a.event_type = 'start' THEN a.user_id END), 0) * 100, 2
  ) as completion_rate,
  AVG(c.feedback_rating) as avg_feedback_rating
FROM public.enablement_tours t
LEFT JOIN public.enablement_tour_analytics a ON t.id = a.tour_id
LEFT JOIN public.enablement_tour_completions c ON t.id = c.tour_id AND c.feedback_rating IS NOT NULL
GROUP BY t.id, t.tour_code, t.tour_name, t.module_code, t.is_active;