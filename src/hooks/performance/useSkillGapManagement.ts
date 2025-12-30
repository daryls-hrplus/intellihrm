import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EmployeeSkillGap, RecommendedAction } from '@/types/valuesAssessment';

interface SkillGapFilters {
  status?: string;
  priority?: string;
  source?: string;
}

export function useSkillGapManagement() {
  const [gaps, setGaps] = useState<EmployeeSkillGap[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmployeeGaps = useCallback(async (
    employeeId: string,
    filters?: SkillGapFilters
  ): Promise<EmployeeSkillGap[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('employee_skill_gaps')
        .select('*')
        .eq('employee_id', employeeId)
        .order('priority', { ascending: false })
        .order('gap_score', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;
      if (error) throw error;

      const typedGaps = (data || []).map(gap => ({
        ...gap,
        recommended_actions: (gap.recommended_actions as unknown as RecommendedAction[]) || []
      })) as EmployeeSkillGap[];

      setGaps(typedGaps);
      return typedGaps;
    } catch (error) {
      console.error('Error fetching skill gaps:', error);
      toast({
        title: 'Error',
        description: 'Failed to load skill gaps',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchCompanyGaps = useCallback(async (
    companyId: string,
    filters?: SkillGapFilters
  ): Promise<EmployeeSkillGap[]> => {
    setLoading(true);
    try {
      let query = supabase
        .from('employee_skill_gaps')
        .select(`
          *,
          employee:profiles!employee_id(id, full_name, email)
        `)
        .eq('company_id', companyId)
        .order('priority', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(gap => ({
        ...gap,
        recommended_actions: (gap.recommended_actions as unknown as RecommendedAction[]) || []
      })) as EmployeeSkillGap[];
    } catch (error) {
      console.error('Error fetching company skill gaps:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createGapFromAppraisal = useCallback(async (
    employeeId: string,
    companyId: string,
    capabilityName: string,
    requiredLevel: number,
    currentLevel: number,
    sourceReferenceId: string
  ): Promise<boolean> => {
    try {
      const gapScore = requiredLevel - currentLevel;
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      
      if (gapScore >= 3) priority = 'critical';
      else if (gapScore >= 2) priority = 'high';
      else if (gapScore <= 1) priority = 'low';

      const { error } = await supabase
        .from('employee_skill_gaps')
        .insert({
          employee_id: employeeId,
          company_id: companyId,
          capability_name: capabilityName,
          required_level: requiredLevel,
          current_level: currentLevel,
          priority,
          source: 'appraisal',
          source_reference_id: sourceReferenceId,
          status: 'open'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating skill gap:', error);
      return false;
    }
  }, []);

  const linkGapToIDP = useCallback(async (
    gapId: string,
    idpItemId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_skill_gaps')
        .update({
          idp_item_id: idpItemId,
          status: 'in_progress'
        })
        .eq('id', gapId);

      if (error) throw error;
      
      toast({
        title: 'Gap Linked',
        description: 'Skill gap linked to development plan item',
      });
      
      return true;
    } catch (error) {
      console.error('Error linking gap to IDP:', error);
      return false;
    }
  }, [toast]);

  const updateGapStatus = useCallback(async (
    gapId: string,
    status: EmployeeSkillGap['status']
  ): Promise<boolean> => {
    try {
      const updates: any = { status };
      
      if (status === 'addressed' || status === 'closed') {
        updates.addressed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('employee_skill_gaps')
        .update(updates)
        .eq('id', gapId);

      if (error) throw error;
      
      toast({
        title: 'Status Updated',
        description: `Skill gap status updated to ${status}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating gap status:', error);
      return false;
    }
  }, [toast]);

  const triggerGapAnalysis = useCallback(async (
    action: 'analyze-appraisal' | 'analyze-employee',
    params: { participantId?: string; employeeId: string; companyId?: string }
  ): Promise<{ success: boolean; gapsCreated?: number }> => {
    try {
      const { data, error } = await supabase.functions.invoke('skill-gap-processor', {
        body: { action, ...params }
      });

      if (error) throw error;
      
      if (data.gapsCreated > 0) {
        toast({
          title: 'Analysis Complete',
          description: `Created ${data.gapsCreated} skill gap${data.gapsCreated > 1 ? 's' : ''}`,
        });
      }
      
      return { success: true, gapsCreated: data.gapsCreated };
    } catch (error) {
      console.error('Error triggering gap analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not complete skill gap analysis',
        variant: 'destructive',
      });
      return { success: false };
    }
  }, [toast]);

  return {
    gaps,
    loading,
    fetchEmployeeGaps,
    fetchCompanyGaps,
    createGapFromAppraisal,
    linkGapToIDP,
    updateGapStatus,
    triggerGapAnalysis,
  };
}
