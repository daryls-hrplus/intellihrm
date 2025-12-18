-- Update storage bucket to allow PDF, DOCX, and TXT files
UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'],
  file_size_limit = 10485760 -- 10MB
WHERE id = 'enablement-reference-docs';