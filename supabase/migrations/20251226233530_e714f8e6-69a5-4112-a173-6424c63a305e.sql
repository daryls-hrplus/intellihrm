-- Add _en shadow columns to leave/time related tables and remaining key tables

-- leave_requests
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS notes_en TEXT,
ADD COLUMN IF NOT EXISTS approval_notes_en TEXT;

-- leave_accrual_rules
ALTER TABLE public.leave_accrual_rules 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- attendance_policies
ALTER TABLE public.attendance_policies 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- work_schedules
ALTER TABLE public.work_schedules 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- departments (add name_en since we only had description_en)
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Create trigger functions

-- leave_requests trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_leave_requests_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notes IS DISTINCT FROM OLD.notes THEN
    PERFORM queue_translation('leave_requests', NEW.id, 'notes', NEW.notes);
  END IF;
  IF NEW.approval_notes IS DISTINCT FROM OLD.approval_notes THEN
    PERFORM queue_translation('leave_requests', NEW.id, 'approval_notes', NEW.approval_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_leave_requests_translation ON public.leave_requests;
CREATE TRIGGER queue_leave_requests_translation
AFTER INSERT OR UPDATE ON public.leave_requests
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_leave_requests_translation();

-- leave_accrual_rules trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_leave_accrual_rules_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('leave_accrual_rules', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('leave_accrual_rules', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_leave_accrual_rules_translation ON public.leave_accrual_rules;
CREATE TRIGGER queue_leave_accrual_rules_translation
AFTER INSERT OR UPDATE ON public.leave_accrual_rules
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_leave_accrual_rules_translation();

-- attendance_policies trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_attendance_policies_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('attendance_policies', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('attendance_policies', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_attendance_policies_translation ON public.attendance_policies;
CREATE TRIGGER queue_attendance_policies_translation
AFTER INSERT OR UPDATE ON public.attendance_policies
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_attendance_policies_translation();

-- work_schedules trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_work_schedules_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('work_schedules', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('work_schedules', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_work_schedules_translation ON public.work_schedules;
CREATE TRIGGER queue_work_schedules_translation
AFTER INSERT OR UPDATE ON public.work_schedules
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_work_schedules_translation();

-- Update departments trigger to include name
CREATE OR REPLACE FUNCTION public.trigger_queue_departments_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('departments', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('departments', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_departments_translation ON public.departments;
CREATE TRIGGER queue_departments_translation
AFTER INSERT OR UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_departments_translation();