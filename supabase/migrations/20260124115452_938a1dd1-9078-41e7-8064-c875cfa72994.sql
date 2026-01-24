-- Create table for Quick Start Guide templates
CREATE TABLE public.enablement_quickstart_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon_name TEXT NOT NULL,
  color_class TEXT NOT NULL DEFAULT 'blue',
  quick_setup_time TEXT DEFAULT '15-30 minutes',
  full_config_time TEXT DEFAULT '2-4 hours',
  breadcrumb_label TEXT,
  roles JSONB NOT NULL DEFAULT '[]',
  prerequisites JSONB NOT NULL DEFAULT '[]',
  pitfalls JSONB NOT NULL DEFAULT '[]',
  content_strategy_questions JSONB DEFAULT '[]',
  setup_steps JSONB NOT NULL DEFAULT '[]',
  rollout_options JSONB DEFAULT '[]',
  rollout_recommendation TEXT,
  verification_checks JSONB DEFAULT '[]',
  integration_checklist JSONB DEFAULT '[]',
  success_metrics JSONB DEFAULT '[]',
  next_steps JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enablement_quickstart_templates ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage templates using has_role function
CREATE POLICY "Admins can manage quickstart templates"
ON public.enablement_quickstart_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow read access to published templates for authenticated users
CREATE POLICY "Users can view published templates"
ON public.enablement_quickstart_templates
FOR SELECT
USING (status = 'published');

-- Create updated_at trigger
CREATE TRIGGER update_enablement_quickstart_templates_updated_at
BEFORE UPDATE ON public.enablement_quickstart_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert L&D template as initial published data
INSERT INTO public.enablement_quickstart_templates (
  module_code, title, subtitle, icon_name, color_class, quick_setup_time, full_config_time, breadcrumb_label,
  roles, prerequisites, pitfalls, content_strategy_questions, setup_steps, rollout_options, rollout_recommendation,
  verification_checks, integration_checklist, success_metrics, next_steps, status
) VALUES (
  'LND',
  'L&D Quick Start Guide',
  'Get your Learning Management System up and running with your first course',
  'GraduationCap',
  'emerald',
  '15-30 minutes',
  '2-4 hours',
  'Learning & Development',
  '[{"role": "Primary Owner", "title": "HR Administrator or L&D Manager", "icon": "UserCog", "responsibility": "Completes all setup steps, configures courses"}, {"role": "Supporting Role", "title": "IT Administrator", "icon": "MonitorCog", "responsibility": "Assists with SSO, integrations, technical setup"}, {"role": "Content Creator", "title": "Subject Matter Expert", "icon": "Briefcase", "responsibility": "Provides course content, reviews materials"}]',
  '[{"id": "competency-library", "title": "Competency Library Populated", "description": "At least core competencies should be defined for course-to-skill mapping", "required": true, "href": "/performance/setup?tab=competencies", "module": "Performance"}, {"id": "job-profiles", "title": "Job Profiles Configured", "description": "Job profiles enable role-based learning path recommendations", "required": true, "href": "/workforce/positions", "module": "Workforce"}, {"id": "employee-records", "title": "Employee Records Created", "description": "Employees must exist to be enrolled in courses", "required": true, "href": "/workforce/employees", "module": "Workforce"}, {"id": "manager-hierarchy", "title": "Manager Hierarchy Established", "description": "Required for manager-assigned training and approval workflows", "required": true, "href": "/workforce/org-chart", "module": "Workforce"}, {"id": "departments", "title": "Departments Defined", "description": "Enables department-level training assignments and reporting", "required": false, "href": "/workforce/departments", "module": "Workforce"}]',
  '[{"issue": "Publishing before testing", "prevention": "Always use draft mode first and enroll yourself as a test learner before making courses available"}, {"issue": "Skipping competency mapping", "prevention": "Courses without skill links won''t feed AI recommendations or appear in development plans"}, {"issue": "No manager hierarchy set", "prevention": "Manager-assigned training workflows will fail; verify org chart is complete first"}, {"issue": "Missing course prerequisites", "prevention": "Define learning path sequences before creating dependent courses"}]',
  '["Will you use external content providers (LinkedIn Learning, Udemy for Business)?", "What mix of video vs. document vs. instructor-led training (ILT)?", "Will you create learning paths or standalone courses?", "How will you handle compliance training vs. professional development?"]',
  '[{"id": "step-1", "title": "Navigate to LMS Admin", "description": "Access the Learning Management System administration panel", "estimatedTime": "2 min", "substeps": ["Go to Admin Dashboard", "Click on LMS Management under Platform Settings"], "href": "/admin/lms-management"}, {"id": "step-2", "title": "Configure Course Categories", "description": "Create logical groupings for your training content", "estimatedTime": "5 min", "substeps": ["Click Add Category", "Enter category name", "Add description and icon", "Set display order"], "expectedResult": "At least 3 categories visible in the category list"}, {"id": "step-3", "title": "Create Your First Course", "description": "Set up a basic course with modules and lessons", "estimatedTime": "10 min", "substeps": ["Click Create Course button", "Enter course title and description", "Select category and set difficulty level", "Add at least one module with 2-3 lessons", "Configure course duration estimate"], "expectedResult": "Course appears in the course catalog with Draft status"}, {"id": "step-4", "title": "Add Quiz or Assessment", "description": "Create knowledge checks for your course", "estimatedTime": "8 min", "substeps": ["Open your created course", "Navigate to Assessments tab", "Click Add Quiz", "Add 3-5 multiple choice questions", "Set passing score (typically 70-80%)"], "expectedResult": "Quiz linked to course with questions visible"}, {"id": "step-5", "title": "Publish and Test", "description": "Make the course available and verify learner experience", "estimatedTime": "5 min", "substeps": ["Review course content and structure", "Click Publish to make course available", "Enroll yourself as a test learner", "Complete the course and quiz", "Verify completion is recorded"], "expectedResult": "Course completion and quiz score recorded in your training history"}]',
  '[{"id": "soft", "label": "Soft Launch", "description": "Start with 5-10 pilot users, gather feedback, iterate"}, {"id": "department", "label": "Department Rollout", "description": "Launch to one department first, then expand"}, {"id": "full", "label": "Full Launch", "description": "Open to all employees immediately"}]',
  'Start with Soft Launch to gather feedback before expanding organization-wide.',
  '["Course appears in Training Dashboard catalog", "Employees can self-enroll (if enabled)", "Progress tracking shows lesson completion", "Quiz scores are recorded correctly", "Certificates generate upon completion (if configured)", "Manager can view team training status"]',
  '[{"id": "sso", "label": "SSO/Authentication configured", "required": true}, {"id": "hris", "label": "HR System sync enabled (employee data)", "required": true}, {"id": "content", "label": "External content providers connected", "required": false}, {"id": "notifications", "label": "Email notifications configured", "required": true}, {"id": "calendar", "label": "Calendar integration for ILT sessions", "required": false}]',
  '[{"metric": "Course Enrollment Rate", "target": "50% in first month", "howToMeasure": "LMS Analytics Dashboard"}, {"metric": "Completion Rate", "target": "70%+", "howToMeasure": "Course Reports"}, {"metric": "Learner Satisfaction", "target": "4/5 stars", "howToMeasure": "Post-course surveys"}, {"metric": "Time to First Completion", "target": "< 7 days", "howToMeasure": "Enrollment-to-completion tracking"}]',
  '[{"label": "Configure Advanced LMS Settings", "href": "/admin/lms-management", "icon": "Settings"}, {"label": "View Training Dashboard (Learner View)", "href": "/training", "icon": "BookOpen"}, {"label": "View Full L&D Documentation", "href": "/enablement/modules/learning-development", "icon": "FolderTree"}]',
  'published'
);

-- Insert draft templates for other modules
INSERT INTO public.enablement_quickstart_templates (module_code, title, subtitle, icon_name, color_class, breadcrumb_label, status) VALUES
('PERF', 'Performance Management Quick Start', 'Set up your first appraisal cycle and configure reviews', 'Target', 'purple', 'Performance Management', 'draft'),
('GOALS', 'Goals & OKRs Quick Start', 'Configure goal-setting frameworks and cascading objectives', 'Goal', 'blue', 'Goals & OKRs', 'draft'),
('WFM', 'Workforce Management Quick Start', 'Set up your organizational structure and employee records', 'Users', 'cyan', 'Workforce Management', 'draft'),
('TIME', 'Time & Attendance Quick Start', 'Configure time tracking, shifts, and attendance policies', 'Clock', 'orange', 'Time & Attendance', 'draft'),
('BEN', 'Benefits Administration Quick Start', 'Set up benefit plans and enrollment workflows', 'Heart', 'rose', 'Benefits Administration', 'draft'),
('COMP', 'Compensation Quick Start', 'Configure salary structures and compensation planning', 'DollarSign', 'green', 'Compensation', 'draft'),
('SEC', 'Admin & Security Quick Start', 'Configure roles, permissions, and security settings', 'Shield', 'slate', 'Admin & Security', 'draft');