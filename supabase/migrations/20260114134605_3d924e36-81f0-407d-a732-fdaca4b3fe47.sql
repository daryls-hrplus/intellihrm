-- Migrate existing performance templates to appropriate sub-categories
-- First, migrate 360 feedback related templates
UPDATE reminder_email_templates 
SET category = 'performance_360'
WHERE category = 'performance' 
  AND (name ILIKE '%360%' OR name ILIKE '%multi-rater%' OR name ILIKE '%peer%');

-- Migrate goal related templates
UPDATE reminder_email_templates 
SET category = 'performance_goals'
WHERE category = 'performance' 
  AND (name ILIKE '%goal%' OR name ILIKE '%okr%' OR name ILIKE '%objective%');

-- Migrate feedback/continuous feedback related templates
UPDATE reminder_email_templates 
SET category = 'performance_feedback'
WHERE category = 'performance' 
  AND (name ILIKE '%feedback%' OR name ILIKE '%check-in%' OR name ILIKE '%praise%' OR name ILIKE '%recognition%');

-- Migrate succession related templates
UPDATE reminder_email_templates 
SET category = 'performance_succession'
WHERE category = 'performance' 
  AND (name ILIKE '%succession%' OR name ILIKE '%talent%' OR name ILIKE '%pipeline%' OR name ILIKE '%readiness%');

-- Migrate remaining performance templates to appraisals (the default)
UPDATE reminder_email_templates 
SET category = 'performance_appraisals'
WHERE category = 'performance';

-- Similarly update reminder_event_types
UPDATE reminder_event_types 
SET category = 'performance_360'
WHERE category = 'performance' 
  AND (code ILIKE '%360%' OR name ILIKE '%360%' OR name ILIKE '%multi-rater%' OR name ILIKE '%peer%');

UPDATE reminder_event_types 
SET category = 'performance_goals'
WHERE category = 'performance' 
  AND (code ILIKE '%goal%' OR name ILIKE '%goal%' OR name ILIKE '%okr%');

UPDATE reminder_event_types 
SET category = 'performance_feedback'
WHERE category = 'performance' 
  AND (code ILIKE '%feedback%' OR name ILIKE '%feedback%' OR name ILIKE '%check-in%');

UPDATE reminder_event_types 
SET category = 'performance_succession'
WHERE category = 'performance' 
  AND (code ILIKE '%succession%' OR name ILIKE '%succession%' OR name ILIKE '%talent%');

-- Migrate remaining to appraisals
UPDATE reminder_event_types 
SET category = 'performance_appraisals'
WHERE category = 'performance';

-- Update reminder_rules if they have any category references
UPDATE reminder_rules r
SET event_type_id = r.event_type_id
FROM reminder_event_types e
WHERE r.event_type_id = e.id;

-- Seed default event types for new performance sub-categories (if not exists)
INSERT INTO reminder_event_types (code, name, description, category, is_system, is_active)
VALUES 
  -- Performance: Goals
  ('goal_setting_deadline', 'Goal Setting Deadline', 'Reminder when goal setting period is ending', 'performance_goals', true, true),
  ('goal_check_in_due', 'Goal Check-in Due', 'Reminder for scheduled goal progress check-ins', 'performance_goals', true, true),
  ('goal_cascade_notification', 'Goal Cascade Update', 'Notify when parent goals are updated affecting cascaded goals', 'performance_goals', true, true),
  -- Performance: Continuous Feedback
  ('feedback_request_pending', 'Feedback Request Pending', 'Reminder when feedback has been requested but not provided', 'performance_feedback', true, true),
  ('praise_received', 'Praise Received', 'Notification when an employee receives praise', 'performance_feedback', true, true),
  ('weekly_check_in_due', 'Weekly Check-in Due', 'Reminder for scheduled weekly check-ins', 'performance_feedback', true, true),
  -- Performance: Succession
  ('talent_review_reminder', 'Talent Review Reminder', 'Reminder for upcoming talent review sessions', 'performance_succession', true, true),
  ('successor_assessment_due', 'Successor Assessment Due', 'Reminder when successor readiness assessments are due', 'performance_succession', true, true),
  ('development_plan_action', 'Development Plan Action Required', 'Reminder for development plan milestones or actions', 'performance_succession', true, true)
ON CONFLICT (code) DO UPDATE SET
  category = EXCLUDED.category,
  name = EXCLUDED.name,
  description = EXCLUDED.description;