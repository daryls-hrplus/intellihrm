import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { 
  ReminderEventType, 
  ReminderRule, 
  EmployeeReminder, 
  ReminderPreference 
} from '@/types/reminders';

export function useReminders() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch event types
  const fetchEventTypes = useCallback(async () => {
    const { data, error } = await supabase
      .from('reminder_event_types')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (error) throw error;
    return data as ReminderEventType[];
  }, []);

  // Fetch reminder rules
  const fetchRules = useCallback(async (companyId?: string) => {
    let query = supabase
      .from('reminder_rules')
      .select(`
        *,
        event_type:reminder_event_types(*)
      `)
      .order('created_at', { ascending: false });

    if (companyId && companyId !== 'all') {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ReminderRule[];
  }, []);

  // Create reminder rule
  const createRule = useCallback(async (rule: Partial<ReminderRule>) => {
    setIsLoading(true);
    try {
      const insertData = {
        company_id: rule.company_id!,
        event_type_id: rule.event_type_id!,
        name: rule.name!,
        description: rule.description,
        days_before: rule.days_before,
        send_to_employee: rule.send_to_employee,
        send_to_manager: rule.send_to_manager,
        send_to_hr: rule.send_to_hr,
        notification_method: rule.notification_method,
        message_template: rule.message_template,
        priority: rule.priority,
        is_active: rule.is_active,
        created_by: user?.id,
      };
      const { data, error } = await supabase
        .from('reminder_rules')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      toast.success('Reminder rule created');
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update reminder rule
  const updateRule = useCallback(async (id: string, updates: Partial<ReminderRule>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reminder_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Reminder rule updated');
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete reminder rule
  const deleteRule = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reminder_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Reminder rule deleted');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch employee reminders
  const fetchReminders = useCallback(async (filters?: {
    companyId?: string;
    employeeId?: string;
    status?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    let query = supabase
      .from('employee_reminders')
      .select(`
        *,
        event_type:reminder_event_types(*),
        employee:profiles!employee_reminders_employee_id_fkey(id, full_name, email),
        creator:profiles!employee_reminders_created_by_fkey(id, full_name)
      `)
      .order('reminder_date', { ascending: true });

    if (filters?.companyId && filters.companyId !== 'all') {
      query = query.eq('company_id', filters.companyId);
    }
    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.dateFrom) {
      query = query.gte('reminder_date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('reminder_date', filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filter by category if needed
    let results = data as EmployeeReminder[];
    if (filters?.category && filters.category !== 'all') {
      results = results.filter(r => r.event_type?.category === filters.category);
    }

    return results;
  }, []);

  // Fetch my reminders (for ESS)
  const fetchMyReminders = useCallback(async (status?: string) => {
    if (!user?.id) return [];

    let query = supabase
      .from('employee_reminders')
      .select(`
        *,
        event_type:reminder_event_types(*)
      `)
      .eq('employee_id', user.id)
      .order('reminder_date', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as EmployeeReminder[];
  }, [user?.id]);

  // Create manual reminder
  const createReminder = useCallback(async (
    reminder: Partial<EmployeeReminder>,
    creatorRole: 'admin' | 'hr' | 'manager' | 'employee'
  ) => {
    setIsLoading(true);
    try {
      const insertData = {
        company_id: reminder.company_id!,
        employee_id: reminder.employee_id!,
        title: reminder.title!,
        event_date: reminder.event_date!,
        reminder_date: reminder.reminder_date!,
        message: reminder.message,
        event_type_id: reminder.event_type_id,
        priority: reminder.priority,
        notification_method: reminder.notification_method,
        is_recurring: reminder.is_recurring,
        recurrence_pattern: reminder.recurrence_pattern,
        can_employee_dismiss: reminder.can_employee_dismiss,
        notes: reminder.notes,
        created_by: user?.id,
        created_by_role: creatorRole,
      };
      const { data, error } = await supabase
        .from('employee_reminders')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      toast.success('Reminder created');
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update reminder
  const updateReminder = useCallback(async (id: string, updates: Partial<EmployeeReminder>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_reminders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Reminder updated');
      return data;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Dismiss reminder
  const dismissReminder = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('employee_reminders')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Reminder dismissed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel reminder
  const cancelReminder = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('employee_reminders')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Reminder cancelled');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch reminder preferences
  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return [];

    const { data, error } = await supabase
      .from('employee_reminder_preferences')
      .select(`
        *,
        event_type:reminder_event_types(*)
      `)
      .eq('employee_id', user.id);

    if (error) throw error;
    return data as ReminderPreference[];
  }, [user?.id]);

  // Update preference
  const updatePreference = useCallback(async (
    eventTypeId: string,
    updates: Partial<ReminderPreference>
  ) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data: existing } = await supabase
        .from('employee_reminder_preferences')
        .select('id')
        .eq('employee_id', user.id)
        .eq('event_type_id', eventTypeId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('employee_reminder_preferences')
          .update(updates)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('employee_reminder_preferences')
          .insert({
            employee_id: user.id,
            event_type_id: eventTypeId,
            ...updates,
          });
      }

      toast.success('Preferences updated');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    isLoading,
    fetchEventTypes,
    fetchRules,
    createRule,
    updateRule,
    deleteRule,
    fetchReminders,
    fetchMyReminders,
    createReminder,
    updateReminder,
    dismissReminder,
    cancelReminder,
    fetchPreferences,
    updatePreference,
  };
}
