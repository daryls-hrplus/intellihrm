-- Add grade_order column to salary_grades for grade comparison
ALTER TABLE salary_grades 
  ADD COLUMN IF NOT EXISTS grade_order INTEGER DEFAULT 0;

-- Add min_visible_grade_id column to directory_visibility_config
ALTER TABLE directory_visibility_config 
  ADD COLUMN IF NOT EXISTS min_visible_grade_id UUID REFERENCES salary_grades(id);

-- Update existing grades with sensible order based on code pattern (extract numbers)
-- Common patterns: GR1, GR2, Grade 1, Level 1, L1, etc.
UPDATE salary_grades 
SET grade_order = COALESCE(
  NULLIF(REGEXP_REPLACE(code, '[^0-9]', '', 'g'), '')::INTEGER,
  0
)
WHERE code ~ '[0-9]' AND grade_order = 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_salary_grades_grade_order ON salary_grades(grade_order);
CREATE INDEX IF NOT EXISTS idx_directory_visibility_min_grade ON directory_visibility_config(min_visible_grade_id);