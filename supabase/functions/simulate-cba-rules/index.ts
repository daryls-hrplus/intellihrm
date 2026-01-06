import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CBARule {
  id?: string;
  rule_name: string;
  rule_type: string;
  day_type?: string;
  condition_json?: Record<string, unknown> | null;
  value_numeric: number | null;
  value_text: string | null;
  priority: number;
  is_active: boolean;
  approximation_warning?: string | null;
  confidence_score?: number | null;
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
    is_approximation?: boolean;
  }[];
  total_pay_multiplier: number;
  violations: string[];
  limitations: string[];
}

// Supported rule types for full simulation
const SUPPORTED_SIMULATION_TYPES = ['overtime', 'shift_differential', 'max_hours', 'rest_period'];

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
        summary: { total_entries: 0, violations: 0, rules_applied: 0 },
        simulation_limitations: ["No active rules to simulate"]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze rule simulation capabilities
    const simulatableRules = activeRules.filter(r => SUPPORTED_SIMULATION_TYPES.includes(r.rule_type));
    const unsimulatedRuleTypes = [...new Set(activeRules.filter(r => !SUPPORTED_SIMULATION_TYPES.includes(r.rule_type)).map(r => r.rule_type))];
    const approximatedRules = activeRules.filter(r => r.approximation_warning);
    
    // Calculate simulation accuracy
    const simulationAccuracy = activeRules.length > 0 
      ? Math.round((simulatableRules.length / activeRules.length) * 100) 
      : 100;

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
        profiles!time_clock_entries_employee_id_fkey(full_name, first_name, last_name)
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
      const limitations: string[] = [];
      let payMultiplier = 1.0;

      for (const rule of activeRules) {
        // Get day type from rule - check both old and new schema
        const ruleDayType = rule.day_type || 
          (rule.condition_json && typeof rule.condition_json === 'object' 
            ? (rule.condition_json as Record<string, unknown>).day_type as string 
            : 'all');
        
        // Check if rule applies to this day type
        if (ruleDayType !== "all" && ruleDayType !== entryDayType) {
          continue;
        }

        const hoursWorked = entry.total_hours || 0;
        const isApproximation = !!rule.approximation_warning;

        // Check if this rule type can be simulated
        if (!SUPPORTED_SIMULATION_TYPES.includes(rule.rule_type)) {
          limitations.push(`Rule '${rule.rule_name}' (type: ${rule.rule_type}) cannot be simulated - manual review required`);
          continue;
        }

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
                is_approximation: isApproximation
              });
              payMultiplier = Math.max(payMultiplier, multiplier);
              totalRulesApplied++;
            }
            break;
          }

          case "shift_differential": {
            if ((ruleDayType === "night" && isNight) || 
                (ruleDayType === "weekend" && isWeekend) ||
                ruleDayType === "all") {
              const multiplier = rule.value_numeric || 1.1;
              rulesApplied.push({
                rule_name: rule.rule_name,
                rule_type: rule.rule_type,
                effect: `Shift differential ${multiplier}x applied`,
                additional_pay_multiplier: multiplier,
                is_approximation: isApproximation
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
                is_approximation: isApproximation
              });
              violations.push(violationMsg);
              totalViolations++;
              totalRulesApplied++;
            }
            break;
          }

          case "rest_period": {
            // Would need to check previous shift - add limitation
            limitations.push(`Rest period rule '${rule.rule_name}' requires multi-day analysis`);
            rulesApplied.push({
              rule_name: rule.rule_name,
              rule_type: rule.rule_type,
              effect: `Rest period rule checked (requires multi-day analysis)`,
              is_approximation: isApproximation
            });
            totalRulesApplied++;
            break;
          }
        }
      }

      // Add warning for approximated rules that were applied
      for (const rule of approximatedRules) {
        if (rulesApplied.some(ar => ar.rule_name === rule.rule_name)) {
          limitations.push(`⚠️ '${rule.rule_name}' is an approximation: ${rule.approximation_warning}`);
        }
      }

      if (rulesApplied.length > 0 || violations.length > 0 || limitations.length > 0) {
        const profile = entry.profiles as { full_name?: string; first_name?: string; last_name?: string } | null;
        const employeeName = profile?.full_name || 
          (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "Unknown");
        
        results.push({
          employee_id: entry.employee_id,
          employee_name: employeeName,
          date: entry.clock_in.split("T")[0],
          hours_worked: entry.total_hours || 0,
          rules_applied: rulesApplied,
          total_pay_multiplier: payMultiplier,
          violations,
          limitations: [...new Set(limitations)]
        });
      }
    }

    console.log(`Simulation complete: ${results.length} entries affected, ${totalViolations} violations, ${simulationAccuracy}% accuracy`);

    // Build simulation limitations summary
    const simulationLimitations: string[] = [];
    
    if (unsimulatedRuleTypes.length > 0) {
      simulationLimitations.push(`Cannot simulate rule types: ${unsimulatedRuleTypes.join(', ')}`);
    }
    
    if (approximatedRules.length > 0) {
      simulationLimitations.push(`${approximatedRules.length} rule(s) are approximations of more complex original rules`);
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      summary: {
        total_entries: timeEntries?.length || 0,
        entries_with_rules: results.length,
        violations: totalViolations,
        rules_applied: totalRulesApplied,
        date_range: { from: fromDate, to: toDate },
        rules_tested: simulatableRules.length,
        total_rules: activeRules.length,
        simulation_accuracy: simulationAccuracy,
        accuracy_explanation: simulationAccuracy < 100 
          ? `Only ${simulatableRules.length} of ${activeRules.length} rules can be fully simulated`
          : "All rules fully simulated"
      },
      simulation_limitations: simulationLimitations,
      unsimulated_rule_types: unsimulatedRuleTypes,
      approximated_rules: approximatedRules.map(r => ({
        rule_name: r.rule_name,
        warning: r.approximation_warning,
        confidence: r.confidence_score
      }))
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
