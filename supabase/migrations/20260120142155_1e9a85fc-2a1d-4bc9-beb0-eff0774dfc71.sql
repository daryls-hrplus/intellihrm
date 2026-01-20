-- Migrate legacy capabilities to junction table
-- Insert junction entries for capabilities that have company_id but no junction link yet
INSERT INTO company_capabilities (capability_id, company_id)
SELECT id, company_id
FROM skills_competencies
WHERE company_id IS NOT NULL
  AND is_global = false
  AND id NOT IN (SELECT capability_id FROM company_capabilities WHERE capability_id IS NOT NULL)
ON CONFLICT (capability_id, company_id) DO NOTHING;