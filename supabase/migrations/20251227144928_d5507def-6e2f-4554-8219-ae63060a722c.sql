-- Add ESCO-related columns to skills_competencies table
ALTER TABLE public.skills_competencies 
ADD COLUMN IF NOT EXISTS esco_uri TEXT,
ADD COLUMN IF NOT EXISTS esco_skill_type TEXT,
ADD COLUMN IF NOT EXISTS esco_concept_type TEXT,
ADD COLUMN IF NOT EXISTS external_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS external_sync_status TEXT DEFAULT 'synced',
ADD COLUMN IF NOT EXISTS last_external_sync_at TIMESTAMPTZ;

-- Create index for ESCO URI lookups
CREATE INDEX IF NOT EXISTS idx_skills_competencies_esco_uri ON public.skills_competencies(esco_uri);
CREATE INDEX IF NOT EXISTS idx_skills_competencies_external_source ON public.skills_competencies(external_source);

-- Create ESCO import log table for audit trail
CREATE TABLE IF NOT EXISTS public.esco_import_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    imported_by UUID REFERENCES auth.users(id),
    skill_competency_id UUID REFERENCES public.skills_competencies(id) ON DELETE SET NULL,
    esco_uri TEXT NOT NULL,
    esco_skill_type TEXT,
    esco_concept_type TEXT,
    esco_preferred_label TEXT,
    source_occupation_uri TEXT,
    source_occupation_label TEXT,
    import_language TEXT DEFAULT 'en',
    import_status TEXT DEFAULT 'completed',
    duplicate_detected BOOLEAN DEFAULT false,
    duplicate_of_id UUID REFERENCES public.skills_competencies(id) ON DELETE SET NULL,
    approval_status TEXT DEFAULT 'auto_approved',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on esco_import_log
ALTER TABLE public.esco_import_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for esco_import_log using user_roles table
CREATE POLICY "Users can view import logs for their company"
ON public.esco_import_log
FOR SELECT
USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "HR managers can insert import logs"
ON public.esco_import_log
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'hr_manager')
    )
);

CREATE POLICY "HR managers can update import logs"
ON public.esco_import_log
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        WHERE ur.user_id = auth.uid() 
        AND ur.role IN ('admin', 'hr_manager')
    )
);

-- Add ESCO guardrails to ai_guardrails_config
INSERT INTO public.ai_guardrails_config (guardrail_type, config_key, config_value, is_active)
VALUES 
    ('external_import', 'esco_duplicate_threshold', '{"threshold": 0.85, "action": "warn"}'::jsonb, true),
    ('external_import', 'esco_import_approval_required', '{"enabled": false, "roles": ["hr_manager", "admin"]}'::jsonb, true),
    ('external_import', 'esco_max_daily_imports', '{"limit": 100, "per": "company"}'::jsonb, true),
    ('external_import', 'esco_auto_sync_enabled', '{"enabled": false, "frequency": "monthly"}'::jsonb, true)
ON CONFLICT DO NOTHING;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_esco_import_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for esco_import_log
DROP TRIGGER IF EXISTS update_esco_import_log_updated_at ON public.esco_import_log;
CREATE TRIGGER update_esco_import_log_updated_at
    BEFORE UPDATE ON public.esco_import_log
    FOR EACH ROW
    EXECUTE FUNCTION public.update_esco_import_log_updated_at();