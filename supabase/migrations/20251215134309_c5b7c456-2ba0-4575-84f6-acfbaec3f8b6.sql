-- Create employee_compensation table for individual employee-level pay adjustments
CREATE TABLE public.employee_compensation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pay_element_id UUID NOT NULL REFERENCES public.pay_elements(id) ON DELETE CASCADE,
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  is_override BOOLEAN NOT NULL DEFAULT false,
  override_reason TEXT,
  notes TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id)
);

-- Create indexes for performance
CREATE INDEX idx_employee_compensation_company ON public.employee_compensation(company_id);
CREATE INDEX idx_employee_compensation_employee ON public.employee_compensation(employee_id);
CREATE INDEX idx_employee_compensation_pay_element ON public.employee_compensation(pay_element_id);
CREATE INDEX idx_employee_compensation_active ON public.employee_compensation(is_active, start_date, end_date);

-- Enable RLS
ALTER TABLE public.employee_compensation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view employee compensation"
ON public.employee_compensation
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage employee compensation"
ON public.employee_compensation
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_employee_compensation_updated_at
BEFORE UPDATE ON public.employee_compensation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();