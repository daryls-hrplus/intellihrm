-- Create enum for approval status
CREATE TYPE public.approval_workflow_status AS ENUM (
  'pending_level_1',
  'pending_level_2', 
  'pending_level_3',
  'approved_for_payroll',
  'sent_to_payroll',
  'rejected'
);

-- Create shift approval levels table
CREATE TABLE public.shift_approval_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  approval_level INTEGER NOT NULL CHECK (approval_level BETWEEN 1 AND 3),
  approver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shift_id, approval_level)
);

-- Create pay elements enum
CREATE TYPE public.pay_element_type AS ENUM (
  'regular_time',
  'overtime_1_5x',
  'overtime_2x',
  'overtime_3x',
  'holiday_pay',
  'holiday_overtime',
  'night_differential',
  'weekend_premium',
  'paid_leave',
  'unpaid_deduction',
  'sick_leave',
  'other'
);

-- Create payroll summary records table (summarized by pay element)
CREATE TABLE public.payroll_summary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  finalization_id UUID NOT NULL REFERENCES public.timekeeper_period_finalizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pay_element pay_element_type NOT NULL,
  hours DECIMAL(10,2) NOT NULL DEFAULT 0,
  rate DECIMAL(12,4),
  multiplier DECIMAL(4,2) DEFAULT 1.00,
  gross_amount DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  source_records JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create approval workflow history table
CREATE TABLE public.timesheet_approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finalization_id UUID NOT NULL REFERENCES public.timekeeper_period_finalizations(id) ON DELETE CASCADE,
  approval_level INTEGER NOT NULL,
  approver_id UUID NOT NULL REFERENCES public.profiles(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'returned')),
  comments TEXT,
  approved_at TIMESTAMPTZ DEFAULT now()
);

-- Add approval workflow columns to timekeeper_period_finalizations
ALTER TABLE public.timekeeper_period_finalizations
ADD COLUMN current_approval_level INTEGER DEFAULT 1,
ADD COLUMN max_approval_levels INTEGER DEFAULT 1,
ADD COLUMN workflow_status approval_workflow_status DEFAULT 'pending_level_1',
ADD COLUMN current_approver_id UUID REFERENCES public.profiles(id),
ADD COLUMN next_approver_id UUID REFERENCES public.profiles(id),
ADD COLUMN payroll_summary_created_at TIMESTAMPTZ,
ADD COLUMN rejected_at TIMESTAMPTZ,
ADD COLUMN rejected_by UUID REFERENCES public.profiles(id),
ADD COLUMN rejection_reason TEXT;

-- Enable RLS
ALTER TABLE public.shift_approval_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_summary_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_approval_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for shift_approval_levels
CREATE POLICY "Users can view shift approval levels for their company"
ON public.shift_approval_levels FOR SELECT
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "HR can manage shift approval levels"
ON public.shift_approval_levels FOR ALL
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS policies for payroll_summary_records
CREATE POLICY "Users can view payroll summaries for their company"
ON public.payroll_summary_records FOR SELECT
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

CREATE POLICY "System can manage payroll summaries"
ON public.payroll_summary_records FOR ALL
TO authenticated
USING (company_id IN (
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
));

-- RLS policies for timesheet_approval_history
CREATE POLICY "Users can view approval history for their company"
ON public.timesheet_approval_history FOR SELECT
TO authenticated
USING (finalization_id IN (
  SELECT id FROM public.timekeeper_period_finalizations 
  WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
));

CREATE POLICY "Approvers can add approval history"
ON public.timesheet_approval_history FOR INSERT
TO authenticated
WITH CHECK (finalization_id IN (
  SELECT id FROM public.timekeeper_period_finalizations 
  WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
));

-- Create indexes
CREATE INDEX idx_shift_approval_levels_shift ON public.shift_approval_levels(shift_id);
CREATE INDEX idx_shift_approval_levels_approver ON public.shift_approval_levels(approver_id);
CREATE INDEX idx_payroll_summary_employee ON public.payroll_summary_records(employee_id, period_start, period_end);
CREATE INDEX idx_payroll_summary_finalization ON public.payroll_summary_records(finalization_id);
CREATE INDEX idx_approval_history_finalization ON public.timesheet_approval_history(finalization_id);

-- Triggers for updated_at
CREATE TRIGGER update_shift_approval_levels_updated_at
  BEFORE UPDATE ON public.shift_approval_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payroll_summary_records_updated_at
  BEFORE UPDATE ON public.payroll_summary_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();