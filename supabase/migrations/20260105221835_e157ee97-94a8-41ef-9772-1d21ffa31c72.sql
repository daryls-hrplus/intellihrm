-- Workflow Audit Trail Enhancement - Create table first
CREATE TABLE IF NOT EXISTS workflow_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_instance_id uuid REFERENCES workflow_instances(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  step_id uuid REFERENCES workflow_steps(id),
  actor_id uuid REFERENCES profiles(id),
  actor_role text,
  previous_status text,
  new_status text,
  comment text,
  metadata jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workflow_audit_events ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit events
CREATE POLICY "Users can view audit events for their workflows"
ON workflow_audit_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM workflow_instances wi
    WHERE wi.id = workflow_instance_id
    AND wi.initiated_by = auth.uid()
  )
  OR
  actor_id = auth.uid()
);

-- Workflow Analytics Snapshots
CREATE TABLE IF NOT EXISTS workflow_analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  template_id uuid REFERENCES workflow_templates(id) ON DELETE CASCADE,
  total_submitted integer DEFAULT 0,
  total_approved integer DEFAULT 0,
  total_rejected integer DEFAULT 0,
  total_pending integer DEFAULT 0,
  avg_completion_hours numeric,
  avg_approval_hours_per_step jsonb DEFAULT '{}',
  sla_compliance_rate numeric,
  bottleneck_step_id uuid REFERENCES workflow_steps(id),
  top_rejectors jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, snapshot_date, template_id)
);

ALTER TABLE workflow_analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics visible to authenticated users"
ON workflow_analytics_snapshots FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Parallel Approvals Configuration
ALTER TABLE workflow_steps
ADD COLUMN IF NOT EXISTS is_parallel boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS parallel_approval_mode text DEFAULT 'all',
ADD COLUMN IF NOT EXISTS parallel_approver_count integer DEFAULT 1;

-- Conditional Routing Rules
CREATE TABLE IF NOT EXISTS workflow_routing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid REFERENCES workflow_steps(id) ON DELETE CASCADE NOT NULL,
  rule_name text NOT NULL,
  condition_field text NOT NULL,
  condition_operator text NOT NULL,
  condition_value text NOT NULL,
  target_step_id uuid REFERENCES workflow_steps(id) ON DELETE SET NULL,
  skip_to_end boolean DEFAULT false,
  priority integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflow_routing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Routing rules visible to authenticated users"
ON workflow_routing_rules FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_audit_events_instance ON workflow_audit_events(workflow_instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_audit_events_created ON workflow_audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_date ON workflow_analytics_snapshots(snapshot_date DESC);