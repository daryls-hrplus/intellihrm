-- CBA Extension Requests table for tracking module extension needs
CREATE TABLE public.cba_extension_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  agreement_id UUID REFERENCES public.cba_agreements(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('rule_type', 'day_type', 'condition', 'formula', 'other')),
  suggested_value TEXT NOT NULL,
  original_document_excerpt TEXT,
  ai_analysis TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_development', 'implemented', 'rejected')),
  impact_description TEXT,
  workaround_applied TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  implementation_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add approximation tracking to cba_time_rules
ALTER TABLE public.cba_time_rules
  ADD COLUMN IF NOT EXISTS approximation_warning TEXT,
  ADD COLUMN IF NOT EXISTS original_extraction JSONB,
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(3,2);

-- CBA Unsupported Rules log for tracking what couldn't be imported
CREATE TABLE public.cba_unsupported_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  agreement_id UUID REFERENCES public.cba_agreements(id) ON DELETE SET NULL,
  original_text TEXT NOT NULL,
  suggested_type TEXT,
  reason TEXT NOT NULL,
  workaround TEXT,
  data_loss_warning TEXT,
  extension_request_id UUID REFERENCES public.cba_extension_requests(id) ON DELETE SET NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cba_extension_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_unsupported_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies for cba_extension_requests
CREATE POLICY "Users can view extension requests for their company"
  ON public.cba_extension_requests FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create extension requests for their company"
  ON public.cba_extension_requests FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update extension requests for their company"
  ON public.cba_extension_requests FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- RLS policies for cba_unsupported_rules
CREATE POLICY "Users can view unsupported rules for their company"
  ON public.cba_unsupported_rules FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can create unsupported rules for their company"
  ON public.cba_unsupported_rules FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update unsupported rules for their company"
  ON public.cba_unsupported_rules FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_cba_extension_requests_company ON public.cba_extension_requests(company_id);
CREATE INDEX idx_cba_extension_requests_status ON public.cba_extension_requests(status);
CREATE INDEX idx_cba_extension_requests_agreement ON public.cba_extension_requests(agreement_id);
CREATE INDEX idx_cba_unsupported_rules_company ON public.cba_unsupported_rules(company_id);
CREATE INDEX idx_cba_unsupported_rules_agreement ON public.cba_unsupported_rules(agreement_id);

-- Updated at trigger
CREATE TRIGGER update_cba_extension_requests_updated_at
  BEFORE UPDATE ON public.cba_extension_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();