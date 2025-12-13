-- Create table for storing custom color schemes
CREATE TABLE public.color_schemes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  name TEXT NOT NULL DEFAULT 'Custom',
  is_active BOOLEAN NOT NULL DEFAULT false,
  colors JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS
ALTER TABLE public.color_schemes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage color schemes" 
ON public.color_schemes 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Everyone can view active color schemes" 
ON public.color_schemes 
FOR SELECT 
USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_color_schemes_updated_at
BEFORE UPDATE ON public.color_schemes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();