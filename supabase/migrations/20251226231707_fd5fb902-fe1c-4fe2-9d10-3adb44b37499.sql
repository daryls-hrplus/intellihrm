-- Create translation queue table for background processing
CREATE TABLE public.translation_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT NOT NULL,
  source_text TEXT NOT NULL,
  detected_language TEXT,
  translated_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(table_name, record_id, field_name, source_text)
);

-- Enable RLS
ALTER TABLE public.translation_queue ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role has full access to translation_queue"
ON public.translation_queue
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for efficient queue processing
CREATE INDEX idx_translation_queue_status ON public.translation_queue(status) WHERE status = 'pending';
CREATE INDEX idx_translation_queue_table_record ON public.translation_queue(table_name, record_id);

-- Add _en shadow columns to existing tables with free-text fields

-- job_requisitions
ALTER TABLE public.job_requisitions 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS requirements_en TEXT,
ADD COLUMN IF NOT EXISTS responsibilities_en TEXT,
ADD COLUMN IF NOT EXISTS benefits_en TEXT;

-- departments
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- performance_goals
ALTER TABLE public.performance_goals 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS success_criteria_en TEXT;

-- policy_documents
ALTER TABLE public.policy_documents 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS content_en TEXT;

-- grievances
ALTER TABLE public.grievances 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS resolution_notes_en TEXT;

-- Create function to queue translations
CREATE OR REPLACE FUNCTION public.queue_translation(
  p_table_name TEXT,
  p_record_id UUID,
  p_field_name TEXT,
  p_source_text TEXT
) RETURNS VOID AS $$
BEGIN
  -- Skip if source text is null or empty
  IF p_source_text IS NULL OR trim(p_source_text) = '' THEN
    RETURN;
  END IF;
  
  -- Insert or update queue entry (upsert)
  INSERT INTO public.translation_queue (table_name, record_id, field_name, source_text, status)
  VALUES (p_table_name, p_record_id, p_field_name, p_source_text, 'pending')
  ON CONFLICT (table_name, record_id, field_name, source_text) 
  DO UPDATE SET status = 'pending', attempts = 0, error_message = NULL, processed_at = NULL
  WHERE translation_queue.status IN ('failed', 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger function for job_requisitions
CREATE OR REPLACE FUNCTION public.trigger_queue_job_requisitions_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('job_requisitions', NEW.id, 'description', NEW.description);
  END IF;
  IF NEW.requirements IS DISTINCT FROM OLD.requirements THEN
    PERFORM queue_translation('job_requisitions', NEW.id, 'requirements', NEW.requirements);
  END IF;
  IF NEW.responsibilities IS DISTINCT FROM OLD.responsibilities THEN
    PERFORM queue_translation('job_requisitions', NEW.id, 'responsibilities', NEW.responsibilities);
  END IF;
  IF NEW.benefits IS DISTINCT FROM OLD.benefits THEN
    PERFORM queue_translation('job_requisitions', NEW.id, 'benefits', NEW.benefits);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_job_requisitions_translation ON public.job_requisitions;
CREATE TRIGGER queue_job_requisitions_translation
AFTER INSERT OR UPDATE ON public.job_requisitions
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_job_requisitions_translation();

-- Create trigger function for departments
CREATE OR REPLACE FUNCTION public.trigger_queue_departments_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('departments', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_departments_translation ON public.departments;
CREATE TRIGGER queue_departments_translation
AFTER INSERT OR UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_departments_translation();

-- Create trigger function for performance_goals
CREATE OR REPLACE FUNCTION public.trigger_queue_performance_goals_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('performance_goals', NEW.id, 'description', NEW.description);
  END IF;
  IF NEW.success_criteria IS DISTINCT FROM OLD.success_criteria THEN
    PERFORM queue_translation('performance_goals', NEW.id, 'success_criteria', NEW.success_criteria);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_performance_goals_translation ON public.performance_goals;
CREATE TRIGGER queue_performance_goals_translation
AFTER INSERT OR UPDATE ON public.performance_goals
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_performance_goals_translation();

-- Create trigger function for policy_documents
CREATE OR REPLACE FUNCTION public.trigger_queue_policy_documents_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title THEN
    PERFORM queue_translation('policy_documents', NEW.id, 'title', NEW.title);
  END IF;
  IF NEW.content IS DISTINCT FROM OLD.content THEN
    PERFORM queue_translation('policy_documents', NEW.id, 'content', NEW.content);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_policy_documents_translation ON public.policy_documents;
CREATE TRIGGER queue_policy_documents_translation
AFTER INSERT OR UPDATE ON public.policy_documents
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_policy_documents_translation();

-- Create trigger function for grievances
CREATE OR REPLACE FUNCTION public.trigger_queue_grievances_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('grievances', NEW.id, 'description', NEW.description);
  END IF;
  IF NEW.resolution_notes IS DISTINCT FROM OLD.resolution_notes THEN
    PERFORM queue_translation('grievances', NEW.id, 'resolution_notes', NEW.resolution_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_grievances_translation ON public.grievances;
CREATE TRIGGER queue_grievances_translation
AFTER INSERT OR UPDATE ON public.grievances
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_grievances_translation();