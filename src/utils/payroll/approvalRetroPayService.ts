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
      .select("*, employee:profiles!employee_transactions_employee_id_fkey(id, full_name, company_id)")
      .eq("id", transactionId)
      .single();

    if (txnError || !transaction) {
      return { success: false, error: "Transaction not found" };
    }

    // Fetch pending compensation items linked to this transaction
    const { data: pendingCompensation, error: compError } = await supabase
      .from("employee_compensation")
      .select("*, pay_element:pay_elements(id, name, code)")
      .eq("source_transaction_id" as any, transactionId)
      .eq("approval_status" as any, "pending");

    if (compError) {
      return { success: false, error: compError.message };
    }

    if (!pendingCompensation || pendingCompensation.length === 0) {
      return { success: true, configId: undefined, periodCount: 0, totalAmount: 0 };
    }

    // Get the employee's pay group
    const { data: payGroupAssignment } = await supabase
      .from("employee_pay_groups")
      .select("pay_group_id, pay_groups(id, name, code, company_id)")
      .eq("employee_id", transaction.employee_id as string)
      .is("end_date", null)
      .maybeSingle();

    if (!payGroupAssignment?.pay_group_id) {
      await approveCompensationItems(pendingCompensation.map((c: any) => c.id));
      return { success: true, configId: undefined, periodCount: 0, totalAmount: 0 };
    }

    const companyId = (transaction.employee as any)?.company_id || (payGroupAssignment.pay_groups as any)?.company_id;
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
  const { error } = await supabase
    .from("employee_compensation")
    .update({ approval_status: "rejected" } as any)
    .eq("source_transaction_id" as any, transactionId)
    .eq("approval_status" as any, "pending");
  return !error;
}

export async function hasPendingCompensation(transactionId: string): Promise<boolean> {
  const { data } = await supabase
    .from("employee_compensation")
    .select("id")
    .eq("source_transaction_id" as any, transactionId)
    .eq("approval_status" as any, "pending")
    .limit(1);
  return data && data.length > 0;
}
