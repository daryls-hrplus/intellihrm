-- Add scale_purpose to performance_rating_scales for filtering by module
ALTER TABLE performance_rating_scales
ADD COLUMN IF NOT EXISTS scale_purpose TEXT[] DEFAULT '{appraisal}';

COMMENT ON COLUMN performance_rating_scales.scale_purpose IS 'Array of purposes: appraisal, goals, 360_feedback, all';

-- Create overall_rating_scales table for final talent categorization
CREATE TABLE IF NOT EXISTS overall_rating_scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  levels JSONB NOT NULL DEFAULT '[]',
  has_forced_distribution BOOLEAN DEFAULT false,
  distribution_targets JSONB DEFAULT NULL,
  requires_calibration BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for code per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_overall_rating_scales_company_code ON overall_rating_scales(company_id, code);

-- Enable RLS
ALTER TABLE overall_rating_scales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view overall rating scales for their company"
  ON overall_rating_scales FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR and admins can manage overall rating scales"
  ON overall_rating_scales FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Create overall_rating_mappings table
CREATE TABLE IF NOT EXISTS overall_rating_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  overall_scale_id UUID NOT NULL REFERENCES overall_rating_scales(id) ON DELETE CASCADE,
  component_scale_id UUID NOT NULL REFERENCES performance_rating_scales(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mapping_rules JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE overall_rating_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mappings for their company"
  ON overall_rating_mappings FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR and admins can manage mappings"
  ON overall_rating_mappings FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Create calibration_sessions table
CREATE TABLE IF NOT EXISTS calibration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  appraisal_cycle_id UUID REFERENCES appraisal_cycles(id) ON DELETE SET NULL,
  overall_scale_id UUID REFERENCES overall_rating_scales(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  scheduled_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  facilitator_id UUID REFERENCES profiles(id),
  participants UUID[] DEFAULT '{}',
  calibration_rules JSONB DEFAULT NULL,
  outcome_summary TEXT,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE calibration_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view calibration sessions for their company"
  ON calibration_sessions FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR and admins can manage calibration sessions"
  ON calibration_sessions FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- Add scale references to appraisal_cycles
ALTER TABLE appraisal_cycles
ADD COLUMN IF NOT EXISTS component_scale_id UUID REFERENCES performance_rating_scales(id),
ADD COLUMN IF NOT EXISTS overall_scale_id UUID REFERENCES overall_rating_scales(id);

-- Add rating scale to review_cycles (360 feedback)
ALTER TABLE review_cycles
ADD COLUMN IF NOT EXISTS rating_scale_id UUID REFERENCES performance_rating_scales(id);

-- Create updated_at triggers
CREATE TRIGGER update_overall_rating_scales_updated_at
  BEFORE UPDATE ON overall_rating_scales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overall_rating_mappings_updated_at
  BEFORE UPDATE ON overall_rating_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calibration_sessions_updated_at
  BEFORE UPDATE ON calibration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();