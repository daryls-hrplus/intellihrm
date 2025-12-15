-- Create centralized GL entity segment mapping table
CREATE TABLE gl_entity_segment_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES gl_cost_center_segments(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- company, division, department, section, pay_element, job, location, employee
  entity_id UUID NOT NULL, -- References the actual entity (department id, company id, etc.)
  segment_value VARCHAR(20) NOT NULL, -- The GL segment code assigned to this entity
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure each entity has only one mapping per segment
  UNIQUE(segment_id, entity_type, entity_id)
);

-- Add index for performance
CREATE INDEX idx_gl_entity_segment_mappings_company ON gl_entity_segment_mappings(company_id);
CREATE INDEX idx_gl_entity_segment_mappings_segment ON gl_entity_segment_mappings(segment_id);
CREATE INDEX idx_gl_entity_segment_mappings_entity ON gl_entity_segment_mappings(entity_type, entity_id);

-- Enable RLS
ALTER TABLE gl_entity_segment_mappings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view GL entity segment mappings"
  ON gl_entity_segment_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage GL entity segment mappings"
  ON gl_entity_segment_mappings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_gl_entity_segment_mappings_updated_at
  BEFORE UPDATE ON gl_entity_segment_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE gl_entity_segment_mappings IS 'Centralized table mapping entities (departments, companies, etc.) to their GL segment codes';