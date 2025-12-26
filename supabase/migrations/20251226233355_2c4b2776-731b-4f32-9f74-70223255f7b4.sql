-- Add _en shadow columns to tables with position_id and other key tables

-- companies
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS address_en TEXT;

-- divisions
ALTER TABLE public.divisions 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- headcount_requests
ALTER TABLE public.headcount_requests 
ADD COLUMN IF NOT EXISTS reason_en TEXT,
ADD COLUMN IF NOT EXISTS review_notes_en TEXT;

-- succession_plans
ALTER TABLE public.succession_plans 
ADD COLUMN IF NOT EXISTS plan_name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS notes_en TEXT;

-- key_position_risks
ALTER TABLE public.key_position_risks 
ADD COLUMN IF NOT EXISTS impact_if_vacant_en TEXT,
ADD COLUMN IF NOT EXISTS risk_notes_en TEXT;

-- pay_groups
ALTER TABLE public.pay_groups 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- expense_claims
ALTER TABLE public.expense_claims 
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS review_notes_en TEXT;

-- employee_transactions
ALTER TABLE public.employee_transactions 
ADD COLUMN IF NOT EXISTS notes_en TEXT;

-- Create trigger functions

-- companies trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_companies_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('companies', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.address IS DISTINCT FROM OLD.address THEN
    PERFORM queue_translation('companies', NEW.id, 'address', NEW.address);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_companies_translation ON public.companies;
CREATE TRIGGER queue_companies_translation
AFTER INSERT OR UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_companies_translation();

-- divisions trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_divisions_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('divisions', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('divisions', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_divisions_translation ON public.divisions;
CREATE TRIGGER queue_divisions_translation
AFTER INSERT OR UPDATE ON public.divisions
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_divisions_translation();

-- headcount_requests trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_headcount_requests_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reason IS DISTINCT FROM OLD.reason THEN
    PERFORM queue_translation('headcount_requests', NEW.id, 'reason', NEW.reason);
  END IF;
  IF NEW.review_notes IS DISTINCT FROM OLD.review_notes THEN
    PERFORM queue_translation('headcount_requests', NEW.id, 'review_notes', NEW.review_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_headcount_requests_translation ON public.headcount_requests;
CREATE TRIGGER queue_headcount_requests_translation
AFTER INSERT OR UPDATE ON public.headcount_requests
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_headcount_requests_translation();

-- succession_plans trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_succession_plans_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan_name IS DISTINCT FROM OLD.plan_name THEN
    PERFORM queue_translation('succession_plans', NEW.id, 'plan_name', NEW.plan_name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('succession_plans', NEW.id, 'description', NEW.description);
  END IF;
  IF NEW.notes IS DISTINCT FROM OLD.notes THEN
    PERFORM queue_translation('succession_plans', NEW.id, 'notes', NEW.notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_succession_plans_translation ON public.succession_plans;
CREATE TRIGGER queue_succession_plans_translation
AFTER INSERT OR UPDATE ON public.succession_plans
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_succession_plans_translation();

-- key_position_risks trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_key_position_risks_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.impact_if_vacant IS DISTINCT FROM OLD.impact_if_vacant THEN
    PERFORM queue_translation('key_position_risks', NEW.id, 'impact_if_vacant', NEW.impact_if_vacant);
  END IF;
  IF NEW.risk_notes IS DISTINCT FROM OLD.risk_notes THEN
    PERFORM queue_translation('key_position_risks', NEW.id, 'risk_notes', NEW.risk_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_key_position_risks_translation ON public.key_position_risks;
CREATE TRIGGER queue_key_position_risks_translation
AFTER INSERT OR UPDATE ON public.key_position_risks
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_key_position_risks_translation();

-- pay_groups trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_pay_groups_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    PERFORM queue_translation('pay_groups', NEW.id, 'name', NEW.name);
  END IF;
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('pay_groups', NEW.id, 'description', NEW.description);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_pay_groups_translation ON public.pay_groups;
CREATE TRIGGER queue_pay_groups_translation
AFTER INSERT OR UPDATE ON public.pay_groups
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_pay_groups_translation();

-- expense_claims trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_expense_claims_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    PERFORM queue_translation('expense_claims', NEW.id, 'description', NEW.description);
  END IF;
  IF NEW.review_notes IS DISTINCT FROM OLD.review_notes THEN
    PERFORM queue_translation('expense_claims', NEW.id, 'review_notes', NEW.review_notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_expense_claims_translation ON public.expense_claims;
CREATE TRIGGER queue_expense_claims_translation
AFTER INSERT OR UPDATE ON public.expense_claims
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_expense_claims_translation();

-- employee_transactions trigger
CREATE OR REPLACE FUNCTION public.trigger_queue_employee_transactions_translation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.notes IS DISTINCT FROM OLD.notes THEN
    PERFORM queue_translation('employee_transactions', NEW.id, 'notes', NEW.notes);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS queue_employee_transactions_translation ON public.employee_transactions;
CREATE TRIGGER queue_employee_transactions_translation
AFTER INSERT OR UPDATE ON public.employee_transactions
FOR EACH ROW EXECUTE FUNCTION public.trigger_queue_employee_transactions_translation();