-- Create employee tax allowances table for non-taxable allowances/reliefs
CREATE TABLE public.employee_tax_allowances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  allowance_name TEXT NOT NULL,
  allowance_code TEXT,
  description TEXT,
  instances_count INTEGER NOT NULL DEFAULT 1,
  amount_per_instance NUMERIC(15,2) NOT NULL DEFAULT 0,
  annual_limit NUMERIC(15,2),
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  supporting_documents JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT positive_instances CHECK (instances_count >= 0),
  CONSTRAINT positive_amount CHECK (amount_per_instance >= 0),
  CONSTRAINT positive_limit CHECK (annual_limit IS NULL OR annual_limit >= 0)
);

-- Enable RLS
ALTER TABLE public.employee_tax_allowances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view tax allowances in their company"
  ON public.employee_tax_allowances FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "HR and Admin can manage tax allowances"
  ON public.employee_tax_allowances FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'hr_manager')
  );

-- Employees can view their own allowances
CREATE POLICY "Employees can view their own tax allowances"
  ON public.employee_tax_allowances FOR SELECT
  USING (employee_id = auth.uid());

-- Create index for performance
CREATE INDEX idx_employee_tax_allowances_employee ON public.employee_tax_allowances(employee_id);
CREATE INDEX idx_employee_tax_allowances_company ON public.employee_tax_allowances(company_id);
CREATE INDEX idx_employee_tax_allowances_active ON public.employee_tax_allowances(is_active, effective_date);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_tax_allowances_updated_at
  BEFORE UPDATE ON public.employee_tax_allowances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.employee_tax_allowances IS 'Stores non-taxable allowances that reduce employee annual taxable income (e.g., child allowances, dependent care)';