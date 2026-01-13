-- Rename performance_categories table to rating_levels
ALTER TABLE public.performance_categories RENAME TO rating_levels;

-- Rename the RPC function
DROP FUNCTION IF EXISTS public.seed_default_performance_categories(uuid);

CREATE OR REPLACE FUNCTION public.seed_default_rating_levels(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.rating_levels (company_id, code, name, name_en, description, description_en, min_score, max_score, color, icon, promotion_eligible, succession_eligible, bonus_eligible, requires_pip, display_order, is_active)
  VALUES
    (p_company_id, 'EXCEPTIONAL', 'Exceptional', 'Exceptional', 'Consistently exceeds expectations', 'Consistently exceeds expectations', 4.5, 5.0, '#22c55e', 'star', true, true, true, false, 1, true),
    (p_company_id, 'EXCEEDS', 'Exceeds Expectations', 'Exceeds Expectations', 'Frequently exceeds expectations', 'Frequently exceeds expectations', 3.5, 4.49, '#84cc16', 'trending-up', true, true, true, false, 2, true),
    (p_company_id, 'MEETS', 'Meets Expectations', 'Meets Expectations', 'Consistently meets expectations', 'Consistently meets expectations', 2.5, 3.49, '#3b82f6', 'check-circle', false, false, true, false, 3, true),
    (p_company_id, 'BELOW', 'Below Expectations', 'Below Expectations', 'Sometimes meets expectations', 'Sometimes meets expectations', 1.5, 2.49, '#f97316', 'alert-triangle', false, false, false, true, 4, true),
    (p_company_id, 'UNSATISFACTORY', 'Unsatisfactory', 'Unsatisfactory', 'Does not meet expectations', 'Does not meet expectations', 0, 1.49, '#ef4444', 'x-circle', false, false, false, true, 5, true)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Rename foreign key constraint references (if any exist)
ALTER TABLE IF EXISTS public.rating_levels 
  RENAME CONSTRAINT performance_categories_company_id_fkey TO rating_levels_company_id_fkey;

-- Rename indexes if they exist
ALTER INDEX IF EXISTS performance_categories_pkey RENAME TO rating_levels_pkey;