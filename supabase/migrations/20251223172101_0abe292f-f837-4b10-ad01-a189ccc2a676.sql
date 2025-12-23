-- Drop MRZ and overly technical fields that are unnecessary for Caribbean companies
ALTER TABLE public.employee_travel_documents 
  DROP COLUMN IF EXISTS mrz_line_1,
  DROP COLUMN IF EXISTS mrz_line_2,
  DROP COLUMN IF EXISTS mrz_surname,
  DROP COLUMN IF EXISTS mrz_given_names,
  DROP COLUMN IF EXISTS mrz_check_digit_valid,
  DROP COLUMN IF EXISTS machine_readable_name,
  DROP COLUMN IF EXISTS is_machine_readable,
  DROP COLUMN IF EXISTS visa_pages_remaining,
  DROP COLUMN IF EXISTS date_of_birth_on_doc,
  DROP COLUMN IF EXISTS gender_on_doc;