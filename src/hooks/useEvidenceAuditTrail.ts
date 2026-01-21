import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export interface EvidenceAuditEntry {
  id: string;
  evidence_id: string;
  action: string;
  performed_by: string | null;
  performed_at: string;
  appraisal_cycle_id: string | null;
  participant_id: string | null;
  item_type: string | null;
  item_id: string | null;
  item_name: string | null;
  old_values: Json | null;
  new_values: Json | null;
  change_reason: string | null;
  company_id: string | null;
  performer_name?: string;
  performer_email?: string;
}

export interface AuditSummary {
  totalActions: number;
  byAction: Record<string, number>;
  recentActivity: EvidenceAuditEntry[];
  validationsThisPeriod: number;
  rejectionsThisPeriod: number;
}

interface FetchAuditOptions {
  startDate?: string;
  endDate?: string;
  actions?: string[];
  limit?: number;
}

export function useEvidenceAuditTrail() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [auditEntries, setAuditEntries] = useState<EvidenceAuditEntry[]>([]);

  // Fetch audit history for a single evidence item
  const fetchAuditHistory = useCallback(async (evidenceId: string): Promise<EvidenceAuditEntry[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('performance_evidence_audit')
        .select('*')
        .eq('evidence_id', evidenceId)
        .order('performed_at', { ascending: false });

      if (error) throw error;

      // Enrich with performer names
      const entries = data || [];
      const performerIds = [...new Set(entries.filter(e => e.performed_by).map(e => e.performed_by))];
      
      if (performerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', performerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        return entries.map(entry => ({
          ...entry,
          performer_name: entry.performed_by ? profileMap.get(entry.performed_by)?.full_name : undefined,
          performer_email: entry.performed_by ? profileMap.get(entry.performed_by)?.email : undefined,
        }));
      }

      return entries;
    } catch (error) {
      console.error('Error fetching evidence audit history:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all evidence audit for an employee
  const fetchEmployeeEvidenceAudit = useCallback(async (
    employeeId: string,
    options: FetchAuditOptions = {}
  ): Promise<EvidenceAuditEntry[]> => {
    setLoading(true);
    try {
      // First get all evidence IDs for this employee
      const { data: evidenceIds } = await supabase
        .from('performance_evidence')
        .select('id')
        .eq('employee_id', employeeId);

      if (!evidenceIds || evidenceIds.length === 0) {
        return [];
      }

      let query = supabase
        .from('performance_evidence_audit')
        .select('*')
        .in('evidence_id', evidenceIds.map(e => e.id))
        .order('performed_at', { ascending: false });

      if (options.startDate) {
        query = query.gte('performed_at', options.startDate);
      }
      if (options.endDate) {
        query = query.lte('performed_at', options.endDate);
      }
      if (options.actions && options.actions.length > 0) {
        query = query.in('action', options.actions);
      }
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich with performer names
      const entries = data || [];
      const performerIds = [...new Set(entries.filter(e => e.performed_by).map(e => e.performed_by))];
      
      if (performerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', performerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const enrichedEntries = entries.map(entry => ({
          ...entry,
          performer_name: entry.performed_by ? profileMap.get(entry.performed_by)?.full_name : undefined,
          performer_email: entry.performed_by ? profileMap.get(entry.performed_by)?.email : undefined,
        }));
        
        setAuditEntries(enrichedEntries);
        return enrichedEntries;
      }

      setAuditEntries(entries);
      return entries;
    } catch (error) {
      console.error('Error fetching employee evidence audit:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch audit for an appraisal cycle
  const fetchCycleEvidenceAudit = useCallback(async (
    cycleId: string,
    options: FetchAuditOptions = {}
  ): Promise<EvidenceAuditEntry[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('performance_evidence_audit')
        .select('*')
        .eq('appraisal_cycle_id', cycleId)
        .order('performed_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching cycle evidence audit:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate audit summary for employee
  const fetchAuditSummary = useCallback(async (
    employeeId: string,
    periodDays: number = 30
  ): Promise<AuditSummary> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const entries = await fetchEmployeeEvidenceAudit(employeeId, {
      startDate: startDate.toISOString(),
    });

    const byAction: Record<string, number> = {};
    entries.forEach(entry => {
      byAction[entry.action] = (byAction[entry.action] || 0) + 1;
    });

    return {
      totalActions: entries.length,
      byAction,
      recentActivity: entries.slice(0, 10),
      validationsThisPeriod: byAction['validated'] || 0,
      rejectionsThisPeriod: byAction['rejected'] || 0,
    };
  }, [fetchEmployeeEvidenceAudit]);

  // Manually log a custom action (e.g., viewed, exported)
  const logEvidenceAction = useCallback(async (params: {
    evidenceId: string;
    action: string;
    changeReason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<boolean> => {
    if (!user) return false;

    try {
      // Get the evidence to extract company_id
      const { data: evidence } = await supabase
        .from('performance_evidence')
        .select('company_id, appraisal_cycle_id, participant_id')
        .eq('id', params.evidenceId)
        .single();

      const insertData = {
        evidence_id: params.evidenceId,
        action: params.action,
        performed_by: user.id,
        change_reason: params.changeReason || null,
        company_id: evidence?.company_id || null,
        appraisal_cycle_id: evidence?.appraisal_cycle_id || null,
        participant_id: evidence?.participant_id || null,
        new_values: params.metadata ? (params.metadata as Json) : null,
      };

      const { error } = await supabase
        .from('performance_evidence_audit')
        .insert(insertData);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging evidence action:', error);
      return false;
    }
  }, [user]);

  // Subscribe to real-time audit updates
  const subscribeToAuditUpdates = useCallback((
    employeeId: string,
    onNewEntry: (entry: EvidenceAuditEntry) => void
  ) => {
    const channel = supabase
      .channel(`evidence-audit-${employeeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'performance_evidence_audit',
        },
        async (payload) => {
          // Verify this audit entry is for the employee's evidence
          const { data: evidence } = await supabase
            .from('performance_evidence')
            .select('employee_id')
            .eq('id', payload.new.evidence_id)
            .single();

          if (evidence?.employee_id === employeeId) {
            onNewEntry(payload.new as EvidenceAuditEntry);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    loading,
    auditEntries,
    fetchAuditHistory,
    fetchEmployeeEvidenceAudit,
    fetchCycleEvidenceAudit,
    fetchAuditSummary,
    logEvidenceAction,
    subscribeToAuditUpdates,
  };
}
