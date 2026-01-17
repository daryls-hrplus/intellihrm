import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CompanyValue, 
  AppraisalValueScore, 
  ValueScoreInput,
  ValuesAssessmentSummary,
  BehavioralIndicator 
} from '@/types/valuesAssessment';

/**
 * Unified Values Assessment Hook
 * 
 * This hook now queries from skills_competencies table where type = 'VALUE',
 * following the Unified Capability Framework pattern.
 */
export function useValuesAssessment() {
  const [values, setValues] = useState<CompanyValue[]>([]);
  const [scores, setScores] = useState<AppraisalValueScore[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch company values from the unified skills_competencies table
   */
  const fetchCompanyValues = useCallback(async (companyId: string): Promise<CompanyValue[]> => {
    setLoading(true);
    try {
      // Query from skills_competencies where type = 'VALUE'
      const { data, error } = await supabase
        .from('skills_competencies')
        .select('*')
        .eq('company_id', companyId)
        .eq('type', 'VALUE')
        .eq('status', 'active')
        .order('display_order');

      if (error) throw error;

      // Map skills_competencies fields to CompanyValue interface
      const typedValues = (data || []).map(v => ({
        id: v.id,
        company_id: v.company_id,
        name: v.name,
        code: v.code,
        description: v.description,
        behavioral_indicators: (v.proficiency_indicators as unknown as BehavioralIndicator[]) || [],
        display_order: v.display_order ?? 0,
        is_active: v.status === 'active',
        weight: v.weight ?? 0,
        is_promotion_factor: v.is_promotion_factor ?? false,
        created_at: v.created_at,
        updated_at: v.updated_at
      })) as CompanyValue[];

      setValues(typedValues);
      return typedValues;
    } catch (error) {
      console.error('Error fetching company values:', error);
      toast({
        title: 'Error',
        description: 'Failed to load company values',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Fetch value scores - now uses appraisal_capability_scores unified table
   */
  const fetchValueScores = useCallback(async (participantId: string): Promise<AppraisalValueScore[]> => {
    setLoading(true);
    try {
      // First try unified table
      const { data: unifiedData, error: unifiedError } = await supabase
        .from('appraisal_capability_scores')
        .select(`
          *,
          capability:skills_competencies(*)
        `)
        .eq('participant_id', participantId);

      if (!unifiedError && unifiedData && unifiedData.length > 0) {
        // Filter to only VALUE type capabilities
        const valueScores = unifiedData.filter((score: any) => score.capability?.type === 'VALUE');
        
        const typedScores = valueScores.map((score: any) => ({
          id: score.id,
          participant_id: score.participant_id,
          value_id: score.capability_id,
          rating: score.rating,
          demonstrated_behaviors: score.demonstrated_behaviors || null,
          evidence: score.evidence,
          comments: score.comments,
          assessed_by: score.assessed_by,
          created_at: score.created_at,
          updated_at: score.updated_at,
          value: score.capability ? {
            id: score.capability.id,
            company_id: score.capability.company_id,
            name: score.capability.name,
            code: score.capability.code,
            description: score.capability.description,
            behavioral_indicators: (score.capability.proficiency_indicators as unknown as BehavioralIndicator[]) || [],
            display_order: score.capability.display_order ?? 0,
            is_active: score.capability.status === 'active',
            weight: score.capability.weight ?? 0,
            is_promotion_factor: score.capability.is_promotion_factor ?? false,
            created_at: score.capability.created_at,
            updated_at: score.capability.updated_at
          } : undefined
        })) as AppraisalValueScore[];

        setScores(typedScores);
        return typedScores;
      }

      // Fallback to legacy table for backward compatibility
      const { data, error } = await supabase
        .from('appraisal_value_scores')
        .select(`
          *,
          value:company_values(*)
        `)
        .eq('participant_id', participantId);

      if (error) throw error;

      const typedScores = (data || []).map(score => ({
        ...score,
        value: score.value ? {
          ...score.value,
          behavioral_indicators: (score.value.behavioral_indicators as unknown as BehavioralIndicator[]) || []
        } : undefined
      })) as AppraisalValueScore[];

      setScores(typedScores);
      return typedScores;
    } catch (error) {
      console.error('Error fetching value scores:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save value score - now uses appraisal_capability_scores unified table
   */
  const saveValueScore = useCallback(async (
    participantId: string,
    input: ValueScoreInput,
    assessedBy: string
  ): Promise<boolean> => {
    try {
      // Use unified table
      const { error } = await supabase
        .from('appraisal_capability_scores')
        .upsert({
          participant_id: participantId,
          capability_id: input.value_id,
          capability_type: 'VALUE' as const,
          rating: input.rating,
          demonstrated_behaviors: input.demonstrated_behaviors,
          evidence: input.evidence,
          comments: input.comments,
          assessed_by: assessedBy,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'participant_id,capability_id'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving value score:', error);
      toast({
        title: 'Error',
        description: 'Failed to save value assessment',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  /**
   * Save all value scores at once
   */
  const saveAllValueScores = useCallback(async (
    participantId: string,
    inputs: ValueScoreInput[],
    assessedBy: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const records = inputs.map(input => ({
        participant_id: participantId,
        capability_id: input.value_id,
        capability_type: 'VALUE' as const,
        rating: input.rating,
        demonstrated_behaviors: input.demonstrated_behaviors,
        evidence: input.evidence,
        comments: input.comments,
        assessed_by: assessedBy,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('appraisal_capability_scores')
        .upsert(records, {
          onConflict: 'participant_id,capability_id'
        });

      if (error) throw error;

      toast({
        title: 'Saved',
        description: 'Values assessment saved successfully',
      });

      return true;
    } catch (error) {
      console.error('Error saving value scores:', error);
      toast({
        title: 'Error',
        description: 'Failed to save values assessment',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Get values analysis summary for a participant
   */
  const getValuesAnalysis = useCallback(async (
    participantId: string
  ): Promise<ValuesAssessmentSummary | null> => {
    try {
      // Query unified table
      const { data: scores, error: scoresError } = await supabase
        .from('appraisal_capability_scores')
        .select(`
          rating,
          capability:skills_competencies(is_promotion_factor, type)
        `)
        .eq('participant_id', participantId);

      if (scoresError) throw scoresError;

      if (!scores || scores.length === 0) {
        return null;
      }

      // Filter to only VALUE type
      const valueScores = scores.filter((s: any) => s.capability?.type === 'VALUE');
      
      if (valueScores.length === 0) return null;

      const ratingsWithValues = valueScores.filter((s: any) => s.rating !== null);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum: number, s: any) => sum + (s.rating || 0), 0) / ratingsWithValues.length
        : null;

      const promotionFactors = valueScores.filter((s: any) => s.capability?.is_promotion_factor);
      const promotionFactorsMet = promotionFactors.filter((s: any) => (s.rating || 0) >= 3).length;

      return {
        total_values: valueScores.length,
        assessed_values: ratingsWithValues.length,
        average_rating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        promotion_factors_met: promotionFactorsMet,
        promotion_factors_total: promotionFactors.length
      };
    } catch (error) {
      console.error('Error getting values analysis:', error);
      return null;
    }
  }, []);

  /**
   * Create a company value - now creates in skills_competencies with type = 'VALUE'
   */
  const createCompanyValue = useCallback(async (
    companyId: string,
    value: Partial<CompanyValue>
  ): Promise<CompanyValue | null> => {
    try {
      const code = value.code || `VAL_${value.name?.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20)}`;
      
      const { data, error } = await supabase
        .from('skills_competencies')
        .insert({
          company_id: companyId,
          type: 'VALUE',
          name: value.name!,
          code: code,
          description: value.description || null,
          proficiency_indicators: (value.behavioral_indicators || []) as unknown as any,
          display_order: value.display_order || 0,
          weight: value.weight || 0,
          is_promotion_factor: value.is_promotion_factor || false,
          status: 'active',
          category: 'core',
          effective_from: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Value Created',
        description: `"${value.name}" has been added`,
      });

      return {
        id: data.id,
        company_id: data.company_id,
        name: data.name,
        code: data.code,
        description: data.description,
        behavioral_indicators: (data.proficiency_indicators as unknown as BehavioralIndicator[]) || [],
        display_order: data.display_order ?? 0,
        is_active: data.status === 'active',
        weight: data.weight ?? 0,
        is_promotion_factor: data.is_promotion_factor ?? false,
        created_at: data.created_at,
        updated_at: data.updated_at
      } as CompanyValue;
    } catch (error) {
      console.error('Error creating company value:', error);
      toast({
        title: 'Error',
        description: 'Failed to create company value',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  /**
   * Update a company value
   */
  const updateCompanyValue = useCallback(async (
    valueId: string,
    updates: Partial<CompanyValue>
  ): Promise<boolean> => {
    try {
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.code !== undefined) updatePayload.code = updates.code;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.behavioral_indicators !== undefined) updatePayload.proficiency_indicators = updates.behavioral_indicators;
      if (updates.display_order !== undefined) updatePayload.display_order = updates.display_order;
      if (updates.weight !== undefined) updatePayload.weight = updates.weight;
      if (updates.is_promotion_factor !== undefined) updatePayload.is_promotion_factor = updates.is_promotion_factor;
      if (updates.is_active !== undefined) updatePayload.status = updates.is_active ? 'active' : 'deprecated';

      const { error } = await supabase
        .from('skills_competencies')
        .update(updatePayload)
        .eq('id', valueId);

      if (error) throw error;

      toast({
        title: 'Value Updated',
        description: 'Company value has been updated',
      });

      return true;
    } catch (error) {
      console.error('Error updating company value:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company value',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  /**
   * Delete (soft-delete) a company value
   */
  const deleteCompanyValue = useCallback(async (valueId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('skills_competencies')
        .update({ status: 'deprecated' })
        .eq('id', valueId);

      if (error) throw error;

      toast({
        title: 'Value Removed',
        description: 'Company value has been deactivated',
      });

      return true;
    } catch (error) {
      console.error('Error deleting company value:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove company value',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  return {
    values,
    scores,
    loading,
    fetchCompanyValues,
    fetchValueScores,
    saveValueScore,
    saveAllValueScores,
    getValuesAnalysis,
    createCompanyValue,
    updateCompanyValue,
    deleteCompanyValue,
  };
}
