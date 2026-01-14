
-- Link existing global templates to their event types
UPDATE reminder_email_templates SET event_type_id = 'a5d7fea7-1a47-4034-9f35-63de6d61a34d' 
WHERE id = '7fe987a5-01a4-4aae-a307-f1383fd324e6'; -- Performance Review Due -> APPRAISAL_DUE

UPDATE reminder_email_templates SET event_type_id = 'd6a987f2-4f36-4844-9b54-48b16eba2670' 
WHERE id = '31651c04-89f5-4151-8dfc-6a2be9627cce'; -- Review Cycle Launch -> APPRAISAL_CYCLE_STARTING

UPDATE reminder_email_templates SET event_type_id = '71428dea-29b0-494a-8cce-196d9c714f70' 
WHERE id = 'f529fd88-89e5-4c48-ac9e-341cd6321e23'; -- Manager Sign-off Required -> APPRAISAL_FINALIZED

-- Insert missing global default templates for all event types
INSERT INTO reminder_email_templates (company_id, event_type_id, category, name, subject, body, is_default, is_active) VALUES

-- APPRAISAL_CYCLE_ENDING
(NULL, '87cb2d5d-ccde-4acd-b457-a0d7fc441173', 'performance_appraisals', 
'Appraisal Cycle Closing Reminder',
'Final Reminder: Performance Review Cycle Ends {{event_date}}',
'<p>Dear {{recipient_name}},</p>
<p>This is a final reminder that the <strong>{{cycle_name}}</strong> performance review cycle is closing on <strong>{{event_date}}</strong>.</p>
<p><strong>Outstanding Actions:</strong></p>
<ul>
<li>Complete all pending evaluations</li>
<li>Submit final ratings and comments</li>
<li>Ensure all acknowledgments are obtained</li>
</ul>
<p>Any incomplete reviews after the deadline may require special approval to process.</p>
<p>Please log in to complete your tasks before the deadline.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- APPRAISAL_EVALUATION_OVERDUE (Critical)
(NULL, 'c021467d-edad-4097-817e-a2a7057a718d', 'performance_appraisals',
'URGENT: Overdue Evaluation Alert',
'URGENT: Performance Evaluation Overdue for {{employee_name}}',
'<p>Dear {{recipient_name}},</p>
<p><strong>IMMEDIATE ACTION REQUIRED</strong></p>
<p>The performance evaluation for <strong>{{employee_name}}</strong> is now <strong>overdue</strong>.</p>
<p><strong>Original Due Date:</strong> {{event_date}}</p>
<p>Overdue evaluations impact:</p>
<ul>
<li>Employee compensation review timelines</li>
<li>Career development planning</li>
<li>Organizational performance reporting</li>
</ul>
<p>Please complete this evaluation immediately or contact HR if you require an extension.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- APPRAISAL_INTERVIEW_SCHEDULED
(NULL, 'ac8d2ff4-c8a0-4e3b-aa1f-40cab6910a7c', 'performance_appraisals',
'Performance Discussion Reminder',
'Reminder: Performance Review Discussion on {{event_date}}',
'<p>Dear {{recipient_name}},</p>
<p>This is a reminder of your upcoming performance review discussion:</p>
<p><strong>Date:</strong> {{event_date}}<br>
<strong>Employee:</strong> {{employee_name}}</p>
<p><strong>Preparation Tips:</strong></p>
<ul>
<li>Review the completed evaluation form</li>
<li>Prepare specific examples and feedback</li>
<li>Consider development opportunities to discuss</li>
<li>Allow sufficient uninterrupted time</li>
</ul>
<p>A meaningful discussion helps employees understand expectations and feel valued.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- appraisal_deadline
(NULL, '8e1dc1e0-2c40-4fc3-b003-d8dc728ea7db', 'performance_appraisals',
'Appraisal Deadline Warning',
'Action Required: Performance Review Deadline {{event_date}}',
'<p>Dear {{recipient_name}},</p>
<p>This is a reminder that your performance review tasks are due by <strong>{{event_date}}</strong>.</p>
<p><strong>Please ensure you have:</strong></p>
<ul>
<li>Completed all assigned evaluations</li>
<li>Submitted ratings with supporting comments</li>
<li>Scheduled feedback discussions where required</li>
</ul>
<p>Timely completion ensures employees receive feedback and any compensation adjustments can be processed on schedule.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- COMPENSATION_FLAG_CREATED
(NULL, 'c8df9f77-ba2b-4a37-b568-8b9bf10ed84c', 'performance_appraisals',
'Compensation Review Flag Notification',
'Compensation Review Flag Created for {{employee_name}}',
'<p>Dear {{recipient_name}},</p>
<p>A compensation review flag has been created based on the performance appraisal results:</p>
<p><strong>Employee:</strong> {{employee_name}}<br>
<strong>Flag Type:</strong> {{flag_type}}<br>
<strong>Review Due:</strong> {{event_date}}</p>
<p>This flag indicates that a compensation adjustment review should be conducted. Please coordinate with the Compensation team to evaluate and process as appropriate.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- COMPENSATION_FLAG_EXPIRING
(NULL, '34027624-7393-4d99-857b-0151c76730cc', 'performance_appraisals',
'Compensation Flag Expiring Alert',
'Action Required: Compensation Review Flag Expires Soon',
'<p>Dear {{recipient_name}},</p>
<p><strong>Attention Required:</strong> A compensation review flag is expiring soon.</p>
<p><strong>Employee:</strong> {{employee_name}}<br>
<strong>Expiration Date:</strong> {{event_date}}</p>
<p>Please ensure the compensation review is completed before expiration. Expired flags may require reauthorization to process any adjustments.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- COMPENSATION_REVIEW_DUE
(NULL, 'fe0c5729-42df-4deb-857f-edf2e5691e59', 'performance_appraisals',
'Compensation Review Due Reminder',
'Compensation Review Due: {{event_date}}',
'<p>Dear {{recipient_name}},</p>
<p>A compensation review is due for processing:</p>
<p><strong>Employee:</strong> {{employee_name}}<br>
<strong>Due Date:</strong> {{event_date}}<br>
<strong>Review Type:</strong> {{review_type}}</p>
<p>Please complete the review and submit your recommendations through the compensation module.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- IDP_CREATED
(NULL, 'b30fbbce-59a3-4949-97a4-3841e69362f5', 'performance_appraisals',
'Individual Development Plan Ready',
'Your Individual Development Plan is Ready for Review',
'<p>Dear {{recipient_name}},</p>
<p>An Individual Development Plan (IDP) has been created based on your recent performance review:</p>
<p><strong>Employee:</strong> {{employee_name}}<br>
<strong>Created Date:</strong> {{event_date}}</p>
<p>The IDP outlines:</p>
<ul>
<li>Development goals and objectives</li>
<li>Recommended learning activities</li>
<li>Timeline and milestones</li>
<li>Support resources available</li>
</ul>
<p>Please log in to review the plan and discuss next steps with your manager.</p>
<p>Best regards,<br>Human Resources</p>',
true, true),

-- PIP_CREATED (Critical)
(NULL, '6ceb47be-ca0f-49f4-b7a2-6f2f15dae5c2', 'performance_appraisals',
'Performance Improvement Plan Notification',
'Performance Improvement Plan Initiated',
'<p>Dear {{recipient_name}},</p>
<p>A Performance Improvement Plan (PIP) has been initiated:</p>
<p><strong>Employee:</strong> {{employee_name}}<br>
<strong>Start Date:</strong> {{event_date}}<br>
<strong>Duration:</strong> {{pip_duration}}</p>
<p>The PIP includes:</p>
<ul>
<li>Specific performance areas requiring improvement</li>
<li>Clear expectations and measurable goals</li>
<li>Support and resources to be provided</li>
<li>Review checkpoints and timeline</li>
</ul>
<p>Please log in to review the complete plan details. HR is available to support both manager and employee through this process.</p>
<p>Best regards,<br>Human Resources</p>',
true, true);
