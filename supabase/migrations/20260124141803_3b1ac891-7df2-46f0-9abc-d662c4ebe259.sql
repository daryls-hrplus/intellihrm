-- Seed cross-module integration rules for Goals → IDP (training equivalent using valid target_module)
INSERT INTO public.appraisal_integration_rules (
  company_id,
  name,
  description,
  trigger_event,
  condition_section,
  condition_type,
  condition_operator,
  condition_value,
  condition_value_max,
  target_module,
  action_type,
  action_config,
  is_active,
  execution_order
)
SELECT 
  c.id as company_id,
  'Goal Gap → Development Plan' as name,
  'Creates development plan when goal performance indicates skill gaps' as description,
  'appraisal_finalized' as trigger_event,
  'goals' as condition_section,
  'score_range' as condition_type,
  '<' as condition_operator,
  1.0 as condition_value,
  3.0 as condition_value_max,
  'idp' as target_module,
  'create' as action_type,
  '{"recommendation_type": "skill_gap", "priority": "medium", "message": "Goal performance below expectations - recommend targeted development"}'::jsonb as action_config,
  true as is_active,
  20 as execution_order
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules air 
  WHERE air.company_id = c.id AND air.name = 'Goal Gap → Development Plan'
);