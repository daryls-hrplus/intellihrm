-- Add lifecycle tracking fields to review_cycles for enhanced audit trail
ALTER TABLE review_cycles 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activated_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Add same lifecycle tracking fields to feedback_360_cycles for standalone cycles
ALTER TABLE feedback_360_cycles 
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS activated_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- Add consent_ip_address for GDPR compliance on external rater consent
ALTER TABLE feedback_360_requests 
ADD COLUMN IF NOT EXISTS consent_ip_address INET;

-- Add index for faster lifecycle queries
CREATE INDEX IF NOT EXISTS idx_review_cycles_activated_at ON review_cycles(activated_at) WHERE activated_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_360_cycles_activated_at ON feedback_360_cycles(activated_at) WHERE activated_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN review_cycles.activated_at IS 'Timestamp when cycle was launched (Draft → Active)';
COMMENT ON COLUMN review_cycles.activated_by IS 'User who launched the cycle';
COMMENT ON COLUMN review_cycles.closed_at IS 'Timestamp when cycle was closed';
COMMENT ON COLUMN review_cycles.is_locked IS 'Prevents configuration changes after launch';

COMMENT ON COLUMN feedback_360_cycles.activated_at IS 'Timestamp when cycle was launched (Draft → Active)';
COMMENT ON COLUMN feedback_360_cycles.activated_by IS 'User who launched the cycle';
COMMENT ON COLUMN feedback_360_cycles.closed_at IS 'Timestamp when cycle was closed';
COMMENT ON COLUMN feedback_360_cycles.is_locked IS 'Prevents configuration changes after launch';

COMMENT ON COLUMN feedback_360_requests.consent_ip_address IS 'IP address captured when external rater gave consent (GDPR audit trail)';