-- Phase 1B: Data Migration for Capability Platform (Corrected v2)

-- 1. Migrate existing competencies to capabilities table
INSERT INTO capabilities (
  id,
  company_id,
  code,
  name,
  description,
  type,
  category,
  status,
  effective_from,
  effective_to,
  metadata,
  created_at,
  updated_at
)
SELECT
  id,
  company_id,
  code,
  name,
  description,
  'COMPETENCY'::capability_type,
  CASE 
    WHEN category = 'functional' THEN 'functional'::capability_category
    WHEN category = 'technical' THEN 'technical'::capability_category
    WHEN category = 'behavioral' THEN 'behavioral'::capability_category
    WHEN category = 'leadership' THEN 'leadership'::capability_category
    ELSE 'core'::capability_category
  END,
  CASE 
    WHEN is_active = true THEN 'active'::capability_status 
    ELSE 'deprecated'::capability_status 
  END,
  start_date,
  end_date,
  jsonb_build_object(
    'name_en', name_en,
    'description_en', description_en,
    'migrated_from', 'competencies',
    'legacy_proficiency_levels', proficiency_levels
  ),
  created_at,
  updated_at
FROM competencies
ON CONFLICT (id) DO NOTHING;

-- 2. Migrate employee_competencies to capability_evidence
INSERT INTO capability_evidence (
  id,
  capability_id,
  employee_id,
  evidence_source,
  proficiency_level,
  confidence_score,
  validation_status,
  validated_at,
  notes,
  effective_from,
  created_at,
  updated_at
)
SELECT
  ec.id,
  ec.competency_id,
  ec.employee_id,
  'manager_assessment'::evidence_source,
  COALESCE(cl.level_order, 1),
  1.0,
  'validated'::validation_status,
  ec.updated_at,
  ec.notes,
  COALESCE(ec.start_date, ec.created_at::date),
  ec.created_at,
  ec.updated_at
FROM employee_competencies ec
LEFT JOIN competency_levels cl ON cl.id = ec.competency_level_id
WHERE EXISTS (SELECT 1 FROM capabilities c WHERE c.id = ec.competency_id)
ON CONFLICT (id) DO NOTHING;

-- 3. Add capability_id column to goal_skill_requirements if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goal_skill_requirements' AND column_name = 'capability_id'
  ) THEN
    ALTER TABLE goal_skill_requirements ADD COLUMN capability_id UUID REFERENCES capabilities(id);
  END IF;
END $$;

-- 4. Create index on new column
CREATE INDEX IF NOT EXISTS idx_goal_skill_requirements_capability_id ON goal_skill_requirements(capability_id);

-- 5. Track migration in change history
INSERT INTO capability_change_history (
  capability_id,
  change_type,
  new_values,
  changed_by
)
SELECT 
  c.id,
  'created',
  jsonb_build_object('migrated_from', 'competencies', 'original_id', c.id),
  NULL
FROM capabilities c
WHERE c.type = 'COMPETENCY'
AND NOT EXISTS (
  SELECT 1 FROM capability_change_history cch 
  WHERE cch.capability_id = c.id AND cch.change_type = 'created'
);