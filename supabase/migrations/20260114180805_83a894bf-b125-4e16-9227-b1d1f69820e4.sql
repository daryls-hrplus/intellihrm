-- Add rating_level_codes column to store which rating levels trigger this rule
ALTER TABLE appraisal_outcome_action_rules 
ADD COLUMN IF NOT EXISTS rating_level_codes text[] DEFAULT NULL;

-- Add a new condition type for rating-based rules
ALTER TYPE appraisal_condition_type ADD VALUE IF NOT EXISTS 'rating_category';

COMMENT ON COLUMN appraisal_outcome_action_rules.rating_level_codes IS 'Array of rating level codes that trigger this rule (e.g., needs_improvement, unsatisfactory)';