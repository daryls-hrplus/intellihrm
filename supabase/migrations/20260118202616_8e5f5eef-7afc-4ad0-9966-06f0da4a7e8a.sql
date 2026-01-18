-- Add sequence_order column to reminder_event_types for lifecycle ordering
ALTER TABLE reminder_event_types 
ADD COLUMN IF NOT EXISTS sequence_order INTEGER DEFAULT 100;

-- Set sequence for appraisal events (in lifecycle order)
UPDATE reminder_event_types SET sequence_order = 10 WHERE code = 'APPRAISAL_CYCLE_STARTING';
UPDATE reminder_event_types SET sequence_order = 15 WHERE code = 'APPRAISAL_CYCLE_ACTIVATED';
UPDATE reminder_event_types SET sequence_order = 20 WHERE code = 'APPRAISAL_KICKOFF';
UPDATE reminder_event_types SET sequence_order = 30 WHERE code = 'APPRAISAL_DUE';
UPDATE reminder_event_types SET sequence_order = 40 WHERE code = 'appraisal_deadline';
UPDATE reminder_event_types SET sequence_order = 50 WHERE code = 'APPRAISAL_INTERVIEW_SCHEDULED';
UPDATE reminder_event_types SET sequence_order = 60 WHERE code = 'APPRAISAL_CYCLE_ENDING';
UPDATE reminder_event_types SET sequence_order = 70 WHERE code = 'APPRAISAL_EVALUATION_OVERDUE';
UPDATE reminder_event_types SET sequence_order = 80 WHERE code = 'APPRAISAL_FINALIZED';
UPDATE reminder_event_types SET sequence_order = 85 WHERE code = 'IDP_CREATED';
UPDATE reminder_event_types SET sequence_order = 90 WHERE code = 'PIP_CREATED';
UPDATE reminder_event_types SET sequence_order = 95 WHERE code = 'APPRAISAL_MANAGER_TEAM_DUTY';

-- Set sequence for onboarding events (in lifecycle order)
UPDATE reminder_event_types SET sequence_order = 10 WHERE code = 'ONBOARDING_STARTED';
UPDATE reminder_event_types SET sequence_order = 20 WHERE code = 'DOCUMENT_PENDING';
UPDATE reminder_event_types SET sequence_order = 30 WHERE code = 'ONBOARDING_TASK_DUE';
UPDATE reminder_event_types SET sequence_order = 40 WHERE code = 'ONBOARDING_COMPLETED';

-- Set sequence for employment events (in lifecycle order)
UPDATE reminder_event_types SET sequence_order = 10 WHERE code = 'PROBATION_ENDING';
UPDATE reminder_event_types SET sequence_order = 20 WHERE code = 'CONTRACT_EXPIRING';
UPDATE reminder_event_types SET sequence_order = 30 WHERE code = 'WORK_ANNIVERSARY';
UPDATE reminder_event_types SET sequence_order = 40 WHERE code = 'BIRTHDAY';
UPDATE reminder_event_types SET sequence_order = 50 WHERE code = 'RETIREMENT_APPROACHING';

-- Set sequence for compliance events (in lifecycle order)
UPDATE reminder_event_types SET sequence_order = 10 WHERE code = 'LICENSE_EXPIRING';
UPDATE reminder_event_types SET sequence_order = 20 WHERE code = 'CERTIFICATION_EXPIRING';
UPDATE reminder_event_types SET sequence_order = 30 WHERE code = 'TRAINING_DUE';
UPDATE reminder_event_types SET sequence_order = 40 WHERE code = 'VISA_EXPIRING';
UPDATE reminder_event_types SET sequence_order = 50 WHERE code = 'MEDICAL_DUE';

-- Set sequence for leave events (in lifecycle order)
UPDATE reminder_event_types SET sequence_order = 10 WHERE code = 'LEAVE_BALANCE_LOW';
UPDATE reminder_event_types SET sequence_order = 20 WHERE code = 'LEAVE_APPROVAL_PENDING';
UPDATE reminder_event_types SET sequence_order = 30 WHERE code = 'LEAVE_STARTING';
UPDATE reminder_event_types SET sequence_order = 40 WHERE code = 'LEAVE_ENDING';

-- Set sequence for payroll events (in lifecycle order)
UPDATE reminder_event_types SET sequence_order = 10 WHERE code = 'PAYROLL_PROCESSING';
UPDATE reminder_event_types SET sequence_order = 20 WHERE code = 'PAYROLL_DEADLINE';
UPDATE reminder_event_types SET sequence_order = 30 WHERE code = 'PAYSLIP_AVAILABLE';
UPDATE reminder_event_types SET sequence_order = 40 WHERE code = 'TAX_FILING_DUE';