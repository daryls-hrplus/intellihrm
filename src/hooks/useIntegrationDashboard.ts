import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface IntegrationLog {
  id: string;
  rule_id: string;
  participant_id: string;
  employee_id: string;
  company_id: string;
  trigger_event: string;
  trigger_data: Record<string, unknown>;
  target_module: string;
  action_type: string;
  action_config: Record<string, unknown>;
  action_result: string;
  target_record_id?: string;
  error_message?: string;
  executed_at?: string;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  created_at: string;
  // Joined data
  employee_name?: string;
  cycle_name?: string;
  rule_name?: string;
}

export interface DashboardFilters {
  companyId: string;
  cycleId?: string;
  targetModules?: string[];
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface DashboardStats {
  total: number;
  success: number;
  pending: number;
  failed: number;
  successRate: number;
  byModule: Record<string, { success: number; pending: number; failed: number }>;
}

export interface UseIntegrationDashboardResult {
  logs: IntegrationLog[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
  fetchLogs: () => Promise<void>;
  bulkApprove: (logIds: string[]) => Promise<void>;
  bulkReject: (logIds: string[], reason: string) => Promise<void>;
  retryIntegration: (logId: string) => Promise<void>;
}

const DEFAULT_STATS: DashboardStats = {
  total: 0,
  success: 0,
  pending: 0,
  failed: 0,
  successRate: 0,
  byModule: {}
};

export function useIntegrationDashboard(filters: DashboardFilters): UseIntegrationDashboardResult {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!filters.companyId) {
      setLogs([]);
      setStats(DEFAULT_STATS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('appraisal_integration_log')
        .select(`
          *,
          rule:appraisal_integration_rules(name),
          employee:profiles!appraisal_integration_log_employee_id_fkey(
            first_name,
            last_name
          )
        `)
        .eq('company_id', filters.companyId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.targetModules && filters.targetModules.length > 0) {
        query = query.in('target_module', filters.targetModules);
      }

      if (filters.status && filters.status.length > 0) {
        query = query.in('action_result', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data, error: fetchError } = await query.limit(500);

      if (fetchError) throw fetchError;

      // Transform and enrich data
      const transformedLogs: IntegrationLog[] = (data || []).map((log: any) => {
        const employeeData = log.employee;
        const employeeName = employeeData
          ? `${employeeData.first_name || ''} ${employeeData.last_name || ''}`.trim()
          : 'Unknown';
        
        const triggerData = log.trigger_data as Record<string, unknown> || {};

        return {
          ...log,
          employee_name: employeeName,
          cycle_name: (triggerData.cycle_name as string) || 'N/A',
          rule_name: log.rule?.name || 'Unknown Rule',
        };
      });

      // Filter by cycle if specified
      let filteredLogs = transformedLogs;
      if (filters.cycleId) {
        filteredLogs = transformedLogs.filter(log => {
          const triggerData = log.trigger_data || {};
          return triggerData.cycle_id === filters.cycleId;
        });
      }

      setLogs(filteredLogs);

      // Calculate stats
      const calculatedStats = calculateStats(filteredLogs);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching integration logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      toast.error('Failed to fetch integration logs');
    } finally {
      setLoading(false);
    }
  }, [filters.companyId, filters.cycleId, filters.targetModules, filters.status, filters.dateFrom, filters.dateTo]);

  const calculateStats = (logData: IntegrationLog[]): DashboardStats => {
    const stats: DashboardStats = {
      total: logData.length,
      success: 0,
      pending: 0,
      failed: 0,
      successRate: 0,
      byModule: {}
    };

    logData.forEach(log => {
      // Count by status
      if (log.action_result === 'success') {
        stats.success++;
      } else if (log.action_result === 'pending_approval') {
        stats.pending++;
      } else if (log.action_result === 'failed') {
        stats.failed++;
      }

      // Count by module
      if (!stats.byModule[log.target_module]) {
        stats.byModule[log.target_module] = { success: 0, pending: 0, failed: 0 };
      }

      if (log.action_result === 'success') {
        stats.byModule[log.target_module].success++;
      } else if (log.action_result === 'pending_approval') {
        stats.byModule[log.target_module].pending++;
      } else if (log.action_result === 'failed') {
        stats.byModule[log.target_module].failed++;
      }
    });

    stats.successRate = stats.total > 0 
      ? Math.round((stats.success / stats.total) * 100) 
      : 0;

    return stats;
  };

  const bulkApprove = useCallback(async (logIds: string[]) => {
    if (logIds.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('appraisal_integration_log')
        .update({
          action_result: 'success',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          executed_at: new Date().toISOString()
        })
        .in('id', logIds);

      if (updateError) throw updateError;

      toast.success(`${logIds.length} integration(s) approved`);
      await fetchLogs();
    } catch (err) {
      console.error('Error approving integrations:', err);
      toast.error('Failed to approve integrations');
    }
  }, [fetchLogs]);

  const bulkReject = useCallback(async (logIds: string[], reason: string) => {
    if (logIds.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('appraisal_integration_log')
        .update({
          action_result: 'rejected',
          rejected_by: user.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .in('id', logIds);

      if (updateError) throw updateError;

      toast.success(`${logIds.length} integration(s) rejected`);
      await fetchLogs();
    } catch (err) {
      console.error('Error rejecting integrations:', err);
      toast.error('Failed to reject integrations');
    }
  }, [fetchLogs]);

  const retryIntegration = useCallback(async (logId: string) => {
    try {
      // Get the log details
      const log = logs.find(l => l.id === logId);
      if (!log) throw new Error('Log not found');

      // Mark as retrying
      await supabase
        .from('appraisal_integration_log')
        .update({ action_result: 'retrying' })
        .eq('id', logId);

      // Invoke the orchestrator with retry mode
      const { error: invokeError } = await supabase.functions.invoke('appraisal-integration-orchestrator', {
        body: {
          participant_id: log.participant_id,
          trigger_event: log.trigger_event,
          retry_log_id: logId
        }
      });

      if (invokeError) throw invokeError;

      toast.success('Integration retry initiated');
      await fetchLogs();
    } catch (err) {
      console.error('Error retrying integration:', err);
      toast.error('Failed to retry integration');
    }
  }, [logs, fetchLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    stats,
    loading,
    error,
    fetchLogs,
    bulkApprove,
    bulkReject,
    retryIntegration
  };
}

// Hook for module-specific widget (pre-filtered)
export function useIntegrationWidget(companyId: string, targetModules: string[]) {
  const [filters] = useState<DashboardFilters>({
    companyId,
    targetModules,
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  });

  return useIntegrationDashboard(filters);
}
