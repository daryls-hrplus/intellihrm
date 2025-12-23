-- Add filter_condition column to reminder_event_types table
ALTER TABLE reminder_event_types 
ADD COLUMN filter_condition JSONB DEFAULT NULL;

COMMENT ON COLUMN reminder_event_types.filter_condition IS 
'JSON object containing field-value pairs to filter source table records. E.g., {"category": "certificate_of_character"}';

-- Insert CHARACTER_CERTIFICATE_EXPIRY event type with filter condition
INSERT INTO reminder_event_types (
  code, 
  name, 
  description, 
  category, 
  source_table, 
  date_field, 
  filter_condition,
  is_system, 
  is_active
) VALUES (
  'CHARACTER_CERTIFICATE_EXPIRY',
  'Character Certificate Expiring',
  'Reminder specifically for police certificate, good conduct, or character reference certificate expiry dates',
  'document',
  'employee_background_checks',
  'expiry_date',
  '{"category": "certificate_of_character"}'::jsonb,
  true,
  true
);