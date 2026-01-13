-- =============================================
-- PART 1: Make company_id nullable for global templates
-- =============================================

ALTER TABLE public.performance_rating_scales 
  ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE public.overall_rating_scales 
  ALTER COLUMN company_id DROP NOT NULL;

ALTER TABLE public.overall_rating_mappings 
  ALTER COLUMN company_id DROP NOT NULL;

-- =============================================
-- PART 2: Add scope column to distinguish global vs company-specific
-- =============================================

ALTER TABLE public.performance_rating_scales 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'company';

DO $$ BEGIN
  ALTER TABLE public.performance_rating_scales 
    ADD CONSTRAINT performance_rating_scales_scope_check CHECK (scope IN ('global', 'company'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.overall_rating_scales 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'company';

DO $$ BEGIN
  ALTER TABLE public.overall_rating_scales 
    ADD CONSTRAINT overall_rating_scales_scope_check CHECK (scope IN ('global', 'company'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.overall_rating_mappings 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'company';

DO $$ BEGIN
  ALTER TABLE public.overall_rating_mappings 
    ADD CONSTRAINT overall_rating_mappings_scope_check CHECK (scope IN ('global', 'company'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.appraisal_form_templates 
  ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'company';

DO $$ BEGIN
  ALTER TABLE public.appraisal_form_templates 
    ADD CONSTRAINT appraisal_form_templates_scope_check CHECK (scope IN ('global', 'company'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================
-- PART 3: Add source_template_id for inheritance tracking
-- =============================================

ALTER TABLE public.performance_rating_scales 
  ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES public.performance_rating_scales(id);

ALTER TABLE public.overall_rating_scales 
  ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES public.overall_rating_scales(id);

ALTER TABLE public.overall_rating_mappings 
  ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES public.overall_rating_mappings(id);

ALTER TABLE public.appraisal_form_templates 
  ADD COLUMN IF NOT EXISTS source_template_id UUID REFERENCES public.appraisal_form_templates(id);

-- =============================================
-- PART 4: Update existing records to have company scope
-- =============================================

UPDATE public.performance_rating_scales SET scope = 'company' WHERE scope IS NULL;
UPDATE public.overall_rating_scales SET scope = 'company' WHERE scope IS NULL;
UPDATE public.overall_rating_mappings SET scope = 'company' WHERE scope IS NULL;
UPDATE public.appraisal_form_templates SET scope = 'company' WHERE scope IS NULL;