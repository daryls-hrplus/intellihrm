-- =====================================================
-- IMPLEMENTATION TRACKING SCHEMA FOR HRPLUS
-- Phase 1: Client-side tracking tables
-- =====================================================

-- 1. Module Implementations - tracks which modules are being implemented
CREATE TABLE public.module_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.application_modules(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  implementation_order INTEGER DEFAULT 1,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  target_go_live DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, company_id)
);

-- 2. Feature Implementations - dual tracking for tours vs implementation
CREATE TABLE public.feature_implementations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_impl_id UUID NOT NULL REFERENCES public.module_implementations(id) ON DELETE CASCADE,
  feature_id UUID NOT NULL REFERENCES public.application_features(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES public.enablement_tours(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  implementation_order INTEGER DEFAULT 1,
  
  -- Tour tracking (auto-flagged by trigger when tour completed)
  tour_watched BOOLEAN DEFAULT false,
  tour_completed_at TIMESTAMPTZ,
  tour_completed_by UUID REFERENCES public.profiles(id),
  
  -- Implementation tracking (manual by client user)
  impl_complete BOOLEAN DEFAULT false,
  impl_completed_at TIMESTAMPTZ,
  impl_completed_by UUID REFERENCES public.profiles(id),
  
  -- If client wants to unflag
  impl_uncompleted_at TIMESTAMPTZ,
  impl_uncompleted_by UUID REFERENCES public.profiles(id),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_impl_id, feature_id)
);

-- 3. Feature Implementation Tasks - standard and custom tasks per feature
CREATE TABLE public.feature_implementation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.application_features(id) ON DELETE CASCADE,
  task_order INTEGER DEFAULT 1,
  task_name TEXT NOT NULL,
  task_description TEXT,
  is_required BOOLEAN DEFAULT true,
  is_standard BOOLEAN DEFAULT true, -- true = pre-defined global, false = custom per client
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE, -- NULL for standard tasks
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Feature Implementation Task Progress - client marks task completion
CREATE TABLE public.feature_impl_task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_impl_id UUID NOT NULL REFERENCES public.feature_implementations(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.feature_implementation_tasks(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id),
  
  -- Track if unflagged (for audit trail)
  uncompleted_at TIMESTAMPTZ,
  uncompleted_by UUID REFERENCES public.profiles(id),
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(feature_impl_id, task_id)
);

-- =====================================================
-- TRIGGER: Auto-flag tour_watched when tour completed
-- =====================================================

CREATE OR REPLACE FUNCTION public.auto_flag_tour_watched()
RETURNS TRIGGER AS $$
BEGIN
  -- When a tour is marked as completed
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR TG_OP = 'INSERT') THEN
    UPDATE public.feature_implementations fi
    SET 
      tour_watched = true,
      tour_completed_at = NEW.completed_at,
      tour_completed_by = NEW.user_id,
      updated_at = now()
    FROM public.enablement_tours et
    WHERE fi.tour_id = et.id
      AND et.id = NEW.tour_id
      AND (fi.company_id = NEW.company_id OR (fi.company_id IS NULL AND NEW.company_id IS NULL));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on enablement_tour_completions
CREATE TRIGGER on_tour_completion_auto_flag
AFTER INSERT OR UPDATE ON public.enablement_tour_completions
FOR EACH ROW
EXECUTE FUNCTION public.auto_flag_tour_watched();

-- =====================================================
-- INDEXES for performance
-- =====================================================

CREATE INDEX idx_module_impl_company ON public.module_implementations(company_id);
CREATE INDEX idx_module_impl_status ON public.module_implementations(status);
CREATE INDEX idx_feature_impl_module ON public.feature_implementations(module_impl_id);
CREATE INDEX idx_feature_impl_company ON public.feature_implementations(company_id);
CREATE INDEX idx_feature_impl_tour ON public.feature_implementations(tour_id);
CREATE INDEX idx_feature_impl_tasks_feature ON public.feature_implementation_tasks(feature_id);
CREATE INDEX idx_feature_impl_tasks_company ON public.feature_implementation_tasks(company_id);
CREATE INDEX idx_task_progress_feature_impl ON public.feature_impl_task_progress(feature_impl_id);
CREATE INDEX idx_task_progress_company ON public.feature_impl_task_progress(company_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.module_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_implementation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_impl_task_progress ENABLE ROW LEVEL SECURITY;

-- Module Implementations policies
CREATE POLICY "Users can view their company module implementations"
  ON public.module_implementations FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins and HR can manage module implementations"
  ON public.module_implementations FOR ALL
  USING (
    has_role(auth.uid(), 'admin') 
    OR has_role(auth.uid(), 'hr_manager')
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- Feature Implementations policies
CREATE POLICY "Users can view their company feature implementations"
  ON public.feature_implementations FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can update their company feature implementations"
  ON public.feature_implementations FOR UPDATE
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can insert feature implementations"
  ON public.feature_implementations FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'hr_manager')
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete feature implementations"
  ON public.feature_implementations FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Feature Implementation Tasks policies (standard tasks are global, custom are per company)
CREATE POLICY "Anyone can view standard tasks or their company custom tasks"
  ON public.feature_implementation_tasks FOR SELECT
  USING (
    company_id IS NULL -- Standard tasks visible to all
    OR company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can manage all tasks"
  ON public.feature_implementation_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create custom tasks for their company"
  ON public.feature_implementation_tasks FOR INSERT
  WITH CHECK (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- Task Progress policies
CREATE POLICY "Users can view their company task progress"
  ON public.feature_impl_task_progress FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can manage their company task progress"
  ON public.feature_impl_task_progress FOR ALL
  USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER update_module_implementations_updated_at
  BEFORE UPDATE ON public.module_implementations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_implementations_updated_at
  BEFORE UPDATE ON public.feature_implementations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_implementation_tasks_updated_at
  BEFORE UPDATE ON public.feature_implementation_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_impl_task_progress_updated_at
  BEFORE UPDATE ON public.feature_impl_task_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();