import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  FeatureImplementationTask, 
  FeatureImplTaskProgress,
  CreateImplementationTaskInput,
  ToggleTaskProgressInput,
  FeatureImplementationStats
} from '@/types/implementation';

// Hook for managing standard and custom tasks per feature
export function useImplementationTasks(featureId?: string, companyId?: string) {
  const [tasks, setTasks] = useState<FeatureImplementationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const effectiveCompanyId = companyId || profile?.company_id;

  const fetchTasks = useCallback(async () => {
    if (!featureId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch standard tasks (company_id IS NULL) and custom tasks for this company
      const { data, error: fetchError } = await supabase
        .from('feature_implementation_tasks')
        .select('*')
        .eq('feature_id', featureId)
        .or(`company_id.is.null,company_id.eq.${effectiveCompanyId}`)
        .order('task_order', { ascending: true });

      if (fetchError) throw fetchError;
      setTasks((data || []) as FeatureImplementationTask[]);
    } catch (err) {
      console.error('Error fetching implementation tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, [featureId, effectiveCompanyId]);

  const createTask = useCallback(async (input: CreateImplementationTaskInput) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('feature_implementation_tasks')
      .insert({
        feature_id: input.feature_id,
        task_name: input.task_name,
        task_description: input.task_description,
        task_order: input.task_order || 999,
        is_required: input.is_required ?? true,
        is_standard: input.is_standard ?? false,
        company_id: input.company_id || effectiveCompanyId,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchTasks();
    return data;
  }, [user, effectiveCompanyId, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    const { error: deleteError } = await supabase
      .from('feature_implementation_tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) throw deleteError;
    await fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    createTask,
    deleteTask
  };
}

// Hook for tracking task progress for a specific feature implementation
export function useTaskProgress(featureImplId?: string) {
  const [progress, setProgress] = useState<FeatureImplTaskProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchProgress = useCallback(async () => {
    if (!featureImplId) {
      setProgress([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('feature_impl_task_progress')
        .select(`
          *,
          task:feature_implementation_tasks(*),
          completed_by_profile:profiles!feature_impl_task_progress_completed_by_fkey(
            full_name,
            email
          )
        `)
        .eq('feature_impl_id', featureImplId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setProgress((data || []) as unknown as FeatureImplTaskProgress[]);
    } catch (err) {
      console.error('Error fetching task progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setIsLoading(false);
    }
  }, [featureImplId]);

  // Toggle task completion (supports marking complete and unflagging)
  const toggleTaskCompletion = useCallback(async (input: ToggleTaskProgressInput) => {
    if (!user) throw new Error('Not authenticated');

    const { feature_impl_id, task_id, is_completed, notes } = input;

    // Check if progress record exists
    const { data: existing } = await supabase
      .from('feature_impl_task_progress')
      .select('id')
      .eq('feature_impl_id', feature_impl_id)
      .eq('task_id', task_id)
      .maybeSingle();

    if (existing) {
      // Update existing record
      const updateData: Record<string, unknown> = {
        is_completed
      };

      if (is_completed) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user.id;
        updateData.uncompleted_at = null;
        updateData.uncompleted_by = null;
      } else {
        // User is unflagging
        updateData.uncompleted_at = new Date().toISOString();
        updateData.uncompleted_by = user.id;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error: updateError } = await supabase
        .from('feature_impl_task_progress')
        .update(updateData)
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new progress record
      const { error: insertError } = await supabase
        .from('feature_impl_task_progress')
        .insert({
          feature_impl_id,
          task_id,
          company_id: profile?.company_id,
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
          completed_by: is_completed ? user.id : null,
          notes
        });

      if (insertError) throw insertError;
    }

    await fetchProgress();
  }, [user, profile, fetchProgress]);

  // Calculate completion stats
  const getCompletionStats = useCallback((
    tasks: FeatureImplementationTask[], 
    progressList: FeatureImplTaskProgress[]
  ): FeatureImplementationStats => {
    const progressMap = new Map(progressList.map(p => [p.task_id, p]));
    
    const total = tasks.length;
    const requiredTasks = tasks.filter(t => t.is_required);
    const requiredTotal = requiredTasks.length;
    
    const completed = tasks.filter(t => progressMap.get(t.id)?.is_completed).length;
    const requiredCompleted = requiredTasks.filter(t => progressMap.get(t.id)?.is_completed).length;

    return {
      total_tasks: total,
      tasks_completed: completed,
      required_tasks: requiredTotal,
      required_tasks_completed: requiredCompleted,
      percent_complete: total > 0 ? Math.round((completed / total) * 100) : 0,
      all_required_complete: requiredCompleted === requiredTotal
    };
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refetch: fetchProgress,
    toggleTaskCompletion,
    getCompletionStats
  };
}
