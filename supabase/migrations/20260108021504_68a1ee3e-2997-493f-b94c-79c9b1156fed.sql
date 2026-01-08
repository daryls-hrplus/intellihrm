-- Add archived status support and create audit trail

-- Create canned_responses table for quick reply templates
CREATE TABLE public.canned_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES public.ticket_categories(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on canned_responses
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for canned_responses
CREATE POLICY "Authenticated users can view canned responses"
ON public.canned_responses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR users can manage canned responses"
ON public.canned_responses FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at on canned_responses
CREATE TRIGGER update_canned_responses_updated_at
BEFORE UPDATE ON public.canned_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create ticket_audit_log table for tracking changes
CREATE TABLE public.ticket_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL, -- status_change, priority_change, assignee_change, category_change, archived
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on ticket_audit_log
ALTER TABLE public.ticket_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ticket_audit_log
CREATE POLICY "Authenticated users can view ticket audit logs"
ON public.ticket_audit_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System can insert audit logs"
ON public.ticket_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for faster audit log queries
CREATE INDEX idx_ticket_audit_log_ticket_id ON public.ticket_audit_log(ticket_id);
CREATE INDEX idx_ticket_audit_log_created_at ON public.ticket_audit_log(created_at DESC);

-- Insert some default canned responses
INSERT INTO public.canned_responses (title, content, is_active) VALUES
('Acknowledgment', 'Thank you for reaching out. We have received your request and will review it shortly. A member of our team will get back to you within 24 hours.', true),
('Request More Info', 'Thank you for contacting us. To better assist you, could you please provide more details about your issue? Specifically, we need: [specific details needed]', true),
('Issue Resolved', 'We''re happy to inform you that your issue has been resolved. If you have any further questions or concerns, please don''t hesitate to reach out. Thank you for your patience.', true),
('Escalation Notice', 'Your request has been escalated to our senior team for further review. You can expect an update within [timeframe]. We appreciate your patience.', true),
('Password Reset Instructions', 'To reset your password, please follow these steps:\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your email for the reset link\n5. Follow the link to create a new password', true);