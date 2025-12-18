-- Create employee_opening_balances table for brought forward balances
CREATE TABLE public.employee_opening_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  effective_date DATE NOT NULL,
  
  -- Previous employer info
  previous_employer_name TEXT,
  previous_employer_tax_number TEXT,
  
  -- YTD Earnings
  ytd_gross_earnings NUMERIC(15,2) DEFAULT 0,
  ytd_taxable_income NUMERIC(15,2) DEFAULT 0,
  ytd_non_taxable_income NUMERIC(15,2) DEFAULT 0,
  
  -- YTD Statutory Deductions (Employee)
  ytd_income_tax NUMERIC(15,2) DEFAULT 0,
  ytd_nis NUMERIC(15,2) DEFAULT 0,
  ytd_nht NUMERIC(15,2) DEFAULT 0,
  ytd_education_tax NUMERIC(15,2) DEFAULT 0,
  
  -- YTD Employer Contributions
  ytd_employer_nis NUMERIC(15,2) DEFAULT 0,
  ytd_employer_nht NUMERIC(15,2) DEFAULT 0,
  ytd_employer_education_tax NUMERIC(15,2) DEFAULT 0,
  ytd_employer_heart NUMERIC(15,2) DEFAULT 0,
  
  -- Additional custom statutory (JSON for flexibility across countries)
  ytd_other_statutory JSONB DEFAULT '{}',
  
  -- Import metadata
  import_source TEXT DEFAULT 'manual', -- 'manual', 'csv_import', 'api'
  import_batch_id UUID,
  notes TEXT,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  
  -- Unique constraint: one opening balance per employee per tax year
  CONSTRAINT unique_employee_tax_year UNIQUE (employee_id, tax_year)
);

-- Create employee_opening_balance_details table for pay element-level brought forward amounts
CREATE TABLE public.employee_opening_balance_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opening_balance_id UUID NOT NULL REFERENCES public.employee_opening_balances(id) ON DELETE CASCADE,
  
  -- Pay element reference
  pay_element_type TEXT NOT NULL, -- 'earning', 'deduction', 'benefit', 'allowance'
  pay_element_code TEXT NOT NULL,
  pay_element_name TEXT NOT NULL,
  
  -- Amounts
  ytd_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  ytd_taxable_amount NUMERIC(15,2) DEFAULT 0,
  ytd_employer_amount NUMERIC(15,2) DEFAULT 0, -- For employer-paid portions
  
  -- Additional info
  currency TEXT DEFAULT 'JMD',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Unique constraint: one entry per pay element per opening balance
  CONSTRAINT unique_opening_balance_element UNIQUE (opening_balance_id, pay_element_code)
);

-- Create opening_balance_imports table to track bulk imports
CREATE TABLE public.opening_balance_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  import_type TEXT NOT NULL, -- 'statutory', 'earnings', 'pay_elements', 'full'
  tax_year INTEGER NOT NULL,
  
  -- Import stats
  total_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  
  -- Error tracking
  errors JSONB DEFAULT '[]',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  
  -- Audit
  imported_by UUID REFERENCES public.profiles(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_opening_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_opening_balance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_balance_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_opening_balances
CREATE POLICY "Users can view opening balances for their company"
  ON public.employee_opening_balances
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert opening balances for their company"
  ON public.employee_opening_balances
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update opening balances for their company"
  ON public.employee_opening_balances
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete opening balances for their company"
  ON public.employee_opening_balances
  FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for employee_opening_balance_details
CREATE POLICY "Users can view opening balance details"
  ON public.employee_opening_balance_details
  FOR SELECT
  USING (
    opening_balance_id IN (
      SELECT id FROM public.employee_opening_balances 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert opening balance details"
  ON public.employee_opening_balance_details
  FOR INSERT
  WITH CHECK (
    opening_balance_id IN (
      SELECT id FROM public.employee_opening_balances 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update opening balance details"
  ON public.employee_opening_balance_details
  FOR UPDATE
  USING (
    opening_balance_id IN (
      SELECT id FROM public.employee_opening_balances 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can delete opening balance details"
  ON public.employee_opening_balance_details
  FOR DELETE
  USING (
    opening_balance_id IN (
      SELECT id FROM public.employee_opening_balances 
      WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- RLS Policies for opening_balance_imports
CREATE POLICY "Users can view imports for their company"
  ON public.opening_balance_imports
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert imports for their company"
  ON public.opening_balance_imports
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update imports for their company"
  ON public.opening_balance_imports
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_employee_opening_balances_updated_at
  BEFORE UPDATE ON public.employee_opening_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_opening_balance_details_updated_at
  BEFORE UPDATE ON public.employee_opening_balance_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_opening_balances_company ON public.employee_opening_balances(company_id);
CREATE INDEX idx_opening_balances_employee ON public.employee_opening_balances(employee_id);
CREATE INDEX idx_opening_balances_tax_year ON public.employee_opening_balances(tax_year);
CREATE INDEX idx_opening_balance_details_parent ON public.employee_opening_balance_details(opening_balance_id);
CREATE INDEX idx_opening_balance_imports_company ON public.opening_balance_imports(company_id);