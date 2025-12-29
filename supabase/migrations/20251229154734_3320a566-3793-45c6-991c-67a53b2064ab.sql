-- Performance Evidence System Tables
-- Phase 1: Performance Evidence Table (Core Entity)
-- Phase 2: Skill Validation Confidence Model 
-- Phase 3: Competency Rating History
-- Phase 4: Job Family Capability Version History

-- Create evidence_type enum
DO $$ BEGIN
  CREATE TYPE evidence_type AS ENUM (
    'project', 'ticket', 'deliverable', 'customer_feedback', 
    'kpi_extract', 'document', 'presentation', 'code_contribution',
    'award', 'recognition', 'metric_achievement'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create evidence_validation_status enum
DO $$ BEGIN
  CREATE TYPE evidence_validation_status AS ENUM ('pending', 'validated', 'rejected', 'disputed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create validation_confidence enum
DO $$ BEGIN
  CREATE TYPE validation_confidence AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create validation_source_type enum
DO $$ BEGIN
  CREATE TYPE validation_source_type AS ENUM ('self', 'manager', 'training', 'assessment', 'certification', 'peer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create competency_change_type enum
DO $$ BEGIN
  CREATE TYPE competency_change_type AS ENUM ('added', 'modified', 'removed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create rating_source enum
DO $$ BEGIN
  CREATE TYPE rating_source AS ENUM ('appraisal', 'assessment', '360_review', 'calibration');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Phase 1: Performance Evidence Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.performance_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Evidence Classification
  evidence_type evidence_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  
  -- Linkages (polymorphic - can link to multiple)
  goal_id UUID REFERENCES public.performance_goals(id) ON DELETE SET NULL,
  capability_id UUID REFERENCES public.skills_competencies(id) ON DELETE SET NULL,
  responsibility_id UUID REFERENCES public.job_responsibility_kras(id) ON DELETE SET NULL,
  appraisal_cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE SET NULL,
  
  -- Source & Reference
  source_system TEXT DEFAULT 'manual',
  external_reference_id TEXT,
  external_url TEXT,
  
  -- Attachments (Lovable Cloud storage)
  attachment_path TEXT,
  attachment_type TEXT,
  attachment_size_bytes INTEGER,
  
  -- Validation
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validation_status evidence_validation_status DEFAULT 'pending',
  validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  validation_notes TEXT,
  
  -- Immutability
  is_immutable BOOLEAN DEFAULT false,
  immutable_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Phase 2: Enhance competency_evidence for validation confidence
-- ============================================
ALTER TABLE public.competency_evidence 
  ADD COLUMN IF NOT EXISTS validation_confidence validation_confidence DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS last_validated_date DATE,
  ADD COLUMN IF NOT EXISTS validation_source_type validation_source_type;

-- ============================================
-- Phase 3: Competency Rating History
-- ============================================
CREATE TABLE IF NOT EXISTS public.competency_rating_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.skills_competencies(id) ON DELETE CASCADE,
  
  -- Period Context
  appraisal_cycle_id UUID REFERENCES public.appraisal_cycles(id) ON DELETE SET NULL,
  rating_period_start DATE NOT NULL,
  rating_period_end DATE NOT NULL,
  
  -- Rating Data
  rating_level INTEGER NOT NULL,
  previous_rating_level INTEGER,
  rating_change INTEGER GENERATED ALWAYS AS (rating_level - COALESCE(previous_rating_level, rating_level)) STORED,
  
  -- Job Context (for drift analysis)
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_family_id UUID REFERENCES public.job_families(id) ON DELETE SET NULL,
  job_level TEXT,
  
  -- Aggregated Evidence
  evidence_count INTEGER DEFAULT 0,
  validation_count INTEGER DEFAULT 0,
  avg_confidence_score NUMERIC(3,2),
  
  -- Metadata
  rated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating_source rating_source,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Phase 4: Job Family Capability Version History
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_family_capability_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  job_family_id UUID NOT NULL REFERENCES public.job_families(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.skills_competencies(id) ON DELETE CASCADE,
  
  -- Version Context
  version_number INTEGER NOT NULL DEFAULT 1,
  effective_from DATE NOT NULL,
  effective_to DATE,
  
  -- Requirement State
  required_level INTEGER,
  is_required BOOLEAN DEFAULT false,
  weighting NUMERIC(3,2),
  
  -- Change Tracking
  change_type competency_change_type,
  change_reason TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_performance_evidence_employee ON public.performance_evidence(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_evidence_goal ON public.performance_evidence(goal_id);
CREATE INDEX IF NOT EXISTS idx_performance_evidence_capability ON public.performance_evidence(capability_id);
CREATE INDEX IF NOT EXISTS idx_performance_evidence_cycle ON public.performance_evidence(appraisal_cycle_id);
CREATE INDEX IF NOT EXISTS idx_performance_evidence_status ON public.performance_evidence(validation_status);
CREATE INDEX IF NOT EXISTS idx_performance_evidence_submitted_at ON public.performance_evidence(submitted_at);

CREATE INDEX IF NOT EXISTS idx_competency_rating_history_employee ON public.competency_rating_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_competency_rating_history_capability ON public.competency_rating_history(capability_id);
CREATE INDEX IF NOT EXISTS idx_competency_rating_history_cycle ON public.competency_rating_history(appraisal_cycle_id);
CREATE INDEX IF NOT EXISTS idx_competency_rating_history_period ON public.competency_rating_history(rating_period_start, rating_period_end);

CREATE INDEX IF NOT EXISTS idx_job_family_capability_history_family ON public.job_family_capability_history(job_family_id);
CREATE INDEX IF NOT EXISTS idx_job_family_capability_history_capability ON public.job_family_capability_history(capability_id);
CREATE INDEX IF NOT EXISTS idx_job_family_capability_history_effective ON public.job_family_capability_history(effective_from, effective_to);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE public.performance_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competency_rating_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_family_capability_history ENABLE ROW LEVEL SECURITY;

-- Performance Evidence Policies
CREATE POLICY "Users can view own evidence" ON public.performance_evidence
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "HR can view company evidence" ON public.performance_evidence
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'hr_manager'))
  );

CREATE POLICY "Users can insert own evidence" ON public.performance_evidence
  FOR INSERT WITH CHECK (
    employee_id = auth.uid() OR 
    submitted_by = auth.uid() OR
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "Users can update evidence before immutable" ON public.performance_evidence
  FOR UPDATE USING (
    is_immutable = false AND (
      employee_id = auth.uid() OR 
      submitted_by = auth.uid() OR
      validated_by = auth.uid() OR
      has_role(auth.uid(), 'admin') OR 
      has_role(auth.uid(), 'hr_manager')
    )
  );

-- Competency Rating History Policies
CREATE POLICY "Users can view own rating history" ON public.competency_rating_history
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "HR can view all rating history" ON public.competency_rating_history
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'hr_manager')
  );

CREATE POLICY "HR can manage rating history" ON public.competency_rating_history
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'hr_manager')
  );

-- Job Family Capability History Policies
CREATE POLICY "Users can view capability history" ON public.job_family_capability_history
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "HR can manage capability history" ON public.job_family_capability_history
  FOR ALL USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'hr_manager')
  );

-- ============================================
-- Triggers
-- ============================================
CREATE OR REPLACE FUNCTION public.update_performance_evidence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_performance_evidence_updated_at ON public.performance_evidence;
CREATE TRIGGER update_performance_evidence_updated_at
  BEFORE UPDATE ON public.performance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_performance_evidence_updated_at();

-- Prevent updates to immutable evidence
CREATE OR REPLACE FUNCTION public.prevent_immutable_evidence_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_immutable = true AND NEW.is_immutable = true THEN
    IF NEW.title != OLD.title OR 
       NEW.description IS DISTINCT FROM OLD.description OR
       NEW.evidence_type != OLD.evidence_type OR
       NEW.external_url IS DISTINCT FROM OLD.external_url THEN
      RAISE EXCEPTION 'Cannot modify immutable evidence';
    END IF;
  END IF;
  
  IF OLD.is_immutable = false AND NEW.is_immutable = true THEN
    NEW.immutable_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prevent_immutable_evidence_update ON public.performance_evidence;
CREATE TRIGGER prevent_immutable_evidence_update
  BEFORE UPDATE ON public.performance_evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_immutable_evidence_update();