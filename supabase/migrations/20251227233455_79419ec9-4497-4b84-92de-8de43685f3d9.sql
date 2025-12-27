-- Create salary_advance_types table for configurable advance types per territory
CREATE TABLE public.salary_advance_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  max_amount NUMERIC(15,2),
  max_percentage_of_salary NUMERIC(5,2) DEFAULT 50,
  interest_rate NUMERIC(5,4) DEFAULT 0,
  max_repayment_periods INTEGER DEFAULT 12,
  min_repayment_periods INTEGER DEFAULT 1,
  requires_approval BOOLEAN DEFAULT true,
  max_per_year INTEGER,
  waiting_period_days INTEGER DEFAULT 0,
  eligible_after_months INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Create salary_advances table for individual advance requests
CREATE TABLE public.salary_advances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advance_number TEXT,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  advance_type_id UUID REFERENCES public.salary_advance_types(id),
  requested_amount NUMERIC(15,2) NOT NULL,
  approved_amount NUMERIC(15,2),
  interest_rate NUMERIC(5,4) DEFAULT 0,
  total_repayment_amount NUMERIC(15,2),
  repayment_periods INTEGER DEFAULT 1,
  repayment_amount_per_period NUMERIC(15,2),
  repayment_start_date DATE,
  currency TEXT DEFAULT 'USD',
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'disbursed', 'repaying', 'completed', 'cancelled', 'written_off')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.profiles(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  disbursed_by UUID REFERENCES public.profiles(id),
  disbursement_method TEXT CHECK (disbursement_method IN ('payroll', 'bank_transfer', 'cash', 'check')),
  disbursement_reference TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  outstanding_balance NUMERIC(15,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create salary_advance_repayments table to track repayment schedule and actual payments
CREATE TABLE public.salary_advance_repayments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_advance_id UUID NOT NULL REFERENCES public.salary_advances(id) ON DELETE CASCADE,
  period_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  scheduled_amount NUMERIC(15,2) NOT NULL,
  principal_amount NUMERIC(15,2),
  interest_amount NUMERIC(15,2),
  paid_amount NUMERIC(15,2) DEFAULT 0,
  paid_date DATE,
  payment_method TEXT CHECK (payment_method IN ('payroll_deduction', 'bank_transfer', 'cash', 'check')),
  payroll_run_id UUID REFERENCES public.payroll_runs(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'waived')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salary_advance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advance_repayments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for salary_advance_types
CREATE POLICY "Users can view advance types for their company" ON public.salary_advance_types
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "Admins can manage advance types" ON public.salary_advance_types
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin']));

-- RLS Policies for salary_advances
CREATE POLICY "Employees can view their own advances" ON public.salary_advances
  FOR SELECT USING (
    employee_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin', 'manager'])
  );

CREATE POLICY "Employees can create their own advance requests" ON public.salary_advances
  FOR INSERT WITH CHECK (
    employee_id = auth.uid()
    OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "Admins can manage all advances" ON public.salary_advances
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin']));

-- RLS Policies for salary_advance_repayments
CREATE POLICY "Users can view repayments for their advances" ON public.salary_advance_repayments
  FOR SELECT USING (
    salary_advance_id IN (SELECT id FROM salary_advances WHERE employee_id = auth.uid())
    OR has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin'])
  );

CREATE POLICY "Admins can manage repayments" ON public.salary_advance_repayments
  FOR ALL USING (has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'payroll_admin']));

-- Function to generate advance number
CREATE OR REPLACE FUNCTION public.generate_advance_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.advance_number := 'ADV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate advance number
CREATE TRIGGER generate_advance_number_trigger
  BEFORE INSERT ON public.salary_advances
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_advance_number();

-- Add updated_at triggers
CREATE TRIGGER update_salary_advance_types_updated_at
  BEFORE UPDATE ON public.salary_advance_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_advances_updated_at
  BEFORE UPDATE ON public.salary_advances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salary_advance_repayments_updated_at
  BEFORE UPDATE ON public.salary_advance_repayments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_salary_advances_employee ON public.salary_advances(employee_id);
CREATE INDEX idx_salary_advances_company ON public.salary_advances(company_id);
CREATE INDEX idx_salary_advances_status ON public.salary_advances(status);
CREATE INDEX idx_salary_advance_repayments_advance ON public.salary_advance_repayments(salary_advance_id);
CREATE INDEX idx_salary_advance_repayments_due_date ON public.salary_advance_repayments(due_date);