-- Add subcategory column to reminder_email_templates
ALTER TABLE reminder_email_templates ADD COLUMN IF NOT EXISTS subcategory text;

-- Update existing workforce templates with subcategories
-- New Hire & Onboarding
UPDATE reminder_email_templates SET subcategory = 'new_hire_onboarding' 
WHERE category = 'workforce' AND (
  name ILIKE '%new hire%' OR 
  name ILIKE '%rehire%' OR
  name ILIKE '%onboarding%'
);

-- Probation
UPDATE reminder_email_templates SET subcategory = 'probation' 
WHERE category = 'workforce' AND name ILIKE '%probation%';

-- Acting & Temporary Assignments
UPDATE reminder_email_templates SET subcategory = 'acting_temporary' 
WHERE category = 'workforce' AND (
  name ILIKE '%acting%' OR 
  name ILIKE '%secondment%' OR
  name ILIKE '%temporary%'
);

-- Position & Salary Changes
UPDATE reminder_email_templates SET subcategory = 'position_salary' 
WHERE category = 'workforce' AND (
  name ILIKE '%position%' OR 
  name ILIKE '%salary%' OR
  name ILIKE '%transfer%' OR
  name ILIKE '%vacancy%'
);

-- Separation & Offboarding
UPDATE reminder_email_templates SET subcategory = 'separation_offboarding' 
WHERE category = 'workforce' AND (
  name ILIKE '%separation%' OR 
  name ILIKE '%last working%' OR
  name ILIKE '%exit interview%' OR
  name ILIKE '%offboarding%' OR
  name ILIKE '%equipment return%' OR
  name ILIKE '%knowledge transfer%'
);

-- Other Workforce Events (birthday, anniversary, contract, retirement)
UPDATE reminder_email_templates SET subcategory = 'other_workforce' 
WHERE category = 'workforce' AND subcategory IS NULL;