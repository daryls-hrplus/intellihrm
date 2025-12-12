-- Grant execute permission on the SQL preview helper function to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_report_sql(sql_query text) TO authenticated;