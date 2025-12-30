-- =============================================
-- Phase 1A: Add Competency Versioning
-- =============================================

-- Add version tracking to competencies table
ALTER TABLE competencies 
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1 NOT NULL,
ADD COLUMN IF NOT EXISTS version_notes text,
ADD COLUMN IF NOT EXISTS versioned_at timestamp with time zone;

-- Track which version was used in appraisal scores
ALTER TABLE appraisal_scores 
ADD COLUMN IF NOT EXISTS competency_version integer;

-- =============================================
-- Phase 1B: Create employee_skill_gaps Table
-- =============================================

CREATE TABLE IF NOT EXISTS employee_skill_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id),
  capability_id uuid,
  capability_name text NOT NULL,
  required_level integer NOT NULL,
  current_level integer NOT NULL,
  gap_score integer GENERATED ALWAYS AS (required_level - current_level) STORED,
  priority text CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  source text CHECK (source IN ('appraisal', 'job_requirement', 'succession', 'ai_inference', 'manual')),
  source_reference_id uuid,
  recommended_actions jsonb DEFAULT '[]',
  idp_item_id uuid,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'addressed', 'closed')),
  detected_at timestamp with time zone DEFAULT now(),
  addressed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on employee_skill_gaps
ALTER TABLE employee_skill_gaps ENABLE ROW LEVEL SECURITY;

-- RLS policies for employee_skill_gaps
CREATE POLICY "Users can view own skill gaps"
ON employee_skill_gaps FOR SELECT
USING (auth.uid() = employee_id);

CREATE POLICY "Managers and HR can view skill gaps"
ON employee_skill_gaps FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM get_employee_supervisor(employee_skill_gaps.employee_id, NULL) 
    WHERE supervisor_id = auth.uid()
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_staff'])
);

CREATE POLICY "HR and admins can manage skill gaps"
ON employee_skill_gaps FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));

-- =============================================
-- Phase 1C: Create company_values Table
-- =============================================

CREATE TABLE IF NOT EXISTS company_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) NOT NULL,
  name text NOT NULL,
  code text,
  description text,
  behavioral_indicators jsonb DEFAULT '[]',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  weight numeric(5,2) DEFAULT 0,
  is_promotion_factor boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS on company_values
ALTER TABLE company_values ENABLE ROW LEVEL SECURITY;

-- RLS policies for company_values
CREATE POLICY "Users can view company values"
ON company_values FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.company_id = company_values.company_id
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

CREATE POLICY "HR and admins can manage company values"
ON company_values FOR ALL
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager']));

-- =============================================
-- Create appraisal_value_scores Table
-- =============================================

CREATE TABLE IF NOT EXISTS appraisal_value_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES appraisal_participants(id) ON DELETE CASCADE NOT NULL,
  value_id uuid REFERENCES company_values(id) NOT NULL,
  rating numeric(3,1),
  demonstrated_behaviors jsonb,
  evidence text,
  comments text,
  assessed_by uuid REFERENCES profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(participant_id, value_id)
);

-- Enable RLS on appraisal_value_scores
ALTER TABLE appraisal_value_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for appraisal_value_scores
CREATE POLICY "Users can view own value scores"
ON appraisal_value_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = appraisal_value_scores.participant_id 
    AND ap.employee_id = auth.uid()
  )
);

CREATE POLICY "Evaluators and HR can view value scores"
ON appraisal_value_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = appraisal_value_scores.participant_id 
    AND ap.evaluator_id = auth.uid()
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager', 'hr_staff'])
);

CREATE POLICY "Evaluators and HR can manage value scores"
ON appraisal_value_scores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM appraisal_participants ap 
    WHERE ap.id = appraisal_value_scores.participant_id 
    AND ap.evaluator_id = auth.uid()
  )
  OR public.has_any_role(auth.uid(), ARRAY['admin', 'hr_manager'])
);

-- =============================================
-- Add values columns to appraisal_cycles
-- =============================================

ALTER TABLE appraisal_cycles 
ADD COLUMN IF NOT EXISTS values_weight numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS include_values_assessment boolean DEFAULT false;

-- =============================================
-- Phase 1D: Auto-IDP Creation Trigger
-- =============================================

CREATE OR REPLACE FUNCTION auto_create_idp_from_skill_gap()
RETURNS TRIGGER AS $$
DECLARE
  existing_idp_id uuid;
  new_goal_id uuid;
BEGIN
  -- Only trigger for high/critical gaps
  IF NEW.priority NOT IN ('high', 'critical') THEN
    RETURN NEW;
  END IF;
  
  -- Find active IDP for employee
  SELECT id INTO existing_idp_id
  FROM individual_development_plans
  WHERE employee_id = NEW.employee_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no active IDP exists, create one
  IF existing_idp_id IS NULL THEN
    INSERT INTO individual_development_plans (employee_id, title, status, company_id)
    VALUES (NEW.employee_id, 'Development Plan - ' || to_char(now(), 'YYYY'), 'active', NEW.company_id)
    RETURNING id INTO existing_idp_id;
  END IF;
  
  -- Create IDP goal for this skill gap
  INSERT INTO idp_goals (idp_id, title, description, category, priority, status, target_date)
  VALUES (
    existing_idp_id,
    'Develop: ' || NEW.capability_name,
    'Address skill gap from ' || COALESCE(NEW.source, 'assessment') || '. Current level: ' || NEW.current_level || ', Required: ' || NEW.required_level,
    'skills_development',
    NEW.priority,
    'not_started',
    NOW() + INTERVAL '90 days'
  )
  RETURNING id INTO new_goal_id;
  
  -- Link back to skill gap
  NEW.idp_item_id := new_goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto IDP creation
DROP TRIGGER IF EXISTS trigger_auto_idp_from_skill_gap ON employee_skill_gaps;
CREATE TRIGGER trigger_auto_idp_from_skill_gap
BEFORE INSERT ON employee_skill_gaps
FOR EACH ROW
EXECUTE FUNCTION auto_create_idp_from_skill_gap();

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_employee_skill_gaps_employee ON employee_skill_gaps(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_skill_gaps_company ON employee_skill_gaps(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_skill_gaps_status ON employee_skill_gaps(status);
CREATE INDEX IF NOT EXISTS idx_employee_skill_gaps_priority ON employee_skill_gaps(priority);
CREATE INDEX IF NOT EXISTS idx_company_values_company ON company_values(company_id);
CREATE INDEX IF NOT EXISTS idx_appraisal_value_scores_participant ON appraisal_value_scores(participant_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_skill_gaps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_employee_skill_gaps_updated_at ON employee_skill_gaps;
CREATE TRIGGER update_employee_skill_gaps_updated_at
BEFORE UPDATE ON employee_skill_gaps
FOR EACH ROW
EXECUTE FUNCTION update_skill_gaps_updated_at();

DROP TRIGGER IF EXISTS update_company_values_updated_at ON company_values;
CREATE TRIGGER update_company_values_updated_at
BEFORE UPDATE ON company_values
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appraisal_value_scores_updated_at ON appraisal_value_scores;
CREATE TRIGGER update_appraisal_value_scores_updated_at
BEFORE UPDATE ON appraisal_value_scores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();