-- Add logo_url to company_groups table
ALTER TABLE public.company_groups 
ADD COLUMN logo_url TEXT;