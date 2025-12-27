-- Add approval status tracking to employee_compensation for pending acting assignments
ALTER TABLE public.employee_compensation 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS source_transaction_id UUID REFERENCES public.employee_transactions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS pending_effective_date DATE;

-- Add index for efficient filtering of pending compensation
CREATE INDEX IF NOT EXISTS idx_employee_compensation_approval_status 
ON public.employee_compensation(approval_status) 
WHERE approval_status = 'pending';

-- Add index for transaction lookup
CREATE INDEX IF NOT EXISTS idx_employee_compensation_source_transaction 
ON public.employee_compensation(source_transaction_id) 
WHERE source_transaction_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.employee_compensation.approval_status IS 'Status of compensation: pending (awaiting workflow approval), approved (can be paid), rejected (not to be paid)';
COMMENT ON COLUMN public.employee_compensation.source_transaction_id IS 'Reference to the employee_transaction that created this compensation record';
COMMENT ON COLUMN public.employee_compensation.pending_effective_date IS 'The intended effective date when compensation was created pending approval. Used for retroactive pay calculation when approved.';