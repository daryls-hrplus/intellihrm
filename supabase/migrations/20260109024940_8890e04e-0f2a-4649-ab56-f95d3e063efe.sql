-- Add template_config column to manual_definitions for storing template and branding settings
ALTER TABLE public.manual_definitions 
ADD COLUMN IF NOT EXISTS template_config JSONB DEFAULT '{}'::jsonb;

-- Add target_roles column to manual_sections for role-based content generation
ALTER TABLE public.manual_sections 
ADD COLUMN IF NOT EXISTS target_roles TEXT[] DEFAULT ARRAY['admin']::TEXT[];

-- Add structure_template column to manual_definitions for standard section structure
ALTER TABLE public.manual_definitions 
ADD COLUMN IF NOT EXISTS structure_template TEXT DEFAULT 'training_guide';

-- Add industry_context column to manual_definitions
ALTER TABLE public.manual_definitions 
ADD COLUMN IF NOT EXISTS industry_context TEXT DEFAULT 'enterprise_hr';

-- Update existing manuals with default template config
UPDATE public.manual_definitions
SET template_config = jsonb_build_object(
  'templateType', 'training_guide',
  'branding', jsonb_build_object(
    'primaryColor', '#1e40af',
    'secondaryColor', '#3b82f6',
    'companyName', 'HRplus',
    'footerText', '© 2025 HRplus. Confidential.'
  ),
  'layout', jsonb_build_object(
    'includeTableOfContents', true,
    'includeSummary', true,
    'includePrerequisites', true,
    'includeLearningObjectives', true,
    'includeScreenshots', true,
    'includeStepNumbers', true,
    'includeTimeEstimates', true,
    'includeRoleIndicators', true,
    'includeVersionInfo', true,
    'includeRelatedDocs', true
  ),
  'formatting', jsonb_build_object(
    'headerStyle', 'numbered',
    'calloutStyle', 'confluence',
    'screenshotPlacement', 'annotated',
    'codeBlockTheme', 'auto'
  )
)
WHERE template_config IS NULL OR template_config = '{}'::jsonb;