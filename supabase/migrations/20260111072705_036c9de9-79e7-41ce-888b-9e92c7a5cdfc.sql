-- Make group_id optional for divisions
ALTER TABLE divisions 
ALTER COLUMN group_id DROP NOT NULL;