-- Seed default behavioral anchors for 1-5 rating scale
-- These will be used as defaults for 360 feedback questions

-- First, get company IDs that have 360 cycles
INSERT INTO competency_behavioral_anchors (
  competency_id,
  company_id,
  scale_value,
  scale_label,
  anchor_text,
  examples
)
SELECT 
  c.id as competency_id,
  c.company_id,
  scale_data.scale_value,
  scale_data.scale_label,
  scale_data.anchor_text,
  scale_data.examples
FROM competencies c
CROSS JOIN (
  VALUES 
    (1, 'Needs Development', 'Rarely demonstrates this behavior; requires significant improvement', ARRAY['Avoids opportunities to demonstrate this competency', 'Struggles with basic aspects', 'Requires constant supervision or guidance']),
    (2, 'Below Expectations', 'Occasionally demonstrates but inconsistently', ARRAY['Shows behavior only when prompted', 'Needs frequent guidance', 'Quality or consistency falls short of expectations']),
    (3, 'Meets Expectations', 'Consistently demonstrates this behavior at expected level', ARRAY['Regularly applies in daily work', 'Maintains steady performance', 'Meets role requirements reliably']),
    (4, 'Exceeds Expectations', 'Frequently exceeds expectations and helps others', ARRAY['Goes above and beyond expectations', 'Coaches others in this area', 'Proactively identifies improvement opportunities']),
    (5, 'Exceptional', 'Role model; consistently exemplifies at highest level', ARRAY['Recognized as expert by peers', 'Drives organizational improvement', 'Sets the standard for others to follow'])
) AS scale_data(scale_value, scale_label, anchor_text, examples)
WHERE c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM competency_behavioral_anchors cba 
    WHERE cba.competency_id = c.id 
    AND cba.scale_value = scale_data.scale_value
  )
LIMIT 100; -- Limit to first 100 competencies to avoid excessive seeding