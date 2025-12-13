import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccrualRule {
  id: string;
  company_id: string;
  leave_type_id: string;
  accrual_frequency: string;
  accrual_amount: number;
  years_of_service_min: number;
  years_of_service_max: number | null;
  start_date: string;
  end_date: string | null;
}

interface Employee {
  id: string;
  company_id: string;
  hire_date: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { accrual_type = "daily" } = await req.json().catch(() => ({}));
    
    console.log(`Starting ${accrual_type} leave accrual job at ${new Date().toISOString()}`);

    const today = new Date().toISOString().split("T")[0];
    const isFirstOfMonth = new Date().getDate() === 1;

    // Get active accrual rules matching the frequency
    const frequencyFilter = accrual_type === "daily" 
      ? ["daily", "bi_weekly", "weekly"] 
      : ["monthly", "annually"];

    const { data: rules, error: rulesError } = await supabase
      .from("leave_accrual_rules")
      .select("*")
      .eq("is_active", true)
      .lte("start_date", today)
      .or(`end_date.is.null,end_date.gte.${today}`)
      .in("accrual_frequency", frequencyFilter);

    if (rulesError) {
      console.error("Error fetching accrual rules:", rulesError);
      throw rulesError;
    }

    if (!rules || rules.length === 0) {
      console.log(`No ${accrual_type} accrual rules found`);
      return new Response(
        JSON.stringify({ success: true, message: "No matching accrual rules", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${rules.length} ${accrual_type} accrual rules`);

    // Group rules by company
    const rulesByCompany = rules.reduce((acc: Record<string, AccrualRule[]>, rule: AccrualRule) => {
      if (!acc[rule.company_id]) acc[rule.company_id] = [];
      acc[rule.company_id].push(rule);
      return acc;
    }, {});

    let totalProcessed = 0;
    let totalErrors = 0;

    for (const [companyId, companyRules] of Object.entries(rulesByCompany)) {
      // Get active employees for this company
      const { data: employees, error: empError } = await supabase
        .from("profiles")
        .select("id, company_id, hire_date")
        .eq("company_id", companyId)
        .eq("is_active", true);

      if (empError) {
        console.error(`Error fetching employees for company ${companyId}:`, empError);
        continue;
      }

      if (!employees || employees.length === 0) {
        console.log(`No active employees in company ${companyId}`);
        continue;
      }

      console.log(`Processing ${employees.length} employees in company ${companyId}`);

      for (const employee of employees) {
        const yearsOfService = employee.hire_date
          ? Math.floor((Date.now() - new Date(employee.hire_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : 0;

        for (const rule of companyRules as AccrualRule[]) {
          // Check years of service eligibility
          if (yearsOfService < rule.years_of_service_min) continue;
          if (rule.years_of_service_max !== null && yearsOfService > rule.years_of_service_max) continue;

          // Calculate daily accrual amount
          let dailyAmount = 0;
          switch (rule.accrual_frequency) {
            case "daily":
              dailyAmount = rule.accrual_amount;
              break;
            case "weekly":
              dailyAmount = rule.accrual_amount / 7;
              break;
            case "bi_weekly":
              dailyAmount = rule.accrual_amount / 14;
              break;
            case "monthly":
              // Only accrue on first of month
              if (!isFirstOfMonth && accrual_type === "monthly") continue;
              dailyAmount = rule.accrual_amount;
              break;
            case "annually":
              // Only accrue on Jan 1st
              if (new Date().getMonth() !== 0 || new Date().getDate() !== 1) continue;
              dailyAmount = rule.accrual_amount;
              break;
            default:
              continue;
          }

          if (dailyAmount <= 0) continue;

          const currentYear = new Date().getFullYear();

          // Upsert leave balance
          const { error: upsertError } = await supabase.rpc("accrue_leave_balance", {
            p_employee_id: employee.id,
            p_company_id: companyId,
            p_leave_type_id: rule.leave_type_id,
            p_accrual_amount: dailyAmount,
            p_year: currentYear,
          });

          if (upsertError) {
            console.error(`Error accruing leave for employee ${employee.id}:`, upsertError);
            totalErrors++;
          } else {
            totalProcessed++;
          }
        }
      }
    }

    console.log(`Accrual job complete: ${totalProcessed} accruals processed, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${accrual_type} accrual completed`,
        processed: totalProcessed,
        errors: totalErrors,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Scheduled accrual error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
