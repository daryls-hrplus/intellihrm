-- Consolidate duplicate categories

-- Deactivate "HR General" (keep "HR Inquiry" as the main one, rename it)
UPDATE public.ticket_categories 
SET is_active = false 
WHERE code = 'hr-general';

-- Rename "HR Inquiry" to "General HR Inquiry" for clarity
UPDATE public.ticket_categories 
SET name = 'General HR Inquiry', 
    description = 'General HR questions, policy inquiries, and process guidance',
    display_order = 1,
    icon = 'HelpCircle'
WHERE code = 'hr';

-- Deactivate "Feature Request" (keep "Feedback & Suggestions")
UPDATE public.ticket_categories 
SET is_active = false 
WHERE code = 'feature';

-- Update "Feedback & Suggestions" description
UPDATE public.ticket_categories 
SET description = 'Submit feedback, suggestions for improvements, or feature requests',
    display_order = 20
WHERE code = 'feedback';

-- Update descriptions for all categories
UPDATE public.ticket_categories SET description = 'Login issues, system access requests, and permission changes' WHERE code = 'access';
UPDATE public.ticket_categories SET description = 'System errors, bugs, and technical issues with HR applications' WHERE code = 'technical';
UPDATE public.ticket_categories SET description = 'General questions about using HR systems and tools' WHERE code = 'general';
UPDATE public.ticket_categories SET description = 'Salary inquiries, payslip questions, deductions, and payment issues' WHERE code = 'payroll';
UPDATE public.ticket_categories SET description = 'Health insurance, retirement plans, and employee benefits questions' WHERE code = 'benefits';
UPDATE public.ticket_categories SET description = 'Leave requests, balances, vacation planning, and time-off policies' WHERE code = 'leave';
UPDATE public.ticket_categories SET description = 'Training programs, courses, certifications, and professional development' WHERE code = 'training';
UPDATE public.ticket_categories SET description = 'New hire orientation, first-day questions, and onboarding documentation' WHERE code = 'onboarding';
UPDATE public.ticket_categories SET description = 'Exit process, final pay, asset return, and clearance procedures' WHERE code = 'offboarding';
UPDATE public.ticket_categories SET description = 'Update personal information, bank details, address, or emergency contacts' WHERE code = 'records';
UPDATE public.ticket_categories SET description = 'Disability accommodations, religious accommodations, and ergonomic requests' WHERE code = 'accommodations';
UPDATE public.ticket_categories SET description = 'IT equipment, uniforms, ID cards, and company asset requests' WHERE code = 'equipment';
UPDATE public.ticket_categories SET description = 'Recognition program questions, reward redemption, and appreciation inquiries' WHERE code = 'recognition';
UPDATE public.ticket_categories SET description = 'Career path guidance, promotions, internal transfers, and growth opportunities' WHERE code = 'career';
UPDATE public.ticket_categories SET description = 'Workplace conflicts, mediation requests, and interpersonal issues' WHERE code = 'employee-relations';

-- HR-only category descriptions
UPDATE public.ticket_categories SET description = 'Bulk notifications and announcements to multiple employees' WHERE code = 'mass-comm';
UPDATE public.ticket_categories SET description = 'Internal compliance tracking and regulatory follow-ups' WHERE code = 'compliance-fu';
UPDATE public.ticket_categories SET description = 'Employee relations investigations and case management' WHERE code = 'investigation';
UPDATE public.ticket_categories SET description = 'Internal HR team coordination and operations' WHERE code = 'hr-internal';
UPDATE public.ticket_categories SET description = 'Documentation requests, audit support, and record keeping' WHERE code = 'audit-docs';
UPDATE public.ticket_categories SET description = 'Termination processing, documentation, and offboarding coordination' WHERE code = 'termination';

-- Fix display order for consistency
UPDATE public.ticket_categories SET display_order = 1 WHERE code = 'hr';
UPDATE public.ticket_categories SET display_order = 2 WHERE code = 'general';
UPDATE public.ticket_categories SET display_order = 3 WHERE code = 'payroll';
UPDATE public.ticket_categories SET display_order = 4 WHERE code = 'benefits';
UPDATE public.ticket_categories SET display_order = 5 WHERE code = 'leave';
UPDATE public.ticket_categories SET display_order = 6 WHERE code = 'onboarding';
UPDATE public.ticket_categories SET display_order = 7 WHERE code = 'offboarding';
UPDATE public.ticket_categories SET display_order = 8 WHERE code = 'records';
UPDATE public.ticket_categories SET display_order = 9 WHERE code = 'training';
UPDATE public.ticket_categories SET display_order = 10 WHERE code = 'career';
UPDATE public.ticket_categories SET display_order = 11 WHERE code = 'access';
UPDATE public.ticket_categories SET display_order = 12 WHERE code = 'technical';
UPDATE public.ticket_categories SET display_order = 13 WHERE code = 'accommodations';
UPDATE public.ticket_categories SET display_order = 14 WHERE code = 'equipment';
UPDATE public.ticket_categories SET display_order = 15 WHERE code = 'recognition';
UPDATE public.ticket_categories SET display_order = 16 WHERE code = 'employee-relations';
UPDATE public.ticket_categories SET display_order = 20 WHERE code = 'feedback';