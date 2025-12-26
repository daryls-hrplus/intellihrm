-- Add _en shadow columns to additional key tables

-- positions
ALTER TABLE public.positions 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- roles
ALTER TABLE public.roles 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- pay_elements
ALTER TABLE public.pay_elements 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- statutory_deduction_types
ALTER TABLE public.statutory_deduction_types 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Create trigger functions for each table

-- positions trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_positions_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title THEN
    PERFORM queue_translation('positions', NEW.id, 'title', NEW.title);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('positions', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_positions_translation ON public.positions;
CREATE TRIGGER queue_positions_translation
AFTER INSERT OR UPDATE ON public.positions
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_positions_translation();

-- roles trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_roles_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('roles', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('roles', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_roles_translation ON public.roles;
CREATE TRIGGER queue_roles_translation
AFTER INSERT OR UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_roles_translation();

-- pay_elements trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_pay_elements_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('pay_elements', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('pay_elements', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_pay_elements_translation ON public.pay_elements;
CREATE TRIGGER queue_pay_elements_translation
AFTER INSERT OR UPDATE ON public.pay_elements
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_pay_elements_translation();

-- statutory_deduction_types trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_statutory_deduction_types_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('statutory_deduction_types', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('statutory_deduction_types', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_statutory_deduction_types_translation ON public.statutory_deduction_types;
CREATE TRIGGER queue_statutory_deduction_types_translation
AFTER INSERT OR UPDATE ON public.statutory_deduction_types
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_statutory_deduction_types_translation();