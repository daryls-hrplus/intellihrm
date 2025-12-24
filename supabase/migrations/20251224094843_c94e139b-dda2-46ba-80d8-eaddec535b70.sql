-- 1. Extend goal_status enum with new values
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'adjusted';
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'archived';

-- 2. Create goal_locking_rules table for configurable locking behavior
CREATE TABLE IF NOT EXISTS goal_locking_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('on_approval', 'on_cycle_freeze', 'on_status_change', 'manual_only')),
  trigger_status TEXT[], -- e.g., ['approved', 'completed']
  allow_admin_override BOOLEAN DEFAULT true,
  allow_adjustment_request BOOLEAN DEFAULT true,
  lock_fields TEXT[], -- specific fields to lock, null means all
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, name)
);

-- Enable RLS
ALTER TABLE goal_locking_rules ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view goal locking rules for their company"
  ON goal_locking_rules FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "HR/Admin can manage goal locking rules"
  ON goal_locking_rules FOR ALL
  USING (
    company_id IN (
      SELECT p.company_id FROM profiles p
      JOIN user_roles ur ON ur.user_id = p.id
      JOIN roles r ON r.id = ur.role_id
      WHERE p.id = auth.uid() AND r.name IN ('HR Admin', 'Super Admin', 'System Administrator')
    )
  );

-- 3. Create function to auto-lock goals based on rules
CREATE OR REPLACE FUNCTION check_goal_locking_rules()
RETURNS TRIGGER AS $$
DECLARE
  locking_rule RECORD;
  should_lock BOOLEAN := false;
BEGIN
  -- Check if goal is already locked
  IF OLD.is_locked = true AND NEW.is_locked = true THEN
    -- If locked and not being unlocked by admin, prevent changes to key fields
    IF NEW.name != OLD.name OR NEW.description != OLD.description OR 
       NEW.target_value != OLD.target_value OR NEW.weighting != OLD.weighting THEN
      RAISE EXCEPTION 'Goal is locked and cannot be modified';
    END IF;
  END IF;

  -- Check for applicable locking rules
  FOR locking_rule IN
    SELECT * FROM goal_locking_rules 
    WHERE company_id = NEW.company_id 
    AND is_active = true
    ORDER BY priority DESC
  LOOP
    -- Check on_approval rule
    IF locking_rule.rule_type = 'on_approval' AND 
       NEW.status::text = 'approved' AND OLD.status::text != 'approved' THEN
      should_lock := true;
    END IF;

    -- Check on_status_change rule
    IF locking_rule.rule_type = 'on_status_change' AND 
       locking_rule.trigger_status IS NOT NULL AND
       NEW.status::text = ANY(locking_rule.trigger_status) THEN
      should_lock := true;
    END IF;
  END LOOP;

  -- Apply locking if needed
  IF should_lock AND NOT NEW.is_locked THEN
    NEW.is_locked := true;
    NEW.locked_at := now();
    NEW.lock_reason := 'Auto-locked by system rule';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for goal locking
DROP TRIGGER IF EXISTS trigger_check_goal_locking ON performance_goals;
CREATE TRIGGER trigger_check_goal_locking
  BEFORE UPDATE ON performance_goals
  FOR EACH ROW
  EXECUTE FUNCTION check_goal_locking_rules();

-- 4. Create function to auto-lock goals when cycle freeze date is reached
CREATE OR REPLACE FUNCTION lock_goals_on_cycle_freeze()
RETURNS void AS $$
BEGIN
  -- Lock all goals in cycles that have reached their freeze date
  UPDATE performance_goals pg
  SET 
    is_locked = true,
    locked_at = now(),
    lock_reason = 'Auto-locked: Cycle freeze date reached'
  FROM goal_cycles gc
  WHERE pg.goal_cycle_id = gc.id
    AND gc.freeze_date <= CURRENT_DATE
    AND gc.is_active = true
    AND pg.is_locked = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Update goal status on approval completion
CREATE OR REPLACE FUNCTION update_goal_status_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When all approvals are complete, update goal status to 'approved'
  IF NEW.current_step > (
    SELECT MAX(step_order) FROM goal_approval_chain 
    WHERE rule_id = (SELECT rule_id FROM goal_approvals WHERE id = NEW.id LIMIT 1)
  ) THEN
    UPDATE performance_goals
    SET status = 'approved'::goal_status,
        approved_at = now(),
        approved_by = NEW.current_approver_id
    WHERE id = NEW.goal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for approval status update
DROP TRIGGER IF EXISTS trigger_update_goal_on_approval ON goal_approvals;
CREATE TRIGGER trigger_update_goal_on_approval
  AFTER UPDATE ON goal_approvals
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION update_goal_status_on_approval();

-- 6. Add index for performance
CREATE INDEX IF NOT EXISTS idx_goal_locking_rules_company ON goal_locking_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_cycle ON performance_goals(goal_cycle_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_locked ON performance_goals(is_locked) WHERE is_locked = true;

-- 7. Add trigger for updated_at
CREATE TRIGGER update_goal_locking_rules_updated_at
  BEFORE UPDATE ON goal_locking_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();