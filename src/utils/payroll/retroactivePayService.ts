import { supabase } from "@/integrations/supabase/client";

export interface RetroCalculationResult {
  success: boolean;
  count: number;
  totalAdjustment: number;
  calculations: GeneratedCalculation[];
  error?: string;
}

export interface GeneratedCalculation {
  config_id: string;
  employee_id: string;
  pay_period_id: string | null;
  pay_year: number;
  pay_cycle_number: number;
  pay_element_id: string;
  original_amount: number;
  increase_type: string;
  increase_value: number;
  adjustment_amount: number;
  employee_status: string;
  calculation_date: string;
}

export interface PendingRetroAmount {
  employee_id: string;
  config_id: string;
  config_name: string;
  pay_element_id: string;
  pay_element_name: string;
  pay_element_code: string;
  total_adjustment: number;
  calculation_count: number;
}

/**
 * Generate retroactive pay calculations for a given config.
 * This queries historical payroll data and applies the increase rules.
 */
export async function generateRetroactiveCalculations(
  configId: string
): Promise<RetroCalculationResult> {
  try {
    // Fetch config with items
    const { data: config, error: configError } = await supabase
      .from("retroactive_pay_configs")
      .select(`
        *,
        pay_group:pay_groups(id, name, code)
      `)
      .eq("id", configId)
      .single();

    if (configError || !config) {
      return { success: false, count: 0, totalAdjustment: 0, calculations: [], error: "Config not found" };
    }

    const { data: configItems, error: itemsError } = await supabase
      .from("retroactive_pay_config_items")
      .select(`*, pay_element:pay_elements(id, name, code)`)
      .eq("config_id", configId);

    if (itemsError || !configItems || configItems.length === 0) {
      return { success: false, count: 0, totalAdjustment: 0, calculations: [], error: "No config items found" };
    }

    // Get pay periods within the effective date range for this pay group
    const { data: payPeriods } = await supabase
      .from("pay_periods")
      .select("id, period_number, period_start, period_end")
      .eq("pay_group_id", config.pay_group_id)
      .gte("period_start", config.effective_start_date)
      .lte("period_end", config.effective_end_date)
      .order("period_start");

    if (!payPeriods || payPeriods.length === 0) {
      return { success: false, count: 0, totalAdjustment: 0, calculations: [], error: "No pay periods found in effective date range" };
    }

    const payPeriodIds = payPeriods.map(p => p.id);
    const payElementIds = configItems.map((item: any) => item.pay_element_id);

    // Fetch historical employee payroll data with calculation_details
    const { data: employeePayrolls, error: payrollError } = await supabase
      .from("employee_payroll")
      .select(`
        id,
        employee_id,
        pay_period_id,
        calculation_details,
        status
      `)
      .in("pay_period_id", payPeriodIds)
      .in("status", ["calculated", "approved", "paid"]);

    if (payrollError) {
      return { success: false, count: 0, totalAdjustment: 0, calculations: [], error: payrollError.message };
    }

    // Delete existing calculations for this config (regenerating)
    await supabase
      .from("retroactive_pay_calculations")
      .delete()
      .eq("config_id", configId);

    const calculations: GeneratedCalculation[] = [];
    const calculationDate = new Date().toISOString();

    for (const empPayroll of employeePayrolls || []) {
      const payPeriod = payPeriods.find(p => p.id === empPayroll.pay_period_id);
      if (!payPeriod) continue;

      const periodYear = new Date(payPeriod.period_start).getFullYear();
      const periodNumber = parseInt(payPeriod.period_number) || 1;

      // Parse calculation_details to find earnings
      const calcDetails = empPayroll.calculation_details as any;
      const earnings = calcDetails?.earnings || [];

      for (const item of configItems) {
        const payElementId = item.pay_element_id;
        const payElement = item.pay_element as any;

        // Find matching earnings by pay element code
        const matchingEarnings = earnings.filter((e: any) => 
          e.code === payElement?.code || e.pay_element_id === payElementId
        );

        for (const earning of matchingEarnings) {
          const originalAmount = earning.amount || 0;
          if (originalAmount <= 0) continue;

          let adjustmentAmount = 0;

          if (item.increase_type === "percentage") {
            adjustmentAmount = originalAmount * (item.increase_value / 100);
          } else if (item.increase_type === "fixed") {
            adjustmentAmount = item.increase_value;
          }

          // Apply min/max constraints
          if (item.min_amount !== null && adjustmentAmount < item.min_amount) {
            adjustmentAmount = item.min_amount;
          }
          if (item.max_amount !== null && adjustmentAmount > item.max_amount) {
            adjustmentAmount = item.max_amount;
          }

          if (adjustmentAmount > 0) {
            calculations.push({
              config_id: configId,
              employee_id: empPayroll.employee_id,
              pay_period_id: empPayroll.pay_period_id,
              pay_year: periodYear,
              pay_cycle_number: periodNumber,
              pay_element_id: payElementId,
              original_amount: originalAmount,
              increase_type: item.increase_type,
              increase_value: item.increase_value,
              adjustment_amount: adjustmentAmount,
              employee_status: "active",
              calculation_date: calculationDate,
            });
          }
        }
      }
    }

    // Insert calculations into database
    if (calculations.length > 0) {
      const { error: insertError } = await supabase
        .from("retroactive_pay_calculations")
        .insert(calculations);

      if (insertError) {
        return { success: false, count: 0, totalAdjustment: 0, calculations: [], error: insertError.message };
      }
    }

    const totalAdjustment = calculations.reduce((sum, c) => sum + c.adjustment_amount, 0);

    return {
      success: true,
      count: calculations.length,
      totalAdjustment,
      calculations,
    };
  } catch (err: any) {
    return { success: false, count: 0, totalAdjustment: 0, calculations: [], error: err.message };
  }
}

/**
 * Fetch pending (unprocessed) retro amounts for employees in a pay group.
 * These are calculations that have been generated but not yet included in a payroll run.
 * Respects targeting options: run type, target period, and auto_include flag.
 */
export async function fetchPendingRetroAmounts(
  payGroupId: string,
  options?: {
    runType?: string;
    payPeriodId?: string;
    includeManual?: boolean; // If true, include configs with auto_include=false
  }
): Promise<PendingRetroAmount[]> {
  try {
    // Get approved configs for this pay group with unprocessed calculations
    let configQuery = supabase
      .from("retroactive_pay_configs")
      .select("id, config_name, target_run_types, target_pay_period_id, auto_include")
      .eq("pay_group_id", payGroupId)
      .eq("status", "approved");
    
    // Filter by auto_include unless explicitly including manual
    if (!options?.includeManual) {
      configQuery = configQuery.eq("auto_include", true);
    }
    
    const { data: configs } = await configQuery;

    if (!configs || configs.length === 0) return [];
    
    // Filter configs based on targeting options
    const filteredConfigs = configs.filter((c: any) => {
      // Check run type if provided
      if (options?.runType && c.target_run_types) {
        if (!c.target_run_types.includes(options.runType)) {
          return false;
        }
      }
      
      // Check target period if config has one
      if (c.target_pay_period_id) {
        if (!options?.payPeriodId || c.target_pay_period_id !== options.payPeriodId) {
          return false;
        }
      }
      
      return true;
    });
    
    if (filteredConfigs.length === 0) return [];

    const configIds = filteredConfigs.map((c: any) => c.id);
    const configNameMap = new Map(filteredConfigs.map((c: any) => [c.id, c.config_name]));

    // Fetch unprocessed calculations
    const { data: calculations, error } = await supabase
      .from("retroactive_pay_calculations")
      .select(`
        *,
        pay_element:pay_elements(id, name, code)
      `)
      .in("config_id", configIds)
      .is("processed_in_run_id", null);

    if (error || !calculations) return [];

    // Group by employee and pay element
    const grouped = new Map<string, PendingRetroAmount>();

    for (const calc of calculations) {
      const key = `${calc.employee_id}_${calc.pay_element_id}`;
      const payElement = calc.pay_element as any;

      if (!grouped.has(key)) {
        grouped.set(key, {
          employee_id: calc.employee_id,
          config_id: calc.config_id,
          config_name: configNameMap.get(calc.config_id) || "Unknown",
          pay_element_id: calc.pay_element_id,
          pay_element_name: payElement?.name || "Unknown",
          pay_element_code: payElement?.code || "",
          total_adjustment: 0,
          calculation_count: 0,
        });
      }

      const entry = grouped.get(key)!;
      entry.total_adjustment += calc.adjustment_amount;
      entry.calculation_count += 1;
    }

    return Array.from(grouped.values());
  } catch (err) {
    console.error("Error fetching pending retro amounts:", err);
    return [];
  }
}

/**
 * Fetch pending retro amounts for a specific employee.
 * Respects targeting options: run type, target period, and auto_include flag.
 */
export async function fetchEmployeePendingRetro(
  employeeId: string,
  payGroupId: string,
  options?: {
    runType?: string;
    payPeriodId?: string;
    includeManual?: boolean;
  }
): Promise<{
  total: number;
  items: Array<{
    config_name: string;
    pay_element_name: string;
    adjustment_amount: number;
    period_count: number;
  }>;
}> {
  try {
    let configQuery = supabase
      .from("retroactive_pay_configs")
      .select("id, config_name, target_run_types, target_pay_period_id, auto_include")
      .eq("pay_group_id", payGroupId)
      .eq("status", "approved");
    
    if (!options?.includeManual) {
      configQuery = configQuery.eq("auto_include", true);
    }
    
    const { data: configs } = await configQuery;

    if (!configs || configs.length === 0) return { total: 0, items: [] };
    
    // Filter configs based on targeting options
    const filteredConfigs = configs.filter((c: any) => {
      if (options?.runType && c.target_run_types) {
        if (!c.target_run_types.includes(options.runType)) {
          return false;
        }
      }
      if (c.target_pay_period_id) {
        if (!options?.payPeriodId || c.target_pay_period_id !== options.payPeriodId) {
          return false;
        }
      }
      return true;
    });
    
    if (filteredConfigs.length === 0) return { total: 0, items: [] };

    const configIds = filteredConfigs.map((c: any) => c.id);
    const configNameMap = new Map(filteredConfigs.map((c: any) => [c.id, c.config_name]));

    const { data: calculations } = await supabase
      .from("retroactive_pay_calculations")
      .select(`
        *,
        pay_element:pay_elements(id, name, code)
      `)
      .eq("employee_id", employeeId)
      .in("config_id", configIds)
      .is("processed_in_run_id", null);

    if (!calculations || calculations.length === 0) return { total: 0, items: [] };

    // Group by config + pay element
    const grouped = new Map<string, {
      config_name: string;
      pay_element_name: string;
      adjustment_amount: number;
      period_count: number;
    }>();

    let total = 0;

    for (const calc of calculations) {
      const key = `${calc.config_id}_${calc.pay_element_id}`;
      const payElement = calc.pay_element as any;

      if (!grouped.has(key)) {
        grouped.set(key, {
          config_name: configNameMap.get(calc.config_id) || "Unknown",
          pay_element_name: payElement?.name || "Unknown",
          adjustment_amount: 0,
          period_count: 0,
        });
      }

      const entry = grouped.get(key)!;
      entry.adjustment_amount += calc.adjustment_amount;
      entry.period_count += 1;
      total += calc.adjustment_amount;
    }

    return {
      total,
      items: Array.from(grouped.values()),
    };
  } catch (err) {
    console.error("Error fetching employee pending retro:", err);
    return { total: 0, items: [] };
  }
}

/**
 * Mark retro calculations as processed in a payroll run
 */
export async function markRetroAsProcessed(
  employeeId: string,
  payGroupId: string,
  payrollRunId: string
): Promise<boolean> {
  try {
    const { data: configs } = await supabase
      .from("retroactive_pay_configs")
      .select("id")
      .eq("pay_group_id", payGroupId)
      .eq("status", "approved");

    if (!configs || configs.length === 0) return true;

    const configIds = configs.map(c => c.id);

    const { error } = await supabase
      .from("retroactive_pay_calculations")
      .update({
        processed_in_run_id: payrollRunId,
        processed_at: new Date().toISOString(),
      })
      .eq("employee_id", employeeId)
      .in("config_id", configIds)
      .is("processed_in_run_id", null);

    return !error;
  } catch (err) {
    console.error("Error marking retro as processed:", err);
    return false;
  }
}
