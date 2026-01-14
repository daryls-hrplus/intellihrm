-- Add new workflow categories to the enum for Employee Relations module
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'disciplinary_acknowledgement';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'grievance_submission';