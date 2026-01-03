-- B1: Appraisal Evidence Usage Tracking
CREATE TABLE public.appraisal_evidence_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  source_snapshot_id UUID REFERENCES public.talent_signal_snapshots(id),
  was_viewed BOOLEAN DEFAULT false,
  was_referenced BOOLEAN DEFAULT false,
  view_timestamp TIMESTAMP WITH TIME ZONE,
  reference_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add 360 insights columns to appraisal_cycles
ALTER TABLE public.appraisal_cycles ADD COLUMN IF NOT EXISTS lock_360_insights_at TEXT DEFAULT 'submission';
ALTER TABLE public.appraisal_cycles ADD COLUMN IF NOT EXISTS include_360_insights BOOLEAN DEFAULT true;
ALTER TABLE public.appraisal_cycles ADD COLUMN IF NOT EXISTS insights_visibility_level TEXT DEFAULT 'summary';

-- B2: Development Themes
CREATE TABLE public.development_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  source_cycle_id UUID REFERENCES public.feedback_360_cycles(id),
  theme_code TEXT,
  theme_name TEXT NOT NULL,
  theme_description TEXT,
  signal_ids UUID[],
  confidence_score NUMERIC,
  ai_generated BOOLEAN DEFAULT true,
  is_confirmed BOOLEAN DEFAULT false,
  confirmed_by UUID REFERENCES public.profiles(id),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Development Recommendations
CREATE TABLE public.development_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID REFERENCES public.development_themes(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('learning', 'experience', 'mentoring', 'coaching', 'stretch_assignment')),
  recommendation_text TEXT NOT NULL,
  priority_order INTEGER DEFAULT 1,
  linked_learning_path_id UUID,
  linked_course_ids UUID[],
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- IDP Feedback Links
CREATE TABLE public.idp_feedback_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idp_id UUID,
  idp_item_id UUID,
  source_theme_id UUID REFERENCES public.development_themes(id),
  source_cycle_id UUID REFERENCES public.feedback_360_cycles(id),
  link_type TEXT DEFAULT 'derived' CHECK (link_type IN ('derived', 'informed', 'validated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Feedback Remeasurement Plans
CREATE TABLE public.feedback_remeasurement_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  source_cycle_id UUID REFERENCES public.feedback_360_cycles(id),
  focus_areas JSONB,
  scheduled_date DATE NOT NULL,
  measurement_type TEXT DEFAULT 'pulse' CHECK (measurement_type IN ('full_360', 'pulse', 'manager_check')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.appraisal_evidence_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_feedback_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_remeasurement_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appraisal_evidence_usage
CREATE POLICY "Users can view their own evidence usage" ON public.appraisal_evidence_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.appraisal_participants ap
      WHERE ap.id = appraisal_evidence_usage.participant_id
      AND ap.employee_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own evidence usage" ON public.appraisal_evidence_usage
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.appraisal_participants ap
      WHERE ap.id = appraisal_evidence_usage.participant_id
      AND ap.employee_id = auth.uid()
    )
  );

-- RLS Policies for development_themes
CREATE POLICY "Users can view their own development themes" ON public.development_themes
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can manage their own development themes" ON public.development_themes
  FOR ALL USING (employee_id = auth.uid());

-- RLS Policies for development_recommendations
CREATE POLICY "Users can view recommendations for their themes" ON public.development_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.development_themes dt
      WHERE dt.id = development_recommendations.theme_id
      AND dt.employee_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage recommendations for their themes" ON public.development_recommendations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.development_themes dt
      WHERE dt.id = development_recommendations.theme_id
      AND dt.employee_id = auth.uid()
    )
  );

-- RLS Policies for idp_feedback_links
CREATE POLICY "Users can view their own IDP links" ON public.idp_feedback_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.development_themes dt
      WHERE dt.id = idp_feedback_links.source_theme_id
      AND dt.employee_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own IDP links" ON public.idp_feedback_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.development_themes dt
      WHERE dt.id = idp_feedback_links.source_theme_id
      AND dt.employee_id = auth.uid()
    )
  );

-- RLS Policies for feedback_remeasurement_plans
CREATE POLICY "Users can view their own remeasurement plans" ON public.feedback_remeasurement_plans
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Users can manage their own remeasurement plans" ON public.feedback_remeasurement_plans
  FOR ALL USING (employee_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_appraisal_evidence_usage_participant ON public.appraisal_evidence_usage(participant_id);
CREATE INDEX idx_development_themes_employee ON public.development_themes(employee_id);
CREATE INDEX idx_development_themes_cycle ON public.development_themes(source_cycle_id);
CREATE INDEX idx_development_recommendations_theme ON public.development_recommendations(theme_id);
CREATE INDEX idx_idp_feedback_links_theme ON public.idp_feedback_links(source_theme_id);
CREATE INDEX idx_feedback_remeasurement_plans_employee ON public.feedback_remeasurement_plans(employee_id);

-- Triggers for updated_at
CREATE TRIGGER update_development_themes_updated_at
  BEFORE UPDATE ON public.development_themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedback_remeasurement_plans_updated_at
  BEFORE UPDATE ON public.feedback_remeasurement_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();