
-- Individual Development Plans (IDPs) for any employee
CREATE TABLE public.individual_development_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  start_date DATE NOT NULL,
  target_completion_date DATE,
  actual_completion_date DATE,
  manager_id UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IDP Goals/Objectives
CREATE TABLE public.idp_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idp_id UUID NOT NULL REFERENCES public.individual_development_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'skill' CHECK (category IN ('skill', 'knowledge', 'experience', 'certification', 'education')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  target_date DATE,
  completion_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IDP Activities/Actions
CREATE TABLE public.idp_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.idp_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL DEFAULT 'training' CHECK (activity_type IN ('training', 'mentoring', 'project', 'reading', 'course', 'certification', 'other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Career Paths - define progression routes between jobs
CREATE TABLE public.career_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Career Path Steps - jobs in a career path with order
CREATE TABLE public.career_path_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  career_path_id UUID NOT NULL REFERENCES public.career_paths(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  typical_duration_months INTEGER,
  requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(career_path_id, step_order)
);

-- Enable RLS
ALTER TABLE public.individual_development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idp_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_path_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for IDPs
CREATE POLICY "Admins and HR can manage all IDPs" ON public.individual_development_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Employees can view their own IDPs" ON public.individual_development_plans
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Managers can view their reports IDPs" ON public.individual_development_plans
  FOR SELECT USING (manager_id = auth.uid());

-- RLS for IDP Goals
CREATE POLICY "Admins and HR can manage all IDP goals" ON public.idp_goals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Employees can manage their IDP goals" ON public.idp_goals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.individual_development_plans WHERE id = idp_id AND employee_id = auth.uid())
  );

-- RLS for IDP Activities
CREATE POLICY "Admins and HR can manage all IDP activities" ON public.idp_activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Employees can manage their IDP activities" ON public.idp_activities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.idp_goals g
      JOIN public.individual_development_plans i ON g.idp_id = i.id
      WHERE g.id = goal_id AND i.employee_id = auth.uid()
    )
  );

-- RLS for Career Paths
CREATE POLICY "Admins and HR can manage career paths" ON public.career_paths
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "All authenticated users can view career paths" ON public.career_paths
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS for Career Path Steps
CREATE POLICY "Admins and HR can manage career path steps" ON public.career_path_steps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager'))
  );

CREATE POLICY "All authenticated users can view career path steps" ON public.career_path_steps
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.career_paths WHERE id = career_path_id AND is_active = true)
  );

-- Indexes
CREATE INDEX idx_idp_company ON public.individual_development_plans(company_id);
CREATE INDEX idx_idp_employee ON public.individual_development_plans(employee_id);
CREATE INDEX idx_idp_goals_idp ON public.idp_goals(idp_id);
CREATE INDEX idx_idp_activities_goal ON public.idp_activities(goal_id);
CREATE INDEX idx_career_paths_company ON public.career_paths(company_id);
CREATE INDEX idx_career_path_steps_path ON public.career_path_steps(career_path_id);

-- Triggers for updated_at
CREATE TRIGGER update_individual_development_plans_updated_at BEFORE UPDATE ON public.individual_development_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_idp_goals_updated_at BEFORE UPDATE ON public.idp_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_idp_activities_updated_at BEFORE UPDATE ON public.idp_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_career_paths_updated_at BEFORE UPDATE ON public.career_paths FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_career_path_steps_updated_at BEFORE UPDATE ON public.career_path_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
