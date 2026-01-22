-- Add process_type column to goal_approval_rules
ALTER TABLE public.goal_approval_rules 
ADD COLUMN IF NOT EXISTS process_type text NOT NULL DEFAULT 'goals';

-- Add check constraint to ensure valid process types
ALTER TABLE public.goal_approval_rules 
ADD CONSTRAINT goal_approval_rules_process_type_check 
CHECK (process_type IN ('goals', 'appraisals', '360_feedback', 'learning', 'succession'));

-- Create index for efficient filtering by process_type
CREATE INDEX IF NOT EXISTS idx_goal_approval_rules_process_type 
ON public.goal_approval_rules(process_type);