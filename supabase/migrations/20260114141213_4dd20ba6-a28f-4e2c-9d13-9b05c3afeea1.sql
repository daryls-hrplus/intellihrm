-- Seed 3 additional templates for Performance: Appraisals category
-- This completes the 4-template suite for this sub-category

INSERT INTO reminder_email_templates (name, subject, body, category, is_default, is_active)
VALUES 
  -- Review Cycle Launch
  (
    'Review Cycle Launch',
    'Performance Review Cycle Now Open: {{cycle_name}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a365d;">Performance Review Cycle Has Begun</h2>
  
  <p>Dear {{employee_first_name}},</p>
  
  <p>We are pleased to announce that the <strong>{{cycle_name}}</strong> performance review cycle is now officially open. This is your opportunity to reflect on your achievements, growth, and contributions over the review period.</p>
  
  <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h3 style="color: #2d3748; margin-top: 0;">Cycle Details</h3>
    <ul style="color: #4a5568;">
      <li><strong>Cycle Name:</strong> {{cycle_name}}</li>
      <li><strong>Self-Assessment Deadline:</strong> {{event_date}}</li>
      <li><strong>Review Period:</strong> {{review_period}}</li>
    </ul>
  </div>
  
  <h3 style="color: #2d3748;">What You Need to Do</h3>
  <ol style="color: #4a5568;">
    <li>Complete your self-assessment by the deadline</li>
    <li>Gather any supporting documentation for your accomplishments</li>
    <li>Review your goals and note progress made</li>
    <li>Prepare discussion points for your review meeting</li>
  </ol>
  
  <p style="margin-top: 20px;">Your participation in this process is essential for your professional development and career growth at {{company_name}}.</p>
  
  <p>Best regards,<br>{{company_name}} HR Team</p>
</div>',
    'performance_appraisals',
    true,
    true
  ),
  
  -- Manager Sign-off Required
  (
    'Manager Sign-off Required',
    'Action Required: Sign Off on {{employee_name}}''s Performance Review',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #c53030;">Action Required: Manager Sign-off Needed</h2>
  
  <p>Dear {{manager_name}},</p>
  
  <p>A performance review is awaiting your final sign-off. Please complete this action to finalize the review process.</p>
  
  <div style="background-color: #fff5f5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #c53030;">
    <h3 style="color: #c53030; margin-top: 0;">Review Pending Sign-off</h3>
    <ul style="color: #4a5568;">
      <li><strong>Employee:</strong> {{employee_name}}</li>
      <li><strong>Review Cycle:</strong> {{cycle_name}}</li>
      <li><strong>Sign-off Deadline:</strong> {{event_date}}</li>
      <li><strong>Days Remaining:</strong> {{days_until}} days</li>
    </ul>
  </div>
  
  <h3 style="color: #2d3748;">Required Actions</h3>
  <ol style="color: #4a5568;">
    <li>Review the completed evaluation and ratings</li>
    <li>Ensure all sections are complete and accurate</li>
    <li>Add any final manager comments</li>
    <li>Submit your sign-off to release results to the employee</li>
  </ol>
  
  <p style="margin-top: 20px;"><strong>Note:</strong> The employee will not be able to view their final review until you complete the sign-off.</p>
  
  <p>Best regards,<br>{{company_name}} HR Team</p>
</div>',
    'performance_appraisals',
    true,
    true
  ),
  
  -- Calibration Session Reminder
  (
    'Calibration Session Reminder',
    'Reminder: Performance Calibration Session on {{event_date}}',
    '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #1a365d;">Performance Calibration Session Reminder</h2>
  
  <p>Dear {{manager_name}},</p>
  
  <p>This is a reminder about your upcoming performance calibration session. Your participation is essential to ensure fair and consistent evaluations across the organization.</p>
  
  <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3182ce;">
    <h3 style="color: #2b6cb0; margin-top: 0;">Session Details</h3>
    <ul style="color: #4a5568;">
      <li><strong>Date:</strong> {{event_date}}</li>
      <li><strong>Department:</strong> {{department_name}}</li>
      <li><strong>Review Cycle:</strong> {{cycle_name}}</li>
    </ul>
  </div>
  
  <h3 style="color: #2d3748;">Preparation Checklist</h3>
  <ol style="color: #4a5568;">
    <li>Complete all preliminary ratings for your direct reports</li>
    <li>Prepare justification notes for high and low performers</li>
    <li>Review the calibration guidelines and rating distribution expectations</li>
    <li>Gather specific examples and accomplishments to support your assessments</li>
    <li>Be ready to discuss development recommendations</li>
  </ol>
  
  <div style="background-color: #fffaf0; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="color: #c05621; margin: 0;"><strong>Reminder:</strong> All preliminary ratings must be submitted before the calibration session begins.</p>
  </div>
  
  <p>Best regards,<br>{{company_name}} HR Team</p>
</div>',
    'performance_appraisals',
    true,
    true
  );