-- Phase 3: Gap Closure - Add high-priority columns to succession tables
-- This migration aligns the database schema with the documentation

-- 1. Add weight_percentage to succession_assessor_types for multi-assessor aggregation
ALTER TABLE succession_assessor_types 
ADD COLUMN IF NOT EXISTS weight_percentage numeric(5,2) DEFAULT NULL;

COMMENT ON COLUMN succession_assessor_types.weight_percentage IS 'Score contribution weight (0-100). When null, equal weighting is applied.';

-- 2. Add category and urgency metadata to succession_availability_reasons
ALTER TABLE succession_availability_reasons 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'planned',
ADD COLUMN IF NOT EXISTS urgency_level text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS typical_notice_months integer DEFAULT NULL;

-- Add constraints for category and urgency_level
ALTER TABLE succession_availability_reasons 
ADD CONSTRAINT succession_availability_reasons_category_check 
CHECK (category IN ('planned', 'unplanned', 'either'));

ALTER TABLE succession_availability_reasons 
ADD CONSTRAINT succession_availability_reasons_urgency_check 
CHECK (urgency_level IN ('low', 'medium', 'high', 'critical'));

COMMENT ON COLUMN succession_availability_reasons.category IS 'Classification: planned, unplanned, or either';
COMMENT ON COLUMN succession_availability_reasons.urgency_level IS 'Succession urgency: low, medium, high, critical';
COMMENT ON COLUMN succession_availability_reasons.typical_notice_months IS 'Expected lead time in months (0-36)';

-- 3. Add successor eligibility to readiness_rating_bands
ALTER TABLE readiness_rating_bands 
ADD COLUMN IF NOT EXISTS is_successor_eligible boolean DEFAULT true;

COMMENT ON COLUMN readiness_rating_bands.is_successor_eligible IS 'Whether candidates in this band can be designated as successors';