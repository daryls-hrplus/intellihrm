import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';

export interface OffboardingTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  companies?: { name: string } | null;
}

export interface OffboardingTemplateTask {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  task_type: 'general' | 'document' | 'equipment' | 'access' | 'knowledge_transfer' | 'exit_interview';
  is_required: boolean;
  due_days_before: number;
  assigned_to_type: 'employee' | 'manager' | 'hr' | 'it';
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OffboardingInstance {
  id: string;
  employee_id: string;
  template_id: string;
  company_id: string;
  manager_id: string | null;
  last_working_date: string;
  termination_reason: string | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  profiles?: { full_name: string; email: string } | null;
  manager?: { full_name: string } | null;
  offboarding_templates?: { name: string } | null;
  companies?: { name: string } | null;
}

export interface OffboardingTask {
  id: string;
  instance_id: string;
  template_task_id: string | null;
  name: string;
  description: string | null;
  task_type: string;
  is_required: boolean;
  due_date: string | null;
  assigned_to_id: string | null;
  assigned_to_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  assigned_to?: { full_name: string } | null;
}

export function useOffboarding() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { logAction } = useAuditLog();

  // Templates
  const fetchTemplates = async (companyId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('offboarding_templates')
        .select(`*, companies:company_id(name)`)
        .order('name');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as OffboardingTemplate[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Partial<OffboardingTemplate>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { name, description, company_id, is_active, start_date, end_date } = template;
      const { data, error } = await supabase
        .from('offboarding_templates')
        .insert([{ name: name!, description, company_id: company_id!, is_active, start_date, end_date, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: 'CREATE',
        entityType: 'offboarding_templates',
        entityId: data.id,
        entityName: data.name,
        newValues: data,
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<OffboardingTemplate>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: oldData } = await supabase
        .from('offboarding_templates')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('offboarding_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: 'UPDATE',
        entityType: 'offboarding_templates',
        entityId: data.id,
        entityName: data.name,
        oldValues: oldData,
        newValues: data,
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: oldData } = await supabase
        .from('offboarding_templates')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('offboarding_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'DELETE',
        entityType: 'offboarding_templates',
        entityId: id,
        entityName: oldData?.name,
        oldValues: oldData,
      });

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Template Tasks
  const fetchTemplateTasks = async (templateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('offboarding_template_tasks')
        .select('*')
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      return data as OffboardingTemplateTask[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplateTask = async (task: Partial<OffboardingTemplateTask>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { template_id, name, description, task_type, is_required, due_days_before, assigned_to_type, display_order } = task;
      const { data, error } = await supabase
        .from('offboarding_template_tasks')
        .insert([{ template_id: template_id!, name: name!, description, task_type, is_required, due_days_before, assigned_to_type, display_order }])
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: 'CREATE',
        entityType: 'offboarding_template_tasks',
        entityId: data.id,
        entityName: data.name,
        newValues: data,
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplateTask = async (id: string, updates: Partial<OffboardingTemplateTask>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('offboarding_template_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplateTask = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('offboarding_template_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Instances
  const fetchInstances = async (filters?: { companyId?: string; status?: string; employeeId?: string; managerId?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('offboarding_instances')
        .select(`
          *,
          offboarding_templates:template_id(name),
          companies:company_id(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.employeeId) {
        query = query.eq('employee_id', filters.employeeId);
      }
      if (filters?.managerId) {
        query = query.eq('manager_id', filters.managerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as OffboardingInstance[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async (instance: Partial<OffboardingInstance>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { employee_id, template_id, company_id, manager_id, last_working_date, termination_reason, notes } = instance;
      const { data, error } = await supabase
        .from('offboarding_instances')
        .insert([{ 
          employee_id: employee_id!, 
          template_id: template_id!, 
          company_id: company_id!, 
          manager_id, 
          last_working_date, 
          termination_reason,
          notes, 
          created_by: user?.id 
        }])
        .select()
        .single();

      if (error) throw error;

      // Create tasks from template
      const templateTasks = await fetchTemplateTasks(instance.template_id!);
      const lastDate = new Date(instance.last_working_date || new Date());

      const tasks = templateTasks.map(task => ({
        instance_id: data.id,
        template_task_id: task.id,
        name: task.name,
        description: task.description,
        task_type: task.task_type,
        is_required: task.is_required,
        due_date: new Date(lastDate.getTime() - task.due_days_before * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assigned_to_type: task.assigned_to_type,
        assigned_to_id: task.assigned_to_type === 'employee' ? instance.employee_id :
                        task.assigned_to_type === 'manager' ? instance.manager_id : null,
        display_order: task.display_order,
        status: 'pending',
      }));

      // Auto-generate property return tasks from active assignments
      const { data: propertyAssignments } = await supabase
        .from('property_assignments')
        .select('id, property_id, property_items!inner(name, asset_tag)')
        .eq('employee_id', instance.employee_id!)
        .eq('status', 'active');

      if (propertyAssignments && propertyAssignments.length > 0) {
        const propertyTasks = propertyAssignments.map((assignment: any, index: number) => ({
          instance_id: data.id,
          template_task_id: null,
          name: `Return property: ${assignment.property_items?.name} (${assignment.property_items?.asset_tag})`,
          description: `Return this equipment before your last working day`,
          task_type: 'equipment' as const,
          is_required: true,
          due_date: new Date(lastDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigned_to_type: 'employee' as const,
          assigned_to_id: instance.employee_id!,
          display_order: 1000 + index,
          status: 'pending',
        }));
        tasks.push(...propertyTasks);
      }

      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('offboarding_tasks')
          .insert(tasks);

        if (tasksError) throw tasksError;
      }

      await logAction({
        action: 'CREATE',
        entityType: 'offboarding_instances',
        entityId: data.id,
        newValues: data,
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateInstance = async (id: string, updates: Partial<OffboardingInstance>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('offboarding_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Tasks
  const fetchTasks = async (instanceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('offboarding_tasks')
        .select('*')
        .eq('instance_id', instanceId)
        .order('display_order');

      if (error) throw error;
      return data as unknown as OffboardingTask[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<OffboardingTask>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updateData: any = { ...updates };
      
      if (updates.status === 'completed' && !updates.completed_at) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      const { data, error } = await supabase
        .from('offboarding_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Check if all required tasks are completed
      const { data: task } = await supabase
        .from('offboarding_tasks')
        .select('instance_id')
        .eq('id', id)
        .single();

      if (task) {
        const { data: allTasks } = await supabase
          .from('offboarding_tasks')
          .select('status, is_required')
          .eq('instance_id', task.instance_id);

        const allRequiredCompleted = allTasks?.every(
          t => !t.is_required || t.status === 'completed' || t.status === 'skipped'
        );

        if (allRequiredCompleted) {
          await supabase
            .from('offboarding_instances')
            .update({ 
              status: 'completed', 
              completed_at: new Date().toISOString() 
            })
            .eq('id', task.instance_id);
        }
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getOffboardingProgress = async (instanceId: string) => {
    try {
      const { data: tasks } = await supabase
        .from('offboarding_tasks')
        .select('status, is_required')
        .eq('instance_id', instanceId);

      if (!tasks || tasks.length === 0) {
        return { total: 0, completed: 0, percentage: 0 };
      }

      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed' || t.status === 'skipped').length;
      const percentage = Math.round((completed / total) * 100);

      return { total, completed, percentage };
    } catch {
      return { total: 0, completed: 0, percentage: 0 };
    }
  };

  return {
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    fetchTemplateTasks,
    createTemplateTask,
    updateTemplateTask,
    deleteTemplateTask,
    fetchInstances,
    createInstance,
    updateInstance,
    fetchTasks,
    updateTask,
    getOffboardingProgress,
  };
}
