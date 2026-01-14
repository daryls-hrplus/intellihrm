-- Enhance appraisal_integration_rules with Action Rules features
-- This unifies both rule systems into a single table

-- Add new columns from action rules system
ALTER TABLE appraisal_integration_rules 
ADD COLUMN IF NOT EXISTS rating_level_codes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS action_priority integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS action_is_mandatory boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS action_message text,
ADD COLUMN IF NOT EXISTS requires_hr_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS condition_section text DEFAULT 'overall',
ADD COLUMN IF NOT EXISTS condition_threshold numeric;

-- Add index for faster lookups by rating codes
CREATE INDEX IF NOT EXISTS idx_integration_rules_rating_codes 
ON appraisal_integration_rules USING GIN(rating_level_codes);

-- Add comment explaining the unified system
COMMENT ON TABLE appraisal_integration_rules IS 'Unified Appraisal Outcome Rules - combines Action Rules and Integration Rules into one system. Rules trigger automated actions when appraisals are finalized based on rating levels, scores, or categories.';

-- Migrate existing data from appraisal_outcome_action_rules if any exist
-- This ensures no rules are lost
INSERT INTO appraisal_integration_rules (
  company_id,
  name,
  description,
  trigger_event,
  condition_type,
  condition_operator,
  condition_value,
  condition_category_codes,
  condition_section,
  condition_threshold,
  rating_level_codes,
  target_module,
  action_type,
  action_config,
  action_priority,
  action_is_mandatory,
  action_message,
  requires_hr_override,
  auto_execute,
  requires_approval,
  is_active,
  execution_order
)
SELECT 
  company_id,
  rule_name as name,
  description,
  'appraisal_finalized' as trigger_event,
  CASE 
    WHEN condition_type = 'score_below' THEN 'score_range'
    WHEN condition_type = 'score_above' THEN 'score_range'
    ELSE 'category_match'
  END as condition_type,
  CASE 
    WHEN condition_type = 'score_below' THEN '<'
    WHEN condition_type = 'score_above' THEN '>'
    ELSE 'in'
  END as condition_operator,
  condition_threshold as condition_value,
  '[]'::jsonb as condition_category_codes,
  condition_section,
  condition_threshold,
  COALESCE(rating_level_codes, ARRAY[]::text[]) as rating_level_codes,
  CASE action_type
    WHEN 'create_pip' THEN 'pip'
    WHEN 'create_idp' THEN 'idp'
    WHEN 'suggest_succession' THEN 'succession'
    WHEN 'notify_hr' THEN 'notifications'
    WHEN 'schedule_coaching' THEN 'reminders'
    ELSE 'notifications'
  END as target_module,
  CASE action_type
    WHEN 'create_pip' THEN 'create'
    WHEN 'create_idp' THEN 'create'
    WHEN 'suggest_succession' THEN 'update'
    WHEN 'notify_hr' THEN 'notify'
    WHEN 'schedule_coaching' THEN 'create'
    ELSE 'notify'
  END as action_type,
  jsonb_build_object(
    'message', COALESCE(action_message, ''),
    'priority', action_priority,
    'original_action_type', action_type
  ) as action_config,
  action_priority,
  action_is_mandatory,
  action_message,
  requires_hr_override,
  auto_execute,
  requires_hr_override as requires_approval,
  is_active,
  display_order as execution_order
FROM appraisal_outcome_action_rules
WHERE NOT EXISTS (
  SELECT 1 FROM appraisal_integration_rules ir 
  WHERE ir.company_id = appraisal_outcome_action_rules.company_id 
  AND ir.name = appraisal_outcome_action_rules.rule_name
);