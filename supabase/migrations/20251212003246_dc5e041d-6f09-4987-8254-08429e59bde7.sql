
-- Create competency_levels table
CREATE TABLE public.competency_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competency_id UUID NOT NULL REFERENCES public.competencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  level_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(competency_id, code)
);

-- Enable RLS
ALTER TABLE public.competency_levels ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view competency levels"
  ON public.competency_levels FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert competency levels"
  ON public.competency_levels FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update competency levels"
  ON public.competency_levels FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete competency levels"
  ON public.competency_levels FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_competency_levels_updated_at
  BEFORE UPDATE ON public.competency_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
