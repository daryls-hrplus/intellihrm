-- Add phase-specific deadline columns to appraisal_cycles for enterprise-grade deadline tracking
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS self_assessment_deadline date;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS feedback_360_deadline date;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS manager_review_deadline date;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS calibration_deadline date;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS finalization_deadline date;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS acknowledgment_deadline date;

-- Add comment explaining the purpose
COMMENT ON COLUMN appraisal_cycles.self_assessment_deadline IS 'Deadline for employees to complete self-assessment';
COMMENT ON COLUMN appraisal_cycles.feedback_360_deadline IS 'Deadline for 360 feedback collection (if enabled)';
COMMENT ON COLUMN appraisal_cycles.manager_review_deadline IS 'Deadline for managers to complete reviews';
COMMENT ON COLUMN appraisal_cycles.calibration_deadline IS 'Deadline for calibration sessions (if applicable)';
COMMENT ON COLUMN appraisal_cycles.finalization_deadline IS 'Deadline for HR/admin to finalize ratings';
COMMENT ON COLUMN appraisal_cycles.acknowledgment_deadline IS 'Deadline for employees to acknowledge their review';