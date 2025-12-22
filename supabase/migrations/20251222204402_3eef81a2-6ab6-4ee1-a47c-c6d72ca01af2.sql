-- =====================================================
-- Professional Information Feature - Database Schema
-- =====================================================

-- 1. Create employee_agreements table
CREATE TABLE public.employee_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  agreement_type TEXT NOT NULL,
  agreement_name TEXT NOT NULL,
  version TEXT,
  issued_date DATE,
  signed_date DATE,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  signature_status TEXT DEFAULT 'pending' CHECK (signature_status IN ('pending', 'signed', 'acknowledged', 'declined', 'expired')),
  signature_method TEXT DEFAULT 'electronic' CHECK (signature_method IN ('electronic', 'wet_ink', 'verbal', 'not_required')),
  document_url TEXT,
  signatory_name TEXT,
  witness_name TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create employee_work_history table (external work history, not internal position history)
CREATE TABLE public.employee_work_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  employer_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT,
  industry TEXT,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary', 'seasonal')),
  reason_for_leaving TEXT,
  responsibilities TEXT,
  achievements TEXT,
  salary_range TEXT,
  supervisor_name TEXT,
  supervisor_contact TEXT,
  can_contact_employer BOOLEAN DEFAULT true,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verification_date TIMESTAMPTZ,
  verification_notes TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Add soft delete columns to existing tables
ALTER TABLE public.employee_background_checks 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.employee_memberships 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.employee_references 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.employee_certificates 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.employee_licenses 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.employee_work_permits 
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES public.profiles(id);

-- 4. Enable RLS on new tables
ALTER TABLE public.employee_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_history ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for employee_agreements
CREATE POLICY "Users can view own agreements"
  ON public.employee_agreements FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "HR can view all agreements"
  ON public.employee_agreements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'System Administrator', 'HR Administrator')
    )
  );

CREATE POLICY "Users can sign own agreements"
  ON public.employee_agreements FOR UPDATE
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "HR can manage all agreements"
  ON public.employee_agreements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'System Administrator', 'HR Administrator')
    )
  );

-- 6. RLS Policies for employee_work_history
CREATE POLICY "Users can view own work history"
  ON public.employee_work_history FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Users can manage own work history"
  ON public.employee_work_history FOR ALL
  USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "HR can view all work history"
  ON public.employee_work_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'System Administrator', 'HR Administrator')
    )
  );

CREATE POLICY "HR can manage all work history"
  ON public.employee_work_history FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'hr_manager', 'System Administrator', 'HR Administrator')
    )
  );

-- 7. Create indexes for performance
CREATE INDEX idx_employee_agreements_employee_id ON public.employee_agreements(employee_id);
CREATE INDEX idx_employee_agreements_status ON public.employee_agreements(signature_status);
CREATE INDEX idx_employee_agreements_archived ON public.employee_agreements(is_archived) WHERE is_archived = false;

CREATE INDEX idx_employee_work_history_employee_id ON public.employee_work_history(employee_id);
CREATE INDEX idx_employee_work_history_archived ON public.employee_work_history(is_archived) WHERE is_archived = false;

-- 8. Add updated_at triggers
CREATE TRIGGER update_employee_agreements_updated_at
  BEFORE UPDATE ON public.employee_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_work_history_updated_at
  BEFORE UPDATE ON public.employee_work_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();