-- Drop the problematic view and function
DROP VIEW IF EXISTS public.table_dependency_order CASCADE;
DROP FUNCTION IF EXISTS public.get_table_dependency_order() CASCADE;

-- Create a simpler function that returns table info without recursion issues
CREATE OR REPLACE FUNCTION public.get_populated_tables_info()
RETURNS TABLE (
  table_name text,
  record_count bigint,
  has_company_id boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::text,
    (xpath('/row/cnt/text()', xml_count))[1]::text::bigint AS record_count,
    EXISTS (
      SELECT 1 FROM information_schema.columns c 
      WHERE c.table_schema = 'public' 
      AND c.table_name = t.table_name 
      AND c.column_name = 'company_id'
    ) AS has_company_id
  FROM information_schema.tables t
  CROSS JOIN LATERAL (
    SELECT query_to_xml(
      format('SELECT COUNT(*) AS cnt FROM public.%I', t.table_name), 
      false, true, ''
    ) AS xml_count
  ) x
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  ORDER BY record_count DESC;
END;
$$;

-- Simplified get_purge_statistics that doesn't rely on the recursive view
CREATE OR REPLACE FUNCTION public.get_purge_statistics(
  p_company_id uuid DEFAULT NULL,
  p_purge_level text DEFAULT 'transactions_only'
)
RETURNS TABLE (
  table_name text,
  total_records bigint,
  protected_records bigint,
  deletable_records bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql text;
  v_table_name text;
  v_total bigint;
  v_protected bigint;
BEGIN
  -- Define tables by purge level
  -- transactions_only: time_entries, leave_requests, payroll_runs, goals, etc.
  -- all_non_seed: employees, departments, positions
  -- complete_reset: everything except lookup tables
  
  FOR v_table_name IN 
    SELECT t.table_name 
    FROM information_schema.tables t 
    WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN (
      'schema_migrations', 
      'spatial_ref_sys',
      'application_modules',
      'application_features',
      'system_roles'
    )
    ORDER BY t.table_name
  LOOP
    BEGIN
      -- Get total count
      EXECUTE format('SELECT COUNT(*) FROM public.%I', v_table_name) INTO v_total;
      
      -- Calculate protected records based on is_seeded column if exists
      BEGIN
        EXECUTE format(
          'SELECT COUNT(*) FROM public.%I WHERE is_seeded = true', 
          v_table_name
        ) INTO v_protected;
      EXCEPTION WHEN undefined_column THEN
        v_protected := 0;
      END;
      
      -- Filter by company if provided
      IF p_company_id IS NOT NULL THEN
        BEGIN
          EXECUTE format(
            'SELECT COUNT(*) FROM public.%I WHERE company_id = $1', 
            v_table_name
          ) INTO v_total USING p_company_id;
          
          EXECUTE format(
            'SELECT COUNT(*) FROM public.%I WHERE company_id = $1 AND is_seeded = true', 
            v_table_name
          ) INTO v_protected USING p_company_id;
        EXCEPTION WHEN undefined_column THEN
          -- Table doesn't have company_id, skip company filter
          NULL;
        END;
      END IF;
      
      IF v_total > 0 THEN
        table_name := v_table_name;
        total_records := v_total;
        protected_records := COALESCE(v_protected, 0);
        deletable_records := v_total - COALESCE(v_protected, 0);
        RETURN NEXT;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Skip tables with issues
      NULL;
    END;
  END LOOP;
  
  RETURN;
END;
$$;