-- Add release tracking columns to appraisal_participants
ALTER TABLE public.appraisal_participants 
ADD COLUMN IF NOT EXISTS released_at timestamptz,
ADD COLUMN IF NOT EXISTS released_by uuid REFERENCES auth.users(id);

-- Add release tracking to appraisal_cycles (for bulk release)
ALTER TABLE public.appraisal_cycles 
ADD COLUMN IF NOT EXISTS ratings_released_at timestamptz,
ADD COLUMN IF NOT EXISTS ratings_released_by uuid REFERENCES auth.users(id);

-- Create index for efficient filtering by released status
CREATE INDEX IF NOT EXISTS idx_appraisal_participants_released_at 
ON public.appraisal_participants(released_at) WHERE released_at IS NOT NULL;

-- Insert email template for rating release notifications
INSERT INTO public.reminder_email_templates (category, name, subject, body, is_active)
VALUES (
  'performance_appraisals',
  'Rating Release',
  'Your Performance Review Results for {{cycle_name}} Are Now Available',
  'Dear {{employee_first_name}},

Your performance review results for the "{{cycle_name}}" cycle are now available.

Please log in to view your results and provide your acknowledgment.

If you have any questions about your review, please reach out to your manager or HR team.

Best regards,
{{company_name}} HR Team',
  true
)
ON CONFLICT DO NOTHING;