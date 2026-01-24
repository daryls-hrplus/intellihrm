-- =======================================================
-- Clean up duplicate integration rules and add competency-based IDP rules
-- =======================================================

-- First, clean up duplicate "Goal Gap → Development Plan" rules (keep only one per company)
DELETE FROM public.appraisal_integration_rules
WHERE name = 'Goal Gap → Development Plan'
AND id::text NOT IN (
  SELECT MIN(id::text) FROM public.appraisal_integration_rules
  WHERE name = 'Goal Gap → Development Plan'
  GROUP BY company_id
);

-- Insert Competency-based IDP rule for all companies (learning gap)
INSERT INTO public.appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type, condition_operator, 
  condition_value, condition_section, target_module, action_type, action_config, 
  auto_execute, requires_approval, execution_order, is_active
)
SELECT 
  c.id,
  'Low Competency IDP Creation',
  'Employees with low competency scores (< 3.0) trigger Individual Development Plan creation',
  'appraisal_finalized',
  'score_range',
  '<',
  3.0,
  'competency',
  'idp',
  'create',
  '{"priority": "high", "focus_area": "competency_gaps", "notification_type": "manager_and_employee"}'::jsonb,
  false,
  false,
  60,
  true
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules r 
  WHERE r.company_id = c.id 
  AND r.name = 'Low Competency IDP Creation'
);

-- Insert High Performer Succession Planning rule
INSERT INTO public.appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type, condition_operator, 
  condition_value, condition_section, target_module, action_type, action_config, 
  auto_execute, requires_approval, execution_order, is_active
)
SELECT 
  c.id,
  'High Goal Achievement Succession Update',
  'Employees with exceptional goal achievement (>= 4.5) are flagged for succession readiness',
  'appraisal_finalized',
  'score_range',
  '>=',
  4.5,
  'goals',
  'succession',
  'update',
  '{"readiness_level": "ready_now", "flag_type": "high_potential", "priority": "high"}'::jsonb,
  false,
  true,
  70,
  true
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules r 
  WHERE r.company_id = c.id 
  AND r.name = 'High Goal Achievement Succession Update'
);

-- Insert Nine-Box update for goal achievers
INSERT INTO public.appraisal_integration_rules (
  company_id, name, description, trigger_event, condition_type, condition_operator, 
  condition_value, condition_section, target_module, action_type, action_config, 
  auto_execute, requires_approval, execution_order, is_active
)
SELECT 
  c.id,
  'High Performer Nine-Box Update',
  'High overall performers (>= 4.0) are updated on the nine-box matrix',
  'appraisal_finalized',
  'score_range',
  '>=',
  4.0,
  'overall',
  'nine_box',
  'update',
  '{"performance_axis": "high", "auto_calculate_potential": true}'::jsonb,
  false,
  true,
  75,
  true
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.appraisal_integration_rules r 
  WHERE r.company_id = c.id 
  AND r.name = 'High Performer Nine-Box Update'
);