import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AggregatorRequest {
  action: 'aggregate_cycle' | 'aggregate_dimension' | 'get_aggregates';
  cycle_id?: string;
  company_id: string;
  dimension?: string;
  min_group_size?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, cycle_id, company_id, dimension, min_group_size = 5 }: AggregatorRequest = await req.json();

    console.log(`[feedback-analytics-aggregator] Action: ${action}`);

    if (action === 'aggregate_cycle' && cycle_id) {
      // Get all signal snapshots for this cycle
      const { data: snapshots, error } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          *,
          signal_definition:talent_signal_definitions(code, name, signal_category),
          employee:profiles(id, department_id, departments(name))
        `)
        .eq('source_cycle_id', cycle_id)
        .eq('is_current', true);

      if (error) throw error;

      if (!snapshots || snapshots.length < min_group_size) {
        return new Response(
          JSON.stringify({ 
            error: `Insufficient data for aggregation (${snapshots?.length || 0} < ${min_group_size})`,
            anonymity_threshold_not_met: true
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Aggregate by signal type
      const bySignal: Record<string, { values: number[]; employees: Set<string> }> = {};
      
      for (const snapshot of snapshots) {
        const code = snapshot.signal_definition?.code || 'unknown';
        if (!bySignal[code]) {
          bySignal[code] = { values: [], employees: new Set() };
        }
        bySignal[code].values.push(snapshot.signal_value);
        bySignal[code].employees.add(snapshot.employee_id);
      }

      // Get cycle date range
      const { data: cycle } = await supabase
        .from('feedback_360_cycles')
        .select('start_date, end_date')
        .eq('id', cycle_id)
        .single();

      const aggregates = [];
      for (const [signalCode, data] of Object.entries(bySignal)) {
        if (data.employees.size < min_group_size) continue; // Skip if below threshold

        const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
        
        aggregates.push({
          company_id,
          aggregation_dimension: 'cycle',
          dimension_value: cycle_id,
          signal_type: signalCode,
          period_start: cycle?.start_date || new Date().toISOString().split('T')[0],
          period_end: cycle?.end_date || new Date().toISOString().split('T')[0],
          avg_score: parseFloat(avg.toFixed(2)),
          sample_size: data.employees.size,
          trend_direction: 'stable', // Would need historical data
          trend_percentage: 0,
          anonymity_threshold_met: data.employees.size >= min_group_size,
          computed_at: new Date().toISOString()
        });
      }

      // Insert aggregates
      if (aggregates.length > 0) {
        const { error: insertError } = await supabase
          .from('org_signal_aggregates')
          .upsert(aggregates, { onConflict: 'company_id,aggregation_dimension,dimension_value,signal_type' });
        
        if (insertError) throw insertError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          aggregates_created: aggregates.length,
          total_employees: new Set(snapshots.map(s => s.employee_id)).size
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'aggregate_dimension' && dimension) {
      // Get snapshots grouped by dimension (department, location, etc.)
      const { data: snapshots, error } = await supabase
        .from('talent_signal_snapshots')
        .select(`
          *,
          signal_definition:talent_signal_definitions(code, name),
          employee:profiles(department_id, departments(name))
        `)
        .eq('company_id', company_id)
        .eq('is_current', true);

      if (error) throw error;

      // Group by dimension value
      const byDimension: Record<string, Record<string, { values: number[]; employees: Set<string> }>> = {};

      for (const snapshot of snapshots || []) {
        let dimensionValue = 'Unknown';
        
        if (dimension === 'department') {
          dimensionValue = (snapshot.employee as any)?.departments?.name || 'Unknown';
        }
        // Add more dimension types as needed

        const signalCode = snapshot.signal_definition?.code || 'unknown';

        if (!byDimension[dimensionValue]) {
          byDimension[dimensionValue] = {};
        }
        if (!byDimension[dimensionValue][signalCode]) {
          byDimension[dimensionValue][signalCode] = { values: [], employees: new Set() };
        }

        byDimension[dimensionValue][signalCode].values.push(snapshot.signal_value);
        byDimension[dimensionValue][signalCode].employees.add(snapshot.employee_id);
      }

      const aggregates = [];
      const today = new Date().toISOString().split('T')[0];

      for (const [dimValue, signals] of Object.entries(byDimension)) {
        for (const [signalCode, data] of Object.entries(signals)) {
          if (data.employees.size < min_group_size) continue;

          const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;

          aggregates.push({
            company_id,
            aggregation_dimension: dimension,
            dimension_value: dimValue,
            signal_type: signalCode,
            period_start: today,
            period_end: today,
            avg_score: parseFloat(avg.toFixed(2)),
            sample_size: data.employees.size,
            trend_direction: 'stable',
            trend_percentage: 0,
            anonymity_threshold_met: true,
            computed_at: new Date().toISOString()
          });
        }
      }

      if (aggregates.length > 0) {
        await supabase.from('org_signal_aggregates').upsert(aggregates);
      }

      return new Response(
        JSON.stringify({
          success: true,
          dimension,
          aggregates_created: aggregates.length,
          dimensions_analyzed: Object.keys(byDimension).length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_aggregates') {
      let query = supabase
        .from('org_signal_aggregates')
        .select('*')
        .eq('company_id', company_id)
        .eq('anonymity_threshold_met', true)
        .order('computed_at', { ascending: false });

      if (dimension) {
        query = query.eq('aggregation_dimension', dimension);
      }

      const { data, error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ aggregates: data || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[feedback-analytics-aggregator] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
