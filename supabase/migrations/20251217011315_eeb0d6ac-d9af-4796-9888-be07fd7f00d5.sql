
-- Add index on pay_element_id for better query performance
CREATE INDEX IF NOT EXISTS idx_payroll_line_items_pay_element 
ON public.payroll_line_items (pay_element_id);

-- Create archive tables for payroll data
CREATE TABLE IF NOT EXISTS public.payroll_runs_archive (
  LIKE public.payroll_runs INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.employee_payroll_archive (
  LIKE public.employee_payroll INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS public.payroll_line_items_archive (
  LIKE public.payroll_line_items INCLUDING ALL
);

-- Add archived_at column to track when data was archived
ALTER TABLE public.payroll_runs_archive ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.employee_payroll_archive ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.payroll_line_items_archive ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT now();

-- Create payroll archive settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.payroll_archive_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  archive_after_months INTEGER NOT NULL DEFAULT 24,
  auto_archive_enabled BOOLEAN DEFAULT false,
  last_archive_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS on archive tables
ALTER TABLE public.payroll_runs_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_payroll_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_line_items_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_archive_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for archive tables (admin only)
CREATE POLICY "Admins can view payroll_runs_archive"
ON public.payroll_runs_archive FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins can view employee_payroll_archive"
ON public.employee_payroll_archive FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

CREATE POLICY "Admins can view payroll_line_items_archive"
ON public.payroll_line_items_archive FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'hr_manager'));

-- RLS for archive settings
CREATE POLICY "Admins can manage archive settings"
ON public.payroll_archive_settings FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to archive payroll data
CREATE OR REPLACE FUNCTION public.archive_payroll_data(
  p_company_id UUID,
  p_archive_before_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_runs_archived INTEGER := 0;
  v_employee_payroll_archived INTEGER := 0;
  v_line_items_archived INTEGER := 0;
  v_run_ids UUID[];
  v_employee_payroll_ids UUID[];
BEGIN
  -- Get payroll runs to archive
  SELECT ARRAY_AGG(id) INTO v_run_ids
  FROM payroll_runs
  WHERE company_id = p_company_id
    AND status = 'paid'
    AND paid_at < p_archive_before_date;

  IF v_run_ids IS NULL OR array_length(v_run_ids, 1) IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'No payroll data to archive',
      'runs_archived', 0,
      'employee_payroll_archived', 0,
      'line_items_archived', 0
    );
  END IF;

  -- Get employee_payroll IDs for these runs
  SELECT ARRAY_AGG(id) INTO v_employee_payroll_ids
  FROM employee_payroll
  WHERE payroll_run_id = ANY(v_run_ids);

  -- Archive payroll_line_items
  WITH moved_items AS (
    INSERT INTO payroll_line_items_archive 
    SELECT pli.*, now() as archived_at
    FROM payroll_line_items pli
    WHERE pli.employee_payroll_id = ANY(v_employee_payroll_ids)
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_line_items_archived FROM moved_items;

  -- Delete from source
  DELETE FROM payroll_line_items WHERE employee_payroll_id = ANY(v_employee_payroll_ids);

  -- Archive employee_payroll
  WITH moved_ep AS (
    INSERT INTO employee_payroll_archive
    SELECT ep.*, now() as archived_at
    FROM employee_payroll ep
    WHERE ep.id = ANY(v_employee_payroll_ids)
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_employee_payroll_archived FROM moved_ep;

  -- Delete from source
  DELETE FROM employee_payroll WHERE id = ANY(v_employee_payroll_ids);

  -- Archive payroll_runs
  WITH moved_runs AS (
    INSERT INTO payroll_runs_archive
    SELECT pr.*, now() as archived_at
    FROM payroll_runs pr
    WHERE pr.id = ANY(v_run_ids)
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_runs_archived FROM moved_runs;

  -- Delete from source
  DELETE FROM payroll_runs WHERE id = ANY(v_run_ids);

  -- Update last archive run
  UPDATE payroll_archive_settings
  SET last_archive_run = now(), updated_at = now()
  WHERE company_id = p_company_id;

  RETURN jsonb_build_object(
    'success', true,
    'runs_archived', v_runs_archived,
    'employee_payroll_archived', v_employee_payroll_archived,
    'line_items_archived', v_line_items_archived,
    'archived_before', p_archive_before_date
  );
END;
$$;

-- Add index on archive tables for efficient querying
CREATE INDEX IF NOT EXISTS idx_payroll_runs_archive_company ON public.payroll_runs_archive(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_payroll_archive_employee ON public.employee_payroll_archive(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_line_items_archive_pay_element ON public.payroll_line_items_archive(pay_element_id);
