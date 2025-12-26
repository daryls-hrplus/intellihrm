-- Phase 1: Database Enhancement for AI-Enhanced Calibration Sessions

-- 1a. Create calibration_participants table
CREATE TABLE public.calibration_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.calibration_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  role TEXT NOT NULL DEFAULT 'reviewer' CHECK (role IN ('facilitator', 'reviewer', 'observer')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- 1b. Create calibration_adjustments table with AI enhancement fields
CREATE TABLE public.calibration_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.calibration_sessions(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.goal_rating_submissions(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Before/After values
  original_score NUMERIC(4,2),
  calibrated_score NUMERIC(4,2),
  original_box_position TEXT,
  calibrated_box_position TEXT,
  
  -- AI Enhancement Fields
  ai_suggested BOOLEAN DEFAULT false,
  ai_suggestion_score NUMERIC(4,2),
  ai_confidence DECIMAL(3,2),
  ai_reasoning TEXT,
  ai_bias_flags JSONB,
  
  -- Human Decision
  adjustment_reason TEXT,
  adjustment_category TEXT,
  adjusted_by UUID REFERENCES public.profiles(id),
  adjusted_at TIMESTAMPTZ DEFAULT now(),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'reverted')),
  applied_at TIMESTAMPTZ,
  reverted_at TIMESTAMPTZ,
  reverted_by UUID REFERENCES public.profiles(id),
  
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1c. Add calibration_session_id to goal_rating_submissions if not exists
ALTER TABLE public.goal_rating_submissions 
  ADD COLUMN IF NOT EXISTS calibration_session_id UUID REFERENCES public.calibration_sessions(id);

-- 1d. Create calibration_ai_analyses table for storing AI analysis results
CREATE TABLE public.calibration_ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.calibration_sessions(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('pre_session', 'real_time', 'summary')),
  
  -- Analysis Results
  overall_health_score DECIMAL(3,2),
  anomalies_detected INTEGER DEFAULT 0,
  bias_alerts INTEGER DEFAULT 0,
  suggested_adjustments JSONB,
  distribution_analysis JSONB,
  equity_analysis JSONB,
  summary_narrative TEXT,
  
  -- AI Metadata
  model_used TEXT,
  confidence_score DECIMAL(3,2),
  tokens_used INTEGER,
  
  analyzed_by UUID,
  analyzed_at TIMESTAMPTZ DEFAULT now(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.calibration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calibration_ai_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calibration_participants
CREATE POLICY "Users can view participants in their company"
  ON public.calibration_participants FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "HR and managers can manage participants"
  ON public.calibration_participants FOR ALL
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- RLS Policies for calibration_adjustments
CREATE POLICY "Users can view adjustments in their company"
  ON public.calibration_adjustments FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Calibrators can manage adjustments"
  ON public.calibration_adjustments FOR ALL
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- RLS Policies for calibration_ai_analyses
CREATE POLICY "Users can view AI analyses in their company"
  ON public.calibration_ai_analyses FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "System can manage AI analyses"
  ON public.calibration_ai_analyses FOR ALL
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_calibration_participants_session ON public.calibration_participants(session_id);
CREATE INDEX idx_calibration_participants_user ON public.calibration_participants(user_id);
CREATE INDEX idx_calibration_adjustments_session ON public.calibration_adjustments(session_id);
CREATE INDEX idx_calibration_adjustments_employee ON public.calibration_adjustments(employee_id);
CREATE INDEX idx_calibration_ai_analyses_session ON public.calibration_ai_analyses(session_id);

-- Update trigger for calibration_participants
CREATE TRIGGER update_calibration_participants_updated_at
  BEFORE UPDATE ON public.calibration_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update trigger for calibration_adjustments
CREATE TRIGGER update_calibration_adjustments_updated_at
  BEFORE UPDATE ON public.calibration_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();