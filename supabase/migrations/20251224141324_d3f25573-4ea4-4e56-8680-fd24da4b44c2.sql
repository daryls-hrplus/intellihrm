-- Add pay_group_id column to employee_transactions for tracking pay group changes in promotions/transfers
ALTER TABLE public.employee_transactions 
ADD COLUMN IF NOT EXISTS pay_group_id uuid REFERENCES public.pay_groups(id);

-- Add comment for documentation
COMMENT ON COLUMN public.employee_transactions.pay_group_id IS 'New pay group assignment for promotions and transfers';