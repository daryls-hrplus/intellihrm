-- ==========================================
-- 1. TIMESHEET ENTRIES TABLE (for project-based time logging)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.timesheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id),
  task_id UUID REFERENCES public.project_tasks(id),
  entry_date DATE NOT NULL,
  hours_worked NUMERIC(5,2) NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
  description TEXT,
  billable BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 2. EXPENSE CLAIMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.expense_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT UNIQUE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending_approval', 'approved', 'rejected', 'paid')),
  description TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  paid_at TIMESTAMPTZ,
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. EXPENSE CLAIM ITEMS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.expense_claim_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.expense_claims(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  receipt_url TEXT,
  is_billable BOOLEAN DEFAULT false,
  project_id UUID REFERENCES public.projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. COMPANY ANNOUNCEMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.company_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  publish_at TIMESTAMPTZ DEFAULT now(),
  expire_at TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'department', 'role')),
  target_departments UUID[],
  target_roles TEXT[],
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. APPROVAL DELEGATIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.approval_delegations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delegator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  workflow_types TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT no_self_delegation CHECK (delegator_id != delegate_id)
);

-- ==========================================
-- 6. EMPLOYEE MILESTONES TABLE (birthdays, anniversaries)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.employee_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('birthday', 'work_anniversary', 'promotion', 'custom')),
  milestone_date DATE NOT NULL,
  years_of_service INTEGER,
  title TEXT,
  description TEXT,
  is_celebrated BOOLEAN DEFAULT false,
  celebrated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 7. TEAM CALENDAR EVENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.team_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  employee_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('leave', 'meeting', 'training', 'holiday', 'out_of_office', 'remote', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  all_day BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  is_private BOOLEAN DEFAULT false,
  source_id UUID,
  source_type TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 8. DOCUMENT REPOSITORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.company_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  version TEXT DEFAULT '1.0',
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Auto-generate expense claim number
CREATE OR REPLACE FUNCTION public.generate_expense_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.claim_number := 'EXP-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_expense_claim_number
  BEFORE INSERT ON public.expense_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_expense_claim_number();

-- Update timestamps
CREATE TRIGGER update_timesheet_entries_updated_at BEFORE UPDATE ON public.timesheet_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expense_claims_updated_at BEFORE UPDATE ON public.expense_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expense_claim_items_updated_at BEFORE UPDATE ON public.expense_claim_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_announcements_updated_at BEFORE UPDATE ON public.company_announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_approval_delegations_updated_at BEFORE UPDATE ON public.approval_delegations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_milestones_updated_at BEFORE UPDATE ON public.employee_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_calendar_events_updated_at BEFORE UPDATE ON public.team_calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_documents_updated_at BEFORE UPDATE ON public.company_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- RLS POLICIES
-- ==========================================

ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- Timesheet entries
CREATE POLICY "Employees can view own timesheet entries" ON public.timesheet_entries FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can create own timesheet entries" ON public.timesheet_entries FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Employees can update own timesheet entries" ON public.timesheet_entries FOR UPDATE USING (employee_id = auth.uid() AND status = 'draft');
CREATE POLICY "Admins can manage all timesheet entries" ON public.timesheet_entries FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Expense claims
CREATE POLICY "Employees can view own expense claims" ON public.expense_claims FOR SELECT USING (employee_id = auth.uid());
CREATE POLICY "Employees can create own expense claims" ON public.expense_claims FOR INSERT WITH CHECK (employee_id = auth.uid());
CREATE POLICY "Employees can update own draft claims" ON public.expense_claims FOR UPDATE USING (employee_id = auth.uid() AND status = 'draft');
CREATE POLICY "Admins can manage all expense claims" ON public.expense_claims FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Expense claim items
CREATE POLICY "Employees can view own claim items" ON public.expense_claim_items FOR SELECT USING (EXISTS (SELECT 1 FROM expense_claims ec WHERE ec.id = claim_id AND ec.employee_id = auth.uid()));
CREATE POLICY "Employees can create own claim items" ON public.expense_claim_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM expense_claims ec WHERE ec.id = claim_id AND ec.employee_id = auth.uid()));
CREATE POLICY "Employees can update own claim items" ON public.expense_claim_items FOR UPDATE USING (EXISTS (SELECT 1 FROM expense_claims ec WHERE ec.id = claim_id AND ec.employee_id = auth.uid() AND ec.status = 'draft'));
CREATE POLICY "Employees can delete own claim items" ON public.expense_claim_items FOR DELETE USING (EXISTS (SELECT 1 FROM expense_claims ec WHERE ec.id = claim_id AND ec.employee_id = auth.uid() AND ec.status = 'draft'));
CREATE POLICY "Admins can manage all claim items" ON public.expense_claim_items FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Company announcements
CREATE POLICY "Everyone can view active announcements" ON public.company_announcements FOR SELECT USING (is_active = true AND (publish_at IS NULL OR publish_at <= now()) AND (expire_at IS NULL OR expire_at >= now()));
CREATE POLICY "Admins can manage announcements" ON public.company_announcements FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Approval delegations
CREATE POLICY "Users can view own delegations" ON public.approval_delegations FOR SELECT USING (delegator_id = auth.uid() OR delegate_id = auth.uid());
CREATE POLICY "Users can create own delegations" ON public.approval_delegations FOR INSERT WITH CHECK (delegator_id = auth.uid());
CREATE POLICY "Users can update own delegations" ON public.approval_delegations FOR UPDATE USING (delegator_id = auth.uid());
CREATE POLICY "Users can delete own delegations" ON public.approval_delegations FOR DELETE USING (delegator_id = auth.uid());
CREATE POLICY "Admins can manage all delegations" ON public.approval_delegations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Employee milestones
CREATE POLICY "Employees can view all milestones" ON public.employee_milestones FOR SELECT USING (true);
CREATE POLICY "Admins can manage milestones" ON public.employee_milestones FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Team calendar events
CREATE POLICY "Employees can view calendar events" ON public.team_calendar_events FOR SELECT USING (is_private = false OR employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can create own events" ON public.team_calendar_events FOR INSERT WITH CHECK (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can update own events" ON public.team_calendar_events FOR UPDATE USING (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can delete own events" ON public.team_calendar_events FOR DELETE USING (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Company documents
CREATE POLICY "Employees can view public documents" ON public.company_documents FOR SELECT USING (is_public = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage documents" ON public.company_documents FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_timesheet_entries_employee ON public.timesheet_entries(employee_id);
CREATE INDEX idx_timesheet_entries_date ON public.timesheet_entries(entry_date);
CREATE INDEX idx_expense_claims_employee ON public.expense_claims(employee_id);
CREATE INDEX idx_expense_claims_status ON public.expense_claims(status);
CREATE INDEX idx_company_announcements_active ON public.company_announcements(is_active, publish_at);
CREATE INDEX idx_approval_delegations_dates ON public.approval_delegations(start_date, end_date);
CREATE INDEX idx_employee_milestones_date ON public.employee_milestones(milestone_date);
CREATE INDEX idx_team_calendar_events_dates ON public.team_calendar_events(start_date, end_date);
CREATE INDEX idx_company_documents_category ON public.company_documents(category);