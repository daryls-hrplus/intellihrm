import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { 
  FeatureImplementation, 
  CreateFeatureImplementationInput,
  FeatureImplementationStats
} from '@/types/implementation';

export function useFeatureImplementations(moduleImplId?: string) {
  const [features, setFeatures] = useState<FeatureImplementation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchFeatures = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('feature_implementations')
        .select(`
          *,
          feature:application_features(
            feature_code,
            feature_name,
            description,
            route_path
          ),
          tour:enablement_tours(
            tour_code,
            tour_name
          ),
          tour_completed_by_profile:profiles!feature_implementations_tour_completed_by_fkey(
            full_name,
            email
          ),
          impl_completed_by_profile:profiles!feature_implementations_impl_completed_by_fkey(
            full_name,
            email
          )
        `)
        .order('implementation_order', { ascending: true });

      if (moduleImplId) {
        query = query.eq('module_impl_id', moduleImplId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setFeatures((data || []) as unknown as FeatureImplementation[]);
    } catch (err) {
      console.error('Error fetching feature implementations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch features');
    } finally {
      setIsLoading(false);
    }
  }, [user, moduleImplId]);

  const createFeature = useCallback(async (input: CreateFeatureImplementationInput) => {
    if (!user) throw new Error('Not authenticated');

    const { data, error: insertError } = await supabase
      .from('feature_implementations')
      .insert({
        module_impl_id: input.module_impl_id,
        feature_id: input.feature_id,
        tour_id: input.tour_id,
        company_id: input.company_id,
        implementation_order: input.implementation_order || 1
      })
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchFeatures();
    return data;
  }, [user, fetchFeatures]);

  // Toggle implementation complete status (client manually marks)
  const toggleImplComplete = useCallback(async (
    featureImplId: string, 
    isComplete: boolean,
    notes?: string
  ) => {
    if (!user) throw new Error('Not authenticated');

    const updateData: Record<string, unknown> = {
      impl_complete: isComplete
    };

    if (isComplete) {
      updateData.impl_completed_at = new Date().toISOString();
      updateData.impl_completed_by = user.id;
      updateData.impl_uncompleted_at = null;
      updateData.impl_uncompleted_by = null;
    } else {
      // User is unflagging the implementation
      updateData.impl_uncompleted_at = new Date().toISOString();
      updateData.impl_uncompleted_by = user.id;
      // Keep impl_completed_at/by for audit trail
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { error: updateError } = await supabase
      .from('feature_implementations')
      .update(updateData)
      .eq('id', featureImplId);

    if (updateError) throw updateError;
    await fetchFeatures();
  }, [user, fetchFeatures]);

  // Mark implementation as complete
  const markImplComplete = useCallback(async (featureImplId: string, notes?: string) => {
    await toggleImplComplete(featureImplId, true, notes);
  }, [toggleImplComplete]);

  // Unflag implementation (client made a mistake)
  const unflagImplComplete = useCallback(async (featureImplId: string, notes?: string) => {
    await toggleImplComplete(featureImplId, false, notes);
  }, [toggleImplComplete]);

  // Calculate stats for a set of features
  const getStats = useCallback((featureList: FeatureImplementation[]): FeatureImplementationStats => {
    const total = featureList.length;
    const toursWatched = featureList.filter(f => f.tour_watched).length;
    const implCompleted = featureList.filter(f => f.impl_complete).length;

    return {
      total_tasks: total,
      tasks_completed: implCompleted,
      required_tasks: total, // All features are required by default
      required_tasks_completed: implCompleted,
      percent_complete: total > 0 ? Math.round((implCompleted / total) * 100) : 0,
      all_required_complete: implCompleted === total
    };
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  return {
    features,
    isLoading,
    error,
    refetch: fetchFeatures,
    createFeature,
    toggleImplComplete,
    markImplComplete,
    unflagImplComplete,
    getStats
  };
}
