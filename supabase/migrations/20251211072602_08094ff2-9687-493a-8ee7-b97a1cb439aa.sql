-- Create company_groups table
CREATE TABLE public.company_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create divisions table
CREATE TABLE public.divisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.company_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, code)
);

-- Add group_id and division_id to companies table
ALTER TABLE public.companies 
ADD COLUMN group_id UUID REFERENCES public.company_groups(id) ON DELETE SET NULL,
ADD COLUMN division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.company_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_groups
CREATE POLICY "Authenticated users can view company groups"
ON public.company_groups FOR SELECT
USING (true);

CREATE POLICY "Admins can insert company groups"
ON public.company_groups FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update company groups"
ON public.company_groups FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete company groups"
ON public.company_groups FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for divisions
CREATE POLICY "Authenticated users can view divisions"
ON public.divisions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert divisions"
ON public.divisions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update divisions"
ON public.divisions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete divisions"
ON public.divisions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_company_groups_updated_at
BEFORE UPDATE ON public.company_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divisions_updated_at
BEFORE UPDATE ON public.divisions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();