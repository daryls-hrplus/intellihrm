-- Create enum for action types
CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT');

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs(entity_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Only authenticated users can insert audit logs (for their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Audit logs cannot be updated or deleted (immutable)
-- No UPDATE or DELETE policies

-- Create a function to log audit events (can be called from triggers or directly)
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action audit_action,
  p_entity_type TEXT,
  p_entity_id TEXT DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    entity_name,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_old_values,
    p_new_values,
    p_metadata
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Create automatic audit triggers for key tables

-- Trigger function for profiles
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE'::audit_action,
      'profiles',
      NEW.id::TEXT,
      NEW.full_name,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'UPDATE'::audit_action,
      'profiles',
      NEW.id::TEXT,
      NEW.full_name,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic')
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'DELETE'::audit_action,
      'profiles',
      OLD.id::TEXT,
      OLD.full_name,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('trigger', 'automatic')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_profiles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_profiles_changes();

-- Trigger function for companies
CREATE OR REPLACE FUNCTION public.audit_companies_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE'::audit_action,
      'companies',
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
      'companies',
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
      'companies',
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

CREATE TRIGGER audit_companies_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.audit_companies_changes();

-- Trigger function for company_groups
CREATE OR REPLACE FUNCTION public.audit_company_groups_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE'::audit_action,
      'company_groups',
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
      'company_groups',
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
      'company_groups',
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

CREATE TRIGGER audit_company_groups_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.company_groups
FOR EACH ROW EXECUTE FUNCTION public.audit_company_groups_changes();

-- Trigger function for divisions
CREATE OR REPLACE FUNCTION public.audit_divisions_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE'::audit_action,
      'divisions',
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
      'divisions',
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
      'divisions',
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

CREATE TRIGGER audit_divisions_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.divisions
FOR EACH ROW EXECUTE FUNCTION public.audit_divisions_changes();

-- Trigger function for user_roles
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_audit_event(
      'CREATE'::audit_action,
      'user_roles',
      NEW.id::TEXT,
      NEW.role::TEXT,
      NULL,
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic', 'target_user_id', NEW.user_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_audit_event(
      'UPDATE'::audit_action,
      'user_roles',
      NEW.id::TEXT,
      NEW.role::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic', 'target_user_id', NEW.user_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_audit_event(
      'DELETE'::audit_action,
      'user_roles',
      OLD.id::TEXT,
      OLD.role::TEXT,
      to_jsonb(OLD),
      NULL,
      jsonb_build_object('trigger', 'automatic', 'target_user_id', OLD.user_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_user_roles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.audit_user_roles_changes();