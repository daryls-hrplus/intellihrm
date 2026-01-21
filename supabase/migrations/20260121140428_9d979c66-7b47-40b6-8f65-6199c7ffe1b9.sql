-- Add JSONB array for multiple attachments per evidence record
ALTER TABLE performance_evidence 
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Migrate existing single attachments to array format
UPDATE performance_evidence
SET attachments = jsonb_build_array(
  jsonb_build_object(
    'path', attachment_path,
    'type', attachment_type,
    'size', attachment_size_bytes,
    'uploaded_at', submitted_at,
    'filename', split_part(attachment_path, '/', -1)
  )
)
WHERE attachment_path IS NOT NULL 
  AND (attachments IS NULL OR attachments = '[]'::jsonb);

-- Add comment for documentation
COMMENT ON COLUMN performance_evidence.attachments IS 
  'JSONB array of attachments: [{path, type, size, uploaded_at, filename}]. Supports multiple files per evidence record.';