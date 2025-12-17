-- Create employee_regular_deductions table for recurring deductions
CREATE TABLE public.employee_regular_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  deduction_name TEXT NOT NULL,
  deduction_code TEXT,
  deduction_type TEXT NOT NULL DEFAULT 'fixed', -- fixed, percentage
  amount NUMERIC(15,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_pretax BOOLEAN NOT NULL DEFAULT false,
  
  -- Cycle-based deductions
  total_cycles INTEGER, -- Total number of cycles to deduct (null = indefinite)
  completed_cycles INTEGER NOT NULL DEFAULT 0, -- Number of cycles already deducted
  
  -- Goal-based deductions
  goal_amount NUMERIC(15,2), -- Target amount to reach (null = no goal)
  amount_deducted NUMERIC(15,2) NOT NULL DEFAULT 0, -- Running total of amount deducted
  
  -- Additional parameters
  pay_element_id UUID REFERENCES public.pay_elements(id), -- Optional link to pay element
  frequency TEXT NOT NULL DEFAULT 'monthly', -- monthly, bi-weekly, weekly, per-pay-period
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- Manual end date if needed
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_stopped_at TIMESTAMPTZ, -- When goal/cycles reached
  stop_reason TEXT, -- 'goal_reached', 'cycles_completed', 'manual'
  
  -- Reference info
  reference_number TEXT, -- e.g., mortgage account number
  institution_name TEXT, -- e.g., bank name
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.employee_regular_deductions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - authenticated users in company can view
CREATE POLICY "Authenticated users can view regular deductions"
  ON public.employee_regular_deductions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert regular deductions"
  ON public.employee_regular_deductions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update regular deductions"
  ON public.employee_regular_deductions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete regular deductions"
  ON public.employee_regular_deductions
  FOR DELETE
  TO authenticated
  USING (true);

-- Indexes
CREATE INDEX idx_employee_regular_deductions_company ON public.employee_regular_deductions(company_id);
CREATE INDEX idx_employee_regular_deductions_employee ON public.employee_regular_deductions(employee_id);
CREATE INDEX idx_employee_regular_deductions_active ON public.employee_regular_deductions(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_employee_regular_deductions_updated_at
  BEFORE UPDATE ON public.employee_regular_deductions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();