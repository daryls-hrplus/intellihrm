
-- Leave Policy Acknowledgment Tracking
CREATE TABLE public.leave_policy_acknowledgments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL,
  policy_id UUID,
  policy_name TEXT NOT NULL,
  policy_version INTEGER NOT NULL DEFAULT 1,
  acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  signature_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical Certificate Verification Workflow
CREATE TABLE public.medical_certificate_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  leave_request_id UUID NOT NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  certificate_url TEXT,
  certificate_file_name TEXT,
  issuing_doctor TEXT,
  medical_facility TEXT,
  issue_date DATE,
  valid_from DATE,
  valid_to DATE,
  diagnosis_code TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  rejection_reason TEXT,
  followup_required BOOLEAN DEFAULT false,
  followup_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bradford Factor Analysis
CREATE TABLE public.employee_bradford_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  calculation_period_start DATE NOT NULL,
  calculation_period_end DATE NOT NULL,
  total_absence_spells INTEGER NOT NULL DEFAULT 0,
  total_absence_days INTEGER NOT NULL DEFAULT 0,
  bradford_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'low',
  trend TEXT,
  previous_score INTEGER,
  notes TEXT,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  calculated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bradford Factor Thresholds Configuration
CREATE TABLE public.bradford_factor_thresholds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  threshold_name TEXT NOT NULL,
  min_score INTEGER NOT NULL,
  max_score INTEGER,
  risk_level TEXT NOT NULL,
  action_required TEXT,
  notification_recipients TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave Policy Version History
CREATE TABLE public.leave_policy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  policy_type TEXT NOT NULL,
  policy_id UUID NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  policy_name TEXT NOT NULL,
  policy_data JSONB NOT NULL,
  change_summary TEXT,
  change_type TEXT NOT NULL,
  effective_from DATE,
  effective_to DATE,
  changed_by UUID REFERENCES public.profiles(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approval_required BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_policy_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_certificate_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bradford_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bradford_factor_thresholds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policy_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_policy_acknowledgments
CREATE POLICY "Users can view own acknowledgments" ON public.leave_policy_acknowledgments
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can view all acknowledgments" ON public.leave_policy_acknowledgments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );
CREATE POLICY "Users can create own acknowledgments" ON public.leave_policy_acknowledgments
  FOR INSERT WITH CHECK (auth.uid() = employee_id);

-- RLS Policies for medical_certificate_verifications
CREATE POLICY "Users can view own certificates" ON public.medical_certificate_verifications
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can manage all certificates" ON public.medical_certificate_verifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for employee_bradford_scores
CREATE POLICY "Users can view own bradford scores" ON public.employee_bradford_scores
  FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "HR can manage bradford scores" ON public.employee_bradford_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for bradford_factor_thresholds
CREATE POLICY "HR can manage thresholds" ON public.bradford_factor_thresholds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- RLS Policies for leave_policy_versions
CREATE POLICY "HR can view policy versions" ON public.leave_policy_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );
CREATE POLICY "HR can create policy versions" ON public.leave_policy_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')
    )
  );

-- Indexes
CREATE INDEX idx_acknowledgments_employee ON public.leave_policy_acknowledgments(employee_id);
CREATE INDEX idx_acknowledgments_company ON public.leave_policy_acknowledgments(company_id);
CREATE INDEX idx_medical_certs_leave_request ON public.medical_certificate_verifications(leave_request_id);
CREATE INDEX idx_medical_certs_status ON public.medical_certificate_verifications(verification_status);
CREATE INDEX idx_bradford_employee_period ON public.employee_bradford_scores(employee_id, calculation_period_start);
CREATE INDEX idx_policy_versions_policy ON public.leave_policy_versions(policy_type, policy_id);
