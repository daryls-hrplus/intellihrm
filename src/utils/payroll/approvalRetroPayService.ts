import { supabase } from "@/integrations/supabase/client";

/**
 * Service to generate retroactive pay configurations when a transaction is approved
 */

export interface ApprovalRetroPayResult {
  success: boolean;
  configId?: string;
  periodCount?: number;
  totalAmount?: number;
  error?: string;
}

/**
 * Generate a retroactive pay configuration when a transaction is approved.
 */
export async function generateApprovalTriggeredRetroPay(
  transactionId: string,
  approvalDate: string,
  approvedBy: string
): Promise<ApprovalRetroPayResult> {
  try {
    // Fetch the transaction details
    const { data: transaction, error: txnError } = await supabase
      .from("employee_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();
    
    // Fetch employee separately to avoid deep type inference
    let employeeCompanyId: string | null = null;
    if (transaction?.employee_id) {
      const { data: employee } = await supabase
        .from("profiles")
        .select("id, company_id")
        .eq("id", transaction.employee_id)
        .single();
      employeeCompanyId = employee?.company_id || null;
    }

    if (txnError || !transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Fetch pending compensation items linked to this transaction using RPC to avoid type issues
    const { data: pendingCompensation, error: compError } = await supabase
      .from("employee_compensation")
      .select("id, amount, pay_element_id")
      .filter("source_transaction_id", "eq", transactionId)
      .filter("approval_status", "eq", "pending");

    if (compError) {
      return { success: false, error: compError.message };
    }

    if (!pendingCompensation || pendingCompensation.length === 0) {
      return { success: true, configId: undefined, periodCount: 0, totalAmount: 0 };
    }

    // Get the employee's pay group
    const { data: payGroupAssignment } = await supabase
      .from("employee_pay_groups")
      .select("pay_group_id")
      .eq("employee_id", transaction.employee_id as string)
      .is("end_date", null)
      .maybeSingle();

    if (!payGroupAssignment?.pay_group_id) {
      await approveCompensationItems(pendingCompensation.map((c) => c.id));
      return { success: true, configId: undefined, periodCount: 0, totalAmount: 0 };
    }

    // Get company from pay group if not from employee
    let companyId = employeeCompanyId;
    if (!companyId) {
      const { data: payGroup } = await supabase
        .from("pay_groups")
        .select("company_id")
        .eq("id", payGroupAssignment.pay_group_id)
        .single();
      companyId = payGroup?.company_id || null;
    }
    
    if (!companyId) {
      return { success: false, error: "Could not determine company" };
    }

    const effectiveStartDate = (pendingCompensation[0] as any)?.pending_effective_date || 
      transaction.acting_start_date || transaction.effective_date;
    const effectiveEndDate = new Date(approvalDate);
    effectiveEndDate.setDate(effectiveEndDate.getDate() - 1);
    
    const startDate = new Date(effectiveStartDate);
    if (effectiveEndDate <= startDate) {
      await approveCompensationItems(pendingCompensation.map((c: any) => c.id));
      return { success: true, configId: undefined, periodCount: 0, totalAmount: 0 };
    }

    const { data: txnType } = await supabase
      .from("lookup_values")
      .select("code, name")
      .eq("id", transaction.transaction_type_id as string)
      .single();

    const { data: retroConfig, error: configError } = await supabase
      .from("retroactive_pay_configs")
      .insert({
        company_id: companyId,
        pay_group_id: payGroupAssignment.pay_group_id,
        config_name: `Retro Pay - ${txnType?.name || "Approved"} - ${transaction.transaction_number}`,
        description: `Auto-generated for transaction ${transaction.transaction_number}`,
        effective_start_date: effectiveStartDate,
        effective_end_date: effectiveEndDate.toISOString().split('T')[0],
        status: 'draft',
        target_run_types: ['off_cycle', 'regular'],
        auto_include: false,
        source_transaction_id: transactionId,
        is_approval_triggered: true,
        approval_date: approvalDate,
        created_by: approvedBy,
      } as any)
      .select()
      .single();

    if (configError || !retroConfig) {
      return { success: false, error: configError?.message || "Failed to create retro config" };
    }

    let totalAmount = 0;
    for (const comp of pendingCompensation) {
      const amount = comp.amount || 0;
      totalAmount += amount;

      await supabase.from("retroactive_pay_config_items").insert({
        config_id: retroConfig.id,
        pay_element_id: comp.pay_element_id,
        increase_type: "fixed_amount",
        increase_value: amount,
      } as any);
    }

    const { data: periods } = await supabase
      .from("pay_periods")
      .select("id")
      .gte("period_start", effectiveStartDate)
      .lte("period_end", effectiveEndDate.toISOString().split('T')[0]);

    await approveCompensationItems(pendingCompensation.map((c: any) => c.id));

    return {
      success: true,
      configId: retroConfig.id,
      periodCount: periods?.length || 0,
      totalAmount: totalAmount * (periods?.length || 0),
    };
  } catch (err) {
    console.error("Error generating approval-triggered retro pay:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function approveCompensationItems(compensationIds: string[]): Promise<void> {
  if (compensationIds.length === 0) return;

  for (const id of compensationIds) {
    const { data: comp } = await supabase
      .from("employee_compensation")
      .select("*")
      .eq("id", id)
      .single();

    const pendingDate = (comp as any)?.pending_effective_date;
    await supabase
      .from("employee_compensation")
      .update({ 
        approval_status: "approved",
        ...(pendingDate ? { start_date: pendingDate } : {})
      } as any)
      .eq("id", id);
  }
}

export async function rejectPendingCompensation(transactionId: string): Promise<boolean> {
  // First fetch the IDs, then update them to avoid complex type chains
  const { data: items } = await supabase
    .from("employee_compensation")
    .select("id")
    .filter("source_transaction_id", "eq", transactionId)
    .filter("approval_status", "eq", "pending");
  
  if (!items || items.length === 0) return true;
  
  for (const item of items) {
    await supabase
      .from("employee_compensation")
      .update({ approval_status: "rejected" } as any)
      .eq("id", item.id);
  }
  return true;
}

export async function hasPendingCompensation(transactionId: string): Promise<boolean> {
  const { data } = await supabase
    .from("employee_compensation")
    .select("id")
    .filter("source_transaction_id", "eq", transactionId)
    .filter("approval_status", "eq", "pending")
    .limit(1);
  return data && data.length > 0;
}
