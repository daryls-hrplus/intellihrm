import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { GoalRatingConfiguration, AutoCalcRules, CalculationMethod, RatingVisibility } from '@/types/goalRatings';

interface UseGoalRatingConfigurationOptions {
  companyId: string;
  cycleId?: string | null;
}

export function useGoalRatingConfiguration({ companyId, cycleId }: UseGoalRatingConfigurationOptions) {
  const [configuration, setConfiguration] = useState<GoalRatingConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfiguration = useCallback(async () => {
    if (!companyId) {
      setConfiguration(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('goal_rating_configurations')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (cycleId) {
        query = query.eq('cycle_id', cycleId);
      } else {
        query = query.is('cycle_id', null);
      }

      const { data, error: fetchError } = await query.maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setConfiguration({
          ...data,
          calculation_method: data.calculation_method as CalculationMethod,
          hide_ratings_until: data.hide_ratings_until as RatingVisibility,
          auto_calc_rules: (data.auto_calc_rules as AutoCalcRules) || {},
        });
      } else {
        setConfiguration(null);
      }
    } catch (err: any) {
      console.error('Error fetching rating configuration:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, cycleId]);

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  const createConfiguration = async (config: Partial<GoalRatingConfiguration>) => {
    try {
      const { data, error } = await supabase
        .from('goal_rating_configurations')
        .insert([{
          company_id: companyId,
          cycle_id: cycleId || null,
          calculation_method: config.calculation_method || 'manager_entered',
          self_rating_weight: config.self_rating_weight || 0,
          manager_rating_weight: config.manager_rating_weight || 100,
          progress_weight: config.progress_weight || 0,
          hide_ratings_until: config.hide_ratings_until || 'review_released',
          show_manager_rating_to_employee: config.show_manager_rating_to_employee ?? true,
          show_final_score_to_employee: config.show_final_score_to_employee ?? true,
          requires_employee_acknowledgment: config.requires_employee_acknowledgment ?? true,
          acknowledgment_deadline_days: config.acknowledgment_deadline_days || 7,
          allow_dispute: config.allow_dispute ?? true,
          dispute_window_days: config.dispute_window_days || 14,
          auto_calc_rules: JSON.parse(JSON.stringify(config.auto_calc_rules || {})),
          rating_scale_id: config.rating_scale_id || null,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      
      setConfiguration({
        ...data,
        calculation_method: data.calculation_method as CalculationMethod,
        hide_ratings_until: data.hide_ratings_until as RatingVisibility,
        auto_calc_rules: (data.auto_calc_rules as AutoCalcRules) || {},
      });
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating rating configuration:', err);
      return { data: null, error: err.message };
    }
  };

  const updateConfiguration = async (id: string, updates: Partial<GoalRatingConfiguration>) => {
    try {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      
      if (updates.calculation_method !== undefined) updateData.calculation_method = updates.calculation_method;
      if (updates.self_rating_weight !== undefined) updateData.self_rating_weight = updates.self_rating_weight;
      if (updates.manager_rating_weight !== undefined) updateData.manager_rating_weight = updates.manager_rating_weight;
      if (updates.progress_weight !== undefined) updateData.progress_weight = updates.progress_weight;
      if (updates.hide_ratings_until !== undefined) updateData.hide_ratings_until = updates.hide_ratings_until;
      if (updates.show_manager_rating_to_employee !== undefined) updateData.show_manager_rating_to_employee = updates.show_manager_rating_to_employee;
      if (updates.show_final_score_to_employee !== undefined) updateData.show_final_score_to_employee = updates.show_final_score_to_employee;
      if (updates.requires_employee_acknowledgment !== undefined) updateData.requires_employee_acknowledgment = updates.requires_employee_acknowledgment;
      if (updates.acknowledgment_deadline_days !== undefined) updateData.acknowledgment_deadline_days = updates.acknowledgment_deadline_days;
      if (updates.allow_dispute !== undefined) updateData.allow_dispute = updates.allow_dispute;
      if (updates.dispute_window_days !== undefined) updateData.dispute_window_days = updates.dispute_window_days;
      if (updates.auto_calc_rules !== undefined) updateData.auto_calc_rules = updates.auto_calc_rules;
      if (updates.rating_scale_id !== undefined) updateData.rating_scale_id = updates.rating_scale_id;

      const { data, error } = await supabase
        .from('goal_rating_configurations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setConfiguration({
        ...data,
        calculation_method: data.calculation_method as CalculationMethod,
        hide_ratings_until: data.hide_ratings_until as RatingVisibility,
        auto_calc_rules: (data.auto_calc_rules as AutoCalcRules) || {},
      });
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating rating configuration:', err);
      return { data: null, error: err.message };
    }
  };

  const getDefaultConfiguration = (): GoalRatingConfiguration => ({
    id: '',
    company_id: companyId,
    cycle_id: cycleId || null,
    rating_scale_id: null,
    calculation_method: 'manager_entered',
    self_rating_weight: 30,
    manager_rating_weight: 70,
    progress_weight: 0,
    hide_ratings_until: 'review_released',
    show_manager_rating_to_employee: true,
    show_final_score_to_employee: true,
    requires_employee_acknowledgment: true,
    acknowledgment_deadline_days: 7,
    allow_dispute: true,
    dispute_window_days: 14,
    auto_calc_rules: {},
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
  });

  return {
    configuration: configuration || getDefaultConfiguration(),
    isLoading,
    error,
    refetch: fetchConfiguration,
    createConfiguration,
    updateConfiguration,
    hasConfiguration: !!configuration,
  };
}
