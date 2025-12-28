-- Add proficiency_indicators JSONB column to skills_competencies table
-- This stores skill-specific behavioral indicators per proficiency level
-- Structure: { "1": ["indicator1", "indicator2"], "2": [...], ..., "5": [...] }
ALTER TABLE public.skills_competencies 
ADD COLUMN IF NOT EXISTS proficiency_indicators jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.skills_competencies.proficiency_indicators IS 'AI-generated skill-specific behavioral indicators per proficiency level. Structure: { "1": ["indicator1", "indicator2"], "3": [...], "5": [...] }';