-- Fix auth trigger to populate user_roles.role_id (prevents "Database error creating new user")
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count integer;
  v_role_code text;
  v_role_id uuid;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  -- Check if this is the first user (after inserting profile)
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  -- First user becomes admin, others become employees
  IF user_count = 1 THEN
    v_role_code := 'admin';
  ELSE
    v_role_code := 'employee';
  END IF;

  SELECT r.id
  INTO v_role_id
  FROM public.roles r
  WHERE r.code = v_role_code
  LIMIT 1;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role code % not found in roles table', v_role_code;
  END IF;

  INSERT INTO public.user_roles (user_id, role, role_id)
  VALUES (NEW.id, v_role_code::public.app_role, v_role_id);

  RETURN NEW;
END;
$$;