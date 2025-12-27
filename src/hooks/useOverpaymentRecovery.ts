import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type OverpaymentStatus = 
  | "pending_approval" 
  | "active" 
  | "suspended" 
  | "completed" 
  | "written_off" 
  | "cancelled";

export type OverpaymentPriority = "low" | "normal" | "high" | "urgent";

export interface OverpaymentRecord {
  id: string;
  company_id: string;
  employee_id: string;
  overpayment_date: string;
  discovery_date: string;
  reason: string;
  reason_details: string | null;
  original_amount: number;
  recovery_amount_per_cycle: number;
  total_recovered: number;
  remaining_balance: number;
  currency: string;
  status: OverpaymentStatus;
  priority: OverpaymentPriority;
  linked_deduction_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string | null;
  notes: string | null;
  scheduled_resume_date: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string | null;
  };
}

export interface OverpaymentStatusHistory {
  id: string;
  overpayment_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  reason: string | null;
  notes: string | null;
  created_at: string;
  changed_by_profile?: {
    full_name: string | null;
  };
}

export interface OverpaymentPayment {
  id: string;
  overpayment_id: string;
  pay_period_id: string | null;
  deduction_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  pay_period?: {
    period_start: string | null;
    period_end: string | null;
  };
}

export interface CreateOverpaymentInput {
  company_id: string;
  employee_id: string;
  overpayment_date: string;
  discovery_date?: string;
  reason: string;
  reason_details?: string;
  original_amount: number;
  recovery_amount_per_cycle: number;
  currency?: string;
  priority?: OverpaymentPriority;
  notes?: string;
  create_linked_deduction?: boolean;
}

export interface OverpaymentSummary {
  total_records: number;
  pending_approval: number;
  active_recoveries: number;
  suspended: number;
  total_outstanding: number;
  total_recovered: number;
}

export function useOverpaymentRecovery(companyId: string | null) {
  const [records, setRecords] = useState<OverpaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<OverpaymentSummary | null>(null);

  const fetchRecords = useCallback(async (status?: OverpaymentStatus) => {
    if (!companyId) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from("overpayment_records")
        .select(`
          *,
          employee:profiles!overpayment_records_employee_id_fkey(
            id, full_name
          )
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Cast data to our type
      const typedData = (data || []) as unknown as OverpaymentRecord[];
      setRecords(typedData);
    } catch (error: any) {
      console.error("Failed to fetch overpayment records:", error);
      toast.error("Failed to load overpayment records");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const fetchSummary = useCallback(async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from("overpayment_records")
        .select("status, remaining_balance, total_recovered")
        .eq("company_id", companyId);

      if (error) throw error;

      const summary: OverpaymentSummary = {
        total_records: data?.length || 0,
        pending_approval: data?.filter(r => r.status === "pending_approval").length || 0,
        active_recoveries: data?.filter(r => r.status === "active").length || 0,
        suspended: data?.filter(r => r.status === "suspended").length || 0,
        total_outstanding: data?.reduce((sum, r) => 
          ["pending_approval", "active", "suspended"].includes(r.status) 
            ? sum + Number(r.remaining_balance) 
            : sum, 0) || 0,
        total_recovered: data?.reduce((sum, r) => sum + Number(r.total_recovered), 0) || 0,
      };

      setSummary(summary);
    } catch (error: any) {
      console.error("Failed to fetch summary:", error);
    }
  }, [companyId]);

  const createRecord = async (input: CreateOverpaymentInput): Promise<OverpaymentRecord | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const insertData = {
        company_id: input.company_id,
        employee_id: input.employee_id,
        overpayment_date: input.overpayment_date,
        discovery_date: input.discovery_date || new Date().toISOString().split('T')[0],
        reason: input.reason,
        reason_details: input.reason_details || null,
        original_amount: input.original_amount,
        recovery_amount_per_cycle: input.recovery_amount_per_cycle,
        remaining_balance: input.original_amount,
        currency: input.currency || "USD",
        priority: input.priority || "normal",
        notes: input.notes || null,
        created_by: userData?.user?.id || null,
        status: "pending_approval" as OverpaymentStatus,
      };

      const { data, error } = await supabase
        .from("overpayment_records")
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Create initial status history
      await supabase.from("overpayment_status_history").insert({
        overpayment_id: data.id,
        new_status: "pending_approval",
        changed_by: userData?.user?.id || null,
        reason: "Record created",
      });

      // Optionally create linked regular deduction
      if (input.create_linked_deduction) {
        const { data: deductionData, error: deductionError } = await supabase
          .from("employee_regular_deductions")
          .insert({
            company_id: input.company_id,
            employee_id: input.employee_id,
            deduction_name: `Overpayment Recovery - ${input.reason}`,
            deduction_type: "overpayment_recovery",
            amount: input.recovery_amount_per_cycle,
            currency: input.currency || "USD",
            frequency: "per_pay_period",
            goal_amount: input.original_amount,
            is_active: false, // Will be activated when approved
          })
          .select()
          .single();

        if (!deductionError && deductionData) {
          await supabase
            .from("overpayment_records")
            .update({ linked_deduction_id: deductionData.id })
            .eq("id", data.id);
        }
      }

      toast.success("Overpayment record created");
      await fetchRecords();
      await fetchSummary();
      return data as unknown as OverpaymentRecord;
    } catch (error: any) {
      console.error("Failed to create overpayment record:", error);
      toast.error(`Failed to create record: ${error.message}`);
      return null;
    }
  };

  const approveRecord = async (id: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { error } = await supabase
        .from("overpayment_records")
        .update({
          status: "active",
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Update status history
      await supabase.from("overpayment_status_history").insert({
        overpayment_id: id,
        old_status: "pending_approval",
        new_status: "active",
        changed_by: userId,
        reason: "Recovery approved",
      });

      // Activate linked deduction if exists
      const { data: record } = await supabase
        .from("overpayment_records")
        .select("linked_deduction_id")
        .eq("id", id)
        .single();

      if (record?.linked_deduction_id) {
        await supabase
          .from("employee_regular_deductions")
          .update({ is_active: true })
          .eq("id", record.linked_deduction_id);
      }

      toast.success("Recovery approved and activated");
      await fetchRecords();
      await fetchSummary();
      return true;
    } catch (error: any) {
      console.error("Failed to approve record:", error);
      toast.error(`Failed to approve: ${error.message}`);
      return false;
    }
  };

  const suspendRecord = async (
    id: string, 
    reason: string, 
    scheduledResumeDate?: string,
    notes?: string
  ): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data: currentRecord } = await supabase
        .from("overpayment_records")
        .select("status, linked_deduction_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("overpayment_records")
        .update({
          status: "suspended",
          scheduled_resume_date: scheduledResumeDate || null,
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("overpayment_status_history").insert({
        overpayment_id: id,
        old_status: currentRecord?.status,
        new_status: "suspended",
        changed_by: userId,
        reason,
        notes,
      });

      // Deactivate linked deduction
      if (currentRecord?.linked_deduction_id) {
        await supabase
          .from("employee_regular_deductions")
          .update({ is_active: false })
          .eq("id", currentRecord.linked_deduction_id);
      }

      toast.success("Recovery suspended");
      await fetchRecords();
      await fetchSummary();
      return true;
    } catch (error: any) {
      console.error("Failed to suspend record:", error);
      toast.error(`Failed to suspend: ${error.message}`);
      return false;
    }
  };

  const resumeRecord = async (id: string, notes?: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data: currentRecord } = await supabase
        .from("overpayment_records")
        .select("status, linked_deduction_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("overpayment_records")
        .update({
          status: "active",
          scheduled_resume_date: null,
        })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("overpayment_status_history").insert({
        overpayment_id: id,
        old_status: currentRecord?.status,
        new_status: "active",
        changed_by: userId,
        reason: "Recovery resumed",
        notes,
      });

      // Reactivate linked deduction
      if (currentRecord?.linked_deduction_id) {
        await supabase
          .from("employee_regular_deductions")
          .update({ is_active: true })
          .eq("id", currentRecord.linked_deduction_id);
      }

      toast.success("Recovery resumed");
      await fetchRecords();
      await fetchSummary();
      return true;
    } catch (error: any) {
      console.error("Failed to resume record:", error);
      toast.error(`Failed to resume: ${error.message}`);
      return false;
    }
  };

  const modifyRecoveryAmount = async (
    id: string, 
    newAmount: number, 
    reason: string
  ): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data: currentRecord } = await supabase
        .from("overpayment_records")
        .select("recovery_amount_per_cycle, linked_deduction_id")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("overpayment_records")
        .update({ recovery_amount_per_cycle: newAmount })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("overpayment_status_history").insert({
        overpayment_id: id,
        old_status: null,
        new_status: "amount_modified",
        changed_by: userId,
        reason,
        notes: `Amount changed from ${currentRecord?.recovery_amount_per_cycle} to ${newAmount}`,
      });

      // Update linked deduction amount
      if (currentRecord?.linked_deduction_id) {
        await supabase
          .from("employee_regular_deductions")
          .update({ amount: newAmount })
          .eq("id", currentRecord.linked_deduction_id);
      }

      toast.success("Recovery amount updated");
      await fetchRecords();
      return true;
    } catch (error: any) {
      console.error("Failed to modify amount:", error);
      toast.error(`Failed to modify: ${error.message}`);
      return false;
    }
  };

  const writeOffRecord = async (id: string, reason: string): Promise<boolean> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data: currentRecord } = await supabase
        .from("overpayment_records")
        .select("status, linked_deduction_id, remaining_balance")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("overpayment_records")
        .update({ status: "written_off" })
        .eq("id", id);

      if (error) throw error;

      await supabase.from("overpayment_status_history").insert({
        overpayment_id: id,
        old_status: currentRecord?.status,
        new_status: "written_off",
        changed_by: userId,
        reason,
        notes: `Written off with remaining balance: ${currentRecord?.remaining_balance}`,
      });

      // Deactivate linked deduction
      if (currentRecord?.linked_deduction_id) {
        await supabase
          .from("employee_regular_deductions")
          .update({ is_active: false })
          .eq("id", currentRecord.linked_deduction_id);
      }

      toast.success("Balance written off");
      await fetchRecords();
      await fetchSummary();
      return true;
    } catch (error: any) {
      console.error("Failed to write off:", error);
      toast.error(`Failed to write off: ${error.message}`);
      return false;
    }
  };

  const fetchStatusHistory = async (overpaymentId: string): Promise<OverpaymentStatusHistory[]> => {
    try {
      const { data, error } = await supabase
        .from("overpayment_status_history")
        .select(`
          *,
          changed_by_profile:profiles!overpayment_status_history_changed_by_fkey(
            full_name
          )
        `)
        .eq("overpayment_id", overpaymentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OverpaymentStatusHistory[];
    } catch (error: any) {
      console.error("Failed to fetch status history:", error);
      return [];
    }
  };

  const fetchPayments = async (overpaymentId: string): Promise<OverpaymentPayment[]> => {
    try {
      const { data, error } = await supabase
        .from("overpayment_recovery_payments")
        .select(`
          *,
          pay_period:pay_periods(period_start, period_end)
        `)
        .eq("overpayment_id", overpaymentId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OverpaymentPayment[];
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      return [];
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchRecords();
      fetchSummary();
    }
  }, [companyId, fetchRecords, fetchSummary]);

  return {
    records,
    isLoading,
    summary,
    fetchRecords,
    fetchSummary,
    createRecord,
    approveRecord,
    suspendRecord,
    resumeRecord,
    modifyRecoveryAmount,
    writeOffRecord,
    fetchStatusHistory,
    fetchPayments,
  };
}
