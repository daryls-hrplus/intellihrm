-- Onboarding Templates (per job/position)
CREATE TABLE public.onboarding_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Template Tasks
CREATE TABLE public.onboarding_template_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.onboarding_templates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general', -- general, document, training, equipment
  is_required BOOLEAN NOT NULL DEFAULT true,
  due_days INTEGER NOT NULL DEFAULT 7, -- days from onboarding start
  assigned_to_type TEXT NOT NULL DEFAULT 'employee', -- employee, manager, hr, buddy
  display_order INTEGER NOT NULL DEFAULT 0,
  document_template_id UUID, -- for document collection tasks
  training_course_id UUID REFERENCES public.lms_courses(id), -- for training tasks
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Instances (per employee)
CREATE TABLE public.onboarding_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.onboarding_templates(id) NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  buddy_id UUID REFERENCES public.profiles(id),
  manager_id UUID REFERENCES public.profiles(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, cancelled
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Onboarding Tasks (instance-level)
CREATE TABLE public.onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID REFERENCES public.onboarding_instances(id) ON DELETE CASCADE NOT NULL,
  template_task_id UUID REFERENCES public.onboarding_template_tasks(id),
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general',
  is_required BOOLEAN NOT NULL DEFAULT true,
  due_date DATE,
  assigned_to_id UUID REFERENCES public.profiles(id),
  assigned_to_type TEXT NOT NULL DEFAULT 'employee',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES public.profiles(id),
  document_url TEXT,
  training_course_id UUID REFERENCES public.lms_courses(id),
  notes TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for onboarding_templates
CREATE POLICY "Admins and HR can manage templates" ON public.onboarding_templates
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Authenticated users can view active templates" ON public.onboarding_templates
  FOR SELECT TO authenticated USING (is_active = true);

-- RLS Policies for onboarding_template_tasks
CREATE POLICY "Admins and HR can manage template tasks" ON public.onboarding_template_tasks
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Authenticated users can view template tasks" ON public.onboarding_template_tasks
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for onboarding_instances
CREATE POLICY "Admins and HR can manage all instances" ON public.onboarding_instances
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Employees can view their own onboarding" ON public.onboarding_instances
  FOR SELECT TO authenticated USING (employee_id = auth.uid());

CREATE POLICY "Managers can view their direct reports onboarding" ON public.onboarding_instances
  FOR SELECT TO authenticated USING (manager_id = auth.uid());

CREATE POLICY "Buddies can view assigned onboarding" ON public.onboarding_instances
  FOR SELECT TO authenticated USING (buddy_id = auth.uid());

-- RLS Policies for onboarding_tasks
CREATE POLICY "Admins and HR can manage all tasks" ON public.onboarding_tasks
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can view and update tasks assigned to them" ON public.onboarding_tasks
  FOR ALL TO authenticated USING (
    assigned_to_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.onboarding_instances oi
      WHERE oi.id = instance_id AND (
        oi.employee_id = auth.uid() OR
        oi.manager_id = auth.uid() OR
        oi.buddy_id = auth.uid()
      )
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_onboarding_templates_updated_at
  BEFORE UPDATE ON public.onboarding_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_template_tasks_updated_at
  BEFORE UPDATE ON public.onboarding_template_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_instances_updated_at
  BEFORE UPDATE ON public.onboarding_instances
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_tasks_updated_at
  BEFORE UPDATE ON public.onboarding_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();