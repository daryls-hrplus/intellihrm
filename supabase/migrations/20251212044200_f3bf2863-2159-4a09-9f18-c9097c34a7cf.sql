-- Create function to get direct reports for a manager
CREATE OR REPLACE FUNCTION public.get_manager_direct_reports(p_manager_id uuid)
RETURNS TABLE (
  employee_id uuid,
  employee_name text,
  employee_email text,
  position_title text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep_report.employee_id,
    p.full_name as employee_name,
    p.email as employee_email,
    pos_report.title as position_title
  FROM employee_positions ep_manager
  INNER JOIN positions pos_manager ON pos_manager.id = ep_manager.position_id
  INNER JOIN positions pos_report ON pos_report.reports_to_position_id = pos_manager.id
  INNER JOIN employee_positions ep_report ON ep_report.position_id = pos_report.id
  INNER JOIN profiles p ON p.id = ep_report.employee_id
  WHERE ep_manager.employee_id = p_manager_id
    AND ep_manager.is_active = true
    AND ep_report.is_active = true
    AND pos_manager.is_active = true
    AND pos_report.is_active = true;
END;
$$;