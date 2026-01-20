-- First drop the constraint to allow updates
ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_role_type_check;