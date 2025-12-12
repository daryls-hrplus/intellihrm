-- Fix the report number generation function
CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := to_char(CURRENT_DATE, 'YYYY');
  
  -- Extract sequence number from format 'RPT-YYYY-NNNNNN'
  -- The number starts at position 10 (after 'RPT-YYYY-')
  SELECT COALESCE(MAX(CAST(SUBSTRING(report_number FROM 10) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM generated_reports
  WHERE report_number LIKE 'RPT-' || year_prefix || '-%';
  
  NEW.report_number := 'RPT-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;