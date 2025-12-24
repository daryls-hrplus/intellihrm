-- Drop any existing check constraint first
ALTER TABLE public.enablement_content_status 
DROP CONSTRAINT IF EXISTS enablement_content_status_workflow_status_check;

-- Update the existing values to the new stage names
UPDATE public.enablement_content_status 
SET workflow_status = 'development_backlog' 
WHERE workflow_status IN ('backlog', 'planning');

UPDATE public.enablement_content_status 
SET workflow_status = 'in_development' 
WHERE workflow_status = 'development';

UPDATE public.enablement_content_status 
SET workflow_status = 'testing_review' 
WHERE workflow_status = 'review';

-- Add new check constraint with all valid values
ALTER TABLE public.enablement_content_status 
ADD CONSTRAINT enablement_content_status_workflow_status_check 
CHECK (workflow_status IN (
  'development_backlog', 
  'in_development', 
  'testing_review', 
  'documentation', 
  'ready_for_enablement', 
  'published', 
  'maintenance', 
  'archived'
));