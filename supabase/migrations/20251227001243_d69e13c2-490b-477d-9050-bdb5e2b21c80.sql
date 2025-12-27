-- Add employee-level multi-currency flag to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS enable_multi_currency_payment boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.enable_multi_currency_payment IS 'When true, employee is eligible for multi-currency net pay options (requires pay group to also have multi-currency enabled)';