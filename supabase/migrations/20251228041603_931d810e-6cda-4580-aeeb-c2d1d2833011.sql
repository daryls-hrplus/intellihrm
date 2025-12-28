-- Create company_capabilities junction table for multi-company assignment
CREATE TABLE IF NOT EXISTS company_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES skills_competencies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(company_id, capability_id)
);

-- Enable RLS
ALTER TABLE company_capabilities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_capabilities
CREATE POLICY "Users can view company capabilities for their company"
ON company_capabilities
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage company capabilities"
ON company_capabilities
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

-- Add is_global column to skills_competencies for global capabilities
ALTER TABLE skills_competencies 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT false;

-- Migrate existing skills/competencies from Acme to CMG
UPDATE skills_competencies 
SET company_id = '4b7cab47-f59b-4f0b-ae80-94aab4b0c29e'
WHERE company_id = 'e8c7dc6f-520f-4d17-9851-49a6e6ee4974'
AND type IN ('SKILL', 'COMPETENCY');

-- Populate company_capabilities junction table for CMG with all existing capabilities
INSERT INTO company_capabilities (company_id, capability_id)
SELECT '4b7cab47-f59b-4f0b-ae80-94aab4b0c29e', id
FROM skills_competencies
WHERE company_id = '4b7cab47-f59b-4f0b-ae80-94aab4b0c29e'
AND type IN ('SKILL', 'COMPETENCY')
ON CONFLICT (company_id, capability_id) DO NOTHING;

-- Create capability_job_applicability junction table for job mapping
CREATE TABLE IF NOT EXISTS capability_job_applicability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES skills_competencies(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  ai_suggested BOOLEAN DEFAULT false,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(capability_id, job_id)
);

-- Enable RLS
ALTER TABLE capability_job_applicability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for capability_job_applicability
CREATE POLICY "Users can view capability job applicability"
ON capability_job_applicability
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage capability job applicability"
ON capability_job_applicability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_capabilities_company ON company_capabilities(company_id);
CREATE INDEX IF NOT EXISTS idx_company_capabilities_capability ON company_capabilities(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_job_applicability_capability ON capability_job_applicability(capability_id);
CREATE INDEX IF NOT EXISTS idx_capability_job_applicability_job ON capability_job_applicability(job_id);