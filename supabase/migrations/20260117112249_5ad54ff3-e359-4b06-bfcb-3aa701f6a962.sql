-- Phase 1B: Migrate existing company_values data to skills_competencies

-- Migrate existing company_values to skills_competencies
INSERT INTO skills_competencies (
  company_id,
  type,
  name,
  code,
  description,
  category,
  proficiency_indicators,
  is_promotion_factor,
  weight,
  status,
  display_order,
  version,
  effective_from,
  created_at,
  updated_at
)
SELECT 
  cv.company_id,
  'VALUE'::capability_type,
  cv.name,
  COALESCE(cv.code, UPPER(REPLACE(cv.name, ' ', '_'))),
  cv.description,
  'core'::capability_category,
  cv.behavioral_indicators::jsonb,
  cv.is_promotion_factor,
  cv.weight,
  CASE WHEN cv.is_active THEN 'active'::capability_status ELSE 'deprecated'::capability_status END,
  cv.display_order,
  1,
  cv.created_at::date,
  cv.created_at,
  cv.updated_at
FROM company_values cv
WHERE NOT EXISTS (
  SELECT 1 FROM skills_competencies sc 
  WHERE sc.company_id = cv.company_id 
  AND sc.name = cv.name 
  AND sc.type = 'VALUE'
);

-- Populate the mapping table
INSERT INTO value_capability_mapping (old_value_id, new_capability_id)
SELECT 
  cv.id as old_value_id,
  sc.id as new_capability_id
FROM company_values cv
JOIN skills_competencies sc ON 
  sc.company_id = cv.company_id 
  AND sc.name = cv.name 
  AND sc.type = 'VALUE'
ON CONFLICT (old_value_id) DO NOTHING;

-- Migrate existing appraisal_value_scores to unified table
INSERT INTO appraisal_capability_scores (
  participant_id,
  capability_id,
  capability_type,
  rating,
  demonstrated_behaviors,
  evidence,
  comments,
  assessed_by,
  assessment_source,
  created_at,
  updated_at
)
SELECT 
  avs.participant_id,
  vcm.new_capability_id,
  'VALUE'::capability_type,
  avs.rating,
  CASE 
    WHEN avs.demonstrated_behaviors IS NULL THEN NULL
    WHEN jsonb_typeof(avs.demonstrated_behaviors) = 'array' 
    THEN ARRAY(SELECT jsonb_array_elements_text(avs.demonstrated_behaviors))
    ELSE NULL
  END,
  avs.evidence,
  avs.comments,
  avs.assessed_by,
  'manager',
  avs.created_at,
  avs.updated_at
FROM appraisal_value_scores avs
JOIN value_capability_mapping vcm ON vcm.old_value_id = avs.value_id
WHERE NOT EXISTS (
  SELECT 1 FROM appraisal_capability_scores acs
  WHERE acs.participant_id = avs.participant_id
  AND acs.capability_id = vcm.new_capability_id
);