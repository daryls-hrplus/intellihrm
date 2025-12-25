-- Add adjust_continuous_service field to employee_transactions for REHIRE transactions
ALTER TABLE public.employee_transactions 
ADD COLUMN IF NOT EXISTS adjust_continuous_service BOOLEAN DEFAULT false;

-- Add REHIRE transaction type to lookup_values
INSERT INTO public.lookup_values (category, code, name, description, is_active, is_default, display_order)
VALUES ('transaction_type', 'REHIRE', 'Rehire', 'Rehire a previously terminated employee', true, false, 2)
ON CONFLICT (category, code) DO NOTHING;