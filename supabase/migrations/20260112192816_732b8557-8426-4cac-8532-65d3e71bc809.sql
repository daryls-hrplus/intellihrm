-- Add 'performance' to workflow_category enum
-- This needs to be committed separately before use
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'performance';