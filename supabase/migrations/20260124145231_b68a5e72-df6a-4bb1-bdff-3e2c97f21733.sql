-- Phase 1: Expand ALL check constraints

-- 1.1: Update action_type constraint
ALTER TABLE appraisal_integration_rules 
DROP CONSTRAINT IF EXISTS appraisal_integration_rules_action_type_check;

ALTER TABLE appraisal_integration_rules 
ADD CONSTRAINT appraisal_integration_rules_action_type_check 
CHECK (action_type IN (
  'create', 'update', 'flag', 'archive', 'notify', 'sync',
  'recommend_courses', 'auto_enroll', 'create_request', 'add_to_path',
  'generate_themes'
));

-- 1.2: Update trigger_event constraint
ALTER TABLE appraisal_integration_rules 
DROP CONSTRAINT IF EXISTS appraisal_integration_rules_trigger_event_check;

ALTER TABLE appraisal_integration_rules 
ADD CONSTRAINT appraisal_integration_rules_trigger_event_check 
CHECK (trigger_event IN (
  'appraisal_finalized', 
  'category_assigned',
  'feedback_360_completed'
));

-- 1.3: Update target_module constraint
ALTER TABLE appraisal_integration_rules 
DROP CONSTRAINT IF EXISTS appraisal_integration_rules_target_module_check;

ALTER TABLE appraisal_integration_rules 
ADD CONSTRAINT appraisal_integration_rules_target_module_check 
CHECK (target_module IN (
  'succession', 'nine_box', 'idp', 'pip', 'compensation', 'training',
  'development'
));

-- 1.4: Update condition_type constraint to include 'always'
ALTER TABLE appraisal_integration_rules 
DROP CONSTRAINT IF EXISTS appraisal_integration_rules_condition_type_check;

ALTER TABLE appraisal_integration_rules 
ADD CONSTRAINT appraisal_integration_rules_condition_type_check 
CHECK (condition_type IN (
  'score_range', 'category_match', 'trend_direction', 'readiness_threshold', 'custom',
  'always'
));

-- Phase 2: Seed Training Integration Rules

-- 2.1: Low Competency → Training Recommendation
INSERT INTO appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type,
  condition_section, condition_operator, condition_value,
  target_module, action_type, action_config,
  auto_execute, requires_approval, execution_order, is_active
)
SELECT DISTINCT 
  company_id,
  'Low Competency → Training Recommendation',
  'Automatically recommends courses when competency scores are below threshold',
  'appraisal_finalized',
  'score_range',
  'competencies',
  '<',
  3.0,
  'training',
  'recommend_courses',
  '{"match_competency_gaps": true, "priority": "high"}'::jsonb,
  true, false, 200, true
FROM appraisal_integration_rules
WHERE company_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM appraisal_integration_rules r2 
  WHERE r2.company_id = appraisal_integration_rules.company_id 
  AND r2.name = 'Low Competency → Training Recommendation'
);

-- 2.2: Goal Gap → Training Request
INSERT INTO appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type,
  condition_section, condition_operator, condition_value,
  target_module, action_type, action_config,
  auto_execute, requires_approval, execution_order, is_active
)
SELECT DISTINCT 
  company_id,
  'Goal Gap → Training Request',
  'Creates training request when goal performance is below expectations',
  'appraisal_finalized',
  'score_range',
  'goals',
  '<',
  3.0,
  'training',
  'create_request',
  '{"learning_path_type": "skill_development", "source": "goal_gap", "priority": "normal"}'::jsonb,
  true, true, 210, true
FROM appraisal_integration_rules
WHERE company_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM appraisal_integration_rules r2 
  WHERE r2.company_id = appraisal_integration_rules.company_id 
  AND r2.name = 'Goal Gap → Training Request'
);

-- 2.3: 360 Feedback → Development Themes
INSERT INTO appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type,
  condition_operator, target_module, action_type, action_config,
  auto_execute, requires_approval, execution_order, is_active
)
SELECT DISTINCT 
  company_id,
  '360 Feedback → Development Themes',
  'Auto-generates development themes from 360 feedback gaps',
  'feedback_360_completed',
  'always',
  '=',
  'development',
  'generate_themes',
  '{"gap_threshold": 0.5, "auto_select": true, "priority": "high"}'::jsonb,
  true, false, 300, true
FROM appraisal_integration_rules
WHERE company_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM appraisal_integration_rules r2 
  WHERE r2.company_id = appraisal_integration_rules.company_id 
  AND r2.name = '360 Feedback → Development Themes'
);

-- Phase 3: Cleanup duplicate rules (keep oldest by created_at)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY company_id, name 
      ORDER BY created_at ASC
    ) as rn
  FROM appraisal_integration_rules
)
DELETE FROM appraisal_integration_rules
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);