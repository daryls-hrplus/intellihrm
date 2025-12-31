import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface IntegrationRule {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  condition_type: string;
  condition_operator: string;
  condition_value: number | null;
  condition_value_max: number | null;
  condition_category_codes: string[];
  condition_section: string | null;
  target_module: string;
  action_type: string;
  action_config: Record<string, unknown>;
  auto_execute: boolean;
  requires_approval: boolean;
  approval_role: string | null;
  execution_order: number;
  is_active: boolean;
  created_at: string;
}

export interface IntegrationLog {
  id: string;
  rule_id: string | null;
  participant_id: string | null;
  employee_id: string;
  company_id: string;
  trigger_event: string;
  trigger_data: Record<string, unknown>;
  target_module: string;
  action_type: string;
  action_result: string;
  target_record_id: string | null;
  target_record_type: string | null;
  error_message: string | null;
  executed_at: string | null;
  requires_approval: boolean;
  approved_at: string | null;
  created_at: string;
}

export function useAppraisalIntegration(companyId?: string) {
  const [rules, setRules] = useState<IntegrationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('appraisal_integration_rules')
        .select('*')
        .eq('company_id', companyId)
        .order('execution_order', { ascending: true });

      if (fetchError) throw fetchError;

      setRules((data || []).map(r => ({
        ...r,
        condition_category_codes: Array.isArray(r.condition_category_codes) 
          ? r.condition_category_codes.map(String)
          : [],
        action_config: (r.action_config || {}) as Record<string, unknown>
      })) as IntegrationRule[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (rule: Partial<IntegrationRule>) => {
    const { data, error } = await supabase
      .from('appraisal_integration_rules')
      .insert({ 
        ...rule, 
        company_id: companyId,
        action_config: rule.action_config || {}
      } as any)
      .select()
      .single();

    if (error) throw error;
    await fetchRules();
    return data;
  };

  const updateRule = async (id: string, updates: Partial<IntegrationRule>) => {
    const { error } = await supabase
      .from('appraisal_integration_rules')
      .update(updates as any)
      .eq('id', id);

    if (error) throw error;
    await fetchRules();
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase
      .from('appraisal_integration_rules')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchRules();
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    await updateRule(id, { is_active: isActive });
  };

  const reorderRules = async (ruleIds: string[]) => {
    for (let i = 0; i < ruleIds.length; i++) {
      await supabase
        .from('appraisal_integration_rules')
        .update({ execution_order: (i + 1) * 10 })
        .eq('id', ruleIds[i]);
    }
    await fetchRules();
  };

  useEffect(() => {
    fetchRules();
  }, [companyId]);

  return {
    rules,
    loading,
    error,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    reorderRules
  };
}

export function useIntegrationLogs(participantId?: string, employeeId?: string) {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    if (!participantId && !employeeId) return;
    
    setLoading(true);

    try {
      let query = supabase
        .from('appraisal_integration_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (participantId) {
        query = query.eq('participant_id', participantId);
      } else if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []).map(l => ({
        ...l,
        trigger_data: (l.trigger_data || {}) as Record<string, unknown>
      })) as IntegrationLog[]);
    } catch (err) {
      console.error('Error fetching integration logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveLog = async (logId: string, approverId: string) => {
    const { error } = await supabase
      .from('appraisal_integration_log')
      .update({
        action_result: 'success',
        approved_at: new Date().toISOString(),
        approved_by: approverId
      })
      .eq('id', logId);

    if (error) throw error;
    await fetchLogs();
  };

  const rejectLog = async (logId: string, reason: string) => {
    const { error } = await supabase
      .from('appraisal_integration_log')
      .update({
        action_result: 'cancelled',
        rejection_reason: reason
      })
      .eq('id', logId);

    if (error) throw error;
    await fetchLogs();
  };

  useEffect(() => {
    fetchLogs();
  }, [participantId, employeeId]);

  return { logs, loading, fetchLogs, approveLog, rejectLog };
}

export async function triggerIntegrationOrchestrator(participantId: string, triggerEvent: string = 'appraisal_finalized') {
  const { data, error } = await supabase.functions.invoke('appraisal-integration-orchestrator', {
    body: { participant_id: participantId, trigger_event: triggerEvent }
  });

  if (error) throw error;
  return data;
}
