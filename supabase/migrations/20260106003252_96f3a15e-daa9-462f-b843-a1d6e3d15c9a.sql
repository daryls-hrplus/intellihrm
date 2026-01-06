-- =====================================================
-- LEAVE MODULE ENHANCEMENTS - DATABASE MIGRATION
-- =====================================================

-- 1. Leave Cancellation Requests Table
CREATE TABLE public.leave_cancellation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Leave Encashment Requests Table
CREATE TABLE public.leave_encashment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  leave_year_id UUID REFERENCES public.leave_years(id),
  days_requested DECIMAL(10,2) NOT NULL,
  rate_per_day DECIMAL(15,2),
  total_amount DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'cancelled')),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payroll_run_id UUID,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Leave Liability Snapshots Table (for financial reporting)
CREATE TABLE public.leave_liability_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  snapshot_date DATE NOT NULL,
  leave_type_id UUID REFERENCES public.leave_types(id),
  department_id UUID REFERENCES public.departments(id),
  total_employees INTEGER NOT NULL DEFAULT 0,
  total_days_accrued DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_days_used DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_days_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  avg_daily_rate DECIMAL(15,2),
  total_liability_amount DECIMAL(18,2),
  currency TEXT DEFAULT 'USD',
  generated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Leave Request Attachments Table
CREATE TABLE public.leave_request_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_request_id UUID NOT NULL REFERENCES public.leave_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  attachment_type TEXT DEFAULT 'supporting_document' CHECK (attachment_type IN ('medical_certificate', 'travel_document', 'supporting_document', 'approval_letter', 'other')),
  uploaded_by UUID REFERENCES public.profiles(id),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Leave Blackout Periods Table
CREATE TABLE public.leave_blackout_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  leave_type_ids UUID[] DEFAULT '{}',
  department_ids UUID[] DEFAULT '{}',
  position_ids UUID[] DEFAULT '{}',
  applies_to_all BOOLEAN NOT NULL DEFAULT true,
  is_hard_block BOOLEAN NOT NULL DEFAULT false,
  requires_override_approval BOOLEAN NOT NULL DEFAULT true,
  override_approver_role TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Leave Conflict Rules Table (for team conflict detection)
CREATE TABLE public.leave_conflict_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL DEFAULT 'percentage' CHECK (rule_type IN ('percentage', 'absolute', 'critical_roles')),
  department_id UUID REFERENCES public.departments(id),
  max_concurrent_percentage DECIMAL(5,2) DEFAULT 25.00,
  max_concurrent_count INTEGER,
  critical_role_ids UUID[] DEFAULT '{}',
  min_coverage_required INTEGER DEFAULT 1,
  warning_threshold_percentage DECIMAL(5,2) DEFAULT 20.00,
  block_threshold_percentage DECIMAL(5,2) DEFAULT 30.00,
  is_warning_only BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Leave Plan Items Table (for leave planner)
CREATE TABLE public.leave_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  leave_year_id UUID REFERENCES public.leave_years(id),
  planned_start_date DATE NOT NULL,
  planned_end_date DATE NOT NULL,
  planned_days DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'submitted', 'approved', 'cancelled')),
  leave_request_id UUID REFERENCES public.leave_requests(id),
  color TEXT DEFAULT '#3b82f6',
  is_tentative BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Pro-rata Entitlement Settings Table
CREATE TABLE public.leave_prorata_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id),
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  calculation_method TEXT NOT NULL DEFAULT 'monthly' CHECK (calculation_method IN ('daily', 'monthly', 'quarterly')),
  rounding_method TEXT NOT NULL DEFAULT 'nearest' CHECK (rounding_method IN ('up', 'down', 'nearest')),
  rounding_precision DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  include_join_month BOOLEAN NOT NULL DEFAULT true,
  min_service_days_for_accrual INTEGER DEFAULT 0,
  apply_to_first_year_only BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, leave_type_id)
);

-- Add indexes for performance
CREATE INDEX idx_leave_cancellation_requests_employee ON public.leave_cancellation_requests(employee_id);
CREATE INDEX idx_leave_cancellation_requests_status ON public.leave_cancellation_requests(status);
CREATE INDEX idx_leave_encashment_requests_employee ON public.leave_encashment_requests(employee_id);
CREATE INDEX idx_leave_encashment_requests_status ON public.leave_encashment_requests(status);
CREATE INDEX idx_leave_liability_snapshots_company_date ON public.leave_liability_snapshots(company_id, snapshot_date);
CREATE INDEX idx_leave_request_attachments_request ON public.leave_request_attachments(leave_request_id);
CREATE INDEX idx_leave_blackout_periods_company ON public.leave_blackout_periods(company_id);
CREATE INDEX idx_leave_blackout_periods_dates ON public.leave_blackout_periods(start_date, end_date);
CREATE INDEX idx_leave_conflict_rules_company ON public.leave_conflict_rules(company_id);
CREATE INDEX idx_leave_plan_items_employee ON public.leave_plan_items(employee_id);
CREATE INDEX idx_leave_plan_items_dates ON public.leave_plan_items(planned_start_date, planned_end_date);
CREATE INDEX idx_leave_prorata_settings_company ON public.leave_prorata_settings(company_id);

-- Enable RLS on all tables
ALTER TABLE public.leave_cancellation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_encashment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_liability_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_blackout_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_conflict_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_prorata_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leave_cancellation_requests
CREATE POLICY "Employees can view their own cancellation requests"
  ON public.leave_cancellation_requests FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create their own cancellation requests"
  ON public.leave_cancellation_requests FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "HR can manage all cancellation requests"
  ON public.leave_cancellation_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_encashment_requests
CREATE POLICY "Employees can view their own encashment requests"
  ON public.leave_encashment_requests FOR SELECT
  USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create their own encashment requests"
  ON public.leave_encashment_requests FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "HR can manage all encashment requests"
  ON public.leave_encashment_requests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_liability_snapshots
CREATE POLICY "HR can view liability snapshots"
  ON public.leave_liability_snapshots FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

CREATE POLICY "HR can create liability snapshots"
  ON public.leave_liability_snapshots FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_request_attachments
CREATE POLICY "Users can view attachments for their leave requests"
  ON public.leave_request_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.leave_requests lr 
    WHERE lr.id = leave_request_attachments.leave_request_id 
    AND lr.employee_id = auth.uid()
  ));

CREATE POLICY "Users can upload attachments to their leave requests"
  ON public.leave_request_attachments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.leave_requests lr 
    WHERE lr.id = leave_request_attachments.leave_request_id 
    AND lr.employee_id = auth.uid()
  ));

CREATE POLICY "HR can manage all attachments"
  ON public.leave_request_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_blackout_periods
CREATE POLICY "Everyone can view active blackout periods"
  ON public.leave_blackout_periods FOR SELECT
  USING (is_active = true);

CREATE POLICY "HR can manage blackout periods"
  ON public.leave_blackout_periods FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_conflict_rules
CREATE POLICY "Everyone can view conflict rules"
  ON public.leave_conflict_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "HR can manage conflict rules"
  ON public.leave_conflict_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_plan_items
CREATE POLICY "Employees can manage their own plan items"
  ON public.leave_plan_items FOR ALL
  USING (auth.uid() = employee_id);

CREATE POLICY "HR can manage all plan items"
  ON public.leave_plan_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- RLS Policies for leave_prorata_settings
CREATE POLICY "Everyone can view prorata settings"
  ON public.leave_prorata_settings FOR SELECT
  USING (true);

CREATE POLICY "HR can manage prorata settings"
  ON public.leave_prorata_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- Create storage bucket for leave attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'leave-attachments',
  'leave-attachments',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for leave attachments
CREATE POLICY "Users can upload their own leave attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'leave-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own leave attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'leave-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "HR can view all leave attachments"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'leave-attachments' AND EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'system_admin')
  ));

-- Add updated_at trigger to new tables
CREATE TRIGGER update_leave_cancellation_requests_updated_at
  BEFORE UPDATE ON public.leave_cancellation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_encashment_requests_updated_at
  BEFORE UPDATE ON public.leave_encashment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_blackout_periods_updated_at
  BEFORE UPDATE ON public.leave_blackout_periods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_conflict_rules_updated_at
  BEFORE UPDATE ON public.leave_conflict_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_plan_items_updated_at
  BEFORE UPDATE ON public.leave_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_prorata_settings_updated_at
  BEFORE UPDATE ON public.leave_prorata_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();