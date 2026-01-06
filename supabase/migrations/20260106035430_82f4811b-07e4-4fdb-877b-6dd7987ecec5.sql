-- Device sync logs to track sync operations
CREATE TABLE public.device_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.timeclock_devices(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL DEFAULT 'attendance', -- 'attendance', 'users', 'connection_test'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_details JSONB DEFAULT '{}',
  triggered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Device user mappings to link device users to employees
CREATE TABLE public.device_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  device_id UUID REFERENCES public.timeclock_devices(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_user_id TEXT NOT NULL, -- User ID on the device
  device_user_name TEXT,
  fingerprint_count INTEGER DEFAULT 0,
  face_template_exists BOOLEAN DEFAULT false,
  card_number TEXT,
  is_synced BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(device_id, device_user_id)
);

-- Add port column to devices for ZKTeco communication
ALTER TABLE public.timeclock_devices 
ADD COLUMN IF NOT EXISTS port INTEGER DEFAULT 4370,
ADD COLUMN IF NOT EXISTS communication_key TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Enable RLS
ALTER TABLE public.device_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_user_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies for device_sync_logs
CREATE POLICY "Users can view their company sync logs" ON public.device_sync_logs
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert sync logs for their company" ON public.device_sync_logs
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company sync logs" ON public.device_sync_logs
  FOR UPDATE USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- RLS policies for device_user_mappings
CREATE POLICY "Users can view their company user mappings" ON public.device_user_mappings
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company user mappings" ON public.device_user_mappings
  FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes
CREATE INDEX idx_device_sync_logs_device ON public.device_sync_logs(device_id);
CREATE INDEX idx_device_sync_logs_status ON public.device_sync_logs(status);
CREATE INDEX idx_device_user_mappings_device ON public.device_user_mappings(device_id);
CREATE INDEX idx_device_user_mappings_employee ON public.device_user_mappings(employee_id);