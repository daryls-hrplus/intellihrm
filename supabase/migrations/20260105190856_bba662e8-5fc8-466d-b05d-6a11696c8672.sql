-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-documents', 'company-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to company-documents bucket
CREATE POLICY "Authenticated users can upload company documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-documents');

-- Allow public read access for company documents
CREATE POLICY "Public can view company documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-documents');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete company documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-documents');