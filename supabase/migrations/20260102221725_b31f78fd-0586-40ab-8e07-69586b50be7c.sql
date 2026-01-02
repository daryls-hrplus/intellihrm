-- Insert default print settings for Appraisals Admin Manual
INSERT INTO enablement_document_templates (
  name, 
  category, 
  description,
  layout_config,
  sections_config,
  formatting_config,
  branding_config,
  is_active
) VALUES (
  'Appraisals Admin Manual Print Settings',
  'custom',
  'Print configuration for the Appraisals Administrator Manual',
  '{"pageSize": "A4", "orientation": "portrait", "margins": {"top": 25, "bottom": 25, "left": 20, "right": 20}}'::jsonb,
  '{"includeCover": true, "includeTableOfContents": true, "includeHeaders": true, "includeFooters": true, "includePageNumbers": true, "headerContent": "Appraisals Administrator Manual", "footerContent": "Confidential - Internal Use Only", "tocDepth": 2, "pageNumberPosition": "right", "pageNumberFormat": "pageOfTotal"}'::jsonb,
  '{"fontFamily": "Inter", "baseFontSize": 11, "headingFontSize": 16, "lineHeight": 1.5}'::jsonb,
  '{"applyBrandColors": true, "coverStyle": "branded", "headerStyle": "branded"}'::jsonb,
  true
);