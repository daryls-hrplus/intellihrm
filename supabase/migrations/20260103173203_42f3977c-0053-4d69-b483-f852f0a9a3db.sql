-- Add visibility rules configuration to review_cycles
ALTER TABLE review_cycles ADD COLUMN IF NOT EXISTS visibility_rules JSONB DEFAULT '{
  "employee_access": {
    "enabled": true,
    "show_scores": true,
    "show_comments": true,
    "show_reviewer_breakdown": false,
    "release_trigger": "cycle_close"
  },
  "manager_access": {
    "enabled": true,
    "show_scores": true,
    "show_comments": true,
    "show_reviewer_breakdown": true,
    "release_trigger": "cycle_close"
  },
  "hr_access": {
    "enabled": true,
    "show_scores": true,
    "show_comments": true,
    "show_reviewer_breakdown": true,
    "show_individual_responses": true,
    "release_trigger": "immediate"
  },
  "release_settings": {
    "auto_release_on_close": false,
    "release_delay_days": 0,
    "require_hr_approval": true,
    "notify_on_release": true
  }
}'::jsonb;

-- Add results release tracking
ALTER TABLE review_cycles ADD COLUMN IF NOT EXISTS results_released_at TIMESTAMPTZ;
ALTER TABLE review_cycles ADD COLUMN IF NOT EXISTS results_released_by UUID REFERENCES auth.users(id);

-- Add comment for documentation
COMMENT ON COLUMN review_cycles.visibility_rules IS 'JSON configuration for who can see 360 feedback results and at what detail level';
COMMENT ON COLUMN review_cycles.results_released_at IS 'Timestamp when results were released (for manual release cycles)';
COMMENT ON COLUMN review_cycles.results_released_by IS 'User who released the results';