-- Add job_family and job_level columns to master_occupations_library
ALTER TABLE master_occupations_library 
ADD COLUMN IF NOT EXISTS job_family TEXT,
ADD COLUMN IF NOT EXISTS job_level TEXT,
ADD COLUMN IF NOT EXISTS is_cross_cutting BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS skills_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS competencies_count INTEGER DEFAULT 0;

-- Create master_role_aliases table for Caribbean/Africa variants
CREATE TABLE IF NOT EXISTS master_role_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_role TEXT NOT NULL,
  alias_role TEXT NOT NULL,
  region TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(canonical_role, alias_role)
);

-- Create master_occupation_skills junction table
CREATE TABLE IF NOT EXISTS master_occupation_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID REFERENCES master_occupations_library(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES master_skills_library(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 3,
  criticality TEXT DEFAULT 'Core',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(occupation_id, skill_id)
);

-- Create master_occupation_competencies junction table
CREATE TABLE IF NOT EXISTS master_occupation_competencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occupation_id UUID REFERENCES master_occupations_library(id) ON DELETE CASCADE,
  competency_id UUID REFERENCES master_competencies_library(id) ON DELETE CASCADE,
  proficiency_level INTEGER DEFAULT 3,
  criticality TEXT DEFAULT 'Core',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(occupation_id, competency_id)
);

-- Add RLS policies
ALTER TABLE master_role_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_occupation_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_occupation_competencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to role aliases" ON master_role_aliases FOR SELECT USING (true);
CREATE POLICY "Allow read access to occupation skills" ON master_occupation_skills FOR SELECT USING (true);
CREATE POLICY "Allow read access to occupation competencies" ON master_occupation_competencies FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_master_occupation_skills_occupation ON master_occupation_skills(occupation_id);
CREATE INDEX IF NOT EXISTS idx_master_occupation_skills_skill ON master_occupation_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_master_occupation_competencies_occupation ON master_occupation_competencies(occupation_id);
CREATE INDEX IF NOT EXISTS idx_master_occupation_competencies_competency ON master_occupation_competencies(competency_id);
CREATE INDEX IF NOT EXISTS idx_master_occupations_job_family ON master_occupations_library(job_family);
CREATE INDEX IF NOT EXISTS idx_master_occupations_industry ON master_occupations_library(industry_id);