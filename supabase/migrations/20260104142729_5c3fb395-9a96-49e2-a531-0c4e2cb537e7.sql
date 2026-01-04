-- Add versioning columns to reminder_email_templates
ALTER TABLE public.reminder_email_templates
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS version_notes text,
ADD COLUMN IF NOT EXISTS previous_version_id uuid REFERENCES public.reminder_email_templates(id);

-- Create template versions history table
CREATE TABLE IF NOT EXISTS public.reminder_email_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.reminder_email_templates(id) ON DELETE CASCADE,
  version integer NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  version_notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reminder_email_template_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for template versions
CREATE POLICY "Users can view template versions for their company or default templates"
ON public.reminder_email_template_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.reminder_email_templates t
    WHERE t.id = template_id
    AND (t.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    ) OR t.is_default = true)
  )
);

CREATE POLICY "Users can create template versions for their company"
ON public.reminder_email_template_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.reminder_email_templates t
    WHERE t.id = template_id
    AND t.company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_template_versions_template_id ON public.reminder_email_template_versions(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_version ON public.reminder_email_template_versions(template_id, version DESC);

-- Function to archive template version before update
CREATE OR REPLACE FUNCTION public.archive_template_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only archive if content actually changed
  IF OLD.subject IS DISTINCT FROM NEW.subject 
     OR OLD.body IS DISTINCT FROM NEW.body 
     OR OLD.name IS DISTINCT FROM NEW.name THEN
    
    -- Archive the old version
    INSERT INTO public.reminder_email_template_versions (
      template_id, version, name, subject, body, version_notes, created_by
    ) VALUES (
      OLD.id, OLD.version, OLD.name, OLD.subject, OLD.body, 
      NEW.version_notes, auth.uid()
    );
    
    -- Increment version number
    NEW.version := COALESCE(OLD.version, 1) + 1;
    NEW.previous_version_id := OLD.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-archive on update
DROP TRIGGER IF EXISTS archive_template_version_trigger ON public.reminder_email_templates;
CREATE TRIGGER archive_template_version_trigger
  BEFORE UPDATE ON public.reminder_email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.archive_template_version();