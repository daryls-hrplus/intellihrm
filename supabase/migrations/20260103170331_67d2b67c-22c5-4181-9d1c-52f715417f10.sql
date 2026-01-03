-- First drop the existing function to change return type
DROP FUNCTION IF EXISTS get_360_feedback_summary(UUID);

-- Recreate with anonymity enforcement and new return columns
CREATE OR REPLACE FUNCTION get_360_feedback_summary(p_participant_id UUID)
RETURNS TABLE (
  question_id UUID,
  question_text TEXT,
  competency_name TEXT,
  reviewer_type TEXT,
  avg_rating NUMERIC,
  response_count BIGINT,
  text_responses TEXT[],
  is_suppressed BOOLEAN,
  suppression_reason TEXT
) AS $$
DECLARE
  v_anonymity_threshold INT;
  v_employee_id UUID;
BEGIN
  -- Get anonymity threshold from the cycle and employee_id for permission check
  SELECT COALESCE(rc.anonymity_threshold, 3), rp.employee_id 
  INTO v_anonymity_threshold, v_employee_id
  FROM review_participants rp
  JOIN review_cycles rc ON rc.id = rp.review_cycle_id
  WHERE rp.id = p_participant_id;

  -- Permission check: employee can see their own, or admin/hr_manager, or manager
  IF NOT (
    v_employee_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hr_manager'))
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = v_employee_id AND manager_id = auth.uid()
    )
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    rq.id as question_id,
    rq.question_text,
    c.name as competency_name,
    fs.reviewer_type,
    CASE 
      WHEN COUNT(DISTINCT fs.id) >= v_anonymity_threshold THEN ROUND(AVG(fr.rating_value)::numeric, 2)
      ELSE NULL
    END as avg_rating,
    COUNT(DISTINCT fs.id) as response_count,
    CASE 
      WHEN COUNT(DISTINCT fs.id) >= v_anonymity_threshold 
      THEN ARRAY_AGG(fr.text_value) FILTER (WHERE fr.text_value IS NOT NULL AND fr.text_value != '')
      ELSE NULL
    END as text_responses,
    COUNT(DISTINCT fs.id) < v_anonymity_threshold as is_suppressed,
    CASE 
      WHEN COUNT(DISTINCT fs.id) < v_anonymity_threshold 
      THEN 'Insufficient responses (' || COUNT(DISTINCT fs.id) || '/' || v_anonymity_threshold || ' required)'
      ELSE NULL
    END as suppression_reason
  FROM feedback_submissions fs
  INNER JOIN feedback_responses fr ON fr.feedback_submission_id = fs.id
  INNER JOIN review_questions rq ON rq.id = fr.question_id
  LEFT JOIN competencies c ON c.id = rq.competency_id
  WHERE fs.review_participant_id = p_participant_id
    AND fs.status = 'submitted'
  GROUP BY rq.id, rq.question_text, c.name, fs.reviewer_type, rq.display_order
  ORDER BY rq.display_order, fs.reviewer_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_360_feedback_summary(UUID) IS 
'Returns 360 feedback summary with anonymity enforcement. Categories with fewer responses than the cycle anonymity_threshold will have scores and comments suppressed.';