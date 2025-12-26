-- Create table for company (employer) government identifiers
CREATE TABLE public.company_government_ids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  government_id_type_id UUID NOT NULL REFERENCES public.government_id_types(id) ON DELETE CASCADE,
  id_number TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  issuing_authority TEXT,
  notes TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, government_id_type_id)
);

-- Enable RLS
ALTER TABLE public.company_government_ids ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view company government IDs"
ON public.company_government_ids
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "HR users can manage company government IDs"
ON public.company_government_ids
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_company_government_ids_updated_at
BEFORE UPDATE ON public.company_government_ids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.company_government_ids IS 'Stores government identifier numbers for companies (employer IDs)';