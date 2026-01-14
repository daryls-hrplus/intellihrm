-- Seed default email templates for Performance: Goals category
INSERT INTO reminder_email_templates (name, subject, body, category, is_default, is_active)
VALUES
(
  'Goal Setting Deadline Reminder',
  'Reminder: Goal Setting Period Ends {{event_date}}',
  '<p>Dear {{employee_first_name}},</p>

<p>This is a friendly reminder that the goal setting period for this cycle will close on <strong>{{event_date}}</strong>.</p>

<p><strong>What You Need to Do:</strong></p>
<ul>
  <li>Review and finalize your goals for this period</li>
  <li>Ensure all goals are aligned with your team and department objectives</li>
  <li>Submit your goals for manager approval before the deadline</li>
</ul>

<p>Setting clear, measurable goals is essential for tracking your progress and development throughout the year.</p>

<p>If you have any questions about goal setting, please reach out to your manager or HR.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_goals',
  true,
  true
),
(
  'Goal Check-in Reminder',
  'Goal Check-in Due: {{event_date}}',
  '<p>Dear {{employee_first_name}},</p>

<p>It''s time for your scheduled goal check-in. Please update your goal progress by <strong>{{event_date}}</strong>.</p>

<p><strong>During your check-in, please:</strong></p>
<ul>
  <li>Update the progress percentage for each of your goals</li>
  <li>Add comments on key achievements or challenges</li>
  <li>Flag any goals that may need adjustment</li>
</ul>

<p>Regular check-ins help ensure you stay on track and can address any obstacles early.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_goals',
  true,
  true
),
(
  'Goal Progress Update',
  'Action Required: Update Your Goal Progress',
  '<p>Dear {{employee_first_name}},</p>

<p>We noticed your goals haven''t been updated recently. Keeping your goal progress current helps your manager support your development and ensures accurate performance tracking.</p>

<p><strong>Please take a few minutes to:</strong></p>
<ul>
  <li>Log into the performance system</li>
  <li>Review each of your active goals</li>
  <li>Update progress percentages and add any relevant notes</li>
</ul>

<p>If you''re facing challenges with any of your goals, this is a great opportunity to flag them for discussion with your manager.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_goals',
  true,
  true
),
(
  'Goal Cascade Notification',
  'Your Goals Have Been Updated',
  '<p>Dear {{employee_first_name}},</p>

<p>Changes have been made to organizational or team objectives that may affect your goals.</p>

<p><strong>What This Means:</strong></p>
<ul>
  <li>Parent goals linked to yours have been modified</li>
  <li>Your goals may need to be reviewed for alignment</li>
  <li>Some goal weights or priorities may have shifted</li>
</ul>

<p><strong>Next Steps:</strong></p>
<ol>
  <li>Review your current goals in the performance system</li>
  <li>Discuss any necessary adjustments with your manager</li>
  <li>Update your goals to reflect the new priorities</li>
</ol>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_goals',
  true,
  true
),

-- Seed default email templates for Performance: Continuous Feedback category
(
  'Feedback Request Reminder',
  'You Have a Pending Feedback Request',
  '<p>Dear {{employee_first_name}},</p>

<p>You have been asked to provide feedback for a colleague. Your input is valuable and helps support their professional development.</p>

<p><strong>Request Details:</strong></p>
<ul>
  <li>Requested by: {{sender_name}}</li>
  <li>Due by: {{event_date}}</li>
</ul>

<p><strong>Tips for Effective Feedback:</strong></p>
<ul>
  <li>Be specific and provide examples where possible</li>
  <li>Focus on behaviors and outcomes, not personality</li>
  <li>Balance constructive suggestions with recognition of strengths</li>
</ul>

<p>Your thoughtful feedback makes a real difference. Thank you for taking the time to contribute.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_feedback',
  true,
  true
),
(
  'Praise Received Notification',
  'You Received Praise from {{sender_name}}',
  '<p>Dear {{employee_first_name}},</p>

<p>Great news! You''ve received praise from <strong>{{sender_name}}</strong>.</p>

<p>Recognition like this highlights the positive impact you''re making. Keep up the excellent work!</p>

<p>You can view the full message and any details in your performance dashboard.</p>

<p>Congratulations on this well-deserved recognition!</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_feedback',
  true,
  true
),
(
  'Weekly Check-in Reminder',
  'Weekly Check-in Due with {{manager_name}}',
  '<p>Dear {{employee_first_name}},</p>

<p>This is a reminder that your weekly check-in with <strong>{{manager_name}}</strong> is coming up.</p>

<p><strong>Prepare for Your Check-in:</strong></p>
<ul>
  <li>Review your accomplishments from the past week</li>
  <li>Note any challenges or blockers you''re facing</li>
  <li>Think about your priorities for the upcoming week</li>
  <li>Prepare any questions or topics for discussion</li>
</ul>

<p>Regular check-ins are a great opportunity to stay aligned, get feedback, and ensure you have the support you need.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_feedback',
  true,
  true
),
(
  'Recognition Alert',
  'New Recognition: {{recognition_type}}',
  '<p>Dear {{employee_first_name}},</p>

<p>Congratulations! You''ve been recognized for your outstanding contributions.</p>

<p><strong>Recognition Details:</strong></p>
<ul>
  <li>Type: {{recognition_type}}</li>
  <li>Date: {{event_date}}</li>
</ul>

<p>Your hard work and dedication have not gone unnoticed. This recognition reflects the positive impact you''re making on your team and the organization.</p>

<p>View the full details and share your achievement in the performance portal.</p>

<p>Well done!</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_feedback',
  true,
  true
),

-- Seed default email templates for Performance: Succession category
(
  'Talent Review Reminder',
  'Reminder: Talent Review Session {{event_date}}',
  '<p>Dear {{employee_first_name}},</p>

<p>This is a reminder that a talent review session is scheduled for <strong>{{event_date}}</strong>.</p>

<p><strong>Please prepare the following:</strong></p>
<ul>
  <li>Updated performance assessments for your direct reports</li>
  <li>9-box placement recommendations with supporting rationale</li>
  <li>Succession readiness assessments for key positions</li>
  <li>Development recommendations for high-potential employees</li>
</ul>

<p>Your insights are critical for building a strong leadership pipeline and ensuring we have the right talent in the right roles.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_succession',
  true,
  true
),
(
  'Successor Readiness Assessment Due',
  'Action Required: Successor Assessment for {{position_name}}',
  '<p>Dear {{employee_first_name}},</p>

<p>A successor readiness assessment is due for the <strong>{{position_name}}</strong> position.</p>

<p><strong>Assessment Requirements:</strong></p>
<ul>
  <li>Review identified successors for this role</li>
  <li>Evaluate current readiness levels (Ready Now, Ready 1-2 Years, Ready 3+ Years)</li>
  <li>Identify development gaps and recommended actions</li>
  <li>Update succession timeline estimates</li>
</ul>

<p><strong>Due Date:</strong> {{event_date}}</p>

<p>Maintaining accurate succession plans helps ensure business continuity and supports career development for high-potential employees.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_succession',
  true,
  true
),
(
  'Development Plan Action Required',
  'Development Plan Milestone Due: {{milestone_name}}',
  '<p>Dear {{employee_first_name}},</p>

<p>A development plan milestone is approaching its due date.</p>

<p><strong>Milestone Details:</strong></p>
<ul>
  <li>Milestone: {{milestone_name}}</li>
  <li>Due Date: {{event_date}}</li>
</ul>

<p><strong>Required Actions:</strong></p>
<ol>
  <li>Review the milestone requirements</li>
  <li>Complete any outstanding activities</li>
  <li>Document progress and outcomes</li>
  <li>Update the development plan status</li>
</ol>

<p>Completing development milestones on time demonstrates commitment to growth and helps prepare you for future opportunities.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_succession',
  true,
  true
),
(
  'Pipeline Update Notification',
  'Succession Pipeline Updated for {{department_name}}',
  '<p>Dear {{employee_first_name}},</p>

<p>The succession pipeline for <strong>{{department_name}}</strong> has been updated.</p>

<p><strong>Changes may include:</strong></p>
<ul>
  <li>New successor nominations</li>
  <li>Updated readiness assessments</li>
  <li>Modified development plans</li>
  <li>Position or role changes</li>
</ul>

<p>Please review the updated pipeline in the succession planning module to ensure you''re aware of any changes that may affect your team or development plans.</p>

<p>If you have questions about the updates, please contact your HR Business Partner.</p>

<p>Best regards,<br>{{company_name}} HR Team</p>',
  'performance_succession',
  true,
  true
);