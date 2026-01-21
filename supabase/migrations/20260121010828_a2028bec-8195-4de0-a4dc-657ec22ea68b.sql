-- =============================================
-- Employment Type Reference Table
-- =============================================
CREATE TABLE IF NOT EXISTS employment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  badge_color TEXT DEFAULT 'neutral',
  is_benefits_eligible BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS
ALTER TABLE employment_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employment_types
CREATE POLICY "Users can view employment types" 
ON employment_types FOR SELECT 
USING (company_id IS NULL OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage employment types" 
ON employment_types FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr_manager')
));

-- Seed standard employment types (global defaults)
INSERT INTO employment_types (code, name, badge_color, is_benefits_eligible, display_order) VALUES
  ('FULL_TIME', 'Full-Time', 'success', true, 1),
  ('PART_TIME', 'Part-Time', 'neutral', false, 2),
  ('CONTRACTOR', 'Contractor', 'warning', false, 3),
  ('TEMPORARY', 'Temporary', 'neutral', false, 4),
  ('INTERN', 'Intern', 'info', false, 5)
ON CONFLICT DO NOTHING;

-- =============================================
-- Add probation/leave fields to profiles
-- =============================================
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS probation_end_date DATE,
  ADD COLUMN IF NOT EXISTS is_on_leave BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS leave_return_date DATE;

-- =============================================
-- Directory Visibility Configuration Table
-- =============================================
CREATE TABLE IF NOT EXISTS directory_visibility_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  visibility_mode TEXT DEFAULT 'role_based' CHECK (visibility_mode IN ('all', 'role_based', 'grade_based', 'none')),
  visible_to_role_ids UUID[],
  visible_to_all_hr BOOLEAN DEFAULT true,
  visible_to_managers BOOLEAN DEFAULT true,
  min_visible_grade_id UUID REFERENCES salary_grades(id),
  allow_employee_opt_out BOOLEAN DEFAULT false,
  opt_out_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, field_name)
);

-- Enable RLS
ALTER TABLE directory_visibility_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for directory_visibility_config
CREATE POLICY "Users can view directory config" 
ON directory_visibility_config FOR SELECT 
USING (company_id IS NULL OR company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage directory visibility config" 
ON directory_visibility_config FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr_manager')
));

-- Seed default directory visibility configuration
INSERT INTO directory_visibility_config (field_name, field_label, visibility_mode, visible_to_all_hr, visible_to_managers, allow_employee_opt_out) VALUES
  ('work_phone', 'Work Phone', 'role_based', true, true, true),
  ('work_mobile', 'Mobile Number', 'role_based', true, true, true),
  ('extension', 'Extension', 'all', true, true, false),
  ('personal_email', 'Personal Email', 'role_based', true, false, true),
  ('manager', 'Reports To', 'all', true, true, false),
  ('hire_date', 'Hire Date', 'all', true, true, false),
  ('employment_type', 'Employment Type', 'all', true, true, false),
  ('employment_status', 'Employment Status', 'role_based', true, true, false)
ON CONFLICT DO NOTHING;

-- =============================================
-- Extend employee_privacy_settings for directory visibility
-- =============================================
ALTER TABLE employee_privacy_settings 
  ADD COLUMN IF NOT EXISTS show_work_phone BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_work_mobile BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_extension BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_personal_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS directory_opt_out BOOLEAN DEFAULT false;

-- Create updated_at trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employment_types_updated_at ON employment_types;
CREATE TRIGGER update_employment_types_updated_at
  BEFORE UPDATE ON employment_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_directory_visibility_config_updated_at ON directory_visibility_config;
CREATE TRIGGER update_directory_visibility_config_updated_at
  BEFORE UPDATE ON directory_visibility_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();