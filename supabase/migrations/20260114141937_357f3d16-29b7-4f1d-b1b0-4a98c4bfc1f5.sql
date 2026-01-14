-- Fix performance templates: Convert HTML to plain text format
-- Updating 15 templates across 4 performance sub-categories

-- Performance: Appraisals (3 templates)
UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

We are pleased to announce that the {{cycle_name}} performance review cycle is now officially open.

**Key Dates:**
- Self-Assessment Due: {{self_assessment_deadline}}
- Manager Review Period: {{manager_review_period}}
- Cycle End Date: {{end_date}}

**Action Required:**
Please log in to begin your self-assessment. This is your opportunity to reflect on your achievements, growth, and contributions.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Review Cycle Launch' AND category = 'performance_appraisals';

UPDATE reminder_email_templates
SET body = 'Dear {{manager_name}},

A performance review is awaiting your final sign-off.

**Review Details:**
- Employee: {{employee_name}}
- Review Period: {{review_period}}
- Deadline: {{event_date}}

**Action Required:**
Please log in to review and sign off on this evaluation to finalize the review process.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Manager Sign-off Required' AND category = 'performance_appraisals';

UPDATE reminder_email_templates
SET body = 'Dear {{manager_name}},

This is a reminder about your upcoming performance calibration session.

**Session Details:**
- Date: {{event_date}}
- Department: {{department_name}}

**Preparation Required:**
Please review your team''s preliminary ratings and prepare supporting documentation for discussion.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Calibration Session Reminder' AND category = 'performance_appraisals';

-- Performance: Goals (4 templates)
UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

This is a reminder that the goal setting period is ending soon.

**Details:**
- Deadline: {{event_date}}
- Review Period: {{review_period}}

**Action Required:**
Please finalize your goals before the deadline. Ensure your goals are specific, measurable, and aligned with team objectives.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Goal Setting Deadline' AND category = 'performance_goals';

UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

It''s time for your scheduled goal check-in.

**Check-in Details:**
- Due Date: {{event_date}}
- Goals to Review: {{goal_count}}

**Action Required:**
Please update progress on your current goals and document any blockers or achievements.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Goal Check-in Reminder' AND category = 'performance_goals';

UPDATE reminder_email_templates
SET body = 'Dear {{manager_name}},

A goal progress update has been submitted by your team member.

**Update Details:**
- Employee: {{employee_name}}
- Goal: {{goal_title}}
- New Progress: {{progress_percentage}}%

**Action Required:**
Please review the update and provide feedback if needed.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Goal Progress Update' AND category = 'performance_goals';

UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

New organizational goals have been cascaded to your level.

**Cascade Details:**
- Parent Goal: {{parent_goal}}
- Your Aligned Goal: {{cascaded_goal}}
- Due Date: {{event_date}}

**Action Required:**
Please review and accept the cascaded goal, then create supporting objectives.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Goal Cascade Notification' AND category = 'performance_goals';

-- Performance: Continuous Feedback (4 templates)
UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

A colleague has requested your feedback.

**Request Details:**
- Requested By: {{requester_name}}
- Topic: {{feedback_topic}}
- Due Date: {{event_date}}

**Action Required:**
Please take a few minutes to provide thoughtful, constructive feedback.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Feedback Request Nudge' AND category = 'performance_feedback';

UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

Congratulations! You''ve received recognition from a colleague.

**Recognition Details:**
- From: {{sender_name}}
- Message: {{praise_message}}
- Value: {{company_value}}

Keep up the excellent work!

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Praise Notification' AND category = 'performance_feedback';

UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

It''s time for your scheduled check-in with your manager.

**Check-in Details:**
- Scheduled: {{event_date}}
- With: {{manager_name}}

**Preparation:**
Please prepare any topics, updates, or questions you''d like to discuss.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Check-in Reminder' AND category = 'performance_feedback';

UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

You''ve been recognized for your outstanding contribution!

**Recognition Details:**
- Award: {{recognition_type}}
- Recognized By: {{recognizer_name}}
- Reason: {{recognition_reason}}

Your hard work and dedication are truly appreciated.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Recognition Alert' AND category = 'performance_feedback';

-- Performance: Succession (4 templates)
UPDATE reminder_email_templates
SET body = 'Dear {{manager_name}},

The annual talent review process is beginning.

**Review Details:**
- Review Period: {{review_period}}
- Submission Deadline: {{event_date}}
- Team Size: {{team_size}}

**Action Required:**
Please complete talent assessments for your direct reports using the 9-box grid.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Talent Review Reminder' AND category = 'performance_succession';

UPDATE reminder_email_templates
SET body = 'Dear {{manager_name}},

A successor readiness assessment is due for completion.

**Assessment Details:**
- Successor: {{successor_name}}
- Target Role: {{target_role}}
- Due Date: {{event_date}}

**Action Required:**
Please evaluate the candidate''s readiness level and update development priorities.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Successor Readiness Assessment Due' AND category = 'performance_succession';

UPDATE reminder_email_templates
SET body = 'Dear {{employee_first_name}},

Your development plan has action items requiring attention.

**Plan Details:**
- Development Area: {{development_area}}
- Current Activity: {{activity_name}}
- Due Date: {{event_date}}

**Action Required:**
Please complete the pending development activity and log your progress.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Development Plan Action Required' AND category = 'performance_succession';

UPDATE reminder_email_templates
SET body = 'Dear {{manager_name}},

There has been an update to your succession pipeline.

**Update Details:**
- Role: {{target_role}}
- Change Type: {{update_type}}
- Updated By: {{updated_by}}

**Action Required:**
Please review the pipeline changes and ensure succession coverage remains adequate.

Best regards,
{{company_name}} HR Team',
    updated_at = now()
WHERE name = 'Pipeline Update Notification' AND category = 'performance_succession';