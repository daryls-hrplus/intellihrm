-- Add missing columns to manual_definitions
ALTER TABLE public.manual_definitions 
ADD COLUMN IF NOT EXISTS sections_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chapters_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS functional_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS badge_color TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.manual_definitions.sections_count IS 'Number of sections in the manual';
COMMENT ON COLUMN public.manual_definitions.chapters_count IS 'Number of chapters in the manual';
COMMENT ON COLUMN public.manual_definitions.functional_areas IS 'Functional area tags: core-hr, talent, compensation, time-leave, platform';
COMMENT ON COLUMN public.manual_definitions.badge_color IS 'CSS classes for badge styling';

-- Upsert all 10 manuals with complete metadata
INSERT INTO manual_definitions (
  manual_code, manual_name, description, current_version, 
  icon_name, color_class, href, module_codes,
  sections_count, chapters_count, functional_areas, badge_color
) VALUES
  -- Prologue: Foundation
  ('admin-security', 'Admin & Security Guide', 
   'Complete guide to administration, security configuration, user management, and system settings',
   '1.0.0', 'Shield', 'bg-red-500/10 text-red-600 border-red-500/20', 
   '/enablement/manuals/admin-security', ARRAY['admin', 'security', 'access-control'],
   55, 8, ARRAY['platform', 'core-hr'], 'bg-red-500/10 text-red-700 border-red-500/30'),
   
  ('hr-hub', 'HR Hub Guide',
   'HR Hub configuration including policies, documents, knowledge base, and employee communications',
   '1.0.0', 'HelpCircle', 'bg-purple-500/10 text-purple-600 border-purple-500/20',
   '/enablement/manuals/hr-hub', ARRAY['hr-hub', 'employee-relations', 'grievances'],
   32, 8, ARRAY['core-hr', 'platform'], 'bg-purple-500/10 text-purple-700 border-purple-500/30'),

  -- Act 1: Attract, Onboard & Transition
  ('workforce', 'Workforce Guide',
   'Comprehensive workforce management including org structure, positions, departments, and employee lifecycle',
   '1.0.0', 'Users', 'bg-blue-500/10 text-blue-600 border-blue-500/20',
   '/enablement/manuals/workforce', ARRAY['workforce', 'employee-management', 'org-structure'],
   80, 8, ARRAY['core-hr'], 'bg-blue-500/10 text-blue-700 border-blue-500/30'),

  -- Act 2: Enable & Engage
  ('time-attendance', 'Time & Attendance Guide',
   'Complete guide to time tracking, shifts, schedules, overtime, and attendance management',
   '1.0.0', 'Clock', 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
   '/enablement/manuals/time-attendance', ARRAY['time-attendance', 'schedules', 'shifts'],
   65, 8, ARRAY['time-leave'], 'bg-indigo-500/10 text-indigo-700 border-indigo-500/30'),

  -- Act 3: Pay & Reward
  ('benefits', 'Benefits Administrator Guide',
   'Complete benefits management including plans, enrollment, claims, life events, and analytics',
   '1.0.0', 'Heart', 'bg-pink-500/10 text-pink-600 border-pink-500/20',
   '/enablement/manuals/benefits', ARRAY['benefits', 'enrollment', 'claims'],
   45, 8, ARRAY['compensation'], 'bg-pink-500/10 text-pink-700 border-pink-500/30'),

  -- Act 4: Develop & Grow
  ('appraisals', 'Performance Appraisal Guide',
   'Performance appraisal configuration including cycles, templates, workflows, and calibration',
   '1.0.0', 'BookOpen', 'bg-primary/10 text-primary border-primary/20',
   '/enablement/manuals/appraisals', ARRAY['appraisals', 'performance', 'reviews'],
   48, 8, ARRAY['talent'], 'bg-primary/10 text-primary border-primary/30'),

  ('goals', 'Goals Manual',
   'Goals management configuration including goal frameworks, cascading, tracking, and alignment',
   '1.0.0', 'Target', 'bg-green-500/10 text-green-600 border-green-500/20',
   '/enablement/manuals/goals', ARRAY['goals', 'okrs', 'objectives'],
   24, 6, ARRAY['talent'], 'bg-green-500/10 text-green-700 border-green-500/30'),

  ('feedback-360', '360 Feedback Guide',
   'Multi-rater feedback system including cycles, anonymity, rater management, AI insights, and development themes',
   '1.0.0', 'Radar', 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
   '/enablement/manuals/feedback-360', ARRAY['feedback-360', 'multi-rater', 'anonymity'],
   59, 8, ARRAY['talent'], 'bg-cyan-500/10 text-cyan-700 border-cyan-500/30'),

  ('succession', 'Succession Planning Guide',
   'Comprehensive succession planning including 9-box assessments, talent pools, readiness frameworks, and career paths',
   '1.0.0', 'Grid3X3', 'bg-amber-500/10 text-amber-600 border-amber-500/20',
   '/enablement/manuals/succession', ARRAY['succession', 'talent-pools', '9-box'],
   55, 11, ARRAY['talent'], 'bg-amber-500/10 text-amber-700 border-amber-500/30'),

  ('career-development', 'Career Development Guide',
   'Career paths, individual development plans (IDPs), mentorship programs, and AI-driven development recommendations',
   '1.0.0', 'TrendingUp', 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
   '/enablement/manuals/career-development', ARRAY['career-development', 'idp', 'mentorship'],
   52, 10, ARRAY['talent'], 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30')

ON CONFLICT (manual_code) DO UPDATE SET
  manual_name = EXCLUDED.manual_name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  color_class = EXCLUDED.color_class,
  href = EXCLUDED.href,
  module_codes = EXCLUDED.module_codes,
  sections_count = EXCLUDED.sections_count,
  chapters_count = EXCLUDED.chapters_count,
  functional_areas = EXCLUDED.functional_areas,
  badge_color = EXCLUDED.badge_color,
  updated_at = now();