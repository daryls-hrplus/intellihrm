-- Create role_pay_group_access table for restricting role access to specific pay groups
CREATE TABLE public.role_pay_group_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    pay_group_id UUID NOT NULL REFERENCES public.pay_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(role_id, pay_group_id)
);

-- Enable RLS
ALTER TABLE public.role_pay_group_access ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage role pay group access"
ON public.role_pay_group_access
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own role pay group access"
ON public.role_pay_group_access
FOR SELECT
TO authenticated
USING (
    role_id IN (
        SELECT role_id FROM public.user_roles WHERE user_id = auth.uid()
    )
);

-- Add index for performance
CREATE INDEX idx_role_pay_group_access_role_id ON public.role_pay_group_access(role_id);
CREATE INDEX idx_role_pay_group_access_pay_group_id ON public.role_pay_group_access(pay_group_id);