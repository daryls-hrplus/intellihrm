-- Add custom_sql field to report_templates for AI-generated queries
ALTER TABLE public.report_templates 
ADD COLUMN IF NOT EXISTS custom_sql TEXT;

-- Add a comment explaining the field
COMMENT ON COLUMN public.report_templates.custom_sql IS 'AI-generated SQL query for complex reports with aggregations, grouping, cross-tabs, etc.';