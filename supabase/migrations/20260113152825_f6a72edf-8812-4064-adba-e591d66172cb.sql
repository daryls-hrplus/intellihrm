-- Add pending_deprecation status and audit logging for competency governance

-- Add capability_audit_log table to track all changes to competencies
CREATE TABLE IF NOT EXISTS public.capability_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  capability_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deprecated', 'pending_deprecation', 'restored'
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  blocked_by_cycles JSONB, -- Store cycle IDs that blocked deprecation
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.capability_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for viewing audit logs (HR and admins)
CREATE POLICY "Users can view capability audit logs for their company"
ON public.capability_audit_log
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM skills_competencies sc
    WHERE sc.id = capability_audit_log.capability_id
    AND (sc.company_id IS NULL OR sc.company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    ))
  )
);

-- Policy for inserting audit logs
CREATE POLICY "Authenticated users can create audit logs"
ON public.capability_audit_log
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_capability_audit_log_capability_id 
ON public.capability_audit_log(capability_id);

CREATE INDEX IF NOT EXISTS idx_capability_audit_log_changed_at 
ON public.capability_audit_log(changed_at DESC);

-- Add competency_version column to appraisal_scores if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appraisal_scores' 
    AND column_name = 'competency_version'
  ) THEN
    ALTER TABLE public.appraisal_scores ADD COLUMN competency_version INTEGER;
  END IF;
END $$;