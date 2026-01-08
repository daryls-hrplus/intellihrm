-- Phase 1: Add visibility and ordering columns to ticket_categories
ALTER TABLE public.ticket_categories 
ADD COLUMN IF NOT EXISTS visible_to_employees boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS visible_to_hr_only boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS parent_category_id uuid REFERENCES public.ticket_categories(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_ticket_categories_visibility ON public.ticket_categories(visible_to_employees, visible_to_hr_only, is_active);
CREATE INDEX IF NOT EXISTS idx_ticket_categories_display_order ON public.ticket_categories(display_order);

-- Update existing categories with proper display order and visibility
UPDATE public.ticket_categories SET display_order = 1, icon = 'HelpCircle' WHERE code = 'general';
UPDATE public.ticket_categories SET display_order = 2, icon = 'DollarSign' WHERE code = 'payroll';
UPDATE public.ticket_categories SET display_order = 3, icon = 'Briefcase' WHERE code = 'benefits';
UPDATE public.ticket_categories SET display_order = 4, icon = 'Calendar' WHERE code = 'leave';
UPDATE public.ticket_categories SET display_order = 5, icon = 'Clock' WHERE code = 'time-attendance';
UPDATE public.ticket_categories SET display_order = 6, icon = 'FileText' WHERE code = 'policy';
UPDATE public.ticket_categories SET display_order = 7, icon = 'GraduationCap' WHERE code = 'training';
UPDATE public.ticket_categories SET display_order = 8, icon = 'Users' WHERE code = 'workplace';
UPDATE public.ticket_categories SET display_order = 9, icon = 'AlertTriangle' WHERE code = 'complaint';
UPDATE public.ticket_categories SET display_order = 10, icon = 'Lightbulb' WHERE code = 'feedback';
UPDATE public.ticket_categories SET display_order = 11, icon = 'Settings' WHERE code = 'it-support';

-- Phase 2: Add missing industry-standard categories

-- Employee-visible categories
INSERT INTO public.ticket_categories (name, code, description, is_active, visible_to_employees, visible_to_hr_only, display_order, icon)
VALUES 
  ('Onboarding', 'onboarding', 'New hire orientation, paperwork, systems access', true, true, false, 12, 'UserPlus'),
  ('Offboarding', 'offboarding', 'Exit process, clearance, final pay inquiries', true, true, false, 13, 'UserMinus'),
  ('Employee Records', 'records', 'Personal data changes, bank info, address updates', true, true, false, 14, 'FileEdit'),
  ('Workplace Accommodations', 'accommodations', 'Disability, religious, ergonomic accommodation requests', true, true, false, 15, 'Accessibility'),
  ('Equipment & Assets', 'equipment', 'IT equipment, uniforms, ID cards, company assets', true, true, false, 16, 'Monitor'),
  ('Recognition & Rewards', 'recognition', 'Recognition program questions, reward redemption', true, true, false, 17, 'Award'),
  ('Career & Development', 'career', 'Career path, promotions, internal transfers', true, true, false, 18, 'TrendingUp'),
  ('Employee Relations', 'employee-relations', 'Conflict resolution, mediation requests', true, true, false, 19, 'MessageSquare')
ON CONFLICT (code) DO UPDATE SET 
  visible_to_employees = EXCLUDED.visible_to_employees,
  visible_to_hr_only = EXCLUDED.visible_to_hr_only,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

-- HR-only categories (not visible to employees when submitting tickets)
INSERT INTO public.ticket_categories (name, code, description, is_active, visible_to_employees, visible_to_hr_only, display_order, icon)
VALUES 
  ('Mass Communication', 'mass-comm', 'Bulk employee notifications and announcements', true, false, true, 100, 'Megaphone'),
  ('Compliance Follow-up', 'compliance-fu', 'Internal compliance tracking and follow-ups', true, false, true, 101, 'Shield'),
  ('Investigation Support', 'investigation', 'Employee relations investigation tickets', true, false, true, 102, 'Search'),
  ('HR Internal', 'hr-internal', 'Internal HR team coordination tickets', true, false, true, 103, 'Lock'),
  ('Audit & Documentation', 'audit-docs', 'Documentation requests and audit support', true, false, true, 104, 'ClipboardCheck'),
  ('Termination Processing', 'termination', 'Termination processing and documentation', true, false, true, 105, 'UserX')
ON CONFLICT (code) DO UPDATE SET 
  visible_to_employees = EXCLUDED.visible_to_employees,
  visible_to_hr_only = EXCLUDED.visible_to_hr_only,
  display_order = EXCLUDED.display_order,
  icon = EXCLUDED.icon;

-- Ensure all existing categories have visibility set properly
UPDATE public.ticket_categories 
SET visible_to_employees = true, visible_to_hr_only = false 
WHERE visible_to_employees IS NULL;