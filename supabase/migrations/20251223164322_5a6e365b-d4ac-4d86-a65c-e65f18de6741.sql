-- Create table to track AI governance scheduled job runs
CREATE TABLE public.ai_scheduled_job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
  company_id UUID REFERENCES public.companies(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  companies_processed INTEGER DEFAULT 0,
  metrics_generated JSONB,
  error_message TEXT,
  triggered_by TEXT DEFAULT 'scheduled' CHECK (triggered_by IN ('scheduled', 'manual')),
  triggered_by_user UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_scheduled_job_runs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all job runs
CREATE POLICY "Admins can view all ai scheduled job runs"
  ON public.ai_scheduled_job_runs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Policy: System can insert job runs (edge functions)
CREATE POLICY "Service role can manage ai scheduled job runs"
  ON public.ai_scheduled_job_runs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX idx_ai_scheduled_job_runs_job_type ON public.ai_scheduled_job_runs(job_type);
CREATE INDEX idx_ai_scheduled_job_runs_status ON public.ai_scheduled_job_runs(status);
CREATE INDEX idx_ai_scheduled_job_runs_started_at ON public.ai_scheduled_job_runs(started_at DESC);

-- Add comment
COMMENT ON TABLE public.ai_scheduled_job_runs IS 'Tracks execution history of AI governance scheduled jobs for ISO 42001 compliance';