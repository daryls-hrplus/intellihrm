-- Add employee identification fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS employee_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS badge_number TEXT,
ADD COLUMN IF NOT EXISTS global_id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS cedula_number TEXT,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS first_last_name TEXT,
ADD COLUMN IF NOT EXISTS second_last_name TEXT;

-- Create index on employee_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_global_id ON public.profiles(global_id);
CREATE INDEX IF NOT EXISTS idx_profiles_badge_number ON public.profiles(badge_number);
CREATE INDEX IF NOT EXISTS idx_profiles_cedula_number ON public.profiles(cedula_number);

-- Create table to store badge number patterns by company
CREATE TABLE IF NOT EXISTS public.badge_number_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  pattern TEXT NOT NULL DEFAULT 'EMP-{NNNN}',
  prefix TEXT,
  suffix TEXT,
  current_sequence INTEGER DEFAULT 0,
  padding_length INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS on badge_number_patterns
ALTER TABLE public.badge_number_patterns ENABLE ROW LEVEL SECURITY;

-- RLS policies for badge_number_patterns
CREATE POLICY "Users can view badge patterns for their company"
ON public.badge_number_patterns FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "HR and Admin can manage badge patterns"
ON public.badge_number_patterns FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'hr_manager')
  )
);

-- Function to generate next employee_id
CREATE OR REPLACE FUNCTION public.generate_employee_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_seq INTEGER;
  new_id TEXT;
BEGIN
  -- Get current max sequence from existing employee_ids
  SELECT COALESCE(MAX(CAST(SUBSTRING(employee_id FROM 4) AS INTEGER)), 0) + 1
  INTO next_seq
  FROM profiles
  WHERE employee_id ~ '^EMP[0-9]+$';
  
  new_id := 'EMP' || LPAD(next_seq::TEXT, 6, '0');
  RETURN new_id;
END;
$$;

-- Function to generate next badge number for a company
CREATE OR REPLACE FUNCTION public.generate_badge_number(p_company_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pattern_rec RECORD;
  next_seq INTEGER;
  new_badge TEXT;
BEGIN
  -- Get or create pattern for company
  SELECT * INTO pattern_rec
  FROM badge_number_patterns
  WHERE company_id = p_company_id AND is_active = true;
  
  IF NOT FOUND THEN
    -- Create default pattern for company
    INSERT INTO badge_number_patterns (company_id, pattern, current_sequence, padding_length)
    VALUES (p_company_id, 'BADGE-{NNNN}', 0, 4)
    RETURNING * INTO pattern_rec;
  END IF;
  
  -- Increment sequence
  next_seq := pattern_rec.current_sequence + 1;
  
  -- Update sequence
  UPDATE badge_number_patterns
  SET current_sequence = next_seq, updated_at = now()
  WHERE id = pattern_rec.id;
  
  -- Generate badge number
  new_badge := COALESCE(pattern_rec.prefix, '') || 
               LPAD(next_seq::TEXT, pattern_rec.padding_length, '0') || 
               COALESCE(pattern_rec.suffix, '');
  
  RETURN new_badge;
END;
$$;

-- Trigger to auto-generate employee_id on insert
CREATE OR REPLACE FUNCTION public.auto_generate_employee_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.employee_id IS NULL THEN
    NEW.employee_id := generate_employee_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_employee_id ON public.profiles;
CREATE TRIGGER trigger_auto_employee_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_employee_id();

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.employee_id IS 'System-generated unique employee identifier (e.g., EMP000001)';
COMMENT ON COLUMN public.profiles.badge_number IS 'Company-specific badge number, can follow company patterns';
COMMENT ON COLUMN public.profiles.global_id IS 'Global identifier for employees working across multiple companies';
COMMENT ON COLUMN public.profiles.cedula_number IS 'National ID number (Cédula) for Latin American countries';
COMMENT ON COLUMN public.profiles.first_name IS 'First name (Primer Nombre)';
COMMENT ON COLUMN public.profiles.middle_name IS 'Middle name (Segundo Nombre)';
COMMENT ON COLUMN public.profiles.first_last_name IS 'First/paternal last name (Primer Apellido / Apellido Paterno)';
COMMENT ON COLUMN public.profiles.second_last_name IS 'Second/maternal last name (Segundo Apellido / Apellido Materno)';