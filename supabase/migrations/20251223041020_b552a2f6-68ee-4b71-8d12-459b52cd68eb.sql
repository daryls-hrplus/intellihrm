-- Create employee transaction payroll mappings table
CREATE TABLE public.employee_transaction_payroll_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  pay_element_id UUID NOT NULL REFERENCES public.pay_elements(id) ON DELETE CASCADE,
  mapping_type TEXT NOT NULL DEFAULT 'earning',
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_transaction_mapping UNIQUE (company_id, transaction_type, pay_element_id)
);

-- Enable RLS
ALTER TABLE public.employee_transaction_payroll_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view transaction mappings for their company"
  ON public.employee_transaction_payroll_mappings
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transaction mappings for their company"
  ON public.employee_transaction_payroll_mappings
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update transaction mappings for their company"
  ON public.employee_transaction_payroll_mappings
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transaction mappings for their company"
  ON public.employee_transaction_payroll_mappings
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_transaction_mappings_company ON public.employee_transaction_payroll_mappings(company_id);
CREATE INDEX idx_transaction_mappings_type ON public.employee_transaction_payroll_mappings(transaction_type);

-- Add comment
COMMENT ON TABLE public.employee_transaction_payroll_mappings IS 'Maps employee transaction types (hire, promotion, etc.) to pay element codes for payroll processing';