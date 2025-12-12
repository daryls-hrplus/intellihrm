-- Appraisal cycles (evaluation periods)
CREATE TABLE public.appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  evaluation_deadline DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  -- Category weights (must total 100)
  competency_weight NUMERIC NOT NULL DEFAULT 0 CHECK (competency_weight >= 0 AND competency_weight <= 100),
  responsibility_weight NUMERIC NOT NULL DEFAULT 0 CHECK (responsibility_weight >= 0 AND responsibility_weight <= 100),
  goal_weight NUMERIC NOT NULL DEFAULT 0 CHECK (goal_weight >= 0 AND goal_weight <= 100),
  -- Rating scale
  min_rating NUMERIC NOT NULL DEFAULT 1,
  max_rating NUMERIC NOT NULL DEFAULT 5,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appraisal participants (employees being evaluated)
CREATE TABLE public.appraisal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES public.appraisal_cycles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  evaluator_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  overall_score NUMERIC,
  competency_score NUMERIC,
  responsibility_score NUMERIC,
  goal_score NUMERIC,
  final_comments TEXT,
  employee_comments TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cycle_id, employee_id)
);

-- Individual evaluation scores for each item
CREATE TABLE public.appraisal_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES public.appraisal_participants(id) ON DELETE CASCADE,
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('competency', 'responsibility', 'goal')),
  item_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 0 CHECK (weight >= 0 AND weight <= 100),
  rating NUMERIC,
  weighted_score NUMERIC,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_id, evaluation_type, item_id)
);

-- Enable RLS
ALTER TABLE public.appraisal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appraisal_cycles
CREATE POLICY "Admins and HR can manage appraisal cycles"
  ON public.appraisal_cycles FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view active cycles"
  ON public.appraisal_cycles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for appraisal_participants
CREATE POLICY "Admins and HR can manage all participants"
  ON public.appraisal_participants FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own participation"
  ON public.appraisal_participants FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Evaluators can view and update assigned participants"
  ON public.appraisal_participants FOR ALL
  USING (auth.uid() = evaluator_id);

-- RLS Policies for appraisal_scores
CREATE POLICY "Admins and HR can manage all scores"
  ON public.appraisal_scores FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Employees can view own scores"
  ON public.appraisal_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.appraisal_participants ap
    WHERE ap.id = appraisal_scores.participant_id AND ap.employee_id = auth.uid()
  ));

CREATE POLICY "Evaluators can manage scores for assigned participants"
  ON public.appraisal_scores FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.appraisal_participants ap
    WHERE ap.id = appraisal_scores.participant_id AND ap.evaluator_id = auth.uid()
  ));

-- Function to calculate weighted scores
CREATE OR REPLACE FUNCTION public.calculate_appraisal_scores()
RETURNS TRIGGER AS $$
DECLARE
  max_rating NUMERIC;
BEGIN
  -- Get max rating from cycle
  SELECT ac.max_rating INTO max_rating
  FROM public.appraisal_cycles ac
  JOIN public.appraisal_participants ap ON ap.cycle_id = ac.id
  WHERE ap.id = NEW.participant_id;
  
  -- Calculate weighted score: (rating / max_rating) * weight
  IF NEW.rating IS NOT NULL AND max_rating > 0 THEN
    NEW.weighted_score := (NEW.rating / max_rating) * NEW.weight;
  ELSE
    NEW.weighted_score := 0;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_weighted_score_trigger
  BEFORE INSERT OR UPDATE ON public.appraisal_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_appraisal_scores();

-- Function to update participant category scores
CREATE OR REPLACE FUNCTION public.update_participant_scores()
RETURNS TRIGGER AS $$
DECLARE
  comp_score NUMERIC;
  resp_score NUMERIC;
  goal_score NUMERIC;
  comp_weight NUMERIC;
  resp_weight NUMERIC;
  goal_weight NUMERIC;
  overall NUMERIC;
BEGIN
  -- Calculate category scores (sum of weighted scores)
  SELECT COALESCE(SUM(weighted_score), 0) INTO comp_score
  FROM public.appraisal_scores
  WHERE participant_id = NEW.participant_id AND evaluation_type = 'competency';
  
  SELECT COALESCE(SUM(weighted_score), 0) INTO resp_score
  FROM public.appraisal_scores
  WHERE participant_id = NEW.participant_id AND evaluation_type = 'responsibility';
  
  SELECT COALESCE(SUM(weighted_score), 0) INTO goal_score
  FROM public.appraisal_scores
  WHERE participant_id = NEW.participant_id AND evaluation_type = 'goal';
  
  -- Get category weights from cycle
  SELECT ac.competency_weight, ac.responsibility_weight, ac.goal_weight
  INTO comp_weight, resp_weight, goal_weight
  FROM public.appraisal_cycles ac
  JOIN public.appraisal_participants ap ON ap.cycle_id = ac.id
  WHERE ap.id = NEW.participant_id;
  
  -- Calculate overall score: weighted average of category scores
  overall := (comp_score * comp_weight + resp_score * resp_weight + goal_score * goal_weight) / 100;
  
  -- Update participant record
  UPDATE public.appraisal_participants
  SET 
    competency_score = comp_score,
    responsibility_score = resp_score,
    goal_score = goal_score,
    overall_score = overall,
    updated_at = now()
  WHERE id = NEW.participant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_participant_scores_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.appraisal_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_participant_scores();

-- Indexes for performance
CREATE INDEX idx_appraisal_cycles_company ON public.appraisal_cycles(company_id);
CREATE INDEX idx_appraisal_cycles_status ON public.appraisal_cycles(status);
CREATE INDEX idx_appraisal_participants_cycle ON public.appraisal_participants(cycle_id);
CREATE INDEX idx_appraisal_participants_employee ON public.appraisal_participants(employee_id);
CREATE INDEX idx_appraisal_participants_evaluator ON public.appraisal_participants(evaluator_id);
CREATE INDEX idx_appraisal_scores_participant ON public.appraisal_scores(participant_id);
CREATE INDEX idx_appraisal_scores_type ON public.appraisal_scores(evaluation_type);