import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ManagerHRFlag {
  id: string;
  managerId: string;
  managerName?: string;
  companyId: string;
  cycleId?: string;
  flagType: 
    | 'poor_timeliness' 
    | 'chronic_lateness' 
    | 'low_comment_quality' 
    | 'superficial_comments' 
    | 'extreme_leniency' 
    | 'extreme_severity'
    | 'calibration_drift' 
    | 'consistent_inflation' 
    | 'training_needed';
  flagSeverity: 'low' | 'medium' | 'high' | 'critical';
  flagTitle: string;
  flagDescription: string;
  evidenceData: Record<string, any>;
  affectedEmployeesCount: number;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  actionPlan?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  isVisibleToManager: boolean;
  humanReviewRequired: boolean;
  humanReviewedBy?: string;
  humanReviewedAt?: string;
  createdAt: string;
}

export function useManagerHRFlags() {
  const [loading, setLoading] = useState(false);
  const [flags, setFlags] = useState<ManagerHRFlag[]>([]);
  const { toast } = useToast();

  const fetchFlags = useCallback(async (
    companyId: string,
    managerId?: string,
    includeResolved = false
  ): Promise<ManagerHRFlag[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('manager_hr_flags')
        .select(`
          *,
          manager:profiles!manager_hr_flags_manager_id_fkey(full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('manager_id', managerId);
      }

      if (!includeResolved) {
        query = query.eq('is_resolved', false);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedFlags: ManagerHRFlag[] = (data || []).map(f => ({
        id: f.id,
        managerId: f.manager_id,
        managerName: (f.manager as any)?.full_name,
        companyId: f.company_id,
        cycleId: f.cycle_id || undefined,
        flagType: f.flag_type as ManagerHRFlag['flagType'],
        flagSeverity: f.flag_severity as ManagerHRFlag['flagSeverity'],
        flagTitle: f.flag_title,
        flagDescription: f.flag_description,
        evidenceData: (f.evidence_data as Record<string, any>) || {},
        affectedEmployeesCount: f.affected_employees_count || 0,
        isAcknowledged: f.is_acknowledged || false,
        acknowledgedBy: f.acknowledged_by || undefined,
        acknowledgedAt: f.acknowledged_at || undefined,
        actionPlan: f.action_plan || undefined,
        isResolved: f.is_resolved || false,
        resolvedAt: f.resolved_at || undefined,
        resolvedBy: f.resolved_by || undefined,
        resolutionNotes: f.resolution_notes || undefined,
        isVisibleToManager: f.is_visible_to_manager || false,
        humanReviewRequired: f.human_review_required || true,
        humanReviewedBy: f.human_reviewed_by || undefined,
        humanReviewedAt: f.human_reviewed_at || undefined,
        createdAt: f.created_at,
      }));

      setFlags(mappedFlags);
      return mappedFlags;
    } catch (error) {
      console.error('Error fetching HR flags:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch HR flags',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const acknowledgeFlag = useCallback(async (
    flagId: string,
    actionPlan: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_hr_flags')
        .update({
          is_acknowledged: true,
          acknowledged_by: userId,
          acknowledged_at: new Date().toISOString(),
          action_plan: actionPlan,
          human_reviewed_by: userId,
          human_reviewed_at: new Date().toISOString(),
        })
        .eq('id', flagId);

      if (error) throw error;

      setFlags(prev => prev.map(f => 
        f.id === flagId 
          ? { 
              ...f, 
              isAcknowledged: true, 
              acknowledgedBy: userId,
              acknowledgedAt: new Date().toISOString(),
              actionPlan,
              humanReviewedBy: userId,
              humanReviewedAt: new Date().toISOString(),
            } 
          : f
      ));

      toast({
        title: 'Flag Acknowledged',
        description: 'Action plan has been recorded',
      });

      return true;
    } catch (error) {
      console.error('Error acknowledging flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to acknowledge flag',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const resolveFlag = useCallback(async (
    flagId: string,
    resolutionNotes: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_hr_flags')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
          resolution_notes: resolutionNotes,
        })
        .eq('id', flagId);

      if (error) throw error;

      setFlags(prev => prev.filter(f => f.id !== flagId));

      toast({
        title: 'Flag Resolved',
        description: 'The flag has been marked as resolved',
      });

      return true;
    } catch (error) {
      console.error('Error resolving flag:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve flag',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const toggleManagerVisibility = useCallback(async (
    flagId: string,
    visible: boolean,
    userId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('manager_hr_flags')
        .update({
          is_visible_to_manager: visible,
          visibility_changed_by: userId,
          visibility_changed_at: new Date().toISOString(),
        })
        .eq('id', flagId);

      if (error) throw error;

      setFlags(prev => prev.map(f => 
        f.id === flagId ? { ...f, isVisibleToManager: visible } : f
      ));

      toast({
        title: visible ? 'Made Visible' : 'Hidden',
        description: visible 
          ? 'Manager can now see this flag' 
          : 'Flag is hidden from manager',
      });

      return true;
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const generateFlags = useCallback(async (
    managerId: string,
    companyId: string,
    cycleId?: string
  ): Promise<ManagerHRFlag[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manager-capability-analyzer', {
        body: {
          action: 'generate_hr_flags',
          managerId,
          companyId,
          cycleId,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      // Refresh flags list
      return await fetchFlags(companyId, managerId);
    } catch (error) {
      console.error('Error generating HR flags:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate HR flags',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchFlags, toast]);

  const getFlagStats = useCallback((flags: ManagerHRFlag[]) => {
    return {
      total: flags.length,
      bySeverity: {
        critical: flags.filter(f => f.flagSeverity === 'critical').length,
        high: flags.filter(f => f.flagSeverity === 'high').length,
        medium: flags.filter(f => f.flagSeverity === 'medium').length,
        low: flags.filter(f => f.flagSeverity === 'low').length,
      },
      acknowledged: flags.filter(f => f.isAcknowledged).length,
      pendingReview: flags.filter(f => f.humanReviewRequired && !f.humanReviewedBy).length,
    };
  }, []);

  return {
    loading,
    flags,
    fetchFlags,
    acknowledgeFlag,
    resolveFlag,
    toggleManagerVisibility,
    generateFlags,
    getFlagStats,
  };
}
