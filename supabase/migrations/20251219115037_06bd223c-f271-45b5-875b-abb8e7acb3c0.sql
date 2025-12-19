-- Add GL configured flag to pay_groups
ALTER TABLE pay_groups 
ADD COLUMN IF NOT EXISTS gl_configured boolean NOT NULL DEFAULT false;

-- Add comment
COMMENT ON COLUMN pay_groups.gl_configured IS 'Indicates whether General Ledger posting is configured for this pay group';