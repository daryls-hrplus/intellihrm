-- Company Tags for grouping companies (e.g., spanish-speaking, caribbean region)
CREATE TABLE public.company_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Junction table for company-tag relationships
CREATE TABLE public.company_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.company_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, tag_id)
);

-- Role-based company access: direct company assignments
CREATE TABLE public.role_company_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, company_id)
);

-- Role-based company access: tag-based assignments
CREATE TABLE public.role_tag_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.company_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, tag_id)
);

-- Granular module permissions structure (module > tabs > actions)
CREATE TABLE public.module_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code TEXT NOT NULL,
  module_name TEXT NOT NULL,
  tab_code TEXT,
  tab_name TEXT,
  parent_tab_code TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(module_code, tab_code)
);

-- Role granular permissions (which actions on which tabs)
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  module_permission_id UUID NOT NULL REFERENCES public.module_permissions(id) ON DELETE CASCADE,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, module_permission_id)
);

-- Enable RLS
ALTER TABLE public.company_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_tag_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_tags
CREATE POLICY "Admins can manage company tags" ON public.company_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view company tags" ON public.company_tags
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for company_tag_assignments
CREATE POLICY "Admins can manage company tag assignments" ON public.company_tag_assignments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view company tag assignments" ON public.company_tag_assignments
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for role_company_access
CREATE POLICY "Admins can manage role company access" ON public.role_company_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view role company access" ON public.role_company_access
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for role_tag_access
CREATE POLICY "Admins can manage role tag access" ON public.role_tag_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view role tag access" ON public.role_tag_access
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for module_permissions
CREATE POLICY "Admins can manage module permissions" ON public.module_permissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view module permissions" ON public.module_permissions
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for role_permissions
CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "All authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_company_tags_updated_at
  BEFORE UPDATE ON public.company_tags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_module_permissions_updated_at
  BEFORE UPDATE ON public.module_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if user has access to a company via roles
CREATE OR REPLACE FUNCTION public.user_has_company_access(p_user_id UUID, p_company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins have access to all companies
  IF public.has_role(p_user_id, 'admin') THEN
    RETURN true;
  END IF;
  
  -- Check direct company assignment via user's roles
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_company_access rca ON rca.role_id = ur.role_id
    WHERE ur.user_id = p_user_id AND rca.company_id = p_company_id
  ) THEN
    RETURN true;
  END IF;
  
  -- Check tag-based access via user's roles
  IF EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_tag_access rta ON rta.role_id = ur.role_id
    JOIN company_tag_assignments cta ON cta.tag_id = rta.tag_id
    WHERE ur.user_id = p_user_id AND cta.company_id = p_company_id
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to check if user has permission for a specific action on a module/tab
CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID, 
  p_module_code TEXT, 
  p_tab_code TEXT DEFAULT NULL,
  p_action TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Super admins have all permissions
  IF public.has_role(p_user_id, 'admin') THEN
    RETURN true;
  END IF;
  
  -- Check specific permission
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN module_permissions mp ON mp.id = rp.module_permission_id
    WHERE ur.user_id = p_user_id
      AND mp.module_code = p_module_code
      AND (p_tab_code IS NULL OR mp.tab_code = p_tab_code)
      AND mp.is_active = true
      AND CASE p_action
        WHEN 'view' THEN rp.can_view
        WHEN 'create' THEN rp.can_create
        WHEN 'edit' THEN rp.can_edit
        WHEN 'delete' THEN rp.can_delete
        ELSE rp.can_view
      END = true
  );
END;
$$;

-- Seed initial module permissions structure
INSERT INTO public.module_permissions (module_code, module_name, tab_code, tab_name, display_order) VALUES
-- Dashboard
('dashboard', 'Dashboard', NULL, NULL, 0),

-- Workforce Management
('workforce', 'Workforce Management', NULL, NULL, 10),
('workforce', 'Workforce Management', 'employees', 'Employees', 11),
('workforce', 'Workforce Management', 'positions', 'Positions', 12),
('workforce', 'Workforce Management', 'departments', 'Departments', 13),
('workforce', 'Workforce Management', 'jobs', 'Jobs', 14),
('workforce', 'Workforce Management', 'job_families', 'Job Families', 15),
('workforce', 'Workforce Management', 'onboarding', 'Onboarding', 16),
('workforce', 'Workforce Management', 'offboarding', 'Offboarding', 17),
('workforce', 'Workforce Management', 'forecasting', 'Workforce Forecasting', 18),
('workforce', 'Workforce Management', 'transactions', 'Employee Transactions', 19),
('workforce', 'Workforce Management', 'competencies', 'Competencies', 20),
('workforce', 'Workforce Management', 'responsibilities', 'Responsibilities', 21),
('workforce', 'Workforce Management', 'org_chart', 'View Orgchart', 22),

-- Leave Management
('leave', 'Leave Management', NULL, NULL, 30),
('leave', 'Leave Management', 'requests', 'Leave Requests', 31),
('leave', 'Leave Management', 'balances', 'Leave Balances', 32),
('leave', 'Leave Management', 'types', 'Leave Types', 33),
('leave', 'Leave Management', 'accrual_rules', 'Accrual Rules', 34),
('leave', 'Leave Management', 'rollover_rules', 'Rollover Rules', 35),
('leave', 'Leave Management', 'holidays', 'Holidays', 36),
('leave', 'Leave Management', 'comp_time', 'Compensatory Time', 37),
('leave', 'Leave Management', 'analytics', 'Leave Analytics', 38),

-- Compensation
('compensation', 'Compensation', NULL, NULL, 40),
('compensation', 'Compensation', 'pay_elements', 'Pay Elements', 41),
('compensation', 'Compensation', 'salary_grades', 'Salary Grades', 42),
('compensation', 'Compensation', 'position_compensation', 'Position Compensation', 43),

-- Payroll
('payroll', 'Payroll', NULL, NULL, 50),
('payroll', 'Payroll', 'pay_groups', 'Pay Groups', 51),
('payroll', 'Payroll', 'pay_periods', 'Pay Periods', 52),
('payroll', 'Payroll', 'processing', 'Payroll Processing', 53),
('payroll', 'Payroll', 'tax_config', 'Tax Configuration', 54),
('payroll', 'Payroll', 'deductions', 'Deductions', 55),
('payroll', 'Payroll', 'reports', 'Payroll Reports', 56),
('payroll', 'Payroll', 'year_end', 'Year-End Processing', 57),

-- Time & Attendance
('time_attendance', 'Time & Attendance', NULL, NULL, 60),
('time_attendance', 'Time & Attendance', 'time_clock', 'Time Clock', 61),
('time_attendance', 'Time & Attendance', 'timesheets', 'Timesheets', 62),
('time_attendance', 'Time & Attendance', 'schedules', 'Work Schedules', 63),
('time_attendance', 'Time & Attendance', 'exceptions', 'Exceptions', 64),
('time_attendance', 'Time & Attendance', 'geofencing', 'Geofencing', 65),
('time_attendance', 'Time & Attendance', 'projects', 'Project Time', 66),

-- Benefits
('benefits', 'Benefits', NULL, NULL, 70),
('benefits', 'Benefits', 'plans', 'Benefit Plans', 71),
('benefits', 'Benefits', 'enrollments', 'Enrollments', 72),
('benefits', 'Benefits', 'providers', 'Providers', 73),
('benefits', 'Benefits', 'claims', 'Claims', 74),
('benefits', 'Benefits', 'life_events', 'Life Events', 75),

-- Performance
('performance', 'Performance', NULL, NULL, 80),
('performance', 'Performance', 'goals', 'Goals', 81),
('performance', 'Performance', 'appraisals', 'Appraisals', 82),
('performance', 'Performance', 'reviews_360', '360 Reviews', 83),
('performance', 'Performance', 'pips', 'Performance Improvement Plans', 84),
('performance', 'Performance', 'feedback', 'Continuous Feedback', 85),
('performance', 'Performance', 'recognition', 'Recognition & Awards', 86),
('performance', 'Performance', 'analytics', 'Performance Analytics', 87),

-- Training
('training', 'Training', NULL, NULL, 90),
('training', 'Training', 'courses', 'Courses', 91),
('training', 'Training', 'enrollments', 'Training Enrollments', 92),
('training', 'Training', 'lms', 'LMS Management', 93),
('training', 'Training', 'categories', 'Categories', 94),
('training', 'Training', 'certificates', 'Certificates', 95),

-- Succession Planning
('succession', 'Succession Planning', NULL, NULL, 100),
('succession', 'Succession Planning', 'nine_box', 'Nine Box Grid', 101),
('succession', 'Succession Planning', 'talent_pools', 'Talent Pools', 102),
('succession', 'Succession Planning', 'succession_plans', 'Succession Plans', 103),
('succession', 'Succession Planning', 'key_positions', 'Key Position Risk', 104),
('succession', 'Succession Planning', 'career_paths', 'Career Paths', 105),
('succession', 'Succession Planning', 'mentorship', 'Mentorship Programs', 106),
('succession', 'Succession Planning', 'flight_risk', 'Flight Risk Tracking', 107),

-- Recruitment
('recruitment', 'Recruitment', NULL, NULL, 110),
('recruitment', 'Recruitment', 'requisitions', 'Job Requisitions', 111),
('recruitment', 'Recruitment', 'candidates', 'Candidates', 112),
('recruitment', 'Recruitment', 'applications', 'Applications', 113),
('recruitment', 'Recruitment', 'interviews', 'Interviews', 114),
('recruitment', 'Recruitment', 'offers', 'Offers', 115),
('recruitment', 'Recruitment', 'job_board', 'Job Board Integration', 116),

-- Health & Safety
('hse', 'Health & Safety', NULL, NULL, 120),
('hse', 'Health & Safety', 'incidents', 'Incident Management', 121),
('hse', 'Health & Safety', 'risk_assessment', 'Risk Assessment', 122),
('hse', 'Health & Safety', 'safety_training', 'Safety Training', 123),
('hse', 'Health & Safety', 'compliance', 'Compliance', 124),
('hse', 'Health & Safety', 'policies', 'Safety Policies', 125),

-- Employee Relations
('employee_relations', 'Employee Relations', NULL, NULL, 130),
('employee_relations', 'Employee Relations', 'cases', 'Case Management', 131),
('employee_relations', 'Employee Relations', 'disciplinary', 'Disciplinary Actions', 132),
('employee_relations', 'Employee Relations', 'recognition', 'Recognition Programs', 133),
('employee_relations', 'Employee Relations', 'exit_interviews', 'Exit Interviews', 134),
('employee_relations', 'Employee Relations', 'surveys', 'Employee Surveys', 135),
('employee_relations', 'Employee Relations', 'wellness', 'Wellness Programs', 136),

-- Company Property
('property', 'Company Property', NULL, NULL, 140),
('property', 'Company Property', 'categories', 'Categories', 141),
('property', 'Company Property', 'items', 'Items', 142),
('property', 'Company Property', 'assignments', 'Assignments', 143),
('property', 'Company Property', 'requests', 'Requests', 144),
('property', 'Company Property', 'maintenance', 'Maintenance', 145),

-- HR Hub
('hr_hub', 'HR Hub', NULL, NULL, 150),
('hr_hub', 'HR Hub', 'calendar', 'HR Calendar', 151),
('hr_hub', 'HR Hub', 'tasks', 'HR Tasks', 152),
('hr_hub', 'HR Hub', 'milestones', 'Milestones Dashboard', 153),
('hr_hub', 'HR Hub', 'compliance', 'Compliance Tracker', 154),
('hr_hub', 'HR Hub', 'helpdesk', 'Help Desk', 155),
('hr_hub', 'HR Hub', 'letter_templates', 'Letter Templates', 156),
('hr_hub', 'HR Hub', 'knowledge_base', 'Knowledge Base', 157),
('hr_hub', 'HR Hub', 'announcements', 'Announcements', 158),
('hr_hub', 'HR Hub', 'documents', 'Documents', 159),
('hr_hub', 'HR Hub', 'policy_docs', 'Policy Documents', 160),
('hr_hub', 'HR Hub', 'delegations', 'Approval Delegations', 161),
('hr_hub', 'HR Hub', 'scheduled_reports', 'Scheduled Reports', 162),
('hr_hub', 'HR Hub', 'org_structure', 'Organisational Structure', 163),
('hr_hub', 'HR Hub', 'lookup_values', 'Lookup Values', 164),
('hr_hub', 'HR Hub', 'workflow_templates', 'Workflow Templates', 165),

-- Admin & Security
('admin', 'Admin & Security', NULL, NULL, 200),
('admin', 'Admin & Security', 'users', 'User Management', 201),
('admin', 'Admin & Security', 'roles', 'Role Management', 202),
('admin', 'Admin & Security', 'permissions', 'Granular Permissions', 203),
('admin', 'Admin & Security', 'company_tags', 'Company Tags', 204),
('admin', 'Admin & Security', 'territories', 'Territories', 205),
('admin', 'Admin & Security', 'companies', 'Companies', 206),
('admin', 'Admin & Security', 'company_groups', 'Company Groups', 207),
('admin', 'Admin & Security', 'audit_logs', 'Audit Logs', 208),
('admin', 'Admin & Security', 'access_requests', 'Access Requests', 209),
('admin', 'Admin & Security', 'auto_approval', 'Auto-Approval Rules', 210),
('admin', 'Admin & Security', 'settings', 'System Settings', 211),
('admin', 'Admin & Security', 'branding', 'Branding Configuration', 212),
('admin', 'Admin & Security', 'security', 'Security Settings', 213),

-- Profile
('profile', 'Profile', NULL, NULL, 250),
('profile', 'Profile', 'my_profile', 'My Profile', 251),
('profile', 'Profile', 'my_permissions', 'My Permissions', 252),

-- ESS
('ess', 'Employee Self-Service', NULL, NULL, 260),
('ess', 'Employee Self-Service', 'dashboard', 'ESS Dashboard', 261),
('ess', 'Employee Self-Service', 'my_leave', 'My Leave', 262),
('ess', 'Employee Self-Service', 'my_time', 'My Time & Attendance', 263),
('ess', 'Employee Self-Service', 'my_goals', 'My Goals', 264),
('ess', 'Employee Self-Service', 'my_training', 'My Training', 265),
('ess', 'Employee Self-Service', 'my_benefits', 'My Benefits', 266),
('ess', 'Employee Self-Service', 'my_property', 'My Property', 267),

-- MSS
('mss', 'Manager Self-Service', NULL, NULL, 270),
('mss', 'Manager Self-Service', 'dashboard', 'MSS Dashboard', 271),
('mss', 'Manager Self-Service', 'team_leave', 'Team Leave', 272),
('mss', 'Manager Self-Service', 'team_time', 'Team Time & Attendance', 273),
('mss', 'Manager Self-Service', 'team_goals', 'Team Goals', 274),
('mss', 'Manager Self-Service', 'team_appraisals', 'Team Appraisals', 275),
('mss', 'Manager Self-Service', 'team_training', 'Team Training', 276),
('mss', 'Manager Self-Service', 'team_onboarding', 'Team Onboarding', 277);