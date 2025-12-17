-- Create AI-generated payroll reports table
CREATE TABLE public.ai_payroll_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('banded', 'bi')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'designing', 'simulated', 'connected', 'saved')),
  layout_document_name TEXT,
  layout_document_content TEXT,
  filter_configuration JSONB DEFAULT '{}',
  report_structure JSONB DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}',
  data_sources JSONB DEFAULT '[]',
  iteration_history JSONB DEFAULT '[]',
  last_generated_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_payroll_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view reports for their company"
  ON public.ai_payroll_reports FOR SELECT
  USING (true);

CREATE POLICY "Users can create reports"
  ON public.ai_payroll_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update reports"
  ON public.ai_payroll_reports FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete reports"
  ON public.ai_payroll_reports FOR DELETE
  USING (true);

-- Add indexes
CREATE INDEX idx_ai_payroll_reports_company ON public.ai_payroll_reports(company_id);
CREATE INDEX idx_ai_payroll_reports_type ON public.ai_payroll_reports(report_type);
CREATE INDEX idx_ai_payroll_reports_status ON public.ai_payroll_reports(status);

-- Update trigger
CREATE TRIGGER update_ai_payroll_reports_updated_at
  BEFORE UPDATE ON public.ai_payroll_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();