-- Workers' Compensation Claims
CREATE TABLE public.hse_workers_comp_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id),
  claim_number TEXT NOT NULL,
  incident_id UUID REFERENCES public.hse_incidents(id),
  injury_date DATE NOT NULL,
  injury_description TEXT,
  body_parts_affected TEXT[],
  claim_status TEXT NOT NULL DEFAULT 'filed',
  claim_filed_date DATE,
  insurance_carrier TEXT,
  insurance_claim_number TEXT,
  total_medical_costs NUMERIC(12,2) DEFAULT 0,
  total_wage_replacement NUMERIC(12,2) DEFAULT 0,
  days_lost INTEGER DEFAULT 0,
  return_to_work_date DATE,
  return_to_work_status TEXT,
  restrictions TEXT,
  treating_physician TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PPE Management
CREATE TABLE public.hse_ppe_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  inspection_frequency_days INTEGER,
  replacement_frequency_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_ppe_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  ppe_type_id UUID NOT NULL REFERENCES public.hse_ppe_types(id),
  serial_number TEXT,
  location TEXT,
  quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good',
  purchase_date DATE,
  expiry_date DATE,
  last_inspection_date DATE,
  next_inspection_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_ppe_issuances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  ppe_inventory_id UUID REFERENCES public.hse_ppe_inventory(id),
  ppe_type_id UUID NOT NULL REFERENCES public.hse_ppe_types(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  issued_date DATE NOT NULL,
  issued_by UUID REFERENCES public.profiles(id),
  quantity INTEGER DEFAULT 1,
  returned_date DATE,
  condition_on_return TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workplace Inspection Templates (inspections table already exists)
CREATE TABLE public.hse_inspection_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  checklist_items JSONB DEFAULT '[]',
  frequency TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_inspection_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.hse_inspections(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  corrective_action TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'open',
  photos JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emergency Response Plans
CREATE TABLE public.hse_emergency_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  emergency_type TEXT NOT NULL,
  description TEXT,
  procedures TEXT,
  evacuation_routes TEXT,
  assembly_points TEXT,
  emergency_contacts JSONB DEFAULT '[]',
  equipment_locations JSONB DEFAULT '[]',
  version TEXT DEFAULT '1.0',
  effective_date DATE,
  review_date DATE,
  status TEXT DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_emergency_drills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.hse_emergency_plans(id),
  drill_type TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  actual_date TIMESTAMPTZ,
  location TEXT,
  coordinator_id UUID REFERENCES public.profiles(id),
  participants_count INTEGER,
  evacuation_time_seconds INTEGER,
  status TEXT DEFAULT 'scheduled',
  observations TEXT,
  improvements TEXT,
  rating TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SDS/Chemical Management
CREATE TABLE public.hse_chemicals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  chemical_name TEXT NOT NULL,
  cas_number TEXT,
  manufacturer TEXT,
  product_identifier TEXT,
  hazard_classification TEXT[],
  ghs_pictograms TEXT[],
  signal_word TEXT,
  hazard_statements TEXT[],
  precautionary_statements TEXT[],
  storage_requirements TEXT,
  ppe_required TEXT[],
  first_aid_measures TEXT,
  firefighting_measures TEXT,
  spill_procedures TEXT,
  disposal_methods TEXT,
  sds_document_url TEXT,
  sds_date DATE,
  sds_expiry_date DATE,
  location TEXT,
  quantity_on_hand NUMERIC(12,3),
  quantity_unit TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_chemical_exposures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  chemical_id UUID NOT NULL REFERENCES public.hse_chemicals(id),
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  exposure_date TIMESTAMPTZ NOT NULL,
  exposure_type TEXT NOT NULL,
  duration_minutes INTEGER,
  exposure_level TEXT,
  symptoms TEXT,
  treatment_provided TEXT,
  reported_by UUID REFERENCES public.profiles(id),
  incident_id UUID REFERENCES public.hse_incidents(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- OSHA Reporting
CREATE TABLE public.hse_osha_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  log_year INTEGER NOT NULL,
  establishment_name TEXT,
  establishment_address TEXT,
  industry_description TEXT,
  naics_code TEXT,
  annual_average_employees INTEGER,
  total_hours_worked NUMERIC(12,0),
  total_deaths INTEGER DEFAULT 0,
  total_days_away INTEGER DEFAULT 0,
  total_job_transfer INTEGER DEFAULT 0,
  total_other_recordable INTEGER DEFAULT 0,
  injury_cases JSONB DEFAULT '[]',
  illness_cases JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  submitted_date DATE,
  certified_by UUID REFERENCES public.profiles(id),
  certification_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, log_year)
);

-- Permit to Work
CREATE TABLE public.hse_permit_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  required_precautions JSONB DEFAULT '[]',
  required_ppe TEXT[],
  required_approvers TEXT[],
  max_duration_hours INTEGER,
  requires_isolation BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_work_permits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  permit_type_id UUID NOT NULL REFERENCES public.hse_permit_types(id),
  permit_number TEXT NOT NULL,
  work_description TEXT NOT NULL,
  location TEXT NOT NULL,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  contractor_name TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  actual_end_datetime TIMESTAMPTZ,
  hazards_identified TEXT[],
  precautions_taken JSONB DEFAULT '[]',
  isolation_points JSONB DEFAULT '[]',
  ppe_required TEXT[],
  status TEXT NOT NULL DEFAULT 'requested',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  closed_by UUID REFERENCES public.profiles(id),
  closed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lock-out/Tag-out (LOTO)
CREATE TABLE public.hse_loto_procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  equipment_name TEXT NOT NULL,
  equipment_id TEXT,
  location TEXT,
  energy_sources JSONB NOT NULL DEFAULT '[]',
  isolation_steps JSONB NOT NULL DEFAULT '[]',
  verification_steps JSONB DEFAULT '[]',
  release_steps JSONB DEFAULT '[]',
  authorized_personnel UUID[],
  last_reviewed_date DATE,
  next_review_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_loto_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES public.hse_loto_procedures(id),
  application_number TEXT NOT NULL,
  work_description TEXT NOT NULL,
  applied_by UUID NOT NULL REFERENCES public.profiles(id),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lock_number TEXT,
  tag_number TEXT,
  isolation_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'applied',
  released_by UUID REFERENCES public.profiles(id),
  released_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Near-Miss Reporting
CREATE TABLE public.hse_near_misses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  report_number TEXT NOT NULL,
  reported_by UUID NOT NULL REFERENCES public.profiles(id),
  report_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  occurrence_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  description TEXT NOT NULL,
  potential_consequence TEXT,
  potential_severity TEXT,
  hazard_type TEXT,
  immediate_actions TEXT,
  root_cause TEXT,
  corrective_actions TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'reported',
  closed_date DATE,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safety Observations
CREATE TABLE public.hse_safety_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  observation_number TEXT NOT NULL,
  observer_id UUID NOT NULL REFERENCES public.profiles(id),
  observation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT,
  department_id UUID REFERENCES public.departments(id),
  observation_type TEXT NOT NULL,
  category TEXT,
  description TEXT NOT NULL,
  behavior_observed TEXT,
  is_positive BOOLEAN DEFAULT true,
  employee_observed UUID REFERENCES public.profiles(id),
  feedback_given BOOLEAN DEFAULT false,
  corrective_action TEXT,
  recognition_given BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'recorded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Toolbox Talks/Safety Meetings
CREATE TABLE public.hse_safety_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  meeting_number TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  description TEXT,
  scheduled_date TIMESTAMPTZ NOT NULL,
  actual_date TIMESTAMPTZ,
  duration_minutes INTEGER,
  location TEXT,
  department_id UUID REFERENCES public.departments(id),
  facilitator_id UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'scheduled',
  attendees_count INTEGER,
  materials_url TEXT,
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_meeting_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.hse_safety_meetings(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  attended BOOLEAN DEFAULT true,
  signed_at TIMESTAMPTZ,
  signature_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, employee_id)
);

-- First Aid/Medical Treatment
CREATE TABLE public.hse_first_aid_kits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  kit_number TEXT NOT NULL,
  location TEXT NOT NULL,
  kit_type TEXT,
  responsible_person UUID REFERENCES public.profiles(id),
  last_inspection_date DATE,
  next_inspection_date DATE,
  contents JSONB DEFAULT '[]',
  status TEXT DEFAULT 'adequate',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.hse_medical_treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  incident_id UUID REFERENCES public.hse_incidents(id),
  treatment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  treatment_type TEXT NOT NULL,
  injury_description TEXT,
  treatment_provided TEXT NOT NULL,
  treated_by UUID REFERENCES public.profiles(id),
  first_aid_kit_id UUID REFERENCES public.hse_first_aid_kits(id),
  supplies_used JSONB DEFAULT '[]',
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  referred_to_physician BOOLEAN DEFAULT false,
  physician_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ergonomics Assessments
CREATE TABLE public.hse_ergonomic_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  assessment_number TEXT NOT NULL,
  assessment_date DATE NOT NULL,
  assessor_id UUID REFERENCES public.profiles(id),
  workstation_type TEXT,
  location TEXT,
  assessment_type TEXT NOT NULL,
  findings JSONB DEFAULT '[]',
  risk_factors TEXT[],
  overall_risk_level TEXT,
  recommendations JSONB DEFAULT '[]',
  equipment_needed JSONB DEFAULT '[]',
  status TEXT DEFAULT 'completed',
  follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.hse_workers_comp_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_ppe_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_ppe_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_ppe_issuances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_inspection_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_emergency_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_chemical_exposures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_osha_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_permit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_work_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_loto_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_loto_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_near_misses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_safety_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_safety_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_meeting_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_first_aid_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_medical_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hse_ergonomic_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated access to hse_workers_comp_claims" ON public.hse_workers_comp_claims FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_ppe_types" ON public.hse_ppe_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_ppe_inventory" ON public.hse_ppe_inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_ppe_issuances" ON public.hse_ppe_issuances FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_inspection_templates" ON public.hse_inspection_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_inspection_findings" ON public.hse_inspection_findings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_emergency_plans" ON public.hse_emergency_plans FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_emergency_drills" ON public.hse_emergency_drills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_chemicals" ON public.hse_chemicals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_chemical_exposures" ON public.hse_chemical_exposures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_osha_logs" ON public.hse_osha_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_permit_types" ON public.hse_permit_types FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_work_permits" ON public.hse_work_permits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_loto_procedures" ON public.hse_loto_procedures FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_loto_applications" ON public.hse_loto_applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_near_misses" ON public.hse_near_misses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_safety_observations" ON public.hse_safety_observations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_safety_meetings" ON public.hse_safety_meetings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_meeting_attendance" ON public.hse_meeting_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_first_aid_kits" ON public.hse_first_aid_kits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_medical_treatments" ON public.hse_medical_treatments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access to hse_ergonomic_assessments" ON public.hse_ergonomic_assessments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Update triggers
CREATE TRIGGER update_hse_workers_comp_claims_updated_at BEFORE UPDATE ON public.hse_workers_comp_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_ppe_types_updated_at BEFORE UPDATE ON public.hse_ppe_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_ppe_inventory_updated_at BEFORE UPDATE ON public.hse_ppe_inventory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_ppe_issuances_updated_at BEFORE UPDATE ON public.hse_ppe_issuances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_inspection_templates_updated_at BEFORE UPDATE ON public.hse_inspection_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_inspection_findings_updated_at BEFORE UPDATE ON public.hse_inspection_findings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_emergency_plans_updated_at BEFORE UPDATE ON public.hse_emergency_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_emergency_drills_updated_at BEFORE UPDATE ON public.hse_emergency_drills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_chemicals_updated_at BEFORE UPDATE ON public.hse_chemicals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_chemical_exposures_updated_at BEFORE UPDATE ON public.hse_chemical_exposures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_osha_logs_updated_at BEFORE UPDATE ON public.hse_osha_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_permit_types_updated_at BEFORE UPDATE ON public.hse_permit_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_work_permits_updated_at BEFORE UPDATE ON public.hse_work_permits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_loto_procedures_updated_at BEFORE UPDATE ON public.hse_loto_procedures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_loto_applications_updated_at BEFORE UPDATE ON public.hse_loto_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_near_misses_updated_at BEFORE UPDATE ON public.hse_near_misses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_safety_observations_updated_at BEFORE UPDATE ON public.hse_safety_observations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_safety_meetings_updated_at BEFORE UPDATE ON public.hse_safety_meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_first_aid_kits_updated_at BEFORE UPDATE ON public.hse_first_aid_kits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_medical_treatments_updated_at BEFORE UPDATE ON public.hse_medical_treatments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hse_ergonomic_assessments_updated_at BEFORE UPDATE ON public.hse_ergonomic_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate numbers function
CREATE OR REPLACE FUNCTION public.generate_hse_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
DECLARE
  prefix TEXT;
  table_name TEXT;
BEGIN
  table_name := TG_TABLE_NAME;
  CASE table_name
    WHEN 'hse_workers_comp_claims' THEN prefix := 'WC';
    WHEN 'hse_near_misses' THEN prefix := 'NM';
    WHEN 'hse_safety_observations' THEN prefix := 'SO';
    WHEN 'hse_safety_meetings' THEN prefix := 'SM';
    WHEN 'hse_work_permits' THEN prefix := 'WP';
    WHEN 'hse_loto_applications' THEN prefix := 'LOTO';
    WHEN 'hse_ergonomic_assessments' THEN prefix := 'ERG';
    ELSE prefix := 'HSE';
  END CASE;
  
  IF table_name = 'hse_workers_comp_claims' THEN
    NEW.claim_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSIF table_name = 'hse_near_misses' THEN
    NEW.report_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSIF table_name = 'hse_safety_observations' THEN
    NEW.observation_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSIF table_name = 'hse_safety_meetings' THEN
    NEW.meeting_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSIF table_name = 'hse_work_permits' THEN
    NEW.permit_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSIF table_name = 'hse_loto_applications' THEN
    NEW.application_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ELSIF table_name = 'hse_ergonomic_assessments' THEN
    NEW.assessment_number := prefix || '-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE TRIGGER generate_workers_comp_claim_number BEFORE INSERT ON public.hse_workers_comp_claims FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();
CREATE TRIGGER generate_near_miss_number BEFORE INSERT ON public.hse_near_misses FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();
CREATE TRIGGER generate_safety_observation_number BEFORE INSERT ON public.hse_safety_observations FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();
CREATE TRIGGER generate_safety_meeting_number BEFORE INSERT ON public.hse_safety_meetings FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();
CREATE TRIGGER generate_work_permit_number BEFORE INSERT ON public.hse_work_permits FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();
CREATE TRIGGER generate_loto_application_number BEFORE INSERT ON public.hse_loto_applications FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();
CREATE TRIGGER generate_ergonomic_assessment_number BEFORE INSERT ON public.hse_ergonomic_assessments FOR EACH ROW EXECUTE FUNCTION public.generate_hse_number();