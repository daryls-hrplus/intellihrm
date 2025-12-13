-- Project Time Tracking: Client > Project > Task hierarchy

-- Clients table
CREATE TABLE IF NOT EXISTS public.project_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  contact_name text,
  contact_email text,
  contact_phone text,
  is_active boolean NOT NULL DEFAULT true,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.project_clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled')),
  budget_hours numeric,
  billable boolean NOT NULL DEFAULT true,
  hourly_rate numeric,
  currency text DEFAULT 'USD',
  project_manager_id uuid REFERENCES auth.users(id),
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Project tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  name text NOT NULL,
  code text,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  estimated_hours numeric,
  billable boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Project team assignments
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  hourly_rate numeric,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(project_id, employee_id)
);

-- Time entries (separate timesheet entries)
CREATE TABLE IF NOT EXISTS public.project_time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  time_clock_entry_id uuid REFERENCES public.time_clock_entries(id) ON DELETE SET NULL,
  entry_date date NOT NULL,
  hours numeric NOT NULL CHECK (hours > 0 AND hours <= 24),
  description text,
  billable boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  approved_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add project reference to time clock entries for clock-in project assignment
ALTER TABLE public.time_clock_entries 
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS task_id uuid REFERENCES public.project_tasks(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_clients
CREATE POLICY "Users can view clients in their company"
  ON public.project_clients FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = project_clients.company_id));

CREATE POLICY "Admins can manage clients"
  ON public.project_clients FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')));

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their company"
  ON public.projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.company_id = projects.company_id));

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')));

-- RLS Policies for project_tasks
CREATE POLICY "Users can view tasks for their company projects"
  ON public.project_tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects p 
    JOIN profiles prof ON prof.company_id = p.company_id 
    WHERE p.id = project_tasks.project_id AND prof.id = auth.uid()
  ));

CREATE POLICY "Admins can manage tasks"
  ON public.project_tasks FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')));

-- RLS Policies for project_assignments
CREATE POLICY "Users can view their own assignments or company assignments if admin"
  ON public.project_assignments FOR SELECT
  USING (
    employee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Admins can manage assignments"
  ON public.project_assignments FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')));

-- RLS Policies for project_time_entries
CREATE POLICY "Users can view their own time entries"
  ON public.project_time_entries FOR SELECT
  USING (
    employee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager'))
  );

CREATE POLICY "Users can create their own time entries"
  ON public.project_time_entries FOR INSERT
  WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their own draft entries"
  ON public.project_time_entries FOR UPDATE
  USING (employee_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can manage all time entries"
  ON public.project_time_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = auth.uid() AND r.code IN ('admin', 'hr_manager')));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON public.project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_employee ON public.project_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_employee ON public.project_time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_project ON public.project_time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_project_time_entries_date ON public.project_time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_clock_entries_project ON public.time_clock_entries(project_id);