-- Government ID Submission Workflow Template
INSERT INTO public.workflow_templates (
  id,
  code,
  name,
  description,
  category,
  is_active,
  is_global,
  requires_signature,
  requires_letter,
  auto_terminate_hours,
  allow_return_to_previous,
  created_by,
  start_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'GOVERNMENT_ID_SUBMISSION',
  'Government ID Submission',
  'Workflow for employees to submit new or updated government identification documents for HR verification and approval.',
  'general',
  true,
  true,
  false,
  false,
  72,
  true,
  '9f537c12-cbd4-40ff-ba9e-187a8bd32916',
  CURRENT_DATE,
  now(),
  now()
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Immigration Document Submission Workflow Template
INSERT INTO public.workflow_templates (
  id,
  code,
  name,
  description,
  category,
  is_active,
  is_global,
  requires_signature,
  requires_letter,
  auto_terminate_hours,
  allow_return_to_previous,
  created_by,
  start_date,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'IMMIGRATION_DOCUMENT_SUBMISSION',
  'Immigration Document Submission',
  'Workflow for employees to submit work permits, CSME certificates, travel documents, and other immigration-related documentation for HR verification.',
  'general',
  true,
  true,
  false,
  false,
  72,
  true,
  '9f537c12-cbd4-40ff-ba9e-187a8bd32916',
  CURRENT_DATE,
  now(),
  now()
) ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();