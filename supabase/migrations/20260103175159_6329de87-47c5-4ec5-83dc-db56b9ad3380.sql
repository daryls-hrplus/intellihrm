-- Create feedback investigation requests table
CREATE TABLE public.feedback_investigation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES public.review_cycles(id) ON DELETE CASCADE,
  target_employee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL,
  request_reason TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('harassment', 'discrimination', 'misconduct', 'policy_violation', 'legal_hold', 'other')),
  legal_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  denial_reason TEXT,
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE
);

-- Create feedback investigation access log table
CREATE TABLE public.feedback_investigation_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investigation_request_id UUID REFERENCES public.feedback_investigation_requests(id) ON DELETE CASCADE NOT NULL,
  accessed_by UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'export', 'print')),
  responses_viewed JSONB DEFAULT '[]'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_investigation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_investigation_access_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for investigation requests
CREATE POLICY "Users can view investigation requests for their company"
  ON public.feedback_investigation_requests
  FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_director'])
  );

CREATE POLICY "HR can create investigation requests"
  ON public.feedback_investigation_requests
  FOR INSERT
  WITH CHECK (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_director'])
    AND requested_by = auth.uid()
  );

CREATE POLICY "HR directors can update investigation requests"
  ON public.feedback_investigation_requests
  FOR UPDATE
  USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_director'])
  );

-- RLS policies for access log
CREATE POLICY "HR can view access logs for their company"
  ON public.feedback_investigation_access_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feedback_investigation_requests fir
      WHERE fir.id = investigation_request_id
      AND fir.company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    )
    AND public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_director'])
  );

CREATE POLICY "System can insert access logs"
  ON public.feedback_investigation_access_log
  FOR INSERT
  WITH CHECK (
    accessed_by = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX idx_investigation_requests_cycle ON public.feedback_investigation_requests(cycle_id);
CREATE INDEX idx_investigation_requests_status ON public.feedback_investigation_requests(status);
CREATE INDEX idx_investigation_requests_company ON public.feedback_investigation_requests(company_id);
CREATE INDEX idx_investigation_requests_target ON public.feedback_investigation_requests(target_employee_id);
CREATE INDEX idx_investigation_access_log_request ON public.feedback_investigation_access_log(investigation_request_id);

-- Add trigger for updated_at
CREATE TRIGGER update_feedback_investigation_requests_updated_at
  BEFORE UPDATE ON public.feedback_investigation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.feedback_investigation_requests IS 'Tracks formal requests to access individual 360 feedback responses for investigation purposes';
COMMENT ON TABLE public.feedback_investigation_access_log IS 'Audit log of all access to individual 360 feedback responses during investigations';