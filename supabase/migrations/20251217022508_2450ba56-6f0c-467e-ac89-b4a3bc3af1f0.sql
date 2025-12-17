-- Create benefit payroll mapping table
CREATE TABLE public.benefit_payroll_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  benefit_plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  pay_element_id UUID NOT NULL REFERENCES public.pay_elements(id) ON DELETE CASCADE,
  mapping_type TEXT NOT NULL DEFAULT 'deduction' CHECK (mapping_type IN ('deduction', 'contribution', 'employer_contribution')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, benefit_plan_id, pay_element_id, mapping_type)
);

-- Enable RLS
ALTER TABLE public.benefit_payroll_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view benefit payroll mappings for their company"
  ON public.benefit_payroll_mappings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = benefit_payroll_mappings.company_id
    )
  );

CREATE POLICY "Admins can manage benefit payroll mappings"
  ON public.benefit_payroll_mappings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.user_roles ur ON ur.user_id = p.id
      JOIN public.roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid()
      AND r.code IN ('admin', 'hr_manager')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_benefit_payroll_mappings_updated_at
  BEFORE UPDATE ON public.benefit_payroll_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.benefit_payroll_mappings;