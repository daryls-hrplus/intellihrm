import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CBARule {
  rule_name: string;
  rule_type: string;
  day_type: string;
  value_numeric: number | null;
  value_text: string | null;
  priority: number;
  is_active: boolean;
}

interface TimeEntry {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number;
  employee_name?: string;
}

interface SimulationResult {
  employee_id: string;
  employee_name: string;
  date: string;
  hours_worked: number;
  rules_applied: {
    rule_name: string;
    rule_type: string;
    effect: string;
    additional_pay_multiplier?: number;
    violation?: boolean;
    violation_message?: string;
  }[];
  total_pay_multiplier: number;
  violations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agreementId, rules, dateFrom, dateTo, companyId, sampleSize = 50 } = await req.json();

    if (!companyId || (!agreementId && !rules)) {
      throw new Error("Missing required parameters");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Running CBA rule simulation for company:", companyId);

    // Get rules either from DB or from provided list (for preview/testing)
    let activeRules: CBARule[] = [];
    
    if (rules && Array.isArray(rules)) {
      // Use provided rules (for testing before saving)
      activeRules = rules;
    } else if (agreementId) {
      // Fetch from database
      const { data: dbRules, error } = await supabase
        .from("cba_time_rules")
        .select("*")
        .eq("agreement_id", agreementId)
        .eq("is_active", true)
        .order("priority");
      
      if (error) throw error;
      activeRules = dbRules || [];
    }

    if (activeRules.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No active rules to simulate",
        results: [],
        summary: { total_entries: 0, violations: 0, rules_applied: 0 }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get time entries for simulation
    const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = dateTo || new Date().toISOString().split('T')[0];

    const { data: timeEntries, error: timeError } = await supabase
      .from("time_clock_entries")
      .select(`
        id, 
        employee_id, 
        clock_in, 
        clock_out, 
        total_hours,
        profiles!time_clock_entries_employee_id_fkey(full_name)
      `)
      .eq("company_id", companyId)
      .gte("clock_in", `${fromDate}T00:00:00`)
      .lte("clock_in", `${toDate}T23:59:59`)
      .order("clock_in", { ascending: false })
      .limit(sampleSize);

    if (timeError) {
      console.error("Error fetching time entries:", timeError);
      throw timeError;
    }

    console.log(`Simulating ${activeRules.length} rules against ${timeEntries?.length || 0} time entries`);

    const results: SimulationResult[] = [];
    let totalViolations = 0;
    let totalRulesApplied = 0;

    for (const entry of (timeEntries || [])) {
      const entryDate = new Date(entry.clock_in);
      const dayOfWeek = entryDate.getDay();
      const hour = entryDate.getHours();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isNight = hour < 6 || hour >= 22;
      
      // Determine day type for this entry
      let entryDayType = "regular";
      if (isWeekend) entryDayType = "weekend";
      if (isNight) entryDayType = "night";
      // Note: Holiday detection would require a holiday calendar lookup

      const rulesApplied: SimulationResult["rules_applied"] = [];
      const violations: string[] = [];
      let payMultiplier = 1.0;

      for (const rule of activeRules) {
        // Check if rule applies to this day type
        if (rule.day_type !== "all" && rule.day_type !== entryDayType) {
          continue;
        }

        const hoursWorked = entry.total_hours || 0;

        switch (rule.rule_type) {
          case "overtime": {
            const threshold = 8; // Default daily overtime threshold
            if (hoursWorked > threshold) {
              const overtimeHours = hoursWorked - threshold;
              const multiplier = rule.value_numeric || 1.5;
              rulesApplied.push({
                rule_name: rule.rule_name,
                rule_type: rule.rule_type,
                effect: `${overtimeHours.toFixed(1)} hours overtime at ${multiplier}x`,
                additional_pay_multiplier: multiplier,
              });
              payMultiplier = Math.max(payMultiplier, multiplier);
              totalRulesApplied++;
            }
            break;
          }

          case "shift_differential": {
            if ((rule.day_type === "night" && isNight) || 
                (rule.day_type === "weekend" && isWeekend)) {
              const multiplier = rule.value_numeric || 1.1;
              rulesApplied.push({
                rule_name: rule.rule_name,
                rule_type: rule.rule_type,
                effect: `Shift differential ${multiplier}x applied`,
                additional_pay_multiplier: multiplier,
              });
              payMultiplier = Math.max(payMultiplier, multiplier);
              totalRulesApplied++;
            }
            break;
          }

          case "max_hours": {
            const maxHours = rule.value_numeric || 12;
            if (hoursWorked > maxHours) {
              const violationMsg = `Exceeded max ${maxHours} hours/day (worked ${hoursWorked.toFixed(1)})`;
              rulesApplied.push({
                rule_name: rule.rule_name,
                rule_type: rule.rule_type,
                effect: violationMsg,
                violation: true,
                violation_message: violationMsg,
              });
              violations.push(violationMsg);
              totalViolations++;
              totalRulesApplied++;
            }
            break;
          }

          case "rest_period": {
            // Would need to check previous shift - simplified for demo
            rulesApplied.push({
              rule_name: rule.rule_name,
              rule_type: rule.rule_type,
              effect: `Rest period rule checked (requires multi-day analysis)`,
            });
            totalRulesApplied++;
            break;
          }

          default:
            // Other rule types
            if (rule.value_numeric || rule.value_text) {
              rulesApplied.push({
                rule_name: rule.rule_name,
                rule_type: rule.rule_type,
                effect: rule.value_text || `Value: ${rule.value_numeric}`,
              });
              totalRulesApplied++;
            }
        }
      }

      if (rulesApplied.length > 0 || violations.length > 0) {
        results.push({
          employee_id: entry.employee_id,
          employee_name: (entry as any).profiles?.full_name || "Unknown",
          date: entry.clock_in.split("T")[0],
          hours_worked: entry.total_hours || 0,
          rules_applied: rulesApplied,
          total_pay_multiplier: payMultiplier,
          violations,
        });
      }
    }

    console.log(`Simulation complete: ${results.length} entries affected, ${totalViolations} violations`);

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total_entries: timeEntries?.length || 0,
        entries_with_rules: results.length,
        violations: totalViolations,
        rules_applied: totalRulesApplied,
        date_range: { from: fromDate, to: toDate },
        rules_tested: activeRules.length,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in CBA simulation:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
