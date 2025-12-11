-- Create table to store headcount forecasts
CREATE TABLE public.headcount_forecasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  forecast_data JSONB NOT NULL,
  historical_data JSONB NOT NULL,
  name TEXT,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.headcount_forecasts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view forecasts"
  ON public.headcount_forecasts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create forecasts"
  ON public.headcount_forecasts
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can delete forecasts"
  ON public.headcount_forecasts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for faster queries
CREATE INDEX idx_headcount_forecasts_company ON public.headcount_forecasts(company_id);
CREATE INDEX idx_headcount_forecasts_created_at ON public.headcount_forecasts(created_at DESC);