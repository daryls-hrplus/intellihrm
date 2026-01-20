-- Add dual-proficiency model columns to employee_competencies
-- Required level (from job profile - target)
ALTER TABLE employee_competencies 
ADD COLUMN IF NOT EXISTS required_proficiency_level INTEGER CHECK (required_proficiency_level >= 1 AND required_proficiency_level <= 5);

-- Assessed level (from appraisal - actual) - NULL until assessed
ALTER TABLE employee_competencies 
ADD COLUMN IF NOT EXISTS assessed_proficiency_level INTEGER CHECK (assessed_proficiency_level >= 1 AND assessed_proficiency_level <= 5);

-- When was proficiency last assessed
ALTER TABLE employee_competencies 
ADD COLUMN IF NOT EXISTS assessed_date DATE;

-- Who assessed (manager from appraisal)
ALTER TABLE employee_competencies 
ADD COLUMN IF NOT EXISTS assessed_by UUID REFERENCES profiles(id);

-- Source of assessment
ALTER TABLE employee_competencies 
ADD COLUMN IF NOT EXISTS assessment_source TEXT DEFAULT 'pending';

-- Is this a required competency for the role
ALTER TABLE employee_competencies 
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN employee_competencies.required_proficiency_level IS 'Target proficiency level from job profile (1-5 scale)';
COMMENT ON COLUMN employee_competencies.assessed_proficiency_level IS 'Actual proficiency level from appraisal - NULL until assessed';
COMMENT ON COLUMN employee_competencies.assessment_source IS 'Source of assessment: pending, appraisal, self, manager, training';