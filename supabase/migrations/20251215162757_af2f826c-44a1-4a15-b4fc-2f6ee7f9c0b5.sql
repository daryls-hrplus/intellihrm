-- Add maps_to column for entity mapping
ALTER TABLE gl_cost_center_segments
ADD COLUMN maps_to VARCHAR(50) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN gl_cost_center_segments.maps_to IS 'Entity type this segment maps to: company, division, department, section, pay_element, job, location, employee';