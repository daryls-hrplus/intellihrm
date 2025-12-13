
-- Fix function search path for generate_leave_request_number
CREATE OR REPLACE FUNCTION generate_leave_request_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.request_number := 'LR-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
