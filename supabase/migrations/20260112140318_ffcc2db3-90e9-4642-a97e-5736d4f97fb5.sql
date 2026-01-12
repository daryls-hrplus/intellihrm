-- Add BULK_TRANSFER transaction type to lookup_values
INSERT INTO lookup_values (category, code, name, description, display_order, is_active)
VALUES ('transaction_type', 'BULK_TRANSFER', 'Bulk Transfer', 'Transfer multiple employees between companies', 17, true)
ON CONFLICT (category, code) DO NOTHING;

-- Add bulk transfer fields to employee_transactions table
ALTER TABLE employee_transactions 
ADD COLUMN IF NOT EXISTS is_bulk_transaction BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_transaction_group_id UUID,
ADD COLUMN IF NOT EXISTS bulk_transaction_count INTEGER;

-- Create index for bulk transaction group lookups
CREATE INDEX IF NOT EXISTS idx_employee_transactions_bulk_group 
ON employee_transactions(bulk_transaction_group_id) 
WHERE bulk_transaction_group_id IS NOT NULL;