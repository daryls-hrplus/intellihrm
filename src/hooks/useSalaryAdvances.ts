import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SalaryAdvanceType {
  id: string;
  company_id: string | null;
  name: string;
  code: string;
  description: string | null;
  max_amount: number | null;
  max_percentage_of_salary: number | null;
  interest_rate: number | null;
  max_repayment_periods: number | null;
  min_repayment_periods: number | null;
  requires_approval: boolean | null;
  max_per_year: number | null;
  waiting_period_days: number | null;
  eligible_after_months: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryAdvance {
  id: string;
  advance_number: string | null;
  company_id: string;
  employee_id: string;
  advance_type_id: string | null;
  requested_amount: number;
  approved_amount: number | null;
  interest_rate: number | null;
  total_repayment_amount: number | null;
  repayment_periods: number | null;
  repayment_amount_per_period: number | null;
  repayment_start_date: string | null;
  currency: string | null;
  reason: string | null;
  status: string;
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  rejection_reason: string | null;
  disbursed_at: string | null;
  disbursed_by: string | null;
  disbursement_method: string | null;
  disbursement_reference: string | null;
  completed_at: string | null;
  outstanding_balance: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: { full_name: string } | null;
  advance_type?: { name: string; code: string } | null;
  approver?: { full_name: string } | null;
}

export interface SalaryAdvanceRepayment {
  id: string;
  salary_advance_id: string;
  period_number: number;
  due_date: string;
  scheduled_amount: number;
  principal_amount: number | null;
  interest_amount: number | null;
  paid_amount: number | null;
  paid_date: string | null;
  payment_method: string | null;
  payroll_run_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useSalaryAdvances(companyId: string | null) {
  const [advanceTypes, setAdvanceTypes] = useState<SalaryAdvanceType[]>([]);
  const [advances, setAdvances] = useState<SalaryAdvance[]>([]);
  const [repayments, setRepayments] = useState<SalaryAdvanceRepayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvanceTypes = useCallback(async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('salary_advance_types')
      .select('*')
      .eq('company_id', companyId)
      .order('name');

    if (error) {
      console.error('Error fetching advance types:', error);
      return;
    }
    setAdvanceTypes(data || []);
  }, [companyId]);

  const fetchAdvances = useCallback(async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('salary_advances')
      .select(`
        *,
        employee:profiles!salary_advances_employee_id_fkey(full_name),
        advance_type:salary_advance_types(name, code),
        approver:profiles!salary_advances_approved_by_fkey(full_name)
      `)
      .eq('company_id', companyId)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error fetching advances:', error);
      return;
    }
    setAdvances((data as unknown as SalaryAdvance[]) || []);
  }, [companyId]);

  const fetchRepayments = useCallback(async (advanceId: string) => {
    const { data, error } = await supabase
      .from('salary_advance_repayments')
      .select('*')
      .eq('salary_advance_id', advanceId)
      .order('period_number');

    if (error) {
      console.error('Error fetching repayments:', error);
      return [];
    }
    return data || [];
  }, []);

  useEffect(() => {
    if (companyId) {
      setIsLoading(true);
      Promise.all([fetchAdvanceTypes(), fetchAdvances()]).finally(() => setIsLoading(false));
    }
  }, [companyId, fetchAdvanceTypes, fetchAdvances]);

  // Advance Type CRUD
  const createAdvanceType = async (data: Pick<SalaryAdvanceType, 'name' | 'code'> & Partial<Omit<SalaryAdvanceType, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'name' | 'code'>>) => {
    const { error } = await supabase
      .from('salary_advance_types')
      .insert([{ ...data, company_id: companyId! }]);

    if (error) {
      toast.error('Failed to create advance type');
      throw error;
    }
    toast.success('Advance type created');
    fetchAdvanceTypes();
  };

  const updateAdvanceType = async (id: string, data: Partial<SalaryAdvanceType>) => {
    const { error } = await supabase
      .from('salary_advance_types')
      .update(data)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update advance type');
      throw error;
    }
    toast.success('Advance type updated');
    fetchAdvanceTypes();
  };

  const deleteAdvanceType = async (id: string) => {
    const { error } = await supabase
      .from('salary_advance_types')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete advance type');
      throw error;
    }
    toast.success('Advance type deleted');
    fetchAdvanceTypes();
  };

  // Advance CRUD
  const createAdvance = async (data: Pick<SalaryAdvance, 'employee_id' | 'requested_amount'> & Partial<Omit<SalaryAdvance, 'id' | 'company_id' | 'created_at' | 'updated_at'>>) => {
    const { error } = await supabase
      .from('salary_advances')
      .insert([{ ...data, company_id: companyId! }]);

    if (error) {
      toast.error('Failed to create advance request');
      throw error;
    }
    toast.success('Advance request created');
    fetchAdvances();
  };

  const approveAdvance = async (id: string, approvedAmount: number, repaymentPeriods: number, repaymentStartDate: string) => {
    const advance = advances.find(a => a.id === id);
    if (!advance) return;

    const interestRate = advance.interest_rate || 0;
    const totalAmount = approvedAmount * (1 + interestRate);
    const perPeriod = totalAmount / repaymentPeriods;

    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('salary_advances')
      .update({
        status: 'approved',
        approved_amount: approvedAmount,
        total_repayment_amount: totalAmount,
        repayment_periods: repaymentPeriods,
        repayment_amount_per_period: perPeriod,
        repayment_start_date: repaymentStartDate,
        outstanding_balance: totalAmount,
        approved_at: new Date().toISOString(),
        approved_by: userData?.user?.id,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve advance');
      throw error;
    }

    // Create repayment schedule
    const repaymentRecords = [];
    const startDate = new Date(repaymentStartDate);
    for (let i = 1; i <= repaymentPeriods; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);
      repaymentRecords.push({
        salary_advance_id: id,
        period_number: i,
        due_date: dueDate.toISOString().split('T')[0],
        scheduled_amount: perPeriod,
        principal_amount: approvedAmount / repaymentPeriods,
        interest_amount: (totalAmount - approvedAmount) / repaymentPeriods,
        status: 'pending',
      });
    }

    await supabase.from('salary_advance_repayments').insert(repaymentRecords);

    toast.success('Advance approved');
    fetchAdvances();
  };

  const rejectAdvance = async (id: string, reason: string) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('salary_advances')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: userData?.user?.id,
        rejection_reason: reason,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to reject advance');
      throw error;
    }
    toast.success('Advance rejected');
    fetchAdvances();
  };

  const disburseAdvance = async (id: string, method: string, reference: string) => {
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('salary_advances')
      .update({
        status: 'disbursed',
        disbursed_at: new Date().toISOString(),
        disbursed_by: userData?.user?.id,
        disbursement_method: method,
        disbursement_reference: reference,
      })
      .eq('id', id);

    if (error) {
      toast.error('Failed to disburse advance');
      throw error;
    }
    toast.success('Advance disbursed');
    fetchAdvances();
  };

  const recordRepayment = async (repaymentId: string, paidAmount: number, paymentMethod: string) => {
    const { error } = await supabase
      .from('salary_advance_repayments')
      .update({
        paid_amount: paidAmount,
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: paymentMethod,
        status: 'paid',
      })
      .eq('id', repaymentId);

    if (error) {
      toast.error('Failed to record repayment');
      throw error;
    }
    toast.success('Repayment recorded');
    fetchAdvances();
  };

  // Summary stats
  const getStats = useCallback(() => {
    const pending = advances.filter(a => a.status === 'pending').length;
    const approved = advances.filter(a => a.status === 'approved').length;
    const disbursed = advances.filter(a => a.status === 'disbursed' || a.status === 'repaying').length;
    const totalOutstanding = advances
      .filter(a => ['disbursed', 'repaying'].includes(a.status))
      .reduce((sum, a) => sum + (a.outstanding_balance || 0), 0);

    return { pending, approved, disbursed, totalOutstanding };
  }, [advances]);

  return {
    advanceTypes,
    advances,
    isLoading,
    createAdvanceType,
    updateAdvanceType,
    deleteAdvanceType,
    createAdvance,
    approveAdvance,
    rejectAdvance,
    disburseAdvance,
    fetchRepayments,
    recordRepayment,
    getStats,
    refresh: () => Promise.all([fetchAdvanceTypes(), fetchAdvances()]),
  };
}
