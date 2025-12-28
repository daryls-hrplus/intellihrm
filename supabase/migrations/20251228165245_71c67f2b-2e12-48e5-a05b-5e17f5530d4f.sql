-- Add category enum type for responsibilities
DO $$ BEGIN
    CREATE TYPE responsibility_category AS ENUM (
        'financial',
        'operational',
        'people_leadership',
        'technical',
        'compliance',
        'strategic',
        'administrative',
        'customer_service',
        'project_management'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to responsibilities table
ALTER TABLE responsibilities 
ADD COLUMN IF NOT EXISTS category text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS complexity_level integer DEFAULT NULL CHECK (complexity_level >= 1 AND complexity_level <= 5),
ADD COLUMN IF NOT EXISTS key_result_areas jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS linked_competency_ids uuid[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN responsibilities.category IS 'Category of responsibility: financial, operational, people_leadership, technical, compliance, strategic, administrative, customer_service, project_management';
COMMENT ON COLUMN responsibilities.complexity_level IS 'Complexity level 1-5 (1=Basic, 5=Strategic)';
COMMENT ON COLUMN responsibilities.key_result_areas IS 'Array of measurable Key Result Areas (KRAs) for this responsibility';
COMMENT ON COLUMN responsibilities.linked_competency_ids IS 'Array of competency/skill IDs linked to this responsibility';

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_responsibilities_category ON responsibilities(category) WHERE category IS NOT NULL;