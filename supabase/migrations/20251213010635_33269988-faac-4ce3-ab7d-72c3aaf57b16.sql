-- Add country and holiday_type to leave_holidays table for multi-territory support
ALTER TABLE public.leave_holidays 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS holiday_type VARCHAR(20) DEFAULT 'company' CHECK (holiday_type IN ('country', 'company'));

-- Create a country_holidays table for centralized country-level holidays
CREATE TABLE IF NOT EXISTS public.country_holidays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country VARCHAR(2) NOT NULL,
  name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  is_half_day BOOLEAN DEFAULT false,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country, holiday_date, name)
);

-- Enable RLS
ALTER TABLE public.country_holidays ENABLE ROW LEVEL SECURITY;

-- RLS policies for country_holidays
CREATE POLICY "Country holidays viewable by authenticated users"
ON public.country_holidays
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Country holidays manageable by admin"
ON public.country_holidays
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update trigger for timestamps
CREATE TRIGGER update_country_holidays_updated_at
BEFORE UPDATE ON public.country_holidays
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.country_holidays IS 'Stores country-level public holidays that apply across all companies operating in that country';