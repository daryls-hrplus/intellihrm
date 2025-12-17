-- Make the employee-documents bucket public so files can be accessed via URL
UPDATE storage.buckets
SET public = true
WHERE id = 'employee-documents';

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Authenticated users can upload employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for employee documents" ON storage.objects;

-- Allow public read access since bucket is now public
CREATE POLICY "Public read access for employee documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-documents');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload employee documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-documents');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete employee documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-documents');