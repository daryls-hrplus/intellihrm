-- Create benefit_providers table
CREATE TABLE public.benefit_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'insurance',
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  website TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Add provider_id to benefit_plans
ALTER TABLE public.benefit_plans 
ADD COLUMN provider_id UUID REFERENCES public.benefit_providers(id);

-- Enable RLS
ALTER TABLE public.benefit_providers ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can view benefit providers"
  ON public.benefit_providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and HR can manage benefit providers"
  ON public.benefit_providers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'hr_manager')
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_benefit_providers_updated_at
  BEFORE UPDATE ON public.benefit_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();