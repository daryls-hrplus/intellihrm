-- Add new qualification-related values to lookup_category enum
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'education_level';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'qualification_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'field_of_study';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'institution_name';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'certification_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'certification_name';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'accrediting_body';