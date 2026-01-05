-- Add workflow notification preference columns
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS workflow_pending_approval boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS workflow_approved boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS workflow_rejected boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS workflow_escalated boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS workflow_returned boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS workflow_completed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS leave_request_updates boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS training_request_updates boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN notification_preferences.workflow_pending_approval IS 'Notify when a workflow step is assigned to you for approval';
COMMENT ON COLUMN notification_preferences.workflow_approved IS 'Notify when your submitted request is approved';
COMMENT ON COLUMN notification_preferences.workflow_rejected IS 'Notify when your submitted request is rejected';
COMMENT ON COLUMN notification_preferences.workflow_escalated IS 'Notify when a workflow is escalated';
COMMENT ON COLUMN notification_preferences.workflow_returned IS 'Notify when a workflow is returned for revision';
COMMENT ON COLUMN notification_preferences.workflow_completed IS 'Notify when a workflow is fully completed';