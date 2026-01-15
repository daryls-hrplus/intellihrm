-- Phase 1: Database Schema Enhancement for Database-First SSOT

-- 1. Create implementation_tasks table to hold handbook task definitions
-- This replaces the hardcoded implementationMappings.ts data
CREATE TABLE public.implementation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  area TEXT NOT NULL,
  description TEXT,
  feature_code TEXT, -- References application_features.feature_code (soft reference for flexibility)
  admin_route TEXT, -- Legacy fallback during migration
  import_type TEXT,
  is_required BOOLEAN DEFAULT false,
  estimated_minutes INTEGER DEFAULT 15,
  sub_section TEXT,
  source_manual TEXT,
  source_section TEXT,
  is_global BOOLEAN DEFAULT false,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(phase_id, step_order)
);

-- 2. Add validation columns to application_features
ALTER TABLE public.application_features 
ADD COLUMN IF NOT EXISTS route_validated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS route_validated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS route_validation_source TEXT; -- 'app_tsx', 'manual', 'auto'

-- 3. Create route_validation_log table for audit trail
CREATE TABLE public.route_validation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  validation_run_id UUID NOT NULL,
  feature_code TEXT NOT NULL,
  route_path TEXT,
  validation_status TEXT NOT NULL, -- 'valid', 'invalid', 'orphan', 'missing'
  validation_message TEXT,
  validated_at TIMESTAMPTZ DEFAULT now(),
  validated_by UUID REFERENCES auth.users(id)
);

-- 4. Enable RLS on new tables
ALTER TABLE public.implementation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_validation_log ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for implementation_tasks (read by all authenticated, write by admin)
CREATE POLICY "Authenticated users can read implementation tasks"
ON public.implementation_tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage implementation tasks"
ON public.implementation_tasks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. RLS Policies for route_validation_log
CREATE POLICY "Authenticated users can read validation logs"
ON public.route_validation_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage validation logs"
ON public.route_validation_log FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. Create updated_at trigger for implementation_tasks
CREATE TRIGGER update_implementation_tasks_updated_at
BEFORE UPDATE ON public.implementation_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Create index for common queries
CREATE INDEX idx_implementation_tasks_phase ON public.implementation_tasks(phase_id);
CREATE INDEX idx_implementation_tasks_feature_code ON public.implementation_tasks(feature_code);
CREATE INDEX idx_route_validation_log_run ON public.route_validation_log(validation_run_id);
CREATE INDEX idx_route_validation_log_feature ON public.route_validation_log(feature_code);