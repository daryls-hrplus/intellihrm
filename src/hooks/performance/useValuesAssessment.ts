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

export function useValuesAssessment() {
  const [values, setValues] = useState<CompanyValue[]>([]);
  const [scores, setScores] = useState<AppraisalValueScore[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCompanyValues = useCallback(async (companyId: string): Promise<CompanyValue[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_values')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;

      const typedValues = (data || []).map(v => ({
        ...v,
        behavioral_indicators: (v.behavioral_indicators as unknown as BehavioralIndicator[]) || []
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

  const fetchValueScores = useCallback(async (participantId: string): Promise<AppraisalValueScore[]> => {
    setLoading(true);
    try {
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

  const saveValueScore = useCallback(async (
    participantId: string,
    input: ValueScoreInput,
    assessedBy: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('appraisal_value_scores')
        .upsert({
          participant_id: participantId,
          value_id: input.value_id,
          rating: input.rating,
          demonstrated_behaviors: input.demonstrated_behaviors,
          evidence: input.evidence,
          comments: input.comments,
          assessed_by: assessedBy,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'participant_id,value_id'
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

  const saveAllValueScores = useCallback(async (
    participantId: string,
    inputs: ValueScoreInput[],
    assessedBy: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const records = inputs.map(input => ({
        participant_id: participantId,
        value_id: input.value_id,
        rating: input.rating,
        demonstrated_behaviors: input.demonstrated_behaviors,
        evidence: input.evidence,
        comments: input.comments,
        assessed_by: assessedBy,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('appraisal_value_scores')
        .upsert(records, {
          onConflict: 'participant_id,value_id'
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

  const getValuesAnalysis = useCallback(async (
    participantId: string
  ): Promise<ValuesAssessmentSummary | null> => {
    try {
      const { data: scores, error: scoresError } = await supabase
        .from('appraisal_value_scores')
        .select(`
          rating,
          value:company_values(is_promotion_factor)
        `)
        .eq('participant_id', participantId);

      if (scoresError) throw scoresError;

      if (!scores || scores.length === 0) {
        return null;
      }

      const ratingsWithValues = scores.filter(s => s.rating !== null);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, s) => sum + (s.rating || 0), 0) / ratingsWithValues.length
        : null;

      const promotionFactors = scores.filter(s => s.value?.is_promotion_factor);
      const promotionFactorsMet = promotionFactors.filter(s => (s.rating || 0) >= 3).length;

      return {
        total_values: scores.length,
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

  const createCompanyValue = useCallback(async (
    companyId: string,
    value: Partial<CompanyValue>
  ): Promise<CompanyValue | null> => {
    try {
      const { data, error } = await supabase
        .from('company_values')
        .insert({
          company_id: companyId,
          name: value.name!,
          code: value.code || null,
          description: value.description || null,
          behavioral_indicators: (value.behavioral_indicators || []) as unknown as any,
          display_order: value.display_order || 0,
          weight: value.weight || 0,
          is_promotion_factor: value.is_promotion_factor || false,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Value Created',
        description: `"${value.name}" has been added`,
      });

      return {
        ...data,
        behavioral_indicators: (data.behavioral_indicators as unknown as BehavioralIndicator[]) || []
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

  const updateCompanyValue = useCallback(async (
    valueId: string,
    updates: Partial<CompanyValue>
  ): Promise<boolean> => {
    try {
      const updatePayload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.code !== undefined) updatePayload.code = updates.code;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.behavioral_indicators !== undefined) updatePayload.behavioral_indicators = updates.behavioral_indicators;
      if (updates.display_order !== undefined) updatePayload.display_order = updates.display_order;
      if (updates.weight !== undefined) updatePayload.weight = updates.weight;
      if (updates.is_promotion_factor !== undefined) updatePayload.is_promotion_factor = updates.is_promotion_factor;
      if (updates.is_active !== undefined) updatePayload.is_active = updates.is_active;

      const { error } = await supabase
        .from('company_values')
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

  const deleteCompanyValue = useCallback(async (valueId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('company_values')
        .update({ is_active: false })
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
