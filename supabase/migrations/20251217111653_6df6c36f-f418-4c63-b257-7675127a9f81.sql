
-- Leave Schedule Configuration table
CREATE TABLE public.leave_schedule_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily_accrual', 'monthly_accrual', 'year_end_rollover')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  run_time TIME NOT NULL DEFAULT '02:00:00',
  run_day_of_month INTEGER CHECK (run_day_of_month BETWEEN 1 AND 28),
  last_run_at TIMESTAMP WITH TIME ZONE,
  last_run_status TEXT CHECK (last_run_status IN ('success', 'failed', 'running', 'pending')),
  last_run_message TEXT,
  next_run_at TIMESTAMP WITH TIME ZONE,
  notify_on_completion BOOLEAN NOT NULL DEFAULT true,
  notify_on_failure BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, schedule_type)
);

-- Leave Schedule Run History
CREATE TABLE public.leave_schedule_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_id UUID NOT NULL REFERENCES public.leave_schedule_config(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('success', 'failed', 'running')),
  employees_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_schedule_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_schedule_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_schedule_config
CREATE POLICY "Admins can manage leave schedule config"
  ON public.leave_schedule_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for leave_schedule_runs
CREATE POLICY "Admins can view leave schedule runs"
  ON public.leave_schedule_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'hr_manager')
    )
  );

CREATE POLICY "System can insert leave schedule runs"
  ON public.leave_schedule_runs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update leave schedule runs"
  ON public.leave_schedule_runs
  FOR UPDATE
  USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_leave_schedule_config_updated_at
  BEFORE UPDATE ON public.leave_schedule_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_leave_schedule_config_company ON public.leave_schedule_config(company_id);
CREATE INDEX idx_leave_schedule_config_next_run ON public.leave_schedule_config(next_run_at) WHERE is_enabled = true;
CREATE INDEX idx_leave_schedule_runs_config ON public.leave_schedule_runs(config_id);
CREATE INDEX idx_leave_schedule_runs_company ON public.leave_schedule_runs(company_id);
