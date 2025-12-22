-- Create storage bucket for payslips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslips', 'payslips', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Employees can only view their own payslips
CREATE POLICY "Employees can view their own payslips"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payslips' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Authenticated users can upload payslips (for payroll processing)
CREATE POLICY "Authenticated users can upload payslips"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payslips'
  AND auth.role() = 'authenticated'
);

-- RLS: Allow updates to payslips by authenticated users
CREATE POLICY "Authenticated users can update payslips"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'payslips'
  AND auth.role() = 'authenticated'
);