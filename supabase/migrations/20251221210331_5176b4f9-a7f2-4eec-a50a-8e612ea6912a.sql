-- Create employee data change requests table for ESS workflow
CREATE TABLE public.employee_data_change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id),
  request_type TEXT NOT NULL, -- 'personal_contact', 'emergency_contact', 'address'
  entity_id UUID, -- ID of the record being changed (null for new records)
  entity_table TEXT NOT NULL, -- 'employee_contacts', 'employee_addresses', 'employee_emergency_contacts'
  change_action TEXT NOT NULL DEFAULT 'update', -- 'create', 'update', 'delete'
  current_values JSONB, -- Current field values before change
  new_values JSONB NOT NULL, -- New field values after change
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled', 'applied'
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  applied_at TIMESTAMPTZ,
  workflow_instance_id UUID REFERENCES public.workflow_instances(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_change_requests_employee ON public.employee_data_change_requests(employee_id);
CREATE INDEX idx_change_requests_status ON public.employee_data_change_requests(status);
CREATE INDEX idx_change_requests_company ON public.employee_data_change_requests(company_id);
CREATE INDEX idx_change_requests_requested_at ON public.employee_data_change_requests(requested_at DESC);

-- Enable RLS
ALTER TABLE public.employee_data_change_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own requests
CREATE POLICY "Employees can view own change requests"
ON public.employee_data_change_requests
FOR SELECT
USING (requested_by = auth.uid() OR employee_id = auth.uid());

-- Policy: Employees can create their own requests
CREATE POLICY "Employees can create own change requests"
ON public.employee_data_change_requests
FOR INSERT
WITH CHECK (requested_by = auth.uid() AND employee_id = auth.uid());

-- Policy: Employees can cancel their own pending requests
CREATE POLICY "Employees can cancel own pending requests"
ON public.employee_data_change_requests
FOR UPDATE
USING (requested_by = auth.uid() AND status = 'pending')
WITH CHECK (status = 'cancelled');

-- Policy: HR/Admin can view all requests in their company
CREATE POLICY "HR can view all company change requests"
ON public.employee_data_change_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'hr_manager', 'hr_specialist')
  )
);

-- Policy: HR/Admin can update requests (approve/reject)
CREATE POLICY "HR can update change requests"
ON public.employee_data_change_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'hr_manager', 'hr_specialist')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_employee_data_change_requests_updated_at
BEFORE UPDATE ON public.employee_data_change_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();