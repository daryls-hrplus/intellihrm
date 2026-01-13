-- First, fix the existing categories by setting them to active
UPDATE performance_categories 
SET is_active = true, updated_at = now()
WHERE code IN ('exceptional', 'exceeds', 'meets', 'needs_improvement', 'unsatisfactory')
  AND is_active = false;

-- Now update the seed function to use UPSERT instead of DO NOTHING
CREATE OR REPLACE FUNCTION public.seed_default_performance_categories(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.performance_categories (
    company_id, code, name, name_en, description, description_en,
    min_score, max_score, color, icon,
    promotion_eligible, succession_eligible, bonus_eligible, requires_pip,
    display_order, is_active
  )
  VALUES
    (p_company_id, 'exceptional', 'Exceptional', 'Exceptional',
     'Consistently exceeds all expectations with outstanding results and significant impact',
     'Consistently exceeds all expectations with outstanding results and significant impact',
     4.50, 5.00, '#10B981', 'trophy',
     true, true, true, false, 1, true),
    (p_company_id, 'exceeds', 'Exceeds Expectations', 'Exceeds Expectations',
     'Frequently exceeds expectations and delivers above-standard results',
     'Frequently exceeds expectations and delivers above-standard results',
     3.50, 4.49, '#3B82F6', 'trending-up',
     true, true, true, false, 2, true),
    (p_company_id, 'meets', 'Meets Expectations', 'Meets Expectations',
     'Consistently meets all job requirements and expectations',
     'Consistently meets all job requirements and expectations',
     2.50, 3.49, '#F59E0B', 'check-circle',
     false, false, true, false, 3, true),
    (p_company_id, 'needs_improvement', 'Needs Improvement', 'Needs Improvement',
     'Performance falls below expectations in some areas and requires development',
     'Performance falls below expectations in some areas and requires development',
     1.50, 2.49, '#EF4444', 'alert-triangle',
     false, false, false, true, 4, true),
    (p_company_id, 'unsatisfactory', 'Unsatisfactory', 'Unsatisfactory',
     'Performance consistently fails to meet minimum job requirements',
     'Performance consistently fails to meet minimum job requirements',
     1.00, 1.49, '#7F1D1D', 'x-circle',
     false, false, false, true, 5, true)
  ON CONFLICT (company_id, code) 
  DO UPDATE SET 
    is_active = true,
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    description_en = EXCLUDED.description_en,
    min_score = EXCLUDED.min_score,
    max_score = EXCLUDED.max_score,
    color = EXCLUDED.color,
    icon = EXCLUDED.icon,
    promotion_eligible = EXCLUDED.promotion_eligible,
    succession_eligible = EXCLUDED.succession_eligible,
    bonus_eligible = EXCLUDED.bonus_eligible,
    requires_pip = EXCLUDED.requires_pip,
    display_order = EXCLUDED.display_order,
    updated_at = now();
END;
$$;