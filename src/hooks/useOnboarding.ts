import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAuditLog } from '@/hooks/useAuditLog';
import { toDateString, getTodayString } from '@/utils/dateUtils';

export interface OnboardingTemplate {
  id: string;
  company_id: string;
  job_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  jobs?: { title: string } | null;
  companies?: { name: string } | null;
}

export interface OnboardingTemplateTask {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  task_type: 'general' | 'document' | 'training' | 'equipment';
  is_required: boolean;
  due_days: number;
  assigned_to_type: 'employee' | 'manager' | 'hr' | 'buddy';
  display_order: number;
  document_template_id: string | null;
  training_course_id: string | null;
  created_at: string;
  updated_at: string;
  lms_courses?: { title: string } | null;
}

export interface OnboardingInstance {
  id: string;
  employee_id: string;
  template_id: string;
  company_id: string;
  buddy_id: string | null;
  manager_id: string | null;
  start_date: string;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string; email: string } | null;
  buddy?: { full_name: string } | null;
  manager?: { full_name: string } | null;
  onboarding_templates?: { name: string } | null;
  companies?: { name: string } | null;
}

export interface OnboardingTask {
  id: string;
  instance_id: string;
  template_task_id: string | null;
  name: string;
  description: string | null;
  task_type: 'general' | 'document' | 'training' | 'equipment';
  is_required: boolean;
  due_date: string | null;
  assigned_to_id: string | null;
  assigned_to_type: 'employee' | 'manager' | 'hr' | 'buddy';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completed_at: string | null;
  completed_by: string | null;
  document_url: string | null;
  training_course_id: string | null;
  notes: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
  assigned_to?: { full_name: string } | null;
  lms_courses?: { title: string } | null;
}

export function useOnboarding() {
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
        .from('onboarding_templates')
        .select(`
          *,
          companies:company_id(name)
        `)
        .order('name');

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as OnboardingTemplate[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (template: Partial<OnboardingTemplate>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { name, description, company_id, job_id, is_active, start_date, end_date } = template;
      const { data, error } = await supabase
        .from('onboarding_templates')
        .insert([{ name: name!, description, company_id: company_id!, job_id, is_active, start_date, end_date, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: 'CREATE',
        entityType: 'onboarding_templates',
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

  const updateTemplate = async (id: string, updates: Partial<OnboardingTemplate>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: oldData } = await supabase
        .from('onboarding_templates')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('onboarding_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: 'UPDATE',
        entityType: 'onboarding_templates',
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
        .from('onboarding_templates')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('onboarding_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAction({
        action: 'DELETE',
        entityType: 'onboarding_templates',
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
        .from('onboarding_template_tasks')
        .select(`
          *,
          lms_courses:training_course_id(title)
        `)
        .eq('template_id', templateId)
        .order('display_order');

      if (error) throw error;
      return data as OnboardingTemplateTask[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplateTask = async (task: Partial<OnboardingTemplateTask>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { template_id, name, description, task_type, is_required, due_days, assigned_to_type, display_order, training_course_id } = task;
      const { data, error } = await supabase
        .from('onboarding_template_tasks')
        .insert([{ template_id: template_id!, name: name!, description, task_type, is_required, due_days, assigned_to_type, display_order, training_course_id }])
        .select()
        .single();

      if (error) throw error;

      await logAction({
        action: 'CREATE',
        entityType: 'onboarding_template_tasks',
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

  const updateTemplateTask = async (id: string, updates: Partial<OnboardingTemplateTask>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('onboarding_template_tasks')
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
        .from('onboarding_template_tasks')
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
        .from('onboarding_instances')
        .select(`
          *,
          onboarding_templates:template_id(name),
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
      return data as unknown as OnboardingInstance[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createInstance = async (instance: Partial<OnboardingInstance>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { employee_id, template_id, company_id, buddy_id, manager_id, start_date, target_completion_date, notes } = instance;
      const { data, error } = await supabase
        .from('onboarding_instances')
        .insert([{ employee_id: employee_id!, template_id: template_id!, company_id: company_id!, buddy_id, manager_id, start_date, target_completion_date, notes, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;

      // Create tasks from template
      const templateTasks = await fetchTemplateTasks(instance.template_id!);
      const startDate = new Date(instance.start_date || new Date());

      const tasks = templateTasks.map(task => ({
        instance_id: data.id,
        template_task_id: task.id,
        name: task.name,
        description: task.description,
        task_type: task.task_type,
        is_required: task.is_required,
        due_date: toDateString(new Date(startDate.getTime() + task.due_days * 24 * 60 * 60 * 1000)),
        assigned_to_type: task.assigned_to_type,
        assigned_to_id: task.assigned_to_type === 'employee' ? instance.employee_id :
                        task.assigned_to_type === 'manager' ? instance.manager_id :
                        task.assigned_to_type === 'buddy' ? instance.buddy_id : null,
        training_course_id: task.training_course_id,
        display_order: task.display_order,
        status: 'pending',
      }));

      // Check if any template tasks are equipment type and add property setup task
      const hasEquipmentTask = templateTasks.some(t => t.task_type === 'equipment');
      if (hasEquipmentTask) {
        // Add a general equipment setup task for HR to provision
        tasks.push({
          instance_id: data.id,
          template_task_id: null,
          name: 'Provision and assign required equipment',
          description: 'Set up and assign all necessary equipment for the new employee',
          task_type: 'equipment',
          is_required: true,
          due_date: toDateString(new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000)), // Day before start
          assigned_to_type: 'hr',
          assigned_to_id: null,
          training_course_id: null,
          display_order: 0,
          status: 'pending',
        });
      }

      if (tasks.length > 0) {
        const { error: tasksError } = await supabase
          .from('onboarding_tasks')
          .insert(tasks);

        if (tasksError) throw tasksError;
      }

      await logAction({
        action: 'CREATE',
        entityType: 'onboarding_instances',
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

  const updateInstance = async (id: string, updates: Partial<OnboardingInstance>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('onboarding_instances')
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
        .from('onboarding_tasks')
        .select(`*`)
        .eq('instance_id', instanceId)
        .order('display_order');

      if (error) throw error;
      return data as unknown as OnboardingTask[];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<OnboardingTask>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updateData: any = { ...updates };
      
      if (updates.status === 'completed' && !updates.completed_at) {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      const { data, error } = await supabase
        .from('onboarding_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Check if all required tasks are completed
      const { data: instance } = await supabase
        .from('onboarding_tasks')
        .select('instance_id')
        .eq('id', id)
        .single();

      if (instance) {
        const { data: allTasks } = await supabase
          .from('onboarding_tasks')
          .select('status, is_required')
          .eq('instance_id', instance.instance_id);

        const allRequiredCompleted = allTasks?.every(
          t => !t.is_required || t.status === 'completed' || t.status === 'skipped'
        );

        if (allRequiredCompleted) {
          await supabase
            .from('onboarding_instances')
            .update({ 
              status: 'completed', 
              actual_completion_date: getTodayString() 
            })
            .eq('id', instance.instance_id);
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

  const getOnboardingProgress = async (instanceId: string) => {
    try {
      const { data: tasks } = await supabase
        .from('onboarding_tasks')
        .select('status, is_required')
        .eq('instance_id', instanceId);

      if (!tasks) return { total: 0, completed: 0, percentage: 0 };

      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed' || t.status === 'skipped').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { total, completed, percentage };
    } catch {
      return { total: 0, completed: 0, percentage: 0 };
    }
  };

  return {
    isLoading,
    error,
    // Templates
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    // Template Tasks
    fetchTemplateTasks,
    createTemplateTask,
    updateTemplateTask,
    deleteTemplateTask,
    // Instances
    fetchInstances,
    createInstance,
    updateInstance,
    // Tasks
    fetchTasks,
    updateTask,
    getOnboardingProgress,
  };
}
