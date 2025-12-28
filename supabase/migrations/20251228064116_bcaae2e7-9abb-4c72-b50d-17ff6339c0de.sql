-- Add is_paid column to leave_types for distinguishing paid vs unpaid leave
ALTER TABLE public.leave_types 
ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT true;

-- Add payment_method column to specify how leave affects payroll
ALTER TABLE public.leave_types 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'full_pay' 
CHECK (payment_method IN ('full_pay', 'reduced_pay', 'unpaid', 'statutory'));

-- Add deduction_type to leave_payroll_mappings for more flexible integration
ALTER TABLE public.leave_payroll_mappings 
ADD COLUMN IF NOT EXISTS mapping_type text DEFAULT 'deduction'
CHECK (mapping_type IN ('deduction', 'earning', 'adjustment'));

-- Create table to track leave transactions in payroll
CREATE TABLE IF NOT EXISTS public.leave_payroll_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES public.companies(id) NOT NULL,
  employee_id uuid REFERENCES public.profiles(id) NOT NULL,
  pay_period_id uuid REFERENCES public.pay_periods(id) NOT NULL,
  payroll_run_id uuid REFERENCES public.payroll_runs(id),
  leave_request_id uuid REFERENCES public.leave_requests(id),
  leave_type_id uuid REFERENCES public.leave_types(id) NOT NULL,
  leave_payroll_mapping_id uuid REFERENCES public.leave_payroll_mappings(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('unpaid_deduction', 'paid_leave', 'leave_buyout', 'leave_encashment', 'sick_leave_statutory')),
  leave_days numeric NOT NULL DEFAULT 0,
  leave_hours numeric DEFAULT 0,
  daily_rate numeric DEFAULT 0,
  hourly_rate numeric DEFAULT 0,
  gross_amount numeric NOT NULL DEFAULT 0,
  payment_percentage numeric DEFAULT 100,
  net_amount numeric NOT NULL DEFAULT 0,
  description text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_payroll_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view leave payroll transactions for their company" 
ON public.leave_payroll_transactions 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR can manage leave payroll transactions" 
ON public.leave_payroll_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('admin', 'hr_admin', 'hr_manager', 'payroll_admin')
  )
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_leave_payroll_transactions_employee 
ON public.leave_payroll_transactions(employee_id, pay_period_id);

CREATE INDEX IF NOT EXISTS idx_leave_payroll_transactions_payroll_run 
ON public.leave_payroll_transactions(payroll_run_id);

-- Add trigger for updated_at
CREATE TRIGGER update_leave_payroll_transactions_updated_at
BEFORE UPDATE ON public.leave_payroll_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();