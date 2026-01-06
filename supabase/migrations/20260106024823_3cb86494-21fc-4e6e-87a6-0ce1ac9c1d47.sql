-- =====================================================
-- ENTERPRISE TIME & ATTENDANCE TABLES (Remaining)
-- =====================================================

-- 5. Flex Time / Time Banking
CREATE TABLE public.flex_time_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
  max_accrual_hours NUMERIC(8,2) DEFAULT 80,
  min_balance_hours NUMERIC(8,2) DEFAULT -40,
  last_accrual_date DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_id)
);

CREATE TABLE public.flex_time_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),
  balance_id UUID NOT NULL REFERENCES flex_time_balances(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('accrual', 'usage', 'adjustment', 'expiry', 'carryover')),
  hours NUMERIC(6,2) NOT NULL,
  balance_before NUMERIC(8,2) NOT NULL,
  balance_after NUMERIC(8,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  description TEXT,
  approved_by UUID REFERENCES profiles(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Attendance Regularization Requests
CREATE TABLE public.attendance_regularization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id),
  request_date DATE NOT NULL,
  regularization_type TEXT NOT NULL CHECK (regularization_type IN ('missed_clock_in', 'missed_clock_out', 'incorrect_time', 'forgot_to_clock', 'system_error', 'other')),
  original_clock_in TIMESTAMP WITH TIME ZONE,
  original_clock_out TIMESTAMP WITH TIME ZONE,
  requested_clock_in TIMESTAMP WITH TIME ZONE,
  requested_clock_out TIMESTAMP WITH TIME ZONE,
  reason TEXT NOT NULL,
  supporting_document_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  time_entry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Union/CBA Rules Engine
CREATE TABLE public.cba_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agreement_name TEXT NOT NULL,
  union_name TEXT,
  agreement_code TEXT,
  effective_from DATE NOT NULL,
  effective_to DATE,
  applies_to_departments UUID[],
  applies_to_job_grades TEXT[],
  is_active BOOLEAN DEFAULT true,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.cba_time_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID NOT NULL REFERENCES cba_agreements(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('overtime_threshold', 'overtime_rate', 'shift_premium', 'holiday_premium', 'weekend_premium', 'night_premium', 'rest_period', 'max_hours', 'guaranteed_hours', 'callback_minimum')),
  condition_json JSONB,
  value_numeric NUMERIC(6,2),
  value_text TEXT,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Time & Attendance Audit Trail
CREATE TABLE public.time_attendance_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('time_entry', 'schedule', 'shift', 'overtime', 'policy', 'regularization', 'swap_request', 'flex_time')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject', 'submit', 'cancel', 'override')),
  actor_id UUID NOT NULL REFERENCES profiles(id),
  actor_role TEXT,
  changes_json JSONB,
  old_values JSONB,
  new_values JSONB,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flex_time_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flex_time_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_regularization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cba_time_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_attendance_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their flex balance" ON flex_time_balances FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can manage flex balances" ON flex_time_balances FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "Users can view their flex transactions" ON flex_time_transactions FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can manage flex transactions" ON flex_time_transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "Users can view their regularization requests" ON attendance_regularization_requests FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager'))
);

CREATE POLICY "Users can create regularization requests" ON attendance_regularization_requests FOR INSERT WITH CHECK (employee_id = auth.uid());

CREATE POLICY "HR can manage regularization requests" ON attendance_regularization_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager'))
);

CREATE POLICY "HR can manage CBA agreements" ON cba_agreements FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "HR can manage CBA rules" ON cba_time_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "HR can view audit log" ON time_attendance_audit_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "System can insert audit log" ON time_attendance_audit_log FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_flex_employee ON flex_time_balances(company_id, employee_id);
CREATE INDEX idx_regularization_status ON attendance_regularization_requests(company_id, status);
CREATE INDEX idx_cba_active ON cba_agreements(company_id, is_active);
CREATE INDEX idx_audit_entity ON time_attendance_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON time_attendance_audit_log(actor_id, created_at DESC);