-- Fix SECURITY DEFINER views to use SECURITY INVOKER
-- This ensures RLS policies are enforced based on the querying user, not the view creator

-- employee_fte_summary
ALTER VIEW public.employee_fte_summary SET (security_invoker = true);

-- position_budget_seat_reconciliation
ALTER VIEW public.position_budget_seat_reconciliation SET (security_invoker = true);

-- position_budget_seat_summary
ALTER VIEW public.position_budget_seat_summary SET (security_invoker = true);

-- position_seat_summary
ALTER VIEW public.position_seat_summary SET (security_invoker = true);

-- seat_occupancy_summary
ALTER VIEW public.seat_occupancy_summary SET (security_invoker = true);

-- secondment_tracking
ALTER VIEW public.secondment_tracking SET (security_invoker = true);