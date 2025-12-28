-- Add source tracking columns to employee_work_records
ALTER TABLE public.employee_work_records 
ADD COLUMN IF NOT EXISTS time_clock_entry_id UUID REFERENCES public.time_clock_entries(id),
ADD COLUMN IF NOT EXISTS timesheet_entry_id UUID REFERENCES public.timesheet_entries(id),
ADD COLUMN IF NOT EXISTS overtime_request_id UUID REFERENCES public.overtime_requests(id),
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual', 'time_clock', 'timesheet', 'overtime_request'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_work_records_time_clock ON public.employee_work_records(time_clock_entry_id) WHERE time_clock_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_records_timesheet ON public.employee_work_records(timesheet_entry_id) WHERE timesheet_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_records_overtime ON public.employee_work_records(overtime_request_id) WHERE overtime_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_work_records_source ON public.employee_work_records(source_type);

-- Create payroll time sync logs table
CREATE TABLE IF NOT EXISTS public.payroll_time_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  pay_period_id UUID REFERENCES public.pay_periods(id),
  sync_type TEXT NOT NULL CHECK (sync_type IN ('time_clock', 'timesheet', 'overtime', 'full')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  employees_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  total_regular_hours NUMERIC(10,2) DEFAULT 0,
  total_overtime_hours NUMERIC(10,2) DEFAULT 0,
  error_message TEXT,
  sync_options JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  reversed_at TIMESTAMPTZ,
  reversed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_time_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for payroll_time_sync_logs
CREATE POLICY "Users can view sync logs for their company" 
ON public.payroll_time_sync_logs 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR managers can create sync logs" 
ON public.payroll_time_sync_logs 
FOR INSERT 
WITH CHECK (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR managers can update sync logs" 
ON public.payroll_time_sync_logs 
FOR UPDATE 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_company ON public.payroll_time_sync_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_pay_period ON public.payroll_time_sync_logs(pay_period_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.payroll_time_sync_logs(status);

-- Add hourly calculation fields to employee_payroll if not exists
ALTER TABLE public.employee_payroll
ADD COLUMN IF NOT EXISTS total_regular_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS total_overtime_hours NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(12,4),
ADD COLUMN IF NOT EXISTS overtime_rate NUMERIC(12,4),
ADD COLUMN IF NOT EXISTS hours_based_earnings NUMERIC(12,2);