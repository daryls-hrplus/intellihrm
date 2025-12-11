-- Create table for scheduled org reports
CREATE TABLE public.scheduled_org_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  schedule_type TEXT NOT NULL DEFAULT 'weekly' CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 28),
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  recipient_emails TEXT[] NOT NULL DEFAULT '{}',
  company_id UUID REFERENCES public.companies(id),
  department_id UUID REFERENCES public.departments(id),
  include_positions BOOLEAN NOT NULL DEFAULT true,
  include_employees BOOLEAN NOT NULL DEFAULT true,
  include_changes BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_org_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage scheduled reports"
ON public.scheduled_org_reports
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own scheduled reports"
ON public.scheduled_org_reports
FOR SELECT
USING (auth.uid() = created_by);

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_org_reports_updated_at
BEFORE UPDATE ON public.scheduled_org_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();