-- Seed Default Goal Locking Rules for each company
INSERT INTO public.goal_locking_rules (
  id,
  company_id,
  name,
  description,
  rule_type,
  trigger_status,
  allow_admin_override,
  allow_adjustment_request,
  is_active,
  priority,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  'Lock on Approval',
  'Automatically lock goal when it receives manager approval',
  'on_approval',
  ARRAY['approved'],
  true,
  true,
  true,
  1,
  now(),
  now()
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM goal_locking_rules glr 
  WHERE glr.company_id = c.id AND glr.name = 'Lock on Approval'
);

INSERT INTO public.goal_locking_rules (
  id,
  company_id,
  name,
  description,
  rule_type,
  trigger_status,
  allow_admin_override,
  allow_adjustment_request,
  is_active,
  priority,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  c.id,
  'Lock on Cycle Freeze',
  'Lock all goals in a cycle when the goal setting period ends',
  'on_cycle_freeze',
  ARRAY['frozen'],
  true,
  false,
  true,
  2,
  now(),
  now()
FROM companies c
WHERE NOT EXISTS (
  SELECT 1 FROM goal_locking_rules glr 
  WHERE glr.company_id = c.id AND glr.name = 'Lock on Cycle Freeze'
);