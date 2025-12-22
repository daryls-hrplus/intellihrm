-- Add status column to payslips table for recall handling
ALTER TABLE public.payslips 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Add recall tracking columns
ALTER TABLE public.payslips
ADD COLUMN IF NOT EXISTS recalled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recalled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS recall_reason TEXT,
ADD COLUMN IF NOT EXISTS payroll_run_id UUID REFERENCES public.payroll_runs(id);

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_payslips_status ON public.payslips(status);
CREATE INDEX IF NOT EXISTS idx_payslips_payroll_run_id ON public.payslips(payroll_run_id);

-- Add comment for documentation
COMMENT ON COLUMN public.payslips.status IS 'Payslip status: active, recalled, superseded';