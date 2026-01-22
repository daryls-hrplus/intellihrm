-- Add transaction types for performance processes
INSERT INTO lookup_values (category, code, name, is_active) VALUES
  ('transaction_type', 'PERF_RATING_APPROVAL', 'Performance Rating Approval', true),
  ('transaction_type', 'PERF_PIP_ACKNOWLEDGMENT', 'PIP Acknowledgment', true),
  ('transaction_type', 'PERF_RATING_RELEASE', 'Rating Release Approval', true),
  ('transaction_type', 'PERF_GOAL_APPROVAL_INDIVIDUAL', 'Individual Goal Approval', true),
  ('transaction_type', 'PERF_GOAL_APPROVAL_TEAM', 'Team Goal Approval', true),
  ('transaction_type', 'PERF_GOAL_APPROVAL_DEPARTMENT', 'Department Goal Approval', true),
  ('transaction_type', 'PERF_360_RELEASE', '360 Feedback Release', true),
  ('transaction_type', 'PERF_SUCCESSION_APPROVAL', 'Succession Plan Approval', true)
ON CONFLICT (category, code) DO NOTHING;