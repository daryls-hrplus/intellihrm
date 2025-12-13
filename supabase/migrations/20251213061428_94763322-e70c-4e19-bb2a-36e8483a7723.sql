
-- Mentorship Programs
CREATE TABLE public.mentorship_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  program_type TEXT NOT NULL DEFAULT 'succession' CHECK (program_type IN ('succession', 'development', 'onboarding', 'leadership')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL,
  end_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentorship Pairings
CREATE TABLE public.mentorship_pairings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.mentorship_programs(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  end_date DATE,
  goals TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(program_id, mentor_id, mentee_id)
);

-- Mentorship Sessions/Meetings
CREATE TABLE public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pairing_id UUID NOT NULL REFERENCES public.mentorship_pairings(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  topics TEXT,
  notes TEXT,
  action_items TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flight Risk Tracking
CREATE TABLE public.flight_risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB DEFAULT '[]',
  retention_actions TEXT,
  assessed_by UUID REFERENCES public.profiles(id),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_review_date DATE,
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_risk_assessments ENABLE ROW LEVEL SECURITY;

-- RLS for Mentorship Programs
CREATE POLICY "Admins and HR can manage mentorship programs" ON public.mentorship_programs
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')));

CREATE POLICY "All authenticated can view active programs" ON public.mentorship_programs
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS for Mentorship Pairings
CREATE POLICY "Admins and HR can manage pairings" ON public.mentorship_pairings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')));

CREATE POLICY "Mentors and mentees can view their pairings" ON public.mentorship_pairings
  FOR SELECT USING (mentor_id = auth.uid() OR mentee_id = auth.uid());

-- RLS for Mentorship Sessions
CREATE POLICY "Admins and HR can manage sessions" ON public.mentorship_sessions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')));

CREATE POLICY "Participants can manage their sessions" ON public.mentorship_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.mentorship_pairings mp 
      WHERE mp.id = pairing_id AND (mp.mentor_id = auth.uid() OR mp.mentee_id = auth.uid())
    )
  );

-- RLS for Flight Risk
CREATE POLICY "Admins and HR can manage flight risk" ON public.flight_risk_assessments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')));

-- Indexes
CREATE INDEX idx_mentorship_programs_company ON public.mentorship_programs(company_id);
CREATE INDEX idx_mentorship_pairings_program ON public.mentorship_pairings(program_id);
CREATE INDEX idx_mentorship_pairings_mentor ON public.mentorship_pairings(mentor_id);
CREATE INDEX idx_mentorship_pairings_mentee ON public.mentorship_pairings(mentee_id);
CREATE INDEX idx_mentorship_sessions_pairing ON public.mentorship_sessions(pairing_id);
CREATE INDEX idx_flight_risk_company ON public.flight_risk_assessments(company_id);
CREATE INDEX idx_flight_risk_employee ON public.flight_risk_assessments(employee_id);

-- Triggers
CREATE TRIGGER update_mentorship_programs_updated_at BEFORE UPDATE ON public.mentorship_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorship_pairings_updated_at BEFORE UPDATE ON public.mentorship_pairings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorship_sessions_updated_at BEFORE UPDATE ON public.mentorship_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flight_risk_assessments_updated_at BEFORE UPDATE ON public.flight_risk_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
