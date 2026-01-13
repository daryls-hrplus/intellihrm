-- Fix the RPC function parameter order
CREATE OR REPLACE FUNCTION public.get_user_accessible_companies()
RETURNS TABLE (id uuid, name text) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name::text
  FROM companies c
  WHERE public.user_has_company_access(auth.uid(), c.id)
  ORDER BY c.name;
END;
$$;