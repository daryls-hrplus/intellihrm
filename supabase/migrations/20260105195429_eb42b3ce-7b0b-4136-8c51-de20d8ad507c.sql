-- Create compliance_items table
CREATE TABLE public.compliance_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('compliant', 'pending', 'overdue', 'in_progress')),
  responsible TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.compliance_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view compliance items in their company" 
ON public.compliance_items 
FOR SELECT 
USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "HR managers can manage compliance items" 
ON public.compliance_items 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE p.id = auth.uid() 
    AND r.name IN ('admin', 'hr_manager')
  )
);

-- Create index for company filtering
CREATE INDEX idx_compliance_items_company_id ON public.compliance_items(company_id);

-- Create trigger for updated_at
CREATE TRIGGER update_compliance_items_updated_at
BEFORE UPDATE ON public.compliance_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();