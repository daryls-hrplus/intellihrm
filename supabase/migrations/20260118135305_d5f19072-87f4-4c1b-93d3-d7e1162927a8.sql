-- Add tracking columns to appraisal_cycles for activation audit trail
ALTER TABLE public.appraisal_cycles 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activated_by UUID REFERENCES auth.users(id);

-- Add comment for documentation
COMMENT ON COLUMN public.appraisal_cycles.activated_at IS 'Timestamp when cycle was manually activated';
COMMENT ON COLUMN public.appraisal_cycles.activated_by IS 'User who activated the cycle';

-- Insert new event type for Appraisal Cycle Activation
INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'APPRAISAL_CYCLE_ACTIVATED', 'Appraisal Cycle Activated', 'Triggered when an appraisal cycle status changes to Active - notifies participants and managers', 'performance', 'appraisal_cycles', 'activated_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'APPRAISAL_CYCLE_ACTIVATED');

-- Insert manager team notification event type
INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
SELECT 'APPRAISAL_MANAGER_TEAM_DUTY', 'Manager Team Appraisal Duties', 'Consolidated notification to managers about their team members requiring appraisal evaluation', 'performance', 'appraisal_cycles', 'activated_at', true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_event_types WHERE code = 'APPRAISAL_MANAGER_TEAM_DUTY');