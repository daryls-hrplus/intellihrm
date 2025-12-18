-- Create historical_payroll_imports table for tracking bulk imports
CREATE TABLE public.historical_payroll_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Import metadata
  file_name TEXT NOT NULL,
  import_type TEXT NOT NULL DEFAULT 'full', -- 'full', 'earnings_only', 'statutory_only'
  
  -- Date range covered
  period_start_date DATE,
  period_end_date DATE,
  
  -- Stats
  total_records INTEGER DEFAULT 0,
  total_runs_created INTEGER DEFAULT 0,
  total_entries_created INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  
  -- Error tracking
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'validating', 'processing', 'completed', 'failed'
  
  -- Audit
  imported_by UUID REFERENCES public.profiles(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_historical flag to payroll_runs to distinguish imported runs
ALTER TABLE public.payroll_runs 
ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS historical_import_id UUID REFERENCES public.historical_payroll_imports(id),
ADD COLUMN IF NOT EXISTS original_run_date DATE;

-- Enable RLS
ALTER TABLE public.historical_payroll_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for historical_payroll_imports
CREATE POLICY "Users can view imports for their company"
  ON public.historical_payroll_imports
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert imports for their company"
  ON public.historical_payroll_imports
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update imports for their company"
  ON public.historical_payroll_imports
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete imports for their company"
  ON public.historical_payroll_imports
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create index for performance
CREATE INDEX idx_historical_imports_company ON public.historical_payroll_imports(company_id);
CREATE INDEX idx_payroll_runs_historical ON public.payroll_runs(is_historical) WHERE is_historical = true;