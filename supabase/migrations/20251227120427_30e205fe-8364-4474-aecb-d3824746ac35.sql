-- Goal AI Analyses Table - Stores AI-powered goal analysis results
CREATE TABLE public.goal_ai_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Quality Analysis
  ai_quality_score INTEGER,
  clarity_score INTEGER,
  specificity_score INTEGER,
  measurability_score INTEGER,
  achievability_score INTEGER,
  relevance_score INTEGER,
  
  -- Improvement Suggestions
  improvement_suggestions JSONB DEFAULT '[]'::jsonb,
  ai_reasoning TEXT,
  
  -- Duplicate Detection
  similar_goals JSONB DEFAULT '[]'::jsonb,
  similarity_warning BOOLEAN DEFAULT FALSE,
  
  -- Skill Gap Analysis
  inferred_skills TEXT[] DEFAULT '{}',
  skill_gaps JSONB DEFAULT '[]'::jsonb,
  
  -- Metric Template Suggestion
  suggested_templates JSONB DEFAULT '[]'::jsonb,
  
  -- Risk Assessment
  completion_risk_level TEXT CHECK (completion_risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  model_used TEXT,
  confidence_score NUMERIC(3, 2),
  tokens_used INTEGER,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal Skill Requirements Table - AI-inferred skill requirements per goal
CREATE TABLE public.goal_skill_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  proficiency_level TEXT CHECK (proficiency_level IN ('basic', 'intermediate', 'advanced', 'expert')),
  is_gap BOOLEAN DEFAULT FALSE,
  recommended_training_ids UUID[] DEFAULT '{}',
  ai_confidence NUMERIC(3, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal Notification Preferences Table - User preferences for goal notifications
CREATE TABLE public.goal_notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Notification Settings
  check_in_reminders BOOLEAN DEFAULT TRUE,
  overdue_alerts BOOLEAN DEFAULT TRUE,
  risk_alerts BOOLEAN DEFAULT TRUE,
  manager_review_requests BOOLEAN DEFAULT TRUE,
  goal_updates BOOLEAN DEFAULT TRUE,
  coaching_suggestions BOOLEAN DEFAULT TRUE,
  
  -- Timing Preferences
  reminder_days_before INTEGER DEFAULT 1,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('immediate', 'daily', 'weekly', 'none')),
  
  -- Channels
  in_app_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, company_id)
);

-- Goal AI Coaching Nudges Table - AI-generated coaching suggestions for managers
CREATE TABLE public.goal_coaching_nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL,
  employee_id UUID,
  goal_id UUID REFERENCES public.performance_goals(id) ON DELETE SET NULL,
  
  -- Nudge Content
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('check_in_reminder', 'progress_concern', 'recognition_opportunity', 'development_suggestion', 'workload_warning', 'goal_quality', 'alignment_gap')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  suggested_action TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'acted', 'dismissed')),
  viewed_at TIMESTAMP WITH TIME ZONE,
  acted_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- AI Metadata
  ai_reasoning TEXT,
  confidence_score NUMERIC(3, 2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_goal_ai_analyses_goal_id ON public.goal_ai_analyses(goal_id);
CREATE INDEX idx_goal_ai_analyses_company_id ON public.goal_ai_analyses(company_id);
CREATE INDEX idx_goal_skill_requirements_goal_id ON public.goal_skill_requirements(goal_id);
CREATE INDEX idx_goal_notification_preferences_user ON public.goal_notification_preferences(user_id);
CREATE INDEX idx_goal_coaching_nudges_manager ON public.goal_coaching_nudges(manager_id, status);
CREATE INDEX idx_goal_coaching_nudges_employee ON public.goal_coaching_nudges(employee_id);

-- Enable RLS
ALTER TABLE public.goal_ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_coaching_nudges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_ai_analyses
CREATE POLICY "Users can view AI analyses for their company" 
ON public.goal_ai_analyses 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "System can insert AI analyses" 
ON public.goal_ai_analyses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update AI analyses" 
ON public.goal_ai_analyses 
FOR UPDATE 
USING (true);

-- RLS Policies for goal_skill_requirements
CREATE POLICY "Users can view skill requirements for their company" 
ON public.goal_skill_requirements 
FOR SELECT 
USING (
  company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "System can manage skill requirements" 
ON public.goal_skill_requirements 
FOR ALL 
USING (true);

-- RLS Policies for goal_notification_preferences
CREATE POLICY "Users can view their own notification preferences" 
ON public.goal_notification_preferences 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notification preferences" 
ON public.goal_notification_preferences 
FOR ALL 
USING (user_id = auth.uid());

-- RLS Policies for goal_coaching_nudges
CREATE POLICY "Managers can view their coaching nudges" 
ON public.goal_coaching_nudges 
FOR SELECT 
USING (manager_id = auth.uid());

CREATE POLICY "Managers can update their coaching nudges" 
ON public.goal_coaching_nudges 
FOR UPDATE 
USING (manager_id = auth.uid());

CREATE POLICY "System can manage coaching nudges" 
ON public.goal_coaching_nudges 
FOR INSERT 
WITH CHECK (true);

-- Add trigger for updated_at timestamps
CREATE TRIGGER update_goal_ai_analyses_updated_at
BEFORE UPDATE ON public.goal_ai_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_skill_requirements_updated_at
BEFORE UPDATE ON public.goal_skill_requirements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_notification_preferences_updated_at
BEFORE UPDATE ON public.goal_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();