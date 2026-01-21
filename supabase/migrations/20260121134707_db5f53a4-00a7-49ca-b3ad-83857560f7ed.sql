-- Fix ambiguous variable names in update_participant_scores function
-- Variables now use v_ prefix to avoid collision with column names

CREATE OR REPLACE FUNCTION public.update_participant_scores()
RETURNS TRIGGER AS $$
DECLARE
  v_comp_score NUMERIC;
  v_resp_score NUMERIC;
  v_goal_score NUMERIC;
  v_comp_weight NUMERIC;
  v_resp_weight NUMERIC;
  v_goal_weight NUMERIC;
  v_overall NUMERIC;
BEGIN
  -- Calculate category scores (sum of weighted scores)
  SELECT COALESCE(SUM(weighted_score), 0) INTO v_comp_score
  FROM public.appraisal_scores
  WHERE participant_id = NEW.participant_id AND evaluation_type = 'competency';
  
  SELECT COALESCE(SUM(weighted_score), 0) INTO v_resp_score
  FROM public.appraisal_scores
  WHERE participant_id = NEW.participant_id AND evaluation_type = 'responsibility';
  
  SELECT COALESCE(SUM(weighted_score), 0) INTO v_goal_score
  FROM public.appraisal_scores
  WHERE participant_id = NEW.participant_id AND evaluation_type = 'goal';
  
  -- Get category weights from cycle
  SELECT ac.competency_weight, ac.responsibility_weight, ac.goal_weight
  INTO v_comp_weight, v_resp_weight, v_goal_weight
  FROM public.appraisal_cycles ac
  JOIN public.appraisal_participants ap ON ap.cycle_id = ac.id
  WHERE ap.id = NEW.participant_id;
  
  -- Calculate overall score: weighted average of category scores
  v_overall := (v_comp_score * COALESCE(v_comp_weight, 0) + v_resp_score * COALESCE(v_resp_weight, 0) 
                + v_goal_score * COALESCE(v_goal_weight, 0)) / NULLIF(COALESCE(v_comp_weight, 0) + COALESCE(v_resp_weight, 0) + COALESCE(v_goal_weight, 0), 0);
  
  -- Update participant record (column names are now unambiguous)
  UPDATE public.appraisal_participants
  SET 
    competency_score = v_comp_score,
    responsibility_score = v_resp_score,
    goal_score = v_goal_score,
    overall_score = v_overall,
    updated_at = now()
  WHERE id = NEW.participant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;