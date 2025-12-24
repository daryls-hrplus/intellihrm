-- First add unique constraint on feature_code if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'application_features_feature_code_key'
  ) THEN
    -- Remove duplicates first (keep the one with earliest created_at)
    DELETE FROM application_features a
    USING application_features b
    WHERE a.feature_code = b.feature_code
      AND a.created_at > b.created_at;
      
    -- Now add the unique constraint
    ALTER TABLE application_features ADD CONSTRAINT application_features_feature_code_key UNIQUE (feature_code);
  END IF;
END $$;

-- Add unique constraint on module_code if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'application_modules_module_code_key'
  ) THEN
    ALTER TABLE application_modules ADD CONSTRAINT application_modules_module_code_key UNIQUE (module_code);
  END IF;
END $$;