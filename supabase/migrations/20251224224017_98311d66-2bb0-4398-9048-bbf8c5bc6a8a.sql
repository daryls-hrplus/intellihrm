
-- Remap hse features to safety, then delete hse module
UPDATE application_features 
SET module_id = (SELECT id FROM application_modules WHERE module_code = 'safety'),
    module_code = 'safety'
WHERE module_code = 'hse';

UPDATE enablement_content_status SET module_code = 'safety' WHERE module_code = 'hse';

-- Delete the non-canonical hse and help modules
DELETE FROM application_modules WHERE module_code IN ('hse', 'help');
