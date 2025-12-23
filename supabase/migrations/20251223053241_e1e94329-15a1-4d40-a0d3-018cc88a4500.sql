-- Create performance rating scales table for company-wide rating configuration
CREATE TABLE public.performance_rating_scales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  min_rating INTEGER NOT NULL DEFAULT 1,
  max_rating INTEGER NOT NULL DEFAULT 5,
  rating_labels JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS
ALTER TABLE public.performance_rating_scales ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view rating scales for their company"
ON public.performance_rating_scales
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR managers and admins can manage rating scales"
ON public.performance_rating_scales
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'hr_manager')
  )
);

-- Create recognition categories table
CREATE TABLE public.recognition_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  points_value INTEGER DEFAULT 0,
  requires_approval BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS
ALTER TABLE public.recognition_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view recognition categories for their company"
ON public.recognition_categories
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "HR managers and admins can manage recognition categories"
ON public.recognition_categories
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'hr_manager')
  )
);

-- Create trigger for updated_at on performance_rating_scales
CREATE TRIGGER update_performance_rating_scales_updated_at
BEFORE UPDATE ON public.performance_rating_scales
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on recognition_categories
CREATE TRIGGER update_recognition_categories_updated_at
BEFORE UPDATE ON public.recognition_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();