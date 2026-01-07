-- Add document_urls column to employee_data_change_requests table (if not exists)
ALTER TABLE public.employee_data_change_requests 
ADD COLUMN IF NOT EXISTS document_urls text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.employee_data_change_requests.document_urls IS 'Array of storage paths for supporting documents attached to the change request';

-- Drop the incorrect policy if it was created
DROP POLICY IF EXISTS "HR can view all change request documents" ON storage.objects;

-- Re-create with correct role values
CREATE POLICY "HR can view all change request documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ess-change-documents'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'hr_manager')
  )
);