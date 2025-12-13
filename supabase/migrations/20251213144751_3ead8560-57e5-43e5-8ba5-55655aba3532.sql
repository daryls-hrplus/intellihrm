-- Create centralized pay_groups table
CREATE TABLE public.pay_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  pay_frequency TEXT NOT NULL CHECK (pay_frequency IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT pay_groups_company_code_unique UNIQUE (company_id, code)
);

-- Add pay_group_id to employee_pay_groups to reference central pay group
ALTER TABLE public.employee_pay_groups 
ADD COLUMN pay_group_id UUID REFERENCES public.pay_groups(id);

-- Add pay_group_id to pay_period_schedules
ALTER TABLE public.pay_period_schedules 
ADD COLUMN pay_group_id UUID REFERENCES public.pay_groups(id);

-- Add pay_group_id to payroll_runs
ALTER TABLE public.payroll_runs
ADD COLUMN pay_group_id UUID REFERENCES public.pay_groups(id);

-- Enable RLS
ALTER TABLE public.pay_groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for pay_groups
CREATE POLICY "Users can view pay groups from their company"
ON public.pay_groups FOR SELECT
USING (
  company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'hr_manager')
);

CREATE POLICY "Admins and HR can manage pay groups"
ON public.pay_groups FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'hr_manager')
);

-- Create updated_at trigger
CREATE TRIGGER update_pay_groups_updated_at
BEFORE UPDATE ON public.pay_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_pay_groups_company ON public.pay_groups(company_id);
CREATE INDEX idx_pay_groups_frequency ON public.pay_groups(pay_frequency);