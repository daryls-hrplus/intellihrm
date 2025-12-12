-- Offboarding Templates
CREATE TABLE public.offboarding_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Offboarding Template Tasks
CREATE TABLE public.offboarding_template_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.offboarding_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general' CHECK (task_type IN ('general', 'document', 'equipment', 'access', 'knowledge_transfer', 'exit_interview')),
  is_required BOOLEAN NOT NULL DEFAULT true,
  due_days_before INTEGER NOT NULL DEFAULT 0,
  assigned_to_type TEXT NOT NULL DEFAULT 'hr' CHECK (assigned_to_type IN ('employee', 'manager', 'hr', 'it')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Offboarding Instances
CREATE TABLE public.offboarding_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.offboarding_templates(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  manager_id UUID REFERENCES public.profiles(id),
  last_working_date DATE NOT NULL,
  termination_reason TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Offboarding Tasks
CREATE TABLE public.offboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.offboarding_instances(id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES public.offboarding_template_tasks(id),
  name TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'general',
  is_required BOOLEAN NOT NULL DEFAULT true,
  due_date DATE,
  assigned_to_id UUID REFERENCES public.profiles(id),
  assigned_to_type TEXT NOT NULL DEFAULT 'hr',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offboarding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offboarding_templates
CREATE POLICY "Authenticated users can view offboarding templates"
  ON public.offboarding_templates FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage offboarding templates"
  ON public.offboarding_templates FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for offboarding_template_tasks
CREATE POLICY "Authenticated users can view offboarding template tasks"
  ON public.offboarding_template_tasks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage offboarding template tasks"
  ON public.offboarding_template_tasks FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for offboarding_instances
CREATE POLICY "Authenticated users can view offboarding instances"
  ON public.offboarding_instances FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage offboarding instances"
  ON public.offboarding_instances FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for offboarding_tasks
CREATE POLICY "Authenticated users can view offboarding tasks"
  ON public.offboarding_tasks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage offboarding tasks"
  ON public.offboarding_tasks FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_offboarding_templates_company ON public.offboarding_templates(company_id);
CREATE INDEX idx_offboarding_template_tasks_template ON public.offboarding_template_tasks(template_id);
CREATE INDEX idx_offboarding_instances_employee ON public.offboarding_instances(employee_id);
CREATE INDEX idx_offboarding_instances_company ON public.offboarding_instances(company_id);
CREATE INDEX idx_offboarding_instances_status ON public.offboarding_instances(status);
CREATE INDEX idx_offboarding_tasks_instance ON public.offboarding_tasks(instance_id);