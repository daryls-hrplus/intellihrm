-- Add authorized_headcount to positions table for position control
ALTER TABLE public.positions 
ADD COLUMN authorized_headcount INTEGER NOT NULL DEFAULT 1,
ADD COLUMN headcount_notes TEXT;

-- Create governance_bodies table (boards, management teams, committees)
CREATE TABLE public.governance_bodies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  body_type TEXT NOT NULL DEFAULT 'board', -- 'board', 'management', 'committee'
  description TEXT,
  can_approve_headcount BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create governance_members table
CREATE TABLE public.governance_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  governance_body_id UUID NOT NULL REFERENCES public.governance_bodies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_in_body TEXT NOT NULL DEFAULT 'member', -- 'chair', 'vice_chair', 'secretary', 'member'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_active_governance_member UNIQUE (governance_body_id, employee_id, is_active)
);

-- Create headcount_requests table for approval workflow
CREATE TABLE public.headcount_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  current_headcount INTEGER NOT NULL,
  requested_headcount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  governance_body_id UUID REFERENCES public.governance_bodies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.governance_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governance_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.headcount_requests ENABLE ROW LEVEL SECURITY;

-- Governance bodies RLS policies
CREATE POLICY "Authenticated users can view governance bodies"
ON public.governance_bodies FOR SELECT USING (true);

CREATE POLICY "Admins can insert governance bodies"
ON public.governance_bodies FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update governance bodies"
ON public.governance_bodies FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete governance bodies"
ON public.governance_bodies FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Governance members RLS policies
CREATE POLICY "Authenticated users can view governance members"
ON public.governance_members FOR SELECT USING (true);

CREATE POLICY "Admins can insert governance members"
ON public.governance_members FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update governance members"
ON public.governance_members FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete governance members"
ON public.governance_members FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Headcount requests RLS policies
CREATE POLICY "Authenticated users can view headcount requests"
ON public.headcount_requests FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create headcount requests"
ON public.headcount_requests FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update headcount requests"
ON public.headcount_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete headcount requests"
ON public.headcount_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_governance_bodies_updated_at
BEFORE UPDATE ON public.governance_bodies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_governance_members_updated_at
BEFORE UPDATE ON public.governance_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_headcount_requests_updated_at
BEFORE UPDATE ON public.headcount_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get position vacancy summary
CREATE OR REPLACE FUNCTION public.get_position_vacancy_summary(p_company_id UUID)
RETURNS TABLE(
  position_id UUID,
  position_title TEXT,
  department_name TEXT,
  authorized_headcount INTEGER,
  filled_count BIGINT,
  vacancy_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as position_id,
    p.title as position_title,
    d.name as department_name,
    p.authorized_headcount,
    COUNT(ep.id) FILTER (WHERE ep.is_active = true) as filled_count,
    (p.authorized_headcount - COUNT(ep.id) FILTER (WHERE ep.is_active = true)) as vacancy_count
  FROM positions p
  JOIN departments d ON p.department_id = d.id
  LEFT JOIN employee_positions ep ON ep.position_id = p.id
  WHERE d.company_id = p_company_id AND p.is_active = true
  GROUP BY p.id, p.title, d.name, p.authorized_headcount
  ORDER BY vacancy_count DESC, p.title;
END;
$$;