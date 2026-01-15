-- Add performance period columns to appraisal_cycles
-- Industry standard: Performance Period (work period evaluated) vs Appraisal Period (review window)
ALTER TABLE appraisal_cycles 
ADD COLUMN IF NOT EXISTS performance_period_start DATE,
ADD COLUMN IF NOT EXISTS performance_period_end DATE;

-- Add comments for clarity
COMMENT ON COLUMN appraisal_cycles.start_date IS 'Appraisal process start date - when the formal review window begins';
COMMENT ON COLUMN appraisal_cycles.end_date IS 'Appraisal process end date - when the formal review window ends';
COMMENT ON COLUMN appraisal_cycles.performance_period_start IS 'Start of the work period being evaluated';
COMMENT ON COLUMN appraisal_cycles.performance_period_end IS 'End of the work period being evaluated';