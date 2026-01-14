-- Phase 1: Industry-Aligned Appraisal Form Template Enhancement
-- Creates section configuration, phase timeline, and versioning support

-- 1.1 Create appraisal_template_sections table for per-section behavior metadata
CREATE TABLE public.appraisal_template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.appraisal_form_templates(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Scoring Behavior
  scoring_method TEXT NOT NULL DEFAULT 'numeric',
  include_in_final_score BOOLEAN NOT NULL DEFAULT true,
  weight NUMERIC NOT NULL DEFAULT 0,
  
  -- Data Configuration
  data_source TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  
  -- Visibility
  visible_to_employee BOOLEAN NOT NULL DEFAULT true,
  visible_to_manager BOOLEAN NOT NULL DEFAULT true,
  visible_to_hr BOOLEAN NOT NULL DEFAULT true,
  
  -- 360 Specific
  is_advisory_only BOOLEAN NOT NULL DEFAULT true,
  advisory_label TEXT DEFAULT 'Informs manager judgment',
  max_weight_cap NUMERIC,
  
  -- DATE-DRIVEN: Section-level deadline offsets
  deadline_offset_days INTEGER DEFAULT 0,
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 3, 1],
  
  -- AI interpretation
  ai_interpretation_hint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appraisal_template_sections_template ON public.appraisal_template_sections(template_id);
CREATE INDEX idx_appraisal_template_sections_type ON public.appraisal_template_sections(section_type);

-- 1.2 Create appraisal_template_phases table for phase timeline configuration
CREATE TABLE public.appraisal_template_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.appraisal_form_templates(id) ON DELETE CASCADE,
  phase_type TEXT NOT NULL,
  phase_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- DATE-DRIVEN: Timing configuration
  start_offset_days INTEGER NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 14,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  
  -- Dependencies
  depends_on_phase_id UUID REFERENCES public.appraisal_template_phases(id),
  allow_parallel BOOLEAN NOT NULL DEFAULT false,
  
  -- Automation
  auto_advance BOOLEAN NOT NULL DEFAULT false,
  advance_condition TEXT,
  
  -- Notifications
  notify_on_start BOOLEAN NOT NULL DEFAULT true,
  notify_on_deadline BOOLEAN NOT NULL DEFAULT true,
  reminder_intervals INTEGER[] DEFAULT ARRAY[7, 3, 1],
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_appraisal_template_phases_template ON public.appraisal_template_phases(template_id);
CREATE INDEX idx_appraisal_template_phases_type ON public.appraisal_template_phases(phase_type);

-- 1.3 Extend appraisal_form_templates table with versioning and date defaults
ALTER TABLE public.appraisal_form_templates 
  ADD COLUMN IF NOT EXISTS version_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS version_notes TEXT,
  ADD COLUMN IF NOT EXISTS is_draft BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS applicable_cycle_types TEXT[] DEFAULT ARRAY['annual'],
  ADD COLUMN IF NOT EXISTS weight_enforcement TEXT NOT NULL DEFAULT 'strict',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cloned_from_id UUID REFERENCES public.appraisal_form_templates(id),
  ADD COLUMN IF NOT EXISTS cloned_from_version INTEGER,
  ADD COLUMN IF NOT EXISTS default_duration_days INTEGER DEFAULT 365,
  ADD COLUMN IF NOT EXISTS default_evaluation_offset_days INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS default_grace_period_days INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS auto_calculate_dates BOOLEAN DEFAULT true;

-- Enable RLS on new tables
ALTER TABLE public.appraisal_template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_template_phases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appraisal_template_sections (using user_roles table)
CREATE POLICY "Users can view template sections for their company"
  ON public.appraisal_template_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appraisal_form_templates t
      JOIN public.profiles p ON p.company_id = t.company_id
      WHERE t.id = template_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.appraisal_form_templates t
      WHERE t.id = template_id AND t.company_id IS NULL
    )
  );

CREATE POLICY "HR can manage template sections"
  ON public.appraisal_template_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.appraisal_form_templates t
      JOIN public.profiles p ON p.company_id = t.company_id
      JOIN public.user_roles ur ON ur.user_id = p.id
      JOIN public.roles r ON r.id = ur.role_id
      WHERE t.id = template_id 
        AND p.id = auth.uid() 
        AND r.code IN ('admin', 'hr_director', 'hr_manager', 'super_admin')
    )
  );

-- RLS Policies for appraisal_template_phases
CREATE POLICY "Users can view template phases for their company"
  ON public.appraisal_template_phases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.appraisal_form_templates t
      JOIN public.profiles p ON p.company_id = t.company_id
      WHERE t.id = template_id AND p.id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.appraisal_form_templates t
      WHERE t.id = template_id AND t.company_id IS NULL
    )
  );

CREATE POLICY "HR can manage template phases"
  ON public.appraisal_template_phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.appraisal_form_templates t
      JOIN public.profiles p ON p.company_id = t.company_id
      JOIN public.user_roles ur ON ur.user_id = p.id
      JOIN public.roles r ON r.id = ur.role_id
      WHERE t.id = template_id 
        AND p.id = auth.uid() 
        AND r.code IN ('admin', 'hr_director', 'hr_manager', 'super_admin')
    )
  );

-- Create updated_at triggers for new tables
CREATE TRIGGER update_appraisal_template_sections_updated_at
  BEFORE UPDATE ON public.appraisal_template_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appraisal_template_phases_updated_at
  BEFORE UPDATE ON public.appraisal_template_phases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();