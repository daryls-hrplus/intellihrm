-- Seed 49 Workforce-Related Email Templates
-- Categories: workforce, document, compliance, benefits, employment, employee_voice

-- ============================================================================
-- BENEFITS CATEGORY (3 templates)
-- ============================================================================

INSERT INTO reminder_email_templates (
  event_type_id, name, subject, body, is_default, is_active, category
) VALUES
-- Benefits Enrollment Deadline
(
  '878afb44-4294-4e8e-a636-f83d2b132e9a',
  'Benefits Enrollment Deadline Reminder',
  'Action Required: Benefits Enrollment Closes in {days_until} Days',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Benefits Enrollment Deadline Approaching</h2>
    <p>Dear {employee_name},</p>
    <p>This is a reminder that the <strong>benefits enrollment period</strong> will close on <strong>{event_date}</strong> ({days_until} days remaining).</p>
    <p>Please review and complete your benefits elections before the deadline. Any changes to your current elections must be made before the enrollment window closes.</p>
    <h3 style="color: #374151;">What You Need to Do:</h3>
    <ul>
      <li>Review your current benefit elections</li>
      <li>Make any desired changes to health, dental, or vision coverage</li>
      <li>Update beneficiary information if needed</li>
      <li>Submit your elections before {event_date}</li>
    </ul>
    <p>If you have questions about your options, please contact HR or your benefits administrator.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'benefits'
),
-- Benefit Plan Ending
(
  '464a9c2f-cc93-42b8-8287-1334346f6386',
  'Benefit Plan Ending Notice',
  'Important: Your {item_name} Coverage Ends {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Benefit Plan Ending Notice</h2>
    <p>Dear {employee_name},</p>
    <p>We are writing to inform you that your <strong>{item_name}</strong> benefit coverage is scheduled to end on <strong>{event_date}</strong>.</p>
    <p>This notification is being sent {days_until} days in advance to allow you time to:</p>
    <ul>
      <li>Review your current coverage details</li>
      <li>Explore alternative coverage options</li>
      <li>Complete any pending claims</li>
      <li>Plan for any transition requirements</li>
    </ul>
    <p>If you believe this is an error or have questions about your coverage, please contact HR immediately.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'benefits'
),
-- Insurance Policy Expiring
(
  'e81586a3-9d97-4bdb-94f6-20a92a620f2a',
  'Insurance Policy Expiring Alert',
  'Reminder: Your Insurance Policy Expires on {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Insurance Policy Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your <strong>{item_name}</strong> insurance policy is set to expire on <strong>{event_date}</strong> ({days_until} days from now).</p>
    <p>To ensure continuous coverage, please take the following steps:</p>
    <ul>
      <li>Contact your insurance provider about renewal options</li>
      <li>Review and update your coverage if needed</li>
      <li>Submit renewal documentation to HR</li>
    </ul>
    <p>Maintaining valid insurance coverage is important for your protection and may be required by company policy.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'benefits'
);

-- ============================================================================
-- COMPLIANCE CATEGORY (5 templates)
-- ============================================================================

INSERT INTO reminder_email_templates (
  event_type_id, name, subject, body, is_default, is_active, category
) VALUES
-- Background Check Expiring
(
  'fb3aa292-16ff-4390-b2cf-d33ae474c68f',
  'Background Check Renewal Required',
  'Action Required: Background Check Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Background Check Renewal Required</h2>
    <p>Dear {employee_name},</p>
    <p>Your background check on file is scheduled to expire on <strong>{event_date}</strong>. Per company policy, a valid background check is required for your position.</p>
    <p>Please coordinate with HR to initiate a new background check before the expiration date to avoid any impact on your employment status.</p>
    <p>Required Actions:</p>
    <ul>
      <li>Contact HR to schedule your background check renewal</li>
      <li>Complete any required consent forms</li>
      <li>Provide updated personal information if needed</li>
    </ul>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'compliance'
),
-- Compliance Training Due
(
  'a1cf53d5-9d31-401d-9732-4543aeab3e6f',
  'Mandatory Compliance Training Due',
  'Required: Complete Compliance Training by {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Mandatory Compliance Training Due</h2>
    <p>Dear {employee_name},</p>
    <p>You have <strong>mandatory compliance training</strong> that must be completed by <strong>{event_date}</strong> ({days_until} days remaining).</p>
    <p>Failure to complete required compliance training may result in:</p>
    <ul>
      <li>Temporary suspension of system access</li>
      <li>Impact on performance evaluations</li>
      <li>Escalation to your manager and HR</li>
    </ul>
    <p>Please log into the Learning Management System and complete all assigned compliance courses as soon as possible.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'compliance'
),
-- CSME Certificate Expiring
(
  '01a4316d-48bf-4aba-8b1b-d1f3251ddbc1',
  'CSME Certificate Expiring',
  'Important: Your CSME Certificate Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">CSME Certificate Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your <strong>CARICOM Single Market & Economy (CSME) Skills Certificate</strong> is set to expire on <strong>{event_date}</strong>.</p>
    <p>This certificate is essential for your work authorization within the CARICOM region. Please initiate the renewal process immediately to avoid any disruption to your employment.</p>
    <p>Next Steps:</p>
    <ul>
      <li>Gather required renewal documentation</li>
      <li>Submit renewal application to the relevant authority</li>
      <li>Provide HR with a copy of your renewal receipt</li>
      <li>Submit the new certificate once received</li>
    </ul>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'compliance'
),
-- Visa/Travel Document Expiring
(
  '1bc2861a-0f23-4544-9235-1bd16f09a55d',
  'Visa/Travel Document Expiring',
  'Urgent: Your Visa Expires on {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Visa/Travel Document Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Our records indicate that your <strong>{item_name}</strong> is set to expire on <strong>{event_date}</strong> ({days_until} days remaining).</p>
    <p>Maintaining valid travel and immigration documents is critical for your employment eligibility. Please take immediate action to renew your documentation.</p>
    <p><strong>Important:</strong> Please provide HR with updated documentation as soon as it is renewed to ensure our records remain current and compliant.</p>
    <p>If you need assistance with the renewal process or have questions about immigration support, please contact HR immediately.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'compliance'
),
-- Work Permit Expiring
(
  'd13b294e-ad09-4c71-806a-35794a2f292a',
  'Work Permit Expiring Alert',
  'URGENT: Work Permit Expires {event_date} - Action Required',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Work Permit Expiring - Immediate Action Required</h2>
    <p>Dear {employee_name},</p>
    <p>Your <strong>Work Permit</strong> is scheduled to expire on <strong>{event_date}</strong>. This is a critical compliance matter that requires your immediate attention.</p>
    <p>Without a valid work permit, you will not be legally authorized to work. The company cannot employ individuals without proper work authorization.</p>
    <p><strong>Required Actions:</strong></p>
    <ul>
      <li>Initiate work permit renewal immediately if not already done</li>
      <li>Provide HR with proof of renewal application submission</li>
      <li>Submit the renewed work permit to HR as soon as received</li>
      <li>Keep HR updated on the status of your renewal</li>
    </ul>
    <p>Please contact HR immediately if you anticipate any delays or issues with your renewal.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'compliance'
);

-- ============================================================================
-- DOCUMENT CATEGORY (8 templates)
-- ============================================================================

INSERT INTO reminder_email_templates (
  event_type_id, name, subject, body, is_default, is_active, category
) VALUES
-- Certificate Expiring
(
  '862bae45-a372-48d6-a267-44303c3c8867',
  'Certificate Expiring Reminder',
  'Reminder: Your {item_name} Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Certificate Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your <strong>{item_name}</strong> certificate is set to expire on <strong>{event_date}</strong> ({days_until} days remaining).</p>
    <p>Please arrange for renewal to maintain your qualifications and ensure compliance with role requirements.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- Certification Expiry
(
  '54ccf803-5cdb-4a15-bfbc-5802ad5494c8',
  'Professional Certification Expiring',
  'Action Required: {item_name} Certification Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Professional Certification Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your professional certification <strong>{item_name}</strong> is scheduled to expire on <strong>{event_date}</strong>.</p>
    <p>Maintaining current certifications is important for your professional development and may be required for your role. Please initiate the recertification process as soon as possible.</p>
    <p>Steps to consider:</p>
    <ul>
      <li>Check continuing education requirements</li>
      <li>Complete any pending CEU credits</li>
      <li>Submit recertification application</li>
      <li>Update HR with new certification documents</li>
    </ul>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- Character Certificate Expiring
(
  '1dce9f7d-adb6-4029-8d3b-0b506d50cb90',
  'Character Certificate Expiring',
  'Reminder: Character Certificate Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Character Certificate Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your <strong>Character Certificate (Police Clearance)</strong> on file is set to expire on <strong>{event_date}</strong>.</p>
    <p>Per company policy, a valid character certificate is required for your position. Please obtain a new certificate and submit it to HR before the expiration date.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- Document Expiring
(
  '59e7c15b-100f-4b0b-a961-95928d60044e',
  'Document Expiring Reminder',
  'Reminder: Your {item_name} Expires on {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Document Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>This is a reminder that your <strong>{item_name}</strong> is set to expire on <strong>{event_date}</strong> ({days_until} days remaining).</p>
    <p>Please ensure you renew this document and provide an updated copy to HR before the expiration date.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- License Expiring
(
  'ab49d9e4-a28e-44a2-93a3-ca601aece226',
  'License Expiring Reminder',
  'Action Required: Your {item_name} Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">License Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your <strong>{item_name}</strong> license is scheduled to expire on <strong>{event_date}</strong>.</p>
    <p>If this license is required for your job duties, please renew it promptly and submit the updated license to HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- Medical Checkup Due
(
  '73e36f20-d321-4f7a-a03a-624e4a759e60',
  'Medical Checkup Due',
  'Reminder: Schedule Your Medical Checkup by {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Medical Checkup Due</h2>
    <p>Dear {employee_name},</p>
    <p>According to our records, your periodic <strong>medical checkup</strong> is due by <strong>{event_date}</strong>.</p>
    <p>Regular health assessments are important for your well-being and may be required by company health and safety policies.</p>
    <p>Please schedule your appointment with an approved medical provider and submit the results to HR upon completion.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- Professional Membership Expiring
(
  '4b9ec3da-5fb1-4f09-ba9d-00006c608bf6',
  'Professional Membership Expiring',
  'Reminder: {item_name} Membership Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Professional Membership Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your membership with <strong>{item_name}</strong> is set to expire on <strong>{event_date}</strong>.</p>
    <p>If this professional membership is required for your role or beneficial for your career development, please renew before the expiration date.</p>
    <p>Note: If your membership fees are company-sponsored, please contact HR for renewal assistance.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
),
-- Union Membership Ending
(
  'aea3e2cb-e900-4771-b740-4a8c23f39311',
  'Union Membership Ending Notice',
  'Notice: Union Membership Status Change - {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #6b7280;">Union Membership Ending</h2>
    <p>Dear {employee_name},</p>
    <p>This is to inform you that your <strong>union membership</strong> with {item_name} is ending on <strong>{event_date}</strong>.</p>
    <p>If you wish to renew or have questions about your membership status, please contact your union representative or HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'document'
);

-- ============================================================================
-- EMPLOYMENT CATEGORY (2 templates)
-- ============================================================================

INSERT INTO reminder_email_templates (
  event_type_id, name, subject, body, is_default, is_active, category
) VALUES
-- Employee Agreement Expiring
(
  'a19cb700-e795-447b-bc45-f1521e06b635',
  'Employee Agreement Expiring',
  'Notice: Your Employment Agreement Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Employment Agreement Expiring</h2>
    <p>Dear {employee_name},</p>
    <p>Your current <strong>employment agreement</strong> is set to expire on <strong>{event_date}</strong>.</p>
    <p>HR will be in contact with you regarding agreement renewal or any changes to the terms of your employment. If you have any questions or concerns, please reach out to HR proactively.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employment'
),
-- Collective Agreement Expiring
(
  '637bf1cd-4628-4801-a5ca-09cc9178ba00',
  'Collective Agreement Expiring Notice',
  'Notice: Collective Agreement Expires {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Collective Agreement Expiring</h2>
    <p>Dear HR Team,</p>
    <p>This is a reminder that the <strong>collective agreement</strong> with {item_name} is scheduled to expire on <strong>{event_date}</strong>.</p>
    <p>Please ensure that negotiations or renewal discussions are initiated in a timely manner to ensure continuity of the agreement.</p>
    <p>Action items:</p>
    <ul>
      <li>Schedule negotiation meetings with union representatives</li>
      <li>Review current agreement terms</li>
      <li>Prepare renewal proposals</li>
      <li>Communicate timeline to affected employees</li>
    </ul>
    <p>Best regards,<br>{company_name} System</p>
  </div>',
  true, true, 'employment'
);

-- ============================================================================
-- EMPLOYEE VOICE CATEGORY (8 templates)
-- ============================================================================

INSERT INTO reminder_email_templates (
  event_type_id, name, subject, body, is_default, is_active, category
) VALUES
-- New Employee Escalation
(
  '432e0f8c-5c75-4a93-87d1-562bb16845b0',
  'New Employee Escalation Received',
  'New Escalation: {item_name} - Action Required',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">New Employee Escalation</h2>
    <p>Dear HR Team,</p>
    <p>A new escalation has been submitted by <strong>{employee_name}</strong> from {department}.</p>
    <p><strong>Subject:</strong> {item_name}</p>
    <p>Please review this escalation and respond within the defined SLA timeframe. The employee is awaiting resolution.</p>
    <p>Best regards,<br>{company_name} System</p>
  </div>',
  true, true, 'employee_voice'
),
-- ESS Request Approved
(
  '0bd4f601-94d1-4b73-b23b-5660e3fc5300',
  'ESS Request Approved',
  'Your Request Has Been Approved: {item_name}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Request Approved</h2>
    <p>Dear {employee_name},</p>
    <p>Great news! Your request for <strong>{item_name}</strong> has been approved.</p>
    <p>The changes will be reflected in your employee profile. If you have any questions, please contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
),
-- ESS Request Additional Info Required
(
  '97b8fdbb-13b3-4f86-949b-bda94dc3f99a',
  'Additional Information Required',
  'Action Required: More Information Needed for Your Request',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Additional Information Required</h2>
    <p>Dear {employee_name},</p>
    <p>Your request for <strong>{item_name}</strong> requires additional information before it can be processed.</p>
    <p>Please log into the employee portal and provide the requested details. If you need assistance, contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
),
-- ESS Request Rejected
(
  '1fd8be20-1b5e-485a-8b2b-0e619b7b629d',
  'ESS Request Rejected',
  'Update: Your Request Could Not Be Approved',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Request Not Approved</h2>
    <p>Dear {employee_name},</p>
    <p>Unfortunately, your request for <strong>{item_name}</strong> could not be approved at this time.</p>
    <p>Please log into the employee portal to view the reason for this decision. If you have questions or wish to discuss this further, please contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
),
-- HR Resolved Your Escalation
(
  '24df0dfa-2ff0-414d-86a7-26f41c00c911',
  'Escalation Resolved',
  'Your Escalation Has Been Resolved: {item_name}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Escalation Resolved</h2>
    <p>Dear {employee_name},</p>
    <p>We are pleased to inform you that your escalation regarding <strong>{item_name}</strong> has been resolved.</p>
    <p>Please review the resolution in the employee portal. If you have any follow-up questions or are not satisfied with the resolution, please contact HR directly.</p>
    <p>Thank you for bringing this matter to our attention.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
),
-- Manager Responded to Your Feedback
(
  '87b34254-e684-461e-b3f4-5d09d5fa4aaa',
  'Manager Response Received',
  'Your Manager Has Responded to Your Feedback',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Manager Response Received</h2>
    <p>Dear {employee_name},</p>
    <p>Your manager <strong>{manager_name}</strong> has responded to your feedback submission.</p>
    <p>Please log into the performance portal to view the response and continue the dialogue.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
),
-- Response Deadline Approaching
(
  '6af015a4-b283-4835-a17b-cad32f20aed2',
  'Response Deadline Approaching',
  'Reminder: Response Due by {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Response Deadline Approaching</h2>
    <p>Dear {manager_name},</p>
    <p>This is a reminder that you have a pending response due by <strong>{event_date}</strong> ({days_until} days remaining).</p>
    <p>An employee is awaiting your feedback or decision. Please log into the system and complete your response promptly.</p>
    <p>Timely responses help maintain employee engagement and trust.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
),
-- Manager Review Response Required
(
  'ec4d96a7-c9fc-48d6-ad25-4696f74ba2c7',
  'Manager Review Response Required',
  'Action Required: Employee Awaiting Your Review Response',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Response Required</h2>
    <p>Dear {manager_name},</p>
    <p>An employee under your supervision, <strong>{employee_name}</strong>, has submitted a review or feedback that requires your response.</p>
    <p>Please log into the performance system and provide your response at your earliest convenience.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'employee_voice'
);

-- ============================================================================
-- WORKFORCE CATEGORY (23 templates)
-- ============================================================================

INSERT INTO reminder_email_templates (
  event_type_id, name, subject, body, is_default, is_active, category
) VALUES
-- Acting Assignment Ending
(
  'c86bfce6-0e04-4429-a13e-b0db0ecbd900',
  'Acting Assignment Ending',
  'Reminder: Acting Assignment Ends {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Acting Assignment Ending</h2>
    <p>Dear {employee_name},</p>
    <p>This is a reminder that your <strong>acting assignment</strong> as {item_name} is scheduled to end on <strong>{event_date}</strong>.</p>
    <p>Please coordinate with HR and your manager regarding the transition back to your substantive role or any extension arrangements.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Employee Birthday
(
  '261640be-f21a-4cb7-9e7a-a181aedbe20d',
  'Happy Birthday Greeting',
  'Happy Birthday, {employee_first_name}! 🎂',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #8b5cf6;">🎉 Happy Birthday!</h2>
    <p>Dear {employee_name},</p>
    <p>Wishing you a very <strong>Happy Birthday</strong>! 🎂</p>
    <p>On behalf of everyone at {company_name}, we hope you have a wonderful day celebrating with family and friends.</p>
    <p>Best wishes,<br>{company_name} Team</p>
  </div>',
  true, true, 'workforce'
),
-- Contract Ending
(
  'bc296e3d-bd0e-4ed8-8734-47a2fdcea1f1',
  'Contract Ending Notice',
  'Important: Your Contract Ends {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc2626;">Contract Ending</h2>
    <p>Dear {employee_name},</p>
    <p>This is to notify you that your current employment contract is scheduled to end on <strong>{event_date}</strong>.</p>
    <p>HR will be in touch regarding any renewal discussions or next steps. If you have any questions about your contract status, please contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Contract Extension Review
(
  '26676ff1-4d47-4f06-bb4a-57748396ccbc',
  'Contract Extension Review Due',
  'Action Required: Contract Extension Decision Due {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Contract Extension Review Due</h2>
    <p>Dear {manager_name},</p>
    <p>A contract extension decision is required for <strong>{employee_name}</strong> by <strong>{event_date}</strong>.</p>
    <p>Please review the employee performance and make a recommendation regarding contract extension.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Equipment Return Due
(
  '0c70edd3-3070-4965-8480-20e86688fb7a',
  'Equipment Return Reminder',
  'Reminder: Company Equipment Return Due {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Equipment Return Due</h2>
    <p>Dear {employee_name},</p>
    <p>This is a reminder that all company equipment must be returned by <strong>{event_date}</strong>.</p>
    <p>Please ensure the following items are returned:</p>
    <ul>
      <li>Laptop and charger</li>
      <li>Access badges and keys</li>
      <li>Mobile phone (if company-issued)</li>
      <li>Any other company property</li>
    </ul>
    <p>Please coordinate with IT and HR for equipment return.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Exit Interview Scheduled
(
  'f5466f1c-9a74-457a-8215-213c29182524',
  'Exit Interview Scheduled',
  'Your Exit Interview is Scheduled for {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Exit Interview Scheduled</h2>
    <p>Dear {employee_name},</p>
    <p>Your exit interview has been scheduled for <strong>{event_date}</strong>.</p>
    <p>This is an opportunity to provide valuable feedback about your experience at {company_name}. Your insights will help us improve our workplace.</p>
    <p>If you need to reschedule, please contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Headcount Request Pending
(
  'de5e5808-94ae-4297-9b85-759ada372758',
  'Headcount Request Pending Approval',
  'Action Required: Headcount Request Awaiting Approval',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Headcount Request Pending</h2>
    <p>Dear Approver,</p>
    <p>A headcount request is awaiting your approval.</p>
    <p><strong>Department:</strong> {department}<br>
    <strong>Requested by:</strong> {manager_name}</p>
    <p>Please review and take action on this request in the workforce planning system.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Knowledge Transfer Due
(
  '85163906-1f38-40e0-b5ed-b1c18f4fbe2b',
  'Knowledge Transfer Reminder',
  'Reminder: Complete Knowledge Transfer by {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Knowledge Transfer Due</h2>
    <p>Dear {employee_name},</p>
    <p>This is a reminder to complete your <strong>knowledge transfer</strong> activities by <strong>{event_date}</strong>.</p>
    <p>Please ensure all critical information, processes, and responsibilities are documented and handed over to your successor or team.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Last Working Day
(
  '772d5326-8227-4191-bcd4-492874b7e11a',
  'Last Working Day Notice',
  'Your Last Working Day is {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #6b7280;">Last Working Day</h2>
    <p>Dear {employee_name},</p>
    <p>This is to confirm that your last working day with {company_name} is <strong>{event_date}</strong>.</p>
    <p>Please ensure all offboarding tasks are completed, including:</p>
    <ul>
      <li>Knowledge transfer</li>
      <li>Equipment return</li>
      <li>Exit interview (if scheduled)</li>
      <li>Clearance forms</li>
    </ul>
    <p>We wish you all the best in your future endeavors.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- New Hire Starting
(
  '294d5487-bcbd-477a-9c38-225e89be4783',
  'Welcome to the Team',
  'Welcome to {company_name}, {employee_first_name}!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Welcome to {company_name}!</h2>
    <p>Dear {employee_name},</p>
    <p>We are excited to welcome you to <strong>{company_name}</strong>! Your start date is <strong>{event_date}</strong>.</p>
    <p>Here is what you can expect on your first day:</p>
    <ul>
      <li>Orientation session with HR</li>
      <li>Meet your team and manager</li>
      <li>IT setup and access credentials</li>
      <li>Tour of the facilities</li>
    </ul>
    <p>If you have any questions before your start date, please do not hesitate to reach out.</p>
    <p>Looking forward to working with you!</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Offboarding Task Due
(
  '0fcda858-7568-43e0-b5a8-c61875154a65',
  'Offboarding Task Reminder',
  'Action Required: Offboarding Task Due {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Offboarding Task Due</h2>
    <p>Dear {employee_name},</p>
    <p>You have an offboarding task that needs to be completed by <strong>{event_date}</strong>.</p>
    <p><strong>Task:</strong> {item_name}</p>
    <p>Please complete this task to ensure a smooth transition. Contact HR if you need assistance.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Position Change Effective
(
  '8e7cfe6c-4995-4dd0-97e0-ede13b6ce1bd',
  'Position Change Confirmation',
  'Your Position Change is Effective {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Position Change Effective</h2>
    <p>Dear {employee_name},</p>
    <p>This is to confirm that your position change to <strong>{item_name}</strong> will be effective on <strong>{event_date}</strong>.</p>
    <p>Please review your updated role details in the employee portal. Your manager will provide more information about your new responsibilities.</p>
    <p>Congratulations on your new role!</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Probation Period Ending
(
  'a7239186-7a2b-4fc8-b0c6-1b5f5ca18085',
  'Probation Period Ending',
  'Notice: Your Probation Period Ends {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Probation Period Ending</h2>
    <p>Dear {employee_name},</p>
    <p>Your probationary period is scheduled to end on <strong>{event_date}</strong>.</p>
    <p>Your manager will conduct a probation review to assess your performance. If you have any questions about the review process, please speak with your manager or HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Probation Review Due
(
  '0a03e41b-629e-48ca-b33a-135bfa969265',
  'Probation Review Due',
  'Action Required: Complete Probation Review for {employee_name}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #f59e0b;">Probation Review Due</h2>
    <p>Dear {manager_name},</p>
    <p>A probation review is due for <strong>{employee_name}</strong> by <strong>{event_date}</strong>.</p>
    <p>Please complete the probation assessment in the performance system and make a recommendation for confirmation or extension.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Rehire Returning (CORRECT ID)
(
  '6a7cb320-b209-4692-ae3e-9fda36b461cc',
  'Welcome Back',
  'Welcome Back to {company_name}, {employee_first_name}!',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Welcome Back!</h2>
    <p>Dear {employee_name},</p>
    <p>We are delighted to welcome you back to <strong>{company_name}</strong>! Your return date is <strong>{event_date}</strong>.</p>
    <p>We look forward to having you on the team again. Please contact HR if you have any questions before your start date.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Retirement Date (CORRECT ID)
(
  'cef00c44-5184-4d9a-8eaf-e443d20a3a6b',
  'Retirement Date Notification',
  'Your Retirement Date: {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #8b5cf6;">Retirement Approaching</h2>
    <p>Dear {employee_name},</p>
    <p>This is to acknowledge your upcoming retirement on <strong>{event_date}</strong>.</p>
    <p>Thank you for your years of dedicated service to {company_name}. HR will be in touch to discuss retirement benefits, pension information, and the transition process.</p>
    <p>We wish you a happy and fulfilling retirement!</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Salary Change Effective (CORRECT ID)
(
  'aef80c35-c707-4d24-a91e-1ec35a97b86f',
  'Salary Change Confirmation',
  'Your Salary Change is Effective {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Salary Change Effective</h2>
    <p>Dear {employee_name},</p>
    <p>This is to confirm that your salary change will be effective on <strong>{event_date}</strong>.</p>
    <p>Please review your updated compensation details in the employee portal. If you have any questions, please contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Secondment Ending (CORRECT ID)
(
  '83d7c60e-162d-46e9-bb32-05bbff174d89',
  'Secondment Ending Notice',
  'Your Secondment Ends {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Secondment Ending</h2>
    <p>Dear {employee_name},</p>
    <p>Your secondment assignment is scheduled to end on <strong>{event_date}</strong>.</p>
    <p>Please coordinate with both your current and home managers regarding the transition back to your substantive role.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Separation Effective (CORRECT ID)
(
  '9518e7cf-a17f-425b-a8df-2dbb642b8940',
  'Separation Confirmation',
  'Confirmation: Separation Effective {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #6b7280;">Separation Confirmation</h2>
    <p>Dear {employee_name},</p>
    <p>This is to confirm that your separation from {company_name} will be effective on <strong>{event_date}</strong>.</p>
    <p>Please ensure all offboarding tasks are completed, including equipment return and exit clearance. Final pay and benefits information will be provided by HR.</p>
    <p>We wish you all the best in your future endeavors.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Status Change Effective (CORRECT ID)
(
  'f0cc5269-5bdd-424d-afd5-68a0f8d3a7ec',
  'Employment Status Change',
  'Your Employment Status Change is Effective {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">Employment Status Change</h2>
    <p>Dear {employee_name},</p>
    <p>This is to inform you of a change in your employment status, effective <strong>{event_date}</strong>.</p>
    <p>Please review the details in your employee portal. If you have questions about how this affects your benefits or role, please contact HR.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Transfer Effective (CORRECT ID)
(
  '27dd1f1d-7786-4897-b085-3d1d326b2001',
  'Transfer Confirmation',
  'Your Transfer is Effective {event_date}',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #16a34a;">Transfer Confirmed</h2>
    <p>Dear {employee_name},</p>
    <p>This is to confirm that your transfer to <strong>{item_name}</strong> will be effective on <strong>{event_date}</strong>.</p>
    <p>Please coordinate with your current and new managers for a smooth transition. Your new manager will provide details about your new responsibilities and team.</p>
    <p>Best regards,<br>{company_name} HR Team</p>
  </div>',
  true, true, 'workforce'
),
-- Vacancy Created (CORRECT ID)
(
  '0b4fc324-786d-48f0-8a7c-82e3f662993c',
  'Position Vacancy Created',
  'New Vacancy: {item_name} Position Available',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1e40af;">New Position Vacancy</h2>
    <p>Dear Recruitment Team,</p>
    <p>A new vacancy has been created:</p>
    <p><strong>Position:</strong> {item_name}<br>
    <strong>Department:</strong> {department}</p>
    <p>Please initiate the recruitment process as appropriate.</p>
    <p>Best regards,<br>{company_name} HR System</p>
  </div>',
  true, true, 'workforce'
),
-- Work Anniversary (CORRECT ID)
(
  'c9e108c7-f095-4eec-82c1-2daf7942e19c',
  'Work Anniversary Celebration',
  'Happy Work Anniversary, {employee_first_name}! 🎉',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #8b5cf6;">🎉 Happy Work Anniversary!</h2>
    <p>Dear {employee_name},</p>
    <p>Congratulations on another year at <strong>{company_name}</strong>!</p>
    <p>Your dedication, hard work, and contributions to our team are truly appreciated. Thank you for being an important part of our organization.</p>
    <p>Here is to many more successful years ahead!</p>
    <p>Best regards,<br>{company_name} Team</p>
  </div>',
  true, true, 'workforce'
);