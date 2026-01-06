-- Wellness/Burnout Indicators and Overtime Alerts
CREATE TABLE public.employee_wellness_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  consecutive_work_days INTEGER DEFAULT 0,
  avg_daily_hours_last_7_days NUMERIC(5,2),
  avg_daily_hours_last_30_days NUMERIC(5,2),
  total_overtime_hours_last_7_days NUMERIC(6,2) DEFAULT 0,
  total_overtime_hours_last_30_days NUMERIC(6,2) DEFAULT 0,
  rest_violations_last_30_days INTEGER DEFAULT 0,
  missed_breaks_last_7_days INTEGER DEFAULT 0,
  fatigue_risk_score INTEGER DEFAULT 0 CHECK (fatigue_risk_score BETWEEN 0 AND 100),
  burnout_risk_score INTEGER DEFAULT 0 CHECK (burnout_risk_score BETWEEN 0 AND 100),
  overall_wellness_score INTEGER DEFAULT 100 CHECK (overall_wellness_score BETWEEN 0 AND 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  ai_analysis TEXT,
  ai_recommendations JSONB,
  ai_confidence_score NUMERIC(3,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, employee_id, assessment_date)
);

CREATE TABLE public.overtime_risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('approaching_daily_limit', 'approaching_weekly_limit', 'approaching_monthly_limit', 'exceeded_daily_limit', 'exceeded_weekly_limit', 'exceeded_monthly_limit', 'consecutive_days', 'rest_violation', 'burnout_risk')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  current_hours NUMERIC(6,2),
  limit_hours NUMERIC(6,2),
  percentage_used NUMERIC(5,2),
  period_start DATE,
  period_end DATE,
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.labor_compliance_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  region_code TEXT,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('max_daily_hours', 'max_weekly_hours', 'max_monthly_overtime', 'min_rest_between_shifts', 'min_weekly_rest', 'mandatory_break_duration', 'mandatory_break_after_hours', 'night_shift_restrictions', 'overtime_multiplier', 'holiday_multiplier')),
  threshold_value NUMERIC(6,2) NOT NULL,
  threshold_unit TEXT DEFAULT 'hours' CHECK (threshold_unit IN ('hours', 'minutes', 'days', 'multiplier', 'percentage')),
  applies_to_employee_types TEXT[] DEFAULT ARRAY['all'],
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  legal_reference TEXT,
  penalty_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employee_wellness_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_compliance_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "HR can manage wellness indicators" ON employee_wellness_indicators FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "HR can manage overtime alerts" ON overtime_risk_alerts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

CREATE POLICY "HR can manage labor rules" ON labor_compliance_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'hr_manager', 'system_admin'))
);

-- Indexes
CREATE INDEX idx_wellness_employee ON employee_wellness_indicators(employee_id, assessment_date DESC);
CREATE INDEX idx_wellness_risk ON employee_wellness_indicators(company_id, risk_level);
CREATE INDEX idx_ot_alerts_unresolved ON overtime_risk_alerts(company_id, is_resolved) WHERE is_resolved = false;
CREATE INDEX idx_labor_rules_country ON labor_compliance_rules(company_id, country_code, is_active);