-- Phase 2: Industry Parity Features

-- 1. Performance Trajectory Prediction Table
CREATE TABLE IF NOT EXISTS public.performance_trajectory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_score DECIMAL(4,2),
  predicted_score_3m DECIMAL(4,2),
  predicted_score_6m DECIMAL(4,2),
  predicted_score_12m DECIMAL(4,2),
  confidence_level DECIMAL(3,2),
  trend_direction VARCHAR(20) CHECK (trend_direction IN ('improving', 'stable', 'declining', 'volatile')),
  factors JSONB DEFAULT '{}',
  data_points_used INTEGER DEFAULT 0,
  model_version VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.performance_trajectory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trajectory" ON public.performance_trajectory
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can view all trajectories" ON public.performance_trajectory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin', 'enablement_admin')
    )
  );

CREATE POLICY "Admins can manage trajectories" ON public.performance_trajectory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin')
    )
  );

-- 2. Intervention Triggers Configuration
CREATE TABLE IF NOT EXISTS public.intervention_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  trigger_name VARCHAR(100) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('performance_drop', 'feedback_negative', 'goal_stall', 'missed_checkin', 'attendance_pattern', 'skill_gap')),
  description TEXT,
  threshold_value DECIMAL(5,2),
  threshold_period_days INTEGER DEFAULT 30,
  comparison_operator VARCHAR(10) DEFAULT '<' CHECK (comparison_operator IN ('<', '<=', '>', '>=', '=')),
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('notify_manager', 'notify_hr', 'create_pip', 'schedule_meeting', 'assign_mentor', 'recommend_training', 'flag_for_review')),
  action_config JSONB DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE public.intervention_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage intervention triggers" ON public.intervention_triggers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin')
    )
  );

-- 3. Intervention Alerts (triggered instances)
CREATE TABLE IF NOT EXISTS public.intervention_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id UUID NOT NULL REFERENCES intervention_triggers(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  detected_at TIMESTAMPTZ DEFAULT now(),
  trigger_data JSONB DEFAULT '{}',
  current_value DECIMAL(5,2),
  threshold_value DECIMAL(5,2),
  severity VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'dismissed', 'escalated')),
  action_taken VARCHAR(50),
  action_taken_at TIMESTAMPTZ,
  action_notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.intervention_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.intervention_alerts
  FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Admins can view all alerts" ON public.intervention_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin', 'enablement_admin')
    )
  );

CREATE POLICY "Admins can manage alerts" ON public.intervention_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin')
    )
  );

-- 4. Reflection Templates
CREATE TABLE IF NOT EXISTS public.reflection_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) CHECK (category IN ('achievements', 'challenges', 'growth', 'aspirations', 'feedback', 'goals', 'general')),
  prompts JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE public.reflection_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" ON public.reflection_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage templates" ON public.reflection_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin')
    )
  );

-- 5. Add self-reflection columns to appraisal_participants
ALTER TABLE public.appraisal_participants 
  ADD COLUMN IF NOT EXISTS self_reflection JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS career_aspirations TEXT,
  ADD COLUMN IF NOT EXISTS development_interests TEXT[],
  ADD COLUMN IF NOT EXISTS reflection_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reflection_template_id UUID REFERENCES reflection_templates(id);

-- 6. Manager Effectiveness Scores
CREATE TABLE IF NOT EXISTS public.manager_effectiveness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  avg_team_rating DECIMAL(3,2),
  team_rating_change DECIMAL(3,2),
  team_size INTEGER DEFAULT 0,
  feedback_frequency_score DECIMAL(3,2),
  feedback_quality_score DECIMAL(3,2),
  avg_feedback_per_employee DECIMAL(4,2),
  goal_completion_rate DECIMAL(3,2),
  team_goal_alignment_score DECIMAL(3,2),
  team_development_score DECIMAL(3,2),
  training_completion_rate DECIMAL(3,2),
  team_retention_rate DECIMAL(3,2),
  team_engagement_score DECIMAL(3,2),
  appraisal_completion_rate DECIMAL(3,2),
  avg_appraisal_delay_days DECIMAL(4,1),
  overall_score DECIMAL(3,2),
  score_trend VARCHAR(20) CHECK (score_trend IN ('improving', 'stable', 'declining')),
  ai_insights JSONB DEFAULT '{}',
  improvement_recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manager_id, period_start, period_end)
);

ALTER TABLE public.manager_effectiveness_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view own scores" ON public.manager_effectiveness_scores
  FOR SELECT USING (auth.uid() = manager_id);

CREATE POLICY "Admins can manage scores" ON public.manager_effectiveness_scores
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('system_admin', 'admin')
    )
  );

-- Insert default reflection templates
INSERT INTO public.reflection_templates (name, category, prompts, is_default, display_order) VALUES
  ('Achievement Reflection', 'achievements', '[{"id": "1", "prompt": "What accomplishments are you most proud of this period?", "type": "text"}, {"id": "2", "prompt": "How did you contribute to team or company goals?", "type": "text"}, {"id": "3", "prompt": "What new skills or knowledge did you apply successfully?", "type": "text"}]', true, 1),
  ('Challenges & Growth', 'challenges', '[{"id": "1", "prompt": "What challenges did you face and how did you overcome them?", "type": "text"}, {"id": "2", "prompt": "What would you do differently if you could go back?", "type": "text"}, {"id": "3", "prompt": "What support do you need to be more successful?", "type": "text"}]', true, 2),
  ('Career Aspirations', 'aspirations', '[{"id": "1", "prompt": "Where do you see yourself in the next 1-2 years?", "type": "text"}, {"id": "2", "prompt": "What skills would you like to develop?", "type": "multiselect", "options": ["Leadership", "Technical", "Communication", "Project Management", "Strategic Thinking", "Innovation"]}, {"id": "3", "prompt": "What type of projects or responsibilities interest you?", "type": "text"}, {"id": "4", "prompt": "Are you interested in a different role or department?", "type": "boolean"}]', true, 3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_trajectory_employee ON public.performance_trajectory(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_trajectory_date ON public.performance_trajectory(prediction_date);
CREATE INDEX IF NOT EXISTS idx_intervention_alerts_employee ON public.intervention_alerts(employee_id);
CREATE INDEX IF NOT EXISTS idx_intervention_alerts_status ON public.intervention_alerts(status);
CREATE INDEX IF NOT EXISTS idx_manager_effectiveness_manager ON public.manager_effectiveness_scores(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_effectiveness_period ON public.manager_effectiveness_scores(period_start, period_end);