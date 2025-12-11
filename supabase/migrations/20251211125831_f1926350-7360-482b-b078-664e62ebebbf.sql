-- Create digital signatures table for headcount requests
CREATE TABLE public.headcount_request_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  headcount_request_id UUID NOT NULL REFERENCES public.headcount_requests(id) ON DELETE CASCADE,
  signer_id UUID NOT NULL REFERENCES public.profiles(id),
  governance_body_id UUID REFERENCES public.governance_bodies(id),
  signature_type TEXT NOT NULL DEFAULT 'approval', -- 'approval', 'rejection', 'acknowledgment'
  signature_hash TEXT NOT NULL, -- SHA-256 hash of signer_id + timestamp + request_id
  ip_address TEXT,
  user_agent TEXT,
  notes TEXT,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_headcount_request_signatures_request ON public.headcount_request_signatures(headcount_request_id);

-- Enable RLS
ALTER TABLE public.headcount_request_signatures ENABLE ROW LEVEL SECURITY;

-- RLS policies for signatures
CREATE POLICY "Authenticated users can view signatures"
ON public.headcount_request_signatures FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create signatures"
ON public.headcount_request_signatures FOR INSERT
WITH CHECK (auth.uid() = signer_id);

-- Signatures should not be updated or deleted (immutable audit trail)
-- No UPDATE or DELETE policies

-- Function to check if user is a governance body member with approval authority
CREATE OR REPLACE FUNCTION public.can_approve_headcount_request(p_user_id UUID, p_request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request_company_id UUID;
BEGIN
  -- Get the company ID of the position in the request
  SELECT d.company_id INTO v_request_company_id
  FROM headcount_requests hr
  JOIN positions p ON hr.position_id = p.id
  JOIN departments d ON p.department_id = d.id
  WHERE hr.id = p_request_id;

  -- Check if user is member of a governance body that can approve headcount
  RETURN EXISTS (
    SELECT 1
    FROM governance_members gm
    JOIN governance_bodies gb ON gm.governance_body_id = gb.id
    WHERE gm.employee_id = p_user_id
      AND gm.is_active = true
      AND gb.is_active = true
      AND gb.can_approve_headcount = true
      AND gb.company_id = v_request_company_id
  );
END;
$$;

-- Update headcount_requests policy to allow governance members to update
DROP POLICY IF EXISTS "Admins can update headcount requests" ON public.headcount_requests;

CREATE POLICY "Authorized users can update headcount requests"
ON public.headcount_requests FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR can_approve_headcount_request(auth.uid(), id)
);