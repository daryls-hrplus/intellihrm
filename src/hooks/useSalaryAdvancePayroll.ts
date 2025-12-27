import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PayrollQueueItem {
  id: string;
  company_id: string;
  pay_period_id: string | null;
  repayment_id: string;
  employee_id: string;
  advance_id: string;
  scheduled_amount: number;
  approved_amount: number | null;
  status: 'pending' | 'approved' | 'excluded' | 'processed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  exclusion_reason: string | null;
  payroll_run_id: string | null;
  payroll_line_item_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  employee?: { full_name: string; employee_id: string } | null;
  advance?: { advance_number: string; requested_amount: number } | null;
  repayment?: { period_number: number; due_date: string } | null;
}

export function useSalaryAdvancePayroll(companyId: string | null, payPeriodId?: string | null) {
  const [queueItems, setQueueItems] = useState<PayrollQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueueItems = useCallback(async () => {
    if (!companyId) return;
    
    let query = supabase
      .from('salary_advance_payroll_queue')
      .select(`
        *,
        employee:profiles!salary_advance_payroll_queue_employee_id_fkey(full_name, employee_id),
        advance:salary_advances(advance_number, requested_amount),
        repayment:salary_advance_repayments(period_number, due_date)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (payPeriodId) {
      query = query.eq('pay_period_id', payPeriodId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payroll queue:', error);
      return;
    }
    setQueueItems((data as unknown as PayrollQueueItem[]) || []);
  }, [companyId, payPeriodId]);

  useEffect(() => {
    if (companyId) {
      setIsLoading(true);
      fetchQueueItems().finally(() => setIsLoading(false));
    }
  }, [companyId, payPeriodId, fetchQueueItems]);

  // Queue pending repayments for a pay period (auto-include based on due date)
  const queueRepaymentsByDueDate = async (payPeriodStartDate: string, payPeriodEndDate: string, periodId: string) => {
    if (!companyId) return;

    // Get all pending repayments due within the pay period
    const { data: repayments, error: repError } = await supabase
      .from('salary_advance_repayments')
      .select(`
        id,
        salary_advance_id,
        scheduled_amount,
        due_date,
        salary_advances!inner(
          id,
          employee_id,
          company_id,
          status,
          advance_type_id,
          salary_advance_types(auto_include_in_payroll)
        )
      `)
      .eq('status', 'pending')
      .gte('due_date', payPeriodStartDate)
      .lte('due_date', payPeriodEndDate);

    if (repError) {
      console.error('Error fetching repayments:', repError);
      toast.error('Failed to fetch pending repayments');
      return;
    }

    // Filter to only this company's repayments with disbursed advances
    const companyRepayments = (repayments || []).filter((r: any) => 
      r.salary_advances?.company_id === companyId && 
      ['disbursed', 'repaying'].includes(r.salary_advances?.status)
    );

    if (companyRepayments.length === 0) {
      toast.info('No pending repayments due for this pay period');
      return;
    }

    // Check for existing queue items to avoid duplicates
    const { data: existingQueue } = await supabase
      .from('salary_advance_payroll_queue')
      .select('repayment_id')
      .eq('pay_period_id', periodId)
      .in('repayment_id', companyRepayments.map((r: any) => r.id));

    const existingIds = new Set((existingQueue || []).map((e: any) => e.repayment_id));

    // Create queue items for new repayments
    const newQueueItems = companyRepayments
      .filter((r: any) => !existingIds.has(r.id))
      .map((r: any) => ({
        company_id: companyId,
        pay_period_id: periodId,
        repayment_id: r.id,
        employee_id: r.salary_advances.employee_id,
        advance_id: r.salary_advance_id,
        scheduled_amount: r.scheduled_amount,
        status: r.salary_advances.salary_advance_types?.auto_include_in_payroll ? 'approved' : 'pending',
      }));

    if (newQueueItems.length === 0) {
      toast.info('All pending repayments are already queued');
      return;
    }

    const { error } = await supabase
      .from('salary_advance_payroll_queue')
      .insert(newQueueItems);

    if (error) {
      console.error('Error queuing repayments:', error);
      toast.error('Failed to queue repayments');
      return;
    }

    toast.success(`Queued ${newQueueItems.length} repayments for payroll`);
    fetchQueueItems();
  };

  // Approve a queue item for payroll deduction
  const approveQueueItem = async (id: string, approvedAmount?: number) => {
    const { data: userData } = await supabase.auth.getUser();
    const item = queueItems.find(q => q.id === id);
    
    const { error } = await supabase
      .from('salary_advance_payroll_queue')
      .update({
        status: 'approved',
        approved_amount: approvedAmount ?? item?.scheduled_amount,
        reviewed_by: userData?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve');
      throw error;
    }
    toast.success('Approved for payroll');
    fetchQueueItems();
  };

  // Exclude a queue item from payroll
  const excludeQueueItem = async (id: string, reason: string) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('salary_advance_payroll_queue')
      .update({
        status: 'excluded',
        exclusion_reason: reason,
        reviewed_by: userData?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to exclude');
      throw error;
    }
    toast.success('Excluded from payroll');
    fetchQueueItems();
  };

  // Bulk approve all pending items
  const approveAllPending = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const pendingIds = queueItems.filter(q => q.status === 'pending').map(q => q.id);
    
    if (pendingIds.length === 0) {
      toast.info('No pending items to approve');
      return;
    }

    const { error } = await supabase
      .from('salary_advance_payroll_queue')
      .update({
        status: 'approved',
        reviewed_by: userData?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .in('id', pendingIds);

    if (error) {
      toast.error('Failed to approve all');
      throw error;
    }
    toast.success(`Approved ${pendingIds.length} items`);
    fetchQueueItems();
  };

  // Mark queue items as processed after payroll run
  const markAsProcessed = async (ids: string[], payrollRunId: string) => {
    const { error } = await supabase
      .from('salary_advance_payroll_queue')
      .update({
        status: 'processed',
        payroll_run_id: payrollRunId,
      })
      .in('id', ids);

    if (error) {
      toast.error('Failed to update queue status');
      throw error;
    }

    // Also update the repayment records
    const repaymentIds = queueItems
      .filter(q => ids.includes(q.id))
      .map(q => q.repayment_id);

    await supabase
      .from('salary_advance_repayments')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
        payroll_run_id: payrollRunId,
      })
      .in('id', repaymentIds);

    // Update outstanding balances on advances
    for (const item of queueItems.filter(q => ids.includes(q.id))) {
      const amount = item.approved_amount || item.scheduled_amount;
      const { data: advance } = await supabase
        .from('salary_advances')
        .select('outstanding_balance')
        .eq('id', item.advance_id)
        .single();

      if (advance) {
        const newBalance = (advance.outstanding_balance || 0) - amount;
        await supabase
          .from('salary_advances')
          .update({
            outstanding_balance: Math.max(0, newBalance),
            status: newBalance <= 0 ? 'completed' : 'repaying',
            completed_at: newBalance <= 0 ? new Date().toISOString() : null,
          })
          .eq('id', item.advance_id);
      }
    }

    fetchQueueItems();
  };

  // Get summary stats
  const getStats = useCallback(() => {
    const pending = queueItems.filter(q => q.status === 'pending').length;
    const approved = queueItems.filter(q => q.status === 'approved').length;
    const excluded = queueItems.filter(q => q.status === 'excluded').length;
    const processed = queueItems.filter(q => q.status === 'processed').length;
    const totalApprovedAmount = queueItems
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + (q.approved_amount || q.scheduled_amount), 0);

    return { pending, approved, excluded, processed, totalApprovedAmount };
  }, [queueItems]);

  return {
    queueItems,
    isLoading,
    queueRepaymentsByDueDate,
    approveQueueItem,
    excludeQueueItem,
    approveAllPending,
    markAsProcessed,
    getStats,
    refresh: fetchQueueItems,
  };
}