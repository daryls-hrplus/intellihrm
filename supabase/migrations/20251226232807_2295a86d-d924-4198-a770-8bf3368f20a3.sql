-- Add _en shadow columns to Tier 1 & Tier 2 tables

-- competencies
ALTER TABLE public.competencies 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- leave_types
ALTER TABLE public.leave_types 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- benefit_plans
ALTER TABLE public.benefit_plans 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- benefit_categories
ALTER TABLE public.benefit_categories 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- appraisal_cycles
ALTER TABLE public.appraisal_cycles 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Create trigger functions for each table

-- competencies trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_competencies_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('competencies', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('competencies', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_competencies_translation ON public.competencies;
CREATE TRIGGER queue_competencies_translation
AFTER INSERT OR UPDATE ON public.competencies
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_competencies_translation();

-- leave_types trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_leave_types_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('leave_types', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('leave_types', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_leave_types_translation ON public.leave_types;
CREATE TRIGGER queue_leave_types_translation
AFTER INSERT OR UPDATE ON public.leave_types
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_leave_types_translation();

-- benefit_plans trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_benefit_plans_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('benefit_plans', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('benefit_plans', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_benefit_plans_translation ON public.benefit_plans;
CREATE TRIGGER queue_benefit_plans_translation
AFTER INSERT OR UPDATE ON public.benefit_plans
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_benefit_plans_translation();

-- benefit_categories trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_benefit_categories_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('benefit_categories', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('benefit_categories', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_benefit_categories_translation ON public.benefit_categories;
CREATE TRIGGER queue_benefit_categories_translation
AFTER INSERT OR UPDATE ON public.benefit_categories
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_benefit_categories_translation();

-- appraisal_cycles trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_appraisal_cycles_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('appraisal_cycles', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('appraisal_cycles', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_appraisal_cycles_translation ON public.appraisal_cycles;
CREATE TRIGGER queue_appraisal_cycles_translation
AFTER INSERT OR UPDATE ON public.appraisal_cycles
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_appraisal_cycles_translation();