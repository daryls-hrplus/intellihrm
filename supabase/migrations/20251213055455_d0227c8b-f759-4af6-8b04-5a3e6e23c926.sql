
-- Nine Box Assessments table
CREATE TABLE public.nine_box_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assessed_by UUID REFERENCES public.profiles(id),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  performance_rating INTEGER NOT NULL CHECK (performance_rating BETWEEN 1 AND 3),
  potential_rating INTEGER NOT NULL CHECK (potential_rating BETWEEN 1 AND 3),
  performance_notes TEXT,
  potential_notes TEXT,
  overall_notes TEXT,
  assessment_period TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Talent Pools table
CREATE TABLE public.talent_pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  pool_type TEXT NOT NULL DEFAULT 'high_potential',
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Talent Pool Members table
CREATE TABLE public.talent_pool_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.talent_pools(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pool_id, employee_id)
);

-- Succession Plans table
CREATE TABLE public.succession_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  description TEXT,
  risk_level TEXT NOT NULL DEFAULT 'medium',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'active',
  target_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Succession Candidates table
CREATE TABLE public.succession_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.succession_plans(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  readiness_level TEXT NOT NULL DEFAULT 'developing',
  readiness_timeline TEXT,
  strengths TEXT,
  development_areas TEXT,
  ranking INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  nominated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plan_id, employee_id)
);

-- Succession Development Plans table
CREATE TABLE public.succession_development_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID NOT NULL REFERENCES public.succession_candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  development_type TEXT NOT NULL DEFAULT 'training',
  target_date DATE,
  completion_date DATE,
  status TEXT NOT NULL DEFAULT 'not_started',
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Key Position Risk Assessment table
CREATE TABLE public.key_position_risks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  is_key_position BOOLEAN NOT NULL DEFAULT true,
  criticality_level TEXT NOT NULL DEFAULT 'high',
  vacancy_risk TEXT NOT NULL DEFAULT 'medium',
  impact_if_vacant TEXT,
  current_incumbent_id UUID REFERENCES public.profiles(id),
  retirement_risk BOOLEAN DEFAULT false,
  flight_risk BOOLEAN DEFAULT false,
  risk_notes TEXT,
  assessed_by UUID REFERENCES public.profiles(id),
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, position_id)
);

-- Enable RLS on all tables
ALTER TABLE public.nine_box_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.succession_development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_position_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nine_box_assessments
CREATE POLICY "Admins and HR can manage all nine box assessments"
  ON public.nine_box_assessments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own assessments"
  ON public.nine_box_assessments FOR SELECT
  USING (auth.uid() = employee_id);

-- RLS Policies for talent_pools
CREATE POLICY "Admins and HR can manage talent pools"
  ON public.talent_pools FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Authenticated users can view active talent pools"
  ON public.talent_pools FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for talent_pool_members
CREATE POLICY "Admins and HR can manage talent pool members"
  ON public.talent_pool_members FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own pool membership"
  ON public.talent_pool_members FOR SELECT
  USING (auth.uid() = employee_id);

-- RLS Policies for succession_plans
CREATE POLICY "Admins and HR can manage succession plans"
  ON public.succession_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- RLS Policies for succession_candidates
CREATE POLICY "Admins and HR can manage succession candidates"
  ON public.succession_candidates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own candidacy"
  ON public.succession_candidates FOR SELECT
  USING (auth.uid() = employee_id);

-- RLS Policies for succession_development_plans
CREATE POLICY "Admins and HR can manage development plans"
  ON public.succession_development_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

CREATE POLICY "Employees can view own development plans"
  ON public.succession_development_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM succession_candidates sc
    WHERE sc.id = succession_development_plans.candidate_id
    AND sc.employee_id = auth.uid()
  ));

-- RLS Policies for key_position_risks
CREATE POLICY "Admins and HR can manage key position risks"
  ON public.key_position_risks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'hr_manager'::app_role));

-- Create indexes for performance
CREATE INDEX idx_nine_box_company ON public.nine_box_assessments(company_id);
CREATE INDEX idx_nine_box_employee ON public.nine_box_assessments(employee_id);
CREATE INDEX idx_nine_box_current ON public.nine_box_assessments(is_current);
CREATE INDEX idx_talent_pools_company ON public.talent_pools(company_id);
CREATE INDEX idx_talent_pool_members_pool ON public.talent_pool_members(pool_id);
CREATE INDEX idx_succession_plans_company ON public.succession_plans(company_id);
CREATE INDEX idx_succession_plans_position ON public.succession_plans(position_id);
CREATE INDEX idx_succession_candidates_plan ON public.succession_candidates(plan_id);
CREATE INDEX idx_key_position_risks_company ON public.key_position_risks(company_id);
