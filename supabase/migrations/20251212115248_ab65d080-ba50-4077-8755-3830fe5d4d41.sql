-- Benefit Categories (Health, Retirement, Life, Wellness)
CREATE TABLE public.benefit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category_type TEXT NOT NULL CHECK (category_type IN ('health', 'retirement', 'life_disability', 'wellness')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Benefit Plans
CREATE TABLE public.benefit_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.benefit_categories(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL, -- e.g., 'medical', 'dental', 'vision', '401k', 'life', 'gym', etc.
  provider_name TEXT,
  provider_contact TEXT,
  coverage_details JSONB DEFAULT '{}'::jsonb,
  enrollment_type TEXT NOT NULL DEFAULT 'open' CHECK (enrollment_type IN ('open', 'auto', 'both')),
  auto_enrollment_criteria JSONB, -- position/grade conditions for auto-enrollment
  employee_contribution NUMERIC(12,2) DEFAULT 0,
  employer_contribution NUMERIC(12,2) DEFAULT 0,
  contribution_frequency TEXT DEFAULT 'monthly',
  currency TEXT DEFAULT 'USD',
  waiting_period_days INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Benefit Enrollment Periods
CREATE TABLE public.benefit_enrollment_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  enrollment_type TEXT NOT NULL DEFAULT 'annual' CHECK (enrollment_type IN ('annual', 'new_hire', 'life_event', 'special')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee Benefit Enrollments
CREATE TABLE public.benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  enrollment_period_id UUID REFERENCES public.benefit_enrollment_periods(id),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_date DATE NOT NULL,
  termination_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'terminated', 'cancelled', 'waived')),
  enrollment_source TEXT NOT NULL DEFAULT 'open' CHECK (enrollment_source IN ('open', 'auto', 'life_event', 'new_hire')),
  coverage_level TEXT DEFAULT 'employee', -- employee, employee+spouse, family, etc.
  covered_dependents JSONB DEFAULT '[]'::jsonb,
  employee_contribution NUMERIC(12,2),
  employer_contribution NUMERIC(12,2),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Benefit Dependents (who is covered under employee's plan)
CREATE TABLE public.benefit_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.benefit_enrollments(id) ON DELETE CASCADE,
  dependent_id UUID REFERENCES public.employee_dependents(id),
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  ssn_last_four TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Benefit Claims (for tracking claims/reimbursements)
CREATE TABLE public.benefit_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.benefit_enrollments(id),
  claim_number TEXT UNIQUE,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_date DATE NOT NULL,
  claim_type TEXT NOT NULL,
  description TEXT,
  amount_claimed NUMERIC(12,2) NOT NULL,
  amount_approved NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'processing', 'approved', 'denied', 'paid')),
  provider_name TEXT,
  supporting_documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.benefit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_enrollment_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for benefit_categories
CREATE POLICY "Authenticated users can view benefit categories" ON public.benefit_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage benefit categories" ON public.benefit_categories FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for benefit_plans
CREATE POLICY "Authenticated users can view benefit plans" ON public.benefit_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage benefit plans" ON public.benefit_plans FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for enrollment_periods
CREATE POLICY "Authenticated users can view enrollment periods" ON public.benefit_enrollment_periods FOR SELECT USING (true);
CREATE POLICY "Admins can manage enrollment periods" ON public.benefit_enrollment_periods FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for enrollments
CREATE POLICY "Users can view own enrollments" ON public.benefit_enrollments FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Admins can view all enrollments" ON public.benefit_enrollments FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can create own enrollments" ON public.benefit_enrollments FOR INSERT WITH CHECK (auth.uid() = employee_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage all enrollments" ON public.benefit_enrollments FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for dependents
CREATE POLICY "Users can view own benefit dependents" ON public.benefit_dependents FOR SELECT USING (EXISTS (SELECT 1 FROM benefit_enrollments e WHERE e.id = enrollment_id AND e.employee_id = auth.uid()));
CREATE POLICY "Admins can view all benefit dependents" ON public.benefit_dependents FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can manage own benefit dependents" ON public.benefit_dependents FOR ALL USING (EXISTS (SELECT 1 FROM benefit_enrollments e WHERE e.id = enrollment_id AND e.employee_id = auth.uid()) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for claims
CREATE POLICY "Users can view own claims" ON public.benefit_claims FOR SELECT USING (EXISTS (SELECT 1 FROM benefit_enrollments e WHERE e.id = enrollment_id AND e.employee_id = auth.uid()));
CREATE POLICY "Admins can view all claims" ON public.benefit_claims FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can create own claims" ON public.benefit_claims FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM benefit_enrollments e WHERE e.id = enrollment_id AND e.employee_id = auth.uid()) OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage all claims" ON public.benefit_claims FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

-- Triggers for updated_at
CREATE TRIGGER update_benefit_categories_updated_at BEFORE UPDATE ON public.benefit_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefit_plans_updated_at BEFORE UPDATE ON public.benefit_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefit_enrollment_periods_updated_at BEFORE UPDATE ON public.benefit_enrollment_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefit_enrollments_updated_at BEFORE UPDATE ON public.benefit_enrollments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefit_dependents_updated_at BEFORE UPDATE ON public.benefit_dependents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_benefit_claims_updated_at BEFORE UPDATE ON public.benefit_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate claim numbers
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM 5) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM benefit_claims
  WHERE claim_number LIKE 'CLM-' || year_prefix || '-%';
  
  NEW.claim_number := 'CLM-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_claim_number_trigger BEFORE INSERT ON public.benefit_claims FOR EACH ROW EXECUTE FUNCTION generate_claim_number();