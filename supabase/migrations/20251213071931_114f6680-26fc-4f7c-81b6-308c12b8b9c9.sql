-- Performance Improvement Plans (PIP)
CREATE TABLE public.performance_improvement_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES public.profiles(id),
  hr_representative_id UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'extended', 'terminated', 'successful')),
  improvement_areas JSONB DEFAULT '[]',
  success_criteria TEXT,
  support_provided TEXT,
  consequences TEXT,
  final_outcome TEXT,
  outcome_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- PIP Milestones/Check-ins
CREATE TABLE public.pip_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pip_id UUID NOT NULL REFERENCES public.performance_improvement_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  completion_date DATE,
  manager_notes TEXT,
  employee_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Continuous Feedback / Check-ins
CREATE TABLE public.continuous_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('praise', 'constructive', 'suggestion', 'check_in', 'recognition')),
  subject TEXT,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT false,
  related_goal_id UUID REFERENCES public.performance_goals(id),
  tags JSONB DEFAULT '[]',
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- One-on-One Meeting Notes
CREATE TABLE public.one_on_one_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meeting_date DATE NOT NULL,
  duration_minutes INTEGER,
  agenda TEXT,
  discussion_notes TEXT,
  action_items JSONB DEFAULT '[]',
  employee_mood TEXT CHECK (employee_mood IN ('great', 'good', 'okay', 'struggling', 'critical')),
  topics_discussed JSONB DEFAULT '[]',
  next_meeting_date DATE,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recognition & Awards
CREATE TABLE public.recognition_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nominator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES public.profiles(id),
  award_type TEXT NOT NULL CHECK (award_type IN ('spot_bonus', 'peer_recognition', 'manager_recognition', 'team_award', 'milestone', 'value_champion', 'innovation', 'customer_hero', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_value TEXT,
  points_awarded INTEGER DEFAULT 0,
  monetary_value NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'celebrated')),
  is_public BOOLEAN DEFAULT true,
  celebrated_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Recognition Comments/Reactions
CREATE TABLE public.recognition_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recognition_id UUID NOT NULL REFERENCES public.recognition_awards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'celebrate', 'love', 'applause', 'comment')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recognition_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.performance_improvement_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pip_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continuous_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_on_one_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognition_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PIP
CREATE POLICY "Users can view PIPs they are involved in" ON public.performance_improvement_plans
  FOR SELECT USING (
    auth.uid() = employee_id OR 
    auth.uid() = manager_id OR 
    auth.uid() = hr_representative_id OR
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "HR and managers can manage PIPs" ON public.performance_improvement_plans
  FOR ALL USING (
    auth.uid() = manager_id OR 
    auth.uid() = hr_representative_id OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS for PIP Milestones
CREATE POLICY "Users can view milestones for their PIPs" ON public.pip_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.performance_improvement_plans pip 
      WHERE pip.id = pip_id AND (
        auth.uid() = pip.employee_id OR 
        auth.uid() = pip.manager_id OR 
        auth.uid() = pip.hr_representative_id OR
        EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
      )
    )
  );

CREATE POLICY "Managers can manage PIP milestones" ON public.pip_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.performance_improvement_plans pip 
      WHERE pip.id = pip_id AND (
        auth.uid() = pip.manager_id OR 
        auth.uid() = pip.hr_representative_id OR
        EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
      )
    )
  );

-- RLS for Continuous Feedback
CREATE POLICY "Users can view feedback they sent or received" ON public.continuous_feedback
  FOR SELECT USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id OR
    (is_private = false AND is_anonymous = false) OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Users can create feedback" ON public.continuous_feedback
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own feedback" ON public.continuous_feedback
  FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- RLS for One-on-One Meetings
CREATE POLICY "Users can view their 1:1 meetings" ON public.one_on_one_meetings
  FOR SELECT USING (
    auth.uid() = manager_id OR 
    auth.uid() = employee_id OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Managers can manage 1:1 meetings" ON public.one_on_one_meetings
  FOR ALL USING (
    auth.uid() = manager_id OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS for Recognition
CREATE POLICY "Users can view public recognition" ON public.recognition_awards
  FOR SELECT USING (
    is_public = true OR
    auth.uid() = recipient_id OR 
    auth.uid() = nominator_id OR
    auth.uid() = approved_by OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Users can create recognition" ON public.recognition_awards
  FOR INSERT WITH CHECK (auth.uid() = nominator_id);

CREATE POLICY "Admins can manage recognition" ON public.recognition_awards
  FOR ALL USING (
    auth.uid() = nominator_id OR
    EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

-- RLS for Recognition Reactions
CREATE POLICY "Users can view reactions" ON public.recognition_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON public.recognition_reactions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_pip_employee ON public.performance_improvement_plans(employee_id);
CREATE INDEX idx_pip_company ON public.performance_improvement_plans(company_id);
CREATE INDEX idx_pip_status ON public.performance_improvement_plans(status);
CREATE INDEX idx_feedback_to_user ON public.continuous_feedback(to_user_id);
CREATE INDEX idx_feedback_from_user ON public.continuous_feedback(from_user_id);
CREATE INDEX idx_one_on_one_manager ON public.one_on_one_meetings(manager_id);
CREATE INDEX idx_one_on_one_employee ON public.one_on_one_meetings(employee_id);
CREATE INDEX idx_recognition_recipient ON public.recognition_awards(recipient_id);
CREATE INDEX idx_recognition_company ON public.recognition_awards(company_id);
CREATE INDEX idx_recognition_status ON public.recognition_awards(status);

-- Triggers for updated_at
CREATE TRIGGER update_pip_updated_at BEFORE UPDATE ON public.performance_improvement_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pip_milestones_updated_at BEFORE UPDATE ON public.pip_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_one_on_one_updated_at BEFORE UPDATE ON public.one_on_one_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recognition_updated_at BEFORE UPDATE ON public.recognition_awards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();