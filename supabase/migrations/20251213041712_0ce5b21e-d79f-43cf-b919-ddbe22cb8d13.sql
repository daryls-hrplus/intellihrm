-- HSE Incident Reports
CREATE TABLE public.hse_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  incident_number TEXT,
  incident_type TEXT NOT NULL, -- injury, near_miss, property_damage, environmental, fire, chemical
  severity TEXT NOT NULL DEFAULT 'low', -- low, medium, high, critical
  status TEXT NOT NULL DEFAULT 'reported', -- reported, investigating, resolved, closed
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  incident_date DATE NOT NULL,
  incident_time TIME,
  reported_by UUID REFERENCES public.profiles(id),
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  injured_employee_id UUID REFERENCES public.profiles(id),
  injury_type TEXT,
  body_part_affected TEXT,
  treatment_required TEXT, -- none, first_aid, medical_attention, hospitalization
  days_lost INTEGER DEFAULT 0,
  witnesses TEXT[],
  root_cause TEXT,
  corrective_actions TEXT,
  preventive_measures TEXT,
  investigation_lead_id UUID REFERENCES public.profiles(id),
  investigation_date DATE,
  investigation_findings TEXT,
  workflow_instance_id UUID,
  attachments JSONB DEFAULT '[]'::jsonb,
  is_recordable BOOLEAN DEFAULT false,
  is_osha_reportable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate incident number
CREATE OR REPLACE FUNCTION public.generate_incident_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(incident_number FROM 5) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM hse_incidents
  WHERE incident_number LIKE 'INC-' || year_prefix || '-%';
  NEW.incident_number := 'INC-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_incident_number_trigger
BEFORE INSERT ON public.hse_incidents
FOR EACH ROW EXECUTE FUNCTION public.generate_incident_number();

-- HSE Risk Assessments
CREATE TABLE public.hse_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  assessment_number TEXT,
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  location TEXT,
  assessed_by UUID REFERENCES public.profiles(id),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_date DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_review, approved, requires_update, archived
  overall_risk_level TEXT, -- low, medium, high, critical
  description TEXT,
  scope TEXT,
  methodology TEXT,
  recommendations TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_date DATE,
  workflow_instance_id UUID,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Generate assessment number
CREATE OR REPLACE FUNCTION public.generate_assessment_number()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(assessment_number FROM 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM hse_risk_assessments
  WHERE assessment_number LIKE 'RA-' || year_prefix || '-%';
  NEW.assessment_number := 'RA-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_assessment_number_trigger
BEFORE INSERT ON public.hse_risk_assessments
FOR EACH ROW EXECUTE FUNCTION public.generate_assessment_number();

-- Risk Assessment Hazards
CREATE TABLE public.hse_hazards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES public.hse_risk_assessments(id) ON DELETE CASCADE,
  hazard_type TEXT NOT NULL, -- physical, chemical, biological, ergonomic, psychosocial, environmental
  description TEXT NOT NULL,
  affected_persons TEXT,
  likelihood INTEGER NOT NULL DEFAULT 1, -- 1-5
  severity INTEGER NOT NULL DEFAULT 1, -- 1-5
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * severity) STORED,
  existing_controls TEXT,
  additional_controls TEXT,
  responsible_person_id UUID REFERENCES public.profiles(id),
  target_date DATE,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'identified', -- identified, controls_in_place, monitoring, closed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HSE Safety Training (separate from LMS but can link)
CREATE TABLE public.hse_safety_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  training_type TEXT NOT NULL, -- induction, refresher, specialized, certification
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  frequency_months INTEGER, -- null means one-time
  duration_hours NUMERIC,
  lms_course_id UUID, -- optional link to LMS
  applicable_departments UUID[],
  applicable_positions UUID[],
  is_active BOOLEAN DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee Safety Training Records
CREATE TABLE public.hse_training_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  training_id UUID NOT NULL REFERENCES public.hse_safety_training(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  training_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, expired, failed
  score NUMERIC,
  pass_mark NUMERIC,
  certificate_number TEXT,
  trainer_name TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HSE Compliance Requirements
CREATE TABLE public.hse_compliance_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  requirement_type TEXT NOT NULL, -- regulatory, permit, license, certification, audit
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  regulatory_body TEXT,
  reference_number TEXT,
  issue_date DATE,
  expiry_date DATE,
  renewal_lead_days INTEGER DEFAULT 30,
  responsible_person_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, pending_renewal, expired, not_applicable
  compliance_status TEXT DEFAULT 'compliant', -- compliant, non_compliant, partial, under_review
  last_audit_date DATE,
  next_audit_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Audit Records
CREATE TABLE public.hse_compliance_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requirement_id UUID NOT NULL REFERENCES public.hse_compliance_requirements(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  audit_date DATE NOT NULL,
  auditor_name TEXT,
  audit_type TEXT NOT NULL, -- internal, external, regulatory
  findings TEXT,
  compliance_rating TEXT, -- compliant, non_compliant, partial
  corrective_actions TEXT,
  due_date DATE,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, overdue
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- HSE Safety Policies
CREATE TABLE public.hse_safety_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  policy_type TEXT NOT NULL, -- general, emergency, ppe, chemical, electrical, fire, ergonomic
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  content TEXT,
  version TEXT DEFAULT '1.0',
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_date DATE,
  approved_by UUID REFERENCES public.profiles(id),
  approved_date DATE,
  owner_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'draft', -- draft, pending_approval, active, archived
  is_active BOOLEAN DEFAULT true,
  attachments JSONB DEFAULT '[]'::jsonb,
  acknowledgment_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Policy Acknowledgments
CREATE TABLE public.hse_policy_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.hse_safety_policies(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  UNIQUE(policy_id, employee_id)
);

-- HSE Inspections
CREATE TABLE public.hse_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  inspection_type TEXT NOT NULL, -- routine, unannounced, follow_up, pre_task
  title TEXT NOT NULL,
  location TEXT,
  inspector_id UUID REFERENCES public.profiles(id),
  inspection_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  overall_rating TEXT, -- satisfactory, needs_improvement, unsatisfactory
  findings TEXT,
  corrective_actions TEXT,
  follow_up_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hse_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_safety_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_safety_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_inspections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incidents
CREATE POLICY "Admins and HR can manage all incidents" ON public.hse_incidents
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view incidents in their company" ON public.hse_incidents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id = hse_incidents.company_id)
  );

CREATE POLICY "Employees can report incidents" ON public.hse_incidents
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

-- RLS Policies for risk assessments
CREATE POLICY "Admins and HR can manage risk assessments" ON public.hse_risk_assessments
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view approved assessments" ON public.hse_risk_assessments
  FOR SELECT USING (status = 'approved' AND 
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id = hse_risk_assessments.company_id)
  );

-- RLS Policies for hazards
CREATE POLICY "Admins and HR can manage hazards" ON public.hse_hazards
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view hazards" ON public.hse_hazards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hse_risk_assessments ra 
      JOIN profiles p ON p.company_id = ra.company_id 
      WHERE ra.id = hse_hazards.assessment_id AND p.id = auth.uid())
  );

-- RLS Policies for safety training
CREATE POLICY "Admins and HR can manage safety training" ON public.hse_safety_training
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view active training" ON public.hse_safety_training
  FOR SELECT USING (is_active = true);

-- RLS Policies for training records
CREATE POLICY "Admins and HR can manage training records" ON public.hse_training_records
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own training records" ON public.hse_training_records
  FOR SELECT USING (auth.uid() = employee_id);

-- RLS Policies for compliance requirements
CREATE POLICY "Admins and HR can manage compliance" ON public.hse_compliance_requirements
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view compliance requirements" ON public.hse_compliance_requirements
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id = hse_compliance_requirements.company_id)
  );

-- RLS Policies for compliance audits
CREATE POLICY "Admins and HR can manage audits" ON public.hse_compliance_audits
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view audits" ON public.hse_compliance_audits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id = hse_compliance_audits.company_id)
  );

-- RLS Policies for safety policies
CREATE POLICY "Admins and HR can manage safety policies" ON public.hse_safety_policies
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view active policies" ON public.hse_safety_policies
  FOR SELECT USING (is_active = true AND status = 'active');

-- RLS Policies for policy acknowledgments
CREATE POLICY "Admins can view all acknowledgments" ON public.hse_policy_acknowledgments
  FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can manage own acknowledgments" ON public.hse_policy_acknowledgments
  FOR ALL USING (auth.uid() = employee_id);

-- RLS Policies for inspections
CREATE POLICY "Admins and HR can manage inspections" ON public.hse_inspections
  FOR ALL USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view inspections" ON public.hse_inspections
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.company_id = hse_inspections.company_id)
  );

-- Updated at triggers
CREATE TRIGGER update_hse_incidents_updated_at BEFORE UPDATE ON public.hse_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_risk_assessments_updated_at BEFORE UPDATE ON public.hse_risk_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_hazards_updated_at BEFORE UPDATE ON public.hse_hazards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_safety_training_updated_at BEFORE UPDATE ON public.hse_safety_training FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_training_records_updated_at BEFORE UPDATE ON public.hse_training_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_compliance_requirements_updated_at BEFORE UPDATE ON public.hse_compliance_requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_compliance_audits_updated_at BEFORE UPDATE ON public.hse_compliance_audits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_safety_policies_updated_at BEFORE UPDATE ON public.hse_safety_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_inspections_updated_at BEFORE UPDATE ON public.hse_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();