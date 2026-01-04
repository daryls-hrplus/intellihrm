-- Fix search_path for the function
CREATE OR REPLACE FUNCTION update_reminder_delivery_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add default email templates for 360 events
INSERT INTO reminder_email_templates (category, name, subject, body, is_default, is_active)
SELECT 'performance', '360 Cycle Activated', '360 Feedback Cycle Now Open: {{cycle_name}}',
   'Dear {{employee_first_name}},

The 360 feedback cycle "{{cycle_name}}" is now active and you have been selected as a participant.

**Your Role:**
You will receive feedback from peers, your manager, and direct reports (if applicable). You will also complete a self-assessment.

**Key Dates:**
- Self-Review Deadline: {{self_review_deadline}}
- Peer Feedback Deadline: {{feedback_deadline}}
- Cycle End Date: {{end_date}}

**Action Required:**
Please log in to complete your self-assessment and provide feedback for your assigned colleagues.

Best regards,
{{company_name}} HR Team',
   true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_email_templates WHERE category = 'performance' AND name = '360 Cycle Activated');

INSERT INTO reminder_email_templates (category, name, subject, body, is_default, is_active)
SELECT 'performance', '360 Results Released', 'Your 360 Feedback Results Are Now Available',
   'Dear {{employee_first_name}},

We are pleased to inform you that the results from your 360 feedback cycle "{{cycle_name}}" are now available.

**What to Expect:**
Your feedback report includes aggregated ratings and comments from your reviewers across key competency areas. To protect anonymity, individual responses have been combined where applicable.

**Next Steps:**
1. Log in to view your full feedback report
2. Review the summary insights and specific feedback areas
3. Schedule time with your manager to discuss the results
4. Create development goals based on the feedback

Best regards,
{{company_name}} HR Team',
   true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_email_templates WHERE category = 'performance' AND name = '360 Results Released');

INSERT INTO reminder_email_templates (category, name, subject, body, is_default, is_active)
SELECT 'performance', '360 Feedback Deadline Reminder', 'Reminder: 360 Feedback Due in {{days_until}} Days',
   'Dear {{employee_first_name}},

This is a reminder that you have outstanding 360 feedback to complete for the cycle "{{cycle_name}}".

**Deadline:** {{event_date}}
**Days Remaining:** {{days_until}}

Please log in to complete your feedback assessments.

Thank you,
{{company_name}} HR Team',
   true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_email_templates WHERE category = 'performance' AND name = '360 Feedback Deadline Reminder');

INSERT INTO reminder_email_templates (category, name, subject, body, is_default, is_active)
SELECT 'performance', '360 Self-Review Deadline Reminder', 'Reminder: Self-Review Due in {{days_until}} Days',
   'Dear {{employee_first_name}},

This is a reminder that your self-review for the 360 feedback cycle "{{cycle_name}}" is due soon.

**Deadline:** {{event_date}}
**Days Remaining:** {{days_until}}

Please log in to complete your self-assessment.

Thank you,
{{company_name}} HR Team',
   true, true
WHERE NOT EXISTS (SELECT 1 FROM reminder_email_templates WHERE category = 'performance' AND name = '360 Self-Review Deadline Reminder');