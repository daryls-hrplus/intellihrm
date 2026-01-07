import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SubTaskStatus = 'pending' | 'completed' | 'not_applicable' | 'deferred' | 'blocked';

export interface SubTaskDefinition {
  order: number;
  name: string;
  isRequired?: boolean;
}

export interface SubTaskProgress {
  id: string;
  company_id: string;
  phase_id: string;
  step_order: number;
  sub_task_order: number;
  sub_task_name: string;
  status: SubTaskStatus;
  is_required: boolean;
  notes: string | null;
  blocker_reason: string | null;
  completed_by: string | null;
  completed_at: string | null;
}

export type StepRollupStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'deferred';

export function useSubTaskProgress(companyId: string | undefined, phaseId: string, stepOrder: number) {
  const [subTasks, setSubTasks] = useState<SubTaskProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    fetchSubTasks();
  }, [companyId, phaseId, stepOrder]);

  const fetchSubTasks = async () => {
    if (!companyId) return;

    try {
      const { data, error } = await supabase
        .from('implementation_sub_tasks')
        .select('*')
        .eq('company_id', companyId)
        .eq('phase_id', phaseId)
        .eq('step_order', stepOrder)
        .order('sub_task_order');

      if (error) throw error;
      setSubTasks((data as SubTaskProgress[]) || []);
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSubTasks = async (definitions: SubTaskDefinition[]) => {
    if (!companyId || subTasks.length > 0) return;

    try {
      const tasksToInsert = definitions.map(def => ({
        company_id: companyId,
        phase_id: phaseId,
        step_order: stepOrder,
        sub_task_order: def.order,
        sub_task_name: def.name,
        is_required: def.isRequired ?? true,
        status: 'pending' as SubTaskStatus,
      }));

      const { error } = await supabase
        .from('implementation_sub_tasks')
        .upsert(tasksToInsert, { 
          onConflict: 'company_id,phase_id,step_order,sub_task_order',
          ignoreDuplicates: true 
        });

      if (error) throw error;
      await fetchSubTasks();
    } catch (error) {
      console.error('Error initializing sub-tasks:', error);
    }
  };

  const updateSubTaskStatus = async (
    subTaskOrder: number, 
    status: SubTaskStatus, 
    notes?: string,
    blockerReason?: string
  ) => {
    if (!companyId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: Record<string, unknown> = {
        status,
        notes: notes || null,
        blocker_reason: blockerReason || null,
      };

      if (status === 'completed') {
        updateData.completed_by = user?.id;
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_by = null;
        updateData.completed_at = null;
      }

      const { error } = await supabase
        .from('implementation_sub_tasks')
        .update(updateData)
        .eq('company_id', companyId)
        .eq('phase_id', phaseId)
        .eq('step_order', stepOrder)
        .eq('sub_task_order', subTaskOrder);

      if (error) throw error;

      setSubTasks(prev => prev.map(task => 
        task.sub_task_order === subTaskOrder 
          ? { ...task, ...updateData } as SubTaskProgress
          : task
      ));

      toast({
        title: "Sub-task updated",
        description: `Status changed to ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating sub-task:', error);
      toast({
        title: "Error",
        description: "Failed to update sub-task",
        variant: "destructive",
      });
    }
  };

  const calculateStepStatus = (): StepRollupStatus => {
    if (subTasks.length === 0) return 'not_started';

    const requiredTasks = subTasks.filter(t => t.is_required);
    
    // Any required blocked = step blocked
    if (requiredTasks.some(t => t.status === 'blocked')) return 'blocked';
    
    // All required deferred = step deferred
    if (requiredTasks.length > 0 && requiredTasks.every(t => t.status === 'deferred')) return 'deferred';
    
    // All required resolved = step complete
    const allRequiredResolved = requiredTasks.every(t => 
      t.status === 'completed' || t.status === 'not_applicable'
    );
    if (allRequiredResolved && requiredTasks.length > 0) return 'completed';
    
    // Any work started = in progress
    if (subTasks.some(t => t.status !== 'pending')) return 'in_progress';
    
    return 'not_started';
  };

  const getCompletionStats = () => {
    const required = subTasks.filter(t => t.is_required);
    const optional = subTasks.filter(t => !t.is_required);
    
    const requiredCompleted = required.filter(t => 
      t.status === 'completed' || t.status === 'not_applicable'
    ).length;
    
    const requiredBlocked = required.filter(t => t.status === 'blocked').length;
    const stepStatus = calculateStepStatus();
    
    return {
      total: subTasks.length,
      required: required.length,
      requiredCompleted,
      requiredBlocked,
      optional: optional.length,
      optionalCompleted: optional.filter(t => t.status === 'completed').length,
      canComplete: requiredBlocked === 0 && requiredCompleted === required.length,
      stepStatus,
      percentage: required.length > 0 ? Math.round((requiredCompleted / required.length) * 100) : 0,
    };
  };

  return {
    subTasks,
    isLoading,
    initializeSubTasks,
    updateSubTaskStatus,
    getCompletionStats,
    calculateStepStatus,
    refetch: fetchSubTasks,
  };
}
