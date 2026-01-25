
-- =====================================================
-- SUCCESSION MODULE - READINESS ASSESSMENT FRAMEWORK
-- =====================================================

-- 1. Readiness assessment forms (company-configurable)
CREATE TABLE public.readiness_assessment_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  staff_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Readiness assessment categories (grouping for indicators)
CREATE TABLE public.readiness_assessment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  form_id UUID REFERENCES public.readiness_assessment_forms(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Readiness assessment indicators (the 30 questions from Excel)
CREATE TABLE public.readiness_assessment_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES public.readiness_assessment_forms(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.readiness_assessment_categories(id) ON DELETE SET NULL,
  indicator_name TEXT NOT NULL,
  assessor_type TEXT NOT NULL DEFAULT 'manager',
  weight_percent INTEGER NOT NULL DEFAULT 1,
  rating_scale_max INTEGER DEFAULT 5,
  scoring_guide_low TEXT,
  scoring_guide_mid TEXT,
  scoring_guide_high TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Readiness rating bands (5-band model from Excel)
CREATE TABLE public.readiness_rating_bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  rating_label TEXT NOT NULL,
  min_percentage DECIMAL NOT NULL,
  max_percentage DECIMAL NOT NULL,
  color_code TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Assessor types configuration (simplified - role-based)
CREATE TABLE public.succession_assessor_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  type_code TEXT NOT NULL,
  type_label TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  applies_to_staff_types TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Readiness assessment events (HR initiates workflow)
CREATE TABLE public.readiness_assessment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  candidate_id UUID REFERENCES public.succession_candidates(id) ON DELETE CASCADE NOT NULL,
  form_id UUID REFERENCES public.readiness_assessment_forms(id),
  initiated_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  overall_score DECIMAL,
  readiness_band TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Readiness assessment responses (per indicator per assessor)
CREATE TABLE public.readiness_assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.readiness_assessment_events(id) ON DELETE CASCADE NOT NULL,
  indicator_id UUID REFERENCES public.readiness_assessment_indicators(id) ON DELETE CASCADE NOT NULL,
  assessor_id UUID REFERENCES public.profiles(id) NOT NULL,
  assessor_type TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comments TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Availability reasons (why positions become vacant)
CREATE TABLE public.succession_availability_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  code TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Nine-box indicator configurations (configurable labels)
CREATE TABLE public.nine_box_indicator_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  performance_level INTEGER NOT NULL,
  potential_level INTEGER NOT NULL,
  default_label TEXT NOT NULL,
  custom_label TEXT,
  use_custom_label BOOLEAN DEFAULT false,
  description TEXT,
  suggested_actions TEXT,
  color_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, performance_level, potential_level)
);

-- =====================================================
-- MODIFY EXISTING TABLES
-- =====================================================

-- Add retention risk fields to succession_plans
ALTER TABLE public.succession_plans
  ADD COLUMN IF NOT EXISTS position_criticality TEXT,
  ADD COLUMN IF NOT EXISTS replacement_difficulty TEXT,
  ADD COLUMN IF NOT EXISTS calculated_risk_level TEXT,
  ADD COLUMN IF NOT EXISTS availability_reason_id UUID REFERENCES public.succession_availability_reasons(id);

-- Add readiness tracking to succession_candidates
ALTER TABLE public.succession_candidates
  ADD COLUMN IF NOT EXISTS latest_readiness_score DECIMAL,
  ADD COLUMN IF NOT EXISTS latest_readiness_band TEXT,
  ADD COLUMN IF NOT EXISTS readiness_assessed_at TIMESTAMPTZ;

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.readiness_assessment_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_assessment_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_rating_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_assessor_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_assessment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_availability_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nine_box_indicator_configs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (Using correct function signature)
-- =====================================================

-- Readiness assessment forms
CREATE POLICY "Users can view readiness forms for their company"
ON public.readiness_assessment_forms FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage readiness forms"
ON public.readiness_assessment_forms FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- Readiness assessment categories
CREATE POLICY "Users can view readiness categories for their company"
ON public.readiness_assessment_categories FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage readiness categories"
ON public.readiness_assessment_categories FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- Readiness assessment indicators
CREATE POLICY "Users can view readiness indicators"
ON public.readiness_assessment_indicators FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.readiness_assessment_forms f
  WHERE f.id = form_id AND public.user_has_company_access(auth.uid(), f.company_id)
));

CREATE POLICY "HR can manage readiness indicators"
ON public.readiness_assessment_indicators FOR ALL
TO authenticated
USING (public.is_admin_or_hr())
WITH CHECK (public.is_admin_or_hr());

-- Readiness rating bands
CREATE POLICY "Users can view rating bands for their company"
ON public.readiness_rating_bands FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage rating bands"
ON public.readiness_rating_bands FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- Succession assessor types
CREATE POLICY "Users can view assessor types for their company"
ON public.succession_assessor_types FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage assessor types"
ON public.succession_assessor_types FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- Readiness assessment events
CREATE POLICY "Users can view assessment events for their company"
ON public.readiness_assessment_events FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage assessment events"
ON public.readiness_assessment_events FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- Readiness assessment responses
CREATE POLICY "Users can view their own responses or HR can view all"
ON public.readiness_assessment_responses FOR SELECT
TO authenticated
USING (
  assessor_id = auth.uid() 
  OR public.is_admin_or_hr()
);

CREATE POLICY "Assessors can insert their own responses"
ON public.readiness_assessment_responses FOR INSERT
TO authenticated
WITH CHECK (assessor_id = auth.uid());

CREATE POLICY "Assessors can update their own responses"
ON public.readiness_assessment_responses FOR UPDATE
TO authenticated
USING (assessor_id = auth.uid() AND submitted_at IS NULL);

-- Succession availability reasons
CREATE POLICY "Users can view availability reasons for their company"
ON public.succession_availability_reasons FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage availability reasons"
ON public.succession_availability_reasons FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- Nine-box indicator configs
CREATE POLICY "Users can view nine-box configs for their company"
ON public.nine_box_indicator_configs FOR SELECT
TO authenticated
USING (public.user_has_company_access(auth.uid(), company_id));

CREATE POLICY "HR can manage nine-box configs"
ON public.nine_box_indicator_configs FOR ALL
TO authenticated
USING (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id))
WITH CHECK (public.is_admin_or_hr() AND public.user_has_company_access(auth.uid(), company_id));

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_readiness_forms_company ON public.readiness_assessment_forms(company_id);
CREATE INDEX idx_readiness_categories_form ON public.readiness_assessment_categories(form_id);
CREATE INDEX idx_readiness_indicators_form ON public.readiness_assessment_indicators(form_id);
CREATE INDEX idx_readiness_rating_bands_company ON public.readiness_rating_bands(company_id);
CREATE INDEX idx_succession_assessor_types_company ON public.succession_assessor_types(company_id);
CREATE INDEX idx_readiness_events_candidate ON public.readiness_assessment_events(candidate_id);
CREATE INDEX idx_readiness_events_company ON public.readiness_assessment_events(company_id);
CREATE INDEX idx_readiness_responses_event ON public.readiness_assessment_responses(event_id);
CREATE INDEX idx_readiness_responses_assessor ON public.readiness_assessment_responses(assessor_id);
CREATE INDEX idx_availability_reasons_company ON public.succession_availability_reasons(company_id);
CREATE INDEX idx_nine_box_configs_company ON public.nine_box_indicator_configs(company_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_readiness_forms_updated_at
  BEFORE UPDATE ON public.readiness_assessment_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_readiness_events_updated_at
  BEFORE UPDATE ON public.readiness_assessment_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nine_box_configs_updated_at
  BEFORE UPDATE ON public.nine_box_indicator_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
