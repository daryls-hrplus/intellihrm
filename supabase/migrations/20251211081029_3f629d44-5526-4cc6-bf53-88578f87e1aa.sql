-- Create system_settings table for storing configuration like API keys
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage settings
CREATE POLICY "Admins can view settings"
ON public.system_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
ON public.system_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.system_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete settings"
ON public.system_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create pii_access_alerts table for tracking suspicious access
CREATE TABLE public.pii_access_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  access_count INTEGER NOT NULL DEFAULT 1,
  alert_type TEXT NOT NULL,
  alert_reason TEXT,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pii_access_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view alerts
CREATE POLICY "Admins can view pii alerts"
ON public.pii_access_alerts
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert alerts"
ON public.pii_access_alerts
FOR INSERT
WITH CHECK (true);

-- Insert default settings
INSERT INTO public.system_settings (key, value, description, is_sensitive)
VALUES 
  ('resend_api_key', NULL, 'Resend API key for sending email alerts', true),
  ('pii_alert_threshold', '5', 'Number of PII access attempts before triggering an alert', false),
  ('pii_alert_window_hours', '1', 'Time window (hours) for counting PII access attempts', false);