-- Create capability version history table for audit trail
CREATE TABLE IF NOT EXISTS public.capability_version_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES public.skills_competencies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot_data JSONB NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'status_change', 'version_bump')),
  change_summary TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_capability_version_history_capability_id ON public.capability_version_history(capability_id);
CREATE INDEX idx_capability_version_history_version ON public.capability_version_history(capability_id, version DESC);

-- Enable RLS
ALTER TABLE public.capability_version_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read version history for capabilities they can access
CREATE POLICY "capability_version_history_select" ON public.capability_version_history
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert version history
CREATE POLICY "capability_version_history_insert" ON public.capability_version_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create trigger to automatically log version history on capability changes
CREATE OR REPLACE FUNCTION public.log_capability_version_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Determine change type
  DECLARE
    change_type TEXT;
    change_summary TEXT;
  BEGIN
    IF TG_OP = 'INSERT' THEN
      change_type := 'created';
      change_summary := 'Capability created';
    ELSIF OLD.version != NEW.version THEN
      change_type := 'version_bump';
      change_summary := format('Version updated from %s to %s', OLD.version, NEW.version);
    ELSIF OLD.status != NEW.status THEN
      change_type := 'status_change';
      change_summary := format('Status changed from %s to %s', OLD.status, NEW.status);
    ELSE
      change_type := 'updated';
      change_summary := 'Capability updated';
    END IF;
    
    -- Insert snapshot
    INSERT INTO public.capability_version_history (
      capability_id,
      version,
      snapshot_data,
      change_type,
      change_summary,
      changed_by
    ) VALUES (
      NEW.id,
      NEW.version,
      to_jsonb(NEW),
      change_type,
      change_summary,
      auth.uid()
    );
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on skills_competencies table
DROP TRIGGER IF EXISTS trigger_log_capability_version_history ON public.skills_competencies;
CREATE TRIGGER trigger_log_capability_version_history
  AFTER INSERT OR UPDATE ON public.skills_competencies
  FOR EACH ROW
  EXECUTE FUNCTION public.log_capability_version_history();