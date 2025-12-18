-- Create statutory to pay element mappings table
CREATE TABLE public.statutory_pay_element_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  statutory_type_id UUID NOT NULL REFERENCES public.statutory_deduction_types(id) ON DELETE CASCADE,
  employee_pay_element_id UUID REFERENCES public.pay_elements(id) ON DELETE SET NULL,
  employer_pay_element_id UUID REFERENCES public.pay_elements(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, statutory_type_id)
);

-- Enable RLS
ALTER TABLE public.statutory_pay_element_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view statutory mappings for their company"
  ON public.statutory_pay_element_mappings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert statutory mappings"
  ON public.statutory_pay_element_mappings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update statutory mappings"
  ON public.statutory_pay_element_mappings
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete statutory mappings"
  ON public.statutory_pay_element_mappings
  FOR DELETE
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_statutory_mappings_company ON public.statutory_pay_element_mappings(company_id);
CREATE INDEX idx_statutory_mappings_statutory_type ON public.statutory_pay_element_mappings(statutory_type_id);

-- Add trigger for updated_at
CREATE TRIGGER update_statutory_pay_element_mappings_updated_at
  BEFORE UPDATE ON public.statutory_pay_element_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();