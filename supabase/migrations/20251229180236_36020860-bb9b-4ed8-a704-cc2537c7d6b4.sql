-- Create table for storing AI comment analysis results
CREATE TABLE public.comment_analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  source_type TEXT NOT NULL CHECK (source_type IN ('appraisal_score', 'goal_comment', 'feedback_response', 'check_in')),
  source_id UUID NOT NULL,
  rating_value NUMERIC,
  comment_text TEXT NOT NULL,
  inflation_score INTEGER CHECK (inflation_score >= 0 AND inflation_score <= 100),
  consistency_score INTEGER CHECK (consistency_score >= 0 AND consistency_score <= 100),
  bias_indicators JSONB DEFAULT '[]'::jsonb,
  suggested_alternatives JSONB DEFAULT '[]'::jsonb,
  evidence_summary JSONB DEFAULT '{}'::jsonb,
  analysis_model TEXT,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'dismissed', 'overridden')),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_comment_analysis_source ON public.comment_analysis_results(source_type, source_id);
CREATE INDEX idx_comment_analysis_company ON public.comment_analysis_results(company_id);
CREATE INDEX idx_comment_analysis_inflation ON public.comment_analysis_results(inflation_score) WHERE inflation_score > 60;
CREATE INDEX idx_comment_analysis_review ON public.comment_analysis_results(review_status);

-- Add AI analysis reference to appraisal_scores
ALTER TABLE public.appraisal_scores 
ADD COLUMN IF NOT EXISTS ai_analysis_id UUID REFERENCES public.comment_analysis_results(id),
ADD COLUMN IF NOT EXISTS inflation_warning_acknowledged BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.comment_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view analysis for their company"
ON public.comment_analysis_results
FOR SELECT
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "HR and managers can create analysis"
ON public.comment_analysis_results
FOR INSERT
WITH CHECK (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "Reviewers can update analysis"
ON public.comment_analysis_results
FOR UPDATE
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_comment_analysis_results_updated_at
BEFORE UPDATE ON public.comment_analysis_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();