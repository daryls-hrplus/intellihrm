import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PurgeConfig {
  purgeLevel: 'transactions_only' | 'all_non_seed' | 'complete_reset';
  companyId?: string;
  dryRun?: boolean;
  confirmationToken?: string;
}

// Tables by purge level
const TRANSACTION_TABLES = [
  'time_clock_entries',
  'attendance_records',
  'leave_requests',
  'payroll_run_details',
  'payroll_runs',
  'goal_updates',
  'goal_comments',
  'goal_milestones',
  'goals',
  'appraisal_section_responses',
  'appraisal_participants',
  'audit_logs',
  'ai_interaction_logs',
  'ai_usage_logs',
  'notification_logs',
  'employee_notifications'
];

const NON_SEED_TABLES = [
  ...TRANSACTION_TABLES,
  'employee_skills',
  'employee_certifications',
  'employee_positions',
  'employee_contracts',
  'employee_banking_details',
  'employee_dependents',
  'employee_emergency_contacts',
  'leave_balances',
  'shift_swaps',
  'shift_swap_requests'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const config: PurgeConfig = await req.json();
    const { purgeLevel = 'transactions_only', companyId, dryRun = false } = config;

    console.log(`Starting purge with level: ${purgeLevel}, dryRun: ${dryRun}`);

    // Require confirmation token for non-dry-run
    if (!dryRun && !config.confirmationToken) {
      return new Response(JSON.stringify({
        error: 'Confirmation token required for destructive operations'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get table dependency order (reverse for deletion)
    const { data: dependencies, error: depError } = await supabase
      .from('table_dependency_order')
      .select('*')
      .order('depth', { ascending: false });

    if (depError) {
      console.error('Error fetching dependencies:', depError);
    }

    // Determine which tables to purge
    let tablesToPurge: string[] = [];
    switch (purgeLevel) {
      case 'transactions_only':
        tablesToPurge = TRANSACTION_TABLES;
        break;
      case 'all_non_seed':
        tablesToPurge = NON_SEED_TABLES;
        break;
      case 'complete_reset':
        // Use all tables from dependency order
        tablesToPurge = dependencies?.map(d => d.table_name) || NON_SEED_TABLES;
        break;
    }

    const results: { table: string; deleted: number; preserved: number }[] = [];
    let totalDeleted = 0;
    let totalPreserved = 0;
    const errors: string[] = [];

    // Process tables in reverse dependency order
    for (const tableName of tablesToPurge) {
      try {
        // Check if table exists
        const { count: tableExists } = await supabase
          .from(tableName as any)
          .select('*', { count: 'exact', head: true });

        if (tableExists === null) {
          console.log(`Table ${tableName} does not exist, skipping`);
          continue;
        }

        // Build delete query based on company_id and protection flags
        let query = supabase.from(tableName as any).select('id', { count: 'exact' });
        
        if (companyId) {
          query = query.eq('company_id', companyId);
        }

        // Get total count first
        const { count: totalCount } = await query;

        if (!totalCount || totalCount === 0) {
          continue;
        }

        // Check for protected records
        let protectedCount = 0;
        
        // Check is_system
        const { count: systemCount } = await supabase
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_system', true);
        protectedCount += systemCount || 0;

        // Check is_seeded
        const { count: seededCount } = await supabase
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_seeded', true);
        protectedCount += seededCount || 0;

        // Check is_default
        const { count: defaultCount } = await supabase
          .from(tableName as any)
          .select('id', { count: 'exact', head: true })
          .eq('is_default', true);
        protectedCount += defaultCount || 0;

        const deletableCount = Math.max(0, totalCount - protectedCount);

        if (dryRun) {
          results.push({
            table: tableName,
            deleted: deletableCount,
            preserved: protectedCount
          });
          totalDeleted += deletableCount;
          totalPreserved += protectedCount;
          continue;
        }

        // Perform actual deletion
        let deleteQuery = supabase.from(tableName as any).delete();
        
        if (companyId) {
          deleteQuery = deleteQuery.eq('company_id', companyId);
        }

        // Exclude protected records
        deleteQuery = deleteQuery
          .or('is_system.is.null,is_system.eq.false')
          .or('is_seeded.is.null,is_seeded.eq.false')
          .or('is_default.is.null,is_default.eq.false');

        const { error: deleteError, count: deletedCount } = await deleteQuery;

        if (deleteError) {
          console.error(`Error deleting from ${tableName}:`, deleteError);
          errors.push(`${tableName}: ${deleteError.message}`);
        } else {
          const deleted = deletedCount || deletableCount;
          results.push({
            table: tableName,
            deleted,
            preserved: protectedCount
          });
          totalDeleted += deleted;
          totalPreserved += protectedCount;
          console.log(`Deleted ${deleted} records from ${tableName}`);
        }
      } catch (tableError) {
        console.error(`Error processing ${tableName}:`, tableError);
        errors.push(`${tableName}: ${tableError.message}`);
      }
    }

    console.log(`Purge complete: ${totalDeleted} deleted, ${totalPreserved} preserved`);

    return new Response(JSON.stringify({
      success: errors.length === 0,
      tablesAffected: results.length,
      recordsDeleted: totalDeleted,
      preservedRecords: totalPreserved,
      errors,
      details: results,
      dryRun
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Purge error:', error);
    return new Response(JSON.stringify({
      success: false,
      tablesAffected: 0,
      recordsDeleted: 0,
      preservedRecords: 0,
      errors: [error.message],
      details: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
