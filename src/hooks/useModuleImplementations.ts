import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  ModuleImplementation, 
  CreateModuleImplementationInput, 
  UpdateModuleImplementationInput,
  ImplementationStatus
} from '@/types/implementation';

export function useModuleImplementations(companyId?: string) {
  const [implementations, setImplementations] = useState<ModuleImplementation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const effectiveCompanyId = companyId || profile?.company_id;

  const fetchImplementations = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('module_implementations')
        .select(`
          *,
          module:application_modules(
            module_code,
            module_name,
            description,
            icon_name,
            route_path
          )
        `)
        .order('implementation_order', { ascending: true });

      if (effectiveCompanyId) {
        query = query.eq('company_id', effectiveCompanyId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setImplementations((data || []) as unknown as ModuleImplementation[]);
    } catch (err) {
      console.error('Error fetching module implementations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch implementations');
    } finally {
      setIsLoading(false);
    }
  }, [user, effectiveCompanyId]);

  const createImplementation = useCallback(async (input: CreateModuleImplementationInput) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('module_implementations')
      .insert({
        module_id: input.module_id,
        company_id: input.company_id || effectiveCompanyId,
        implementation_order: input.implementation_order || 1,
        target_go_live: input.target_go_live,
        notes: input.notes,
        created_by: user.id,
        status: 'not_started' as ImplementationStatus
      })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchImplementations();
    return data;
  }, [user, effectiveCompanyId, fetchImplementations]);

  const updateImplementation = useCallback(async (
    id: string, 
    updates: UpdateModuleImplementationInput
  ) => {
    const updateData: Record<string, unknown> = {};
    
    if (updates.status) {
      updateData.status = updates.status;
      if (updates.status === 'in_progress' && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
    }
    if (updates.implementation_order !== undefined) {
      updateData.implementation_order = updates.implementation_order;
    }
    if (updates.target_go_live !== undefined) {
      updateData.target_go_live = updates.target_go_live;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    const { error: updateError } = await supabase
      .from('module_implementations')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;
    await fetchImplementations();
  }, [fetchImplementations]);

  const deleteImplementation = useCallback(async (id: string) => {
    const { error: deleteError } = await supabase
      .from('module_implementations')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    await fetchImplementations();
  }, [fetchImplementations]);

  const startImplementation = useCallback(async (id: string) => {
    await updateImplementation(id, { status: 'in_progress' });
  }, [updateImplementation]);

  const completeImplementation = useCallback(async (id: string) => {
    await updateImplementation(id, { status: 'completed' });
  }, [updateImplementation]);

  const holdImplementation = useCallback(async (id: string) => {
    await updateImplementation(id, { status: 'on_hold' });
  }, [updateImplementation]);

  useEffect(() => {
    fetchImplementations();
  }, [fetchImplementations]);

  return {
    implementations,
    isLoading,
    error,
    refetch: fetchImplementations,
    createImplementation,
    updateImplementation,
    deleteImplementation,
    startImplementation,
    completeImplementation,
    holdImplementation
  };
}
