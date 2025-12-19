-- Insert payroll run type lookup values
INSERT INTO lookup_values (category, code, name, description, display_order, is_active)
VALUES 
  ('payroll_run_type', 'regular', 'Regular', 'Standard scheduled payroll run', 1, true),
  ('payroll_run_type', 'off_cycle', 'Off-Cycle', 'Unscheduled payroll run for adjustments or corrections', 2, true),
  ('payroll_run_type', 'supplemental', 'Supplemental', 'Additional payroll for bonuses or special payments', 3, true),
  ('payroll_run_type', 'bonus', 'Bonus', 'Dedicated bonus payout run', 4, true),
  ('payroll_run_type', 'correction', 'Correction', 'Payroll correction or adjustment run', 5, true)
ON CONFLICT DO NOTHING;