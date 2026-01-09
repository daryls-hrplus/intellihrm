-- Add document_type and is_default_for_type columns to enablement_document_templates
ALTER TABLE public.enablement_document_templates
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'training_guide',
ADD COLUMN IF NOT EXISTS is_default_for_type BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preview_thumbnail TEXT;

-- Create unique partial index for single default per type per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_default_per_type_company 
ON public.enablement_document_templates (document_type, company_id) 
WHERE is_default_for_type = true;

-- Update existing templates with document_type based on category
UPDATE public.enablement_document_templates
SET document_type = category
WHERE document_type IS NULL OR document_type = 'training_guide';

-- Add comment for documentation
COMMENT ON COLUMN public.enablement_document_templates.document_type IS 'The document type this template applies to (training_guide, user_manual, sop, quick_start)';
COMMENT ON COLUMN public.enablement_document_templates.is_default_for_type IS 'Whether this template is the default for its document type';