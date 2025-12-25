-- Add new enum values to lookup_category
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'pay_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'position_employment_status';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'position_employment_type';
ALTER TYPE lookup_category ADD VALUE IF NOT EXISTS 'flsa_status';

-- Add new columns to positions table
ALTER TABLE public.positions
ADD COLUMN IF NOT EXISTS pay_type TEXT NOT NULL DEFAULT 'SALARIED',
ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS employment_type TEXT NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN IF NOT EXISTS flsa_status TEXT NOT NULL DEFAULT 'EXEMPT',
ADD COLUMN IF NOT EXISTS default_scheduled_hours NUMERIC(5,2) NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.positions.pay_type IS 'Compensation type: SALARIED, HOURLY, or DAILY';
COMMENT ON COLUMN public.positions.employment_status IS 'Position status: ACTIVE, FROZEN, PENDING, ABOLISHED';
COMMENT ON COLUMN public.positions.employment_type IS 'Work schedule type: FULL_TIME, PART_TIME, CASUAL';
COMMENT ON COLUMN public.positions.flsa_status IS 'FLSA exemption status: EXEMPT or NON_EXEMPT';
COMMENT ON COLUMN public.positions.default_scheduled_hours IS 'Default scheduled hours per week for this position';