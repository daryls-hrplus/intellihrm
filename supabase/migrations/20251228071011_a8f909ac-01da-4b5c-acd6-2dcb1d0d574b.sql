-- Create table for multiple breaks per time clock entry
CREATE TABLE public.time_clock_breaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  time_clock_entry_id UUID NOT NULL REFERENCES public.time_clock_entries(id) ON DELETE CASCADE,
  break_start TIMESTAMP WITH TIME ZONE NOT NULL,
  break_end TIMESTAMP WITH TIME ZONE,
  break_type TEXT DEFAULT 'standard' CHECK (break_type IN ('standard', 'meal', 'rest', 'other')),
  duration_minutes INTEGER,
  is_paid BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_clock_breaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own breaks"
ON public.time_clock_breaks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.time_clock_entries tce
    WHERE tce.id = time_clock_entry_id
    AND tce.employee_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own breaks"
ON public.time_clock_breaks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.time_clock_entries tce
    WHERE tce.id = time_clock_entry_id
    AND tce.employee_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own breaks"
ON public.time_clock_breaks FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.time_clock_entries tce
    WHERE tce.id = time_clock_entry_id
    AND tce.employee_id = auth.uid()
  )
);

CREATE POLICY "HR and admins can manage all breaks"
ON public.time_clock_breaks FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'hr_manager')
);

-- Index for efficient queries
CREATE INDEX idx_time_clock_breaks_entry_id ON public.time_clock_breaks(time_clock_entry_id);

-- Add new multiplier columns to payroll_rules table
ALTER TABLE public.payroll_rules 
ADD COLUMN IF NOT EXISTS double_time_multiplier NUMERIC(4,2) DEFAULT 2.0,
ADD COLUMN IF NOT EXISTS double_half_multiplier NUMERIC(4,2) DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS triple_time_multiplier NUMERIC(4,2) DEFAULT 3.0,
ADD COLUMN IF NOT EXISTS quadruple_time_multiplier NUMERIC(4,2) DEFAULT 4.0,
ADD COLUMN IF NOT EXISTS overtime_tier_1_threshold NUMERIC(5,2) DEFAULT 40,
ADD COLUMN IF NOT EXISTS overtime_tier_2_threshold NUMERIC(5,2) DEFAULT 48,
ADD COLUMN IF NOT EXISTS overtime_tier_3_threshold NUMERIC(5,2) DEFAULT 56,
ADD COLUMN IF NOT EXISTS overtime_tier_4_threshold NUMERIC(5,2) DEFAULT 64,
ADD COLUMN IF NOT EXISTS consecutive_day_threshold INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS consecutive_day_multiplier NUMERIC(4,2) DEFAULT 2.0;

-- Create overtime rate tiers table for flexible configuration
CREATE TABLE public.overtime_rate_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  payroll_rule_id UUID REFERENCES public.payroll_rules(id) ON DELETE CASCADE,
  tier_name TEXT NOT NULL,
  tier_code TEXT NOT NULL,
  min_hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  max_hours NUMERIC(5,2),
  multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  applies_to TEXT[] DEFAULT ARRAY['weekday']::TEXT[],
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, tier_code)
);

-- Enable RLS
ALTER TABLE public.overtime_rate_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view overtime tiers"
ON public.overtime_rate_tiers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.company_id = overtime_rate_tiers.company_id
  )
);

CREATE POLICY "HR and admins can manage overtime tiers"
ON public.overtime_rate_tiers FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'hr_manager')
);

-- Index
CREATE INDEX idx_overtime_rate_tiers_company ON public.overtime_rate_tiers(company_id);
CREATE INDEX idx_overtime_rate_tiers_rule ON public.overtime_rate_tiers(payroll_rule_id);