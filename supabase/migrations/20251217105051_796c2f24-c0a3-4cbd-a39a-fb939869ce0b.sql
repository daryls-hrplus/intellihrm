-- Add column for AI-generated spreadsheet examples
ALTER TABLE statutory_deduction_types 
ADD COLUMN IF NOT EXISTS ai_spreadsheet_examples JSONB;