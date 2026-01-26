-- Add CHECK constraint to enforce allowed statuses for talent pool members
ALTER TABLE talent_pool_members 
DROP CONSTRAINT IF EXISTS talent_pool_members_status_check;

ALTER TABLE talent_pool_members 
ADD CONSTRAINT talent_pool_members_status_check 
CHECK (status IN ('active', 'nominated', 'approved', 'rejected', 'graduated', 'removed'));

-- Add development_notes field for manager recommendations
ALTER TABLE talent_pool_members 
ADD COLUMN IF NOT EXISTS development_notes TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN talent_pool_members.development_notes IS 'Manager-recommended development activities captured during nomination';