-- Implementation Step Progress - tracks step-level completion for handbook
CREATE TABLE implementation_step_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  phase_id TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id),
  uncompleted_at TIMESTAMPTZ,
  uncompleted_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, phase_id, step_order)
);

-- Enable RLS
ALTER TABLE implementation_step_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view progress for their company"
  ON implementation_step_progress FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert progress for their company"
  ON implementation_step_progress FOR INSERT
  WITH CHECK (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update progress for their company"
  ON implementation_step_progress FOR UPDATE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete progress for their company"
  ON implementation_step_progress FOR DELETE
  USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Index for faster lookups
CREATE INDEX idx_implementation_step_progress_company_phase 
  ON implementation_step_progress(company_id, phase_id);

-- Trigger for updated_at
CREATE TRIGGER update_implementation_step_progress_updated_at
  BEFORE UPDATE ON implementation_step_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();