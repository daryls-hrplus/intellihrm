-- Update event type categories to new improved groupings

-- Move employee voice related items from performance to employee_voice
UPDATE public.reminder_event_types 
SET category = 'employee_voice', updated_at = now()
WHERE code IN (
  'REVIEW_RESPONSE_REQUIRED',
  'EMPLOYEE_ESCALATION_NEW', 
  'HR_ESCALATION_RESOLVED',
  'MANAGER_REBUTTAL_RECEIVED',
  'REVIEW_RESPONSE_DEADLINE'
);

-- Move probation to onboarding category
UPDATE public.reminder_event_types 
SET category = 'onboarding', updated_at = now()
WHERE code = 'PROBATION_END' OR category = 'probation';

-- Move visa/work permit/compliance items from document to compliance
UPDATE public.reminder_event_types 
SET category = 'compliance', updated_at = now()
WHERE code IN (
  'VISA_EXPIRY',
  'WORK_PERMIT_EXPIRY', 
  'CSME_CERTIFICATE_EXPIRY',
  'BACKGROUND_CHECK_EXPIRY',
  'COMPLIANCE_TRAINING_EXPIRY'
);

-- Rename contract category to employment for clarity
UPDATE public.reminder_event_types 
SET category = 'employment', updated_at = now()
WHERE category = 'contract';