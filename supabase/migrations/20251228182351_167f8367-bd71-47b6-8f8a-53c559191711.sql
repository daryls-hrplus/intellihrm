-- =====================================================
-- RESPONSIBILITY KRAs TABLE
-- Structured Key Result Areas for responsibilities
-- =====================================================

CREATE TABLE public.responsibility_kras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsibility_id UUID NOT NULL REFERENCES public.responsibilities(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  target_metric TEXT,
  measurement_method TEXT,
  weight NUMERIC NOT NULL DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  sequence_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_responsibility_kras_responsibility_id ON public.responsibility_kras(responsibility_id);
CREATE INDEX idx_responsibility_kras_company_id ON public.responsibility_kras(company_id);

-- Enable RLS
ALTER TABLE public.responsibility_kras ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view responsibility KRAs"
  ON public.responsibility_kras FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage responsibility KRAs"
  ON public.responsibility_kras FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- KRA RATING SUBMISSIONS TABLE
-- Individual ratings for each KRA during appraisal
-- =====================================================

CREATE TABLE public.kra_rating_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  responsibility_kra_id UUID NOT NULL REFERENCES public.responsibility_kras(id) ON DELETE CASCADE,
  responsibility_id UUID NOT NULL REFERENCES public.responsibilities(id),
  company_id UUID REFERENCES public.companies(id),
  
  -- Self-rating
  self_rating NUMERIC CHECK (self_rating >= 0 AND self_rating <= 5),
  self_rating_at TIMESTAMPTZ,
  self_comments TEXT,
  
  -- Manager rating
  manager_rating NUMERIC CHECK (manager_rating >= 0 AND manager_rating <= 5),
  manager_id UUID REFERENCES public.profiles(id),
  manager_rating_at TIMESTAMPTZ,
  manager_comments TEXT,
  
  -- Calculated scores
  calculated_score NUMERIC,
  final_score NUMERIC,
  weight_adjusted_score NUMERIC,
  
  -- Evidence
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  achievement_notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'self_rated', 'manager_rated', 'completed', 'disputed')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(participant_id, responsibility_kra_id)
);

-- Create indexes
CREATE INDEX idx_kra_rating_submissions_participant_id ON public.kra_rating_submissions(participant_id);
CREATE INDEX idx_kra_rating_submissions_responsibility_id ON public.kra_rating_submissions(responsibility_id);
CREATE INDEX idx_kra_rating_submissions_kra_id ON public.kra_rating_submissions(responsibility_kra_id);

-- Enable RLS
ALTER TABLE public.kra_rating_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own KRA ratings"
  ON public.kra_rating_submissions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT employee_id FROM public.appraisal_participants WHERE id = participant_id
      UNION
      SELECT evaluator_id FROM public.appraisal_participants WHERE id = participant_id
    )
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
  );

CREATE POLICY "Users can manage their own KRA ratings"
  ON public.kra_rating_submissions FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_responsibility_kras_updated_at
  BEFORE UPDATE ON public.responsibility_kras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kra_rating_submissions_updated_at
  BEFORE UPDATE ON public.kra_rating_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNCTION: Calculate Responsibility Score from KRA Ratings
-- =====================================================

CREATE OR REPLACE FUNCTION public.calculate_responsibility_kra_rollup(p_participant_id UUID, p_responsibility_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_total_weight NUMERIC := 0;
  v_weighted_sum NUMERIC := 0;
  v_result NUMERIC := 0;
  v_kra RECORD;
BEGIN
  -- Get all KRA ratings for this responsibility
  FOR v_kra IN
    SELECT 
      krs.final_score,
      rk.weight
    FROM kra_rating_submissions krs
    JOIN responsibility_kras rk ON krs.responsibility_kra_id = rk.id
    WHERE krs.participant_id = p_participant_id
      AND krs.responsibility_id = p_responsibility_id
      AND krs.final_score IS NOT NULL
      AND rk.is_active = true
  LOOP
    v_weighted_sum := v_weighted_sum + (v_kra.final_score * v_kra.weight);
    v_total_weight := v_total_weight + v_kra.weight;
  END LOOP;
  
  -- Calculate weighted average
  IF v_total_weight > 0 THEN
    v_result := v_weighted_sum / v_total_weight;
  END IF;
  
  RETURN ROUND(v_result, 2);
END;
$$;