-- Add division_id and department_id to job_families
ALTER TABLE public.job_families
ADD COLUMN company_division_id UUID REFERENCES public.company_divisions(id),
ADD COLUMN department_id UUID NOT NULL REFERENCES public.departments(id);

-- Update unique constraint to include department
ALTER TABLE public.job_families DROP CONSTRAINT job_families_company_id_code_key;
ALTER TABLE public.job_families ADD CONSTRAINT job_families_company_dept_code_key UNIQUE(company_id, department_id, code);