-- Create statutory_deduction_types table for country-level statutory deductions
CREATE TABLE public.statutory_deduction_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  statutory_type TEXT NOT NULL,
  statutory_code TEXT NOT NULL,
  statutory_name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on country + statutory_code
ALTER TABLE public.statutory_deduction_types 
ADD CONSTRAINT statutory_deduction_types_country_code_unique UNIQUE (country, statutory_code);

-- Create index for faster lookups
CREATE INDEX idx_statutory_deduction_types_country ON public.statutory_deduction_types(country);
CREATE INDEX idx_statutory_deduction_types_type ON public.statutory_deduction_types(statutory_type);

-- Enable RLS
ALTER TABLE public.statutory_deduction_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (authenticated users can read, admins can manage)
CREATE POLICY "Authenticated users can view statutory deduction types"
ON public.statutory_deduction_types
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage statutory deduction types"
ON public.statutory_deduction_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'hr_manager')
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_statutory_deduction_types_updated_at
BEFORE UPDATE ON public.statutory_deduction_types
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE public.statutory_deduction_types IS 'Country-level statutory deduction types for tax and social security configuration';