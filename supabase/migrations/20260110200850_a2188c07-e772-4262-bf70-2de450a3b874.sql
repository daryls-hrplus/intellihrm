-- Drop existing function and recreate with correct table scoping
DROP FUNCTION IF EXISTS public.get_purge_statistics(uuid, text);

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
  v_table_name text;
  v_total bigint;
  v_protected bigint;
  v_deletable bigint;
  v_query text;
  
  -- Define table lists for each purge level
  v_transactions_tables text[] := ARRAY[
    'time_clock_entries',
    'attendance_records', 
    'leave_requests',
    'leave_request_history',
    'payroll_run_details',
    'payroll_runs',
    'goal_updates',
    'goal_comments',
    'goal_milestones',
    'goals',
    'appraisal_section_responses',
    'appraisal_participants',
    'appraisal_cycles',
    'notification_logs',
    'employee_notifications',
    'shift_assignments',
    'shift_swaps',
    'shift_swap_requests',
    'overtime_requests'
  ];
  
  v_non_seed_tables text[] := ARRAY[
    'employee_skills',
    'employee_certifications',
    'employee_positions',
    'employee_contracts',
    'employee_banking_details',
    'employee_dependents',
    'employee_emergency_contacts',
    'leave_balances',
    'employee_documents',
    'employee_job_history',
    'employee_addresses',
    'employee_work_schedules'
  ];
  
  v_complete_reset_tables text[] := ARRAY[
    'profiles',
    'departments',
    'positions',
    'companies',
    'cost_centers',
    'locations',
    'job_grades',
    'job_families'
  ];
  
  v_target_tables text[];
BEGIN
  -- Determine which tables to scan based on purge level
  IF p_purge_level = 'transactions_only' THEN
    v_target_tables := v_transactions_tables;
  ELSIF p_purge_level = 'all_non_seed' THEN
    v_target_tables := v_transactions_tables || v_non_seed_tables;
  ELSIF p_purge_level = 'complete_reset' THEN
    v_target_tables := v_transactions_tables || v_non_seed_tables || v_complete_reset_tables;
  ELSE
    v_target_tables := v_transactions_tables;
  END IF;

  -- Iterate only over target tables
  FOREACH v_table_name IN ARRAY v_target_tables
  LOOP
    -- Check if table exists
    IF EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND information_schema.tables.table_name = v_table_name
    ) THEN
      -- Count total records (with optional company filter)
      IF p_company_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND information_schema.columns.table_name = v_table_name 
          AND column_name = 'company_id'
      ) THEN
        EXECUTE format('SELECT COUNT(*) FROM public.%I WHERE company_id = $1', v_table_name)
        INTO v_total
        USING p_company_id;
      ELSE
        EXECUTE format('SELECT COUNT(*) FROM public.%I', v_table_name)
        INTO v_total;
      END IF;
      
      -- For now, no records are protected within target tables
      v_protected := 0;
      v_deletable := v_total;
      
      -- Only return tables with records
      IF v_total > 0 THEN
        table_name := v_table_name;
        total_records := v_total;
        protected_records := v_protected;
        deletable_records := v_deletable;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;