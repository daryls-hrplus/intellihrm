-- Add global employee identifier for cross-device sync
ALTER TABLE public.device_user_mappings 
ADD COLUMN IF NOT EXISTS is_primary_device BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS biometric_template BYTEA,
ADD COLUMN IF NOT EXISTS template_type TEXT,
ADD COLUMN IF NOT EXISTS template_version TEXT;

-- Create cross-device sync tracking table
CREATE TABLE IF NOT EXISTS public.device_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  source_device_id UUID REFERENCES public.timeclock_devices(id) ON DELETE CASCADE,
  target_device_id UUID REFERENCES public.timeclock_devices(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_user_id TEXT NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'user', -- 'user', 'fingerprint', 'face', 'card'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.device_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their company sync queue" ON public.device_sync_queue
  FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company sync queue" ON public.device_sync_queue
  FOR ALL USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Index for efficient queue processing
CREATE INDEX IF NOT EXISTS idx_device_sync_queue_status ON public.device_sync_queue(status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_device_sync_queue_target ON public.device_sync_queue(target_device_id, status);