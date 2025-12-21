-- Remove strategic_planning as a standalone module since it's now a container inside admin
UPDATE application_modules 
SET is_active = false, parent_module_code = 'admin'
WHERE module_code = 'strategic_planning';

-- Ensure the strategic_analytics container is properly configured
-- (it already exists based on the role_container_access data)