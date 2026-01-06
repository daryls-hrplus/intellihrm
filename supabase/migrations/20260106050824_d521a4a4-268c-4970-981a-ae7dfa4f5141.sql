-- Add finalization tracking to timesheet_submissions
ALTER TABLE public.timesheet_submissions
ADD COLUMN IF NOT EXISTS finalized_at timestamptz,
ADD COLUMN IF NOT EXISTS finalized_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS leave_sync_status text DEFAULT 'pending' CHECK (leave_sync_status IN ('pending', 'synced', 'failed', 'not_required')),
ADD COLUMN IF NOT EXISTS leave_sync_at timestamptz,
ADD COLUMN IF NOT EXISTS pay_period_id uuid;

-- Add leave link to attendance_exceptions
ALTER TABLE public.attendance_exceptions
ADD COLUMN IF NOT EXISTS leave_request_id uuid REFERENCES public.leave_requests(id),
ADD COLUMN IF NOT EXISTS leave_type_id uuid REFERENCES public.leave_types(id),
ADD COLUMN IF NOT EXISTS payroll_processed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS payroll_processed_at timestamptz;

-- Create timekeeper period finalizations table
CREATE TABLE IF NOT EXISTS public.timekeeper_period_finalizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  timekeeper_id uuid NOT NULL REFERENCES auth.users(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  employee_ids uuid[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'sent_to_payroll', 'cancelled')),
  total_employees integer DEFAULT 0,
  total_regular_hours numeric(10,2) DEFAULT 0,
  total_overtime_hours numeric(10,2) DEFAULT 0,
  absences_excused integer DEFAULT 0,
  absences_unexcused integer DEFAULT 0,
  leave_transactions_created integer DEFAULT 0,
  validation_errors jsonb DEFAULT '[]',
  finalized_at timestamptz,
  sent_to_payroll_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(company_id, period_start, period_end, department_id)
);

-- Enable RLS
ALTER TABLE public.timekeeper_period_finalizations ENABLE ROW LEVEL SECURITY;

-- RLS policies for timekeeper_period_finalizations
CREATE POLICY "Users can view finalizations for their company"
ON public.timekeeper_period_finalizations
FOR SELECT
USING (
  company_id IN (
    SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Timekeepers can insert finalizations"
ON public.timekeeper_period_finalizations
FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Timekeepers can update finalizations for their company"
ON public.timekeeper_period_finalizations
FOR UPDATE
USING (
  company_id IN (
    SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_timekeeper_finalizations_company_period 
ON public.timekeeper_period_finalizations(company_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_timekeeper_finalizations_status 
ON public.timekeeper_period_finalizations(status);

CREATE INDEX IF NOT EXISTS idx_attendance_exceptions_leave_request 
ON public.attendance_exceptions(leave_request_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_timekeeper_finalization_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_timekeeper_period_finalizations_updated_at ON public.timekeeper_period_finalizations;

CREATE TRIGGER update_timekeeper_period_finalizations_updated_at
BEFORE UPDATE ON public.timekeeper_period_finalizations
FOR EACH ROW
EXECUTE FUNCTION public.update_timekeeper_finalization_updated_at();