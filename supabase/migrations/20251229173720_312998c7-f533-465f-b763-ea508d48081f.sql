-- Create storage bucket for performance evidence attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('performance-evidence', 'performance-evidence', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for performance-evidence bucket

-- Allow authenticated users to upload their own evidence files
CREATE POLICY "Users can upload their own evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'performance-evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own evidence files
CREATE POLICY "Users can view their own evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'performance-evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow HR/Admin users to view all evidence using has_any_role function
CREATE POLICY "HR can view all evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'performance-evidence'
  AND has_any_role(auth.uid(), ARRAY['hr_admin', 'super_admin', 'company_admin', 'admin', 'hr_manager'])
);

-- Allow users to update their own evidence files
CREATE POLICY "Users can update their own evidence"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'performance-evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own non-immutable evidence
CREATE POLICY "Users can delete their own evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'performance-evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND NOT EXISTS (
    SELECT 1 FROM performance_evidence pe
    WHERE pe.attachment_path = name
    AND pe.is_immutable = true
  )
);