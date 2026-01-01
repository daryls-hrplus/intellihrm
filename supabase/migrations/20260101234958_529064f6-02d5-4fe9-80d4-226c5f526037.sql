-- Add cycle_type column with industry-standard values
ALTER TABLE appraisal_cycles 
ADD COLUMN cycle_type TEXT NOT NULL DEFAULT 'annual';

-- Update existing records based on current boolean flags
UPDATE appraisal_cycles 
SET cycle_type = CASE 
  WHEN is_probation_review = true THEN 'probation'
  WHEN is_manager_cycle = true THEN 'manager_360'
  ELSE 'annual'
END;

-- Add check constraint for valid values
ALTER TABLE appraisal_cycles
ADD CONSTRAINT valid_appraisal_cycle_type CHECK (
  cycle_type IN ('annual', 'mid_year', 'quarterly', 'probation', 'manager_360', 'project_based', 'continuous')
);