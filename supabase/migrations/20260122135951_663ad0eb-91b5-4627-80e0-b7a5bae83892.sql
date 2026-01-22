-- Create rating-to-proficiency conversion rules table
CREATE TABLE public.rating_proficiency_conversion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  rating_scale_id UUID REFERENCES public.performance_rating_scales(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add proficiency history to employee_competencies for audit trail
ALTER TABLE public.employee_competencies 
ADD COLUMN IF NOT EXISTS proficiency_history JSONB DEFAULT '[]';

-- Add index for faster lookups
CREATE INDEX idx_conversion_rules_company ON public.rating_proficiency_conversion_rules(company_id);
CREATE INDEX idx_conversion_rules_scale ON public.rating_proficiency_conversion_rules(rating_scale_id);

-- Enable RLS
ALTER TABLE public.rating_proficiency_conversion_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rating_proficiency_conversion_rules
CREATE POLICY "Users can view conversion rules for their company"
ON public.rating_proficiency_conversion_rules
FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  OR is_default = true
);

CREATE POLICY "HR users can manage conversion rules"
ON public.rating_proficiency_conversion_rules
FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.code IN ('super_admin', 'hr_admin', 'hr_manager')
  )
);

-- Insert default conversion rules (global, no company_id)
INSERT INTO public.rating_proficiency_conversion_rules (name, description, rules, is_default, is_active)
VALUES (
  'Standard Performance-to-Proficiency Conversion',
  'Industry-standard rules: Exceptional (5) increases proficiency, Needs Improvement (2) or below decreases proficiency, others maintain current level.',
  '[
    {"performance_rating": 5, "proficiency_change": 1, "condition": "if_below_max", "label": "Exceptional - Proficiency Increased"},
    {"performance_rating": 4, "proficiency_change": 0, "condition": "maintain", "label": "Exceeds - Proficiency Maintained"},
    {"performance_rating": 3, "proficiency_change": 0, "condition": "maintain", "label": "Meets - Proficiency Maintained"},
    {"performance_rating": 2, "proficiency_change": -1, "condition": "if_above_min", "label": "Needs Improvement - Proficiency May Decrease"},
    {"performance_rating": 1, "proficiency_change": -1, "condition": "always", "label": "Unsatisfactory - Proficiency Decreased"}
  ]'::jsonb,
  true,
  true
);

-- Create updated_at trigger
CREATE TRIGGER update_rating_proficiency_conversion_rules_updated_at
BEFORE UPDATE ON public.rating_proficiency_conversion_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();