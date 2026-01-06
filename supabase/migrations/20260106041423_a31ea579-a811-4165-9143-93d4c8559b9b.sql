-- Add missing columns to attendance_exceptions
ALTER TABLE public.attendance_exceptions 
ADD COLUMN IF NOT EXISTS time_entry_id UUID REFERENCES public.time_clock_entries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS schedule_id UUID,
ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'info',
ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS actual_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS variance_minutes INTEGER,
ADD COLUMN IF NOT EXISTS auto_resolved BOOLEAN DEFAULT false;

-- Device polling configuration table
CREATE TABLE IF NOT EXISTS public.device_polling_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  polling_interval_minutes INTEGER DEFAULT 5,
  last_poll_at TIMESTAMPTZ,
  next_poll_at TIMESTAMPTZ,
  poll_failures INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS on polling config
ALTER TABLE public.device_polling_config ENABLE ROW LEVEL SECURITY;

-- RLS policies for polling config
CREATE POLICY "Users can view their company polling config" ON public.device_polling_config
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company polling config" ON public.device_polling_config
  FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Add schedule matching columns to time_clock_entries
ALTER TABLE public.time_clock_entries 
ADD COLUMN IF NOT EXISTS matched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS match_quality TEXT,
ADD COLUMN IF NOT EXISTS scheduled_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS break_minutes_expected INTEGER,
ADD COLUMN IF NOT EXISTS exceptions_detected TEXT[];

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_exceptions_severity ON public.attendance_exceptions(company_id, severity);
CREATE INDEX IF NOT EXISTS idx_time_entries_unmatched ON public.time_clock_entries(company_id) WHERE matched_at IS NULL;