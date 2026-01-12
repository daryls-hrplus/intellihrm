-- Add scheduled jobs for appraisal automation
INSERT INTO scheduled_jobs (job_name, job_description, edge_function_name, interval_minutes, is_enabled)
VALUES 
  ('appraisal-cycle-status', 'Auto-manage appraisal cycle status based on dates (activate, complete, flag overdue)', 'process-appraisal-cycle-status', 60, true),
  ('appraisal-interview-reminders', 'Send reminders for upcoming appraisal interviews', 'process-appraisal-interview-reminders', 60, true),
  ('goal-check-in-reminders', 'Send reminders for goal check-ins and milestones', 'process-goal-check-ins', 1440, true);

-- Add reminder event types for appraisals
INSERT INTO reminder_event_types (code, name, category, source_table, date_field, description, is_system)
VALUES 
  ('APPRAISAL_INTERVIEW_SCHEDULED', 'Appraisal Interview Scheduled', 'performance', 'appraisal_interviews', 'scheduled_at', 'Reminder for upcoming appraisal interview', true),
  ('APPRAISAL_CYCLE_STARTING', 'Appraisal Cycle Starting', 'performance', 'appraisal_cycles', 'start_date', 'Appraisal cycle is about to begin', true),
  ('APPRAISAL_CYCLE_ENDING', 'Appraisal Cycle Ending', 'performance', 'appraisal_cycles', 'end_date', 'Appraisal cycle is about to end', true),
  ('GOAL_MILESTONE_DUE', 'Goal Milestone Due', 'performance', 'goal_milestones', 'target_date', 'Goal milestone is approaching', true),
  ('APPRAISAL_EVALUATION_OVERDUE', 'Appraisal Evaluation Overdue', 'performance', 'appraisal_participants', 'due_date', 'Appraisal evaluation is overdue', true);

-- Add columns for enhanced automation on appraisal_participants
ALTER TABLE appraisal_participants ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE appraisal_participants ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT false;
ALTER TABLE appraisal_participants ADD COLUMN IF NOT EXISTS overdue_notified_at TIMESTAMPTZ;

-- Add columns for date-based action execution
ALTER TABLE appraisal_outcome_action_rules ADD COLUMN IF NOT EXISTS execute_after_days INTEGER DEFAULT 0;
ALTER TABLE appraisal_outcome_action_rules ADD COLUMN IF NOT EXISTS auto_execute_on_date BOOLEAN DEFAULT false;

-- Add column to track cycle auto-activation/completion
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS auto_activated_at TIMESTAMPTZ;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS auto_completed_at TIMESTAMPTZ;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS auto_activate_enabled BOOLEAN DEFAULT true;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS auto_complete_enabled BOOLEAN DEFAULT true;
ALTER TABLE appraisal_cycles ADD COLUMN IF NOT EXISTS grace_period_days INTEGER DEFAULT 0;