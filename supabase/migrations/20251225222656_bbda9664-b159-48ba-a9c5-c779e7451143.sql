-- Add continuous_service_date column to employee_transactions for REHIRE transactions
ALTER TABLE public.employee_transactions 
ADD COLUMN IF NOT EXISTS continuous_service_date DATE;