-- Phase A: Database Schema Fixes for Chapter 3 Industry Alignment
-- Adds missing fields identified in audit

-- 1. Add missing fields to training_vendors
ALTER TABLE public.training_vendors
ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terminated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS termination_reason TEXT;

COMMENT ON COLUMN public.training_vendors.is_shared IS 'Whether vendor is shared across companies in the group';
COMMENT ON COLUMN public.training_vendors.terminated_at IS 'When vendor relationship was terminated';
COMMENT ON COLUMN public.training_vendors.termination_reason IS 'Reason for vendor termination';

-- 2. Add instructor_id to training_vendor_sessions
ALTER TABLE public.training_vendor_sessions
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES public.training_instructors(id);

COMMENT ON COLUMN public.training_vendor_sessions.instructor_id IS 'External instructor assigned to this session';

-- Create index for instructor lookup
CREATE INDEX IF NOT EXISTS idx_training_vendor_sessions_instructor 
ON public.training_vendor_sessions(instructor_id) 
WHERE instructor_id IS NOT NULL;

-- 3. Ensure competency_course_mappings has vendor_course_id (verify exists)
-- First check if column exists and add if not
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'competency_course_mappings' 
    AND column_name = 'vendor_course_id'
  ) THEN
    ALTER TABLE public.competency_course_mappings
    ADD COLUMN vendor_course_id UUID REFERENCES public.training_vendor_courses(id);
    
    COMMENT ON COLUMN public.competency_course_mappings.vendor_course_id IS 'FK to training_vendor_courses for external course mapping';
    
    CREATE INDEX idx_competency_course_mappings_vendor_course 
    ON public.competency_course_mappings(vendor_course_id) 
    WHERE vendor_course_id IS NOT NULL;
  END IF;
END $$;