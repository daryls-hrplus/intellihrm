-- Add adjusted service date fields to employee_transactions for HIRE transactions
ALTER TABLE public.employee_transactions 
ADD COLUMN IF NOT EXISTS has_adjusted_service BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS adjusted_service_date DATE;