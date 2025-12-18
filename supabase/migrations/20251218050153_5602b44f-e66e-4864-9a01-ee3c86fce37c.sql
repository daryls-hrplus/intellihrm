-- Add time estimate fields to enablement_content_status
ALTER TABLE public.enablement_content_status 
ADD COLUMN IF NOT EXISTS estimated_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_hours numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_estimated_hours numeric,
ADD COLUMN IF NOT EXISTS time_estimate_notes text;

-- Add target release date to releases for planning
ALTER TABLE public.enablement_releases
ADD COLUMN IF NOT EXISTS target_release_date date,
ADD COLUMN IF NOT EXISTS total_estimated_hours numeric DEFAULT 0;

-- Create a change tracking table for more granular tracking
CREATE TABLE IF NOT EXISTS public.enablement_change_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type text NOT NULL, -- 'feature', 'module', 'component', 'edge_function', 'database_table', 'rls_policy'
  entity_name text NOT NULL,
  entity_code text,
  change_type text NOT NULL, -- 'created', 'updated', 'deleted', 'deployed'
  change_category text NOT NULL, -- 'ui', 'backend', 'database', 'edge_function', 'configuration'
  change_details jsonb,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  source text DEFAULT 'manual', -- 'manual', 'auto_detect', 'deployment'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enablement_change_tracking ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write
CREATE POLICY "Allow authenticated users to manage change tracking"
ON public.enablement_change_tracking
FOR ALL
USING (true)
WITH CHECK (true);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_change_tracking_entity ON public.enablement_change_tracking(entity_type, entity_code);
CREATE INDEX IF NOT EXISTS idx_change_tracking_date ON public.enablement_change_tracking(changed_at DESC);