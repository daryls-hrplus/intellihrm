-- Create leave_years table to track configurable leave periods
CREATE TABLE public.leave_years (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Add leave_year_id to leave_balances (keeping year for backward compatibility)
ALTER TABLE public.leave_balances 
ADD COLUMN leave_year_id UUID REFERENCES public.leave_years(id);

-- Enable RLS on leave_years
ALTER TABLE public.leave_years ENABLE ROW LEVEL SECURITY;

-- Policies for leave_years
CREATE POLICY "Users can view leave years for their company"
ON public.leave_years FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = leave_years.company_id
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager')
  )
);

CREATE POLICY "HR and admins can manage leave years"
ON public.leave_years FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin', 'hr_manager')
  )
);

-- Create index for faster lookups
CREATE INDEX idx_leave_years_company ON public.leave_years(company_id);
CREATE INDEX idx_leave_years_current ON public.leave_years(company_id, is_current) WHERE is_current = true;
CREATE INDEX idx_leave_years_dates ON public.leave_years(company_id, start_date, end_date);
CREATE INDEX idx_leave_balances_leave_year ON public.leave_balances(leave_year_id);

-- Trigger for updated_at
CREATE TRIGGER update_leave_years_updated_at
  BEFORE UPDATE ON public.leave_years
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();