-- Add CHECK constraints for succession_plans enum fields to enforce industry-standard values
-- This ensures data consistency across UI components and documentation

-- Position Criticality (Oracle HCM pattern: most_critical, critical, important)
-- First check if constraint exists and drop it if so
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'succession_plans_position_criticality_check'
  ) THEN
    ALTER TABLE succession_plans DROP CONSTRAINT succession_plans_position_criticality_check;
  END IF;
END $$;

ALTER TABLE succession_plans
ADD CONSTRAINT succession_plans_position_criticality_check 
CHECK (position_criticality IS NULL OR position_criticality IN ('most_critical', 'critical', 'important'));

-- Replacement Difficulty (Oracle HCM pattern: difficult, moderate, easy)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'succession_plans_replacement_difficulty_check'
  ) THEN
    ALTER TABLE succession_plans DROP CONSTRAINT succession_plans_replacement_difficulty_check;
  END IF;
END $$;

ALTER TABLE succession_plans
ADD CONSTRAINT succession_plans_replacement_difficulty_check 
CHECK (replacement_difficulty IS NULL OR replacement_difficulty IN ('difficult', 'moderate', 'easy'));

-- Add comment explaining the industry standard enum values
COMMENT ON COLUMN succession_plans.position_criticality IS 'Industry-standard position criticality level (Oracle HCM pattern). Valid values: most_critical, critical, important. Used in Retention Risk Matrix calculations.';
COMMENT ON COLUMN succession_plans.replacement_difficulty IS 'Industry-standard replacement difficulty level (Oracle HCM pattern). Valid values: difficult, moderate, easy. Used in Retention Risk Matrix calculations.';