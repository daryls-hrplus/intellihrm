import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';

export interface StepProgress {
  id: string;
  company_id: string;
  phase_id: string;
  step_order: number;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  uncompleted_at: string | null;
  uncompleted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_by_profile?: {
    full_name: string;
    email: string;
  };
}

export interface PhaseProgress {
  phaseId: string;
  totalSteps: number;
  completedSteps: number;
  percentComplete: number;
}

export function useStepProgress(phaseId?: string) {
  const [progress, setProgress] = useState<StepProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { logAction } = useAuditLog();

  const companyId = profile?.company_id;

  const fetchProgress = useCallback(async () => {
    if (!user || !companyId) {
      setProgress([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('implementation_step_progress')
        .select(`
          *,
          completed_by_profile:profiles!implementation_step_progress_completed_by_fkey(
            full_name,
            email
          )
        `)
        .eq('company_id', companyId)
        .order('step_order', { ascending: true });

      if (phaseId) {
        query = query.eq('phase_id', phaseId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProgress((data || []) as unknown as StepProgress[]);
    } catch (err) {
      console.error('Error fetching step progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  }, [user, companyId, phaseId]);

  const toggleStepComplete = useCallback(async (
    phaseId: string,
    stepOrder: number,
    isComplete: boolean,
    notes?: string
  ) => {
    if (!user || !companyId) throw new Error('Not authenticated');

    // Check if record exists
    const { data: existing } = await supabase
      .from('implementation_step_progress')
      .select('id')
      .eq('company_id', companyId)
      .eq('phase_id', phaseId)
      .eq('step_order', stepOrder)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const updateData: Record<string, unknown> = {
        is_completed: isComplete,
        updated_at: new Date().toISOString()
      };

      if (isComplete) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
        updateData.uncompleted_at = null;
        updateData.uncompleted_by = null;
      } else {
        updateData.uncompleted_at = new Date().toISOString();
        updateData.uncompleted_by = user.id;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error: updateError } = await supabase
        .from('implementation_step_progress')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) throw updateError;

      // Audit log for step status change
      await logAction({
        action: 'UPDATE',
        entityType: 'implementation_step',
        entityId: existing.id,
        entityName: `Phase ${phaseId} - Step ${stepOrder}`,
        oldValues: { is_completed: !isComplete },
        newValues: { is_completed: isComplete },
        metadata: { phase_id: phaseId, step_order: stepOrder }
      });
    } else {
      // Insert new record
      const { data: insertData, error: insertError } = await supabase
        .from('implementation_step_progress')
        .insert({
          company_id: companyId,
          phase_id: phaseId,
          step_order: stepOrder,
          is_completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
          completed_by: isComplete ? user.id : null,
          notes: notes || null
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Audit log for new step progress
      await logAction({
        action: 'CREATE',
        entityType: 'implementation_step',
        entityId: insertData?.id,
        entityName: `Phase ${phaseId} - Step ${stepOrder}`,
        newValues: { is_completed: isComplete },
        metadata: { phase_id: phaseId, step_order: stepOrder }
      });
    }

    await fetchProgress();
  }, [user, companyId, fetchProgress]);

  const updateStepNotes = useCallback(async (
    phaseId: string,
    stepOrder: number,
    notes: string
  ) => {
    if (!user || !companyId) throw new Error('Not authenticated');

    // Check if record exists
    const { data: existing } = await supabase
      .from('implementation_step_progress')
      .select('id')
      .eq('company_id', companyId)
      .eq('phase_id', phaseId)
      .eq('step_order', stepOrder)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await supabase
        .from('implementation_step_progress')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('implementation_step_progress')
        .insert({
          company_id: companyId,
          phase_id: phaseId,
          step_order: stepOrder,
          is_completed: false,
          notes
        });

      if (insertError) throw insertError;
    }

    await fetchProgress();
  }, [user, companyId, fetchProgress]);

  const isStepComplete = useCallback((phaseId: string, stepOrder: number): boolean => {
    return progress.some(p => p.phase_id === phaseId && p.step_order === stepOrder && p.is_completed);
  }, [progress]);

  const getStepProgress = useCallback((phaseId: string, stepOrder: number): StepProgress | undefined => {
    return progress.find(p => p.phase_id === phaseId && p.step_order === stepOrder);
  }, [progress]);

  const getPhaseProgress = useCallback((phaseId: string, totalSteps: number): PhaseProgress => {
    const phaseSteps = progress.filter(p => p.phase_id === phaseId && p.is_completed);
    const completedSteps = phaseSteps.length;
    
    return {
      phaseId,
      totalSteps,
      completedSteps,
      percentComplete: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
  }, [progress]);

  const getAllPhasesProgress = useCallback((phases: { id: string; itemCount: number }[]): PhaseProgress[] => {
    return phases.map(phase => getPhaseProgress(phase.id, phase.itemCount));
  }, [getPhaseProgress]);

  const getOverallProgress = useCallback((phases: { id: string; itemCount: number }[]): { completed: number; total: number; percent: number } => {
    const total = phases.reduce((sum, p) => sum + p.itemCount, 0);
    const completed = progress.filter(p => p.is_completed).length;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [progress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    companyId,
    refetch: fetchProgress,
    toggleStepComplete,
    updateStepNotes,
    isStepComplete,
    getStepProgress,
    getPhaseProgress,
    getAllPhasesProgress,
    getOverallProgress
  };
}
