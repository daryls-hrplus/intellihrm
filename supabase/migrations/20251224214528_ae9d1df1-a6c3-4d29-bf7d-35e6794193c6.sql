-- Consolidate all workforce-related features under the main workforce module
-- Get the main workforce module ID: 0493b3f9-64e0-4213-bc72-f26e598b42f6

-- Update features from workforce_core to workforce
UPDATE public.application_features
SET 
  module_id = '0493b3f9-64e0-4213-bc72-f26e598b42f6',
  module_code = 'workforce',
  updated_at = now()
WHERE module_id = '221ba652-35db-4565-9bd8-0f30c5297e78'; -- workforce_core

-- Update features from workforce_analytics to workforce
UPDATE public.application_features
SET 
  module_id = '0493b3f9-64e0-4213-bc72-f26e598b42f6',
  module_code = 'workforce',
  group_code = 'workforce_analytics',
  group_name = 'Workforce Analytics',
  updated_at = now()
WHERE module_id = '6a8dc19a-10ed-4401-be1c-9b2be8a93f08'; -- workforce_analytics

-- Update features from employee_profile to workforce
UPDATE public.application_features
SET 
  module_id = '0493b3f9-64e0-4213-bc72-f26e598b42f6',
  module_code = 'workforce',
  group_code = 'employee_profile',
  group_name = 'Employee Profile',
  updated_at = now()
WHERE module_id = '88ca70bf-a5dc-4b60-8840-76edcfcf6d87'; -- employee_profile

-- Deactivate the now-empty modules (keep for reference but mark inactive)
UPDATE public.application_modules
SET is_active = false, updated_at = now()
WHERE id IN (
  '221ba652-35db-4565-9bd8-0f30c5297e78', -- workforce_core
  '6a8dc19a-10ed-4401-be1c-9b2be8a93f08', -- workforce_analytics
  '88ca70bf-a5dc-4b60-8840-76edcfcf6d87'  -- employee_profile
);

-- Update the main workforce module name to be consistent
UPDATE public.application_modules
SET 
  module_name = 'Workforce Management',
  description = 'Comprehensive employee and organizational structure management',
  updated_at = now()
WHERE id = '0493b3f9-64e0-4213-bc72-f26e598b42f6';