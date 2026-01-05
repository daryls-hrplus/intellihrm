-- Add electronic signature fields to payslips table
ALTER TABLE payslips 
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS signed_ip TEXT,
  ADD COLUMN IF NOT EXISTS signature_hash TEXT,
  ADD COLUMN IF NOT EXISTS signature_device_info TEXT;