-- Create territories table for grouping companies into reporting regions
CREATE TABLE public.territories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  region_type TEXT DEFAULT 'geographic', -- geographic, business, regulatory
  parent_territory_id UUID REFERENCES public.territories(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(code)
);

-- Add territory_id to companies table
ALTER TABLE public.companies 
ADD COLUMN territory_id UUID REFERENCES public.territories(id);

-- Enable RLS on territories
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for territories
CREATE POLICY "Territories are viewable by authenticated users"
ON public.territories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Territories are manageable by admins"
ON public.territories FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_territories_updated_at
BEFORE UPDATE ON public.territories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for parent territory lookups
CREATE INDEX idx_territories_parent ON public.territories(parent_territory_id);

-- Add index for company territory lookups
CREATE INDEX idx_companies_territory ON public.companies(territory_id);

-- Add comment for documentation
COMMENT ON TABLE public.territories IS 'Territories group companies into reporting regions (e.g., Caribbean, South America)';