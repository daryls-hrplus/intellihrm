-- Role access to divisions
CREATE TABLE public.role_division_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, division_id)
);

-- Role access to departments
CREATE TABLE public.role_department_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, department_id)
);

-- Role access to sections
CREATE TABLE public.role_section_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role_id, section_id)
);

-- Enable RLS
ALTER TABLE public.role_division_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_department_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_section_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_division_access
CREATE POLICY "Admins can manage role division access"
  ON public.role_division_access
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for role_department_access
CREATE POLICY "Admins can manage role department access"
  ON public.role_department_access
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for role_section_access
CREATE POLICY "Admins can manage role section access"
  ON public.role_section_access
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create helper function to check organization access
CREATE OR REPLACE FUNCTION public.user_has_org_access(
  p_user_id UUID,
  p_company_id UUID DEFAULT NULL,
  p_division_id UUID DEFAULT NULL,
  p_department_id UUID DEFAULT NULL,
  p_section_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_ids UUID[];
  v_has_restriction BOOLEAN := FALSE;
BEGIN
  -- Get user's roles
  SELECT ARRAY_AGG(ur.role_id) INTO v_role_ids
  FROM user_roles ur
  WHERE ur.user_id = p_user_id;
  
  IF v_role_ids IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check company access (empty = all access)
  IF p_company_id IS NOT NULL THEN
    -- Check if any role has company restrictions
    IF EXISTS (SELECT 1 FROM role_company_access WHERE role_id = ANY(v_role_ids)) THEN
      -- Has restrictions, check if this company is allowed
      IF NOT EXISTS (
        SELECT 1 FROM role_company_access 
        WHERE role_id = ANY(v_role_ids) AND company_id = p_company_id
      ) THEN
        -- Also check tag-based access
        IF NOT EXISTS (
          SELECT 1 FROM role_tag_access rta
          JOIN company_tag_assignments cta ON cta.tag_id = rta.tag_id
          WHERE rta.role_id = ANY(v_role_ids) AND cta.company_id = p_company_id
        ) THEN
          RETURN FALSE;
        END IF;
      END IF;
    END IF;
    -- No restrictions = all access
  END IF;
  
  -- Check division access (empty = all access)
  IF p_division_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM role_division_access WHERE role_id = ANY(v_role_ids)) THEN
      IF NOT EXISTS (
        SELECT 1 FROM role_division_access 
        WHERE role_id = ANY(v_role_ids) AND division_id = p_division_id
      ) THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  -- Check department access (empty = all access)
  IF p_department_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM role_department_access WHERE role_id = ANY(v_role_ids)) THEN
      IF NOT EXISTS (
        SELECT 1 FROM role_department_access 
        WHERE role_id = ANY(v_role_ids) AND department_id = p_department_id
      ) THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  -- Check section access (empty = all access)
  IF p_section_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM role_section_access WHERE role_id = ANY(v_role_ids)) THEN
      IF NOT EXISTS (
        SELECT 1 FROM role_section_access 
        WHERE role_id = ANY(v_role_ids) AND section_id = p_section_id
      ) THEN
        RETURN FALSE;
      END IF;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$;