import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsibilityKRA } from '@/types/responsibilityKRA';

interface UseResponsibilityKRAsOptions {
  responsibilityId?: string;
  companyId?: string;
}

export function useResponsibilityKRAs({ responsibilityId, companyId }: UseResponsibilityKRAsOptions = {}) {
  const [kras, setKras] = useState<ResponsibilityKRA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKRAs = useCallback(async (respId?: string) => {
    const targetId = respId || responsibilityId;
    if (!targetId) return [];

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('responsibility_kras')
        .select('*')
        .eq('responsibility_id', targetId)
        .eq('is_active', true)
        .order('sequence_order', { ascending: true });

      if (fetchError) throw fetchError;

      const mapped = (data || []) as ResponsibilityKRA[];
      setKras(mapped);
      return mapped;
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [responsibilityId]);

  const createKRA = async (data: Partial<ResponsibilityKRA>) => {
    try {
      const { data: result, error: createError } = await supabase
        .from('responsibility_kras')
        .insert({
          responsibility_id: data.responsibility_id,
          company_id: data.company_id || companyId,
          name: data.name,
          description: data.description || null,
          target_metric: data.target_metric || null,
          measurement_method: data.measurement_method || null,
          weight: data.weight || 0,
          sequence_order: data.sequence_order || 0,
          is_required: data.is_required ?? true,
          is_active: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      return { data: result as ResponsibilityKRA, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateKRA = async (id: string, updates: Partial<ResponsibilityKRA>) => {
    try {
      const { data: result, error: updateError } = await supabase
        .from('responsibility_kras')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return { data: result as ResponsibilityKRA, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteKRA = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('responsibility_kras')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const reorderKRAs = async (orderedIds: string[]) => {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        sequence_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('responsibility_kras')
          .update({ sequence_order: update.sequence_order })
          .eq('id', update.id);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const validateWeights = (kraList: ResponsibilityKRA[]): { isValid: boolean; total: number; message: string } => {
    const total = kraList.reduce((sum, kra) => sum + (kra.weight || 0), 0);
    
    if (kraList.length === 0) {
      return { isValid: true, total: 0, message: 'No KRAs defined' };
    }
    
    if (total !== 100) {
      return { 
        isValid: false, 
        total, 
        message: `Weights must total 100% (currently ${total}%)` 
      };
    }
    
    return { isValid: true, total, message: 'Weights are valid' };
  };

  const distributeWeightsEvenly = (kraList: ResponsibilityKRA[]): ResponsibilityKRA[] => {
    if (kraList.length === 0) return [];
    
    const baseWeight = Math.floor(100 / kraList.length);
    const remainder = 100 - (baseWeight * kraList.length);
    
    return kraList.map((kra, index) => ({
      ...kra,
      weight: baseWeight + (index < remainder ? 1 : 0),
    }));
  };

  return {
    kras,
    isLoading,
    error,
    fetchKRAs,
    createKRA,
    updateKRA,
    deleteKRA,
    reorderKRAs,
    validateWeights,
    distributeWeightsEvenly,
  };
}
