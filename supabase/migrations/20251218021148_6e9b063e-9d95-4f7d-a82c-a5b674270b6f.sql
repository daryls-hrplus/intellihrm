-- Add RLS policies for enablement-reference-docs bucket
-- Allow authenticated users with enablement roles to upload reference docs
CREATE POLICY "Enablement users can upload reference docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'enablement-reference-docs' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view reference docs
CREATE POLICY "Authenticated users can view enablement docs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'enablement-reference-docs' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to update their own reference docs
CREATE POLICY "Users can update their enablement docs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'enablement-reference-docs' 
  AND auth.uid() IS NOT NULL
);

-- Allow users to delete their own reference docs
CREATE POLICY "Users can delete their enablement docs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'enablement-reference-docs' 
  AND auth.uid() IS NOT NULL
);