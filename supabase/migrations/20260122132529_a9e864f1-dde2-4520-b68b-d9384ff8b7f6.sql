-- Update existing workflow_templates categories to match new workflow codes

-- Update PIP-related templates
UPDATE workflow_templates 
SET category = 'pip_acknowledgment' 
WHERE (code ILIKE '%PIP%' OR name ILIKE '%PIP%') 
  AND (category = 'performance' OR category IS NULL);

-- Update Rating/Appraisal/Calibration templates to rating_approval
UPDATE workflow_templates 
SET category = 'rating_approval' 
WHERE (code ILIKE '%APPRAISAL%' OR code ILIKE '%RATING%' OR code ILIKE '%CALIBRATION%' OR name ILIKE '%Appraisal%' OR name ILIKE '%Rating%')
  AND code NOT ILIKE '%PIP%';

-- Update 360 feedback templates  
UPDATE workflow_templates 
SET category = 'feedback_360_approval' 
WHERE (code ILIKE '%360%' OR name ILIKE '%360%');

-- Update goal-related templates
UPDATE workflow_templates 
SET category = 'goal_approval_individual' 
WHERE (code ILIKE '%GOAL%' OR name ILIKE '%Goal%');

-- Update succession-related templates
UPDATE workflow_templates 
SET category = 'succession_approval' 
WHERE (code ILIKE '%SUCCESSION%' OR name ILIKE '%Succession%');

-- Update rating release templates
UPDATE workflow_templates 
SET category = 'rating_release_approval' 
WHERE (code ILIKE '%RELEASE%' OR name ILIKE '%Release%');