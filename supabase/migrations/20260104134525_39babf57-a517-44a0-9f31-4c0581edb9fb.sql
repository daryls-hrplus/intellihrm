-- Step 1: Add unique constraint on code for reminder_event_types (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reminder_event_types_code_unique'
  ) THEN
    ALTER TABLE reminder_event_types ADD CONSTRAINT reminder_event_types_code_unique UNIQUE (code);
  END IF;
END $$;

-- Step 2: Add 360 cycle reminder event types under 'performance' category
INSERT INTO reminder_event_types (code, name, description, category, source_table, date_field, is_system, is_active)
VALUES 
  ('360_CYCLE_ACTIVATED', '360 Cycle Activated', 'Notify participants when a 360 feedback cycle is launched', 'performance', 'review_cycles', 'start_date', true, true),
  ('360_RESULTS_RELEASED', '360 Results Released', 'Notify participants when 360 feedback results are released', 'performance', 'review_cycles', 'results_released_at', true, true),
  ('360_FEEDBACK_DUE', '360 Feedback Deadline Approaching', 'Remind reviewers about upcoming feedback deadline', 'performance', 'review_cycles', 'feedback_deadline', true, true),
  ('360_SELF_REVIEW_DUE', '360 Self-Review Deadline Approaching', 'Remind employees about self-review deadline', 'performance', 'review_cycles', 'self_review_deadline', true, true)
ON CONFLICT (code) DO NOTHING;

-- Step 3: Create delivery tracking table for all reminder notifications
CREATE TABLE public.reminder_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  reminder_id UUID REFERENCES employee_reminders(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES reminder_rules(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type_id UUID REFERENCES reminder_event_types(id) ON DELETE SET NULL,
  delivery_channel TEXT NOT NULL CHECK (delivery_channel IN ('in_app', 'email', 'sms')),
  recipient_email TEXT,
  recipient_name TEXT,
  subject TEXT,
  body_preview TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  message_id TEXT,
  source_record_id UUID,
  source_table TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Create indexes
CREATE INDEX idx_delivery_log_company ON reminder_delivery_log(company_id);
CREATE INDEX idx_delivery_log_status ON reminder_delivery_log(status);
CREATE INDEX idx_delivery_log_employee ON reminder_delivery_log(employee_id);
CREATE INDEX idx_delivery_log_event_type ON reminder_delivery_log(event_type_id);
CREATE INDEX idx_delivery_log_created ON reminder_delivery_log(created_at DESC);
CREATE INDEX idx_delivery_log_channel ON reminder_delivery_log(delivery_channel);

-- Step 5: Enable RLS
ALTER TABLE reminder_delivery_log ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS policies using correct app_role enum values
CREATE POLICY "HR and Admin can view company delivery logs"
  ON reminder_delivery_log FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT p.company_id FROM profiles p 
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE p.id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager', 'system_admin')
    )
  );

CREATE POLICY "System can insert delivery logs"
  ON reminder_delivery_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "HR and Admin can update delivery logs"
  ON reminder_delivery_log FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT p.company_id FROM profiles p 
      JOIN user_roles ur ON ur.user_id = p.id
      WHERE p.id = auth.uid() 
      AND ur.role IN ('admin', 'hr_manager', 'system_admin')
    )
  );

-- Step 7: Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_reminder_delivery_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reminder_delivery_log_timestamp
  BEFORE UPDATE ON reminder_delivery_log
  FOR EACH ROW
  EXECUTE FUNCTION update_reminder_delivery_log_updated_at();