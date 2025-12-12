-- Performance Goals System with OKRs, SMART Goals, and Cascading Hierarchy

-- Goal types lookup
CREATE TYPE goal_type AS ENUM ('okr_objective', 'okr_key_result', 'smart_goal');
CREATE TYPE goal_level AS ENUM ('company', 'department', 'team', 'individual');
CREATE TYPE goal_source AS ENUM ('cascaded', 'manager_assigned', 'self_created');
CREATE TYPE goal_status AS ENUM ('draft', 'active', 'in_progress', 'completed', 'cancelled', 'overdue');

-- Goal Templates for reusable goal definitions
CREATE TABLE public.goal_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_type goal_type NOT NULL DEFAULT 'smart_goal',
  category TEXT,
  default_weighting NUMERIC DEFAULT 10,
  suggested_metrics JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Performance Goals (supports OKRs and SMART goals)
CREATE TABLE public.performance_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_goal_id UUID REFERENCES public.performance_goals(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.goal_templates(id) ON DELETE SET NULL,
  
  -- Goal details
  title TEXT NOT NULL,
  description TEXT,
  goal_type goal_type NOT NULL DEFAULT 'smart_goal',
  goal_level goal_level NOT NULL DEFAULT 'individual',
  goal_source goal_source NOT NULL DEFAULT 'self_created',
  category TEXT,
  
  -- SMART criteria
  specific TEXT,
  measurable TEXT,
  achievable TEXT,
  relevant TEXT,
  time_bound TEXT,
  
  -- OKR specific fields
  is_objective BOOLEAN DEFAULT false,
  objective_id UUID REFERENCES public.performance_goals(id) ON DELETE SET NULL,
  
  -- Metrics and progress
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit_of_measure TEXT,
  progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  weighting NUMERIC DEFAULT 10 CHECK (weighting >= 0 AND weighting <= 100),
  
  -- Status and dates
  status goal_status NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  
  -- Assignment
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Scoring
  self_rating NUMERIC CHECK (self_rating >= 0 AND self_rating <= 5),
  manager_rating NUMERIC CHECK (manager_rating >= 0 AND manager_rating <= 5),
  final_score NUMERIC CHECK (final_score >= 0 AND final_score <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal Comments/Reviews
CREATE TABLE public.goal_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general', -- general, progress_update, review, feedback
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal Reviews (periodic check-ins)
CREATE TABLE public.goal_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL DEFAULT 'check_in', -- check_in, mid_year, annual, final
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_at_review NUMERIC,
  employee_comments TEXT,
  manager_comments TEXT,
  rating NUMERIC CHECK (rating >= 0 AND rating <= 5),
  status_at_review goal_status,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Goal Alignment (tracking cascading relationships)
CREATE TABLE public.goal_alignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  parent_goal_id UUID NOT NULL REFERENCES public.performance_goals(id) ON DELETE CASCADE,
  alignment_percentage NUMERIC DEFAULT 100 CHECK (alignment_percentage >= 0 AND alignment_percentage <= 100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(child_goal_id, parent_goal_id)
);

-- Indexes for performance
CREATE INDEX idx_performance_goals_company ON public.performance_goals(company_id);
CREATE INDEX idx_performance_goals_employee ON public.performance_goals(employee_id);
CREATE INDEX idx_performance_goals_department ON public.performance_goals(department_id);
CREATE INDEX idx_performance_goals_parent ON public.performance_goals(parent_goal_id);
CREATE INDEX idx_performance_goals_status ON public.performance_goals(status);
CREATE INDEX idx_performance_goals_dates ON public.performance_goals(start_date, due_date);
CREATE INDEX idx_goal_comments_goal ON public.goal_comments(goal_id);
CREATE INDEX idx_goal_reviews_goal ON public.goal_reviews(goal_id);

-- Enable RLS
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_alignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for goal_templates
CREATE POLICY "Admins can manage goal templates"
  ON public.goal_templates FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Authenticated users can view active templates"
  ON public.goal_templates FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS Policies for performance_goals
CREATE POLICY "Admins and HR can manage all goals"
  ON public.performance_goals FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view own goals"
  ON public.performance_goals FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Users can manage own goals"
  ON public.performance_goals FOR ALL
  USING (auth.uid() = employee_id);

CREATE POLICY "Users can view company/department goals"
  ON public.performance_goals FOR SELECT
  USING (goal_level IN ('company', 'department') AND auth.uid() IS NOT NULL);

-- RLS Policies for goal_comments
CREATE POLICY "Admins can manage all comments"
  ON public.goal_comments FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view comments on their goals"
  ON public.goal_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals g
      WHERE g.id = goal_comments.goal_id AND g.employee_id = auth.uid()
    )
    AND (is_private = false OR user_id = auth.uid())
  );

CREATE POLICY "Users can create comments"
  ON public.goal_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.goal_comments FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for goal_reviews
CREATE POLICY "Admins can manage all reviews"
  ON public.goal_reviews FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view reviews on their goals"
  ON public.goal_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals g
      WHERE g.id = goal_reviews.goal_id AND g.employee_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers can manage their reviews"
  ON public.goal_reviews FOR ALL
  USING (auth.uid() = reviewer_id);

-- RLS Policies for goal_alignments
CREATE POLICY "Admins can manage alignments"
  ON public.goal_alignments FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Users can view alignments for their goals"
  ON public.goal_alignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.performance_goals g
      WHERE (g.id = goal_alignments.child_goal_id OR g.id = goal_alignments.parent_goal_id)
      AND g.employee_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_goal_templates_updated_at
  BEFORE UPDATE ON public.goal_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_goals_updated_at
  BEFORE UPDATE ON public.performance_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_comments_updated_at
  BEFORE UPDATE ON public.goal_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goal_reviews_updated_at
  BEFORE UPDATE ON public.goal_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();