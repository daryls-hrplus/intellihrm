-- Create position_types table for categorizing positions
CREATE TABLE public.position_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Add position_type_id to positions table
ALTER TABLE public.positions 
ADD COLUMN position_type_id UUID REFERENCES public.position_types(id);

-- Create role_position_type_exclusions table (roles EXCLUDE access to these position types)
CREATE TABLE public.role_position_type_exclusions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  position_type_id UUID NOT NULL REFERENCES public.position_types(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(role_id, position_type_id)
);

-- Enable RLS
ALTER TABLE public.position_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_position_type_exclusions ENABLE ROW LEVEL SECURITY;

-- RLS policies for position_types
CREATE POLICY "Admins can manage position types"
  ON public.position_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Users can view position types"
  ON public.position_types FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS policies for role_position_type_exclusions
CREATE POLICY "Admins can manage position type exclusions"
  ON public.role_position_type_exclusions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "Users can view position type exclusions"
  ON public.role_position_type_exclusions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_position_types_updated_at
  BEFORE UPDATE ON public.position_types
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check if user has access to a position type
CREATE OR REPLACE FUNCTION public.user_has_position_type_access(
  p_user_id UUID,
  p_position_type_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role_ids UUID[];
  v_excluded BOOLEAN;
BEGIN
  -- Get user's role IDs
  SELECT ARRAY_AGG(role_id) INTO v_role_ids
  FROM user_roles
  WHERE user_id = p_user_id AND role_id IS NOT NULL;
  
  -- If no roles, deny access
  IF v_role_ids IS NULL OR array_length(v_role_ids, 1) = 0 THEN
    RETURN false;
  END IF;
  
  -- Check if ANY of user's roles excludes this position type
  -- If excluded by any role, deny access (most restrictive)
  SELECT EXISTS (
    SELECT 1 FROM role_position_type_exclusions
    WHERE role_id = ANY(v_role_ids)
    AND position_type_id = p_position_type_id
  ) INTO v_excluded;
  
  -- Default ON - return true unless excluded
  RETURN NOT v_excluded;
END;
$$;