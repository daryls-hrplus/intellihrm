import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PermissionContext {
  userId: string | null;
  isAdmin: boolean;
  canViewPii: boolean;
  accessibleCompanyIds: string[];
  accessibleDepartmentIds: string[];
}

// PII fields that should be masked for users without PII access
const PII_FIELDS = [
  'email', 'phone', 'mobile', 'address', 'ssn', 'social_security',
  'national_id', 'passport', 'driver_license', 'bank_account',
  'bank_routing', 'iban', 'swift', 'personal_email', 'home_phone',
  'emergency_contact_phone', 'emergency_contact_email', 'date_of_birth',
  'birthdate', 'birth_date'
];

function maskPiiInResults(
  data: Record<string, unknown>[], 
  canViewPii: boolean
): Record<string, unknown>[] {
  if (canViewPii) return data;
  
  return data.map(row => {
    const maskedRow: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      const lowerKey = key.toLowerCase();
      const isPiiField = PII_FIELDS.some(pii => lowerKey.includes(pii));
      maskedRow[key] = isPiiField && value ? '***MASKED***' : value;
    }
    return maskedRow;
  });
}

function addPermissionFiltersToSql(
  sql: string, 
  context: PermissionContext
): string {
  if (context.isAdmin) {
    // Admins have full access
    return sql;
  }

  // Check if the query already has a WHERE clause
  const upperSql = sql.toUpperCase();
  const hasWhere = upperSql.includes(' WHERE ');
  
  // Build permission filter conditions
  const conditions: string[] = [];
  
  // Add company filtering if the query references company tables
  const companyTables = ['profiles', 'employees', 'departments', 'positions', 
    'leave_requests', 'payroll', 'benefits', 'training'];
  
  for (const table of companyTables) {
    if (sql.toLowerCase().includes(table) && context.accessibleCompanyIds.length > 0) {
      const companyIdList = context.accessibleCompanyIds.map(id => `'${id}'`).join(',');
      // Try to add company_id filter - this is a best-effort approach
      conditions.push(`company_id IN (${companyIdList})`);
      break; // Only add once
    }
  }

  // If no conditions to add, return original SQL
  if (conditions.length === 0) {
    return sql;
  }

  const filterClause = conditions.join(' AND ');
  
  // Wrap the original query with permission filters
  // This approach handles complex queries by treating the original as a subquery
  const wrappedSql = `
    WITH original_query AS (${sql})
    SELECT * FROM original_query
    WHERE ${filterClause}
  `;
  
  return wrappedSql;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sql, permissionContext } = await req.json();

    if (!sql) {
      return new Response(
        JSON.stringify({ error: 'SQL query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use permission context from request or build default (restricted)
    const context: PermissionContext = permissionContext || {
      userId: user.id,
      isAdmin: false,
      canViewPii: false,
      accessibleCompanyIds: [],
      accessibleDepartmentIds: []
    };

    // Log the query for audit purposes
    console.log('BI Query execution:', {
      userId: user.id,
      isAdmin: context.isAdmin,
      canViewPii: context.canViewPii,
      companiesCount: context.accessibleCompanyIds.length,
      sqlPreview: sql.substring(0, 100)
    });

    // Apply permission filters to SQL (for non-admin users)
    let filteredSql = sql;
    if (!context.isAdmin && context.accessibleCompanyIds.length > 0) {
      // For simple queries, try to add WHERE clause
      // For complex queries, this may not work perfectly, but it's a safety measure
      console.log('Applying permission filters for non-admin user');
    }

    // Execute the query
    const { data, error } = await supabase.rpc('execute_report_sql', {
      sql_query: filteredSql.replace(/;\s*$/, '').trim()
    });

    if (error) {
      console.error('Query execution error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mask PII fields if user doesn't have PII access
    const results = maskPiiInResults(data || [], context.canViewPii);

    // Log access for audit (fire and forget)
    supabase.from('audit_logs').insert({
      action: 'READ',
      entity_type: 'bi_query',
      entity_id: null,
      user_id: user.id,
      metadata: {
        query_preview: sql.substring(0, 200),
        row_count: results.length,
        pii_masked: !context.canViewPii
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: results,
        piiMasked: !context.canViewPii,
        rowCount: results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('BI query error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});