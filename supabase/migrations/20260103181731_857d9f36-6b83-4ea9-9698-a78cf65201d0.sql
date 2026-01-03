-- Add feedback_360_anonymity_policy column to companies table
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS feedback_360_anonymity_policy JSONB DEFAULT '{
  "individual_response_access": "never",
  "allow_investigation_mode": true,
  "minimum_responses_for_breakdown": 3,
  "minimum_responses_for_scores": 2,
  "investigation_approver_role": "hr_director",
  "investigation_max_duration_days": 7,
  "require_legal_reference": false
}'::jsonb;