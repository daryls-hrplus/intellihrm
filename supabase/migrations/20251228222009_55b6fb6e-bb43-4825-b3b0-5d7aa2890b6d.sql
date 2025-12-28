-- Create resumption_of_duty table
CREATE TABLE public.resumption_of_duty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  
  -- Dates
  leave_end_date DATE NOT NULL,
  actual_resumption_date DATE,
  form_created_at TIMESTAMPTZ DEFAULT now(),
  form_submitted_at TIMESTAMPTZ,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending_employee' CHECK (
    status IN ('pending_employee', 'pending_manager', 'verified', 'rejected', 'overdue', 'no_show')
  ),
  
  -- Employee inputs
  employee_notes TEXT,
  fit_to_work BOOLEAN DEFAULT true,
  
  -- Medical clearance (for sick/medical leave)
  requires_medical_clearance BOOLEAN DEFAULT false,
  medical_clearance_file_path TEXT,
  medical_clearance_uploaded_at TIMESTAMPTZ,
  medical_clearance_notes TEXT,
  
  -- Manager verification
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  -- Rejection handling
  rejection_reason TEXT,
  rejected_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_resumption_of_duty_employee_id ON public.resumption_of_duty(employee_id);
CREATE INDEX idx_resumption_of_duty_company_id ON public.resumption_of_duty(company_id);
CREATE INDEX idx_resumption_of_duty_leave_request_id ON public.resumption_of_duty(leave_request_id);
CREATE INDEX idx_resumption_of_duty_status ON public.resumption_of_duty(status);
CREATE INDEX idx_resumption_of_duty_leave_end_date ON public.resumption_of_duty(leave_end_date);

-- Enable RLS
ALTER TABLE public.resumption_of_duty ENABLE ROW LEVEL SECURITY;

-- Employees can view and update their own RODs
CREATE POLICY "Employees can view own RODs" ON public.resumption_of_duty
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Employees can update own RODs" ON public.resumption_of_duty
  FOR UPDATE USING (auth.uid() = employee_id);

-- Managers can view and update their direct reports' RODs (via get_employee_supervisor function)
CREATE POLICY "Managers can view team RODs" ON public.resumption_of_duty
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM get_employee_supervisor(employee_id, NULL) es
      WHERE es.supervisor_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update team RODs" ON public.resumption_of_duty
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM get_employee_supervisor(employee_id, NULL) es
      WHERE es.supervisor_id = auth.uid()
    )
  );

-- HR and Admin can view all company RODs
CREATE POLICY "HR can view all company RODs" ON public.resumption_of_duty
  FOR SELECT USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  );

CREATE POLICY "HR can update all company RODs" ON public.resumption_of_duty
  FOR UPDATE USING (
    public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_admin'])
  );

-- Service role can insert (for edge function)
CREATE POLICY "Service role can insert RODs" ON public.resumption_of_duty
  FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_resumption_of_duty_updated_at
  BEFORE UPDATE ON public.resumption_of_duty
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();