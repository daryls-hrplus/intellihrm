-- Create master_job_families table for global/industry-standard job families
CREATE TABLE public.master_job_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  industry_category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add master_job_family_id to existing job_families table
ALTER TABLE public.job_families 
ADD COLUMN master_job_family_id UUID REFERENCES public.master_job_families(id);

-- Create index for faster lookups
CREATE INDEX idx_job_families_master_id ON public.job_families(master_job_family_id);
CREATE INDEX idx_master_job_families_code ON public.master_job_families(code);

-- Enable RLS on master_job_families
ALTER TABLE public.master_job_families ENABLE ROW LEVEL SECURITY;

-- Master job families are readable by all authenticated users
CREATE POLICY "Master job families are viewable by authenticated users"
ON public.master_job_families
FOR SELECT
TO authenticated
USING (true);

-- Admins can modify master job families (using user_roles table with correct role values)
CREATE POLICY "Admins can manage master job families"
ON public.master_job_families
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'system_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'system_admin')
  )
);

-- Seed master job families with industry-standard data
INSERT INTO public.master_job_families (code, name, description, industry_category) VALUES
('TECH', 'Technology & IT', 'Information technology, software development, infrastructure, and digital services roles', 'Cross-Industry'),
('FIN', 'Finance & Accounting', 'Financial planning, accounting, treasury, audit, and fiscal management roles', 'Cross-Industry'),
('HR', 'Human Resources', 'Talent acquisition, employee relations, compensation, benefits, and workforce management roles', 'Cross-Industry'),
('OPS', 'Operations', 'Business operations, process management, and operational excellence roles', 'Cross-Industry'),
('SALES', 'Sales & Business Development', 'Sales, account management, business development, and revenue generation roles', 'Cross-Industry'),
('MKT', 'Marketing & Communications', 'Marketing, brand management, communications, and public relations roles', 'Cross-Industry'),
('LEGAL', 'Legal & Compliance', 'Legal counsel, regulatory compliance, risk management, and governance roles', 'Cross-Industry'),
('ENG', 'Engineering', 'Product engineering, mechanical, electrical, civil, and industrial engineering roles', 'Manufacturing/Tech'),
('MFG', 'Manufacturing & Production', 'Production, assembly, plant operations, and manufacturing process roles', 'Manufacturing'),
('LOG', 'Logistics & Supply Chain', 'Supply chain management, warehousing, distribution, and logistics roles', 'Cross-Industry'),
('CS', 'Customer Service', 'Customer support, client services, and customer experience roles', 'Cross-Industry'),
('ADMIN', 'Administration', 'Administrative support, office management, and executive assistance roles', 'Cross-Industry'),
('RD', 'Research & Development', 'Product research, innovation, scientific research, and development roles', 'Tech/Pharma'),
('QA', 'Quality Assurance', 'Quality control, testing, inspection, and compliance verification roles', 'Manufacturing/Tech'),
('PROC', 'Procurement', 'Purchasing, vendor management, sourcing, and contract management roles', 'Cross-Industry'),
('HSE', 'Health, Safety & Environment', 'Occupational health, workplace safety, and environmental compliance roles', 'Cross-Industry'),
('FAC', 'Facilities & Real Estate', 'Facilities management, real estate, and workplace services roles', 'Cross-Industry'),
('EXEC', 'Executive Leadership', 'C-suite, executive management, and senior leadership roles', 'Cross-Industry');

-- Create trigger for updated_at
CREATE TRIGGER update_master_job_families_updated_at
BEFORE UPDATE ON public.master_job_families
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();