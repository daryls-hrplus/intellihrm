-- Create a function to get table dependency order based on foreign keys
CREATE OR REPLACE FUNCTION public.get_table_dependency_order()
RETURNS TABLE(
  table_name text,
  depth int,
  parent_tables text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE table_deps AS (
    -- Base case: tables with no foreign key dependencies
    SELECT 
      t.table_name::text,
      0 as depth,
      ARRAY[]::text[] as parent_tables
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc 
          ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.table_constraints tc2 
          ON rc.unique_constraint_name = tc2.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = t.table_name
          AND tc.constraint_type = 'FOREIGN KEY'
          AND tc2.table_schema = 'public'
      )
    
    UNION
    
    -- Recursive case: tables that depend on already-processed tables
    SELECT 
      t.table_name::text,
      td.depth + 1,
      array_agg(DISTINCT tc2.table_name::text) as parent_tables
    FROM information_schema.tables t
    JOIN information_schema.table_constraints tc 
      ON t.table_name = tc.table_name AND t.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints rc 
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.table_constraints tc2 
      ON rc.unique_constraint_name = tc2.constraint_name
    JOIN table_deps td 
      ON tc2.table_name::text = td.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc2.table_schema = 'public'
    GROUP BY t.table_name, td.depth
  )
  SELECT DISTINCT ON (td.table_name)
    td.table_name,
    MAX(td.depth) as depth,
    COALESCE(
      (SELECT array_agg(DISTINCT tc2.table_name::text)
       FROM information_schema.table_constraints tc
       JOIN information_schema.referential_constraints rc 
         ON tc.constraint_name = rc.constraint_name
       JOIN information_schema.table_constraints tc2 
         ON rc.unique_constraint_name = tc2.constraint_name
       WHERE tc.table_schema = 'public'
         AND tc.table_name = td.table_name
         AND tc.constraint_type = 'FOREIGN KEY'
         AND tc2.table_schema = 'public'),
      ARRAY[]::text[]
    ) as parent_tables
  FROM table_deps td
  GROUP BY td.table_name
  ORDER BY td.table_name, depth DESC;
END;
$$;

-- Create a view for easy access to table dependency order
CREATE OR REPLACE VIEW public.table_dependency_order AS
SELECT * FROM public.get_table_dependency_order()
ORDER BY depth, table_name;

-- Add is_seeded column to help_video_categories if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'help_video_categories') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'help_video_categories' AND column_name = 'is_seeded') THEN
      ALTER TABLE public.help_video_categories ADD COLUMN is_seeded boolean DEFAULT false;
    END IF;
  END IF;
END $$;

-- Add is_seeded column to help_videos if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'help_videos') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'help_videos' AND column_name = 'is_seeded') THEN
      ALTER TABLE public.help_videos ADD COLUMN is_seeded boolean DEFAULT false;
    END IF;
  END IF;
END $$;

-- Create a helper function to identify seed/system records
CREATE OR REPLACE FUNCTION public.is_protected_record(
  p_table_name text,
  p_record_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_protected boolean := false;
BEGIN
  -- Check for is_system column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = p_table_name 
      AND column_name = 'is_system'
  ) THEN
    EXECUTE format('SELECT is_system FROM %I WHERE id = $1', p_table_name) 
    INTO v_is_protected USING p_record_id;
    IF v_is_protected THEN RETURN true; END IF;
  END IF;
  
  -- Check for is_seeded column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = p_table_name 
      AND column_name = 'is_seeded'
  ) THEN
    EXECUTE format('SELECT is_seeded FROM %I WHERE id = $1', p_table_name) 
    INTO v_is_protected USING p_record_id;
    IF v_is_protected THEN RETURN true; END IF;
  END IF;
  
  -- Check for is_default column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = p_table_name 
      AND column_name = 'is_default'
  ) THEN
    EXECUTE format('SELECT is_default FROM %I WHERE id = $1', p_table_name) 
    INTO v_is_protected USING p_record_id;
    IF v_is_protected THEN RETURN true; END IF;
  END IF;
  
  RETURN false;
END;
$$;

-- Create a function to get purge statistics (dry run)
CREATE OR REPLACE FUNCTION public.get_purge_statistics(
  p_company_id uuid DEFAULT NULL,
  p_purge_level text DEFAULT 'transactions_only'
)
RETURNS TABLE(
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
  v_table record;
  v_total bigint;
  v_protected bigint;
  v_deletable bigint;
  v_has_company_id boolean;
  v_has_is_system boolean;
  v_has_is_seeded boolean;
  v_has_is_default boolean;
BEGIN
  FOR v_table IN 
    SELECT t.table_name::text as tname
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT IN ('schema_migrations')
    ORDER BY t.table_name
  LOOP
    -- Check column existence
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = v_table.tname AND column_name = 'company_id'
    ) INTO v_has_company_id;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = v_table.tname AND column_name = 'is_system'
    ) INTO v_has_is_system;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = v_table.tname AND column_name = 'is_seeded'
    ) INTO v_has_is_seeded;
    
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = v_table.tname AND column_name = 'is_default'
    ) INTO v_has_is_default;
    
    -- Count total records
    IF p_company_id IS NOT NULL AND v_has_company_id THEN
      EXECUTE format('SELECT COUNT(*) FROM %I WHERE company_id = $1', v_table.tname) INTO v_total USING p_company_id;
    ELSE
      EXECUTE format('SELECT COUNT(*) FROM %I', v_table.tname) INTO v_total;
    END IF;
    
    -- Count protected records
    v_protected := 0;
    IF v_has_is_system THEN
      IF p_company_id IS NOT NULL AND v_has_company_id THEN
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE company_id = $1 AND is_system = true', v_table.tname) INTO v_deletable USING p_company_id;
      ELSE
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE is_system = true', v_table.tname) INTO v_deletable;
      END IF;
      v_protected := v_protected + COALESCE(v_deletable, 0);
    END IF;
    
    IF v_has_is_seeded THEN
      IF p_company_id IS NOT NULL AND v_has_company_id THEN
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE company_id = $1 AND is_seeded = true', v_table.tname) INTO v_deletable USING p_company_id;
      ELSE
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE is_seeded = true', v_table.tname) INTO v_deletable;
      END IF;
      v_protected := v_protected + COALESCE(v_deletable, 0);
    END IF;
    
    IF v_has_is_default THEN
      IF p_company_id IS NOT NULL AND v_has_company_id THEN
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE company_id = $1 AND is_default = true', v_table.tname) INTO v_deletable USING p_company_id;
      ELSE
        EXECUTE format('SELECT COUNT(*) FROM %I WHERE is_default = true', v_table.tname) INTO v_deletable;
      END IF;
      v_protected := v_protected + COALESCE(v_deletable, 0);
    END IF;
    
    table_name := v_table.tname;
    total_records := v_total;
    protected_records := v_protected;
    deletable_records := GREATEST(0, v_total - v_protected);
    
    IF v_total > 0 THEN
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_table_dependency_order() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_protected_record(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_purge_statistics(uuid, text) TO authenticated;
GRANT SELECT ON public.table_dependency_order TO authenticated;