-- Add cycle reference columns to reminder_rules table
ALTER TABLE reminder_rules 
ADD COLUMN IF NOT EXISTS appraisal_cycle_id UUID REFERENCES appraisal_cycles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS review_cycle_id UUID REFERENCES review_cycles(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON COLUMN reminder_rules.appraisal_cycle_id IS 'Optional: Link rule to a specific appraisal cycle for accurate date-based notifications';
COMMENT ON COLUMN reminder_rules.review_cycle_id IS 'Optional: Link rule to a specific 360 review cycle for accurate date-based notifications';

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_reminder_rules_appraisal_cycle ON reminder_rules(appraisal_cycle_id) WHERE appraisal_cycle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reminder_rules_review_cycle ON reminder_rules(review_cycle_id) WHERE review_cycle_id IS NOT NULL;