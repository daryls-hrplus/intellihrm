-- Seed ONLY compensation integration rules (training rules skipped - need schema change for action_type)

-- Rule 1: Exceptional Performer → Merit Review
INSERT INTO public.appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type, 
  condition_operator, condition_category_codes, target_module, 
  action_type, action_config, auto_execute, requires_approval, 
  execution_order, is_active
)
SELECT DISTINCT 
  company_id,
  'Exceptional Performer → Merit Review',
  'Flags exceptional performers for merit increase consideration',
  'category_assigned',
  'category_match',
  'in',
  '["exceptional"]'::jsonb,
  'compensation',
  'flag',
  '{"flag_type": "merit_eligible", "recommended_action": "merit_increase", "priority": "high"}'::jsonb,
  true, false, 100, true
FROM public.appraisal_integration_rules
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules r2 
  WHERE r2.company_id = appraisal_integration_rules.company_id 
  AND r2.name = 'Exceptional Performer → Merit Review'
);

-- Rule 2: Exceeds Expectations → Compensation Review
INSERT INTO public.appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type, 
  condition_operator, condition_category_codes, target_module, 
  action_type, action_config, auto_execute, requires_approval, 
  execution_order, is_active
)
SELECT DISTINCT 
  company_id,
  'Exceeds Expectations → Compensation Review',
  'Flags employees who exceed expectations for compensation review',
  'category_assigned',
  'category_match',
  'in',
  '["exceeds"]'::jsonb,
  'compensation',
  'flag',
  '{"flag_type": "review", "recommended_action": "review", "priority": "normal"}'::jsonb,
  true, false, 110, true
FROM public.appraisal_integration_rules
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules r2 
  WHERE r2.company_id = appraisal_integration_rules.company_id 
  AND r2.name = 'Exceeds Expectations → Compensation Review'
);

-- Rule 3: High Goal Achievement → Bonus Eligibility
INSERT INTO public.appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type, 
  condition_operator, condition_value, condition_section, target_module, 
  action_type, action_config, auto_execute, requires_approval, 
  execution_order, is_active
)
SELECT DISTINCT 
  company_id,
  'High Goal Achievement → Bonus Eligibility',
  'Flags employees with high goal scores for bonus consideration',
  'appraisal_finalized',
  'score_range',
  '>=',
  4.0,
  'goals',
  'compensation',
  'flag',
  '{"flag_type": "bonus_eligible", "recommended_action": "bonus", "priority": "normal"}'::jsonb,
  true, false, 120, true
FROM public.appraisal_integration_rules
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules r2 
  WHERE r2.company_id = appraisal_integration_rules.company_id 
  AND r2.name = 'High Goal Achievement → Bonus Eligibility'
);