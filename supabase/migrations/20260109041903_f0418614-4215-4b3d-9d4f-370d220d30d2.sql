-- Add new columns to manual_sections for hybrid system (if not exists)
ALTER TABLE public.manual_sections 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_reference TEXT,
ADD COLUMN IF NOT EXISTS markdown_content TEXT,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1;

-- Add check constraint if not exists (using DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'manual_sections_source_type_check'
  ) THEN
    ALTER TABLE public.manual_sections 
    ADD CONSTRAINT manual_sections_source_type_check 
    CHECK (source_type IN ('imported', 'ai_generated', 'manual'));
  END IF;
END $$;

-- Add markdown_content column to manual_section_versions if not exists
ALTER TABLE public.manual_section_versions
ADD COLUMN IF NOT EXISTS markdown_content TEXT;

-- Create or replace the versioning function
CREATE OR REPLACE FUNCTION public.create_section_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content or title changed
  IF OLD.content IS DISTINCT FROM NEW.content OR OLD.title IS DISTINCT FROM NEW.title OR OLD.markdown_content IS DISTINCT FROM NEW.markdown_content THEN
    INSERT INTO public.manual_section_versions (
      section_id,
      version_number,
      title,
      content,
      markdown_content,
      changed_by,
      change_type,
      change_summary
    ) VALUES (
      NEW.id,
      COALESCE(NEW.current_version, 1),
      OLD.title,
      OLD.content,
      OLD.markdown_content,
      auth.uid(),
      'content',
      'Auto-saved version before update'
    );
    
    NEW.current_version := COALESCE(NEW.current_version, 1) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_create_section_version ON public.manual_sections;

CREATE TRIGGER trigger_create_section_version
BEFORE UPDATE ON public.manual_sections
FOR EACH ROW
EXECUTE FUNCTION public.create_section_version();