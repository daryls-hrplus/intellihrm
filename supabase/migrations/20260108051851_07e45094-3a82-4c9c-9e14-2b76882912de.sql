-- Seed category-specific canned responses for HR Help Desk

-- Get category IDs (using subqueries to link templates to categories)
INSERT INTO public.canned_responses (title, content, category_id, is_active) VALUES
  ('Leave Balance Inquiry', 
   'Dear {employee_name},

Thank you for your inquiry regarding your leave balance.

Your current leave balances are as follows:
- Annual Leave: [X days]
- Sick Leave: [X days]
- Personal Leave: [X days]

For a detailed breakdown or to request leave, please visit the Leave Management section in your ESS portal.

Best regards,
HR Team', 
   (SELECT id FROM ticket_categories WHERE code = 'leave_management' LIMIT 1), 
   true),
  
  ('Benefits Enrollment Reminder', 
   'Dear {employee_name},

This is a reminder that the benefits open enrollment period is currently active.

Key dates to remember:
- Enrollment opens: [Start Date]
- Enrollment closes: [End Date]
- Changes take effect: [Effective Date]

Please log in to the Benefits portal to review and update your selections. If you have questions about available plans, our HR team is here to help.

Thank you,
HR Benefits Team', 
   (SELECT id FROM ticket_categories WHERE code = 'benefits' LIMIT 1), 
   true),
  
  ('Payroll Deadline Notice', 
   'Dear {employee_name},

Thank you for your ticket #{ticket_number} regarding payroll.

Please note the following deadlines for this pay period:
- Timesheet submission: [Date]
- Expense claims: [Date]
- Payroll processing: [Date]
- Pay date: [Date]

If you have missing or incorrect entries, please submit corrections before the deadline to ensure timely payment.

Best regards,
Payroll Team', 
   (SELECT id FROM ticket_categories WHERE code = 'payroll_compensation' LIMIT 1), 
   true),
  
  ('Onboarding Checklist', 
   'Welcome to {company_name}, {employee_name}!

We''re excited to have you on board. Please complete the following within your first week:

☐ Complete new hire paperwork in the ESS portal
☐ Set up your workstation and IT access
☐ Review the employee handbook
☐ Complete mandatory compliance training
☐ Meet with your manager for orientation
☐ Submit required documentation (ID, certifications, etc.)

If you have any questions, don''t hesitate to reach out. We''re here to help make your transition smooth!

Welcome aboard,
HR Team', 
   (SELECT id FROM ticket_categories WHERE code = 'onboarding' LIMIT 1), 
   true),
  
  ('Exit Process Information', 
   'Dear {employee_name},

Thank you for reaching out regarding your separation from {company_name}.

Your clearance process includes the following steps:

1. Asset Return - All company property (laptop, keys, badge, etc.)
2. Knowledge Transfer - Document and hand over ongoing projects
3. Exit Interview - Schedule with HR
4. Final Pay - Processed on your last day
5. Benefits - COBRA information will be provided

Please ensure all items are completed before your last day. If you have questions, we''re here to assist.

Best regards,
HR Team', 
   (SELECT id FROM ticket_categories WHERE code = 'offboarding' LIMIT 1), 
   true),
  
  ('Policy Clarification', 
   'Dear {employee_name},

Thank you for your question about company policy (Ticket #{ticket_number}).

Regarding your inquiry about [specific policy], please note the following:

[Policy details and clarification]

For the complete policy document, please visit the HR Hub or contact your HR Business Partner.

If you need further clarification, please don''t hesitate to ask.

Best regards,
HR Policy Team', 
   (SELECT id FROM ticket_categories WHERE code = 'company_policy' LIMIT 1), 
   true),
  
  ('Time Entry Reminder', 
   'Dear {employee_name},

This is a reminder to please submit your timesheet by [deadline].

To submit your time:
1. Log in to the ESS portal
2. Navigate to Time & Attendance
3. Enter your hours for each day
4. Submit for approval

Missing or late timesheets may result in delayed payroll processing. If you experience technical issues, please contact IT support.

Thank you,
HR Team', 
   (SELECT id FROM ticket_categories WHERE code = 'time_attendance' LIMIT 1), 
   true),
  
  ('Training Enrollment Confirmation', 
   'Dear {employee_name},

You have been successfully enrolled in the following training:

Training: [Course Name]
Date: [Training Date]
Time: [Training Time]
Location: [Location/Virtual Link]
Duration: [Duration]

Please mark your calendar and complete any pre-work if required. If you need to reschedule, please contact us at least 48 hours in advance.

Best regards,
Learning & Development Team', 
   (SELECT id FROM ticket_categories WHERE code = 'training_development' LIMIT 1), 
   true);
