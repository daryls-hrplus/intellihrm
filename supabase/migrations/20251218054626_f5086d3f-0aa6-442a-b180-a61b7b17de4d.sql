-- Drop the old constraint and add the new one with updated workflow statuses
ALTER TABLE enablement_content_status 
DROP CONSTRAINT IF EXISTS enablement_content_status_workflow_status_check;

ALTER TABLE enablement_content_status 
ADD CONSTRAINT enablement_content_status_workflow_status_check 
CHECK (workflow_status = ANY (ARRAY['backlog'::text, 'planning'::text, 'development'::text, 'review'::text, 'published'::text, 'maintenance'::text]));

-- Update any existing records that use old status names
UPDATE enablement_content_status 
SET workflow_status = 'development' 
WHERE workflow_status = 'in_progress';

UPDATE enablement_content_status 
SET workflow_status = 'maintenance' 
WHERE workflow_status = 'archived';