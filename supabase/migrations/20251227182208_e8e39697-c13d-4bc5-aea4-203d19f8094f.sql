-- Add columns to retroactive_pay_configs to track approval-triggered configs
ALTER TABLE public.retroactive_pay_configs
ADD COLUMN IF NOT EXISTS source_transaction_id UUID REFERENCES public.employee_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_approval_triggered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_date DATE;

-- Add index for filtering approval-triggered retro configs
CREATE INDEX IF NOT EXISTS idx_retroactive_pay_configs_approval_triggered 
ON public.retroactive_pay_configs(is_approval_triggered) 
WHERE is_approval_triggered = true;

-- Add index for source transaction lookup
CREATE INDEX IF NOT EXISTS idx_retroactive_pay_configs_source_transaction
ON public.retroactive_pay_configs(source_transaction_id)
WHERE source_transaction_id IS NOT NULL;

COMMENT ON COLUMN public.retroactive_pay_configs.source_transaction_id IS 'Reference to the transaction that triggered this retroactive pay when approved';
COMMENT ON COLUMN public.retroactive_pay_configs.is_approval_triggered IS 'Whether this retro config was auto-generated from a transaction approval';
COMMENT ON COLUMN public.retroactive_pay_configs.approval_date IS 'Date when the source transaction was approved';