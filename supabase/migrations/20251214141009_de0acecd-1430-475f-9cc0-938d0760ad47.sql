
-- Unions table
CREATE TABLE public.unions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  registration_number TEXT,
  established_date DATE,
  description TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Union representatives
CREATE TABLE public.union_representatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  union_id UUID NOT NULL REFERENCES public.unions(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  representative_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Union membership tracking
CREATE TABLE public.union_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  union_id UUID NOT NULL REFERENCES public.unions(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_number TEXT,
  join_date DATE NOT NULL,
  leave_date DATE,
  status TEXT DEFAULT 'active',
  dues_amount NUMERIC,
  dues_frequency TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(union_id, employee_id)
);

-- Collective bargaining agreements
CREATE TABLE public.collective_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  union_id UUID NOT NULL REFERENCES public.unions(id) ON DELETE CASCADE,
  agreement_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active',
  terms JSONB,
  wage_provisions TEXT,
  benefits_provisions TEXT,
  working_conditions TEXT,
  dispute_resolution_clause TEXT,
  document_url TEXT,
  negotiated_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grievance procedure templates
CREATE TABLE public.grievance_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  union_id UUID REFERENCES public.unions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Grievance procedure steps
CREATE TABLE public.grievance_procedure_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  procedure_id UUID NOT NULL REFERENCES public.grievance_procedures(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  responsible_role TEXT,
  time_limit_days INTEGER,
  escalation_path TEXT,
  required_documents TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(procedure_id, step_number)
);

-- Employee grievances
CREATE TABLE public.grievances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  grievance_number TEXT,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  union_id UUID REFERENCES public.unions(id) ON DELETE SET NULL,
  procedure_id UUID REFERENCES public.grievance_procedures(id) ON DELETE SET NULL,
  current_step_id UUID REFERENCES public.grievance_procedure_steps(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  grievance_type TEXT NOT NULL,
  category TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'filed',
  filed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_resolution_date DATE,
  resolved_date DATE,
  resolution_summary TEXT,
  outcome TEXT,
  is_union_represented BOOLEAN DEFAULT false,
  union_representative_id UUID REFERENCES public.union_representatives(id),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grievance step tracking
CREATE TABLE public.grievance_step_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public.grievance_procedure_steps(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  deadline_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'in_progress',
  notes TEXT,
  action_taken TEXT,
  escalated BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  handled_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grievance documents/attachments
CREATE TABLE public.grievance_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grievance_id UUID NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  document_url TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Industrial court judgements
CREATE TABLE public.industrial_court_judgements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  case_number TEXT NOT NULL,
  case_name TEXT NOT NULL,
  court_name TEXT NOT NULL,
  judgement_date DATE NOT NULL,
  parties_involved JSONB,
  plaintiff TEXT,
  defendant TEXT,
  judge_name TEXT,
  category TEXT,
  industry TEXT,
  subject_matter TEXT[],
  summary TEXT,
  full_judgement TEXT,
  outcome TEXT NOT NULL,
  damages_awarded NUMERIC,
  currency TEXT,
  precedent_value TEXT,
  related_cases UUID[],
  keywords TEXT[],
  document_url TEXT,
  is_public BOOLEAN DEFAULT true,
  source TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_representatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collective_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_procedure_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_step_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grievance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industrial_court_judgements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for unions
CREATE POLICY "Users can view unions in their company" ON public.unions FOR SELECT USING (true);
CREATE POLICY "Admins can manage unions" ON public.unions FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for union_representatives
CREATE POLICY "Users can view union representatives" ON public.union_representatives FOR SELECT USING (true);
CREATE POLICY "Admins can manage union representatives" ON public.union_representatives FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for union_memberships
CREATE POLICY "Users can view their own membership" ON public.union_memberships FOR SELECT USING (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage memberships" ON public.union_memberships FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for collective_agreements
CREATE POLICY "Users can view collective agreements" ON public.collective_agreements FOR SELECT USING (true);
CREATE POLICY "Admins can manage collective agreements" ON public.collective_agreements FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for grievance_procedures
CREATE POLICY "Users can view grievance procedures" ON public.grievance_procedures FOR SELECT USING (true);
CREATE POLICY "Admins can manage grievance procedures" ON public.grievance_procedures FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for grievance_procedure_steps
CREATE POLICY "Users can view grievance procedure steps" ON public.grievance_procedure_steps FOR SELECT USING (true);
CREATE POLICY "Admins can manage grievance procedure steps" ON public.grievance_procedure_steps FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for grievances
CREATE POLICY "Users can view their own grievances" ON public.grievances FOR SELECT USING (employee_id = auth.uid() OR assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Users can create their own grievances" ON public.grievances FOR INSERT WITH CHECK (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can update grievances" ON public.grievances FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager') OR assigned_to = auth.uid());
CREATE POLICY "Admins can delete grievances" ON public.grievances FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for grievance_step_history
CREATE POLICY "Users can view grievance step history" ON public.grievance_step_history FOR SELECT USING (true);
CREATE POLICY "Admins can manage grievance step history" ON public.grievance_step_history FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for grievance_documents
CREATE POLICY "Users can view grievance documents" ON public.grievance_documents FOR SELECT USING (true);
CREATE POLICY "Users can upload grievance documents" ON public.grievance_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage grievance documents" ON public.grievance_documents FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS Policies for industrial_court_judgements
CREATE POLICY "Users can view public judgements" ON public.industrial_court_judgements FOR SELECT USING (is_public = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));
CREATE POLICY "Admins can manage judgements" ON public.industrial_court_judgements FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Auto-generate grievance number
CREATE OR REPLACE FUNCTION public.generate_grievance_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.grievance_number := 'GRV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_grievance_number
  BEFORE INSERT ON public.grievances
  FOR EACH ROW
  WHEN (NEW.grievance_number IS NULL)
  EXECUTE FUNCTION public.generate_grievance_number();

-- Indexes for performance
CREATE INDEX idx_unions_company ON public.unions(company_id);
CREATE INDEX idx_union_memberships_employee ON public.union_memberships(employee_id);
CREATE INDEX idx_union_memberships_union ON public.union_memberships(union_id);
CREATE INDEX idx_collective_agreements_company ON public.collective_agreements(company_id);
CREATE INDEX idx_collective_agreements_union ON public.collective_agreements(union_id);
CREATE INDEX idx_grievances_company ON public.grievances(company_id);
CREATE INDEX idx_grievances_employee ON public.grievances(employee_id);
CREATE INDEX idx_grievances_status ON public.grievances(status);
CREATE INDEX idx_industrial_court_judgements_company ON public.industrial_court_judgements(company_id);
CREATE INDEX idx_industrial_court_judgements_keywords ON public.industrial_court_judgements USING GIN(keywords);
CREATE INDEX idx_industrial_court_judgements_subject ON public.industrial_court_judgements USING GIN(subject_matter);

-- Updated at triggers
CREATE TRIGGER update_unions_updated_at BEFORE UPDATE ON public.unions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_union_representatives_updated_at BEFORE UPDATE ON public.union_representatives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_union_memberships_updated_at BEFORE UPDATE ON public.union_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collective_agreements_updated_at BEFORE UPDATE ON public.collective_agreements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grievance_procedures_updated_at BEFORE UPDATE ON public.grievance_procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grievance_procedure_steps_updated_at BEFORE UPDATE ON public.grievance_procedure_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_grievance_step_history_updated_at BEFORE UPDATE ON public.grievance_step_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_industrial_court_judgements_updated_at BEFORE UPDATE ON public.industrial_court_judgements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
