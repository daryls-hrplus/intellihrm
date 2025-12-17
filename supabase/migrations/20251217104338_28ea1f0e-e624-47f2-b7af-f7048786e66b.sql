-- Add document and AI analysis columns to statutory_deduction_types
ALTER TABLE public.statutory_deduction_types
ADD COLUMN IF NOT EXISTS reference_document_url TEXT,
ADD COLUMN IF NOT EXISTS ai_calculation_rules JSONB,
ADD COLUMN IF NOT EXISTS ai_sample_document TEXT,
ADD COLUMN IF NOT EXISTS ai_dependencies JSONB,
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create table for comprehensive country statutory documentation
CREATE TABLE IF NOT EXISTS public.statutory_country_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  state_province TEXT,
  comprehensive_document TEXT,
  statutory_summary JSONB,
  dependency_map JSONB,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(country, state_province)
);

-- Enable RLS
ALTER TABLE public.statutory_country_documentation ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view statutory documentation"
  ON public.statutory_country_documentation FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage statutory documentation"
  ON public.statutory_country_documentation FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Update trigger
CREATE TRIGGER update_statutory_country_documentation_updated_at
  BEFORE UPDATE ON public.statutory_country_documentation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();