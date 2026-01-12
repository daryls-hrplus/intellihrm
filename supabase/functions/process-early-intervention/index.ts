import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const result = { alertsCreated: 0, errors: [] as string[] };

    // Get enabled triggers
    const { data: triggers, error: triggersError } = await supabase
      .from("intervention_triggers")
      .select("*")
      .eq("is_enabled", true);

    if (triggersError) throw triggersError;

    for (const trigger of triggers || []) {
      try {
        if (trigger.trigger_type === "performance_drop") {
          // Check for significant performance drops
          const { data: drops } = await supabase
            .from("appraisal_participants")
            .select("employee_id, final_rating, cycle_id, appraisal_cycles!inner(company_id)")
            .not("final_rating", "is", null)
            .order("created_at", { ascending: false })
            .limit(100);

          // Group by employee and check for drops
          const employeeRatings: Record<string, number[]> = {};
          for (const d of drops || []) {
            if (!employeeRatings[d.employee_id]) employeeRatings[d.employee_id] = [];
            employeeRatings[d.employee_id].push(d.final_rating);
          }

          for (const [employeeId, ratings] of Object.entries(employeeRatings)) {
            if (ratings.length >= 2) {
              const drop = ratings[1] - ratings[0];
              if (drop >= (trigger.threshold_value || 20)) {
                await supabase.from("intervention_alerts").insert({
                  trigger_id: trigger.id,
                  employee_id: employeeId,
                  company_id: trigger.company_id,
                  current_value: ratings[0],
                  threshold_value: trigger.threshold_value,
                  severity: trigger.severity,
                  trigger_data: { previous_rating: ratings[1], current_rating: ratings[0], drop },
                });
                result.alertsCreated++;
              }
            }
          }
        }

        if (trigger.trigger_type === "goal_stall") {
          // Check for stalled goals
          const stalledDate = new Date(now.getTime() - (trigger.threshold_period_days || 30) * 24 * 60 * 60 * 1000);
          const { data: stalledGoals } = await supabase
            .from("goals")
            .select("id, employee_id, company_id, progress")
            .in("status", ["in_progress", "active"])
            .lt("updated_at", stalledDate.toISOString());

          for (const goal of stalledGoals || []) {
            // Check if alert already exists
            const { data: existing } = await supabase
              .from("intervention_alerts")
              .select("id")
              .eq("trigger_id", trigger.id)
              .eq("employee_id", goal.employee_id)
              .eq("status", "pending")
              .single();

            if (!existing) {
              await supabase.from("intervention_alerts").insert({
                trigger_id: trigger.id,
                employee_id: goal.employee_id,
                company_id: goal.company_id,
                current_value: goal.progress || 0,
                threshold_value: trigger.threshold_value,
                severity: trigger.severity,
                trigger_data: { goal_id: goal.id, days_stalled: trigger.threshold_period_days },
              });
              result.alertsCreated++;
            }
          }
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : "Unknown error";
        result.errors.push(`Trigger ${trigger.id}: ${errMsg}`);
      }
    }

    await supabase.from("ai_scheduled_job_runs").insert({
      job_name: "early-intervention",
      job_type: "intervention",
      status: result.errors.length > 0 ? "completed_with_errors" : "completed",
      started_at: now.toISOString(),
      completed_at: new Date().toISOString(),
      metrics_generated: result,
    });

    return new Response(JSON.stringify({ success: true, results: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
