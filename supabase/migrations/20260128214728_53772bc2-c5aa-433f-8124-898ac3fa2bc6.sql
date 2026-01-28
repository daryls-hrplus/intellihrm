-- Seed default email templates for all L&D notification event types
-- These are default templates (is_default=true) that companies can customize

INSERT INTO reminder_email_templates (id, name, subject, body, category, is_default, is_active) 
VALUES
  -- Enrollment & Progress
  (gen_random_uuid(), 'Course Enrollment Confirmation', 
   'You are enrolled in: {{course_name}}', 
   E'<h2>Course Enrollment Confirmed</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>You have been enrolled in <strong>{{course_name}}</strong>.</p>\n<p><strong>Due Date:</strong> {{event_date}}</p>\n<p>Access your course through the Learning Portal to begin your training.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Course Completion Reminder', 
   'Reminder: {{course_name}} due {{days_until}} days', 
   E'<h2>Course Deadline Approaching</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>This is a reminder that your course <strong>{{course_name}}</strong> is due in <strong>{{days_until}} days</strong> on {{event_date}}.</p>\n<p>Your current progress: {{progress_percent}}%</p>\n<p>Please complete your training before the deadline.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Enrollment Expiring Notice', 
   'Your enrollment in {{course_name}} expires in {{days_until}} days', 
   E'<h2>Enrollment Expiring Soon</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your enrollment in <strong>{{course_name}}</strong> will expire in <strong>{{days_until}} days</strong>.</p>\n<p>Please complete the course before your access expires on {{event_date}}.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Overdue Training Alert', 
   'OVERDUE: {{course_name}} - Action Required', 
   E'<h2>⚠️ Overdue Training Alert</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your required training <strong>{{course_name}}</strong> is now <strong>overdue</strong>.</p>\n<p>Original due date: {{event_date}}</p>\n<p>Please complete this training immediately to maintain compliance.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Learning Progress Stalled', 
   'We noticed you paused: {{course_name}}', 
   E'<h2>Continue Your Learning Journey</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>We noticed you have not made progress on <strong>{{course_name}}</strong> recently.</p>\n<p>Your current progress: {{progress_percent}}%</p>\n<p>Getting back on track is easy - just click below to continue where you left off.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Course Completed', 
   'Congratulations! You completed {{course_name}}', 
   E'<h2>🎉 Course Completed!</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Congratulations on completing <strong>{{course_name}}</strong>!</p>\n<p>Your training record has been updated. You can view your transcript in the Learning Portal.</p>\n<p>Keep up the great work on your professional development!</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),

  -- Assessments & Quizzes
  (gen_random_uuid(), 'Quiz Deadline Approaching', 
   'Quiz deadline: {{course_name}} - {{days_until}} days remaining', 
   E'<h2>Quiz Submission Deadline</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>The quiz for <strong>{{course_name}}</strong> must be completed within <strong>{{days_until}} days</strong>.</p>\n<p>Ensure you submit before the deadline on {{event_date}}.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Quiz Failed - Retake Available', 
   'Quiz Results: {{course_name}} - Retake Available', 
   E'<h2>Quiz Results</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your score on the <strong>{{course_name}}</strong> quiz was <strong>{{quiz_score}}%</strong>. The passing score is {{passing_score}}%.</p>\n<p>Good news - you have <strong>{{retakes_remaining}} retake(s)</strong> remaining.</p>\n<p>Review the material and try again when ready.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),

  -- Certificates
  (gen_random_uuid(), 'Certificate Issued', 
   'Your certificate for {{course_name}} is ready', 
   E'<h2>🏆 Certificate Issued</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your certificate for completing <strong>{{course_name}}</strong> has been issued.</p>\n<p>Certificate Number: {{certificate_number}}</p>\n<p>You can download your certificate from the Learning Portal.</p>\n<p>Congratulations on your achievement!</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Certificate Expiring', 
   'Certificate expiring: {{course_name}} - {{days_until}} days', 
   E'<h2>Certificate Expiration Notice</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your certificate for <strong>{{course_name}}</strong> will expire in <strong>{{days_until}} days</strong> on {{certificate_expiry}}.</p>\n<p>Please complete the recertification course to maintain your credentials.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Recertification Due', 
   'Recertification required: {{course_name}}', 
   E'<h2>Recertification Required</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your certification for <strong>{{course_name}}</strong> requires renewal.</p>\n<p>Expiration date: {{certificate_expiry}}</p>\n<p>Please complete the recertification process to maintain your credentials.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),

  -- Training Requests
  (gen_random_uuid(), 'Training Request Submitted', 
   'Training request submitted: {{course_name}}', 
   E'<h2>Training Request Received</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your training request for <strong>{{course_name}}</strong> has been submitted.</p>\n<p>Request Date: {{event_date}}</p>\n<p>You will be notified once your request has been reviewed.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Training Request Approved', 
   '✓ Training request approved: {{course_name}}', 
   E'<h2>✅ Training Request Approved</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Great news! Your training request for <strong>{{course_name}}</strong> has been approved.</p>\n<p>You will receive enrollment details shortly.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Training Request Rejected', 
   'Training request update: {{course_name}}', 
   E'<h2>Training Request Update</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your training request for <strong>{{course_name}}</strong> was not approved at this time.</p>\n<p>Please contact your manager or HR for more information about alternative options.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Training Request Pending Approval', 
   'Action Required: Training request awaiting your approval', 
   E'<h2>Training Request Pending Your Approval</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>A training request is awaiting your approval:</p>\n<p><strong>Course:</strong> {{course_name}}</p>\n<p><strong>Requested by:</strong> {{employee_name}}</p>\n<p>Please review and approve or reject this request in the HR Hub.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Training Budget Alert', 
   'Training budget threshold reached', 
   E'<h2>Training Budget Alert</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>The training budget for your department has reached the configured threshold.</p>\n<p>Please review training expenditures and adjust upcoming training plans as needed.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),

  -- Vendor Sessions
  (gen_random_uuid(), 'Session Reminder', 
   'Upcoming session: {{course_name}} on {{session_date}}', 
   E'<h2>Training Session Reminder</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>This is a reminder about your upcoming training session:</p>\n<p><strong>Course:</strong> {{course_name}}</p>\n<p><strong>Date:</strong> {{session_date}}</p>\n<p><strong>Location:</strong> {{session_location}}</p>\n<p>Please ensure you are available and prepared.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Registration Deadline Approaching', 
   'Register now: {{course_name}} - deadline {{days_until}} days', 
   E'<h2>Registration Deadline Approaching</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>The registration deadline for <strong>{{course_name}}</strong> is in <strong>{{days_until}} days</strong>.</p>\n<p>Secure your spot by registering before {{event_date}}.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Session Registration Confirmed', 
   'Registration confirmed: {{course_name}}', 
   E'<h2>Registration Confirmed</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your registration for <strong>{{course_name}}</strong> has been confirmed.</p>\n<p><strong>Session Date:</strong> {{session_date}}</p>\n<p><strong>Location:</strong> {{session_location}}</p>\n<p>Please add this to your calendar.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Session Cancelled', 
   'Session cancelled: {{course_name}}', 
   E'<h2>Session Cancellation Notice</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>We regret to inform you that the following training session has been cancelled:</p>\n<p><strong>Course:</strong> {{course_name}}</p>\n<p><strong>Original Date:</strong> {{session_date}}</p>\n<p>You will be notified when the session is rescheduled.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),

  -- External Training
  (gen_random_uuid(), 'External Training Submitted', 
   'External training record submitted', 
   E'<h2>External Training Record Received</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your external training record has been submitted for verification:</p>\n<p><strong>Training:</strong> {{course_name}}</p>\n<p><strong>Provider:</strong> {{training_provider}}</p>\n<p>HR will review and verify your submission.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'External Training Verified', 
   'External training verified: {{course_name}}', 
   E'<h2>External Training Verified</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your external training record has been verified and added to your transcript:</p>\n<p><strong>Training:</strong> {{course_name}}</p>\n<p><strong>Provider:</strong> {{training_provider}}</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'External Certificate Expiring', 
   'External certificate expiring: {{course_name}}', 
   E'<h2>External Certificate Expiration Notice</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Your external certificate for <strong>{{course_name}}</strong> from <strong>{{training_provider}}</strong> will expire in <strong>{{days_until}} days</strong>.</p>\n<p>Please arrange recertification to maintain your credentials.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),

  -- Evaluations
  (gen_random_uuid(), 'Training Evaluation Due', 
   'Please evaluate: {{course_name}}', 
   E'<h2>Training Evaluation Request</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>Please take a moment to evaluate your recent training:</p>\n<p><strong>Course:</strong> {{course_name}}</p>\n<p>Your feedback helps us improve our training programs.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true),
  
  (gen_random_uuid(), 'Evaluation Follow-up', 
   'Reminder: Evaluate {{course_name}}', 
   E'<h2>Evaluation Reminder</h2>\n<p>Hello {{employee_first_name}},</p>\n<p>We noticed you haven''t completed your evaluation for <strong>{{course_name}}</strong>.</p>\n<p>Your feedback is valuable and only takes a few minutes.</p>\n<p>Best regards,<br>Learning & Development Team</p>', 
   'training', true, true)

ON CONFLICT DO NOTHING;