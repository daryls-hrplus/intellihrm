
-- Auto-enrollment rules table
CREATE TABLE public.benefit_auto_enrollment_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Life events table
CREATE TABLE public.benefit_life_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  supporting_documents JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  enrollment_window_start DATE,
  enrollment_window_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Waiting periods tracking table
CREATE TABLE public.benefit_waiting_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.benefit_plans(id) ON DELETE CASCADE,
  hire_date DATE NOT NULL,
  waiting_period_days INTEGER NOT NULL DEFAULT 0,
  eligibility_date DATE NOT NULL,
  enrollment_status TEXT NOT NULL DEFAULT 'waiting',
  enrolled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, plan_id)
);

-- Eligibility audit trail
CREATE TABLE public.benefit_eligibility_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES public.benefit_enrollments(id) ON DELETE SET NULL,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dependent_id UUID REFERENCES public.benefit_dependents(id) ON DELETE SET NULL,
  audit_type TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_date DATE,
  verified_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.benefit_auto_enrollment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_waiting_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benefit_eligibility_audits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auto_enrollment_rules
CREATE POLICY "Admins and HR can manage auto enrollment rules"
ON public.benefit_auto_enrollment_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
);

-- RLS Policies for life_events
CREATE POLICY "Employees can view own life events"
ON public.benefit_life_events
FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Employees can create own life events"
ON public.benefit_life_events
FOR INSERT
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Admins and HR can manage all life events"
ON public.benefit_life_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
);

-- RLS Policies for waiting_periods
CREATE POLICY "Employees can view own waiting periods"
ON public.benefit_waiting_periods
FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Admins and HR can manage waiting periods"
ON public.benefit_waiting_periods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
);

-- RLS Policies for eligibility_audits
CREATE POLICY "Employees can view own eligibility audits"
ON public.benefit_eligibility_audits
FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Admins and HR can manage eligibility audits"
ON public.benefit_eligibility_audits
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_benefit_auto_enrollment_rules_updated_at
  BEFORE UPDATE ON public.benefit_auto_enrollment_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefit_life_events_updated_at
  BEFORE UPDATE ON public.benefit_life_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefit_waiting_periods_updated_at
  BEFORE UPDATE ON public.benefit_waiting_periods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_benefit_eligibility_audits_updated_at
  BEFORE UPDATE ON public.benefit_eligibility_audits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
