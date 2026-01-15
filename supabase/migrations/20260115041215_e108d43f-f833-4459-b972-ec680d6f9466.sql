-- Phase 1: Create missing application features from unmatched admin_routes
-- First, get the default module for admin routes
DO $$
DECLARE
  default_module_id UUID;
BEGIN
  -- Get or create the admin module
  SELECT id INTO default_module_id FROM application_modules WHERE module_code = 'admin' LIMIT 1;
  
  IF default_module_id IS NULL THEN
    INSERT INTO application_modules (module_code, module_name, route_path, description)
    VALUES ('admin', 'Administration', '/admin', 'Administrative functions and settings')
    RETURNING id INTO default_module_id;
  END IF;

  -- Insert missing features for unmatched admin_routes
  INSERT INTO application_features (
    feature_code,
    feature_name,
    route_path,
    module_id,
    module_code,
    source,
    is_active,
    description
  )
  SELECT DISTINCT
    -- Generate feature_code from route path
    LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(it.admin_route, '^/', ''),
      '[/-]', '_', 'g'
    )) as feature_code,
    -- Generate feature_name from area
    COALESCE(it.area, 'Migrated Feature') as feature_name,
    it.admin_route as route_path,
    default_module_id as module_id,
    'admin' as module_code,
    'migration' as source,
    true as is_active,
    'Auto-migrated from implementation_tasks admin_route' as description
  FROM implementation_tasks it
  WHERE it.admin_route IS NOT NULL
    AND it.admin_route != ''
    AND it.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM application_features af
      WHERE af.route_path = it.admin_route
    )
  ON CONFLICT (feature_code) DO NOTHING;
END $$;

-- Phase 2: Auto-migrate feature_codes to implementation_tasks
UPDATE implementation_tasks it
SET 
  feature_code = af.feature_code,
  updated_at = NOW()
FROM application_features af
WHERE it.admin_route = af.route_path
  AND it.feature_code IS NULL
  AND it.is_active = true;