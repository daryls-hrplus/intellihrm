-- Create roles table for role definitions and permissions
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  menu_permissions JSONB DEFAULT '[]'::jsonb,
  can_view_pii BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert system roles (matching existing enum values)
INSERT INTO public.roles (name, code, is_system, can_view_pii, menu_permissions) VALUES
('Administrator', 'admin', true, true, '["dashboard", "workforce", "leave", "compensation", "benefits", "training", "succession", "recruitment", "hse", "employee_relations", "property", "admin", "profile"]'::jsonb),
('HR Manager', 'hr_manager', true, true, '["dashboard", "workforce", "leave", "compensation", "benefits", "training", "succession", "recruitment", "hse", "employee_relations", "property", "profile"]'::jsonb),
('Employee', 'employee', true, false, '["dashboard", "profile", "leave", "training", "performance", "benefits"]'::jsonb);

-- Add role_id to user_roles (references the roles table)
ALTER TABLE public.user_roles ADD COLUMN role_id UUID REFERENCES public.roles(id);

-- Populate role_id based on existing role enum values
UPDATE public.user_roles ur
SET role_id = r.id
FROM public.roles r
WHERE ur.role::text = r.code;

-- Make role_id required
ALTER TABLE public.user_roles ALTER COLUMN role_id SET NOT NULL;

-- RLS policies for roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active roles"
ON public.roles FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can insert roles"
ON public.roles FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.roles FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete non-system roles"
ON public.roles FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) AND is_system = false);

-- Create audit function for roles
CREATE OR REPLACE FUNCTION public.audit_roles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE'::audit_action,
      'roles',
      NEW.id::TEXT,
      NEW.name,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'UPDATE'::audit_action,
      'roles',
      NEW.id::TEXT,
      NEW.name,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'DELETE'::audit_action,
      'roles',
      OLD.id::TEXT,
      OLD.name,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('trigger', 'automatic')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Add triggers
CREATE TRIGGER audit_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.audit_roles_changes();

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();