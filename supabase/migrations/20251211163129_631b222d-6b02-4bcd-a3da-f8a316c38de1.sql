-- Create escalation rules table
CREATE TABLE public.escalation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  priority_id UUID REFERENCES public.ticket_priorities(id) ON DELETE CASCADE,
  escalation_level INTEGER NOT NULL DEFAULT 1,
  escalate_after_hours INTEGER NOT NULL DEFAULT 1,
  notify_emails TEXT[] NOT NULL DEFAULT '{}',
  notify_governance_body_id UUID REFERENCES public.governance_bodies(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.escalation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage escalation rules"
ON public.escalation_rules
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active rules"
ON public.escalation_rules
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_escalation_rules_updated_at
BEFORE UPDATE ON public.escalation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default escalation rules
INSERT INTO public.escalation_rules (name, description, priority_id, escalation_level, escalate_after_hours, notify_emails)
SELECT 
  'Critical Priority - Level 1',
  'Escalate critical ticket breaches to managers after 1 hour',
  id,
  1,
  1,
  '{}'
FROM public.ticket_priorities WHERE code = 'critical';

INSERT INTO public.escalation_rules (name, description, priority_id, escalation_level, escalate_after_hours, notify_emails)
SELECT 
  'Critical Priority - Level 2',
  'Escalate critical ticket breaches to senior management after 2 hours',
  id,
  2,
  2,
  '{}'
FROM public.ticket_priorities WHERE code = 'critical';

INSERT INTO public.escalation_rules (name, description, priority_id, escalation_level, escalate_after_hours, notify_emails)
SELECT 
  'High Priority - Level 1',
  'Escalate high priority ticket breaches after 4 hours',
  id,
  1,
  4,
  '{}'
FROM public.ticket_priorities WHERE code = 'high';