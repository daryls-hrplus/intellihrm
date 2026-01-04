-- Add email_template_id column to reminder_rules table to link rules with email templates
ALTER TABLE public.reminder_rules 
ADD COLUMN email_template_id UUID REFERENCES public.reminder_email_templates(id);

-- Add index for better query performance
CREATE INDEX idx_reminder_rules_email_template ON public.reminder_rules(email_template_id);

-- Add comment for documentation
COMMENT ON COLUMN public.reminder_rules.email_template_id IS 'Links to email template library. message_template is used for in-app notifications, email_template_id for email content.';