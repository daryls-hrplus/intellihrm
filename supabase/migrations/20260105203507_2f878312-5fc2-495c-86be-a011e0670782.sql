-- Create table to store scheduled job configurations
CREATE TABLE IF NOT EXISTS public.scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL UNIQUE,
  job_description text,
  edge_function_name text NOT NULL,
  is_enabled boolean DEFAULT false,
  interval_minutes integer NOT NULL DEFAULT 15,
  last_run_at timestamp with time zone,
  last_run_status text,
  last_run_result jsonb,
  next_scheduled_run timestamp with time zone,
  company_id uuid REFERENCES public.companies(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage scheduled jobs"
ON public.scheduled_jobs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('super_admin', 'admin', 'hr_admin')
  )
);

-- Insert default workflow escalation job
INSERT INTO public.scheduled_jobs (job_name, job_description, edge_function_name, interval_minutes, is_enabled)
VALUES (
  'workflow-escalations',
  'Process workflow step escalations, expirations, and SLA status updates',
  'process-workflow-escalations',
  15,
  true
) ON CONFLICT (job_name) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_enabled ON public.scheduled_jobs(is_enabled) WHERE is_enabled = true;

-- Add comment
COMMENT ON TABLE public.scheduled_jobs IS 'Configuration for scheduled background jobs that call edge functions';