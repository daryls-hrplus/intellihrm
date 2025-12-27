-- Create capability_change_history table (audit trail for skills/competencies)
CREATE TABLE IF NOT EXISTS public.capability_change_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id UUID NOT NULL REFERENCES public.skills_competencies(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'status_changed', 'deprecated')),
  previous_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  changed_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.capability_change_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for capability_change_history (use IF NOT EXISTS equivalent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'capability_change_history' AND policyname = 'HR and admins can view change history') THEN
    CREATE POLICY "HR and admins can view change history"
    ON public.capability_change_history FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'hr_manager')
      )
    );
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'capability_change_history' AND policyname = 'HR and admins can insert change history') THEN
    CREATE POLICY "HR and admins can insert change history"
    ON public.capability_change_history FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'hr_manager')
      )
    );
  END IF;
END $$;