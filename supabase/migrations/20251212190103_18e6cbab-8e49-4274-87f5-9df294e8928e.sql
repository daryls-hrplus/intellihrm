-- Create a function to execute dynamic report SQL
-- This function is SECURITY DEFINER so it runs with elevated privileges
-- It should only be called by the edge function with validated SQL

CREATE OR REPLACE FUNCTION public.execute_report_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Execute the query and return results as JSONB array
  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql_query || ') t'
  INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'SQL execution error: %', SQLERRM;
END;
$$;

-- Revoke public access - only service role should call this
REVOKE ALL ON FUNCTION public.execute_report_sql(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.execute_report_sql(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.execute_report_sql(TEXT) FROM authenticated;

-- Grant to service role (used by edge functions)
GRANT EXECUTE ON FUNCTION public.execute_report_sql(TEXT) TO service_role;