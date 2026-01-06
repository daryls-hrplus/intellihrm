-- Create leave compliance alerts table for HR notifications
CREATE TABLE public.leave_compliance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('overdue_acknowledgment', 'bradford_threshold', 'medical_cert_pending', 'policy_update')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  employee_id UUID REFERENCES profiles(id),
  threshold_value NUMERIC,
  actual_value NUMERIC,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leave_compliance_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies using valid app_role enum values
CREATE POLICY "HR and admins can view compliance alerts" 
ON public.leave_compliance_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

CREATE POLICY "HR and admins can insert compliance alerts" 
ON public.leave_compliance_alerts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

CREATE POLICY "HR and admins can update compliance alerts" 
ON public.leave_compliance_alerts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'hr_manager', 'system_admin')
  )
);

-- Create indexes for performance
CREATE INDEX idx_leave_compliance_alerts_company ON leave_compliance_alerts(company_id);
CREATE INDEX idx_leave_compliance_alerts_unread ON leave_compliance_alerts(company_id, is_read) WHERE is_read = false;
CREATE INDEX idx_leave_compliance_alerts_unresolved ON leave_compliance_alerts(company_id, is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_leave_compliance_alerts_type ON leave_compliance_alerts(alert_type);

-- Function to create Bradford threshold alerts
CREATE OR REPLACE FUNCTION public.check_bradford_threshold_alerts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_level IN ('high', 'critical') THEN
    INSERT INTO leave_compliance_alerts (
      company_id,
      alert_type,
      severity,
      title,
      message,
      entity_type,
      entity_id,
      employee_id,
      threshold_value,
      actual_value
    )
    SELECT
      NEW.company_id,
      'bradford_threshold',
      CASE NEW.risk_level WHEN 'critical' THEN 'critical' ELSE 'high' END,
      'Bradford Factor Alert: ' || COALESCE(p.full_name, 'Employee'),
      'Employee has reached ' || NEW.risk_level || ' risk level with a Bradford score of ' || NEW.bradford_score,
      'employee_bradford_scores',
      NEW.id,
      NEW.employee_id,
      COALESCE(
        (SELECT min_score FROM bradford_factor_thresholds 
         WHERE company_id = NEW.company_id AND risk_level = NEW.risk_level LIMIT 1),
        CASE NEW.risk_level WHEN 'critical' THEN 450 ELSE 200 END
      ),
      NEW.bradford_score
    FROM profiles p
    WHERE p.id = NEW.employee_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for Bradford alerts
CREATE TRIGGER trigger_bradford_threshold_alert
  AFTER INSERT OR UPDATE ON employee_bradford_scores
  FOR EACH ROW
  EXECUTE FUNCTION check_bradford_threshold_alerts();

-- Add columns to track overdue acknowledgments
ALTER TABLE leave_policy_acknowledgments 
ADD COLUMN IF NOT EXISTS acknowledgment_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;