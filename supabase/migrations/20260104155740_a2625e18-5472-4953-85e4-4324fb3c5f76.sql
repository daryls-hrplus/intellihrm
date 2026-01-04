-- Add category-specific anonymity threshold columns to feedback_360_rater_categories
ALTER TABLE feedback_360_rater_categories
ADD COLUMN IF NOT EXISTS anonymity_threshold INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS bypass_threshold_check BOOLEAN DEFAULT false;

COMMENT ON COLUMN feedback_360_rater_categories.anonymity_threshold IS 
'Minimum responses required before showing aggregated scores for this category';

COMMENT ON COLUMN feedback_360_rater_categories.bypass_threshold_check IS 
'If true, always show results for this category regardless of response count (e.g., manager feedback)';

-- Set default values for common categories - Manager should always show
UPDATE feedback_360_rater_categories
SET bypass_threshold_check = true, anonymity_threshold = 1
WHERE LOWER(code) IN ('manager', 'direct_manager', 'supervisor', 'mgr');

-- Peer and direct report categories need protection
UPDATE feedback_360_rater_categories
SET bypass_threshold_check = false, anonymity_threshold = 3
WHERE LOWER(code) IN ('peer', 'colleague', 'direct_report', 'subordinate', 'report', 'skip_level');

-- Update the get_360_feedback_summary function to use category-specific thresholds
CREATE OR REPLACE FUNCTION public.get_360_feedback_summary(
  p_employee_id UUID,
  p_cycle_id UUID,
  p_viewer_role TEXT DEFAULT 'employee'
)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  category_code TEXT,
  response_count BIGINT,
  avg_rating NUMERIC,
  text_responses TEXT[],
  is_suppressed BOOLEAN,
  suppression_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_global_threshold INTEGER := 3;
BEGIN
  -- Get company ID from employee
  SELECT company_id INTO v_company_id
  FROM profiles
  WHERE id = p_employee_id;

  -- Get global threshold from company anonymity policy (fallback)
  SELECT COALESCE((anonymity_policy->>'minimum_responses_for_scores')::INTEGER, 3)
  INTO v_global_threshold
  FROM companies
  WHERE id = v_company_id;

  RETURN QUERY
  WITH category_responses AS (
    SELECT 
      rc.id as cat_id,
      rc.name as cat_name,
      rc.code as cat_code,
      rc.anonymity_threshold as cat_threshold,
      rc.bypass_threshold_check as cat_bypass,
      COUNT(DISTINCT fr.id) as resp_count,
      ROUND(AVG(fr.rating_value)::numeric, 2) as raw_avg,
      ARRAY_AGG(DISTINCT fr.text_response) FILTER (WHERE fr.text_response IS NOT NULL AND fr.text_response != '') as raw_texts
    FROM feedback_360_rater_categories rc
    LEFT JOIN feedback_360_requests req ON req.rater_category_id = rc.id
      AND req.cycle_id = p_cycle_id
      AND req.employee_id = p_employee_id
      AND req.status = 'completed'
    LEFT JOIN feedback_360_submissions fs ON fs.request_id = req.id
      AND fs.status = 'submitted'
    LEFT JOIN feedback_360_responses fr ON fr.submission_id = fs.id
    WHERE rc.company_id = v_company_id
      AND rc.is_active = true
    GROUP BY rc.id, rc.name, rc.code, rc.anonymity_threshold, rc.bypass_threshold_check
  )
  SELECT
    cr.cat_id,
    cr.cat_name,
    cr.cat_code,
    cr.resp_count,
    -- Use category-specific bypass or threshold
    CASE 
      WHEN cr.cat_bypass = true THEN cr.raw_avg
      WHEN cr.resp_count >= COALESCE(cr.cat_threshold, v_global_threshold) THEN cr.raw_avg
      ELSE NULL
    END as avg_rating,
    CASE 
      WHEN cr.cat_bypass = true THEN cr.raw_texts
      WHEN cr.resp_count >= COALESCE(cr.cat_threshold, v_global_threshold) THEN cr.raw_texts
      ELSE NULL
    END as text_responses,
    CASE 
      WHEN cr.cat_bypass = true THEN false
      WHEN cr.resp_count >= COALESCE(cr.cat_threshold, v_global_threshold) THEN false
      ELSE true
    END as is_suppressed,
    CASE 
      WHEN cr.cat_bypass = true THEN NULL
      WHEN cr.resp_count >= COALESCE(cr.cat_threshold, v_global_threshold) THEN NULL
      ELSE 'Responses hidden to protect anonymity (requires ' || COALESCE(cr.cat_threshold, v_global_threshold)::TEXT || ' responses, has ' || cr.resp_count::TEXT || ')'
    END as suppression_reason
  FROM category_responses cr
  ORDER BY cr.cat_name;
END;
$$;