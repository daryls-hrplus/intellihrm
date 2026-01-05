-- Add attachments column to tickets table for initial submission attachments
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';