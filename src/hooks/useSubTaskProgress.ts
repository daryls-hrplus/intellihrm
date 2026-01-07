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
  notes: string | null;
  blocker_reason: string | null;
  completed_by: string | null;
  completed_at: string | null;
}

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

  const getCompletionStats = () => {
    const total = subTasks.length;
    const completed = subTasks.filter(t => t.status === 'completed' || t.status === 'not_applicable').length;
    const blocked = subTasks.filter(t => t.status === 'blocked').length;
    const deferred = subTasks.filter(t => t.status === 'deferred').length;
    const pending = subTasks.filter(t => t.status === 'pending').length;
    
    return {
      total,
      completed,
      blocked,
      deferred,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  return {
    subTasks,
    isLoading,
    initializeSubTasks,
    updateSubTaskStatus,
    getCompletionStats,
    refetch: fetchSubTasks,
  };
}
