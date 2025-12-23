-- Add company_id column to positions table
ALTER TABLE public.positions 
ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Backfill company_id from departments
UPDATE public.positions p
SET company_id = d.company_id
FROM public.departments d
WHERE p.department_id = d.id;

-- Create index for performance
CREATE INDEX idx_positions_company_id ON public.positions(company_id);

-- Create function to auto-populate company_id from department
CREATE OR REPLACE FUNCTION public.sync_position_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Get company_id from department if not provided or department changed
  IF NEW.department_id IS NOT NULL THEN
    SELECT company_id INTO NEW.company_id
    FROM departments
    WHERE id = NEW.department_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-sync company_id
CREATE TRIGGER trigger_sync_position_company_id
  BEFORE INSERT OR UPDATE OF department_id ON public.positions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_position_company_id();