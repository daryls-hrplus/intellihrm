-- Create job_levels table with ordering
CREATE TABLE IF NOT EXISTS public.job_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  level_order INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, code)
);

-- Enable RLS
ALTER TABLE public.job_levels ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_levels
CREATE POLICY "Users can view job levels in their company"
  ON public.job_levels FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "HR can manage job levels"
  ON public.job_levels FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager', 'system_admin')
  ));

-- Seed default job levels for existing companies
INSERT INTO public.job_levels (company_id, code, name, level_order, is_active)
SELECT 
  c.id,
  jl.code,
  jl.name,
  jl.level_order,
  true
FROM companies c
CROSS JOIN (VALUES
  ('intern', 'Intern', 1),
  ('clerk', 'Clerk', 2),
  ('operator', 'Operator', 3),
  ('officer', 'Officer', 4),
  ('staff', 'Staff', 5),
  ('senior', 'Senior', 6),
  ('supervisor', 'Supervisor', 7),
  ('manager', 'Manager', 8),
  ('director', 'Director', 9),
  ('executive', 'Executive', 10)
) AS jl(code, name, level_order)
ON CONFLICT (company_id, code) DO NOTHING;

-- Add min_visible_job_level_id column to directory_visibility_config
ALTER TABLE public.directory_visibility_config 
  ADD COLUMN IF NOT EXISTS min_visible_job_level_id UUID REFERENCES public.job_levels(id);