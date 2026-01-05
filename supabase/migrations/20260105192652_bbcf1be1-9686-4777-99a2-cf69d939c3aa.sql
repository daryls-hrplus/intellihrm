-- Add company_id to tickets table for company-based filtering
ALTER TABLE public.tickets ADD COLUMN company_id uuid REFERENCES public.companies(id);

-- Create index for faster company filtering
CREATE INDEX idx_tickets_company_id ON public.tickets(company_id);