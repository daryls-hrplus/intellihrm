-- Create Report Distribution Log Table for SOC 2 compliance
CREATE TABLE public.feedback_report_distribution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.feedback_360_cycles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.feedback_report_templates(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('employee', 'manager', 'hr', 'executive')),
  distribution_method TEXT NOT NULL CHECK (distribution_method IN ('email', 'in_app', 'download', 'print')),
  distributed_at TIMESTAMPTZ DEFAULT now(),
  distributed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_format TEXT CHECK (report_format IN ('pdf', 'docx', 'html')),
  file_url TEXT,
  acknowledgment_required BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Feedback Generated Reports Table for versioning
CREATE TABLE public.feedback_generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.feedback_360_cycles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.feedback_report_templates(id) ON DELETE SET NULL,
  report_version INTEGER NOT NULL DEFAULT 1,
  generation_status TEXT NOT NULL DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  file_url TEXT,
  file_size_bytes BIGINT,
  generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  data_snapshot JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add acknowledgment fields to feedback_360_cycles
ALTER TABLE public.feedback_360_cycles
ADD COLUMN IF NOT EXISTS report_acknowledgment_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS report_acknowledgment_deadline DATE;

-- Enable RLS
ALTER TABLE public.feedback_report_distribution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_generated_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distribution log
CREATE POLICY "Users can view distribution logs for their company"
ON public.feedback_report_distribution_log
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can insert distribution logs"
ON public.feedback_report_distribution_log
FOR INSERT
TO authenticated
WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for generated reports
CREATE POLICY "Users can view generated reports for their company"
ON public.feedback_generated_reports
FOR SELECT
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR/Admin can manage generated reports"
ON public.feedback_generated_reports
FOR ALL
TO authenticated
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_distribution_log_cycle ON public.feedback_report_distribution_log(cycle_id);
CREATE INDEX idx_distribution_log_recipient ON public.feedback_report_distribution_log(recipient_id);
CREATE INDEX idx_generated_reports_cycle ON public.feedback_generated_reports(cycle_id);
CREATE INDEX idx_generated_reports_participant ON public.feedback_generated_reports(participant_id);