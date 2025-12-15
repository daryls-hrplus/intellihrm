-- Add calculation timing fields to payroll_runs
ALTER TABLE public.payroll_runs
ADD COLUMN IF NOT EXISTS calculation_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unlocked_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS recalculation_requested_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS recalculation_approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS recalculation_approved_at TIMESTAMP WITH TIME ZONE;

-- Create payroll locks table to track locked employees
CREATE TABLE IF NOT EXISTS public.payroll_employee_locks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID NOT NULL REFERENCES public.payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id),
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_by UUID REFERENCES auth.users(id),
  unlocked_at TIMESTAMP WITH TIME ZONE,
  unlocked_by UUID REFERENCES auth.users(id),
  lock_reason TEXT DEFAULT 'payroll_processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(payroll_run_id, employee_id)
);

-- Enable RLS
ALTER TABLE public.payroll_employee_locks ENABLE ROW LEVEL SECURITY;

-- RLS policies for payroll_employee_locks
CREATE POLICY "HR and admins can manage payroll locks"
ON public.payroll_employee_locks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Create payroll change audit log
CREATE TABLE IF NOT EXISTS public.payroll_change_restrictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_run_id UUID REFERENCES public.payroll_runs(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attempted_by UUID REFERENCES auth.users(id),
  blocked BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_change_restrictions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "HR and admins can view payroll change restrictions"
ON public.payroll_change_restrictions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager')
  )
);

-- Function to check if employee is locked for payroll
CREATE OR REPLACE FUNCTION public.is_employee_payroll_locked(p_employee_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.payroll_employee_locks pel
    JOIN public.payroll_runs pr ON pel.payroll_run_id = pr.id
    WHERE pel.employee_id = p_employee_id
    AND pel.unlocked_at IS NULL
    AND pr.status NOT IN ('paid', 'cancelled', 'failed')
  );
END;
$$;

-- Function to check if payroll is finalized (paid) for employee
CREATE OR REPLACE FUNCTION public.is_employee_payroll_finalized(p_employee_id UUID, p_pay_period_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.employee_payroll ep
    JOIN public.payroll_runs pr ON ep.payroll_run_id = pr.id
    WHERE ep.employee_id = p_employee_id
    AND pr.status = 'paid'
    AND (p_pay_period_id IS NULL OR ep.pay_period_id = p_pay_period_id)
  );
END;
$$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_payroll_employee_locks_employee ON public.payroll_employee_locks(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_locks_run ON public.payroll_employee_locks(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee_locks_unlocked ON public.payroll_employee_locks(unlocked_at) WHERE unlocked_at IS NULL;