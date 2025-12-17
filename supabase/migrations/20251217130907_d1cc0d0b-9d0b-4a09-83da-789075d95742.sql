-- Create a generic table for AI reports across all modules
CREATE TABLE IF NOT EXISTS public.ai_module_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  module_name TEXT NOT NULL,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('banded', 'bi')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'designing', 'simulated', 'connected', 'saved')),
  layout_document_name TEXT,
  layout_document_content TEXT,
  filter_configuration JSONB DEFAULT '{}',
  report_structure JSONB DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}',
  iteration_history JSONB DEFAULT '[]',
  data_sources JSONB DEFAULT '[]',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_module_reports_company_module ON public.ai_module_reports(company_id, module_name);
CREATE INDEX IF NOT EXISTS idx_ai_module_reports_module_type ON public.ai_module_reports(module_name, report_type);

-- Enable RLS
ALTER TABLE public.ai_module_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their company reports"
  ON public.ai_module_reports
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reports"
  ON public.ai_module_reports
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their reports"
  ON public.ai_module_reports
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their reports"
  ON public.ai_module_reports
  FOR DELETE
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_ai_module_reports_updated_at
  BEFORE UPDATE ON public.ai_module_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();