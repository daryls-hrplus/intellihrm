-- Create workflow_delegations table
CREATE TABLE IF NOT EXISTS workflow_delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  delegate_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  is_active boolean DEFAULT true,
  template_categories text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE workflow_delegations ENABLE ROW LEVEL SECURITY;

-- RLS policies for delegations
CREATE POLICY "Users can view their own delegations"
ON workflow_delegations FOR SELECT
USING (auth.uid() = delegator_id OR auth.uid() = delegate_id);

CREATE POLICY "Users can insert their own delegations"
ON workflow_delegations FOR INSERT
WITH CHECK (auth.uid() = delegator_id);

CREATE POLICY "Users can update their own delegations"
ON workflow_delegations FOR UPDATE
USING (auth.uid() = delegator_id);

CREATE POLICY "Users can delete their own delegations"
ON workflow_delegations FOR DELETE
USING (auth.uid() = delegator_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_delegations_delegator ON workflow_delegations(delegator_id);
CREATE INDEX IF NOT EXISTS idx_workflow_delegations_delegate ON workflow_delegations(delegate_id);
CREATE INDEX IF NOT EXISTS idx_workflow_delegations_active ON workflow_delegations(is_active, start_date, end_date);